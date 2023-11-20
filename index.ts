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
