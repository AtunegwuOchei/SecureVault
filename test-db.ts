import { db } from "./server/db"; // adjust path as needed

async function testConnection() {
  try {
    const result = await db.execute(`SELECT 1;`);
    console.log("✅ Connected to Neon! Result:", result);
  } catch (err) {
    console.error("❌ Failed to connect to Neon:", err);
  }
}

testConnection();
