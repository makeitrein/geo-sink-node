import { authIssue, createRegistry, createRequest } from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import dotenv from "dotenv";
import { readCursor, writeCursor } from "./cursor.js";
import { populateEntries } from "./populateEntries.js";
import { handleRoleGranted, handleRoleRevoked } from "./populateRoles.js";
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

  const manifest = "./geo-substream.spkg";
  const substreamPackage = await readPackageFromFile(manifest);
  logger.info("Substream package downloaded");

  const { token } = await authIssue(substreamsApiKey, authIssueUrl);
  const outputModule = "geo_out";
  const startBlockNum = 36472424;
  const productionMode = true;
  const finalBlocksOnly = true;

  const startCursor = await readCursor();
  const registry = createRegistry(substreamPackage);
  const transport = createDefaultTransport(substreamsEndpoint, token, registry);
  const request = createRequest({
    substreamPackage,
    outputModule,
    startBlockNum,
    productionMode,
    startCursor,
    finalBlocksOnly,
  });

  const emitter = new BlockEmitter(transport, request, registry);

  emitter.on("block", (block) => {
    const blockNumber = Number(block.clock?.number.toString());

    if (blockNumber % 1000 === 0) {
      console.log(`Block ${blockNumber}`);
    }
  });

  emitter.on("cursor", (cursor, clock) => {
    const blockNumber = Number(clock.number.toString());
    writeCursor(cursor, blockNumber);
  });

  emitter.on("anyMessage", (message, cursor, clock) => {
    const entryResponse = ZodEntryStreamResponse.safeParse(message);
    const roleChangeResponse = ZodRoleChangeStreamResponse.safeParse(message);

    const blockNumber = Number(clock.number.toString());
    const timestamp = Number(clock.timestamp?.seconds);

    if (entryResponse.success) {
      console.log("Processing ", entryResponse.data.entries.length, " entries");
      const entries = entryResponse.data.entries;
      populateEntries({ entries, blockNumber, cursor, timestamp });
    } else if (roleChangeResponse.success) {
      roleChangeResponse.data.roleChanges.forEach((roleChange) => {
        const { granted, revoked } = roleChange;
        if (granted) {
          handleRoleGranted(granted);
        } else if (revoked) {
          handleRoleRevoked(revoked);
        }
      });
    } else {
      console.error("Failed to parse substream message", message);
    }
  });

  await emitter.start();
};
