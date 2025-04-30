// filepath: c:\xampp\htdocs\vgapp-next\src\pages\index.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#fff', 0.15),
  '&:hover': { backgroundColor: alpha('#fff', 0.25) },
  marginBottom: theme.spacing(3),
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
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
    <Link href={`/game-info?title=${encodeURIComponent(title)}`}>
      <div className="card shadow-sm p-3 mb-3 rounded-3">
        <h5 className="mb-0">{title}</h5>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [showButton, setShowButton] = useState(false);

  // fetch all games (with genre) and derive unique genres
  useEffect(() => {
    fetch('/api/game-titles')
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        const uniq = ['All', ...new Set(data.map((g) => g.genre).filter(Boolean))];
        setGenres(uniq);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // infinite scroll & back-to-top
  useEffect(() => {
    const onScroll = () => {
      setShowButton(window.scrollY > 300);
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleCount((prev) => prev + 50);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return <p className="text-center mt-4">Loading games…</p>;

  const safeGames = Array.isArray(games) ? games : [];
  const filteredGames = safeGames
    .filter((g) =>
      g.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((g) =>
      selectedGenre === 'All' ? true : g.genre === selectedGenre
    );
  const gamesToShow = filteredGames.slice(0, visibleCount);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <Container className="mt-4">
        <FormControl fullWidth margin="normal">
          <InputLabel id="genre-label">Genre</InputLabel>
          <Select
            labelId="genre-label"
            value={selectedGenre}
            label="Genre"
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setVisibleCount(50);
            }}
          >
            {genres.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
            bottom: 30,
            right: 30,
            zIndex: 1000,
            borderRadius: '50%',
            minWidth: 56,
            minHeight: 56,
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