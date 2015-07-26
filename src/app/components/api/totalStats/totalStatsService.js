'use strict';

angular.module('twitchdata.components.api.generalStats', [])
  .provider('generalStatsService', function () {
    var _baseUrl;
    this.config = {
      setBaseUrl: function (baseUrl) {
        _baseUrl = baseUrl;
      }
    };

    this.$get = function ($http) {
      var generalStatsService = {
        getGeneralStats: function () {
          return $http({
            url: _baseUrl + '/stats',
            method: 'GET'
          }).then(function (res) {
            res.data.stats = res.data.stats.map(function (stat) {
              var statObj = {
                date: stat.dt,
                channels: stat.c,
                viewers: stat.v
              };
              if (stat.h) {
                statObj.hour = stat.h;
              }
              if (stat.d) {
                statObj.day = stat.d;
              }
              if (stat.m) {
                statObj.month = stat.m;
              }
              if (stat.y) {
                statObj.year = stat.y;
              }
              return statObj;
            });
            return res;
          });
        }
      };

      return generalStatsService;
    };
  });
