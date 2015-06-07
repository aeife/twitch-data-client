'use strict';

angular.module('twitchdata.components.api.totalStats', [])
  .provider('totalStatsService', function () {
    var _baseUrl;
    this.config = {
      setBaseUrl: function (baseUrl) {
        _baseUrl = baseUrl;
      }
    };

    this.$get = function ($http) {
      var totalStatsService = {
        getTotalStats: function () {
          return $http({
            url: _baseUrl + '/stats',
            method: 'GET'
          });
        }
      };

      return totalStatsService;
    };
  });
