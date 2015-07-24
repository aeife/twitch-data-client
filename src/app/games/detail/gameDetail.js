'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.giantbombApi',
  'twitchdata.components.statistics',
  'highcharts-ng'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, $q, gameService, twitchApiClient, giantbombApiClient, chartService, statisticsService) {
    var GameDetailCtrl = this;
    this.getFormattedName = function () {
      if (this.game) {
        var test = this.game.name.replace(/\s/g, '-').toLowercase;
        return test;
      }
    };

    var requests = [];

    requests.push(gameService.getGameByName($stateParams.gameName).then(function (res) {
      this.game = res.data;
      giantbombApiClient.getDataForGame(this.game.giantbombId).then(function (data) {
        GameDetailCtrl.giantbomb = data;
      });
      twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
        GameDetailCtrl.currentTopStreams = res.data.streams;
      });
      return res;
    }.bind(this)));

    requests.push(gameService.getStatsForGame($stateParams.gameName).then(function (res) {
      this.stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun);
      this.trend = {
        day: statisticsService.getGrowthTrendOfLast('day', this.stats),
        week: statisticsService.getGrowthTrendOfLast('week', this.stats),
        month: statisticsService.getGrowthTrendOfLast('month', this.stats)
      };
      this.peak = statisticsService.getPeak(this.stats);
      return res;
    }.bind(this)));

    $q.all(requests).then(function () {
      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.viewers];
        })
      });

      this.channelsChartConfig = chartService.getBaseConfig();
      this.channelsChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.channels];
        })
      });

      this.ratioChartConfig = chartService.getBaseConfig();
      this.ratioChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      });
    }.bind(this));

    this.currentChart = 'viewers';
  });
