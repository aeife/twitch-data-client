'use strict';

angular.module('twitchdata.games.list', ['twitchdata.components.api.games'])
  .controller('GamesListCtrl', function ($http, gameService) {
    gameService.getGames().then(function (res) {
      this.games = res.data.games;
      console.log(this.games);
    }.bind(this));
  });
