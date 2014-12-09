var chai = require('chai');
var expect = chai.expect;
var nfl = require('../pay-me-daily-nfl');

describe('prepareEfficientArray()', function() {
	it('parses an inefficient array', function() {
		var inefficientArray = [
			['Drew Brees', 25.14, 9400],
			['Tom Brady', 23.96, 9600],
			['Matt Ryan', 21.41, 7900],
			['Cam Newton', 20.44, 7800],
			['Joe Flacco', 19.91, 7800],
		];
		var efficientArray = [
			['Drew Brees', 25.14, 9400],
			['Matt Ryan', 21.41, 7900],
			['Cam Newton', 20.44, 7800],
		];
		expect(nfl.prepareEfficientArray(inefficientArray)).to.eql(efficientArray);
	});
});
