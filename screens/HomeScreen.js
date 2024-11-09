import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import SplashScreen from './SplashScreen';
import { ThemeContext } from '../models/ThemeContext'; // Import ThemeContext for dark mode support

const apiKey = 'c929301e'; // OMDB API key

const HomeScreen = ({ navigation }) => {
  // State to handle the search term input by the user
  const [searchTerm, setSearchTerm] = useState('');
  // State to store the list of movies fetched from the API
  const [movies, setMovies] = useState([]);
  // State to store any error messages from API responses
  const [error, setError] = useState(null);
  // State to control the display of the splash screen
  const [showSplash, setShowSplash] = useState(true);
  // State to handle the pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  // Access the current theme mode (dark/light) from ThemeContext
  const { isDarkMode } = useContext(ThemeContext);

  // Effect to hide the splash screen after a set delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSplash(false); // Hide splash screen after 3 seconds
    }, 3000);
    return () => clearTimeout(timeoutId); // Clean up the timeout on unmount
  }, []);

  // Effect to fetch the default movies after the splash screen disappears
  useEffect(() => {
    if (!showSplash) {
      fetchDefaultMovies(); // Fetch movies after splash screen hides
    }
  }, [showSplash]);

  // Function to fetch a default list of movies (e.g., "Avengers") from the OMDB API
  const fetchDefaultMovies = () => {
    setError(null); // Clear any previous errors
  
    // Get the current year to filter movies
    const currentYear = new Date().getFullYear();
  
    // Fetch movies from the current year or recent years
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=boys&y=${currentYear}`)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          setMovies(data.Search); // Store movies in state if fetch is successful
        } else {
          setError(data.Error); // Set error message from API response if any
        }
      })
      .catch(() => {
        setError('An error occurred. Please try again.'); // Handle fetch errors
      });
  };
  

  // Function to search for movies based on the search term input by the user
  const searchMovies = () => {
    setError(null); // Clear any previous errors
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          setMovies(data.Search); // Update movies state with search results
        } else {
          setError(data.Error); // Show error message if no movies are found
        }
      })
      .catch(() => {
        setError('An error occurred. Please try again.'); // Handle fetch errors
      });
  };

  // Function to navigate to the Detail screen with the selected movie's details
  const getMovieDetails = (imdbID) => {
    setError(null); // Clear any previous errors
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
      .then(response => response.json())
      .then(data => {
        navigation.navigate('Detail', { movieDetails: data }); // Pass movie data to Detail screen
      })
      .catch(() => {
        setError('An error occurred. Please try again.'); // Handle fetch errors
      });
  };

  // Function to handle pull-to-refresh action
  const handleRefresh = () => {
    setRefreshing(true); // Set refreshing state to true while fetching new data
    fetchDefaultMovies(); // Fetch the default list of movies again
    setRefreshing(false); // Reset refreshing state once data is fetched
  };

  // Render splash screen initially, then the main UI
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />; // Display splash screen
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFF' }]} // Set background based on theme
      refreshControl={<RefreshControl refreshing ={refreshing} onRefresh={handleRefresh} />} // Pull-to-refresh control
    >
      <SafeAreaView>
        {/* Input field for movie search */}
        <TextInput
          style={[styles.input, { backgroundColor: isDarkMode ? '#333' : '#FFF', color: isDarkMode ? '#FFF' : '#000' }]}
          placeholder="Search for movies"
          placeholderTextColor={isDarkMode ? '#888' : '#333'}
          value={searchTerm}
          onChangeText={text => setSearchTerm(text)}
        />
        {/* Button to trigger movie search */}
        <Button title="Search Movies" onPress={searchMovies} />
        {/* Display error message if any */}
        {error && <Text style={[styles.error, { color: 'red' }]}>{error}</Text>}
        
        {/* List of movies displayed as cards */}
        <View style={styles.resultsContainer}>
          {movies.map(movie => (
            <View key={movie.imdbID} style={styles.movieCard}>
              {/* Movie poster */}
              <Image
                style={styles.poster}
                source={{ uri: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150' }}
              />
              {/* Movie title */}
              <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>{movie.Title}</Text>
              {/* Movie release year */}
              <Text style={[styles.year, { color: isDarkMode ? '#FFF' : '#000' }]}>{movie.Year}</Text>
              {/* Button to view movie details */}
              <Button title="View Details" onPress={() => getMovieDetails(movie.imdbID)} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  resultsContainer: {
    marginTop: 20,
    marginBottom: 70,
  },
  movieCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  year: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
