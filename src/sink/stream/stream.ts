import { createGrpcTransport } from "@connectrpc/connect-node";
import {
  authIssue,
  createAuthInterceptor,
  createRegistry,
} from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { createSink, createStream } from "@substreams/sink";
import { Data, Effect, Layer, Option, Stream } from "effect";
import { invariant } from "src/utils/invariant.js";
import {
  ZodEntryStreamResponse,
  ZodRoleChangeStreamResponse,
} from "src/zod.js";
import * as CursorStorage from "./cursor.js";
import * as MessageStorage from "./messages.js";

export class InvalidPackageError extends Data.TaggedClass(
  "InvalidPackageError"
)<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export function runStream({
  packagePath,
  outputModule,
}: {
  packagePath: string;
  outputModule: string;
}) {
  const program = Effect.gen(function* (_) {
    const db = yield* _(MessageStorage.MessageStorage);
    const cursor = yield* _(CursorStorage.CursorStorage);

    const substreamsEndpoint = process.env.SUBSTREAMS_ENDPOINT;
    invariant(substreamsEndpoint, "SUBSTREAMS_ENDPOINT is required");
    const substreamsApiKey = process.env.SUBSTREAMS_API_KEY;
    invariant(substreamsApiKey, "SUBSTREAMS_API_KEY is required");
    const authIssueUrl = process.env.AUTH_ISSUE_URL;
    invariant(authIssueUrl, "AUTH_ISSUE_URL is required");

    const manifest = "./geo-substream.spkg";
    const substreamPackage = readPackageFromFile(manifest);

    const { token } = yield* _(
      Effect.tryPromise({
        try: () => authIssue(substreamsApiKey, authIssueUrl),
        catch: (cause) =>
          new Error(`Could not read package at path ${packagePath}`),
      })
    );

    // const token = yield* _(Effect.config(Config.string("SUBSTREAMS_API_TOKEN")));
    const transport = createGrpcTransport({
      baseUrl: substreamsEndpoint,
      httpVersion: "2",
      interceptors: [createAuthInterceptor(token)],
    });

    const registry = createRegistry(substreamPackage);
    const stream = createStream({
      connectTransport: transport,
      substreamPackage: substreamPackage,
      outputModule,
      startCursor: yield* _(Effect.map(cursor.read(), Option.getOrUndefined)),
    });

    const sink = createSink({
      handleBlockScopedData: (message) =>
        Effect.annotateLogs({
          block: message.clock?.number.toString() ?? "???",
          time: message.clock?.timestamp?.toDate().toLocaleString() ?? "???",
          size: `${message.output?.mapOutput?.value?.byteLength ?? 0} bytes`,
        })(
          Effect.gen(function* (_) {
            // yield* _(cursor.write(Option.some(message.cursor)));

            const mapOutput = message.output?.mapOutput;

            if (!mapOutput) return;

            if (mapOutput.value?.byteLength === 0) {
              yield* _(Effect.logDebug("received empty message"));
            } else {
              const unpackedOutput = mapOutput.unpack(registry);

              const entryResponse =
                ZodEntryStreamResponse.safeParse(unpackedOutput);
              const roleChangeResponse =
                ZodRoleChangeStreamResponse.safeParse(unpackedOutput);

              // const blockNumber = Number(clock.number.toString());

              if (entryResponse.success) {
                console.log(
                  "Processing ",
                  entryResponse.data.entries.length,
                  " entries"
                );
                // populateEntries(entryResponse.data.entries, blockNumber);
              } else if (roleChangeResponse.success) {
                console.log("TODO: Handle roleGrantedResponse");
              } else {
                console.error("error", message);
              }

              return message;
              // yield* _(
              //   Effect.logInfo(
              //     `received message of type ${message.output?.mapOutput?.typeUrl}`
              //   )
              // );
              // yield* _(
              //   db.append(message.toJsonString({ typeRegistry: registry }))
              // );
            }
          })
        ),
      handleBlockUndoSignal: (message) =>
        Effect.gen(function* (_) {
          yield* _(cursor.write(Option.some(message.lastValidCursor)));
        }),
    });

    return yield* _(Stream.run(stream, sink));
  });

  return program;
}

export const layer = Layer.merge(CursorStorage.layer, MessageStorage.layer);
