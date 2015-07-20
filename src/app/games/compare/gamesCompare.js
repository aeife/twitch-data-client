'use strict';

angular.module('twitchdata.games.compare', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.statistics',
  'highcharts-ng'
])
  .controller('GamesCompareCtrl', function ($http, $stateParams, $q, $scope, gameService, statisticsService, chartService) {
    var GamesCompareCtrl = this;
    console.log($stateParams.gameNames.split(','));
    this.viewersChartConfig = chartService.getBaseConfig();
    this.channelsChartConfig = chartService.getBaseConfig();
    this.ratioChartConfig = chartService.getBaseConfig();
    this.games = [];

    var fetchGameData = function (gameName) {
      var game;
      var stats;
      var requests = [];

      requests.push(gameService.getGameByName(gameName).then(function (res) {
        game = res.data;
        return res;
      }));

      requests.push(gameService.getStatsForGame(gameName).then(function (res) {
        stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun);
        return res;
      }));

      $q.all(requests).then(function () {
        GamesCompareCtrl.viewersChartConfig.series.push({
          name: game.name,
          data: stats.map(function (stat) {
            return [new Date(stat.collectionRun.date).getTime(), stat.viewers];
          })
        });

        GamesCompareCtrl.channelsChartConfig.series.push({
          name: game.name,
          data: stats.map(function (stat) {
            return [new Date(stat.collectionRun.date).getTime(), stat.channels];
          })
        });

        GamesCompareCtrl.ratioChartConfig.series.push({
          name: game.name,
          data: stats.map(function (stat) {
            return [new Date(stat.collectionRun.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
          })
        });

        GamesCompareCtrl.games.push(game);
      });
    };

    GamesCompareCtrl.addGame = function (gameName) {
      var exists = GamesCompareCtrl.games.some(function (game) {
        return game.name === gameName;
      });

      if (!exists) {
        fetchGameData(gameName);
      }

      GamesCompareCtrl.newGame = '';
    };

    GamesCompareCtrl.removeGame = function (gameName) {
      _.remove(GamesCompareCtrl.games, function (game) {
        return game.name === gameName;
      });
      _.remove(GamesCompareCtrl.viewersChartConfig.series, function (serie) {
        return serie.name === gameName;
      });
      _.remove(GamesCompareCtrl.channelsChartConfig.series, function (serie) {
        return serie.name === gameName;
      });
      _.remove(GamesCompareCtrl.ratioChartConfig.series, function (serie) {
        return serie.name === gameName;
      });
    };

    GamesCompareCtrl.getGames = function (name) {
      return gameService.getGames({
        limit: 100,
        offset: 0,
        search: name
      }).then(function (res) {
        return res.data.games.map(function (game) {
          return game.name;
        });
      });
    };

    $scope.$watch(function () {
      return GamesCompareCtrl.newGame;
    }, function (newGame) {
      if (newGame && newGame.length) {
        GamesCompareCtrl.addGame(newGame);
      }
    });

    var init = function () {
      var gameNames = $stateParams.gameNames.split(',');
      console.log(gameNames);
      gameNames.forEach(function (gameName) {
        fetchGameData(gameName);
      });
    };

    init();
  });
