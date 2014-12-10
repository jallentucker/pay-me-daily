var chai = require('chai');
var expect = chai.expect;
var nfl = require('../pay-me-daily-nfl');

var inefficientArray = [
	['Drew Brees', 25.14, 9400],
	['Tom Brady', 23.96, 9600],
	['Matt Ryan', 21.41, 7900],
	['Cam Newton', 20.44, 7800],
	['Joe Flacco', 19.91, 7800],
];

describe('makeFanduelArray()', function() {
	it('populates an array with the relevant data from the FanDuel data string', function() {
		var fanduelDataString = '{"6894":["QB","Aaron Rodgers","86910","23","39","10400",23.5,"12",false,4,"","recent",""],"11432":["WR","Demaryius Thomas","86906","13","1000","9400",19.3,"12",false,2,"Ankle","recent","probable"],"28181":["RB","Le\'Veon Bell","86783","5","1000","9300",19.3,"12",false,0,"","recent",""]}';
		var fanduelArray = [
			['QB', 'Aaron Rodgers', 10400],
			['WR', 'Demaryius Thomas', 9400],
			['RB', 'Le\'Veon Bell', 9300]
		];
		expect(nfl.makeFanduelArray(fanduelDataString)).to.eql(fanduelArray);
	});
});

describe('prepareEfficientArray()', function() {
	it('parses an inefficient array', function() {
		var efficientArray = [
			['Drew Brees', 25.14, 9400],
			['Matt Ryan', 21.41, 7900],
			['Cam Newton', 20.44, 7800],
		];
		expect(nfl.prepareEfficientArray(inefficientArray)).to.eql(efficientArray);
	});
});

describe('removeOnePlayer()', function() {
	it('returns a copy of the first argument array excluding the second argument array', function() {
		var playerToRemove = ['Cam Newton', 20.44, 7800];
		var inefficientArrayTwo = [
			['Drew Brees', 25.14, 9400],
			['Tom Brady', 23.96, 9600],
			['Matt Ryan', 21.41, 7900],
			['Joe Flacco', 19.91, 7800],
		];
		expect(nfl.removeOnePlayer(inefficientArray, playerToRemove)).to.eql(inefficientArrayTwo);
	});
});
