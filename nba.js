var config = {
    apiKey: "AIzaSyDK1AVLnaVMyRCENBhqYaM4A3ksu2COK88",
    authDomain: "nba-trade-app.firebaseapp.com",
    databaseURL: "https://nba-trade-app.firebaseio.com",
    storageBucket: "nba-trade-app.appspot.com",
    messagingSenderId: "356411871802"
  };
  firebase.initializeApp(config);

$(document).ready(function() {
	console.log('hi')
})

$('.trade').on('click', function(){
	
	var team1;
	var team2;

	var randomProperty = function (obj) {
	    var keys = Object.keys(obj)
	    return obj[keys[ keys.length * Math.random() << 0]];
	};

	(function getTeams() {
		var team1Temp = randomProperty(nba);
		var team2Temp = randomProperty(nba);
		
		if (team1Temp === team2Temp) {
			getTeams()
		}
		else {
			team1 = team1Temp;
			team2 = team2Temp;
		}
	})();

	(function getPlayers() {
		var players1 = {};
		var players2 = {};
		team1Vorp = 0;
		team2Vorp = 0;

		(function getTeamOne() {
			var oneThroughFour = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
			//pick players for team 1
			for (var i = 0; i < oneThroughFour; i++) {
				var select1 = randomProperty(team1);
				if (select1.VORP > 0) players1[select1.Name] = select1;
				else i--;
			};
			//add up team1 Vorp
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
			var oneThroughFour = Math.random() * (4 - 1) + 1;
			var i = oneThroughFour;

			while (i) {
				i--
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
					//unable to reach value of team1
					safty++;
					if (safty > 50) { //reset
						console.log('TOOOOOO MANY', players1, team1Vorp, players2, team2Vorp)
						getPlayers();
					}
					
				}else {
					console.log('good trade', team1Vorp, team2Vorp, players1, players2)
					render();
					return {players1, players2}
				}
				
			}
		};

		function render() {
			$('li').remove();
			$('li').remove();

			for (prop in players1) {
				$('#left-list').append('<li>' +prop+'</li>')
				};
			for (prop in players2) {
				$('#right-list').append('<li>' +prop+'</li>')
			};
		};
		
	})();
});


