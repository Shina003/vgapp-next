import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function GameInfo() {
    const router = useRouter();
    const { title } = router.query;

    const [game, setGame] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!title) return;

        fetch(`/api/game-info?title=${encodeURIComponent(title)}`)
            .then((res) => {
                if (!res.ok) throw new Error('Game not found');
                return res.json();
            })
            .then((data) => setGame(data))
            .catch(() => setError('Failed to fetch game info'));
    }, [title]);

    if (error) return <div className="text-white text-center">{error}</div>;
    if (!game) return <div className="text-white text-center">Loading...</div>;

    return (
        <div className="text-white py-5 px-3 d-flex flex-column align-items-center">
            {game.background_image ? (
                <div className="mb-4">
                    <img src={game.background_image} alt={game.title} className="img-fluid rounded shadow" />
                </div>
            ) : (
                <div className="mb-4 bg-secondary text-center text-white p-5 rounded">No Image Available</div>
            )}

            <div className="mb-3">
                <h2 className="fw-bold text-center">{game.title}</h2>
            </div>

            <div className="mb-4 text-center fs-1">
                <p><strong>Genre:</strong> {game.genre}</p>
                <p><strong>Publisher:</strong> {game.publisher}</p>
                <p><strong>Release Year:</strong> {game.release_year}</p>
                <p className="fw-bold mt-3">Sales Breakdown</p>
                <p>NA: {game.NA_sales} million</p>
                <p>EU: {game.EU_sales} million</p>
                <p>JP: {game.JP_sales} million</p>
                <p>Other: {game.other_sales} million</p>
                <p className="fw-bold">Total: {game.tot_sales} million</p>
            </div>

            <div>
                <button className="btn btn-primary me-5" onClick={() => router.push('/')}>← Home</button>
                <Link href={`/reviews-page?title=${encodeURIComponent(game.title)}`}>
                    <button className="btn btn-primary">View Reviews</button>
                </Link>
            </div>
        </div>
    );
}
