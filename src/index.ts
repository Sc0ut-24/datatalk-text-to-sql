import { executeSql } from "./db";
import { generateSqlFromText } from "./sqlGenerator";

export async function translateTextToSql(text: string, schemaDescription?: string) {
  return generateSqlFromText(text, schemaDescription);
}

export async function translateAndExecute(text: string, schemaDescription?: string) {
  const sql = await generateSqlFromText(text, schemaDescription);
  const rows = await executeSql(sql);
  return { sql, rows };
}

export * from "./sqlGenerator";
export * from "./db";
