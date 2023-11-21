import { Command } from "commander";
import { Effect } from "effect";
import { readCacheCursor } from "./src/cursor.js";
import { readCacheEntries, readCacheRoles } from "./src/populateCache.js";
import { runStream } from "./src/runStream.js";
import { resetDatabaseToGenesis } from "./src/utils/resetDatabaseToGenesis.js";

async function main() {
  try {
    const program = new Command();

    program
      .option("--from-genesis", "Start from genesis block")
      .option("--from-cache", "Start from cached block");

    program.parse(process.argv);

    const options = program.opts();

    console.log("Options: ", options);

    if (options.fromGenesis) {
      await resetDatabaseToGenesis();
    }

    if (options.fromCache) {
      const cachedEntries = await readCacheEntries();
      const cachedRoles = await readCacheRoles();
      const cachedCursor = await readCacheCursor();
    }

    await Effect.runPromise(runStream());
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
