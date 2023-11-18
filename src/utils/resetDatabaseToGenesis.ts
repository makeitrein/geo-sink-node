import { bootstrapRoot } from "../bootstrapRoot.js";

export const resetDatabaseToGenesis = async () => {
  try {
    // await runSqlFile("./src/sql/clearPublicTables.sql");
    await bootstrapRoot();
  } catch (err) {
    console.error("Error resetting database:", err);
  }
};
