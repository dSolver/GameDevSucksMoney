var app = angular.module('app', []);

app.controller("MainCtrl", function($scope, $interval, $timeout) {
	$scope.curDollar = 1000;
	$scope.roi = 0.8;
	$scope.variance = 0.7;
	$scope.log = [];
	$scope.games = {};

	$scope.allTiers = [
		{
			name: "Indie Game",
			cost: 1000,
			time: 20,
			initialAwareness: 0.2,
			unlockRequirement: null
		},
		{
			name: "Small Game",
			cost: 5000,
			time: 30,
			initialAwareness: 0.3,
			unlockRequirement: null
		},
		{
			name: "Medium Game",
			cost: 20000,
			time: 100,
			initialAwareness: 0.4,
			unlockRequirement: null
		},
		{
			name: "Large Game",
			cost: 130000,
			time: 500,
			initialAwareness: 0.6,
			unlockRequirement: "cost"
		},
		{
			name: "Epic Game",
			cost: 2000000,
			time: 800,
			initialAwareness: 0.8,
			unlockRequirement: "cost"
		},
		{
			name: "Legendary Game",
			cost: 40000000,
			time: 1200,
			initialAwareness: 1,
			unlockRequirement: "success"
		}
	];
	$scope.tiers = [];
	
	$scope.timer = {
	  gameSpeed: 1,
	  gameSpeedCounter: 0,
	  awarenessMax: 10,
	  awarenessCounter: 0,
	  progressMax: 1,
	  progressCounter: 0
	}

	function initializeTiers() {
		$scope.tiers = [];
		for(var i = 0; i < $scope.allTiers.length; i++) {
		  var tier = $scope.allTiers[i];

		  if(tier.unlockRequirement === null){
		    $scope.tiers.push(tier);
		  }
		  else if(tier.unlockRequirement === "cost") {
		    if($scope.curDollar > tier.cost*0.1) {
		      $scope.tiers.push(tier);
		    }
		  }
		  else if(tier.unlockRequirement === "success") {
		    // add success criteria
		  }

		}
	}
	initializeTiers();

	$scope.recurringSalesOn = true;

	$scope.projects = [];
	$scope.start = function() {
	  $scope.curDollar = 4200;
	  $scope.roi = 0.8;
	  $scope.variance = 0.7;
		$scope.started = true;
	}
	$scope.start();

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
	
	$scope.startProject = function() {
		$scope.requestName = false;
		$scope.curProject = {
			name: $scope.name,
			tier: $scope.curTier,
			investment: $scope.curTier.cost,
			progress: 0,
			max: $scope.curTier.time
		}
	}

	$scope.boost = function() {
		var cost = $scope.curProject.tier.cost * 0.1;
		if($scope.curDollar < cost) {
		  return false;
		}
		
    var msg = "You spent $" + cost + " to speed up development time, it ";
		var max = Math.floor($scope.curProject.max / 10);
		var result = randDec(-max/4, max);
		if(result >= max/2) {
		  msg += "went fantastic!";
		} else if(result >= 0 && result < max/2) {
		  msg += "went alright.";
		} else {
		  msg += "went disastrously.";
		}

		$scope.curProject.progress += result;
		result = Math.round(result / $scope.curProject.max * 100);
		msg += " (" + result + "%)";
		$scope.curDollar -= cost
		$scope.curProject.investment += cost/2; // managers trying to speed up development isn't as worthwhile
		$scope.log.unshift(msg);
	}
	
	$scope.changeGameSpeed = function(val) {
	  $scope.timer.gameSpeed = val;
	}

	$scope.teams = [];
	
	$scope.boostAwareness = function(game){
		$scope.curDollar -= Math.round(game.sales/3);
		game.awareness += randInt(10, 50)/100;
		if(game.awareness > 1){
			game.awareness = 1;
		}
	}
	$interval(gameTick, 100);
	
	function randInt(min, max) {
	  if(!min) min = 0;
	  if(!max) max = 100;
	  return Math.floor(Math.random() * (max - min) + min);
	}

	function randDec(min, max) {
	  if(!min) min = 0;
	  if(!max) max = 1;
	  return Math.random() * (max - min) + min;
	}
	
	function getReleaseProjectPerformance(initialSales, investment) {
		var ratio = initialSales / investment;
		
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
		return performance;
	}

	function gameTick() {
	  $scope.timer.gameSpeedCounter += $scope.timer.gameSpeed;
	  while($scope.timer.gameSpeedCounter >= 1) {
	    $scope.timer.gameSpeedCounter--;
	    
  		var oldDollar = $scope.curDollar;
  		$scope.timer.progressCounter++;
  		while($scope.timer.progressCounter >= $scope.timer.progressMax) {
  		  $scope.timer.progressCounter -= $scope.timer.progressMax;
  		  
    		if ($scope.curProject) {
    			$scope.curProject.progress += 0.1;
    			if ($scope.curProject.progress >= $scope.curProject.max) {
    				$scope.games[$scope.curProject.tier];

    				var investment = $scope.curProject.investment;
    				var initialSales = investment * (1 - $scope.variance) + Math.ceil(Math.random() * investment * (($scope.variance) * 2 * $scope.roi));
    				var performance = getReleaseProjectPerformance(initialSales, investment);
    
            initialSales = Math.round(initialSales);
    				$scope.curDollar += initialSales;
    				
    				var game = {
    					name: $scope.curProject.name,
    					sales: initialSales,
    					recurringSales: 0,
    					awareness: $scope.curProject.tier.initialAwareness,
    					releaseSales: initialSales,
    					releaseAwareness: $scope.curProject.tier.initialAwareness,
    					releasePerformance: performance
    				}
    
    				$scope.games.push(game);
    				$scope.log.unshift("Your " + $scope.curProject.tier.name + ", " + $scope.curProject.name + "  performed " + performance + ", it made $" + initialSales);
    				$scope.curProject = null;
    
    			}
    		}
  		}
  
  		$scope.timer.awarenessCounter++;
  		while($scope.timer.awarenessCounter >= $scope.timer.awarenessMax) {
  		  $scope.timer.awarenessCounter -= $scope.timer.awarenessMax;
  		  
    		if ($scope.games.length > 0 && $scope.recurringSalesOn) {
    			angular.forEach($scope.games, function(game, index) {
    				if (game.awareness > 0) {
    					var recurringsale = game.releaseSales / 20 * game.awareness;
    
    					$scope.curDollar += recurringsale;
    					game.recurringSales += recurringsale;
    
    					game.awareness -= randDec(0.005,0.015);
    
    					if (game.awareness < 0) {
    						game.awareness = 0;
    					}
    				}
    
    			});
    		}
  		}
  
  		if ($scope.curDollar === oldDollar && $scope.games.length > 0 && $scope.curDollar < $scope.tiers[0].cost * 0.1) {
  			$timeout(function() {
  				$scope.gameOver = true;
  			}, 2500);
  		}
	  }
	}
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});