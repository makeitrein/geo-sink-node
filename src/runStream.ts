import { createGrpcTransport } from "@connectrpc/connect-node";
import { authIssue, createAuthInterceptor } from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { createSink, createStream } from "@substreams/sink";
import { Data, Effect, Stream } from "effect";
import { readCursor } from "./cursor";
import { invariant } from "./utils/invariant";
import { logger } from "./utils/logger";
// import * as MessageStorage from "./messages.js";

export class InvalidPackageError extends Data.TaggedClass(
  "InvalidPackageError"
)<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export function runStream() {
  const program = Effect.gen(function* (_) {
    const substreamsEndpoint = process.env.SUBSTREAMS_ENDPOINT;
    invariant(substreamsEndpoint, "SUBSTREAMS_ENDPOINT is required");
    const substreamsApiKey = process.env.SUBSTREAMS_API_KEY;
    invariant(substreamsApiKey, "SUBSTREAMS_API_KEY is required");
    const authIssueUrl = process.env.AUTH_ISSUE_URL;
    invariant(authIssueUrl, "AUTH_ISSUE_URL is required");

    logger.enable("pretty");
    logger.info("Logging enabled");

    const manifest = "./geo-substream.spkg";
    const substreamPackage = readPackageFromFile(manifest);

    logger.info("Substream package downloaded");

    const { token } = yield* _(
      Effect.tryPromise({
        try: () => authIssue(substreamsApiKey, authIssueUrl),
        catch: () => new Error(`Could not read package at path ${manifest}`),
      })
    );

    const outputModule = "geo_out";
    const startBlockNum = 36472424;
    const productionMode = true;
    // const finalBlocksOnly = true; TODO - why doesn't createStream accept this option?

    const startCursor = yield* _(
      Effect.tryPromise({
        try: () => readCursor(),
        catch: () => new Error(`Could not read cursor`),
      })
    );

    // const registry = createRegistry(substreamPackage);

    const transport = createGrpcTransport({
      baseUrl: substreamsEndpoint,
      httpVersion: "2",
      interceptors: [createAuthInterceptor(token)],
    });

    const stream = createStream({
      connectTransport: transport,
      substreamPackage,
      outputModule,
      startCursor,
      startBlockNum,
      productionMode,
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

            if (message.output?.mapOutput?.value?.byteLength === 0) {
              yield* _(Effect.logDebug("received empty message"));
            } else {
              yield* _(
                Effect.logInfo(
                  `received message of type ${message.output?.mapOutput?.typeUrl}`
                )
              );
              //   yield* _(db.append(message.toJsonString({ typeRegistry: registry })));
            }
          })
        ),
      handleBlockUndoSignal: (message) =>
        Effect.gen(function* (_) {
          //   yield* _(cursor.write(Option.some(message.lastValidCursor)));
        }),
    });

    return yield* _(Stream.run(stream, sink));
  });

  return program;
}

// export const layer = Layer.merge(CursorStorage.layer, MessageStorage.layer);
