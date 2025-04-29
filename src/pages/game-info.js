import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/game-info.module.css';
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

    if (error) return <div className={styles.gameDetailsContainer}>{error}</div>;
    if (!game) return <div className={styles.gameDetailsContainer}>Loading...</div>;

    return (
        <div className={styles.gameDetailsContainer}>
            <div className={styles.leftPanel}>
                {game.background_image ? (
                    <div className={styles.gameImage}>
                        <img src={game.background_image} alt={game.title} />
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>No Image Available</div>
                )}

                <div className={styles.sales}>
                    <p className={styles.text}>NA Sales: {game.NA_sales} million</p>
                    <p className={styles.text}>EU Sales: {game.EU_sales} million</p>
                    <p className={styles.text}>JP Sales: {game.JP_sales} million</p>
                    <p className={styles.text}>Other Sales: {game.other_sales} million</p>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <h1 className={styles.title}>{game.title}</h1>
                <p className={styles.text}>Genre: {game.genre}</p>
                <p className={styles.text}>Publisher: {game.publisher}</p>
                <p className={styles.text}>Release Year: {game.release_year}</p>
                <h2 className={styles.text}>Total Sales: {game.tot_sales} million</h2>

                <button onClick={() => router.push('/')} className={styles.button}>
                    Back to Home
                </button>
                <Link href={`/reviews-page?title=${encodeURIComponent(game.title)}`}>
                    <button className={styles.button}>
                        Go to Reviews Page
                    </button>
                </Link>
            </div>
        </div>
    );
}
