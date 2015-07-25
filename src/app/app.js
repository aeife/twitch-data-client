'use strict';

angular.module('twitchdata', [
  'twitchdata.menu',
  'twitchdata.footer',
  'twitchdata.dashboard',
  'twitchdata.games.list',
  'twitchdata.games.detail',
  'twitchdata.games.compare',
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
      .state('gamesCompare', {
        url: '/games/compare/:gameNames',
        params: {
          gameNames: {
            squash: true,
            value: null
          }
        },
        templateUrl: 'app/games/compare/gamesCompare.tpl.html',
        controller: 'GamesCompareCtrl',
        controllerAs: 'GamesCompareCtrl'
      })
      .state('gameDetail', {
        url: '/games/:gameName',
        templateUrl: 'app/games/detail/gameDetail.tpl.html',
        controller: 'GameDetailCtrl',
        controllerAs: 'GameDetailCtrl'
      });

    gameServiceProvider.config.setBaseUrl('/api/v1');
    totalStatsServiceProvider.config.setBaseUrl('/api/v1');

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
  });
