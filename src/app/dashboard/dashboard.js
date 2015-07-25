'use strict';

angular.module('twitchdata.dashboard', [
  'twitchdata.components.api.games',
  'twitchdata.components.api.totalStats',
  'twitchdata.components.charts',
  'highcharts-ng'
  ])
  .controller('DashboardCtrl', function ($http, $state, gameService, totalStatsService, chartService) {
    var DashboardCtrl = this;

    var fetchTotalStats = function () {
      totalStatsService.getTotalStats().then(function (res) {
        DashboardCtrl.totalStats = res.data.stats;
        DashboardCtrl.currentStats = _.last(res.data.stats);

        DashboardCtrl.totalViewersChartConfig = chartService.getBaseConfig();
        DashboardCtrl.totalViewersChartConfig.series.push({
          name: 'viewers',
          data: DashboardCtrl.totalStats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.viewers];
          })
        });

        DashboardCtrl.totalChannelsChartConfig = chartService.getBaseConfig();
        DashboardCtrl.totalChannelsChartConfig.series.push({
          name: 'channels',
          data: DashboardCtrl.totalStats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.channels];
          })
        });
      });
    };

    var init = function () {
      fetchTotalStats();
    };

    init();
  });
