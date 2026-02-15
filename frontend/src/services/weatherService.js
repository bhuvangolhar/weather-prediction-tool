const BACKEND_URL = "http://localhost:5000";

export async function getWeather(city) {
  const res = await fetch(
    `${BACKEND_URL}/api/weather?city=${encodeURIComponent(city)}`
  );

  if (!res.ok) {
    throw new Error("City not found");
  }

  return res.json();
}

export async function getWeatherSuggestions() {
  const res = await fetch(`${BACKEND_URL}/api/suggestions`);
  
  if (!res.ok) {
    throw new Error("Could not fetch suggestions");
  }

  return res.json();
}
