'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.giantbombApi',
  'highcharts-ng'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService, twitchApiClient, giantbombApiClient, chartService) {
    var GameDetailCtrl = this;
    this.getFormattedName = function () {
      if (this.game) {
        var test = this.game.name.replace(/\s/g, '-').toLowercase;
        console.log(test);
        return test;
      }
    };

    gameService.getGameByName($stateParams.gameName).then(function (res) {
      this.game = res.data;

      giantbombApiClient.getDataForGame(this.game.giantbombId).then(function (data) {
        GameDetailCtrl.giantbomb = data;
      });

      twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
        GameDetailCtrl.currentTopStreams = res.data.streams;
      });

      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.viewers];
        })
      });

      this.channelsChartConfig = chartService.getBaseConfig();
      this.channelsChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.channels];
        })
      });

      this.ratioChartConfig = chartService.getBaseConfig();
      this.ratioChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      });
    }.bind(this));
  });
