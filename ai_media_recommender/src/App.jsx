import React, { useState, useEffect } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
function App() {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations]=useState([]);
  const [visibleCount, setVisibleCount] = useState(4)
  const genres = {
    '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror',
    '878': 'Sci-Fi', '53': 'Thriller', '16': 'Animation', '12': 'Adventure'
  };

  const fetchRecommendations = async(movies) => {
    const recommendationsList=[];
    for(const movie of movies){
      // console.log("movie id is: " + movie.id)
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/recommendations?language=en-US&page=1&api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      // console.log("data is: " + data)
      // console.log("num of recs: " + data.results.length);
      recommendationsList.push(...data.results);
    }
    setRecommendations(recommendationsList.slice(0,12));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && !items.includes(inputValue)) {
      setItems([...items, inputValue]);
      setHighlightedItem(inputValue);
      setTimeout(() => setHighlightedItem(null), 2000);
      setInputValue('');
        
    }
  };

  const handleRemoveItem = (movieId) => {
    // const newItems = [...items];
    // newItems.splice(index, 1);
    // setItems(newItems);
    setItems((prevItems) => prevItems.filter(item => item.id !== movieId));
  };

  const handleAddItem = (movie) => {
    console.log(movie.title)
    // add the entire movie object, not just the title
    if (!items.some(item => item.id === movie.id)) { // id for uniqueness
      setItems(prevItems => [...prevItems, { title: movie.title, id: movie.id }]); // add movie object w title and id
      setHighlightedItem(movie.title);
      setTimeout(() => setHighlightedItem(null), 2000);
  }
};
  const handleRecMovieClick = () => {
    fetchRecommendations(items)
  };
  const handleShowMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 4, 12)); 
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
    <div style={{ display:'flex', padding: '20px', textAlign: 'center', maxWidth: '80vw', margin: '0 auto' }}>
      <div style={{flex:1,textAlign:'center', paddingRight:'20px', maxWidth:'100%'}}>
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
            onClick={() => handleRemoveItem(item.id)}
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
            {item.title}
          </li>
        ))}
      </ul>
      <button onClick={handleRecMovieClick}>Recommend Movies</button>

      {movies.map((genreMovies, genreIndex) => (
        <div key={`${genreMovies.id}-${genreIndex}`} style={{ textAlign: 'left' }}>
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
                  onClick={() => {
                      const isInList=items.some(item=>item.id===movie.id);
                      isInList ? handleRemoveItem(movie.id) : handleAddItem(movie)
                    }
                  }
                  onMouseEnter={(e) => {
                    if (items.includes(movie.id)) {
                      e.currentTarget.style.backgroundColor = 'lightcoral';
                    } else {
                      e.currentTarget.style.backgroundColor = 'lightgray';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const isInList=items.some(item=>item.id===movie.id);
                    e.currentTarget.style.backgroundColor = isInList ? 'lightgreen' : 'white';
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
      <div style={{flex:1, paddingLeft: '3vw', textAlign:'center', width:"20%"}}>
        <h2>Recommendations</h2>
        {recommendations.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {recommendations.slice(0, visibleCount).map((recommendation) => (
              <li key={recommendation.id}>
                <img src={`https://image.tmdb.org/t/p/w500${recommendation.poster_path}`} alt={recommendation.title} style={{ width: '150px', height: '225px' }}/>
                <p>{recommendation.title}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recs available</p>
        )}
        {visibleCount < recommendations.length && (
          <button style={{flex:1}}onClick={handleShowMore}>Show More</button>
        )}
      </div>

    </div>
    
  );
}

export default App;
