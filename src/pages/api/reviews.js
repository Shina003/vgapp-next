// pages/api/reviews.js
import pool from './lib/db';

// After importing pool
try {
    const [dbName] = await pool.query('SELECT DATABASE() AS db');
    console.log("🚨 Connected to DB:", dbName[0].db);
} catch (err) {
    console.error("❌ Could not identify DB:", err);
}


export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { title } = req.query;

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
                    v.title = ?`,
                [decodeURIComponent(title)]
            );

            return res.status(200).json(results);
        } catch (error) {
            console.error("❌ Error fetching reviews:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { title, reviewer_name, review_body, score } = req.body;

        if (!title || !reviewer_name || !review_body || score == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            // Get gameID for the title
            const [game] = await pool.query(
                'SELECT gameID FROM Video_Games WHERE title = ?',
                [title]
            );

            if (game.length === 0) {
                return res.status(404).json({ error: 'Game not found' });
            }

            const gameID = game[0].gameID;

            // Insert review
            const [insert] = await pool.query(
                'INSERT INTO Reviews (gameID, reviewer_name, review_body, score) VALUES (?, ?, ?, ?)',
                [gameID, reviewer_name, review_body, score]
            );

            const newReview = {
                reviewID: insert.insertId,
                gameID,
                title,
                reviewer_name,
                review_body,
                score
            };

            return res.status(201).json(newReview);
        } catch (error) {
            console.error("❌ Error inserting review:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}