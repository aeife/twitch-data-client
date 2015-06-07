'use strict';

angular.module('twitchdata.dashboard', [
  'twitchdata.components.api.games',
  'twitchdata.components.api.totalStats',
  'nvd3ChartDirectives'
  ])
  .controller('DashboardCtrl', function ($http, $state, gameService, totalStatsService) {
    var DashboardCtrl = this;

    var fetchTotalStats = function () {
      totalStatsService.getTotalStats().then(function (res) {
        DashboardCtrl.totalStats = res.data.stats;

        DashboardCtrl.totalViewersChartData = [{
          key: 'viewers',
          values: DashboardCtrl.totalStats.map(function (stat) {
            return [new Date(stat.dateCreated).getTime(), stat.viewers];
          })
        }];

        DashboardCtrl.totalChannelsChartData = [{
          key: 'channels',
          values: DashboardCtrl.totalStats.map(function (stat) {
            return [new Date(stat.dateCreated).getTime(), stat.channels];
          })
        }];
      });
    };

    var init = function () {
      fetchTotalStats();
    };

    DashboardCtrl.xAxisTickFormat = function(){
      return function(d){
        return d3.time.format('%b %d %I %p')(new Date(d));
      };
    };

    init();
  });
