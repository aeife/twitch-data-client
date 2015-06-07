'use strict';

angular.module('twitchdata', [
  'twitchdata.menu',
  'twitchdata.games.list',
  'twitchdata.games.detail',
  'twitchdata.components.api.games',
  'ui.router',
  'ui.bootstrap'
  ])
  .config(function ($locationProvider, $stateProvider, gameServiceProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('games', {
        url: '/games',
        templateUrl: 'app/games/list/gamesList.tpl.html',
        controller: 'GamesListCtrl',
        controllerAs: 'GamesListCtrl'
      })
      .state('gameDetail', {
        url: '/games/:gameId',
        templateUrl: 'app/games/detail/gameDetail.tpl.html',
        controller: 'GameDetailCtrl',
        controllerAs: 'GameDetailCtrl'
      });

    gameServiceProvider.config.setBaseUrl('http://localhost:8080/api/v1');
  });
