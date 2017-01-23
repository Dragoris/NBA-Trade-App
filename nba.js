function generateTrade(trade) {
	//if passed a trade immediately render it 
	if (trade) {
		renderTrade(trade);
		return
	}

	var team1;
	var team2;
	var teamOne = {};
	var teamTwo = {};
	team1Vorp = 0;
	team2Vorp = 0;

	var randomProperty = function (obj) {
	    var keys = Object.keys(obj)
	    return obj[keys[ keys.length * Math.random() << 0]];
	};


	(function getTeams() {
		var team1Temp = randomProperty(nba);
		var team2Temp = randomProperty(nba);
		
		if (team1Temp === team2Temp) {
			getTeams();
		}
		else {
			team1 = team1Temp;
			team2 = team2Temp;
		}
	})();


	(function getPlayers() {

		(function getTeamOne() {
			var oneThroughThree = Math.floor(Math.random() * (3) + 1);
			//pick players for team 1
			for (var i = 0; i < oneThroughThree; i++) {
				var select1 = randomProperty(team1);
				if (select1.VORP > 0) teamOne[select1.Name] = select1;
				else i--;
			};
			//add up team1 value
			for (var stats in teamOne) {
				team1Vorp += teamOne[stats].VORP
			};
			//filter weak combos
			if (team1Vorp > 0.4) {
				getTeamTwo();
			}else{ //reset
				team1Vorp = 0;
				teamOne = {};
				getTeamOne();
			}
		})();

		function getTeamTwo() {
			var safty = 0;
			var i = 1;

			while (i) {
				i--;
				//pick player
				var select2 = randomProperty(team2);
				
				// add players until balanced
				if (select2.VORP > 0 && team2Vorp + select2.VORP <= 0.2 + team1Vorp) {
					teamTwo[select2.Name] = select2;
					team2Vorp += select2.VORP;
				}

				//when teams are balanced add logos and votes
				//and then render them
				if (Math.abs((team1Vorp - team2Vorp) <= 0.2)) {
					console.log('good trade', team1Vorp, team2Vorp, teamOne, teamTwo);

					renderTrade();

				}else {
					i++;
					//prevents edge case where team2 is 
					//unable to ever reach value of team1
					safty++;
					if (safty > 50) { //reset
						getPlayers();
					}
										
				}
			}
		};
		
	})();

	function renderTrade(trade) {
		
		//reset DOM
		$('.team-one').remove();
		$('.team-two').remove();
		$('.vote-buttons').children().remove();
		$('trade-button').remove();
		$('.question').remove();

		
		if (trade) {
			currentTrade = trade;

		}else {//add logos and format
			currentTrade = {teamOne, teamTwo};

			currentTrade['logoOne'] = team1.Logo;
			currentTrade['votesOne'] = 0;

			currentTrade['logoTwo'] = team2.Logo;
			currentTrade['votesTwo'] = 0;
		};


		//print teams
		var tradeTemplate = Handlebars.compile($("#current-trade").html());
		var compileTradeTemplate = tradeTemplate(currentTrade);
		$('#teams-wrapper').append(compileTradeTemplate);		
		
		//print voting buttons
		var $trade = $('<button class="trade-button"> TRADE</button>')
		var $oneWins = $('<button class="oneWins">Team One Wins!</button>');
		var $twoWins = $('<button class="twoWins">Team Two Wins!</button>');
		var $submit = $('<button class="submit">Submit</button>');
		var $h1 = $('<h1 class="question"> Which Team Won This Trade?</h1>')
		
		$('.voting').append($h1);
		$('.vote-buttons').append($oneWins, $submit, $twoWins);
		
	};

	return {teamOne, teamTwo}

};



var currentTrade;
$('.voting').on('click', '.trade-button', function () {
	generateTrade();
});


var config = {
    apiKey: "AIzaSyDK1AVLnaVMyRCENBhqYaM4A3ksu2COK88",
    authDomain: "nba-trade-app.firebaseapp.com",
    databaseURL: "https://nba-trade-app.firebaseio.com",
    storageBucket: "nba-trade-app.appspot.com",
    messagingSenderId: "356411871802"
  };
firebase.initializeApp(config);



$(document).ready(function() {

	var nbaApp = firebase.database();
	var tradesRef = nbaApp.ref('trades');
	var usersRef = nbaApp.ref('users');
	var auth = firebase.auth();

	var oneVote = false;
	var twoVote = false;

	$('.voting').on('click', '.oneWins', function (){
		oneVote = true;
		twoVote = false;
	});

	$('.voting').on('click', '.twoWins', function (){
		twoVote = true;
		oneVote = false;
	});

	$('.voting').on('click', '.submit', function (){
		console.log('vote', currentTrade)
		if (currentTrade.id) {
			if (oneVote) {
				tradesRef.child(currentTrade.id).update({
				votesOne: currentTrade.votesOne + 1
				})
			}
			if (twoVote) {
				tradesRef.child(currentTrade.id).update({
				votesTwo: currentTrade.votesTwo + 1
				})
			}
		}
		else if (oneVote) {
			tradesRef.push({
				flaged: 0,
				teamOne: currentTrade.teamOne,
				teamTwo: currentTrade.teamTwo,
				logoOne: currentTrade.logoOne,
				logoTwo: currentTrade.logoTwo,
				votesOne: 1,
				votesTwo: 0

			})
		}else if (twoVote) {
			tradesRef.push({
				flaged: 0,
				teamOne: currentTrade.teamOne,
				teamTwo: currentTrade.teamTwo,
				logoOne: currentTrade.logoOne,
				logoTwo: currentTrade.logoTwo,
				votesTwo: 1,
				votesOne: 0
			})
		}
		else console.log('you need to vote first!')
	});

	tradesRef.on('value', function (results) {
		$('.listed-trade').remove();
		
		var data = results.val();

		for (var trade in data) {
			var team1 = {};
			var team2 = {};

			Object.keys(data[trade].teamOne).forEach(function (player) {
				team1[player] = data[trade].teamOne[player];
			});

			Object.keys(data[trade].teamTwo).forEach(function (player) {
				team2[player] = data[trade].teamTwo[player];
			});

			var output = {team1, team2};

				output['id'] = trade;
				output['flagged'] = data[trade].flagged;
				output['votesOne'] = data[trade].votesOne;
				output['votesTwo'] = data[trade].votesTwo;
				output['logoOne'] = data[trade].logoOne;
				output['logoTwo'] = data[trade].logoTwo;

			var boardTemplate = Handlebars.compile($("#trade-board").html());
			var compiledBoard = boardTemplate(output);
			
			$('.previous-trades').append(compiledBoard);
			
		}
	});

	$('.previous-trades').on('click', '.listed-trade, .logo, .vs', function (e) {
		var id = $(e.target).data('id');

		tradeData.ref('/trades/' + id).once('value').then(function(snap) {
		  var snapshot = snap.val();
		  snapshot['id'] = id;
		  generateTrade(snapshot);
		});
		
	});


	$('.log-in').on('click', function () {
		var email = $('#email').val();
		var pass = $('#password').val();

		auth.signInWithEmailAndPassword(email, pass).catch(function (e) {
			console.log(e)
		});

	});

	$('.sign-up').on('click', function () {
		var name = $('#name').val();
		var email = $('#email').val();
		var pass = $('#password').val();


		auth.createUserWithEmailAndPassword(email, pass).catch(function (e) {

			console.log(e, auth.currentUser)
		});

		usersRef.child(auth.currentUser.uid).set({
			userName: name || auth.currentUser.email.replace(/@.*/, ''),
			email: auth.currentUser.email,
			points: 0

		});
		
		

	});
	
	$('.sign-out').on('click', function () {
		auth.signOut();
	})

	auth.onAuthStateChanged(function (firebaseUser) {
		if (firebaseUser) {
			console.log(firebaseUser)
		}else {
			console.log('you need to log in')
		}
	})
});





