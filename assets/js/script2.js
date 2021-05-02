//*** Variables ***//
let cities = [];
//Test Fetches
/*fetch(
  `https://api.openweathermap.org/data/2.5/onecall?lat=30.2711&lon=-97.7437&units=imperial&exclude=minutely,hourly,alerts&appid=add2b16241bd6f82cc25e92250e30478`
)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  });
fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=Austin,us&units=imperial&appid=add2b16241bd6f82cc25e92250e30478`
)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  });
*/

//*** API Requests ***//

$("#search-btn").on("click", function (event) {
  event.preventDefault();

  var city = $("#search-input").val();
  convertCity(city);
});

$("#search-history").on("click", ".city", function (event) {
  event.preventDefault();

  var city = $(this).text();
  convertCity(city);
});

$("#clear-city-names").on("click", function () {
  // Clear the city names array
  cities = [];
  saveCities();
  renderCities();
});

//converts city input to lat and long
function convertCity(city) {
  const APIKey =
    "pk.eyJ1IjoiYXdlZ2hvcnN0IiwiYSI6ImNrbnpianptdzAyYWkzMG85aG52NHY2YnYifQ.XX_caU54wujSY7FkrRplrA";
  let geocodingURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${APIKey}`;

  $.ajax({
    url: geocodingURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    getWeather(response);
  });

  if (cities.indexOf(city) === -1) {
    cities.push(city);
  }

  saveCities();
  renderCities();
}

//uses lat and long to find weather data
function getWeather(response) {
  let long = response.features[0].center[0];
  let lat = response.features[0].center[1];
  let foundName = response.features[0].text;
  const APIKey = "166a433c57516f51dfab1f7edaed8413";

  let weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=imperial&exclude=minutely,hourly,alerts&appid=${APIKey}`;

  $.ajax({
    url: weatherURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    displayWeather(response, foundName);
  });
}

function updateCityName(foundName) {
  $("#city-name").text(foundName);
}
function init() {
  // Parsing the JSON string to an object
  let storedCities = JSON.parse(localStorage.getItem("cities"));

  // If high scores were retrieved from localStorage, update highScores array to it.
  if (storedCities !== null) {
    cities = storedCities;
  }
}

function saveCities() {
  // Save city names.
  localStorage.setItem("cities", JSON.stringify(cities));
}

// Displaying the Weather Information
function displayWeather(response, foundName) {
  //Display Current Weather
  function currentWeather() {
    let cityName = $("#search-input").val();
    let currentDate = moment().format("l");
    let currentIcon = response.current.weather[0].icon;
    let currentTemp = response.current.temp;
    let currentHumidity = response.current.humidity;
    let currentWind = response.current.wind_speed;
    let currentUV = response.current.uvi;
    let currentIconEl = $("<img>").attr(
      "src",
      `https://openweathermap.org/img/w/${currentIcon}.png`
    );
    $("#city-name")
      .text(foundName + " (" + currentDate + ")")
      .append(currentIconEl);
    $("#city-temp").text(currentTemp);
    $("#city-humidity").text(currentHumidity);
    $("#city-wind").text(currentWind);
    $("#city-uv").text(currentUV);

    //Color UV Index
    //Test additional UV indexes
    //currentUV = 13;
    if (currentUV < 3) {
      $("#city-uv").attr("class", "uv-low");
    }
    if (currentUV >= 3 && currentUV < 6) {
      $("#city-uv").attr("class", "uv-moderate");
    }
    if (currentUV >= 6 && currentUV < 8) {
      $("#city-uv").attr("class", "uv-high");
    }
    if (currentUV >= 8 && currentUV < 11) {
      $("#city-uv").attr("class", "uv-veryhigh");
    }
    if (currentUV >= 11) {
      $("#city-uv").attr("class", "uv-extreme");
    }
  }

  //Display Forecast
  function forecastWeather() {
    $("#forecast").empty();
    for (var i = 1; i < 6; i++) {
      let unix_timestamp = response.daily[i].dt;
      var milliseconds = unix_timestamp * 1000;
      var dateObject = new Date(milliseconds);
      var date = dateObject.toLocaleString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });

      let iconSource = response.daily[i].weather[0].icon;
      let cardTemp = response.daily[i].temp.day;
      let cardHumidity = response.daily[i].humidity;
      let cardWind = response.daily[i].wind_speed;

      let cardEl = $("<div>").attr("class", "card");
      let cardBodyEl = $("<div>").attr("class", "card-body five-card");
      let cardTitleEl = $("<h4>").attr("class", "card-title").text(date);
      let cardIcon = $("<img>").attr(
        "src",
        `https://openweathermap.org/img/w/${iconSource}.png`
      );
      let cardTempEl = $("<p>")
        .attr("class", "card-text")
        .text(`Temp: ${cardTemp} °F`);
      let cardWindEl = $("<p>")
        .attr("class", "card-text")
        .text(`Wind: ${cardWind} MPH`);
      let cardHumidEl = $("<p>")
        .attr("class", "card-text")
        .text(`Humidity: ${cardHumidity}%`);
      cardEl.append(cardBodyEl);
      cardBodyEl
        .append(cardTitleEl)
        .append(cardIcon)
        .append(cardTempEl)
        .append(cardWindEl)
        .append(cardHumidEl);
      $("#forecast").append(cardEl);
    }
  }
  currentWeather();
  forecastWeather();
}
/*
function showFiveDayWeather(response) {
  // Display 5-day weather report

  // Clear deck before updating
  $("#forecast").empty();
  for (let i = 6; i < 40; i += 8) {
    let cardDate = response.list[i].dt_txt;
    let date = new Date(cardDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    let cardTemp = response.list[i].main.temp;
    let cardWind = response.list[i].wind.speed;
    let cardHumid = response.list[i].main.humidity;
    let iconSource = response.list[i].weather[0].icon;

    let cardEl = $("<div>").attr("class", "card");
    let cardBodyEl = $("<div>").attr("class", "card-body five-card");
    let cardTitleEl = $("<h6>").attr("class", "card-title").text(date);
    let cardIcon = $("<img>").attr(
      "src",
      `https://openweathermap.org/img/w/${iconSource}.png`
    );
    let cardTempEl = $("<p>")
      .attr("class", "card-text")
      .text(`Temp: ${cardTemp} °F`);
    let cardWindEl = $("<p>")
      .attr("class", "card-text")
      .text(`Temp: ${cardWind} MPH`);
    let cardHumidEl = $("<p>")
      .attr("class", "card-text")
      .text(`Humidity: ${cardHumid}%`);
    cardEl.append(cardBodyEl);
    cardBodyEl
      .append(cardTitleEl)
      .append(cardIcon)
      .append(cardTempEl)
      .append(cardWindEl)
      .append(cardHumidEl);
    $("#forecast").append(cardEl);
  }
}
*/

function renderCities() {
  // Clear city names element before updating.
  $("#search-history").empty();

  // Render city names
  cities.forEach((city) => {
    let cityCard = $("<div>").attr("class", "card");
    let cityCardBody = $("<div>").attr("class", "card-body city").text(city);
    cityCard.append(cityCardBody);
    $("#search-history").prepend(cityCard);
  });
}

init();
