import { bootstrapRootEntities } from "../bootstrapRootEntities.js";
import { runSqlFile } from "./runSqlFile.js";

export const resetDatabase = async () => {
  await runSqlFile("./src/sql/nukePublic.sql");
  await runSqlFile("./src/sql/bootstrapPublic.sql");
  await runSqlFile("./src/sql/bootstrapCache.sql");
  await runSqlFile("./src/sql/bootstrapFunctions.sql");
  await bootstrapRootEntities();
};
