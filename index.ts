import { Command } from "commander";
import * as zg from "zapatos/generate";
import { startGeoStream } from "./src/stream.js";
import { resetDatabase } from "./src/utils/resetDatabase.js";

const program = new Command();

program
  .option("--from-genesis", "Start from genesis block")
  .option("--from-cache", "Start from cached block")
  .option("--bootstrap", "Do not stream new blocks")
  .option("--stream-only", "Stream only mode");

program.parse(process.argv);

const options = program.opts();

console.log("Options: ", options);

if (options.bootstrap) {
  console.log("Bootstrapping database...");
  await resetDatabase();
  console.log("Done bootstrapping.");

  console.log("Updating table types...");
  await zg.generate({
    db: { connectionString: process.env.DATABASE_URL },
    outDir: "./src",
  });
  console.log("Done updating table types. Exiting...");
  process.exit();
}

if (options.fromGenesis) {
  resetDatabase();
}

if (options.fromCache) console.log("from cache");
if (options.streamOnly) console.log("stream only");

startGeoStream();
