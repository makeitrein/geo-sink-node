import { authIssue, createRegistry, createRequest } from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import dotenv from "dotenv";
import { populateEntries } from "./populate.js";
import { invariant } from "./utils/invariant.js";
import { logger } from "./utils/logger.js";
import {
  ZodEntryStreamResponse,
  ZodRoleGrantedStreamResponse,
  ZodRoleRevokedStreamResponse,
} from "./zod.js";

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

  const manifest = "./geo-substream.spkg";
  const substreamPackage = await readPackageFromFile(manifest);
  logger.info("Substream package downloaded");

  const { token } = await authIssue(substreamsApiKey, authIssueUrl);
  const outputModule = "geo_out";
  const startBlockNum = 36472424;
  const productionMode = true;
  const finalBlocksOnly = false; // Set to true to only process blocks that have pass finality

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
    const roleGrantedResponse = ZodRoleGrantedStreamResponse.safeParse(message);
    const roleRevokedResponse = ZodRoleRevokedStreamResponse.safeParse(message);

    if (entryResponse.success) {
      console.log("TODO: Handle entryResponse");
      populateEntries(entryResponse.data.entries);
    } else if (roleGrantedResponse.success) {
      console.log("TODO: Handle roleGrantedResponse");
    } else if (roleRevokedResponse.success) {
      console.log("TODO: Handle roleRevokedResponse");
    } else if (message.entries && entryResponse.error) {
      logger.error("Unknown response at block " + clock.number);
      logger.error(entryResponse.error);
    } else if (message.rolesGranted && roleGrantedResponse.error) {
      /* 
    Note: we're receiving some extra role granted / role revoked noise since the substream
    is configured to listen to any contract, not just Geo-specific spaces. 
    
    We're filtering these extraneous access control changes in the downstream handlers, but it would be better to filter it out at the substream level.
    */
    } else if (message.rolesRevoked && roleRevokedResponse.error) {
    }
  });

  // Start streaming
  await emitter.start();
  logger.info("Streaming started...");
};
