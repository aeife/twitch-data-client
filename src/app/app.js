'use strict';

angular.module('twitchdata', [
  'twitchdata.menu',
  'twitchdata.footer',
  'twitchdata.dashboard',
  'twitchdata.games.list',
  'twitchdata.games.detail',
  'twitchdata.games.compare',
  'twitchdata.channels.list',
  'twitchdata.channels.detail',
  'twitchdata.channels.compare',
  'twitchdata.components.api.games',
  'twitchdata.components.api.generalStats',
  'ui.router',
  'ui.bootstrap'
  ])
  .config(function ($locationProvider, $stateProvider, gameServiceProvider, generalStatsServiceProvider, channelServiceProvider) {
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
        url: '/channels/:channelName',
        templateUrl: 'app/channels/detail/channelsDetail.tpl.html',
        controller: 'ChannelDetailCtrl',
        controllerAs: 'ChannelDetailCtrl'
      })
      .state('beta', {
        url: '/beta',
        templateUrl: 'app/beta/beta.tpl.html',
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/about/about.tpl.html',
      })
      .state('privacy', {
        url: '/privacy',
        templateUrl: 'app/privacy/privacy.tpl.html',
      });

    gameServiceProvider.config.setBaseUrl('/api/v1');
    channelServiceProvider.config.setBaseUrl('/api/v1');
    generalStatsServiceProvider.config.setBaseUrl('/api/v1');

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
  });
