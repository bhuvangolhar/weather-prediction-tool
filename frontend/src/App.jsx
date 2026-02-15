import React, { useState, useEffect } from 'react';

const App = () => {
  const [weatherType, setWeatherType] = useState('Sunny');
  const [searchInput, setSearchInput] = useState('');
  const [searchedCity, setSearchedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultCities = [
    { city: "New York", temp: 22, condition: "Sunny", wind: "12 km/h", humidity: "45%", aqi: "32", icon: "☀️" },
    { city: "London", temp: 14, condition: "Rainy", wind: "18 km/h", humidity: "82%", aqi: "18", icon: "🌧️" },
    { city: "Tokyo", temp: 19, condition: "Cloudy", wind: "10 km/h", humidity: "60%", aqi: "44", icon: "☁️" },
    { city: "Sydney", temp: 28, condition: "Sunny", wind: "15 km/h", humidity: "30%", aqi: "25", icon: "☀️" },
    { city: "Paris", temp: 16, condition: "Cloudy", wind: "8 km/h", humidity: "55%", aqi: "22", icon: "⛅" },
    { city: "Dubai", temp: 35, condition: "Sunny", wind: "22 km/h", humidity: "15%", aqi: "85", icon: "🌵" },
    { city: "Mumbai", temp: 31, condition: "Rainy", wind: "25 km/h", humidity: "90%", aqi: "110", icon: "⛈️" }
  ];

  const weatherData = searchedCity ? [searchedCity, ...defaultCities] : defaultCities;

  const themeStyles = {
    Sunny: {
      grad: "linear-gradient(135deg, #FF9D6C 0%, #FF62A5 100%)",
      color: "#fff"
    },
    Rain: {
      grad: "linear-gradient(135deg, #203A43 0%, #2C5364 100%)",
      color: "#e0e0e0"
    },
    Snow: {
      grad: "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)",
      color: "#2c3e50"
    },
    Cloudy: {
      grad: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
      color: "#fff"
    },
    Night: {
      grad: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      color: "#fff"
    }
  };

  const handleSearch = async (cityName) => {
    if (!cityName.trim()) {
      setSearchedCity(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/weather?city=${encodeURIComponent(cityName)}`);
      
      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      setSearchedCity(data);
    } catch (err) {
      setError('❌ Could not find city. Make sure backend is running on port 5000');
      setSearchedCity(null);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleSearch(searchInput);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    
    .container {
      min-height: 100vh;
      width: 100%;
      position: relative;
      overflow-x: hidden;
      padding: 2rem;
      transition: background 1s ease;
    }

    /* Animations Layer */
    .animation-layer {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .rain-drop {
      position: absolute;
      background: rgba(255,255,255,0.4);
      width: 2px;
      height: 15px;
      top: -20px;
      animation: rain linear infinite;
    }

    @keyframes rain {
      to { transform: translateY(100vh) translateX(20px); }
    }

    .snow-flake {
      position: absolute;
      background: white;
      border-radius: 50%;
      top: -10px;
      animation: snow linear infinite;
    }

    @keyframes snow {
      to { transform: translateY(100vh) rotate(360deg); }
    }

    .star {
      position: absolute;
      background: white;
      border-radius: 50%;
      animation: twinkle alternate infinite ease-in-out;
    }

    @keyframes twinkle {
      from { opacity: 0.2; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1.2); }
    }

    .sun-ray {
      position: absolute;
      top: -10%; right: -10%;
      width: 40vw; height: 40vw;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
      filter: blur(40px);
      animation: pulse 8s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(1); opacity: 0.5; }
      to { transform: scale(1.3); opacity: 0.8; }
    }

    /* UI Components */
    .content {
      position: relative;
      z-index: 10;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      padding: 4rem 0;
      color: white;
    }

    .hero h1 {
      font-size: 5rem;
      font-weight: 800;
      letter-spacing: -2px;
      margin-bottom: 0.5rem;
    }

    .hero p {
      font-size: 1.5rem;
      opacity: 0.9;
      font-weight: 300;
    }

    .search-container {
      margin: 2rem auto;
      max-width: 500px;
      position: relative;
    }

    .search-bar {
      width: 100%;
      padding: 1.2rem 2rem;
      border-radius: 50px;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: white;
      font-size: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      outline: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .search-bar::placeholder { color: rgba(255,255,255,0.6); }

    .theme-switcher {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .theme-btn {
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: white;
      cursor: pointer;
      transition: 0.3s;
      backdrop-filter: blur(5px);
    }

    .theme-btn:hover, .theme-btn.active {
      background: white;
      color: #000;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-radius: 24px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-10px);
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .card-city { font-size: 1.4rem; font-weight: 600; }
    .card-icon { font-size: 2.5rem; }
    .card-temp { font-size: 3rem; font-weight: 800; margin: 1rem 0; }
    
    .card-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 1rem;
    }

    .stat-item span { display: block; font-weight: 600; opacity: 1; margin-top: 2px; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 3rem; }
      .container { padding: 1rem; }
    }
  `;

  const renderAnimations = () => {
    switch(weatherType) {
      case 'Rain':
        return Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="rain-drop" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.5 + Math.random()}s`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ));
      case 'Snow':
        return Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="snow-flake" style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            opacity: Math.random(),
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ));
      case 'Night':
        return Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            animationDuration: `${1 + Math.random() * 3}s`
          }} />
        ));
      case 'Sunny':
        return <div className="sun-ray" />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="container" style={{ background: themeStyles[weatherType].grad }}>
        <div className="animation-layer">{renderAnimations()}</div>
        
        <div className="content">
          <header className="hero">
            <h1>{searchedCity ? `${searchedCity.temp}°C — ${searchedCity.condition}` : '22°C — Mostly Sunny'}</h1>
            <p>{searchedCity ? `${searchedCity.city}` : 'San Francisco, California'}</p>
            
            <div className="search-container">
              <input 
                type="text" 
                className="search-bar" 
                placeholder="Search for a city..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchSubmit}
              />
            </div>

            {error && <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            {loading && <p style={{ color: 'white', marginTop: '1rem' }}>🔍 Searching...</p>}

            <div className="theme-switcher">
              {Object.keys(themeStyles).map(type => (
                <button 
                  key={type}
                  onClick={() => setWeatherType(type)}
                  className={`theme-btn ${weatherType === type ? 'active' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </header>

          <main className="grid">
            {weatherData.map((data, idx) => (
              <div key={idx} className="card">
                <div className="card-header">
                  <span className="card-city">{data.city}</span>
                  <span className="card-icon">{data.icon}</span>
                </div>
                <div className="card-condition">{data.condition}</div>
                <div className="card-temp">{data.temp}°</div>
                
                <div className="card-stats">
                  <div className="stat-item">
                    Wind
                    <span>{data.wind}</span>
                  </div>
                  <div className="stat-item">
                    Humidity
                    <span>{data.humidity}</span>
                  </div>
                  <div className="stat-item">
                    AQI
                    <span>{data.aqi}</span>
                  </div>
                  <div className="stat-item">
                    RealFeel
                    <span>{data.temp + 2}°</span>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;