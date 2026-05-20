import { translateAndExecute, translateTextToSql } from "./index";

async function run() {
  const [, , ...args] = process.argv;
  const dryRunFlag = args.includes("--sql-only") || args.includes("--dry-run");
  const filteredArgs = args.filter(arg => arg !== "--sql-only" && arg !== "--dry-run");

  if (filteredArgs.length === 0) {
    console.error("Usage: npm run dev -- [--sql-only] \"Describe your question in plain English\"");
    process.exit(1);
  }

  const naturalLanguage = filteredArgs.join(" ");
  try {
    if (dryRunFlag) {
      const sql = await translateTextToSql(naturalLanguage);
      console.log("\nGenerated SQL:\n");
      console.log(sql);
      return;
    }

    const { sql, rows } = await translateAndExecute(naturalLanguage);
    console.log("\nGenerated SQL:\n");
    console.log(sql);
    console.log("\nQuery result:\n");
    console.table(rows);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

run();
