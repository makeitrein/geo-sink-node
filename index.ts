#!/usr/bin/env node

import { CliApp, HelpDoc, Span, ValidationError } from "@effect/cli";
import { NodeContext, Runtime } from "@effect/platform-node";
import * as dotenv from "dotenv";
import { Effect, Match, Option } from "effect";
import * as RootCommand from "./src/sink/commands/root.js";
import * as RunCommand from "./src/sink/commands/run.js";

dotenv.config();

const cli = CliApp.make({
  name: "Substreams File Sink",
  version: "0.0.0",
  command: RootCommand.command,
  summary: Span.text("A simple file sink for substreams"),
});

const program = Effect.sync(() => process.argv.slice(2)).pipe(
  Effect.flatMap((_) =>
    CliApp.run(
      cli,
      _,
      Effect.unifiedFn(({ subcommand, options: { logLevel } }) =>
        Option.match(subcommand, {
          onNone: () =>
            Effect.fail(
              ValidationError.missingSubcommand(HelpDoc.p("Missing subcommand"))
            ),
          onSome: (_) => {
            const subcommand = Match.value(_).pipe(
              Match.tagsExhaustive({
                RunCommand: (_) => new RunCommand.RunCommand(_),
              })
            );

            return RootCommand.handle(
              new RootCommand.RootCommand({ logLevel, subcommand })
            );
          },
        })
      )
    )
  ),
  // Command validation errors are handled by `@effect/cli` and logged to stderr already.
  Effect.catchIf(ValidationError.isValidationError, () => Effect.unit),
  // Log all other errors to stderr.
  Effect.catchAllCause((_) => Effect.logError(_))
);

Runtime.runMain(Effect.provide(program, NodeContext.layer));

// TODO: Add all the remaining cli options (start block, stop block, cursor, etc. ... ).
// TODO: Add an option to specify the output location (for .messages and .cursor files).
// TODO: Add spans and logging.
// TODO: Add metrics to log prints.

// import { Command } from "commander";
// import { startGeoStream } from "./src/stream.js";
// import { resetDatabaseToGenesis } from "./src/utils/resetDatabaseToGenesis.js";

// async function main() {
//   try {
//     const program = new Command();

//     program
//       .option("--from-genesis", "Start from genesis block")
//       .option("--from-cache", "Start from cached block")
//       .option("--bootstrap", "Do not stream new blocks")
//       .option("--stream-only", "Stream only mode");

//     program.parse(process.argv);

//     const options = program.opts();

//     console.log("Options: ", options);

//     if (options.fromGenesis) {
//       await resetDatabaseToGenesis();
//     }

//     if (options.fromCache) console.log("from cache");
//     if (options.streamOnly) console.log("stream only");

//     startGeoStream();
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }

// main();
