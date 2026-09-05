// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const weatherMain = document.getElementById('weatherMain');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Weather Icon Mapping
const weatherIcons = {
  '01d': '☀️',
  '01n': '🌙',
  '02d': '⛅',
  '02n': '☁️',
  '03d': '☁️',
  '03n': '☁️',
  '04d': '☁️',
  '04n': '☁️',
  '09d': '🌧️',
  '09n': '🌧️',
  '10d': '🌦️',
  '10n': '🌧️',
  '11d': '⛈️',
  '11n': '⛈️',
  '13d': '❄️',
  '13n': '❄️',
  '50d': '🌫️',
  '50n': '🌫️'
};

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Utility Functions
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 5000);
}

function showLoading() {
  loadingSpinner.style.display = 'block';
  weatherMain.style.display = 'none';
  welcomeMessage.style.display = 'none';
}

function hideLoading() {
  loadingSpinner.style.display = 'none';
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Fetch Weather Data
async function fetchWeatherByCity(cityName) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/weather/city/${cityName}`);
    
    if (!response.ok) {
      throw new Error('City not found. Please try again.');
    }
    
    const data = await response.json();
    if (data.success) {
      displayWeather(data.data);
      welcomeMessage.style.display = 'none';
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

async function fetchWeatherByCoordinates(lat, lon) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/weather/coordinates?lat=${lat}&lon=${lon}`);
    
    if (!response.ok) {
      throw new Error('Unable to fetch weather data.');
    }
    
    const data = await response.json();
    if (data.success) {
      displayWeather(data.data);
      welcomeMessage.style.display = 'none';
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Display Weather Data
function displayWeather(weatherData) {
  const {
    name,
    sys,
    main,
    weather,
    wind,
    clouds,
    visibility,
    dt
  } = weatherData;

  // Update location and time
  document.getElementById('cityName').textContent = name;
  document.getElementById('lastUpdated').textContent = `Updated: ${formatDate(dt)}`;

  // Update temperature and weather
  document.getElementById('temperature').textContent = Math.round(main.temp);
  document.getElementById('weatherDesc').textContent = weather[0].description;
  document.getElementById('feelsLike').textContent = `Feels like ${Math.round(main.feels_like)}°C`;

  // Update weather icon
  const iconCode = weather[0].icon;
  document.getElementById('weatherIcon').textContent = weatherIcons[iconCode] || '🌤️';

  // Update details
  document.getElementById('humidity').textContent = `${main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${wind.speed} m/s`;
  document.getElementById('pressure').textContent = `${main.pressure} hPa`;
  document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
  document.getElementById('clouds').textContent = `${clouds.all}%`;

  // Update sunrise/sunset
  document.getElementById('sunrise').textContent = formatTime(sys.sunrise);
  document.getElementById('sunset').textContent = formatTime(sys.sunset);

  // Show weather card
  weatherMain.style.display = 'block';
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
    cityInput.value = '';
  } else {
    showError('Please enter a city name.');
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        hideLoading();
        showError('Unable to access your location. Please enable location services.');
      }
    );
  } else {
    showError('Geolocation is not supported by your browser.');
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if the server is running
  fetch(`${API_BASE_URL}/weather/city/London`)
    .catch(() => {
      showError('⚠️ Backend server is not running. Please start the server with "npm start"');
    });
});
