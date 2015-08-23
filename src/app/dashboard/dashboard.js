'use strict';

angular.module('twitchdata.dashboard', [
  'twitchdata.components.api.games',
  'twitchdata.components.api.generalStats',
  'twitchdata.components.charts',
  'highcharts-ng'
  ])
  .controller('DashboardCtrl', function ($http, $state, gameService, generalStatsService, chartService) {
    var DashboardCtrl = this;

    var fetchGeneralStats = function () {
      generalStatsService.getGeneralStats().then(function (res) {
        res.data.stats = res.data.stats.map(function (stat) {
          stat.date = new Date(stat.date);
          stat.date.setMinutes(0);
          stat.date.setSeconds(0);
          stat.date.setMilliseconds(0);
          return stat;
        });

        DashboardCtrl.generalStats = res.data.stats;
        DashboardCtrl.currentStats = _.last(res.data.stats);

        DashboardCtrl.totalViewersChartConfig = chartService.getBaseConfig();
        DashboardCtrl.totalViewersChartConfig.series.push({
          name: 'viewers',
          data: DashboardCtrl.generalStats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.viewers];
          })
        });

        DashboardCtrl.totalChannelsChartConfig = chartService.getBaseConfig();
        DashboardCtrl.totalChannelsChartConfig.series.push({
          name: 'channels',
          data: DashboardCtrl.generalStats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.channels];
          })
        });
      });
    };

    var init = function () {
      fetchGeneralStats();
    };

    init();
  });
