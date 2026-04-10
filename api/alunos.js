import mysql from "mysql2/promise";

export default async function handler(req, res) {
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

    // ✅ CADASTRAR ALUNO
    if (req.method === "POST") {
      const { nome, idade, email, curso, bloco_id } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: "Nome é obrigatório"
        });
      }

      await db.execute(
        `INSERT INTO alunos 
        (nome, idade, email, curso, bloco_id) 
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
        success: true,
        message: "Aluno cadastrado com sucesso"
      });
    }

    // ✅ BUSCAR POR NOME
    if (req.method === "GET") {
      const { nome, bloco } = req.query;

      let query = `
        SELECT 
          alunos.*,
          blocos.nome_bloco
        FROM alunos
        LEFT JOIN blocos ON alunos.bloco_id = blocos.id
      `;

      let params = [];

      if (nome) {
        query += " WHERE alunos.nome LIKE ?";
        params.push(`%${nome}%`);
      }

      if (bloco) {
        query += nome ? " AND " : " WHERE ";
        query += " alunos.bloco_id = ?";
        params.push(bloco);
      }

      const [rows] = await db.execute(query, params);

      return res.status(200).json(rows);
    }

    // ❌ método inválido
    return res.status(405).json({
      error: "Método não permitido"
    });

  } catch (error) {
    console.error("Erro na API:", error);

    return res.status(500).json({
      error: "Erro interno no servidor",
      details: error.message
    });

  } finally {
    if (db) await db.end();
  }
}