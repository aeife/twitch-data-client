'use strict';

angular.module('twitchdata', [
  'twitchdata.games.list',
  'twitchdata.components.api.games',
  'ui.router'
  ])
  .config(function ($locationProvider, $stateProvider, gameServiceProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('games', {
        url: '/games',
        templateUrl: 'app/games/list/gamesList.tpl.html',
        controller: 'GamesListCtrl',
        controllerAs: 'GamesListCtrl'
      });

    gameServiceProvider.config.setBaseUrl('http://localhost:8080/api/v1');
  });
