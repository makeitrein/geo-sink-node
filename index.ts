import {
  createRegistry,
  createRequest,
  parseAuthorization,
} from "@substreams/core";
import { readPackageFromFile } from "@substreams/manifest";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import dotenv from 'dotenv';
import { invariant } from "./src/invariant.js";
import { logger } from "./src/logger.js";

dotenv.config();

const substreamsEndpoint = process.env.SUBSTREAMS_ENDPOINT;
invariant(substreamsEndpoint, "SUBSTREAMS_ENDPOINT is required");
const substreamsApiToken = process.env.SUBSTREAMS_API_TOKEN;
invariant(substreamsApiToken, "SUBSTREAMS_API_TOKEN is required");
const authIssueUrl = process.env.AUTH_ISSUE_URL;
invariant(authIssueUrl, "AUTH_ISSUE_URL is required");

// Configure logging with TSLog
logger.enable();

// Download Substream package
const manifest = "./geo-substream.spkg";
const substreamPackage = await readPackageFromFile(manifest);

const token = await parseAuthorization(
  substreamsApiToken,
  authIssueUrl
);
const outputModule = "geo_out";
const startBlockNum = 36472424;
const productionMode = true;
const finalBlocksOnly = false; // Set to true to only process blocks that have pass finality

const headers = new Headers();
headers.set("User-Agent", "geo-sink");

// Cursor
// const cursor = cursorPath.startsWith("http") ? httpCursor : fileCursor;

// Connect Transport
// const startCursor = await cursor.readCursor(cursorPath, httpCursorAuth);
const registry = createRegistry(substreamPackage);
const transport = createDefaultTransport(
  substreamsEndpoint,
  token,
  registry,
  headers
);
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
  console.log(message);
  console.log(cursor);
  console.log(clock);
});

// Start streaming
await emitter.start();
