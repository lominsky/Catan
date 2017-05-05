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


$( document ).ready(function(){
  $(".button-collapse").sideNav();

  $('select').material_select();
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
    $("#signed_out").css("display", "none")
    $("#signed_in").css("display", "block")

    //Get Players
    var playerDB = firebase.database().ref('players/');
    playerDB.on('value', function(snapshot) {
      players = (snapshot.val());
      updatePlayers();
    });

    //Get Games
    var gameDB = firebase.database().ref('games/');
    gameDB.on('value', function(snapshot) {
      games = (snapshot.val());
      updateGames();
    });

  } else {
    $("#signed_in").css("display", "none")
    $("#signed_out").css("display", "block")
  }
}

function updatePlayers() {
  $( "li" ).remove( ".list_players_name" );
  $( "th" ).remove( ".games_header" );
  $( "option" ).remove( ".selector_name" );
  for(i in players) {
    $( "#list_players" ).append( "<li class=\"collection-item list_players_name\">" + players[i] + "</li>" );
    $( "#table_games_header" ).append("<th class=\"games_header\">" + players[i] + "</th>");
    $( "select" ).append("<option value=\"" + players[i] + "\" class=\"selector_name\">" + players[i] + "</th>");
  }
  $('select').material_select();
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
  $( ".view" ).css("display", "none");
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
  var checkboxes = {
    0: { "road": $("#checkbox_road1").prop('checked'), "army": $("#checkbox_army1").prop('checked') },
    1: { "road": $("#checkbox_road2").prop('checked'), "army": $("#checkbox_army2").prop('checked') },
    2: { "road": $("#checkbox_road3").prop('checked'), "army": $("#checkbox_army3").prop('checked') },
    3: { "road": $("#checkbox_road4").prop('checked'), "army": $("#checkbox_army4").prop('checked') },
  }

  var game = {
    army: [],
    road: [],
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }
  for(i in names) {
    console.log(names[i] + ": " + scores[i])
    if(names[i] = "" && scores[i] != "") {
      console.log(i);
      return false;
    }
    for(j in names[i]) {
      game[names[i][j]] = scores[i];
      if(checkboxes[i].road) {
        game.road.push(names[i][j]);
      }
      if(checkboxes[i].army) {
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
  id.style.display = "block";
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