// Aura Weather Application State Management
const state = {
    currentCity: {
        name: "London",
        country: "United Kingdom",
        lat: 51.5085,
        lon: -0.1257
    },
    weatherData: null,
    airQualityData: null,
    unit: "C", // "C" or "F"
    theme: "light", // "light" or "dark"
    favorites: [] // Array of city objects: { name, country, lat, lon, temp }
};

// DOM Elements
const elements = {
    body: document.body,
    bgBase: document.getElementById("bg-base"),
    bgTransition: document.getElementById("bg-transition"),
    searchInput: document.getElementById("search-input"),
    searchBtn: document.getElementById("search-btn"),
    suggestionsMenu: document.getElementById("suggestions-menu"),
    locateBtn: document.getElementById("locate-btn"),
    themeBtn: document.getElementById("theme-btn"),
    unitC: document.getElementById("unit-c"),
    unitF: document.getElementById("unit-f"),
    favoriteCurrentBtn: document.getElementById("favorite-current-btn"),
    favoritesList: document.getElementById("favorites-list"),
    errorContainer: document.getElementById("error-container"),
    errorMessage: document.getElementById("error-message"),
    errorClose: document.getElementById("error-close"),
    loadingOverlay: document.getElementById("loading-overlay"),
    locationName: document.getElementById("location-name"),
    dateText: document.getElementById("date-text"),
    mainTemp: document.getElementById("main-temp"),
    conditionText: document.getElementById("condition-text"),
    tempRange: document.getElementById("temp-range"),
    tempUnitSymbol: document.getElementById("temp-unit-symbol"),
    heroIconContainer: document.getElementById("hero-icon-container"),
    hourlyTrack: document.getElementById("hourly-track"),
    forecastList: document.getElementById("forecast-list"),
    // Detail cards
    feelsLike: document.getElementById("detail-feels-like"),
    humidity: document.getElementById("detail-humidity"),
    humidityDesc: document.getElementById("detail-humidity-desc"),
    wind: document.getElementById("detail-wind"),
    windDesc: document.getElementById("detail-wind-desc"),
    visibility: document.getElementById("detail-visibility"),
    visibilityDesc: document.getElementById("detail-visibility-desc"),
    uv: document.getElementById("detail-uv"),
    uvDesc: document.getElementById("detail-uv-desc"),
    aqi: document.getElementById("detail-aqi"),
    aqiDesc: document.getElementById("detail-aqi-desc")
};

// Weather Code mapping to UI Condition + Icon Class
// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
function interpretWmoCode(code) {
    if (code === 0) return { label: "Clear sky", icon: "clear" };
    if ([1, 2, 3].includes(code)) return { label: "Partly cloudy", icon: "cloudy" };
    if ([45, 48].includes(code)) return { label: "Foggy", icon: "foggy" };
    if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", icon: "rainy" };
    if ([61, 63, 65].includes(code)) return { label: "Rainy", icon: "rainy" };
    if ([66, 67].includes(code)) return { label: "Freezing rain", icon: "snowy" };
    if ([71, 73, 75, 77].includes(code)) return { label: "Snowy", icon: "snowy" };
    if ([80, 81, 82].includes(code)) return { label: "Showers", icon: "rainy" };
    if ([85, 86].includes(code)) return { label: "Snow showers", icon: "snowy" };
    if ([95, 96, 99].includes(code)) return { label: "Stormy", icon: "stormy" };
    return { label: "Unknown", icon: "cloudy" };
}

// Generate Animated SVGs directly based on mapped icon identifier
function getWeatherIconSVG(icon, size = 100) {
    if (icon === "clear") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <circle cx="32" cy="32" r="13" fill="#fbc531" class="svg-sun-core" style="filter: drop-shadow(0px 0px 8px rgba(251, 197, 49, 0.6))"/>
            <g stroke="#fbc531" stroke-width="3.5" stroke-linecap="round" class="svg-sun-rays">
                <line x1="32" y1="12" x2="32" y2="4"/>
                <line x1="32" y1="52" x2="32" y2="60"/>
                <line x1="12" y1="32" x2="4" y2="32"/>
                <line x1="52" y1="32" x2="60" y2="32"/>
                <line x1="18" y1="18" x2="12" y2="12"/>
                <line x1="46" y1="46" x2="52" y2="52"/>
                <line x1="18" y1="46" x2="12" y2="52"/>
                <line x1="46" y1="18" x2="52" y2="12"/>
            </g>
        </svg>`;
    }
    if (icon === "cloudy") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <g class="svg-sun-core" style="transform-origin: 22px 22px;">
                <circle cx="22" cy="22" r="9" fill="#fbc531" />
                <g stroke="#fbc531" stroke-width="2" stroke-linecap="round" class="svg-sun-rays" style="transform-origin: 22px 22px;">
                    <line x1="22" y1="8" x2="22" y2="3"/>
                    <line x1="22" y1="36" x2="22" y2="41"/>
                    <line x1="8" y1="22" x2="3" y2="22"/>
                    <line x1="36" y1="22" x2="41" y2="22"/>
                </g>
            </g>
            <path d="M46,32 A8,8 0 0,0 38,24 A12,12 0 0,0 16,30 A10,10 0 0,0 18,50 L46,50 A8,8 0 0,0 46,32 Z" fill="rgba(255,255,255,0.45)" class="svg-cloud-back" />
            <path d="M48,36 A7,7 0 0,0 41,29 A10,10 0 0,0 22,34 A8,8 0 0,0 24,50 L48,50 A7,7 0 0,0 48,36 Z" fill="#ffffff" class="svg-cloud" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" />
        </svg>`;
    }
    if (icon === "rainy") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <g stroke="#74b9ff" stroke-width="3" stroke-linecap="round">
                <line x1="26" y1="46" x2="22" y2="54" class="svg-rain-drop-1" />
                <line x1="34" y1="46" x2="30" y2="54" class="svg-rain-drop-2" />
                <line x1="42" y1="46" x2="38" y2="54" class="svg-rain-drop-3" />
            </g>
            <path d="M48,32 A7,7 0 0,0 41,25 A10,10 0 0,0 22,30 A8,8 0 0,0 24,46 L48,46 A7,7 0 0,0 48,32 Z" fill="#ffffff" class="svg-cloud" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" />
        </svg>`;
    }
    if (icon === "stormy") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <path d="M30,42 L24,52 L32,52 L28,62 L40,48 L32,48 Z" fill="#fbc531" class="svg-lightning" style="filter: drop-shadow(0px 0px 4px rgba(251, 197, 49, 0.8))"/>
            <path d="M48,32 A7,7 0 0,0 41,25 A10,10 0 0,0 22,30 A8,8 0 0,0 24,46 L48,46 A7,7 0 0,0 48,32 Z" fill="#95a5a6" class="svg-cloud" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" />
        </svg>`;
    }
    if (icon === "snowy") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <g fill="none" stroke="#74b9ff" stroke-width="2" stroke-linecap="round">
                <g class="svg-snowflake-1">
                    <line x1="22" y1="44" x2="22" y2="50"/>
                    <line x1="19" y1="47" x2="25" y2="47"/>
                </g>
                <g class="svg-snowflake-2">
                    <line x1="38" y1="44" x2="38" y2="50"/>
                    <line x1="35" y1="47" x2="41" y2="47"/>
                </g>
            </g>
            <path d="M48,32 A7,7 0 0,0 41,25 A10,10 0 0,0 22,30 A8,8 0 0,0 24,46 L48,46 A7,7 0 0,0 48,32 Z" fill="#ffffff" class="svg-cloud" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.08))" />
        </svg>`;
    }
    if (icon === "foggy") {
        return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="overflow: visible;">
            <g stroke="#ced6e0" stroke-width="3.5" stroke-linecap="round">
                <line x1="16" y1="26" x2="48" y2="26" class="svg-cloud" style="animation-duration: 4s;"/>
                <line x1="12" y1="34" x2="52" y2="34" class="svg-cloud" style="animation-duration: 5s; animation-delay: 0.5s;"/>
                <line x1="20" y1="42" x2="44" y2="42" class="svg-cloud" style="animation-duration: 3.5s; animation-delay: 0.9s;"/>
            </g>
        </svg>`;
    }
    return "";
}

// Convert temperature values dynamically
function formatTemp(celsius) {
    if (state.unit === "F") {
        return Math.round((celsius * 1.8) + 32);
    }
    return Math.round(celsius);
}

// Format Date string nicely
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric"
    });
}

function getDayName(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }
    return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Air Quality scale evaluation
function getAqiLevel(aqi) {
    if (aqi <= 50) return { badge: "level-good", text: "Good" };
    if (aqi <= 100) return { badge: "level-moderate", text: "Moderate" };
    if (aqi <= 150) return { badge: "level-unhealthy-sensitive", text: "Sensitive Groups" };
    if (aqi <= 200) return { badge: "level-unhealthy", text: "Unhealthy" };
    if (aqi <= 300) return { badge: "level-very-unhealthy", text: "Very Unhealthy" };
    return { badge: "level-hazardous", text: "Hazardous" };
}

// UV index evaluation
function getUvLevel(uv) {
    if (uv <= 2) return { badge: "level-good", text: "Low" };
    if (uv <= 5) return { badge: "level-moderate", text: "Moderate" };
    if (uv <= 7) return { badge: "level-unhealthy-sensitive", text: "High" };
    if (uv <= 10) return { badge: "level-unhealthy", text: "Very High" };
    return { badge: "level-hazardous", text: "Extreme" };
}

// Set dynamic backgrounds based on weather code and time of day
function updateBackground(weatherCode, isDay) {
    let activeGradient = "var(--sky-afternoon)";
    const currentHour = new Date().getHours();
    const condition = interpretWmoCode(weatherCode).icon;

    if (condition === "rainy" || condition === "stormy") {
        activeGradient = condition === "stormy" ? "var(--sky-stormy)" : "var(--sky-rainy)";
    } else if (condition === "snowy") {
        activeGradient = "var(--sky-snowy)";
    } else {
        // Clear or Cloudy transitions by time of day
        if (!isDay) {
            activeGradient = "var(--sky-night)";
        } else {
            if (currentHour >= 5 && currentHour < 12) {
                activeGradient = "var(--sky-morning)";
            } else if (currentHour >= 12 && currentHour < 17) {
                activeGradient = "var(--sky-afternoon)";
            } else if (currentHour >= 17 && currentHour < 21) {
                activeGradient = "var(--sky-sunset)";
            } else {
                activeGradient = "var(--sky-night)";
            }
        }
    }

    // Double-bg crossfade transition logic
    elements.bgTransition.style.background = activeGradient;
    elements.bgTransition.style.opacity = "1";

    setTimeout(() => {
        elements.bgBase.style.background = activeGradient;
        document.documentElement.style.setProperty('--active-sky', activeGradient);
        elements.bgTransition.style.opacity = "0";
    }, 600);
}

// Render dynamic elements to UI
function renderWeather() {
    const current = state.weatherData.current;
    const daily = state.weatherData.daily;
    const hourly = state.weatherData.hourly;
    const interp = interpretWmoCode(current.weather_code);

    // Apply main backgrounds
    updateBackground(current.weather_code, current.is_day);

    // Location & Date
    elements.locationName.innerHTML = `<span>${state.currentCity.name}</span> <span style="font-size: 0.95rem; opacity: 0.6; background: var(--glass-border); padding: 2px 8px; border-radius: 8px;">${state.currentCity.country}</span>`;
    
    // Check if the location is already a favorite
    const isFav = state.favorites.some(f => 
        Math.abs(f.lat - state.currentCity.lat) < 0.01 && 
        Math.abs(f.lon - state.currentCity.lon) < 0.01
    );
    if (isFav) {
        elements.favoriteCurrentBtn.style.color = "#fbc531";
    } else {
        elements.favoriteCurrentBtn.style.color = "var(--text-primary)";
    }

    // Date
    elements.dateText.textContent = formatDate(current.time);

    // Hero stats
    elements.mainTemp.textContent = formatTemp(current.temperature_2m);
    elements.tempUnitSymbol.textContent = "°" + state.unit;
    elements.conditionText.textContent = interp.label;
    elements.tempRange.textContent = `H: ${formatTemp(daily.temperature_2m_max[0])}° L: ${formatTemp(daily.temperature_2m_min[0])}°`;

    // Large Animated Icon
    elements.heroIconContainer.innerHTML = getWeatherIconSVG(interp.icon, 140);

    // Render Detail Grid Cards
    elements.feelsLike.textContent = `${formatTemp(current.apparent_temperature)}°${state.unit}`;
    
    elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    elements.humidityDesc.textContent = `The air has a moisture level of ${Math.round(current.relative_humidity_2m)}%`;

    // Wind Speed and Angle direction mapping
    const windSpeed = current.wind_speed_10m;
    const windDir = current.wind_direction_10m;
    const getWindDirectionStr = (deg) => {
        const index = Math.round(deg / 45) % 8;
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[index];
    };
    elements.wind.textContent = `${windSpeed} km/h`;
    elements.windDesc.textContent = `Blowing from the ${getWindDirectionStr(windDir)} (${windDir}°)`;

    // Visibility mapping (Open-Meteo returns in meters usually, let's process accordingly)
    const rawVisibility = current.visibility || 10000;
    const visKm = (rawVisibility / 1000).toFixed(1);
    elements.visibility.textContent = `${visKm} km`;
    elements.visibilityDesc.textContent = visKm >= 10 ? "Perfectly clear view" : "Slightly reduced visibility";

    // UV Index card
    const uvVal = daily.uv_index_max[0] || 0;
    elements.uv.textContent = uvVal.toFixed(1);
    const uvEval = getUvLevel(uvVal);
    elements.uvDesc.innerHTML = `<span class="level-badge ${uvEval.badge}">${uvEval.text}</span>`;

    // AQI index
    if (state.airQualityData && state.airQualityData.current) {
        const aqiVal = state.airQualityData.current.us_aqi || 0;
        elements.aqi.textContent = Math.round(aqiVal);
        const aqiEval = getAqiLevel(aqiVal);
        elements.aqiDesc.innerHTML = `<span class="level-badge ${aqiEval.badge}">${aqiEval.text}</span>`;
    } else {
        elements.aqi.textContent = "N/A";
        elements.aqiDesc.textContent = "Air quality data unavailable";
    }

    // Render Hourly Slider (24 hours starting from current hour)
    elements.hourlyTrack.innerHTML = "";
    // Find index of current hour
    const nowHourStr = new Date(current.time).getHours();
    // Fetch nearest hours
    for (let i = 0; i < 24; i++) {
        const itemHourStr = hourly.time[i];
        const itemHour = new Date(itemHourStr);
        const temp = hourly.temperature_2m[i];
        const code = hourly.weather_code[i];
        const hInterp = interpretWmoCode(code);

        const timeLabel = i === 0 ? "Now" : itemHour.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });

        const hourlyItem = document.createElement("div");
        hourlyItem.className = "hourly-item";
        hourlyItem.innerHTML = `
            <span class="hourly-time">${timeLabel}</span>
            <div class="hourly-icon">${getWeatherIconSVG(hInterp.icon, 32)}</div>
            <span class="hourly-temp">${formatTemp(temp)}°</span>
        `;
        elements.hourlyTrack.appendChild(hourlyItem);
    }

    // Render 7-day forecast
    elements.forecastList.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const dayLabel = i === 0 ? "Today" : getDayName(daily.time[i]);
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const code = daily.weather_code[i];
        const dInterp = interpretWmoCode(code);

        const forecastItem = document.createElement("div");
        forecastItem.className = "forecast-item";
        forecastItem.innerHTML = `
            <span class="forecast-day">${dayLabel}</span>
            <div class="forecast-icon">${getWeatherIconSVG(dInterp.icon, 28)}</div>
            <span class="forecast-condition">${dInterp.label}</span>
            <div class="forecast-temps">
                <span class="temp-min">${formatTemp(minTemp)}°</span>
                <span class="temp-max">${formatTemp(maxTemp)}°</span>
            </div>
        `;
        elements.forecastList.appendChild(forecastItem);
    }
}

// API Fetch Core Functions
async function fetchWeatherData(lat, lon) {
    try {
        elements.loadingOverlay.classList.add("active");
        
        // Parallel requests for weather forecast and air quality index
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
        
        const [weatherRes, aqiRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(aqiUrl).catch(() => null) // Suppress AQI failures to load weather at least
        ]);

        if (!weatherRes.ok) throw new Error("Weather forecast service error");

        state.weatherData = await weatherRes.json();
        
        if (aqiRes && aqiRes.ok) {
            state.airQualityData = await aqiRes.json();
        } else {
            state.airQualityData = null;
        }

        renderWeather();
        hideError();
    } catch (err) {
        showError("Unable to fetch weather forecast details. Please check network connection.");
        console.error(err);
    } finally {
        elements.loadingOverlay.classList.remove("active");
    }
}

// Fetch suggestions from Geocoding API
let debounceTimer;
async function fetchCitySuggestions(query) {
    clearTimeout(debounceTimer);
    if (!query || query.trim().length < 2) {
        elements.suggestionsMenu.classList.remove("active");
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
            if (!res.ok) return;

            const data = await res.json();
            if (!data.results || data.results.length === 0) {
                elements.suggestionsMenu.classList.remove("active");
                return;
            }

            elements.suggestionsMenu.innerHTML = "";
            data.results.forEach(city => {
                const region = city.admin1 ? `${city.admin1}, ` : "";
                const country = city.country || "";
                
                const item = document.createElement("div");
                item.className = "suggestion-item";
                item.innerHTML = `
                    <div>
                        <strong>${city.name}</strong>
                        <span style="font-size: 0.8rem; display:block; opacity: 0.7;">${region}${country}</span>
                    </div>
                    <span class="country-code">${city.country_code || "Loc"}</span>
                `;

                item.addEventListener("click", () => {
                    elements.suggestionsMenu.classList.remove("active");
                    elements.searchInput.value = city.name;
                    
                    state.currentCity = {
                        name: city.name,
                        country: city.country || "",
                        lat: city.latitude,
                        lon: city.longitude
                    };

                    fetchWeatherData(city.latitude, city.longitude);
                });

                elements.suggestionsMenu.appendChild(item);
            });

            elements.suggestionsMenu.classList.add("active");
        } catch (err) {
            console.error("Geocoding Error: ", err);
        }
    }, 300);
}

// Search direct action handler
async function handleSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) return;

    elements.suggestionsMenu.classList.remove("active");
    elements.loadingOverlay.classList.add("active");

    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
        if (!res.ok) throw new Error("Search service failed");

        const data = await res.json();
        if (!data.results || data.results.length === 0) {
            throw new Error(`City "${query}" not found.`);
        }

        const city = data.results[0];
        state.currentCity = {
            name: city.name,
            country: city.country || "",
            lat: city.latitude,
            lon: city.longitude
        };

        await fetchWeatherData(city.latitude, city.longitude);
    } catch (err) {
        showError(err.message || "Failed to search location.");
    } finally {
        elements.loadingOverlay.classList.remove("active");
    }
}

// Reverse Geocoding with OpenStreetMap Nominatim
async function getCityNameFromCoords(lat, lon) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
                "User-Agent": "AuraWeatherApp/1.0"
            }
        });
        if (!res.ok) return "Current Location";
        const data = await res.json();
        const address = data.address;
        const cityName = address.city || address.town || address.village || address.suburb || "Current Location";
        const countryName = address.country || "";
        return { name: cityName, country: countryName };
    } catch (err) {
        console.error(err);
        return { name: "Current Location", country: "" };
    }
}

// Geolocation fetch current coords
function getGeoLocation() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    elements.loadingOverlay.classList.add("active");

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const locDetails = await getCityNameFromCoords(lat, lon);
        
        state.currentCity = {
            name: locDetails.name,
            country: locDetails.country,
            lat: lat,
            lon: lon
        };

        await fetchWeatherData(lat, lon);
    }, (err) => {
        elements.loadingOverlay.classList.remove("active");
        let msg = "Location request blocked. Please search manually.";
        if (err.code === err.PERMISSION_DENIED) {
            msg = "Location permission denied. Please search manually.";
        }
        showError(msg);
    }, { timeout: 10000 });
}

// Favorites management
function loadFavorites() {
    const saved = localStorage.getItem("aura_favorites");
    if (saved) {
        state.favorites = JSON.parse(saved);
    } else {
        // Defaults to London & Tokyo & New York
        state.favorites = [
            { name: "London", country: "United Kingdom", lat: 51.5085, lon: -0.1257 },
            { name: "New York", country: "United States", lat: 40.7143, lon: -74.006 },
            { name: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 }
        ];
        saveFavorites();
    }
    renderFavorites();
}

function saveFavorites() {
    localStorage.setItem("aura_favorites", JSON.stringify(state.favorites));
}

// Quick fetch temperatures for favorites list to make it premium
async function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = `<div class="favorites-empty">No favorite locations saved yet.</div>`;
        return;
    }

    elements.favoritesList.innerHTML = "";
    
    // Render list structure first
    state.favorites.forEach((fav, index) => {
        const item = document.createElement("div");
        item.className = "favorite-item";
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="favorite-item-info">
                <span class="favorite-city-name">${fav.name}</span>
                <span style="font-size: 0.75rem; opacity: 0.7;">${fav.country}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="favorite-temp" id="fav-temp-${index}">--°</span>
                <button class="delete-favorite-btn" title="Remove from favorites">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;

        // Click on fav item selects it
        item.addEventListener("click", (e) => {
            if (e.target.closest(".delete-favorite-btn")) {
                e.stopPropagation();
                state.favorites.splice(index, 1);
                saveFavorites();
                renderFavorites();
                // update current UI state
                renderWeather();
                return;
            }
            state.currentCity = {
                name: fav.name,
                country: fav.country,
                lat: fav.lat,
                lon: fav.lon
            };
            fetchWeatherData(fav.lat, fav.lon);
        });

        elements.favoritesList.appendChild(item);
        
        // Async fetch individual current temperatures for favorites
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${fav.lat}&longitude=${fav.lon}&current=temperature_2m`)
            .then(res => res.json())
            .then(data => {
                const tempVal = data.current.temperature_2m;
                const element = document.getElementById(`fav-temp-${index}`);
                if (element) {
                    element.textContent = `${formatTemp(tempVal)}°`;
                }
            })
            .catch(() => {});
    });
}

function toggleFavoriteCurrent() {
    const isFavIndex = state.favorites.findIndex(f => 
        Math.abs(f.lat - state.currentCity.lat) < 0.01 && 
        Math.abs(f.lon - state.currentCity.lon) < 0.01
    );

    if (isFavIndex >= 0) {
        // Remove
        state.favorites.splice(isFavIndex, 1);
        elements.favoriteCurrentBtn.style.color = "var(--text-primary)";
    } else {
        // Add
        state.favorites.push({
            name: state.currentCity.name,
            country: state.currentCity.country,
            lat: state.currentCity.lat,
            lon: state.currentCity.lon
        });
        elements.favoriteCurrentBtn.style.color = "#fbc531";
    }

    saveFavorites();
    renderFavorites();
}

// General UI Event Listeners
function setupEventListeners() {
    // Search suggestions and inputs
    elements.searchInput.addEventListener("input", (e) => {
        fetchCitySuggestions(e.target.value);
    });

    elements.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    elements.searchBtn.addEventListener("click", handleSearch);

    // Close suggestions on outside click
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-wrapper")) {
            elements.suggestionsMenu.classList.remove("active");
        }
    });

    // Locate current button
    elements.locateBtn.addEventListener("click", getGeoLocation);

    // Units switcher
    elements.unitC.addEventListener("click", () => {
        if (state.unit !== "C") {
            state.unit = "C";
            elements.unitC.classList.add("active");
            elements.unitF.classList.remove("active");
            if (state.weatherData) {
                renderWeather();
                renderFavorites();
            }
        }
    });

    elements.unitF.addEventListener("click", () => {
        if (state.unit !== "F") {
            state.unit = "F";
            elements.unitF.classList.add("active");
            elements.unitC.classList.remove("active");
            if (state.weatherData) {
                renderWeather();
                renderFavorites();
            }
        }
    });

    // Theme toggler (Light/Dark Mode)
    elements.themeBtn.addEventListener("click", () => {
        if (state.theme === "light") {
            state.theme = "dark";
            elements.body.classList.remove("light-theme");
            elements.body.classList.add("dark-theme");
            elements.themeBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: #ffeaa7;"></i>`;
        } else {
            state.theme = "light";
            elements.body.classList.remove("dark-theme");
            elements.body.classList.add("light-theme");
            elements.themeBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        }
    });

    // Favorites click
    elements.favoriteCurrentBtn.addEventListener("click", toggleFavoriteCurrent);

    // Errors closer
    elements.errorClose.addEventListener("click", hideError);
}

// Error handling helpers
function showError(msg) {
    elements.errorMessage.textContent = msg;
    elements.errorContainer.classList.add("active");
    // Auto hide after 6 seconds
    setTimeout(hideError, 6000);
}

function hideError() {
    elements.errorContainer.classList.remove("active");
}

// Initialize Application
function init() {
    setupEventListeners();
    loadFavorites();
    
    // Load initial default city weather
    fetchWeatherData(state.currentCity.lat, state.currentCity.lon);
}

// Launch on DOM content loaded
document.addEventListener("DOMContentLoaded", init);
