import pool from './lib/db';

export default async function handler(req, res) {
  try {
    const [results] = await pool.query("SELECT DISTINCT title FROM Video_Games ORDER BY title ASC;");

    const titles = results.map((row) => ({
      title: row.title,
    }));

    return res.status(200).json(titles);
  } catch (error) {
    console.error("❌ Error fetching titles:", error);
    return res.status(500).json({ error: error.message });
  }
}
