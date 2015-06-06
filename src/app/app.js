'use strict';

angular.module('twitchdata', [
  'twitchdata.games.list',
  'ui.router'
  ])
  .config(function ($locationProvider, $stateProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('games', {
        url: '/games',
        templateUrl: 'app/games/list/gamesList.tpl.html',
        controller: 'GamesListCtrl',
        controllerAs: 'GamesListCtrl'
      });
  });
