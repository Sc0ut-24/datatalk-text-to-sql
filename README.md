# Text-to-SQL Starter

A minimal workspace scaffold for converting natural language into SQL queries using Anthropic.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your Anthropic API key:
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   ```
3. Run in development mode and execute the generated SQL against the local SQLite database:
   ```bash
   npm run dev -- "List the top 5 customers by total order amount"
   ```
4. To only see the generated SQL without execution, add `--sql-only`:
   ```bash
   npm run dev -- --sql-only "List the top 5 customers by total order amount"
   ```

## Project structure

- `src/cli.ts` - CLI entrypoint for text-to-SQL conversion and query execution.
- `src/index.ts` - Main module exports.
- `src/openaiClient.ts` - Anthropic client wrapper.
- `src/sqlGenerator.ts` - Prompt builder and query generation logic.
- `src/db.ts` - Local SQLite database setup and query execution.

## Notes

- The app now seeds `data/app.db` with a sample schema and records.
- Generated SQL is executed locally against the SQLite database by default.
- Only single `SELECT` queries are allowed for safety.
