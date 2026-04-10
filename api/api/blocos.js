import mysql from "mysql2/promise";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  if (req.method === "POST") {
    const { nome_bloco } = req.body;
    await db.execute(
      "INSERT INTO blocos (nome_bloco) VALUES (?)",
      [nome_bloco]
    );
    return res.status(200).json({ message: "Bloco criado" });
  }

  const [rows] = await db.execute("SELECT * FROM blocos");
  res.status(200).json(rows);
}
