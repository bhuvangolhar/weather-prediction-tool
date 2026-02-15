import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'free';

app.use(cors());
app.use(express.json());

// Mock weather data for cities (using free API or fallback)
const mockWeatherData = {
  'new york': { city: "New York", temp: 22, condition: "Sunny", wind: "12 km/h", humidity: "45%", aqi: "32", icon: "☀️", lat: 40.7128, lon: -74.0060 },
  'london': { city: "London", temp: 14, condition: "Rainy", wind: "18 km/h", humidity: "82%", aqi: "18", icon: "🌧️", lat: 51.5074, lon: -0.1278 },
  'tokyo': { city: "Tokyo", temp: 19, condition: "Cloudy", wind: "10 km/h", humidity: "60%", aqi: "44", icon: "☁️", lat: 35.6762, lon: 139.6503 },
  'sydney': { city: "Sydney", temp: 28, condition: "Sunny", wind: "15 km/h", humidity: "30%", aqi: "25", icon: "☀️", lat: -33.8688, lon: 151.2093 },
  'paris': { city: "Paris", temp: 16, condition: "Cloudy", wind: "8 km/h", humidity: "55%", aqi: "22", icon: "⛅", lat: 48.8566, lon: 2.3522 },
  'dubai': { city: "Dubai", temp: 35, condition: "Sunny", wind: "22 km/h", humidity: "15%", aqi: "85", icon: "🌵", lat: 25.2048, lon: 55.2708 },
  'mumbai': { city: "Mumbai", temp: 31, condition: "Rainy", wind: "25 km/h", humidity: "90%", aqi: "110", icon: "⛈️", lat: 19.0760, lon: 72.8777 }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather API is running' });
});

// Search weather by city
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const cityKey = city.toLowerCase().trim();

  try {
    // Try real API if key is set and valid
    if (WEATHER_API_KEY !== 'free') {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`,
        { timeout: 5000 }
      );

      const data = response.data;
      return res.json({
        city: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        wind: `${Math.round(data.wind.speed)} km/h`,
        humidity: `${data.main.humidity}%`,
        aqi: "N/A",
        icon: getWeatherIcon(data.weather[0].main.toLowerCase()),
        lat: data.coord.lat,
        lon: data.coord.lon
      });
    }

    // Use mock data as fallback
    if (mockWeatherData[cityKey]) {
      return res.json(mockWeatherData[cityKey]);
    }

    // For unknown cities, generate mock data
    res.json({
      city: city,
      temp: Math.floor(Math.random() * 30) + 5,
      condition: ['Sunny', 'Rainy', 'Cloudy', 'Snow'][Math.floor(Math.random() * 4)],
      wind: `${Math.floor(Math.random() * 30) + 5} km/h`,
      humidity: `${Math.floor(Math.random() * 80) + 20}%`,
      aqi: Math.floor(Math.random() * 200),
      icon: getWeatherIcon('sunny'),
      lat: 0,
      lon: 0
    });
  } catch (error) {
    console.error('Weather API error:', error.message);

    // Return mock data on error
    if (mockWeatherData[cityKey]) {
      return res.json(mockWeatherData[cityKey]);
    }

    res.status(404).json({ error: 'City not found. Try one of: New York, London, Tokyo, Sydney, Paris, Dubai, Mumbai' });
  }
});

// Get all suggested cities
app.get('/api/suggestions', (req, res) => {
  res.json({
    suggestions: Object.values(mockWeatherData).map(d => d.city)
  });
});

function getWeatherIcon(condition) {
  const iconMap = {
    'sunny': '☀️',
    'clear': '☀️',
    'rainy': '🌧️',
    'rain': '🌧️',
    'cloudy': '☁️',
    'cloud': '☁️',
    'snow': '❄️',
    'storm': '⛈️',
    'thunderstorm': '⛈️',
    'windy': '💨',
    'haze': '🌫️',
    'mist': '🌫️'
  };
  return iconMap[condition.toLowerCase()] || '⛅';
}

app.listen(PORT, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
  console.log(`🌍 Use API_KEY=your_key npm start to use OpenWeatherMap API`);
});
