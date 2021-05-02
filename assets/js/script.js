//*** GLOBAL VARIABLES ***//
let cities = [];

//*** API REQUEST INITIATORS***//
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

//Clears the search-history
$("#clear-city-names").on("click", function () {
  cities = [];
  saveCities();
  renderCities();
});

//***FUNCTION TO CONVERT CITY TO LAT/LONG */
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

  //Pushes City to Array for LocalStorage
  if (cities.indexOf(city) === -1) {
    cities.push(city);
  }
  saveCities();
  renderCities();
}

//FUNCTION TO RETRIEVE WEATHER DATA
function getWeather(response) {
  let long = response.features[0].center[0];
  let lat = response.features[0].center[1];
  let foundName = response.features[0].text;
  const APIKey = "add2b16241bd6f82cc25e92250e30478";
  let weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=imperial&exclude=minutely,hourly,alerts&appid=${APIKey}`;

  $.ajax({
    url: weatherURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    displayWeather(response, foundName);
  });
}

/***LOCAL STORAGE***/
//Load from Local Storage
function init() {
  let storedCities = JSON.parse(localStorage.getItem("cities"));
  renderCities();

  if (storedCities !== null) {
    cities = storedCities;
  }
}
//Save to Local Storage
function saveCities() {
  localStorage.setItem("cities", JSON.stringify(cities));
}

// Displaying the Weather Information
function displayWeather(response, foundName) {
  //Display Current Weather
  function currentWeather() {
    let currentDate = moment().format("l");
    let currentIcon = response.current.weather[0].icon;
    let currentTemp = Math.round(response.current.temp * 10) / 10;
    let currentHumidity = response.current.humidity;
    let currentWind = Math.round(response.current.wind_speed * 10) / 10;
    let currentUV = response.current.uvi;
    let currentIconEl = $("<img>").attr(
      "src",
      `https://openweathermap.org/img/w/${currentIcon}.png`
    );
    //append to page
    $("#city-name")
      .text(foundName + " (" + currentDate + ")")
      .append(currentIconEl);
    $("#city-temp").text(currentTemp);
    $("#city-humidity").text(currentHumidity);
    $("#city-wind").text(currentWind);
    $("#city-uv").text(currentUV);

    //UV Index colorizer
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

  //Display 5-Day Forecast
  function forecastWeather() {
    //resets the cards
    $("#forecast").empty();
    for (var i = 1; i < 6; i++) {
      //convert the unix timestamp given by the weather fetch into month-day-year variable
      let unix_timestamp = response.daily[i].dt;
      var milliseconds = unix_timestamp * 1000;
      var dateObject = new Date(milliseconds);
      var date = dateObject.toLocaleString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      //remaining variables
      let iconSource = response.daily[i].weather[0].icon;
      let cardTemp = Math.round(response.daily[i].temp.day * 10) / 10;
      let cardHumidity = response.daily[i].humidity;
      let cardWind = Math.round(response.daily[i].wind_speed * 10) / 10;
      //append to page
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

//Display Previously Searched Cities
function renderCities() {
  // Clear city names element before updating.
  $("#search-history").empty();

  cities.forEach((city) => {
    let cityCard = $("<div>").attr("class", "card");
    let cityCardBody = $("<div>").attr("class", "card-body city").text(city);
    cityCard.append(cityCardBody);
    $("#search-history").prepend(cityCard);
  });
}

init();
