'use strict';

angular.module('twitchdata.components.api.games', [])
  .provider('gameService', function () {
    var _baseUrl;
    this.config = {
      setBaseUrl: function (baseUrl) {
        _baseUrl = baseUrl;
      }
    };

    this.$get = function ($http) {
      var gameService = {
        getGames: function (options) {
          if (!options) {
            options = {};
          }
          _.defaults(options, {
            limit: 100,
            offset: 0,
            sortAttr: 'viewers'
          });
          return $http({
            url: _baseUrl + '/games',
            method: 'GET',
            params: {
              limit: options.limit,
              offset: options.offset,
              sortAttr: options.sortAttr,
              order: options.order,
              ratio: options.ratio,
              search: options.search
            }
          });
        },
        getGameByName: function (name) {
          return $http({
            url: _baseUrl + '/games/' + name,
            method: 'GET'
          });
        },
        getStatsForGame: function (name) {
          return $http({
            url: _baseUrl + '/games/' + name + '/stats',
            method: 'GET'
          });
        },
      };

      return gameService;
    };
  });
