var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var quarterbackProjectionColumn = 15;
var tailbackProjectionColumn = 14;
var wideoutProjectionColumn = 14;
var tightEndProjectionColumn = 14;
var kickerProjectionColumn = 16;
var fanduelArray, quarterbacks, tailbacks, wideouts, tightEnds, kickers, defenses;
var quarterback = [];
var tailbackOne = [];
var tailbackTwo = [];
var wideoutOne = [];
var wideoutTwo = [];
var wideoutThree = [];
var tightEnd = [];
var kicker = [];
var defense = [];
var quarterbackIndex = 0;
var tailbackIndex = 0;
var wideoutIndex = 0;
var tightEndIndex = 0;
var kickerIndex = 0;
var salaryCap = 40000;
var capSpace = salaryCap;
var totalProjection = 0;

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
	playersArray.sort(function(a, b) {
		return b[1] - a[1];
	});
	playersArray = trimPlayersArray(playersArray);
	return playersArray;
};

var makePlayersArray = function(dataString, projectionColumn) {
	filesRead++;
	var playerStrings = dataString.split('\r\n');
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

var prepareEfficientArray = function(playersArray) {
	for (var i = 1; i < playersArray.length; i++) {
		if (playersArray[i][2] >= playersArray[i - 1][2]) {
			playersArray.splice(i, 1);
			i--;
		}
	}
	return playersArray;
};

var pickBestPossiblePlayers = function() {
	quarterback = quarterbacks[quarterbackIndex];
	tailbackOne = tailbacks[tailbackIndex];
	wideoutOne = wideouts[wideoutIndex];
	tightEnd = tightEnds[tightEndIndex];
	kicker = kickers[kickerIndex];
	totalProjection = quarterback[1] + tailbackOne[1] + wideoutOne[1] + tightEnd[1] + kicker[1];
	capSpace = salaryCap - quarterback[2] - tailbackOne[2] - wideoutOne[2] - tightEnd[2] - kicker[2];
	if (capSpace >= 0) {
		console.log('QB is ' + quarterback[0]);
		console.log('RB1 is ' + tailbackOne[0]);
		console.log('WR1 is ' + wideoutOne[0]);
		console.log('TE is ' + tightEnd[0]);
		console.log('K is ' + kicker[0]);
		console.log('Total projection is ' + totalProjection + ' points');
		console.log('Cap space is $' + capSpace);
	} else {
		kickerIndex++;
		if (kickers[kickerIndex]) {
			pickBestPossiblePlayers();
		} else {
			kickerIndex = 0;
			tightEndIndex++;
			if (tightEnds[tightEndIndex]) {
				pickBestPossiblePlayers();
			} else {
				tightEndIndex = 0;
				wideoutIndex++;
				console.log('test');
				pickBestPossiblePlayers();
			}
		}
	}
};

var pickTeam = function() {
	if (filesRead === 5) {
		quarterbacks = prepareEfficientArray(quarterbacks);
		tailbacks = prepareEfficientArray(tailbacks);
		wideouts = prepareEfficientArray(wideouts);
		tightEnds = prepareEfficientArray(tightEnds);
		kickers = prepareEfficientArray(kickers);
		pickBestPossiblePlayers();
	}
};

// var updateEfficientWRsArray = function(inefficientWRs) {
// 	wrs = inefficientWRs;
// 	for (s = 0; s < wrs.length; s++) {
// 		if(wrs[s] === wr1) {
// 			wrs.splice(s, 1);
// 			s--;
// 		}
// 	}
// 	return prepareEfficientArray(wrs);
// };

// var pickTeam = function() {
// 	var capSpace = salaryCap;
// 	if (filesRead === 5) {
// 		console.log('picking team now');
// 		qbs = prepareEfficientArray(qbs);
// 		console.log(qbs);
// 		wrs = prepareEfficientArray(wrs);
// 		console.log(wrs);
// 		for (var i = 0; i < qbs.length; i++) {
// 			qb = qbs[i];
// 			capSpace = capSpace - qb[2];
// 			tes = prepareEfficientArray(tes);
// 			for (var j = 0; j < tes.length; j++) {
// 				te = tes[j];
// 				capSpace = capSpace - te[2];
// 				ks = prepareEfficientArray(ks);
// 				for (var l = 0; l < ks.length; l++) {
// 					k = ks[l];
// 					capSpace = capSpace - k[2];
// 					var inefficientRBs = rbs;
// 					rbs = prepareEfficientArray(rbs);
// 					for (var m = 0; m < rbs.length; m++) {
// 						rb1 = rbs[m];
// 						capSpace = capSpace - rb1[2];
// 						rbs = inefficientRBs;
// 						for (r = 0; r < rbs.length; r++) {
// 							if (rbs[r] === rb1) {
// 								rbs.splice(r, 1);
// 								r--;
// 							}
// 						}
// 						rbs = prepareEfficientArray(rbs);
// 						for (var n = 0; n < rbs.length; n++) {
// 							rb2 = rbs[n];
// 							capSpace = capSpace - rb2[2];
// 							var inefficientWRs = wrs;
// 							wrs = prepareEfficientArray(wrs);
// 							for (var o = 0; o < wrs.length; o++) {
// 								if (wrs[o][2] <= capSpace) {
// 									wr1 = wrs[o];
// 									capSpace = capSpace - wr1[2];
// 									wrs = updateEfficientWRsArray(inefficientWRs);
// 									for (var p = 0; p < wrs.length; p++) {
// 										if (wrs[p][2] <= capSpace) {
// 											wr2 = wrs[p];
// 											capSpace = capSpace - wr2[2];
// 											wrs = inefficientWRs;
// 											for (t = 0; t < wrs.length; t++) {
// 												if(wrs[t] === wr1 || wrs[t] === wr2) {
// 													wrs.splice(t, 1);
// 													t--;
// 												}
// 											}
// 											wrs = prepareEfficientArray(wrs);
// 											for (var q = 0; q < wrs.length; q++) {
// 												if (wrs[q][2] <= capSpace) {
// 													wr3 = wrs[q];
// 													capSpace = capSpace - wr3[2];
// 													console.log('QB is ' + qb[0]);
// 													console.log('RB1 is ' + rb1[0]);
// 													console.log('RB2 is ' + rb2[0]);
// 													console.log('WR1 is ' + wr1[0]);
// 													console.log('WR2 is ' + wr2[0]);
// 													console.log('WR3 is ' + wr3[0]);
// 													console.log('TE is ' + te[0]);
// 													console.log('K is ' + k[0]);
// 													console.log('Cap Space is ' + capSpace);
// 													q = wrs.length;
// 													p = wrs.length;
// 													o = wrs.length;
// 													n = rbs.length;
// 													m = rbs.length;
// 													l = ks.length;
// 													j = tes.length;
// 													i = qbs.length;
// 												}
// 											}
// 										}
// 									}
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// };

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fs.readFile('qbs.txt', { encoding: 'utf8' }, function(err, quarterbackData) {
		quarterbacks = preparePlayersArray(quarterbackData, quarterbackProjectionColumn);
		pickTeam();
	});
	fs.readFile('rbs.txt', { encoding: 'utf8' }, function(err, tailbackData) {
		tailbacks = preparePlayersArray(tailbackData, tailbackProjectionColumn);
		pickTeam();
	});
	fs.readFile('wrs.txt', { encoding: 'utf8' }, function(err, wideoutData) {
		wideouts = preparePlayersArray(wideoutData, wideoutProjectionColumn);
		pickTeam();
	});
	fs.readFile('tes.txt', { encoding: 'utf8' }, function(err, tightEndData) {
		tightEnds = preparePlayersArray(tightEndData, tightEndProjectionColumn);
		pickTeam();
	});
	fs.readFile('ks.txt', { encoding: 'utf8' }, function(err, kickerData) {
		kickers = preparePlayersArray(kickerData, kickerProjectionColumn);
		pickTeam();
	});
});
