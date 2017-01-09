
var team1;
var team2;

var players1 = {};
var players2 = {};

var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};


function getTeams() {
	var team1Temp = randomProperty(nba);
	var team2Temp = randomProperty(nba);
	
	if (team1Temp === team2Temp) {
		getTeams()
	}
	else {
		team1 = team1Temp;
		team2 = team2Temp;
	}
};


function getPlayers() {
	team1Vorp = 0;
	team2Vorp = 0;

	var oneThroughFour = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
	//pick players for team 1
	for (var i = 0; i < oneThroughFour; i++) {
		var select1 = randomProperty(team1);
		if (select1.VORP > 0) players1[select1.Name] = select1;
		else i--
		
	};
	//add up team1 Vorp
	for (var stats in players1) {
		team1Vorp += players1[stats].VORP
	};

	oneThroughFour = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
	for (var i = 0; i < oneThroughFour; i++) {
		//pick player
		var select2 = randomProperty(team2);
		
		// if adding get you closer to team1, do that
		if (select2.VORP > 0 && team2Vorp + select2.VORP <= 0.2 + team1Vorp) {
			players2[select2.Name] = select2;
			console.log('im helping', team1Vorp, team2Vorp)
			team2Vorp += select2.VORP;
			console.log('after helping', team1Vorp, team2Vorp)
		}
		if (!Object.keys(players2).length) {
			console.log('toooo short')
			i--
		}
		if (team1Vorp > team2Vorp + 0.2 || team2Vorp > team1Vorp + 0.2 || team2Vorp > team1Vorp + 0.2 || team1Vorp > team2Vorp + 0.2) {
			console.log('outside')
			i--
		}else {
			console.log('good trade', team1Vorp, team2Vorp, players1, players2)
			return
		}

	}

	console.log('1',team1Vorp, '2',team2Vorp, players1,players2)
};

getTeams();
getPlayers();

