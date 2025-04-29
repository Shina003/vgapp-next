// pages/api/game-info.js
import pool from './lib/db';
import https from 'https';

function httpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

export default async function handler(req, res) {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: "Missing title parameter" });
    }

    try {
        const [results] = await pool.query(
            `SELECT 
        v.gameID,
        v.title,
        v.genre, 
        v.publisher, 
        v.release_year, 
        v.cost, 
        s.NA_sales, 
        s.EU_sales, 
        s.JP_sales, 
        s.other_sales, 
        s.tot_sales
      FROM 
        Video_Games v
      JOIN 
        Sales_Data s
      ON 
        v.gameID = s.salesID
      WHERE v.title = ?`,
            [decodeURIComponent(title)]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: "Game not found" });
        }

        const dbResults = results[0];
        let gameData = { ...dbResults, background_image: null };

        try {
            const apiKey = process.env.RAWG_API_KEY;
            if (apiKey) {
                const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(dbResults.title)}&search_precise=true`;
                const data = await httpsRequest(url);

                const exactMatch = data.results?.find(
                    (game) => game.name.toLowerCase() === dbResults.title.toLowerCase()
                );

                const match = exactMatch || data.results?.[0];
                if (match) {
                    gameData.background_image = match.background_image;
                    gameData.rawg_id = match.id;
                }
            }
        } catch (err) {
            console.error("RAWG fetch failed:", err);
        }

        res.status(200).json(gameData);
    } catch (err) {
        console.error("❌ DB Error:", err);
        res.status(500).json({ error: err.message });
    }
}
