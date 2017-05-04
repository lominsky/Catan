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
var players;
var games;
var currentUser = null;


$( document ).ready(function(){
  $(".button-collapse").sideNav();
});

function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
    } else {
      currentUser = null;
    }
    showView(view_players);
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
  for(i in players) {
    $( "#list_players" ).append( "<li class=\"collection-item list_players_name\">" + players[i] + "</li>" );
  }
}

function updateGames() {
  //console.log(games[0]);
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

function showView(id) {
  hideAllViews();
  id.style.display = "block";
}