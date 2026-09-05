require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to fetch weather data
const fetchWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

// Helper function to get coordinates from city name
const getCoordinates = async (cityName) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
    );
    if (response.data.length === 0) throw new Error('City not found');
    return {
      lat: response.data[0].lat,
      lon: response.data[0].lon,
      name: response.data[0].name,
      country: response.data[0].country
    };
  } catch (error) {
    throw new Error('City not found');
  }
};

// Routes
app.get('/api/weather/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const coords = await getCoordinates(cityName);
    const weather = await fetchWeatherData(coords.lat, coords.lon);
    
    res.json({
      success: true,
      data: {
        ...weather,
        location: `${coords.name}, ${coords.country}`
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/weather/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const weather = await fetchWeatherData(lat, lon);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/forecast/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const coords = await getCoordinates(cityName);
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather Dashboard running on http://localhost:${PORT}`);
  console.log(`API Key configured: ${API_KEY ? '✓' : '✗'}`);
});

module.exports = app;
