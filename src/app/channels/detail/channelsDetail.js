'use strict';

angular.module('twitchdata.channels.detail', [
  'twitchdata.channels.detail.live',
  'twitchdata.components.api.channels',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.statistics',
  'twitchdata.components.trendText',
  'twitchdata.components.monthFilter',
  'highcharts-ng',
  '720kb.socialshare'
  ])
  .controller('ChannelDetailCtrl', function ($http, $stateParams, $q, $state, channelService, twitchApiClient, chartService, statisticsService) {
    var ChannelDetailCtrl = this;
    this.channelName = $stateParams.channelName;
    var requests = [];

    requests.push(twitchApiClient.getChannelData($stateParams.channelName).then(function (res) {
      this.channel = res.data;
    }.bind(this)));

    requests.push(channelService.getStatsForChannel($stateParams.channelName).then(function (res) {
      res.data.stats = statisticsService.convertFollowersToFollowersGrowth(res.data.stats);

      // save plain stats separate as missing values should not be translated to zero values for some operations
      this.plainStats = res.data.stats;

      this.stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun, ['viewers', 'followersGrowth']);
      // this.trend = {
      //   day: statisticsService.getGrowthTrendOfLastNDays(1, this.plainStats, ['viewers', 'followersGrowth']),
      //   week: statisticsService.getGrowthTrendOfLastNDays(7, this.plainStats, ['viewers', 'followersGrowth']),
      //   month: statisticsService.getGrowthTrendOfLastNDays(30, this.plainStats, ['viewers', 'followersGrowth'])
      // };
      this.monthlyTrends = statisticsService.getMonthlyTrends(this.plainStats, ['viewers', 'followersGrowth']);
      this.peak = {
        viewers: statisticsService.getPeak(this.plainStats, ['viewers']).viewers,
        followersGrowth: statisticsService.getPeak(this.plainStats, ['followersGrowth']).followersGrowth
      };
      this.avg = {
        viewers: statisticsService.getAvgForTimeFrame(this.plainStats, ['viewers'], 'day', 7, 0).viewers,
        followersGrowth: statisticsService.getAvgForTimeFrame(this.plainStats, ['followersGrowth'], 'day', 7, 0).followersGrowth
      }
      return res;
    }.bind(this), function () {
      this.error = true;
    }.bind(this)));

    $q.all(requests).then(function () {
      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.options.xAxis.events.afterSetExtremes = handleZoomChange;
      this.viewersChartConfig.options.chart.events.load = chartLoaded;
      this.viewersChartConfig.options.exporting.chartOptions.title.text = 'viewer count for twitch channel';
      this.viewersChartConfig.series.push({
        name: this.channel.display_name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.viewers];
        })
      });

      this.followersChartConfig = chartService.getBaseConfig();
      this.followersChartConfig.options.xAxis.events.afterSetExtremes = handleZoomChange;
      this.followersChartConfig.options.chart.events.load = chartLoaded;
      this.followersChartConfig.options.chart.type = 'column';
      this.followersChartConfig.options.exporting.chartOptions.title.text = 'follower growth for twitch channel';
      this.followersChartConfig.series.push({
        name: this.channel.display_name,
        data: this.plainStats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.followersGrowth];
        })
      });
    }.bind(this));

    var supportedCharts = ['viewers', 'followers'];
    if (supportedCharts.indexOf($stateParams.chart) > -1) {
      this.currentChart = $stateParams.chart;
    } else {
      this.currentChart = 'viewers';
    }

    this.setCurrentChart = function (chartType) {
      this.currentChart = chartType;
      $state.go('channelDetail', {channelName:  $stateParams.channelName, chart: chartType, zoom: getChartZoom(chartType)}, {notify: false, location: 'replace'});
    }

    var getChartZoom = function (chartType) {
      var zoom;
      switch (chartType) {
        case 'followers':
          zoom = ChannelDetailCtrl.followersChartConfig.getHighcharts().xAxis[0].getExtremes();
          break;
        default:
          zoom = ChannelDetailCtrl.viewersChartConfig.getHighcharts().xAxis[0].getExtremes();
      }

      return zoom.min + ',' + zoom.max;
    };

    var handleZoomChange = function (value) {
      $state.go('channelDetail', {channelName:  $stateParams.channelName, zoom: value.min + ',' + value.max}, {notify: false, location: 'replace'});
    };

    var chartLoaded = function (chart) {
      // set initial zoom according to url param
      if ($stateParams.zoom && $stateParams.zoom.split(',').length === 2) {
        var zoom = $stateParams.zoom.split(',');
        chart.target.xAxis[0].setExtremes(zoom[0], zoom[1]);
      }
    }
  });
