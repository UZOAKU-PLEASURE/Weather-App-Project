const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");

const mainIcon = document.getElementById("mainIcon");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const uv = document.getElementById("uv");

const forecastList = document.getElementById("forecastList");


// This function gets the city latitude and longitude
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return data.results[0];
}


// This function gets the weather using latitude and longitude
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&forecast_days=5&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}


// This function changes weather codes into normal words and icons
function getWeatherInfo(code) {
  if (code === 0) {
    return { text: "Sunny", icon: "☀" };
  }

  if (code === 1 || code === 2 || code === 3) {
    return { text: "Partly cloudy", icon: "⛅" };
  }

  if (code === 45 || code === 48) {
    return { text: "Foggy", icon: "🌫" };
  }

  if (code === 51 || code === 53 || code === 55) {
    return { text: "Drizzle", icon: "🌦" };
  }

  if (code === 61 || code === 63 || code === 65) {
    return { text: "Rain", icon: "🌧" };
  }

  if (code === 71 || code === 73 || code === 75) {
    return { text: "Snow", icon: "❄" };
  }

  if (code === 80 || code === 81 || code === 82) {
    return { text: "Rain showers", icon: "🌦" };
  }

  if (code === 95) {
    return { text: "Thunderstorm", icon: "⛈" };
  }

  return { text: "Cloudy", icon: "🌤" };
}


// This function changes UV number into a simple level
function getUvText(number) {
  if (number <= 2) {
    return "Low";
  }

  if (number <= 5) {
    return "Moderate";
  }

  if (number <= 7) {
    return "High";
  }

  if (number <= 10) {
    return "Very High";
  }

  return "Extreme";
}


// This function displays the current weather on the page
function showCurrentWeather(weather, place) {
  const current = weather.current;
  const today = weather.daily;

  const weatherInfo = getWeatherInfo(current.weather_code);

  cityName.textContent = `${place.name}, ${place.country}`;
  mainIcon.textContent = weatherInfo.icon;

  temperature.textContent = Math.round(current.temperature_2m);

  description.textContent = `${weatherInfo.text} • Feels like ${Math.round(current.apparent_temperature)}°C`;

  humidity.textContent = `${current.relative_humidity_2m}%`;
  wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  uv.textContent = getUvText(today.uv_index_max[0]);
}


// This function displays the 5 day forecast
function showForecast(daily) {
  forecastList.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const weatherInfo = getWeatherInfo(daily.weather_code[i]);

    let day = date.toLocaleDateString("en-US", { weekday: "long" });

    if (i === 0) {
      day = "Today";
    }

    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);

    forecastList.innerHTML += `
      <div class="forecast-day">
        <p class="day-name">${day}</p>
        <p class="day-icon">${weatherInfo.icon}</p>
        <p class="day-temp">
          ${high}°
          <small>${low}°</small>
        </p>
      </div>
    `;
  }
}


// This function runs when the user searches for a city
async function searchWeather(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    message.textContent = "Please enter a city name";
    return;
  }

  message.textContent = "Loading...";

  try {
    const place = await getCoordinates(city);
    const weather = await getWeather(place.latitude, place.longitude);

    showCurrentWeather(weather, place);
    showForecast(weather.daily);

    message.textContent = "";
    cityInput.value = "";
  } catch (error) {
    message.textContent = "City not found. Try another city.";
  }
}


// This function loads Lagos weather when the page first opens
async function loadLagosWeather() {
  message.textContent = "Loading...";

  try {
    const place = await getCoordinates("Lagos");
    const weather = await getWeather(place.latitude, place.longitude);

    showCurrentWeather(weather, place);
    showForecast(weather.daily);

    message.textContent = "";
  } catch (error) {
    message.textContent = "Could not load weather.";
  }
}

searchForm.addEventListener("submit", searchWeather);

loadLagosWeather();