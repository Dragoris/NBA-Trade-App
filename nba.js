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
			getTeams()
		}
		else {
			team1 = team1Temp;
			team2 = team2Temp;
		}
	})();


	(function getPlayers() {

		(function getTeamOne() {
			var oneThroughFour = Math.floor(Math.random() * (3) + 1);
			console.log(oneThroughFour)
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
		$oneWins = $('<button class="onewins">Team One Wins!</button>');
		$twoWins = $('<button class="twowins">Team Two Wins!</button>');
		$realistic = $('<button class="realistic">Realistic Trade</button>');

		$('.voting').append($oneWins, $twoWins, $realistic);
	};
};




$('.trade').on('click', function(){
	generateTrade();
});


