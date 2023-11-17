import { Command } from "commander";
import { startGeoStream } from "./src/stream.js";
import { runSqlFile } from "./src/utils/runSqlFile.js";
const program = new Command();

program
  .option("--from-genesis", "Start from genesis block")
  .option("--from-cache", "Start from cached block")
  .option("--stream-only", "Stream only mode");

program.parse(process.argv);

const options = program.opts();

if (options.fromGenesis) {
  await runSqlFile("./src/sql/nukePublic.sql");
  await runSqlFile("./src/sql/bootstrapPublic.sql");
  await runSqlFile("./src/sql/bootstrapCache.sql");
  await runSqlFile("./src/sql/bootstrapFunctions.sql");
}
if (options.fromCache) console.log("from cache");
if (options.streamOnly) console.log("stream only");

startGeoStream();
