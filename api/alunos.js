import mysql from "mysql2/promise";

export default async function handler(req, res) {
  // ✅ CORS LIBERADO
  res.setHeader("Access-Control-Allow-Origin", "https://sword-sukuna.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ responder preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let db;

  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // cria tabelas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blocos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_bloco VARCHAR(100) NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        idade INT,
        email VARCHAR(150),
        curso VARCHAR(100),
        bloco_id INT,
        FOREIGN KEY (bloco_id) REFERENCES blocos(id)
      )
    `);

    // 👨‍🎓 CADASTRAR
    if (req.method === "POST") {
      const { nome, idade, email, curso, bloco_id } = req.body;

      await db.execute(
        `INSERT INTO alunos (nome, idade, email, curso, bloco_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          nome,
          idade || null,
          email || null,
          curso || null,
          bloco_id || null
        ]
      );

      return res.status(200).json({
        message: "Aluno cadastrado com sucesso"
      });
    }

    // 🔍 LISTAR
    if (req.method === "GET") {
      const { nome } = req.query;

      let query = "SELECT * FROM alunos";
      let params = [];

      if (nome) {
        query += " WHERE nome LIKE ?";
        params.push(`%${nome}%`);
      }

      const [rows] = await db.execute(query, params);
      return res.status(200).json(rows);
    }

    return res.status(405).json({
      error: "Método não permitido"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro interno",
      details: error.message
    });

  } finally {
    if (db) await db.end();
  }
}
