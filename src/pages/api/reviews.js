import pool from './lib/db';

export default async function handler(req, res) {
    const { title } = req.query; // get title from query string

    try {
        const [results] = await pool.query(
            `SELECT 
            r.reviewID,
            v.title,
            r.reviewer_name,
            r.review_body,
            r.score
        FROM 
            Reviews r
        JOIN 
            Video_Games v ON r.gameID = v.gameID
        WHERE 
            v.title = ?
        `,
            [decodeURIComponent(title)]
        );

        return res.status(200).json(results);
    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        return res.status(500).json({ error: error.message });
    }
}
