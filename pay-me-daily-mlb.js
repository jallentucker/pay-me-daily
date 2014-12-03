var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var projectionColumn = 16;
var fanduelArray, allPitchers, allOutfielders, allFirstBasemen, allSecondBasemen, allThirdBasemen, allShortstops, allCatchers;
var salaryCap = 35000;
var bestTotalProjection = 0;
var bestTotalProjection2 = 0;
var lineups = 0;

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
		var playerName = playerArray[0].split('(')[0].trim();
		if (playerName.charAt(0) === '*') {
			return [playerName.split('*')[1], parseFloat(playerArray[projectionColumn - 1])];
		} else {
			return [playerName, parseFloat(playerArray[projectionColumn - 1])];
		}
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

var pickTeam = function() {
	if (filesRead === 7) {
		var pitchers = prepareEfficientArray(allPitchers);
		var outfielders = prepareEfficientArray(allOutfielders);
		var firstBasemen = prepareEfficientArray(allFirstBasemen);
		var secondBasemen = prepareEfficientArray(allSecondBasemen);
		var thirdBasemen = prepareEfficientArray(allThirdBasemen);
		var shortstops = prepareEfficientArray(allShortstops);
		var catchers = prepareEfficientArray(allCatchers);
		for (var pitcherIndex = 0; pitcherIndex < pitchers.length; pitcherIndex++) {
			for (var outfielderOneIndex = 0; outfielderOneIndex < outfielders.length; outfielderOneIndex++) {
				var allButOneOutfielder = removeOnePlayer(allOutfielders, outfielders[outfielderOneIndex]);
				var outfieldersTwo = prepareEfficientArray(allButOneOutfielder);
				outfieldersTwo = takeTopOffPlayersArray(outfieldersTwo, allOutfielders, outfielders[outfielderOneIndex]);
				for (var outfielderTwoIndex = 0; outfielderTwoIndex < outfieldersTwo.length; outfielderTwoIndex++) {
					var allButTwoOutfielders = removeTwoPlayers(allOutfielders, outfielders[outfielderOneIndex], outfieldersTwo[outfielderTwoIndex]);
					var outfieldersThree = prepareEfficientArray(allButTwoOutfielders);
					outfieldersThree = takeTopOffPlayersArray(outfieldersThree, allOutfielders, outfielders[outfielderOneIndex]);
					outfieldersThree = takeTopOffPlayersArray(outfieldersThree, allOutfielders, outfieldersTwo[outfielderTwoIndex]);
					for (var outfielderThreeIndex = 0; outfielderThreeIndex < outfieldersThree.length; outfielderThreeIndex++) {
						for (var firstBasemanIndex = 0; firstBasemanIndex < firstBasemen.length; firstBasemanIndex++) {
							for (var secondBasemanIndex = 0; secondBasemanIndex < secondBasemen.length; secondBasemanIndex++) {
								for (var thirdBasemanIndex = 0; thirdBasemanIndex < thirdBasemen.length; thirdBasemanIndex++) {
									for (var shortstopIndex = 0; shortstopIndex < shortstops.length; shortstopIndex++) {
										for (var catcherIndex = 0; catcherIndex < catchers.length; catcherIndex++) {
											var pitcher = pitchers[pitcherIndex];
											var outfielderOne = outfielders[outfielderOneIndex];
											var outfielderTwo = outfieldersTwo[outfielderTwoIndex];
											var outfielderThree = outfieldersThree[outfielderThreeIndex];
											var firstBaseman = firstBasemen[firstBasemanIndex];
											var secondBaseman = secondBasemen[secondBasemanIndex];
											var thirdBaseman = thirdBasemen[thirdBasemanIndex];
											var shortstop = shortstops[shortstopIndex];
											var catcher = catchers[catcherIndex];
											var capSpace = salaryCap - pitcher[2] - outfielderOne[2] - outfielderTwo[2] - outfielderThree[2] - firstBaseman[2] - secondBaseman[2] - thirdBaseman[2] - shortstop[2] - catcher[2];
											if (capSpace >= 0) {
												var totalProjection = pitcher[1] + outfielderOne[1] + outfielderTwo[1] + outfielderThree[1] + firstBaseman[1] + secondBaseman[1] + thirdBaseman[1] + shortstop[1] + catcher[1];
												lineups++;
												if (totalProjection > bestTotalProjection) {
													console.log('totalProjection > bestTotalProjection');
													if (lineups > 1) {
														var bestPitcher2 = bestPitcher;
														var bestOutfielderOne2 = bestOutfielderOne;
														var bestOutfielderTwo2 = bestOutfielderTwo;
														var bestOutfielderThree2 = bestOutfielderThree;
														var bestFirstBaseman2 = bestFirstBaseman;
														var bestSecondBaseman2 = bestSecondBaseman;
														var bestThirdBaseman2 = bestThirdBaseman;
														var bestShortstop2 = bestShortstop;
														var bestCatcher2 = bestCatcher;
														var bestTeam2 = [bestPitcher2, bestCatcher2, bestFirstBaseman2, bestSecondBaseman2, bestThirdBaseman2, bestShortstop2, bestOutfielderOne2, bestOutfielderTwo2, bestOutfielderThree2];
														bestTotalProjection2 = bestTotalProjection;
														var bestCapSpace2 = bestCapSpace;
													}
													var bestPitcher = pitcher;
													var bestOutfielderOne = outfielderOne;
													var bestOutfielderTwo = outfielderTwo;
													var bestOutfielderThree = outfielderThree;
													var bestFirstBaseman = firstBaseman;
													var bestSecondBaseman = secondBaseman;
													var bestThirdBaseman = thirdBaseman;
													var bestShortstop = shortstop;
													var bestCatcher = catcher;
													var bestTeam = [bestPitcher, bestCatcher, bestFirstBaseman, bestSecondBaseman, bestThirdBaseman, bestShortstop, bestOutfielderOne, bestOutfielderTwo, bestOutfielderThree];
													bestTotalProjection = totalProjection;
													var bestCapSpace = capSpace;
												} else if (totalProjection > bestTotalProjection2) {
													console.log('totalProjection > bestTotalProjection2');
													var bestPitcher2 = pitcher;
													var bestOutfielderOne2 = outfielderOne;
													var bestOutfielderTwo2 = outfielderTwo;
													var bestOutfielderThree2 = outfielderThree;
													var bestFirstBaseman2 = firstBaseman;
													var bestSecondBaseman2 = secondBaseman;
													var bestThirdBaseman2 = thirdBaseman;
													var bestShortstop2 = shortstop;
													var bestCatcher2 = catcher;
													var bestTeam2 = [bestPitcher2, bestCatcher2, bestFirstBaseman2, bestSecondBaseman2, bestThirdBaseman2, bestShortstop2, bestOutfielderOne2, bestOutfielderTwo2, bestOutfielderThree2];
													bestTotalProjection2 = totalProjection;
													var bestCapSpace2 = capSpace;
													if (catcherIndex === 0) {
														if (shortstopIndex === 0) {
															if (thirdBasemanIndex === 0) {
																if (secondBasemanIndex === 0) {
																	if (firstBasemanIndex === 0) {
																		if (outfielderThreeIndex === 0) {
																			if (outfielderTwoIndex === 0) {
																				if (outfielderOneIndex === 0) {
																					if (pitcherIndex === 0) {
																						console.log(bestTeam);
																						console.log(bestTotalProjection);
																						console.log('$' + bestCapSpace);
																					}
																					pitcherIndex = pitchers.length;
																				}
																				outfielderOneIndex = outfielders.length;
																			}
																			outfielderTwoIndex = outfieldersTwo.length;
																		}
																		outfielderThreeIndex = outfieldersThree.length;
																	}
																	firstBasemanIndex = firstBasemen.length;
																}
																secondBasemanIndex = secondBasemen.length;
															}
															thirdBasemanIndex = thirdBasemen.length;
														}
														shortstopIndex = shortstops.length;
													}
													catcherIndex = catchers.length;
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

fs.readFile('player_lists/mlb.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	fs.readFile('projections/mlb/ps.txt', { encoding: 'utf8' }, function(err, pitcherData) {
		allPitchers = preparePlayersArray(pitcherData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/ofs.txt', { encoding: 'utf8' }, function(err, outfielderData) {
		allOutfielders = preparePlayersArray(outfielderData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/1bs.txt', { encoding: 'utf8' }, function(err, firstBasemanData) {
		allFirstBasemen = preparePlayersArray(firstBasemanData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/2bs.txt', { encoding: 'utf8' }, function(err, secondBasemanData) {
		allSecondBasemen = preparePlayersArray(secondBasemanData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/3bs.txt', { encoding: 'utf8' }, function(err, thirdBasemanData) {
		allThirdBasemen = preparePlayersArray(thirdBasemanData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/sss.txt', { encoding: 'utf8' }, function(err, shortstopData) {
		allShortstops = preparePlayersArray(shortstopData, projectionColumn);
		pickTeam();
	});
	fs.readFile('projections/mlb/cs.txt', { encoding: 'utf8' }, function(err, catcherData) {
		allCatchers = preparePlayersArray(catcherData, projectionColumn);
		pickTeam();
	});
});
