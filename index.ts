import { Command } from 'commander';
import { Effect } from 'effect';
import { runStream } from './src/runStream.js';
import { resetDatabaseToGenesis } from './src/utils/resetDatabaseToGenesis.js';

async function main() {
    try {
        const program = new Command();

        program
            .option('--from-genesis', 'Start from genesis block')
            .option('--from-cache', 'Start from cached block')
            .option('--bootstrap', 'Do not stream new blocks')
            .option('--stream-only', 'Stream only mode');

        program.parse(process.argv);

        const options = program.opts();

        console.log('Options: ', options);

        if (options.fromGenesis) {
            await resetDatabaseToGenesis();
        }

        if (options.fromCache) console.log('from cache');
        if (options.streamOnly) console.log('stream only');

        await Effect.runPromise(runStream());
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
