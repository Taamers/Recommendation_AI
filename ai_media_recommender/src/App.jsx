import React, { useState, useEffect } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [movies, setMovies] = useState([]);
  const genres = {
    '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror',
    '878': 'Sci-Fi', '53': 'Thriller', '16': 'Animation', '12': 'Adventure'
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && !items.includes(inputValue)) {
      setItems([...items, inputValue]);
      setHighlightedItem(inputValue);
      setTimeout(() => setHighlightedItem(null), 2000);
      setInputValue('');
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleAddItem = (title) => {
    if (!items.includes(title)) {
      setItems([...items, title]);
      setHighlightedItem(title);
      setTimeout(() => setHighlightedItem(null), 2000);
    }
  };

  useEffect(() => {
    const fetchTitles = async (genreId) => {
      let allTitles = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
          hasMore = false;
        } else {
          allTitles = [...allTitles, ...data.results];
          page += 1;
          if (allTitles.length >= 25) {
            hasMore = false;
          }
        }
      }

      return allTitles.slice(0, 25);
    };

    const fetchAllGenres = async () => {
      let allMovies = [];
      for (const [genreId, genreName] of Object.entries(genres)) {
        const genreMovies = await fetchTitles(genreId);
        allMovies.push({ genre: genreName, movies: genreMovies });
      }
      setMovies(allMovies);
    };

    fetchAllGenres().catch((error) => console.error('Fetch error:', error));
  }, [TMDB_API_KEY]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '1480px', margin: '0 auto' }}>
      <h1>Item List</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type something and press Enter"
        style={{ padding: '10px', width: '80%', maxWidth: '400px', marginBottom: '20px' }}
      />
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li
            key={index}
            onClick={() => handleRemoveItem(index)}
            style={{
              padding: '10px',
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
              textAlign: 'left',
              maxWidth: '400px',
              margin: '0 auto',
              position: 'relative',
              backgroundColor: highlightedItem === item ? 'lightgreen' : 'transparent',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'lightcoral'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = highlightedItem === item ? 'lightgreen' : 'transparent'}
          >
            {item}
          </li>
        ))}
      </ul>

      {movies.map((genreMovies, genreIndex) => (
        <div key={genreIndex} style={{ textAlign: 'left' }}>
          <h2>{genreMovies.genre}</h2>
          <div style={{ display: 'flex', overflowX: 'scroll', width: '100%' }}>
            {genreMovies.movies && genreMovies.movies.length > 0 ? (
              genreMovies.movies.map((movie) => (
                <div
                  key={movie.id}
                  style={{
                    margin: '10px',
                    cursor: 'pointer',
                    backgroundColor: items.includes(movie.title) ? 'lightgreen' : 'white',
                    transition: 'background-color 0.3s'
                  }}
                  onClick={() => items.includes(movie.title) ? handleRemoveItem(items.indexOf(movie.title)) : handleAddItem(movie.title)}
                  onMouseEnter={(e) => {
                    if (items.includes(movie.title)) {
                      e.currentTarget.style.backgroundColor = 'lightcoral';
                    } else {
                      e.currentTarget.style.backgroundColor = 'lightgray';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (items.includes(movie.title)) {
                      e.currentTarget.style.backgroundColor = 'lightgreen';
                    } else {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} style={{ width: '150px', height: '225px' }} />
                  <p style={{ color: 'black' }}>{movie.title}</p>
                </div>
              ))
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
