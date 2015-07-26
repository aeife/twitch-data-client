'use strict';

angular.module('twitchdata.components.api.channels', [])
  .provider('channelService', function () {
    var _baseUrl;
    this.config = {
      setBaseUrl: function (baseUrl) {
        _baseUrl = baseUrl;
      }
    };

    this.$get = function ($http) {
      var channelService = {
        getChannels: function (options) {
          if (!options) {
            options = {};
          }
          _.defaults(options, {
            limit: 100,
            offset: 0,
            sortAttr: 'viewers'
          });
          return $http({
            url: _baseUrl + '/channels',
            method: 'GET',
            params: {
              limit: options.limit,
              offset: options.offset,
              sortAttr: options.sortAttr,
              order: options.order,
              search: options.search
            }
          });
        },
        getChannelByName: function (name) {
          return $http({
            url: _baseUrl + '/channels/' + name,
            method: 'GET'
          });
        },
        getStatsForChannel: function (name) {
          return $http({
            url: _baseUrl + '/channels/' + name + '/stats',
            method: 'GET'
          }).then(function (res) {
            res.data.stats = res.data.stats.map(function (stat) {
              var statObj = {
                date: new Date(stat.dt),
                channels: stat.c,
                followers: stat.f
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
            res.data.lastCollectionRun.date = new Date(res.data.lastCollectionRun.date);
            return res;
          });
        },
      };

      return channelService;
    };
  });
