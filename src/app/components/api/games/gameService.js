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
            sortAttr: 'viewers',
            sortType: 'last'
          });
          return $http({
            url: _baseUrl + '/games',
            method: 'GET',
            params: {
              limit: options.limit,
              offset: options.offset,
              sortAttr: options.sortAttr,
              sortType: options.sortType,
              order: options.order,
              ratio: options.ratio,
              search: options.search
            }
          });
        },
        getGameById: function (id) {
          return $http({
            url: _baseUrl + '/games/' + id,
            method: 'GET'
          });
        }
      };

      return gameService;
    };
  });
