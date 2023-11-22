import { Command } from "commander";
import { Effect } from "effect";
import { populateFromCache } from "./src/populateCache.js";
import { runStream } from "./src/runStream.js";
import { resetPublicTablesToGenesis } from "./src/utils/resetPublicTablesToGenesis.js";

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
      await resetPublicTablesToGenesis();
    }

    if (options.fromCache) {
      await resetPublicTablesToGenesis();
      await populateFromCache();
      // 2. populate with cached entries + roles
      // 3. update the public.cursor to the cached.cursor
      // 4. carry on streaming
    }

    await Effect.runPromise(runStream());
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
