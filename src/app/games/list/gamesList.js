'use strict';

angular.module('twitchdata.games.list', [])
  .controller('GamesListCtrl', function ($http) {
    $http.get('http://localhost:8080/api/v1/games').then(function (res) {
      this.games = res.data.games;
      console.log(this.games);
    }.bind(this));
  });
