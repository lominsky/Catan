// Initialize Firebase
var config = {
  apiKey: "AIzaSyAqFilBosdyDMt4l2mIXUHf2eCfo3lMxUE",
  authDomain: "catan-de528.firebaseapp.com",
  databaseURL: "https://catan-de528.firebaseio.com",
  storageBucket: "catan-de528.appspot.com",
  messagingSenderId: "572064042043"
};
firebase.initializeApp(config);

var database = firebase.database();
var players = {};
var games;
var currentUser = null;
var stats;


$( document ).ready(function(){
  $(".button-collapse").sideNav();
  $('select').material_select();
  $('.collapsible').collapsible();
});

function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
    } else {
      currentUser = null;
    }
    showView(view_new_game);
    checkIfLoggedIn();
  });
}

function checkIfLoggedIn() {
  if (currentUser != null) {
    $("#signed_out").addClass("hide");
    $("#signed_in").removeClass("hide");

    //Get Players
    var playerDB = firebase.database().ref('players/');
    playerDB.on('value', function(snapshot) {
      players = (snapshot.val());
      if(players)
        players.sort();
      updatePlayers();
    });

    //Get Games
    var gameDB = firebase.database().ref('games/');
    gameDB.on('value', function(snapshot) {
      games = (snapshot.val());
      if(games)
        games.sort(sortGames);
      updateGames();
    });

  } else {
    $("#signed_in").addClass("hide")
    $("#signed_out").removeClass("hide")
    $( "#password" ).keypress(function(evt) {
      if(event.keyCode == 13) {
        signIn();
      }
    });
  }
}

function sortGames(a, b) {
  return b.timestamp-a.timestamp;
}

function updatePlayers() {
  $( "li" ).remove( ".list_players_name" );
  $( "th" ).remove( ".games_header" );
  $( "option" ).remove( ".selector_name" );
  for(i in players) {
    $( "#list_players" ).append( "<li class=\"list_players_name\"><div class=\"collapsible-header list_players_name\">" + players[i] + "</div><div class=\"collapsible-body list_players_name\"><span>" + players[i] + "</span></div></li>" );
    $( "#list_players" ).append(  );
    $( "#table_games_header" ).append("<th class=\"games_header\">" + players[i] + "</th>");
    $( "select" ).append("<option value=\"" + players[i] + "\" class=\"selector_name\">" + players[i] + "</th>");
  }
  $('select').material_select();
}

function getStats() {
  stats = {};
  for(i in players) 
  {
    var temp = { 
      wins: 0 ,
      games_played: 0
    };
    stats[players[i]] = temp;

  }

  countWins();
  console.log(stats);
}

function countWins() {
  for(i in games) {
    var winners = checkWinner(games[i]);
    for(j in winners) {
      stats[winners[j]].wins++;
    }
  }
}

function findMax(game) {
  var max = 0;
  for(i in players) {
    if(game[players[i]]) {
      stats[players[i]].games_played++;
      if(game[players[i]] > max) {
        max = game[players[i]];
      }
    }
  }
  return max;
}

function checkWinner(game) {
  var max = findMax(game);
  var winners = [];
  for(i in players) {
    if(game[players[i]]) {
      if(game[players[i]] == max) {
        winners.push(players[i]);
      }
    }
  }
  return winners
}

function updateGames() {
  $( "tr" ).remove( ".table_games_row" );
  for(i in games) {
    var date = new Date(games[i].timestamp);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if(!games[i].army) {
      games[i].army = "";
    }
    if(!games[i].road) {
      games[i].road = "";
    }
    var game = "<tr class=\"table_games_row\"><td>" + 
      month + "/" + day + "/" + year + "</td><td>" + games[i].road +
      "</td><td>"  + games[i].army +
      "</td>";
    for(j in players) {
      var name = players[j];
      game += "<td>";
      if(games[i][name]) {
        game += games[i][name];
      } else {
        game += " ";
      }
      game += "</td>";
    }
    $( "#table_games_body" ).append(game);
  }

  getStats();
}

function signIn() {
  var email = $("#email").val();
  var password = $("#password").val();
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode + "\n" + errorMessage);
  });
  $("#email").val("");
  $("#password").val("");
  checkIfLoggedIn();
}

function signOut() {
  firebase.auth().signOut().then(function() {
    checkIfLoggedIn();
  }).catch(function(error) {
    console.log(error);
  });
}

function hideAllViews() {
  $( ".view" ).addClass("hide");
  $( ".nav_link" ).removeClass("active");
  $( ".side_link" ).removeClass("active");
  // $( ".view" ).css( "display", "none" );
}

function addPlayer() {
  var name = $("#field_new_player").val();

  if(name) {
    var updates = {};
    updates['/players/' + players.length] = name;

    firebase.database().ref().update(updates);
    Materialize.toast('Added ' + name, 2000) // 4000 is the duration of the toast
    $("#field_new_player").val("");
  }
}

function addGame() {
  var data = $( ".new_game_data");
  var names = {
    0: ($('#p1_selector').val()),
    1: ($('#p2_selector').val()),
    2: ($('#p3_selector').val()),
    3: ($('#p4_selector').val())
  }

  var scores = {
    0: $("#input_score_p1").val(),
    1: $("#input_score_p2").val(),
    2: $("#input_score_p3").val(),
    3: $("#input_score_p4").val(),
  }
  var radios = {
    0: { "road": $("#radio_road1").prop('checked'), "army": $("#radio_army1").prop('checked') },
    1: { "road": $("#radio_road2").prop('checked'), "army": $("#radio_army2").prop('checked') },
    2: { "road": $("#radio_road3").prop('checked'), "army": $("#radio_army3").prop('checked') },
    3: { "road": $("#radio_road4").prop('checked'), "army": $("#radio_army4").prop('checked') },
  }

  var game = {
    army: [],
    road: [],
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }
  for(i in names) {
    for(j in names[i]) {
      game[names[i][j]] = scores[i];
      if(radios[i].road) {
        game.road.push(names[i][j]);
      }
      if(radios[i].army) {
        game.army.push(names[i][j]);
      }
    }
  }

  var updates = {};
  if(games)
    updates['/games/' + games.length] = game;
  else
    updates['/games/' + 0] = game;

  if(Object.keys(game).length > 3) {
    firebase.database().ref().update(updates);
    Materialize.toast('Added Game (#' + games.length + ')', 2000) // 4000 is the duration of the toast
    showView(view_games);
  }
}

function showView(id) {
  hideAllViews();
  clearFields();
  $("#" + id.id).removeClass("hide");
}

function clearFields() {
  $("#field_new_player").val("");
  $('#p1_selector').val("");
  $('#p2_selector').val("");
  $('#p3_selector').val("");
  $('#p4_selector').val("");
  $('.new_game_data').val("");
  $("input").prop('checked', false);
  $('select').material_select();
}