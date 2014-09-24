var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var qbProjectionColumn = 15;
var rbProjectionColumn = 14;
var wrProjectionColumn = 14;
var teProjectionColumn = 14;
var kProjectionColumn = 16;
var fanduelArray, qbs, rbs, wrs, tes, ks, ds, qb, rb1, rb2, wr1, wr2, wr3, te, k, d;
var salaryCap = 55000;

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

var pickTeam = function() {
	var capSpace = salaryCap;
	if (filesRead === 5) {
		console.log('picking team now');
		qbs = prepareEfficientArray(qbs);
		for (var i = 0; i < qbs.length; i++) {
			qb = qbs[i];
			capSpace = capSpace - qb[2];
			tes = prepareEfficientArray(tes);
			for (var j = 0; j < tes.length; j++) {
				te = tes[j];
				capSpace = capSpace - te[2];
				ks = prepareEfficientArray(ks);
				for (var l = 0; l < ks.length; l++) {
					k = ks[l];
					capSpace = capSpace - k[2];
					var inefficientRBs = rbs;
					rbs = prepareEfficientArray(rbs);
					for (var m = 0; m < rbs.length; m++) {
						rb1 = rbs[m];
						capSpace = capSpace - rb1[2];
						rbs = inefficientRBs;
						for (var n = m + 1; n < rbs.length; n++) {
							rb2 = rbs[n];
							capSpace = capSpace - rb2[2];
							for (var o = 0; o < wrs.length; o++) {
								if (wrs[o][2] <= capSpace) {
									wr1 = wrs[o];
									capSpace = capSpace - wr1[2];
									for (var p = o + 1; p < wrs.length; p++) {
										if (wrs[p][2] <= capSpace) {
											wr2 = wrs[p];
											capSpace = capSpace - wr2[2];
											for (var q = p + 1; q < wrs.length; q++) {
												if (wrs[q][2] <= capSpace) {
													wr3 = wrs[q];
													capSpace = capSpace - wr3[2];
													console.log('QB is ' + qb[0]);
													console.log('RB1 is ' + rb1[0]);
													console.log('RB2 is ' + rb2[0]);
													console.log('WR1 is ' + wr1[0]);
													console.log('WR2 is ' + wr2[0]);
													console.log('WR3 is ' + wr3[0]);
													console.log('TE is ' + te[0]);
													console.log('K is ' + k[0]);
													console.log('Cap Space is ' + capSpace);
													q = wrs.length;
													p = wrs.length;
													o = wrs.length;
													n = rbs.length;
													m = rbs.length;
													l = ks.length;
													j = tes.length;
													i = qbs.length;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fs.readFile('qbs.txt', { encoding: 'utf8' }, function(err, qbData) {
		qbs = preparePlayersArray(qbData, qbProjectionColumn);
		pickTeam();
	});
	fs.readFile('rbs.txt', { encoding: 'utf8' }, function(err, rbData) {
		rbs = preparePlayersArray(rbData, rbProjectionColumn);
		pickTeam();
	});
	fs.readFile('wrs.txt', { encoding: 'utf8' }, function(err, wrData) {
		wrs = preparePlayersArray(wrData, wrProjectionColumn);
		pickTeam();
	});
	fs.readFile('tes.txt', { encoding: 'utf8' }, function(err, teData) {
		tes = preparePlayersArray(teData, teProjectionColumn);
		pickTeam();
	});
	fs.readFile('ks.txt', { encoding: 'utf8' }, function(err, kData) {
		ks = preparePlayersArray(kData, kProjectionColumn);
		pickTeam();
	});
});
