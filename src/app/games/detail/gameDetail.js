'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'nvd3ChartDirectives'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService) {
    gameService.getGameById($stateParams.gameId).then(function (res) {
      this.game = res.data;

      this.exampleData = [{
        key: 'viewers',
        values: this.game.stats.map(function (stat) {
          return [new Date(stat.created_at).getTime(), stat.viewers];
        })
      }];
    }.bind(this));

    this.xAxisTickFormatFunction = function(){
      return function(d){
        return d3.time.format('%b %d %I %p')(new Date(d));
      };
    }
  });
