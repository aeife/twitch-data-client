'use strict';

angular.module('twitchdata', [
  'twitchdata.menu',
  'twitchdata.footer',
  'twitchdata.dashboard',
  'twitchdata.version',
  'twitchdata.games.list',
  'twitchdata.games.detail',
  'twitchdata.games.compare',
  'twitchdata.channels.list',
  'twitchdata.channels.detail',
  'twitchdata.channels.compare',
  'twitchdata.components.api.games',
  'twitchdata.components.api.generalStats',
  'ui.router',
  'ui.bootstrap',
  'angulartics',
  'angulartics.google.analytics'
  ])
  .config(function ($locationProvider, $stateProvider, $compileProvider, gameServiceProvider, generalStatsServiceProvider, channelServiceProvider) {
    if (TD.ENVIRONMENT === 'PRODUCTION') {
      $compileProvider.debugInfoEnabled(false);
    }

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
        url: '/games/:gameName?chart&zoom',
        templateUrl: 'app/games/detail/gameDetail.tpl.html',
        controller: 'GameDetailCtrl',
        controllerAs: 'GameDetailCtrl'
      })
      .state('channels', {
        url: '/channels',
        templateUrl: 'app/channels/list/channelsList.tpl.html',
        controller: 'ChannelsListCtrl',
        controllerAs: 'ChannelsListCtrl'
      })
      .state('channelsCompare', {
        url: '/channels/compare/:channelNames',
        params: {
          channelNames: {
            squash: true,
            value: null
          }
        },
        templateUrl: 'app/channels/compare/channelsCompare.tpl.html',
        controller: 'ChannelsCompareCtrl',
        controllerAs: 'ChannelsCompareCtrl'
      })
      .state('channelDetail', {
        url: '/channels/:channelName?chart&zoom',
        templateUrl: 'app/channels/detail/channelsDetail.tpl.html',
        controller: 'ChannelDetailCtrl',
        controllerAs: 'ChannelDetailCtrl'
      })
      .state('version', {
        url: '/version',
        templateUrl: 'app/version/version.tpl.html',
        controller: 'VersionCtrl',
        controllerAs: 'VersionCtrl'
      })
      .state('faq', {
        url: '/faq',
        templateUrl: 'app/faq/faq.tpl.html'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/about/about.tpl.html'
      })
      .state('privacy', {
        url: '/privacy',
        templateUrl: 'app/privacy/privacy.tpl.html'
      })
      .state('otherwise', {
          url: '*path',
          templateUrl: 'app/404/404.tpl.html'
      });

    gameServiceProvider.config.setBaseUrl('/api/v1');
    channelServiceProvider.config.setBaseUrl('/api/v1');
    generalStatsServiceProvider.config.setBaseUrl('/api/v1');

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
  })
  .constant('TD_CONFIG', TD);
