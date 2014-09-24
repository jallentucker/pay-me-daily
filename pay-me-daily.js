var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var qbProjectionColumn = 15;
var rbProjectionColumn = 14;
var wrProjectionColumn = 14;
var teProjectionColumn = 14;
var kProjectionColumn = 16;
var fanduelArray, qbs, rbs, wrs, tes, ks, ds;

var makeFanduelArray = function(dataString) {
	var json = JSON.parse(dataString);
	var fanduelArray = _.values(json).map(function(playerArray) {
		return [playerArray[0], playerArray[1], parseInt(playerArray[5])];
	});
	return fanduelArray;
};

var preparePlayersArray = function(dataString, projectionColumn) {
	var playersArray = makePlayersArray(dataString, projectionColumn);
	playersArray = addSalaries(playersArray);
	playersArray = trimPlayersArray(playersArray);
	playersArray.sort(function(a, b) {
		return b[1] - a[1];
	});
	return playersArray;
};

var makePlayersArray = function(dataString, projectionColumn) {
	var playerStrings = dataString.split('\r\n');
	filesRead++;
	return playerStrings.map(function(playerString) {
		var playerArray = playerString.split('\t');
		return [playerArray[0].split('(')[0].trim(), parseFloat(playerArray[projectionColumn - 1])];
	});
};

var addSalaries = function(playersArray) {
	return playersArray.map(function(playerArray) {
		for (var i = 0; i < fanduelArray.length; i++) {
			var fanduelPlayerArray = fanduelArray[i];
			if (fanduelPlayerArray[1] === playerArray[0]) {
				playerArray.push(fanduelPlayerArray[2]);
				i = fanduelArray.length;
			}
		}
		return playerArray;
	});
};

var trimPlayersArray = function(playersArray) {
	var trimmedPlayersArray = [];
	playersArray.forEach(function(playerArray) {
		if (playerArray.length === 3) {
			trimmedPlayersArray.push(playerArray);
		}
	});
	return trimmedPlayersArray;
};

var pickTeam = function() {

};

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fs.readFile('qbs.txt', { encoding: 'utf8' }, function(err, qbData) {
		qbs = preparePlayersArray(qbData, qbProjectionColumn);
		console.log(qbs);
	});
	fs.readFile('rbs.txt', { encoding: 'utf8' }, function(err, rbData) {
		rbs = preparePlayersArray(rbData, rbProjectionColumn);
		console.log(rbs);
	});
	fs.readFile('wrs.txt', { encoding: 'utf8' }, function(err, wrData) {
		wrs = preparePlayersArray(wrData, wrProjectionColumn);
		console.log(wrs);
	});
	fs.readFile('tes.txt', { encoding: 'utf8' }, function(err, teData) {
		tes = preparePlayersArray(teData, teProjectionColumn);
		console.log(tes);
	});
	fs.readFile('ks.txt', { encoding: 'utf8' }, function(err, kData) {
		ks = preparePlayersArray(kData, kProjectionColumn);
		console.log(ks);
	});
	// fs.readFile('ds.txt', { encoding: 'utf8' }, function(err, dData) {
	// 	ds = makeDsArray(dData);
	// 	ds = addSalaries(ds);
	// 	ds = trimPlayersArray(ds);
	// 	console.log(ds);
	// });
});
