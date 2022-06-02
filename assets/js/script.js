//init function that displays previous searches from local storage
//var savedSearchesObj = JSON.parse(localStorage.getItem("savedSearchesObj")) || [];

$("#game-btn").on("click", gameInputHandler);
$("#genre-btn").on("click", genreInputHandler);
var gamesInfo = [];

function gameInputHandler() {
  var gameInput = $("#game-input").val().trim();
  if (gameInput === "" || null) {
    //alert text if nothing is inputted
    var gameAlertContainerEl = $("#game-alert-container").text("");
    var gameAlertTextEl = $("<p>").text("Please enter a game.");
    gameAlertContainerEl.append(gameAlertTextEl);
  } else {
    gameFetchResponse(gameInput);
  }
}

function genreInputHandler() {
  var genreInput = $("#genre-input").val().trim();
  if (genreInput === "" || null) {
    //alert text if nothing is inputted
    var genreAlertContainerEl = $("#genre-alert-container").text("");
    var genreAlertTextEl = $("<p>").text("Please enter a genre.");
    genreAlertContainerEl.append(genreAlertTextEl);
  } else {
    genreFetchResponse(genreInput);
  }
}

//fetch and response handling for game search (use one API)
function gameFetchResponse(gameInput) {
  var fetchUrl = "https://whatoplay.p.rapidapi.com/search?game=" + gameInput;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "whatoplay.p.rapidapi.com",
      "X-RapidAPI-Key": "29b518b889msh6fc361b3b9aec26p1e1231jsnc655b8c71d9a",
    },
  };

  fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => checkForGame(response))
    .catch((err) => console.error(err)); //200 error (can't connect)

  function checkForGame(response) {
    if (response.length === 0) {
      var gameAlertContainerEl = $("#game-alert-container").text("");
      var gameAlertTextEl = $("<p>").text("No game was found.");
      gameAlertContainerEl.append(gameAlertTextEl);
    } else {
      console.log(response); //replace console log with gameSearchHandler once it works
    }
  }
}

//fetch and response handling for genre search (use a different API, probably gamebomb) (does not currently work)
//my user key for giantbomb: 74396db661dc842e2e30773ee2aa76fbd447cbc1
//----------------------------------------------------------------------------------------

// 1. Call the genres api to get all genres (name, guid)
function genreFetchResponse(genreInput) {
  var genreFetchUrl =
    "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/genres/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1&field_list=guid,name"

  var options = {
    method: "GET",
    headers: {
      "Content-Type": "application/xml",
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
      "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
      "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1",
    },
  };

  fetch(genreFetchUrl, options)
    // .then((response) => response.json())
    .then((response) => console.log(response.text()))
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => console.log(data))
    .catch((err) => console.error(err)); //200 error (can't connect)

  //if response works, genreSearchHandler
  //if 400, genreNotFoundHandler

  // 2. Call the games api (limit 50)
  var gamesFetchUrl =
    "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/games/?api_key=073c2f94ba69540e99d2b7e8b4cd3aebb2d9befb&format=json&sort=number_of_user_reviews:desc&limit=50&field_list=guid,id,name,aliases"

  options = {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
      "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
      "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1",
    },
  };
  var gamesResponse = fetch(gamesFetchUrl, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));

  fetch(gamesFetchUrl, options)
    .then((gamesResponse) => gamesResponse.json())
    .then((gamesResponse) => console.log(gamesResponse))
    .catch((err) => console.error(err));


  // 3. Iterate/loop over the games that we get back
  for (i = 0; i < 50; i++) {
    //    a. Call Game api to get more details about the game, gives us the genre for that game
    var gameFetchUrl =
      "https://cors-anywhere.herokuapp.com/https://www.giantbomb.com/api/game/" + gamesResponse.results[i].guid + "/?api_key=74396db661dc842e2e30773ee2aa76fbd447cbc1&format=json&field_list=genres,name"

    options = {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "http://127.0.0.1:5500/",
        "X-RapidAPI-Host": "https://www.giantbomb.com/api/",
        "X-RapidAPI-Key": "74396db661dc842e2e30773ee2aa76fbd447cbc1",
      },
    };

    fetch(gameFetchUrl, options)
      .then((gameResponse) => gameResponse.json())
      .then((gameResponse) => console.log(gameResponse))
      .catch((err) => console.error(err));

    for (j = 0; j < gameResponse.results.genres.length; j++) {
      //    b. If the genre matches what we are looking for, add that to an array
      if (gameResponse.results.genre[j].name == genreInput) {

        gamesInfo.push(gamesResponse.results[i])
        break
      }
    }
    //    c. Keep looping until we have the number games we want to show (like we want to present the user with 10 action games, loop until we have 10 action games in our array)
    if (gamesInfo.length > 9) {
      break
    }
  }

}


//----------------------------------------------------------------------------------------

//gameSearchHandler
//empty alert container
//save game title to local storage (savedSearchesObj)
//display new saved search to the saved searches buttons
//if saved search already exists, don't create a new button
//display search results (game list)
//event listener on each of the results (probably an <a> tag) that runs fetchReview

//fetchReview
//fetches reveiw using game title as query (whattoplay API)
//if response works, gameHandler
//if 400, gameErrorHandler
//if 200, gameConnectionErrorHandler

//gameReviewHandler
//save game to local storage (savedGamesObj)
//display new saved game to the saved games buttons
//if saved game already exists, dont create a new button
//display game title
//display game reveiw
