App = Ember.Application.create();

App.Router.map(function() {
	this.route("projections");
	this.route("about");
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		return [
			{
				position: "QB",
				name: "Matt Ryan",
				projection: 22.88,
				salary: 7900
			}, {
				position: "RB",
				name: "Le\'veon Bell",
				projection: 22.88,
				salary: 9600
			}, {
				position: "RB",
				name: "Jamaal Charles",
				projection: 19.98,
				salary: 9200
			}
		];
	}
});
