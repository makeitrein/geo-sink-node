import { Command } from "commander";
import { startGeoStream } from "./src/stream.js";
import { runSqlFile } from "./src/utils/runSqlFile.js";
const program = new Command();

const resetDatabase = async () => {
  await runSqlFile("./src/sql/nukePublic.sql");
  await runSqlFile("./src/sql/bootstrapPublic.sql");
  await runSqlFile("./src/sql/bootstrapCache.sql");
  await runSqlFile("./src/sql/bootstrapFunctions.sql");
};

program
  .option("--from-genesis", "Start from genesis block")
  .option("--from-cache", "Start from cached block")
  .option("--bootstrap", "Do not stream new blocks")
  .option("--stream-only", "Stream only mode");

program.parse(process.argv);

const options = program.opts();

console.log(options);

if (options.bootstrap) {
  console.log("Bootstrapping...");
  resetDatabase();
  console.log("Done bootstrapping. Exiting...");
  process.exit();
}

if (options.fromGenesis) {
  resetDatabase();
}

if (options.fromCache) console.log("from cache");
if (options.streamOnly) console.log("stream only");

startGeoStream();
