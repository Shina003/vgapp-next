import pool from './lib/db';

export default async function handler(req, res) {
  try {
    // pull every row, sorted by title
    const [rows] = await pool.query(`
      SELECT
        title,
        genre,
        publisher,
        release_year
      FROM Video_Games
      ORDER BY title ASC;
    `);

    // send them raw
    res.status(200).json(rows);
  } catch (e) {
    console.error('❌ Error fetching titles:', e);
    res.status(500).json({ error: e.message });
  }
}