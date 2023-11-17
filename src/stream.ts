import { authIssue, createRegistry, createRequest } from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import dotenv from "dotenv";
import { populateEntries } from "./populate.js";
import { invariant } from "./utils/invariant.js";
import { logger } from "./utils/logger.js";
import { ZodEntryStreamResponse, ZodRoleChangeStreamResponse } from "./zod.js";

dotenv.config();

export const startGeoStream = async () => {
  const substreamsEndpoint = process.env.SUBSTREAMS_ENDPOINT;
  invariant(substreamsEndpoint, "SUBSTREAMS_ENDPOINT is required");
  const substreamsApiKey = process.env.SUBSTREAMS_API_KEY;
  invariant(substreamsApiKey, "SUBSTREAMS_API_KEY is required");
  const authIssueUrl = process.env.AUTH_ISSUE_URL;
  invariant(authIssueUrl, "AUTH_ISSUE_URL is required");

  logger.enable("pretty");
  logger.info("Logging enabled");

  const manifest = "./geo-substream-v1.0.3.spkg";
  const substreamPackage = await readPackageFromFile(manifest);
  logger.info("Substream package downloaded");

  const { token } = await authIssue(substreamsApiKey, authIssueUrl);
  const outputModule = "geo_out";
  const startBlockNum = 36472424;
  const productionMode = true;
  const finalBlocksOnly = false; // TODO: Confirm with Byron - Set to true to only process blocks that have pass finality

  // Cursor
  // const cursor = cursorPath.startsWith("http") ? httpCursor : fileCursor;

  // Connect Transport
  // const startCursor = await cursor.readCursor(cursorPath, httpCursorAuth);
  const registry = createRegistry(substreamPackage);
  const transport = createDefaultTransport(substreamsEndpoint, token, registry);
  const request = createRequest({
    substreamPackage,
    outputModule,
    startBlockNum,
    productionMode,
    // startCursor,
    finalBlocksOnly,
  });

  // Substreams Block Emitter
  const emitter = new BlockEmitter(transport, request, registry);

  // Stream Blocks
  emitter.on("anyMessage", (message, cursor, clock) => {
    const entryResponse = ZodEntryStreamResponse.safeParse(message);
    const roleChangeResponse = ZodRoleChangeStreamResponse.safeParse(message);

    const blockNumber = Number(clock.number.toString());

    if (blockNumber % 100 === 0) {
      console.log(`Block number: ${clock.number}`);
    }

    console.debug("message", message);

    if (entryResponse.success) {
      console.log("TODO: Handle entryResponse");
      populateEntries(entryResponse.data.entries, blockNumber);
    } else if (roleChangeResponse.success) {
      console.log("TODO: Handle roleGrantedResponse");
    } else {
      console.error("error", message);
    }
  });

  // Start streaming
  await emitter.start();
  logger.info("Streaming started...");
};
