var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var quarterbackProjectionColumn = 15;
var tailbackProjectionColumn = 14;
var wideoutProjectionColumn = 14;
var tightEndProjectionColumn = 14;
var kickerProjectionColumn = 16;
var defenseProjectionColumn = 12;
var fanduelArray, allQuarterbacks, allTailbacks, allWideouts, allTightEnds, allKickers, allDefenses;
var salaryCap = 60000;
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
	if (projectionColumn === 12) {
		playersArray = addDefenseSalaries(playersArray);
	} else {
		playersArray = addSalaries(playersArray);
	}
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

var addDefenseSalaries = function(playersArray) {
	return playersArray.map(function(playerArray) {
		for (var i = 0; i < fanduelArray.length; i++) {
			var fanduelPlayerArray = fanduelArray[i];
			var indexOfLastSpace = fanduelPlayerArray[1].lastIndexOf(' ');
			var city = fanduelPlayerArray[1].slice(0, indexOfLastSpace);
			if (city.concat(' D/ST') === playerArray[0]) {
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
	var newArray = [playersArray[0]];
	for (var i = 1; i < playersArray.length; i++) {
		if (playersArray[i][2] < newArray[newArray.length - 1][2]) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

var removeOnePlayer = function(playersArray, playerArray) {
	var newArray = [];
	for (var i = 0; i < playersArray.length; i++) {
		if (playersArray[i] !== playerArray) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

var removeTwoPlayers = function(playersArray, playerArray1, playerArray2) {
	var newArray = [];
	for (var i = 0; i < playersArray.length; i++) {
		if ((playersArray[i] !== playerArray1) && (playersArray[i] !== playerArray2)) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

var takeTopOffPlayersArray = function(playersArray, fullArray, playerArray) {
	var newArray = [];
	var bool = false;
	for (var i = 0; i < fullArray.length; i++) {
		if (bool && _.contains(playersArray, fullArray[i])) {
			newArray.push(fullArray[i]);
		}
		if (fullArray[i] === playerArray) {
			bool = true;
		}
	}
	return newArray;
}

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

var pickTeam = function() {
	if (filesRead === 6) {
		var quarterbacks = prepareEfficientArray(allQuarterbacks);
		var tailbacks = prepareEfficientArray(allTailbacks);
		var wideouts = prepareEfficientArray(allWideouts);
		console.log(wideouts);
		var tightEnds = prepareEfficientArray(allTightEnds);
		var kickers = prepareEfficientArray(allKickers);
		var defenses = prepareEfficientArray(allDefenses);
		// pickBestPossiblePlayers();
		for (var quarterbackIndex = 0; quarterbackIndex < quarterbacks.length; quarterbackIndex++) {
			// console.log('quarterbackIndex = ' + quarterbackIndex);
			for (var tailbackOneIndex = 0; tailbackOneIndex < tailbacks.length; tailbackOneIndex++) {
				// console.log('tailbackOneIndex = ' + tailbackOneIndex);
				var allButOneTailback = removeOnePlayer(allTailbacks, tailbacks[tailbackOneIndex]);
				var tailbacksTwo = prepareEfficientArray(allButOneTailback);
				tailbacksTwo = takeTopOffPlayersArray(tailbacksTwo, allTailbacks, tailbacks[tailbackOneIndex]);
				for (var tailbackTwoIndex = 0; tailbackTwoIndex < tailbacksTwo.length; tailbackTwoIndex++) {
					// console.log('tailbackTwoIndex = ' + tailbackTwoIndex);
					for (var wideoutOneIndex = 0; wideoutOneIndex < wideouts.length; wideoutOneIndex++) {
						// console.log('wideoutOneIndex = ' + wideoutOneIndex);
						var allButOneWideout = removeOnePlayer(allWideouts, wideouts[wideoutOneIndex]);
						var wideoutsTwo = prepareEfficientArray(allButOneWideout);
						wideoutsTwo = takeTopOffPlayersArray(wideoutsTwo, allWideouts, wideouts[wideoutOneIndex]);
						for (var wideoutTwoIndex = 0; wideoutTwoIndex < wideoutsTwo.length; wideoutTwoIndex++) {
							// console.log('wideoutTwoIndex = ' + wideoutTwoIndex);
							var allButTwoWideouts = removeTwoPlayers(allWideouts, wideouts[wideoutOneIndex], wideoutsTwo[wideoutTwoIndex]);
							var wideoutsThree = prepareEfficientArray(allButTwoWideouts);
							wideoutsThree = takeTopOffPlayersArray(wideoutsThree, allWideouts, wideouts[wideoutOneIndex]);
							wideoutsThree = takeTopOffPlayersArray(wideoutsThree, allWideouts, wideoutsTwo[wideoutTwoIndex]);
							for (var wideoutThreeIndex = 0; wideoutThreeIndex < wideoutsThree.length; wideoutThreeIndex++) {
								// console.log('wideoutThreeIndex = ' + wideoutThreeIndex);
								for (var tightEndIndex = 0; tightEndIndex < tightEnds.length; tightEndIndex++) {
									// console.log('tightEndIndex = ' + tightEndIndex);
									for (var kickerIndex = 0; kickerIndex < kickers.length; kickerIndex++) {
										// console.log('kickerIndex = ' + kickerIndex);
										for (var defenseIndex = 0; defenseIndex < defenses.length; defenseIndex++) {
											// console.log('defenseIndex = ' + defenseIndex);
											var quarterback = quarterbacks[quarterbackIndex];
											var tailbackOne = tailbacks[tailbackOneIndex];
											var tailbackTwo = tailbacksTwo[tailbackTwoIndex];
											var wideoutOne = wideouts[wideoutOneIndex];
											var wideoutTwo = wideoutsTwo[wideoutTwoIndex];
											var wideoutThree = wideoutsThree[wideoutThreeIndex];
											var tightEnd = tightEnds[tightEndIndex];
											var kicker = kickers[kickerIndex];
											var defense = defenses[defenseIndex];
											var capSpace = salaryCap - quarterback[2] - tailbackOne[2] - tailbackTwo[2] - wideoutOne[2] - wideoutTwo[2] - wideoutThree[2] - tightEnd[2] - kicker[2] - defense[2];
											if (capSpace >= 0) {
												// console.log('capSpace >= 0');
												var totalProjection = quarterback[1] + tailbackOne[1] + tailbackTwo[1] + wideoutOne[1] + wideoutTwo[1] + wideoutThree[1] + tightEnd[1] + kicker[1] + defense[1];
												if (totalProjection > bestTotalProjection) {
													console.log('totalProjection > bestTotalProjection');
													console.log (quarterbackIndex + ' ' + tailbackOneIndex + ' ' + tailbackTwoIndex + ' ' + wideoutOneIndex + ' ' + wideoutTwoIndex + ' ' + wideoutThreeIndex + ' ' + tightEndIndex + ' ' + kickerIndex + ' ' + defenseIndex);
													var bestQuarterback = quarterback;
													var bestTailbackOne = tailbackOne;
													var bestTailbackTwo = tailbackTwo;
													var bestWideoutOne = wideoutOne;
													var bestWideoutTwo = wideoutTwo;
													var bestWideoutThree = wideoutThree;
													var bestTightEnd = tightEnd;
													var bestKicker = kicker;
													var bestDefense = defense;
													var bestTeam = [bestQuarterback, bestTailbackOne, bestTailbackTwo, bestWideoutOne, bestWideoutTwo, bestWideoutThree, bestTightEnd, bestKicker, bestDefense];
													console.log(bestTeam);
													bestTotalProjection = totalProjection;
													var bestCapSpace = capSpace;
												}
												if (checkIfZero(defenseIndex) === 0) {
													if (checkIfZero(kickerIndex) === 0) {
														if (checkIfZero(tightEndIndex) === 0) {
															if (checkIfZero(wideoutThreeIndex) === 0) {
																if (checkIfZero(wideoutTwoIndex) === 0) {
																	if (checkIfZero(wideoutOneIndex) === 0) {
																		if (checkIfZero(tailbackTwoIndex) === 0) {
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
																		tailbackTwoIndex = tailbacksTwo.length;
																	}
																	wideoutOneIndex = wideouts.length;
																}
																wideoutTwoIndex = wideoutsTwo.length;
															}
															wideoutThreeIndex = wideoutsThree.length;
														}
														tightEndIndex = tightEnds.length;
													}
													kickerIndex = kickers.length;
												}
												defenseIndex = defenses.length;
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
		console.log(bestTeam);
		console.log(bestTotalProjection);
		console.log('$' + bestCapSpace);
	}
};

fs.readFile('fanduel.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fs.readFile('qbs.txt', { encoding: 'utf8' }, function(err, quarterbackData) {
		allQuarterbacks = preparePlayersArray(quarterbackData, quarterbackProjectionColumn);
		pickTeam();
	});
	fs.readFile('rbs.txt', { encoding: 'utf8' }, function(err, tailbackData) {
		allTailbacks = preparePlayersArray(tailbackData, tailbackProjectionColumn);
		pickTeam();
	});
	fs.readFile('wrs.txt', { encoding: 'utf8' }, function(err, wideoutData) {
		allWideouts = preparePlayersArray(wideoutData, wideoutProjectionColumn);
		console.log(allWideouts);
		pickTeam();
	});
	fs.readFile('tes.txt', { encoding: 'utf8' }, function(err, tightEndData) {
		allTightEnds = preparePlayersArray(tightEndData, tightEndProjectionColumn);
		pickTeam();
	});
	fs.readFile('ks.txt', { encoding: 'utf8' }, function(err, kickerData) {
		allKickers = preparePlayersArray(kickerData, kickerProjectionColumn);
		pickTeam();
	});
	fs.readFile('ds.txt', { encoding: 'utf8' }, function(err, defenseData) {
		allDefenses = preparePlayersArray(defenseData, defenseProjectionColumn);
		pickTeam();
	});
});
