import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

const SearchWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha('#fff', 0.15),
    '&:hover': {
        backgroundColor: alpha('#fff', 0.25),
    },
    marginBottom: theme.spacing(3),
    width: '100%',
    maxWidth: 600,
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1.5, 2),
    borderRadius: 6,
    backgroundColor: '#fff',
    fontSize: 16,
}));

function GameCard({ title }) {
    return (
        <Link href={`/game-info?title=${encodeURIComponent(title)}`} className="text-decoration-none">
            <div className="card shadow-sm p-3 mb-3 rounded-3">
                <h5 className="mb-0">{title}</h5>
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

    if (loading) return <p className="text-center mt-4">Loading games…</p>;

    const filteredGames = Array.isArray(games)
        ? games.filter((game) =>
            typeof game.title === 'string' &&
            game.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const gamesToShow = filteredGames.slice(0, visibleCount);

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <>
            <Container className="mt-4">
                <SearchWrapper>
                    <StyledInputBase
                        placeholder="Search games…"
                        inputProps={{ 'aria-label': 'search' }}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setVisibleCount(50);
                        }}
                    />
                </SearchWrapper>

                <div>
                    {gamesToShow.map((game) => (
                        <GameCard key={game.title} title={game.title} />
                    ))}
                </div>

                {showButton && (
                    <div className="text-center mt-3">
                        <Button onClick={scrollToTop} variant="outlined">
                            ↑ Top
                        </Button>
                    </div>
                )}
            </Container>

            {showButton && (
                <Button
                    onClick={scrollToTop}
                    variant="contained"
                    color="primary"
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 1000,
                        borderRadius: '50%',
                        minWidth: '56px',
                        minHeight: '56px',
                        fontSize: '1.5rem',
                    }}
                    aria-label="Back to Top"
                >
                    ↑
                </Button>
            )}
        </>
    );
}