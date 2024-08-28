// Function to fetch data from a given URL
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to handle the city search, update weather, and forecast
function handleCitySearch(event) {
    event.preventDefault();

    // Get city name from the search input
    const cityName = document.querySelector('.search-bar').value.trim();

    if (!cityName) {
        alert('Please enter a city name');
        return;
    }

    // API endpoint to get latitude and longitude for the city
    const geoAPIUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=c3023f6bd0f4493002d6feb29e0f0be6`;

    // Fetch latitude and longitude from the geoAPI
    fetchData(geoAPIUrl)
        .then(data => {

            const { lat, lon } = data[0]; // Get latitude and longitude
            // API endpoint to get current weather for the city
            const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=c3023f6bd0f4493002d6feb29e0f0be6`;
            return fetchData(weatherAPIUrl);
        })
        .then(weatherData => {
            // Check if weather data is available
            if (!weatherData) return;

            // Extract relevant weather information
            const weatherInfo = {
                icon: weatherData.list[0].weather[0].icon,
                name: weatherData.city.name,
                temperature: weatherData.list[0].main.temp,
                windSpeed: weatherData.list[0].wind.speed,
                humidity: weatherData.list[0].main.humidity
            };

            // Save weather info to localStorage and render it
            localStorage.setItem('weatherInfo', JSON.stringify(weatherInfo));
            renderWeather(weatherInfo);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    // Fetch 5-day forecast for the city
    fetchData(geoAPIUrl)
        .then(data => {
            // Check if data is available
            if (!data.length) return;

            const { lat, lon } = data[0]; // Get latitude and longitude
            // API endpoint to get 5-day forecast
            const forecastAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=7&appid=c3023f6bd0f4493002d6feb29e0f0be6`;
            return fetchData(forecastAPIUrl);
        })
        .then(forecastData => {
            // Check if forecast data is available
            if (!forecastData) return;

            const fiveDayForecast = [];
            // Extract relevant forecast information
            for (let i = 0; i <= 4; i++) { 
                const forecastItem = forecastData.list[i];

                const forecastInfo = {
                    icon: forecastItem.weather[0].icon,
                    date: forecastItem.dt_txt,
                    temperature: forecastItem.main.temp,
                    windSpeed: forecastItem.wind.speed,
                    humidity: forecastItem.main.humidity,
                };
                fiveDayForecast.push(forecastInfo);
            }

            // Save 5-day forecast to localStorage
            localStorage.setItem('fiveDayForecast', JSON.stringify(fiveDayForecast));
        });
}

// Function to render current weather information
function renderWeather(weatherInfo) {
    const weatherResultContainer = document.getElementById('city-result');
    weatherResultContainer.innerHTML = ''; // Clear existing content

    const weatherElement = document.createElement('div');
    weatherElement.className = 'city-box';
    weatherElement.innerHTML = `
        <h3>${weatherInfo.name}</h3>
        <img src="https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png">
        <p>Temperature: ${((weatherInfo.temperature - 273.15) * 9/5 + 32).toFixed(2)}°F</p>
        <p>Wind Speed: ${weatherInfo.windSpeed} MPH</p>
        <p>Humidity: ${weatherInfo.humidity}%</p>
    `;
    weatherResultContainer.appendChild(weatherElement);
}

// Function to render 5-day weather forecast
function renderForecast(forecastArray) {
    const forecastResultContainer = document.getElementById('forecast-container');
    forecastResultContainer.innerHTML = ''; // Clear existing content

    forecastArray.forEach(forecastInfo => {
        const forecastDate = new Date(forecastInfo.date); 
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = forecastDate.toLocaleDateString('en-US', options);

        const forecastElement = document.createElement('div');
        forecastElement.className = 'forecast-box';
        forecastElement.innerHTML = `
            <h3>${formattedDate}</h3>
            <img src="https://openweathermap.org/img/wn/${forecastInfo.icon}@2x.png">
            <p>Temperature: ${((forecastInfo.temperature - 273.15) * 9/5 + 32).toFixed(2)}°F</p>
            <p>Wind Speed: ${forecastInfo.windSpeed} MPH</p>
            <p>Humidity: ${forecastInfo.humidity}%</p>
        `;
        forecastResultContainer.appendChild(forecastElement);
    });
}

// Load and render saved weather information from localStorage
const savedWeatherInfo = JSON.parse(localStorage.getItem('weatherInfo'));
if (savedWeatherInfo) {
    renderWeather(savedWeatherInfo);
}

// Load and render saved 5-day forecast from localStorage
const savedFiveDayForecast = JSON.parse(localStorage.getItem('fiveDayForecast'));
if (savedFiveDayForecast) {
    renderForecast(savedFiveDayForecast);
}

// Add event listener for search button
document.getElementById('search-button').addEventListener('click', handleCitySearch);
