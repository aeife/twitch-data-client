'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'nvd3ChartDirectives',
  'twitchdata.components.twitchApi'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService, twitchApiClient) {
    var GameDetailCtrl = this;

    gameService.getGameById($stateParams.gameId).then(function (res) {
      this.game = res.data;

      twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
        console.log(res.data.streams);
        GameDetailCtrl.currentTopStreams = res.data.streams;
      });

      this.viewersChartData = [{
        key: 'viewers',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.viewers];
        })
      }];

      this.channelsChartData = [{
        key: 'channels',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.channels];
        })
      }];

      this.channelViewerChartData = [{
        key: 'ratio',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      }];
    }.bind(this));

    this.xAxisTickFormat = function(){
      return function(d){
        return d3.time.format('%b %d %I %p')(new Date(d));
      };
    };
  });
