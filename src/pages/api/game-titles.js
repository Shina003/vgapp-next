import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const { genre, publisher, release_year } = req.query;

    // base query
    let sql = `
      SELECT
        title,
        genre,
        publisher,
        release_year
      FROM Video_Games
    `;
    const conditions = [];
    const params = [];

    // add filters if present
    if (genre && genre !== 'All') {
      conditions.push('genre = ?');
      params.push(genre);
    }
    if (publisher && publisher !== 'All') {
      conditions.push('publisher = ?');
      params.push(publisher);
    }
    if (release_year) {
      conditions.push('release_year = ?');
      params.push(release_year);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY title ASC;';

    const [rows] = await pool.query(sql, params);

    // return array of objects with all fields
    res.status(200).json(
      rows.map((r) => ({
        title: r.title,
        genre: r.genre,
        publisher: r.publisher,
        release_year: r.release_year,
      }))
    );
  } catch (e) {
    console.error('❌ Error fetching titles:', e);
    res.status(500).json({ error: e.message });
  }
}