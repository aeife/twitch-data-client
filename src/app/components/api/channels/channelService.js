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
                viewers: stat.v,
                followers: stat.f
              };
              if (typeof stat.h !== 'undefined') {
                statObj.hour = stat.h;
              }
              if (typeof stat.d !== 'undefined') {
                statObj.day = stat.d;
              }
              if (typeof stat.m !== 'undefined') {
                statObj.month = stat.m;
              }
              if (typeof stat.y !== 'undefined') {
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
