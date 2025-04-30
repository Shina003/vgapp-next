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
    <Link
      href={`/game-info?title=${encodeURIComponent(title)}`}
      className="text-decoration-none"
    >
      <div className="card shadow-sm p-3 mb-3 rounded-3">
        <h5 className="mb-0">{title}</h5>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [showButton, setShowButton] = useState(false);

  // Fetch games and extract genres
  useEffect(() => {
    fetch('/api/game-titles')
      .then((res) => res.json())
      .then((data) => {
        console.log('API /api/game-titles response:', data);
        // Normalize response into an array
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.games)
          ? data.games
          : [];

        setGames(list);

        // Extract genres robustly: handle both string and array fields
        const rawGenres = list.flatMap((g) => {
          if (Array.isArray(g.genres)) return g.genres;
          if (typeof g.genre === 'string') return [g.genre];
          return [];
        });

        const uniq = Array.from(new Set(rawGenres.filter(Boolean))).sort();
        setGenres(uniq);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Infinite scroll & show-top-button
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setVisibleCount((prev) => prev + 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading games…</p>;
  }

  // Ensure we always filter an array
  const safeGames = Array.isArray(games) ? games : [];

  // Apply text + genre filters
  const filteredGames = safeGames
    .filter(
      (g) =>
        typeof g.title === 'string' &&
        g.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((g) =>
      selectedGenre === 'All' ? true : (g.genre || g.genres || []).includes(selectedGenre)
    );

  const gamesToShow = filteredGames.slice(0, visibleCount);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
            <MenuItem value="All">All</MenuItem>
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