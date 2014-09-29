var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var quarterbackProjectionColumn = 15;
var tailbackProjectionColumn = 14;
var wideoutProjectionColumn = 14;
var tightEndProjectionColumn = 14;
var kickerProjectionColumn = 16;
var fanduelArray, quarterbacks, tailbacks, wideouts, tightEnds, kickers, defenses;
var salaryCap = 55300;
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


var pickBestPossiblePlayers = function() {
	var moveOn = function() {
		var incrementQuarterback = function() {
			tailbackOneIndex = 0;
			tailbackTwoIndex = 1;
			quarterbackIndex++;
			if (quarterbacks[quarterbackIndex]) {
				pickBestPossiblePlayers();
			} else {
				itsOver();
			}
		};

		var incrementTailbackOne = function() {
			tailbackOneIndex++;
			tailbackTwoIndex = tailbackOneIndex + 1;
			if (tailbacks[tailbackTwoIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementQuarterback();
			}
		};

		var incrementTailbackTwo = function() {
			wideoutOneIndex = 0;
			wideoutTwoIndex = 1;
			wideoutThreeIndex = 2;
			tailbackTwoIndex++;
			if (tailbacks[tailbackTwoIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementTailbackOne();
			}
		};

		var incrementWideoutOne = function() {
			wideoutOneIndex++;
			wideoutTwoIndex = wideoutOneIndex + 1;
			wideoutThreeIndex = wideoutTwoIndex + 1;
			if (wideouts[wideoutThreeIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementTailbackTwo();
			}
		};

		var incrementWideoutTwo = function() {
			wideoutTwoIndex++;
			wideoutThreeIndex = wideoutTwoIndex + 1;
			if (wideouts[wideoutThreeIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementWideoutOne();
			}
		};

		var incrementWideoutThree = function() {
			tightEndIndex = 0;
			wideoutThreeIndex++;
			if (wideouts[wideoutThreeIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementWideoutTwo();
			}
		};

		var incrementTightEnd = function() {
			kickerIndex = 0;
			tightEndIndex++;
			if (tightEnds[tightEndIndex]) {
				pickBestPossiblePlayers();
			} else {
				incrementWideoutThree();
			}
		};

		if (kickerIndex === 0) {
			if (tightEndIndex === 0) {
				if (wideoutThreeIndex === 2) {
					if (wideoutTwoIndex === 1) {
						if (wideoutOneIndex === 0) {
							if (tailbackTwoIndex === 1) {
								if (tailbackOneIndex === 0) {
									quarterbackIndex++;
									if (quarterbacks[quarterbackIndex]) {
										pickBestPossiblePlayers();
									} else {
										itsOver();
									}
								} else {
									incrementQuarterback();
								}
							} else {
								incrementTailbackOne();
							}
						} else {
							incrementTailbackTwo();
						}
					} else {
						incrementWideoutOne();
					}
				} else {
					incrementWideoutTwo();
				}
			} else {
				incrementWideoutThree();
			}
		} else {
			incrementTightEnd();
		}
	};

	quarterback = quarterbacks[quarterbackIndex];
	tailbackOne = tailbacks[tailbackOneIndex];
	tailbackTwo = tailbacks[tailbackTwoIndex];
	wideoutOne = wideouts[wideoutOneIndex];
	wideoutTwo = wideouts[wideoutTwoIndex];
	wideoutThree = wideouts[wideoutThreeIndex];
	tightEnd = tightEnds[tightEndIndex];
	kicker = kickers[kickerIndex];
	capSpace = salaryCap - quarterback[2] - tailbackOne[2] - tailbackTwo[2] - wideoutOne[2] - wideoutTwo[2] - wideoutThree[2] - tightEnd[2] - kicker[2];
	if (capSpace >= 0) {
		totalProjection = quarterback[1] + tailbackOne[1] + tailbackTwo[1] + wideoutOne[1] + wideoutTwo[1] + wideoutThree[1] + tightEnd[1] + kicker[1];
		if (totalProjection > bestTotalProjection) {
			bestQuarterback = quarterback;
			bestTailbackOne = tailbackOne;
			bestTailbackTwo = tailbackTwo;
			bestWideoutOne = wideoutOne;
			bestWideoutTwo = wideoutTwo;
			bestWideoutThree = wideoutThree;
			bestTightEnd = tightEnd;
			bestKicker = kicker;
			bestTotalProjection = totalProjection;
			bestCapSpace = capSpace;
			moveOn();
		} else {
			moveOn();
		}
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
				wideoutThreeIndex++;
				if (wideouts[wideoutThreeIndex]) {
					pickBestPossiblePlayers();
				} else {
					wideoutTwoIndex++;
					wideoutThreeIndex = wideoutTwoIndex + 1;
					if (wideouts[wideoutThreeIndex]) {
						pickBestPossiblePlayers();
					} else {
						wideoutOneIndex++;
						wideoutTwoIndex = wideoutOneIndex + 1;
						wideoutThreeIndex = wideoutTwoIndex + 1;
						if (wideouts[wideoutThreeIndex]) {
							pickBestPossiblePlayers();
						} else {
							wideoutOneIndex = 0;
							wideoutTwoIndex = 1;
							wideoutThreeIndex = 2;
							tailbackTwoIndex++;
							if (tailbacks[tailbackTwoIndex]) {
								pickBestPossiblePlayers();
							} else {
								tailbackOneIndex++;
								tailbackTwoIndex = tailbackOneIndex + 1;
								if (tailbacks[tailbackTwoIndex]) {
									pickBestPossiblePlayers();
								} else {
									tailbackOneIndex = 0;
									tailbackTwoIndex = 1;
									quarterbackIndex++;
									if (quarterbacks[quarterbackIndex]) {
										pickBestPossiblePlayers();
									} else {
										itsOver();
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
		// tailbacks = prepareEfficientArray(tailbacks);
		// wideouts = prepareEfficientArray(wideouts);
		tightEnds = prepareEfficientArray(tightEnds);
		kickers = prepareEfficientArray(kickers);
		// pickBestPossiblePlayers();
		var quarterbackIndex = 0;
		var tailbackOneIndex = 0;
		var tailbackTwoIndex = 1;
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
								console.log('capSpace >= 0');
								console.log (quarterbackIndex + ' ' + tailbackOneIndex + ' ' + tailbackTwoIndex + ' ' + wideoutOneIndex + ' ' + wideoutTwoIndex + ' ' + wideoutThreeIndex + ' ' + tightEndIndex + ' ' + kickerIndex);
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
								var announceTeam = function(team) {
									console.log('QB is ' + team[0][0]);
									console.log('RB1 is ' + team[1][0]);
									console.log('RB2 is ' + team[2][0]);
									console.log('WR1 is ' + team[3][0]);
									console.log('WR2 is ' + team[4][0]);
									console.log('WR3 is ' + team[5][0]);
									console.log('TE is ' + team[6][0]);
									console.log('K is ' + team[7][0]);
									console.log('Total projection is ' + bestTotalProjection + ' points');
									console.log('Cap space is $' + bestCapSpace);
								};
								var wideoutOneCheck = 10000 * checkIfZero(wideoutOneIndex);
								var wideoutTwoCheck = 1000 * checkIfOne(wideoutTwoIndex);
								var wideoutThreeCheck = 100 * checkIfTwo(wideoutThreeIndex);
								var tightEndCheck = 10 * checkIfZero(tightEndIndex);
								var kickerCheck = checkIfZero(kickerIndex);
								var check = wideoutOneCheck + wideoutTwoCheck + wideoutThreeCheck + tightEndCheck + kickerCheck;
								// switch (check) {
								// 	case 0:
								// 		announceTeam(bestTeam);
								// 		wideoutThreeIndex = wideouts.length;
								// 		tightEndIndex = tightEnds.length;
								// 		break;
								// 	case 10:
								// 		tightEndIndex = tightEnds.length;
								// 		break;
								// 	case 100:
								// 		wideoutThreeIndex = wideouts.length;
								// 		tightEndIndex = tightEnds.length;
								// 		break;
								// 	case 110:
								// 		tightEndIndex = tightEnds.length;
								// 		break;
								// }
								if (checkIfZero(kickerIndex) === 0) {
									if (checkIfZero(tightEndIndex) === 0) {
										if (checkIfTwo(wideoutThreeIndex) === 0) {
											if (checkIfOne(wideoutTwoIndex) === 0) {
												if (checkIfZero(wideoutOneIndex) === 0) {
													announceTeam();
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
	console.log(bestTeam);
};

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
