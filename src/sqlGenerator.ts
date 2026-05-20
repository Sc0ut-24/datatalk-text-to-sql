import Anthropic from "@anthropic-ai/sdk";
import { anthropicApiKey } from "./openaiClient";

const DEFAULT_SCHEMA = `
-- Trading orders schema
-- orders(id, order_ref, customer_id, symbol, side, quantity, price, notional_amount, status, created_at)
-- customer_id values: 1=Ethan Carter, 2=Sophia Lim, 3=Raj Mehta, 4=Olivia Tan, 5=Daniel Kim
-- symbols: AAPL, TSLA, NVDA, MSFT, AMZN, META, GOOGL, AMD, NFLX, SHOP
-- side: BUY, SELL
-- status: FILLED, PENDING, CANCELLED
`;

export async function generateSqlFromText(text: string, schemaDescription: string = DEFAULT_SCHEMA) {
  const client = new Anthropic({ apiKey: anthropicApiKey });
  const prompt = buildSqlPrompt(text, schemaDescription);

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("No text response received from Anthropic.");
  }

  return content.text.trim();
}

function buildSqlPrompt(text: string, schemaDescription: string) {
  return `You are a SQL generation assistant. Given the database schema and a natural language request, return only the SQL query that answers the request. Do not include any extra explanation.

Database schema:
${schemaDescription}

User request:
${text}

SQL query:`;
}
