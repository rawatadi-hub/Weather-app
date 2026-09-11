//  For selecting HTML elements
var cityInput = document.getElementById('city-input');
var searchBtn = document.getElementById('search-btn');
var loadingDiv = document.getElementById('loading');
var errorMessage = document.getElementById('error-message');
var weatherCard = document.getElementById('weather-card');

var cityNameEl = document.getElementById('city-name');
var temperatureEl = document.getElementById('temperature');
var descriptionEl = document.getElementById('description');
var humidityEl = document.getElementById('humidity');
var windSpeedEl = document.getElementById('wind-speed');

// Waits for a click on the search button
searchBtn.addEventListener('click', function() {
    var cityName = cityInput.value.trim();
    if (cityName !== "") {
        getWeatherData(cityName);
    }
});

// 3. Main function to fetch weather data 
function getWeatherData(city) {
    loadingDiv.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // Geting latitude and longitude of the city 
    var geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&format=json";

    fetch(geoUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(geoData) {
            // Check if the city was found
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }

            var lat = geoData.results[0].latitude;
            var lon = geoData.results[0].longitude;
            var name = geoData.results[0].name;
            var country = geoData.results[0].country;

            // Using coordinates to fetch the weather
            var weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";
            
            return fetch(weatherUrl)
                .then(function(weatherResponse) {
                    return weatherResponse.json();
                })
                .then(function(weatherData) {
                    // Displaying the weather on the screen
                    displayWeather(name, country, weatherData.current);
                });
        })
        .catch(function(error) {
            // If any errors 
            showError(error.message);
        })
        .finally(function() {
            // Hide the loading spinner after process done
            loadingDiv.classList.add('hidden');
        });
}

// Function to fill the HTML elements with data
function displayWeather(city, country, current) {
    cityNameEl.textContent = city + ", " + country;
    temperatureEl.textContent = current.temperature_2m + "°C";
    humidityEl.textContent = current.relative_humidity_2m;
    windSpeedEl.textContent = current.wind_speed_10m;
    
    descriptionEl.textContent = getWeatherDescription(current.weather_code);

    // Show the card
    weatherCard.classList.remove('hidden');
}

// Function to turn numbers into weather words
function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if (code === 1 || code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 71 && code <= 75) return "Snow";
    if (code >= 95) return "Thunderstorm";
    return "Clear conditions";
}

// Function to show errors
function showError(message) {
    errorMessage.textContent = "City not found. Please check spelling.";
    errorMessage.classList.remove('hidden');
}