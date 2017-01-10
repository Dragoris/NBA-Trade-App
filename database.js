var config = {
    apiKey: "AIzaSyDK1AVLnaVMyRCENBhqYaM4A3ksu2COK88",
    authDomain: "nba-trade-app.firebaseapp.com",
    databaseURL: "https://nba-trade-app.firebaseio.com",
    storageBucket: "nba-trade-app.appspot.com",
    messagingSenderId: "356411871802"
  };
firebase.initializeApp(config);

var tradeData = firebase.database();

$(document).ready(function() {
	var tradeReference = tradeData.ref('trades');
	var oneVote = false;
	var twoVote = false;

	$('.onewins').on('click', function (){
		oneVote = true;
		console.log('One Wins!')
	})

	$('.twowins').on('click', function (){
		twoVote = true;
		console.log('Two Wins!')
	});

	$('.realistic').on('click', function (){
		if (oneVote||twoVote) {
			tradeData.push({
				teamOne: players1, 
				teamTwo: players2,
				vote: oneVote||twoVote
			})
		}else console.log('you need to vote first!')
	});
});