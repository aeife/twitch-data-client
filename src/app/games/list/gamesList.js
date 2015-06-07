'use strict';

angular.module('twitchdata.games.list', ['twitchdata.components.api.games'])
  .controller('GamesListCtrl', function ($http, gameService) {
    var GamesListCtrl = this;

    var fetchData = function () {
      gameService.getGames({limit: GamesListCtrl.pagination.pageSize, offset: (GamesListCtrl.pagination.currentPage-1) * GamesListCtrl.pagination.pageSize}).then(function (res) {
        GamesListCtrl.games = res.data.games;
      });
    };

    var init = function () {
      fetchData();
    };

    GamesListCtrl.pagination = {
      currentPage: 1,
      pageSize: 50,
      update: fetchData
    };

    init();
  });
