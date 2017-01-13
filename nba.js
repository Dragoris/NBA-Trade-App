function generateTrade() {

	var team1;
	var team2;
	var players1 = {};
	var players2 = {};
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
			var oneThroughFour = Math.floor(Math.random() * (3) + 1);
			//pick players for team 1
			for (var i = 0; i < oneThroughFour; i++) {
				var select1 = randomProperty(team1);
				if (select1.VORP > 0) players1[select1.Name] = select1;
				else i--;
			};
			//add up team1 value
			for (var stats in players1) {
				team1Vorp += players1[stats].VORP
			};
			//filter weak combos
			if (team1Vorp > 0.4) {
				getTeamTwo();
			}else{ //reset
				team1Vorp = 0;
				players1 = {};
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
					players2[select2.Name] = select2;
					team2Vorp += select2.VORP;
				}

				//when teams are balanced render them
				if (team1Vorp > team2Vorp + 0.2 || team2Vorp > team1Vorp + 0.2 || team2Vorp > team1Vorp + 0.2 || team1Vorp > team2Vorp + 0.2) {
					i++;

					//prevents edge case where team2 is 
					//unable to ever reach value of team1
					safty++;
					if (safty > 50) { //reset
						getPlayers();
					}

				}else {
					console.log('good trade', team1Vorp, team2Vorp, players1, players2);

					renderTrade();					
				}
			}
		};
		
	})();

	function renderTrade() {
		// $messageListElement.attr('data-id', msg)
		//reset
		$('.player').remove();
		$('.voting').children().remove();
		
		//print team 1
		var template1 = Handlebars.compile($("#players").html());
		var compileTemplate1 = template1(players1);
		$('#left-list').append(compileTemplate1);
		
		//print team 2
		var template2 = Handlebars.compile($("#players2").html());
		var compileTemplate2 = template2(players2);
		$('#right-list').append(compileTemplate2);
		
		//print voting buttons
		var $oneWins = $('<button class="onewins">Team One Wins!</button>');
		var $twoWins = $('<button class="twowins">Team Two Wins!</button>');
		var $realistic = $('<button class="realistic">Realistic Trade</button>');

		$('.voting').append($oneWins, $twoWins, $realistic);
	};

	return {players1, players2}

};



var currentTrade;

$('.trade').on('click', function (){
	currentTrade = generateTrade();
});


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

	$('.voting').on('click', '.onewins', function (){
		oneVote = true;
		twoVote = false;
		console.log('One Wins!');
	})

	$('.voting').on('click', '.twowins', function (){
		twoVote = true;
		oneVote = false;
		console.log('Two Wins!');
	});

	$('.voting').on('click', '.realistic', function (){
		console.log('vote', currentTrade)
		if (oneVote||twoVote) {
			tradeReference.push({
				teamOne: currentTrade.players1,
				teamTwo: currentTrade.players2,
				oneVote: oneVote,
				twoVote: twoVote
			})
		}else console.log('you need to vote first!')
	});

	tradeData.ref('trades').on('value', function (results) {
		var $tradeBoard = $('.trade-board');
		var allTrades = results.val();
		

		for (var trade in allTrades) {

			var team1 = {};
			var team2 = {};

			var team1List = Object.keys(allTrades[trade].teamOne).forEach(function (player) {
				team1[player] = allTrades[trade].teamOne[player];
			});

			var team2List = Object.keys(allTrades[trade].teamTwo).forEach(function (player) {
				team2[player] = allTrades[trade].teamTwo[player];
			});

			var finalOutput = {team1, team2};

			var boardTemplate = Handlebars.compile($("#trade-board").html());
			var compiledBoard = boardTemplate(finalOutput);
			
			$('.board').append(compiledBoard);
		}
	})
});