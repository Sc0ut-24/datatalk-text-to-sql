const initSqlJs = require("sql.js");
import fs from "fs";
import path from "path";

const DB_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");
let cachedDb: any = null;

async function loadDatabase(): Promise<any> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Resolve sql.js package location
  const sqlJsRoot = path.dirname(require.resolve("sql.js"));
  
  // Construct path to WASM file with fallback for different environments
  const wasmFileName = "sql-wasm.wasm";
  const getWasmPath = (file: string) => {
    // Try dist subdirectory first (standard sql.js layout)
    const distPath = path.join(sqlJsRoot, "dist", file);
    if (fs.existsSync(distPath)) {
      return distPath;
    }
    // Fallback to root directory
    const rootPath = path.join(sqlJsRoot, file);
    return rootPath;
  };

  const SQL = await initSqlJs({ 
    locateFile: getWasmPath
  });
  const data = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
  const db = data ? new SQL.Database(data) : new SQL.Database();
  cachedDb = db;
  return db;
}

function saveDatabase(db: any) {
  const bytes = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(bytes));
}

async function ensureDatabase(): Promise<any> {
  const db = await loadDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      order_ref TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      notional_amount REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const countResult = db.exec("SELECT COUNT(*) AS count FROM orders;");
  const orderCount = countResult[0]?.values?.[0]?.[0] as number | undefined;

  if (!orderCount) {
    const customers = [
      { id: 1, name: "Ethan Carter" },
      { id: 2, name: "Sophia Lim" },
      { id: 3, name: "Raj Mehta" },
      { id: 4, name: "Olivia Tan" },
      { id: 5, name: "Daniel Kim" }
    ];

    const symbols = [
      "AAPL",
      "TSLA",
      "NVDA",
      "MSFT",
      "AMZN",
      "META",
      "GOOGL",
      "AMD",
      "NFLX",
      "SHOP"
    ];

    const statuses = ["FILLED", "PENDING", "CANCELLED"];
    const sides = ["BUY", "SELL"];

    function randomChoice(arr: any[]) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function randomPrice(symbol: string) {
      const prices: Record<string, [number, number]> = {
        AAPL: [170, 220],
        TSLA: [140, 260],
        NVDA: [700, 1200],
        MSFT: [350, 480],
        AMZN: [160, 230],
        META: [300, 600],
        GOOGL: [130, 210],
        AMD: [120, 240],
        NFLX: [450, 900],
        SHOP: [60, 140]
      };

      const [min, max] = prices[symbol];
      return +(Math.random() * (max - min) + min).toFixed(2);
    }

    function randomQuantity() {
      return Math.floor(Math.random() * 90) + 10;
    }

    function randomDate2025() {
      const start = new Date("2025-01-01").getTime();
      const end = new Date("2025-12-31").getTime();

      const randomTime = start + Math.random() * (end - start);
      return new Date(randomTime)
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);
    }

    // Insert 120 random orders
    for (let i = 1; i <= 120; i++) {
      const customer = randomChoice(customers);
      const symbol = randomChoice(symbols);
      const side = randomChoice(sides);
      const quantity = randomQuantity();
      const price = randomPrice(symbol);
      const notional = +(quantity * price).toFixed(2);
      const status = randomChoice(statuses);

      const orderRef = `ORD-2025-${String(i).padStart(5, "0")}`;

      const createdAt = randomDate2025();

      db.run(
        `INSERT INTO orders
        (
          order_ref,
          customer_id,
          symbol,
          side,
          quantity,
          price,
          notional_amount,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderRef,
          customer.id,
          symbol,
          side,
          quantity,
          price,
          notional,
          status,
          createdAt
        ]
      );
    }

    saveDatabase(db);
  }

  return db;
}

function validateSql(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized.startsWith("select")) {
    throw new Error("Only SELECT queries are allowed against the local SQLite database.");
  }

  if ((normalized.match(/;/g) || []).length > 1) {
    throw new Error("Multiple SQL statements are not supported.");
  }
}

export async function executeSql(query: string) {
  validateSql(query);
  const db = await ensureDatabase();
  const statement = db.prepare(query);
  const rows: Record<string, unknown>[] = [];

  while (statement.step()) {
    rows.push(statement.getAsObject());
  }

  statement.free();
  return rows;
}

export async function ensureDbFile() {
  await ensureDatabase();
}
