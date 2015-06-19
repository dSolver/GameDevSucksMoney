var app = angular.module('app', []);

app.controller("MainCtrl", function($scope, $interval, $timeout) {
	$scope.curDollar = 1000;
	$scope.roi = 0.8;
	$scope.variance = 0.7;
	$scope.log = [];
	$scope.games = {};
	
	$scope.allTiers = [
		{
			name: "Small Game",
			cost: 1000,
			time: 20,
			initialAwareness: 0.2
		},
		{
			name: "Medium Game",
			cost: 20000,
			time: 100,
			initialAwareness: 0.4
		},
		{
			name: "Large Game",
			cost: 130000,
			time: 500,
			initialAwareness: 0.6
		},
		{
			name: "Epic Game",
			cost: 2000000,
			time: 800,
			initialAwareness: 0.8
		},
		{
			name: "Legendary Game",
			cost: 40000000,
			time: 1200,
			initialAwareness: 1
		}
	];
	$scope.tiers = [];

  // plumbing for tier unlocks over time
	function initializeTiers() {
		$scope.tiers = [];
		for(var i = 0; i <= $scope.allTiers.length; i++) {
			$scope.tiers.push($scope.allTiers[i]);
		}
	}
	initializeTiers();

	$scope.recurringSalesOn = true;

	$scope.projects = [];
	$scope.start = function() {
		$scope.started = true;
	}

	$scope.games = [];
	$scope.name = "";
	$scope.makeGame = function(tier) {
		if($scope.curDollar < tier.cost) {
			return false;
		}
		$scope.curDollar -= tier.cost;

		$scope.requestName = true;
		$scope.name = "";
		$scope.curTier = tier;
	}
	$scope.giveMoney = function(amount){
		$scope.curDollar += amount;
		
		$scope.log.push("dSolver thanks you for thinking about him, and rewarded you with $"+amount);
	}
	$scope.setProject = function() {
		$scope.requestName = false;
		$scope.curProject = {
			name: $scope.name,
			tier: $scope.curTier,
			progress: 0,
			max: $scope.curTier.time
		}
	}

	$scope.boost = function() {
		var cost = $scope.curProject.tier.cost * 0.1;
		$scope.curDollar -= cost

		$scope.log.unshift("You spent $" + cost + " to speed up development time");
		$scope.curProject.progress += Math.floor($scope.curProject.max / 10);
	}

	$scope.teams = [];
	
	$scope.boostAwareness = function(game){
		$scope.curDollar -= Math.round(game.sales/3);
		game.awareness += Math.floor(Math.random()*5)/10 + 0.1;
		if(game.awareness > 1){
			game.awareness = 1;
		}
	}
	$interval(gameTick, 1000);

	function gameTick() {
		var oldDollar = $scope.curDollar;
		if ($scope.curProject) {
			$scope.curProject.progress++;
			if ($scope.curProject.progress >= $scope.curProject.max) {
				$scope.games[$scope.curProject.tier];
				var investment = $scope.curProject.tier.cost;

				var reward = investment * (1 - $scope.variance) + Math.ceil(Math.random() * investment * (($scope.variance) * 2 * $scope.roi));

				var ratio = reward / investment;
				var performances = [
    				"dismally",
    				"pretty bad",
    				"alright",
    				"better than expected",
    				"pretty well",
    				"amazingly"
				];
				var performance;
				if (ratio < 0.5) {
					performance = performances[0];
				} else if (ratio < 0.75) {
					performance = performances[1];
				} else if (ratio < 1.12) {
					performance = performances[2];
				} else if (ratio < 1.4) {
					performance = performances[3];
				} else if (ratio < 1.8) {
					performance = performances[4];
				} else {
					performance = performances[5];
				}

				$scope.curDollar += reward;
				var game = {
					name: $scope.curProject.name,
					sales: reward,
					recurringSales: 0,
					awareness: $scope.curProject.tier.initialAwareness
				}

				$scope.games.push(game);
				$scope.log.unshift("Your " + $scope.curProject.tier.name + ", " + $scope.curProject.name + "  performed " + performance + ", it made $" + reward);
				$scope.curProject = null;

			}
		}

		if ($scope.games.length > 0 && $scope.recurringSalesOn) {
			angular.forEach($scope.games, function(game, index) {
				if (game.awareness > 0) {
					var recurringsale = game.sales / 10 * game.awareness;

					$scope.curDollar += recurringsale;
					game.recurringSales += recurringsale;

					game.awareness -= 0.02;

					if (game.awareness < 0) {
						game.awareness = 0;
					}
				}

			});
		}

		if ($scope.curDollar === oldDollar && $scope.games.length > 0 && $scope.curDollar < $scope.tiers[0].cost * 0.1) {
			$timeout(function() {
				$scope.gameOver = true;
			}, 2500);
		}
	}
});