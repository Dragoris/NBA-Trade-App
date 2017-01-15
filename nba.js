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
		
		//reset
		$('.team-one').remove();
		$('.team-two').remove();
		$('.voting').children().remove();

		//add logos and format
		players1["logo"] = team1.Logo;
		players2["logo"] = team2.Logo;
		currentTrade = {players1, players2};
		
		//print teams
		var tradeTemplate = Handlebars.compile($("#current-trade").html());
		var compileTradeTemplate = tradeTemplate(currentTrade);
		$('#display-trade').append(compileTradeTemplate);		
		
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
		if (oneVote) {
			tradeReference.push({
				teamOne: currentTrade.players1,
				teamTwo: currentTrade.players2,
				flaged: 0,
				votesOne: 1,
				votesTwo: 0
			})
		}else if (twoVote) {
			tradeReference.push({
				teamOne: currentTrade.players1,
				teamTwo: currentTrade.players2,
				flaged: 0,
				votesOne: 0,
				votesTwo: 1
			})
		}
		else console.log('you need to vote first!')
	});

	tradeData.ref('trades').on('value', function (results) {
		$('.listed-trade').remove();
		
		var $tradeBoard = $('.trade-board');
		var data = results.val();

		for (var trade in data) {

			var team1 = {};
			var team2 = {};

			Object.keys(data[trade].teamOne).forEach(function (player) {
				team1[player] = data[trade].teamOne[player];
			});
			team1['votes'] = data[trade].votesOne;
			team1['flagged'] = data[trade].flagged;

			Object.keys(data[trade].teamTwo).forEach(function (player) {
				team2[player] = data[trade].teamTwo[player];
			});
			team2['votes'] = data[trade].votesTwo;
			team1['flagged'] = data[trade].flagged;

			var finalOutput = {team1, team2};

			var boardTemplate = Handlebars.compile($("#trade-board").html());
			var compiledBoard = boardTemplate(finalOutput);
			
			$('.board').append(compiledBoard);
		}
	})
});


