import express, { Request, Response } from "express";
import path from "path";
import { generateSqlFromText } from "./sqlGenerator";
import { executeSql } from "./db";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/api/query", async (req: Request, res: Response) => {
  try {
    const { query, dryRun } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'query' parameter" });
    }

    const sql = await generateSqlFromText(query);

    if (dryRun) {
      return res.json({ sql, rows: [] });
    }

    const rows = await executeSql(sql);
    res.json({ sql, rows });
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 DataTalk server running at http://localhost:${PORT}`);
});
