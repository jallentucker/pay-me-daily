var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var quarterbackProjectionColumn = 15;
var tailbackProjectionColumn = 14;
var wideoutProjectionColumn = 14;
var tightEndProjectionColumn = 14;
var kickerProjectionColumn = 16;
var fanduelArray, quarterbacks, tailbacks, wideouts, tightEnds, kickers, defenses;
var salaryCap = 55200;
var bestTotalProjection = 0;

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

var checkIfZero = function(index) {
	if (index === 0) {
		return 0;
	} else {
		return 1;
	}
};

var checkIfOne = function(index) {
	if (index === 1) {
		return 0;
	} else {
		return 1;
	}
};

var checkIfTwo = function(index) {
	if (index === 2) {
		return 0;
	} else {
		return 1;
	}
};

var pickTeam = function() {
	if (filesRead === 5) {
		quarterbacks = prepareEfficientArray(quarterbacks);
		tailbacks = prepareEfficientArray(tailbacks);
		wideouts = prepareEfficientArray(wideouts);
		tightEnds = prepareEfficientArray(tightEnds);
		kickers = prepareEfficientArray(kickers);
		// pickBestPossiblePlayers();
		for (var quarterbackIndex = 0; quarterbackIndex < quarterbacks.length; quarterbackIndex++) {
			// console.log('quarterbackIndex = ' + quarterbackIndex);
			for (var tailbackOneIndex = 0; tailbackOneIndex < tailbacks.length; tailbackOneIndex++) {
				// console.log('tailbackOneIndex = ' + tailbackOneIndex);
				for (var tailbackTwoIndex = tailbackOneIndex + 1; tailbackTwoIndex < tailbacks.length; tailbackTwoIndex++) {
					// console.log('tailbackTwoIndex = ' + tailbackTwoIndex);
					for (var wideoutOneIndex = 0; wideoutOneIndex < wideouts.length; wideoutOneIndex++) {
						// console.log('wideoutOneIndex = ' + wideoutOneIndex);
						for (var wideoutTwoIndex = wideoutOneIndex + 1; wideoutTwoIndex < wideouts.length; wideoutTwoIndex++) {
							// console.log('wideoutTwoIndex = ' + wideoutTwoIndex);
							for (var wideoutThreeIndex = wideoutTwoIndex + 1; wideoutThreeIndex < wideouts.length; wideoutThreeIndex++) {
								// console.log('wideoutThreeIndex = ' + wideoutThreeIndex);
								for (var tightEndIndex = 0; tightEndIndex < tightEnds.length; tightEndIndex++) {
									// console.log('tightEndIndex = ' + tightEndIndex);
									for (var kickerIndex = 0; kickerIndex < kickers.length; kickerIndex++) {
										// console.log('kickerIndex = ' + kickerIndex);
										var quarterback = quarterbacks[quarterbackIndex];
										// console.log('quarterback = ' + quarterback);
										var tailbackOne = tailbacks[tailbackOneIndex];
										var tailbackTwo = tailbacks[tailbackTwoIndex];
										var wideoutOne = wideouts[wideoutOneIndex];
										var wideoutTwo = wideouts[wideoutTwoIndex];
										var wideoutThree = wideouts[wideoutThreeIndex];
										var tightEnd = tightEnds[tightEndIndex];
										var kicker = kickers[kickerIndex];
										var capSpace = salaryCap - quarterback[2] - tailbackOne[2] - tailbackTwo[2] - wideoutOne[2] - wideoutTwo[2] - wideoutThree[2] - tightEnd[2] - kicker[2];
										if (capSpace >= 0) {
											// console.log('capSpace >= 0');
											// console.log (quarterbackIndex + ' ' + tailbackOneIndex + ' ' + tailbackTwoIndex + ' ' + wideoutOneIndex + ' ' + wideoutTwoIndex + ' ' + wideoutThreeIndex + ' ' + tightEndIndex + ' ' + kickerIndex);
											var totalProjection = quarterback[1] + tailbackOne[1] + tailbackTwo[1] + wideoutOne[1] + wideoutTwo[1] + wideoutThree[1] + tightEnd[1] + kicker[1];
											if (totalProjection > bestTotalProjection) {
												console.log('totalProjection > bestTotalProjection');
												var bestQuarterback = quarterback;
												var bestTailbackOne = tailbackOne;
												var bestTailbackTwo = tailbackTwo;
												var bestWideoutOne = wideoutOne;
												var bestWideoutTwo = wideoutTwo;
												var bestWideoutThree = wideoutThree;
												var bestTightEnd = tightEnd;
												var bestKicker = kicker;
												var bestTeam = [bestQuarterback, bestTailbackOne, bestTailbackTwo, bestWideoutOne, bestWideoutTwo, bestWideoutThree, bestTightEnd, bestKicker];
												bestTotalProjection = totalProjection;
												var bestCapSpace = capSpace;
											}
											if (checkIfZero(kickerIndex) === 0) {
												if (checkIfZero(tightEndIndex) === 0) {
													if (checkIfTwo(wideoutThreeIndex) === 0) {
														if (checkIfOne(wideoutTwoIndex) === 0) {
															if (checkIfZero(wideoutOneIndex) === 0) {
																if (checkIfOne(tailbackTwoIndex) === 0) {
																	if (checkIfZero(tailbackOneIndex) === 0) {
																		if (checkIfZero(quarterbackIndex) === 0) {
																			console.log(bestTeam);
																			console.log(bestTotalProjection);
																			console.log('$' + bestCapSpace);
																		}
																		quarterbackIndex = quarterbacks.length;
																	}
																	tailbackOneIndex = tailbacks.length;
																}
																tailbackTwoIndex = tailbacks.length;
															}
															wideoutOneIndex = wideouts.length;
														}
														wideoutTwoIndex = wideouts.length;
													}
													wideoutThreeIndex = wideouts.length;
												}
												tightEndIndex = tightEnds.length;
											}
											kickerIndex = kickers.length;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		console.log(bestTeam);
		console.log(bestTotalProjection);
		console.log('$' + bestCapSpace);
	}
};

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fanduelArray.forEach(function(array) {
		if (array[1] === 'Alex Smith') {
			console.log(array);
		}
	});
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
