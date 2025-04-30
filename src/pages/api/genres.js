import pool from './lib/db';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT genre FROM Video_Games WHERE genre IS NOT NULL ORDER BY genre;'
    );
    const genres = rows.map((r) => r.genre);
    res.status(200).json(genres);
  } catch (e) {
    console.error('Error fetching genres:', e);
    res.status(500).json({ error: e.message });
  }
}