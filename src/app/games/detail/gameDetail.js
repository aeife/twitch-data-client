'use strict';

angular.module('twitchdata.games.detail', ['twitchdata.components.api.games'])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService) {
    gameService.getGameById($stateParams.gameId).then(function (res) {
      this.game = res.data;
    }.bind(this));
  });
