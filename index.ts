import {
  authIssue,
  createRegistry,
  createRequest
} from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import dotenv from 'dotenv';
import { invariant } from "./src/invariant.js";
import { logger } from "./src/logger.js";

dotenv.config();

const substreamsEndpoint = process.env.SUBSTREAMS_ENDPOINT;
invariant(substreamsEndpoint, "SUBSTREAMS_ENDPOINT is required");
const substreamsApiKey = process.env.SUBSTREAMS_API_KEY;
invariant(substreamsApiKey, "SUBSTREAMS_API_KEY is required");
const authIssueUrl = process.env.AUTH_ISSUE_URL;
console.log("AUTH_ISSUE_URL:", authIssueUrl);
invariant(authIssueUrl, "AUTH_ISSUE_URL is required");

// Configure logging with TSLog
logger.enable();

// Download Substream package
const manifest = "./geo-substream.spkg";
console.log("Reading package from file:", manifest);
const substreamPackage = await readPackageFromFile(manifest);

console.log("Parsing authorization...");
const { token } = await authIssue(substreamsApiKey, authIssueUrl);
console.log(token);
const outputModule = "geo_out";
const startBlockNum = 36472424;
const productionMode = true;
const finalBlocksOnly = false; // Set to true to only process blocks that have pass finality



// Cursor
// const cursor = cursorPath.startsWith("http") ? httpCursor : fileCursor;

// Connect Transport
// const startCursor = await cursor.readCursor(cursorPath, httpCursorAuth);
console.log("Creating registry...");
const registry = createRegistry(substreamPackage);
console.log("Creating transport...");
const transport = createDefaultTransport(
  substreamsEndpoint,
  token,
  registry,
);
console.log("Creating request...");
const request = createRequest({
  substreamPackage,
  outputModule,
  startBlockNum,
  productionMode,
  // startCursor,
  finalBlocksOnly,
});

// Substreams Block Emitter
console.log("Creating block emitter...");
const emitter = new BlockEmitter(transport, request, registry);

// Stream Blocks
emitter.on("anyMessage", (message, cursor, clock) => {
  console.log("Received message:", message);
  console.log("Cursor:", cursor);
  console.log("Clock:", clock);
});

// Start streaming
console.log("Starting emitter...");
await emitter.start();
console.log("Emitter started.");
