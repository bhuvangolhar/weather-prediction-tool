import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.WEATHER_API_KEY || null;

app.use(cors());
app.use(express.json());

// Geocoding cache for city coordinates
const geocodeCache = {};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather API is running' });
});

// Get city coordinates using Open-Meteo Geocoding API (free, no key needed)
async function getCoordinates(city) {
  if (geocodeCache[city.toLowerCase()]) {
    return geocodeCache[city.toLowerCase()];
  }

  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: city,
        count: 1,
        language: 'en',
        format: 'json'
      },
      timeout: 5000
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const coords = {
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude
      };
      geocodeCache[city.toLowerCase()] = coords;
      return coords;
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

// Get weather using Open-Meteo (free API, no key required!)
async function getRealWeather(latitude, longitude, cityName) {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        temperature_unit: 'celsius',
        timezone: 'auto'
      },
      timeout: 5000
    });

    const current = response.data.current;
    const condition = getWeatherCondition(current.weather_code);
    
    return {
      city: cityName,
      temp: Math.round(current.temperature_2m),
      condition: condition,
      wind: `${Math.round(current.wind_speed_10m)} km/h`,
      humidity: `${current.relative_humidity_2m}%`,
      aqi: 'N/A',
      icon: getWeatherIcon(condition),
      lat: latitude,
      lon: longitude
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return null;
  }
}

// Search weather by city
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // Get city coordinates
    const coords = await getCoordinates(city);
    
    if (!coords) {
      return res.status(404).json({ error: `City "${city}" not found. Try another spelling.` });
    }

    // Get weather data using Open-Meteo
    const weatherData = await getRealWeather(coords.latitude, coords.longitude, coords.name);
    
    if (!weatherData) {
      return res.status(500).json({ error: 'Could not fetch weather data' });
    }

    return res.json(weatherData);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get all suggested cities
app.get('/api/suggestions', (req, res) => {
  res.json({
    suggestions: ['New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Dubai', 'Mumbai']
  });
});

// WMO Weather interpretation codes
function getWeatherCondition(code) {
  const conditions = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Heavy Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail'
  };
  return conditions[code] || 'Unknown';
}

function getWeatherIcon(condition) {
  const iconMap = {
    'Clear': '☀️',
    'Mostly Clear': '☀️',
    'Partly Cloudy': '⛅',
    'Cloudy': '☁️',
    'Foggy': '🌫️',
    'Drizzle': '🌧️',
    'Rain': '🌧️',
    'Slight Rain': '🌧️',
    'Moderate Rain': '🌧️',
    'Heavy Rain': '⛈️',
    'Snow': '❄️',
    'Slight Snow': '❄️',
    'Moderate Snow': '❄️',
    'Heavy Snow': '❄️',
    'Thunderstorm': '⛈️'
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (condition.includes(key)) {
      return icon;
    }
  }
  return '⛅';
}

app.listen(PORT, () => {
  console.log(`🌍 Weather API running on http://localhost:${PORT}`);
  console.log('✅ Using Open-Meteo (FREE, no API key needed!)');
  console.log('📍 Supports any city in the world');
});
