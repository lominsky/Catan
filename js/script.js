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

  $('.modal').modal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
    ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
      console.log("Modal Opened");
    },
    complete: function() { 
      console.log('Modal Closed'); 
    } // Callback for Modal close
  });

  $('select').material_select();
});

function init() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
    } else {
      currentUser = null;
    }
    showView(view_games);
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
  for(i in players) {
    $( "#list_players" ).append( "<li class=\"collection-item list_players_name\">" + players[i] + "</li>" );
    $( "#table_games_header" ).append("<th class=\"games_header\">" + players[i] + "</th>");
  }
}

function updateGames() {
  $( "tr" ).remove( ".table_games_row" );
  for(i in games) {
    var date = new Date(games[i].timestamp);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
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

                  //   <tr class="table_games_row">
                  //   <td>Date</td>
                  //   <td>Road</td>
                  //   <td>Army</td>
                  //   <td>Player</td>
                  //   <td>Player</td>
                  //   <td>Player</td>
                  // </tr>
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
  var selects = $('#select_player1').val();
  console.log(selects);
}

function showView(id) {
  hideAllViews();
  clearFields();
  id.style.display = "block";
}

function clearFields() {
  $("#field_new_player").val("");
}