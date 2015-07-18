'use strict';

angular.module('twitchdata', [
  'twitchdata.menu',
  'twitchdata.dashboard',
  'twitchdata.games.list',
  'twitchdata.games.detail',
  'twitchdata.components.api.games',
  'twitchdata.components.api.totalStats',
  'ui.router',
  'ui.bootstrap'
  ])
  .config(function ($locationProvider, $stateProvider, gameServiceProvider, totalStatsServiceProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: 'app/dashboard/dashboard.tpl.html',
        controller: 'DashboardCtrl',
        controllerAs: 'DashboardCtrl'
      })
      .state('games', {
        url: '/games',
        templateUrl: 'app/games/list/gamesList.tpl.html',
        controller: 'GamesListCtrl',
        controllerAs: 'GamesListCtrl'
      })
      .state('gameDetail', {
        url: '/games/:gameName',
        templateUrl: 'app/games/detail/gameDetail.tpl.html',
        controller: 'GameDetailCtrl',
        controllerAs: 'GameDetailCtrl'
      });

    gameServiceProvider.config.setBaseUrl('http://localhost:8080/api/v1');
    totalStatsServiceProvider.config.setBaseUrl('http://localhost:8080/api/v1');
  });
