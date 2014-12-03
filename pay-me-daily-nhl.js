var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var leftWingProjectionColumn = 14;
var rightWingProjectionColumn = 14;
var centerProjectionColumn = 14;
var defensemanProjectionColumn = 14;
var goalieProjectionColumn = 13;
var fanduelArray, allLeftWings, allRightWings, allCenters, allDefensemen, allGoalies;
var salaryCap = 55000;
var bestTotalProjection = 0;
var bestTotalProjection2 = 0;
var lineups = 0;

// makeFanduelArray takes as its argument the contents of a .txt file scrubbed from FanDuel.com and
// returns an array. The array includes elements representing each player available to the user when
// playing the relevant FanDuel.com game. Each element is itself an array, consisting of the player's
// position, name, and salary on FanDuel.com.
var makeFanduelArray = function(dataString) {
	var json = JSON.parse(dataString);
	var fanduelArray = _.values(json).map(function(playerArray) {
		return [playerArray[0], playerArray[1], parseInt(playerArray[5])];
	});
	return fanduelArray;
};

// preparePlayersArray takes as its two arguments 1) the contents of a .txt file scrubbed from numberFire.com
// and 2) the "column" of the dataset that contains the fantasy projection for each player. preparePlayersArray
// returns an array that includes elements representing each player that both has a projection from
// numberFire.com and is available in the relevant FanDuel.com game. Each element is itself an array,
// consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
var preparePlayersArray = function(dataString, projectionColumn) {
	var playersArray = makePlayersArray(dataString, projectionColumn);
	playersArray = addSalaries(playersArray);
	// Player arrays are sorted by fantasy projection descending.
	playersArray.sort(function(a, b) {
		return b[1] - a[1];
	});
	playersArray = trimPlayersArray(playersArray);
	return playersArray;
};

// makePlayersArray takes as its two arguments 1) the contents of a .txt file scrubbed from numberFire.com
// and 2) the "column" of the dataset that contains the fantasy projection for each player. makePlayersArray
// returns an array that includes elements representing each player that has a projection from numberFire.com.
// Each element is itself an array, consisting of the player's name and fantasy projection for this
// week.
var makePlayersArray = function(dataString, projectionColumn) {
	// fliesRead is incremented each time this function is called so that the pickTeam function will
	// not fire until all six positional .txt files have been processed.
	filesRead++;
	var playerStrings = dataString.split('\r\n');
	return playerStrings.map(function(playerString) {
		var playerArray = playerString.split('\t');
		return [playerArray[0].split('(')[0].trim(), parseFloat(playerArray[projectionColumn - 1])];
	});
};

// addSalaries takes an array of players who are each represented by an array consisting of the player's
// name and fantasy projection for this week. addSalaries returns an array of players who are each represented
// by an array consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
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

// trimPlayersArray takes an array of players who are each represented by an array consisting of the
// player's name, fantasy projection for this week, and (unless the player is not eligible in the relevant
// FanDuel.com game) salary on FanDuel.com. trimPlayersArray returns the same array it received as an
// argument minus the arrays representing any players who did not have a salary and thus are not eligible
// in the relevant FanDuel.com game.
var trimPlayersArray = function(playersArray) {
	var trimmedPlayersArray = [];
	playersArray.forEach(function(playerArray) {
		if (playerArray.length === 3) {
			trimmedPlayersArray.push(playerArray);
		}
	});
	return trimmedPlayersArray;
};

// prepareEfficientArray takes an array of players at a particular position who are each represented
// by an array consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
// prepareEfficientArray returns a new version of the same array that is missing certain players who
// could not possibly be of interest to the algorithm because there is at least one other player with
// BOTH a lower salary and a higher projection.
var prepareEfficientArray = function(playersArray) {
	var newArray = [playersArray[0]];
	for (var i = 1; i < playersArray.length; i++) {
		if (playersArray[i][2] < newArray[newArray.length - 1][2]) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

// removeOnePlayer takes two arguments. The first is an efficient array of players at a particular position.
// The second is a specific player represented by an array. removeOnePlayer returns a copy of the first
// argument with one difference: the second argument is not one of the elements of the copy.
var removeOnePlayer = function(playersArray, playerArray) {
	var newArray = [];
	for (var i = 0; i < playersArray.length; i++) {
		if (playersArray[i] !== playerArray) {
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

// pickTeam is a function that takes no arguments. Once all .txt files have been read and their data
// placed into arrays, the pickTeam function uses an algorithm to find optimized fantasy lineups based
// on fantasy projections from numberFire.com and salaries from FanDuel.com.
var pickTeam = function() {
	if (filesRead === 5) {
		// Efficient arrays are prepared for all positions.
		var leftWings = prepareEfficientArray(allLeftWings);
		var rightWings = prepareEfficientArray(allRightWings);
		var centers = prepareEfficientArray(allCenters);
		var defensemen = prepareEfficientArray(allDefensemen);
		var goalies = prepareEfficientArray(allGoalies);
		// The following for loop increments through goalies until the two best possible lineups
		// have been identified.
		for (var goalieIndex = 0; goalieIndex < goalies.length; goalieIndex++) {
			// Two left wings must be chosen to fill out a FanDuel lineup. The following for loop increments
			// through left wings while searching for optimal lineups.
			for (var leftWingOneIndex = 0; leftWingOneIndex < leftWings.length; leftWingOneIndex++) {
				// The following three lines of code create a new efficient array of left wings (leftWingsTwo),
				// based on which left wing has already been chosen as leftWingOne, from which to choose
				// a second left wing.
				var allButOneLeftWing = removeOnePlayer(allLeftWings, leftWings[leftWingOneIndex]);
				var leftWingsTwo = prepareEfficientArray(allButOneLeftWing);
				leftWingsTwo = takeTopOffPlayersArray(leftWingsTwo, allLeftWings, leftWings[leftWingOneIndex]);
				// The following for loop increments through leftWingsTwo while searching for optimal
				// lineups.
				for (var leftWingTwoIndex = 0; leftWingTwoIndex < leftWingsTwo.length; leftWingTwoIndex++) {
					// Two right wings must be chosen to fill out a FanDuel lineup. The following for loop increments
					// through right wings while searching for optimal lineups.
					for (var rightWingOneIndex = 0; rightWingOneIndex < rightWings.length; rightWingOneIndex++) {
						// The following three lines of code create a new efficient array of right wings (rightWingsTwo),
						// based on which right wing has already been chosen as rightWingOne, from which to choose
						// a second right wing.
						var allButOneRightWing = removeOnePlayer(allRightWings, rightWings[rightWingOneIndex]);
						var rightWingsTwo = prepareEfficientArray(allButOneRightWing);
						rightWingsTwo = takeTopOffPlayersArray(rightWingsTwo, allRightWings, rightWings[rightWingOneIndex]);
						// The following for loop increments through rightWingsTwo while searching for optimal
						// lineups.
						for (var rightWingTwoIndex = 0; rightWingTwoIndex < rightWingsTwo.length; rightWingTwoIndex++) {
							// Two centers must be chosen to fill out a FanDuel lineup. The following for loop increments
							// through centers while searching for optimal lineups.
							for (var centerOneIndex = 0; centerOneIndex < centers.length; centerOneIndex++) {
								// The following three lines of code create a new efficient array of centers (centersTwo),
								// based on which center has already been chosen as centerOne, from which to choose
								// a second center.
								var allButOneCenter = removeOnePlayer(allCenters, centers[centerOneIndex]);
								var centersTwo = prepareEfficientArray(allButOneCenter);
								centersTwo = takeTopOffPlayersArray(centersTwo, allCenters, centers[centerOneIndex]);
								// The following for loop increments through centersTwo while searching for optimal
								// lineups.
								for (var centerTwoIndex = 0; centerTwoIndex < centersTwo.length; centerTwoIndex++) {
									// Two defensemen must be chosen to fill out a FanDuel lineup. The following for loop increments
									// through defensemen while searching for optimal lineups.
									for (var defensemanOneIndex = 0; defensemanOneIndex < defensemen.length; defensemanOneIndex++) {
										// The following three lines of code create a new efficient array of defensemen (defensemenTwo),
										// based on which defenseman has already been chosen as defensemanOne, from which to choose
										// a second defenseman.
										var allButOneDefenseman = removeOnePlayer(allDefensemen, defensemen[defensemanOneIndex]);
										var defensemenTwo = prepareEfficientArray(allButOneDefenseman);
										defensemenTwo = takeTopOffPlayersArray(defensemenTwo, allDefensemen, defensemen[defensemanOneIndex]);
										// The following for loop increments through defensemenTwo while searching for optimal
										// lineups.
										for (var defensemanTwoIndex = 0; defensemanTwoIndex < defensemenTwo.length; defensemanTwoIndex++) {
											var leftWingOne = leftWings[leftWingOneIndex];
											var leftWingTwo = leftWingsTwo[leftWingTwoIndex];
											var rightWingOne = rightWings[rightWingOneIndex];
											var rightWingTwo = rightWingsTwo[rightWingTwoIndex];
											var centerOne = centers[centerOneIndex];
											var centerTwo = centersTwo[centerTwoIndex];
											var defensemanOne = defensemen[defensemanOneIndex];
											var defensemanTwo = defensemenTwo[defensemanTwoIndex];
											var goalie = goalies[goalieIndex];
											var capSpace = salaryCap - leftWingOne[2] - leftWingTwo[2] - rightWingOne[2] - rightWingTwo[2] - centerOne[2] - centerTwo[2] - defensemanOne[2] - defensemanTwo[2] - goalie[2];
											if (capSpace >= 0) {
												var totalProjection = leftWingOne[1] + leftWingTwo[1] + rightWingOne[1] + rightWingTwo[1] + centerOne[1] + centerTwo[1] + defensemanOne[1] + defensemanTwo[1] + goalie[1];
												lineups++;
												if (totalProjection > bestTotalProjection) {
													console.log('totalProjection > bestTotalProjection');
													if (lineups > 1) {
														var bestLeftWingOne2 = bestLeftWingOne;
														var bestLeftWingTwo2 = bestLeftWingTwo;
														var bestRightWingOne2 = bestRightWingOne;
														var bestRightWingTwo2 = bestRightWingTwo;
														var bestCenterOne2 = bestCenterOne;
														var bestCenterTwo2 = bestCenterTwo;
														var bestDefensemanOne2 = bestDefensemanOne;
														var bestDefensemanTwo2 = bestDefensemanTwo;
														var bestGoalie2 = bestGoalie;
														var bestTeam2 = [bestLeftWingOne2, bestLeftWingTwo2, bestRightWingOne2, bestRightWingTwo2, bestCenterOne2, bestCenterTwo2, bestDefensemanOne2, bestDefensemanTwo2, bestGoalie2];
														bestTotalProjection2 = bestTotalProjection;
														var bestCapSpace2 = bestCapSpace;
													}
													var bestLeftWingOne = leftWingOne;
													var bestLeftWingTwo = leftWingTwo;
													var bestRightWingOne = rightWingOne;
													var bestRightWingTwo = rightWingTwo;
													var bestCenterOne = centerOne;
													var bestCenterTwo = centerTwo;
													var bestDefensemanOne = defensemanOne;
													var bestDefensemanTwo = defensemanTwo;
													var bestGoalie = goalie;
													var bestTeam = [bestLeftWingOne, bestLeftWingTwo, bestRightWingOne, bestRightWingTwo, bestCenterOne, bestCenterTwo, bestDefensemanOne, bestDefensemanTwo, bestGoalie];
													bestTotalProjection = totalProjection;
													var bestCapSpace = capSpace;
												} else if (totalProjection > bestTotalProjection2) {
													console.log('totalProjection > bestTotalProjection2');
													var bestLeftWingOne2 = leftWingOne;
													var bestLeftWingTwo2 = leftWingTwo;
													var bestRightWingOne2 = rightWingOne;
													var bestRightWingTwo2 = rightWingTwo;
													var bestCenterOne2 = centerOne;
													var bestCenterTwo2 = centerTwo;
													var bestDefensemanOne2 = defensemanOne;
													var bestDefensemanTwo2 = defensemanTwo;
													var bestGoalie2 = goalie;
													var bestTeam2 = [bestLeftWingOne2, bestLeftWingTwo2, bestRightWingOne2, bestRightWingTwo2, bestCenterOne2, bestCenterTwo2, bestDefensemanOne2, bestDefensemanTwo2, bestGoalie2];
													bestTotalProjection2 = totalProjection;
													var bestCapSpace2 = capSpace;
													if (defensemanTwoIndex === 0) {
														if (defensemanOneIndex === 0) {
															if (centerTwoIndex === 0) {
																if (centerOneIndex === 0) {
																	if (rightWingTwoIndex === 0) {
																		if (rightWingOneIndex === 0) {
																			if (leftWingTwoIndex === 0) {
																				if (leftWingOneIndex === 0) {
																					if (goalieIndex === 0) {
																						console.log(bestTeam);
																						console.log(bestTotalProjection);
																						console.log('$' + bestCapSpace);
																					}
																					goalieIndex = goalies.length;
																				}
																				leftWingOneIndex = leftWings.length;
																			}
																			leftWingTwoIndex = leftWingsTwo.length;
																		}
																		rightWingOneIndex = rightWings.length;
																	}
																	rightWingTwoIndex = rightWingsTwo.length;
																}
																centerOneIndex = centers.length;
															}
															centerTwoIndex = centersTwo.length;
														}
														defensemanOneIndex = defensemen.length;
													}
													defensemanTwoIndex = defensemenTwo.length;
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
		console.log(bestTeam);
		console.log(bestTotalProjection);
		console.log('$' + bestCapSpace);
		console.log(bestTeam2);
		console.log(bestTotalProjection2);
		console.log('$' + bestCapSpace2);
	}
};

// fanduel-nfl.txt contains player salary data scrubbed from FanDuel.com.
fs.readFile('player_lists/nhl.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	// projections/nhl/lws.txt contains fantasy projections for most if not all left wings playing
	// in a given week.
	fs.readFile('projections/nhl/lws.txt', { encoding: 'utf8' }, function(err, leftWingData) {
		allLeftWings = preparePlayersArray(leftWingData, leftWingProjectionColumn);
		pickTeam();
	});
	// projections/nhl/rws.txt contains fantasy projections for most if not all right wings playing
	// in a given week.
	fs.readFile('projections/nhl/rws.txt', { encoding: 'utf8' }, function(err, rightWingData) {
		allRightWings = preparePlayersArray(rightWingData, rightWingProjectionColumn);
		pickTeam();
	});
	// projections/nhl/cs.txt contains fantasy projections for most if not all centers playing
	// in a given week.
	fs.readFile('projections/nhl/cs.txt', { encoding: 'utf8' }, function(err, centerData) {
		allCenters = preparePlayersArray(centerData, centerProjectionColumn);
		pickTeam();
	});
	// projections/nhl/d.txt contains fantasy projections for most if not all defensemen playing in
	// a given week.
	fs.readFile('projections/nhl/d.txt', { encoding: 'utf8' }, function(err, defensemanData) {
		allDefensemen = preparePlayersArray(defensemanData, defensemanProjectionColumn);
		pickTeam();
	});
	// projections/nhl/gs.txt contains fantasy projections for most if not all goalies playing in a
	// given week.
	fs.readFile('projections/nhl/gs.txt', { encoding: 'utf8' }, function(err, goalieData) {
		allGoalies = preparePlayersArray(goalieData, goalieProjectionColumn);
		pickTeam();
	});
});
