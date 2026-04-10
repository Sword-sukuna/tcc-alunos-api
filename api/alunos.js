import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // cadastrar aluno
  if (req.method === "POST") {
    const { nome, idade, email, curso } = req.body;

    await db.execute(
      "INSERT INTO alunos (nome, idade, email, curso) VALUES (?, ?, ?, ?)",
      [nome, idade, email, curso]
    );

    return res.status(200).json({ message: "Aluno cadastrado" });
  }

  // buscar alunos
  const [rows] = await db.execute("SELECT * FROM alunos");
  res.status(200).json(rows);
}