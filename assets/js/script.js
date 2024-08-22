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

function appendCITY(event) {
    event.preventDefault();

    const city = document.querySelector('.search-bar').value.trim();

    if (!city) {
        alert('Please enter a city name');
        return;
    }

    const geoAPI = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=c3023f6bd0f4493002d6feb29e0f0be6`;

    fetchData(geoAPI)
        .then(data => {
            const { lat, lon } = data[0];
            const weatherAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=c3023f6bd0f4493002d6feb29e0f0be6`;
            return fetchData(weatherAPI);
        })
        .then(weatherDATA => {
            if (!weatherDATA) return;
    
            const obj = {
                icon: weatherDATA.list[0].weather[0].icon,
                name: weatherDATA.city.name,
                temp: weatherDATA.list[0].main.temp,
                wind: weatherDATA.list[0].wind.speed,
                humi: weatherDATA.list[0].main.humidity
            };
            
            localStorage.setItem('wInfo', JSON.stringify(obj));
            renderWEATHER(obj);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    fetchData(geoAPI)
        .then(data => {
            const { lat, lon } = data[0];
            const dayFORECAST = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=7&appid=c3023f6bd0f4493002d6feb29e0f0be6`;
            return fetchData(dayFORECAST);
        })
        .then(forecastDATA => {
            console.log(forecastDATA)
            const fiveDAY = [];
            for (let i = 0; i <= 4; i++) { // Fixed syntax for loop condition
                const listDATA = forecastDATA.list[i];
          
                const obj = {
                    icon: listDATA.weather[0].icon,
                    date: listDATA.dt_txt,
                    temp: listDATA.main.temp,
                    wind: listDATA.wind.speed,
                    humi: listDATA.main.humidity,
                };
                fiveDAY.push(obj);
            }
            localStorage.setItem('fiveDAY', JSON.stringify(fiveDAY));
        })
}

function renderWEATHER(info) {
    const cityRESULT = document.getElementById('city-result');
    cityRESULT.innerHTML = '';
    const cityELEMENT = document.createElement('div');
    cityELEMENT.className = 'city-box'
    cityELEMENT.innerHTML = `
        <h3>${info.name}</h3><img src="https://openweathermap.org/img/wn/${info.icon}@2x.png">
        <p>Temperature: ${((info.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</p>
        <p>Wind Speed: ${info.wind} MPH</p>
        <p>Humidity: ${info.humi}%</p>
    `;
    cityRESULT.appendChild(cityELEMENT);
}

function renderCAST(infoArray){
    const castRESULT = document.getElementById('forecast-container')
    castRESULT.innerHTML = '';
    infoArray.forEach(info =>{
        const dateTime = info.date; 
        const date = new Date(dateTime); 
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);

        const castELEMENT = document.createElement('div');
        castELEMENT.className = 'forecast-box'
        castELEMENT.innerHTML = `
            <h3>${formattedDate}</h3><img src="https://openweathermap.org/img/wn/${info.icon}@2x.png">
            <p>Temperature: ${((info.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</p>
            <p>Wind Speed: ${info.wind} MPH</p>
            <p>Humidity: ${info.humi}%</p>
    `;
        castRESULT.appendChild(castELEMENT);
    })
}

// Load weather info from local storage if available
const savedWeatherInfo = JSON.parse(localStorage.getItem('wInfo'));
if (savedWeatherInfo) {
    renderWEATHER(savedWeatherInfo);
}

const savedCastINFO = JSON.parse(localStorage.getItem('fiveDAY'))
if(savedCastINFO){
    renderCAST(savedCastINFO)
};

document.getElementById('search-button').addEventListener('click', appendCITY);
