'use strict';

angular.module('twitchdata.components.twitchApi', [])
  .provider('twitchApiClient', function () {
    var _baseUrl = 'https://api.twitch.tv/kraken';
    this.$get = function ($http) {
      var titchApiClient = {
        getTopStreamsForGame: function (game, options) {
          if (!options) {
            options = {};
          }
          _.defaults(options, {
            limit: 5,
            game: game,
            callback: 'JSON_CALLBACK'
          });

          return $http({
            url: _baseUrl + '/streams',
            method: 'JSONP',
            params: options
          });
        },
        getLiveStreamData: function (channelName) {
          var options = {
            callback: 'JSON_CALLBACK'
          };

          return $http({
            url: _baseUrl + '/streams/' + channelName,
            method: 'JSONP',
            params: options
          });
        }
      };

      return titchApiClient;
    };
  });
