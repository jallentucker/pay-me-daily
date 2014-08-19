var fs = require('fs');
var _ = require('lodash');

var batters, pitchers;
var filesRead = 0;

var makePlayersArray = function(dataString) {
	var playerStrings = dataString.split('\r\n');
	return playerStrings.map(function(playerString) {
		var playerArray = playerString.split('\t');
		return [playerArray[0].split('(')[0].trim(), parseFloat(playerArray[15])];
	});
	filesRead++;
};

var makeFanduelArray = function(dataString) {
	var json = JSON.parse(dataString);
	var fanduelArray = _.values(json).map(function(playerArray) {
		return [playerArray[0], playerArray[1], parseInt(playerArray[5])];
	});
	return fanduelArray;
};

// var pickTeam = function(batters, pitchers) {

// };

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, data1) {
	fanduelArray = makeFanduelArray(data1);
	fs.readFile('batters.txt', { encoding: 'utf8' }, function(err, data2) {
		batters = makePlayersArray(data2);
		// for (var i = 80; i < 80; i++) {
		// 	console.log(fanduelArray[i]);
		// }
		fanduelArray = fanduelArray.map(function(playerArray) {
			for (var i = 0; i < batters.length; i++) {
				var batter = batters[i];
				if (batter[0] === playerArray[1]) {
					playerArray.push(batter[1]);
					batters.splice(i, i);
					i = batters.length;
				}
			}
			return playerArray;
		});
		fanduelArray.forEach(function(playerArray) {
			if (playerArray.length === 4) {
				// console.log(playerArray);
			}
		});
	});
	fs.readFile('pitchers.txt', { encoding: 'utf8' }, function(err, data3) {
		pitchers = makePlayersArray(data3);
	});
});
