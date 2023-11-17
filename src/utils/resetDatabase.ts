import { bootstrapRoot } from "../bootstrapRoot.js";
import { runSqlFile } from "./runSqlFile.js";

export const resetDatabase = async () => {
  try {
    await runSqlFile("./src/sql/nukePublic.sql");
    await runSqlFile("./src/sql/bootstrapPublic.sql");
    await runSqlFile("./src/sql/bootstrapCache.sql");
    await runSqlFile("./src/sql/bootstrapFunctions.sql");

    await bootstrapRoot();
  } catch (err) {
    console.error("Error resetting database:", err);
  }
};
