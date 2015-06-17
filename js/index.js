var app = angular.module('app', []);

app.controller("MainCtrl", function($scope, $interval, $timeout) {
  $scope.curDollar = 1000;
  $scope.roi = 0.8;
  $scope.variance = 0.7;
  $scope.log = [];
  $scope.games = {};
  $scope.tiers = ["Small Game", "Medium Game", "Large Game", "Epic Game", "Legendary Game"];
  $scope.costs = [1000, 20000, 130000, 2000000, 40000000];
  $scope.times = [20, 100, 500, 800, 1200];
  
  $scope.initialAwareness = [0.2, 0.4, 0.6, 0.8, 1];

  $scope.recurringSalesOn = true;

  $scope.projects = [];
  $scope.start = function() {
    $scope.started = true;
  }

  $scope.games = [];
  $scope.name = "";
  $scope.makeGame = function(tier) {
    $scope.curDollar -= $scope.costs[tier];

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
      max: $scope.times[$scope.curTier]
    }
  }

  $scope.boost = function() {
    var cost = $scope.costs[$scope.curProject.tier] * 0.1;
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
  $interval(function() {
    var oldDollar = $scope.curDollar;
    if ($scope.curProject) {
      $scope.curProject.progress++;
      if ($scope.curProject.progress >= $scope.curProject.max) {
        $scope.games[$scope.curProject.tier];
        var investment = $scope.costs[$scope.curProject.tier];

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
          awareness: $scope.initialAwareness[$scope.curProject.tier]
        }

        $scope.games.push(game);
        $scope.log.unshift("Your " + $scope.tiers[$scope.curProject.tier] + ", " + $scope.curProject.name + "  performed " + performance + ", it made $" + reward);
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

    if ($scope.curDollar === oldDollar && $scope.games.length > 0 && $scope.curDollar < $scope.costs[0] * 0.1) {
      $timeout(function() {
        $scope.gameOver = true;
      }, 2500);
    }

  }, 1000);
});