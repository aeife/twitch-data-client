'use strict';

angular.module('twitchdata.games.list', ['twitchdata.components.api.games'])
  .controller('GamesListCtrl', function ($http, $state, gameService) {
    var GamesListCtrl = this;

    var fetchData = function () {
      gameService.getGames({
        limit: GamesListCtrl.pagination.pageSize,
        offset: (GamesListCtrl.pagination.currentPage-1) * GamesListCtrl.pagination.pageSize,
        sortAttr: GamesListCtrl.sorting.attr,
        order: (GamesListCtrl.sorting.reverse) ? 'asc' : 'desc'
      }).then(function (res) {
        GamesListCtrl.games = res.data.games;
        GamesListCtrl.totalGames = res.data.count;
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

    GamesListCtrl.sorting = {
      attr: 'viewers',
      reverse: false
    };

    GamesListCtrl.sortBy = function (sortAttr) {
      if (GamesListCtrl.sorting.attr === sortAttr) {
        GamesListCtrl.sorting.reverse = !GamesListCtrl.sorting.reverse;
      } else {
        GamesListCtrl.sorting.attr = sortAttr;
        GamesListCtrl.sorting.reverse = false;
      }

      GamesListCtrl.pagination.currentPage = 1;
      GamesListCtrl.pagination.update();
    };
    
    GamesListCtrl.goToGameDetailView = function (gameId) {
      $state.go('gameDetail', {gameId: gameId});
    };

    init();
  });
