import { bootstrapRoot } from "../bootstrapRoot.js";
import { runSqlFile } from "./runSqlFile.js";

export const resetDatabaseToGenesis = async () => {
  try {
    await runSqlFile("./src/sql/clearTables.sql");
    await bootstrapRoot();
  } catch (err) {
    console.error("Error resetting database:", err);
  }
};
