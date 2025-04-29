import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, TextField } from '@mui/material';
import styles from '../styles/index.module.css';

function GameCard({ title }) {
    return (
        <Link href={`/game-info?title=${encodeURIComponent(title)}`} className={styles['game-link']}>
            <div className={styles['game-list-item']}>
                <h3 className={styles['game-title']}>{title}</h3>
            </div>
        </Link>
    );
}


export default function HomePage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(50);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        fetch('/api/game-titles')
            .then((res) => res.json())
            .then((data) => {
                setGames(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }

            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                setVisibleCount((prev) => prev + 50);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <p>Loading games…</p>;

    const filteredGames = games.filter((game) =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const gamesToShow = filteredGames.slice(0, visibleCount);

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        
        <div className={styles.mainArea}>
            <Box className={styles.searchBar}>
                <TextField
                    fullWidth
                    label="Enter Game name"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setVisibleCount(50);
                    }}
                />
            </Box>

            <div className={styles.gamecardContainer}>
                {gamesToShow.map((game) => (
                    <GameCard key={game.title} title={game.title} />
                ))}
            </div>

            {showButton && (
                <button onClick={scrollToTop} className={styles.backToTop}>
                    ↑ Top
                </button>
            )}
        </div>
    );
}
