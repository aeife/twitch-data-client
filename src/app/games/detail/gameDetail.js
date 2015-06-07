'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'nvd3ChartDirectives'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService) {
    gameService.getGameById($stateParams.gameId).then(function (res) {
      this.game = res.data;

      this.viewersChartData = [{
        key: 'viewers',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.dateCreated).getTime(), stat.viewers];
        })
      }];

      this.channelsChartData = [{
        key: 'channels',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.dateCreated).getTime(), stat.channels];
        })
      }];
    }.bind(this));

    this.xAxisTickFormat = function(){
      return function(d){
        return d3.time.format('%b %d %I %p')(new Date(d));
      };
    }
  });
