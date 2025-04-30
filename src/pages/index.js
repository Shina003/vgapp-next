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
  const [publishers, setPublishers] = useState(['All']);
  const [years, setYears] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    fetch('/api/game-titles')
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setGenres(['All', ...new Set(data.map((g) => g.genre).filter(Boolean))]);
        setPublishers(['All', ...new Set(data.map((g) => g.publisher).filter(Boolean))]);
        setYears([
          'All',
          ...Array.from(new Set(data.map((g) => g.release_year)))
            .sort((a, b) => a - b)
            .map((y) => String(y))
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error loading games:', err);
        setLoading(false);
      });
  }, []);

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

  const filteredGames = games
    .filter((g) => g.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((g) => (selectedGenre === 'All' ? true : g.genre === selectedGenre))
    .filter((g) => (selectedPublisher === 'All' ? true : g.publisher === selectedPublisher))
    .filter((g) => (selectedYear === 'All' ? true : String(g.release_year) === selectedYear))
    .slice(0, visibleCount);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <Container className="mt-4">
        {/* Genre Filter */}
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
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Publisher Filter */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="publisher-label">Publisher</InputLabel>
          <Select
            labelId="publisher-label"
            value={selectedPublisher}
            label="Publisher"
            onChange={(e) => {
              setSelectedPublisher(e.target.value);
              setVisibleCount(50);
            }}
          >
            {publishers.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Release Year Filter */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="year-label">Release Year</InputLabel>
          <Select
            labelId="year-label"
            value={selectedYear}
            label="Release Year"
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setVisibleCount(50);
            }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Input */}
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

        {/* Game List */}
        <div>
          {filteredGames.map((game) => (
            <GameCard key={`${game.title}-${game.release_year}`} title={game.title} />
          ))}
        </div>

        {/* Top Button (inline) */}
        {showButton && (
          <div className="text-center mt-3">
            <Button onClick={scrollToTop} variant="outlined">
              ↑ Top
            </Button>
          </div>
        )}
      </Container>

      {/* Fixed Back to Top */}
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