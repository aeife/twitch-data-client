'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.giantbombApi',
  'twitchdata.components.statistics',
  'twitchdata.components.trendText',
  'twitchdata.components.monthFilter',
  'highcharts-ng',
  '720kb.socialshare'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, $q, $state, $rootScope, $timeout, gameService, twitchApiClient, giantbombApiClient, chartService, statisticsService) {
    var GameDetailCtrl = this;
    this.gameName = $stateParams.gameName;
    var requests = [];

    requests.push(gameService.getGameByName($stateParams.gameName).then(function (res) {
      this.game = res.data;

      giantbombApiClient.getDataForGame(this.game.giantbombId).then(function (data) {
        GameDetailCtrl.giantbomb = data;
      });
      twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
        GameDetailCtrl.currentTopStreams = res.data.streams;
      });
      return res;
    }.bind(this)));

    requests.push(gameService.getStatsForGame($stateParams.gameName).then(function (res) {
      this.stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun, ['viewers', 'channels', 'ratio']);
      this.trend = {
        day: statisticsService.getGrowthTrendOfLastNDays(1, this.stats, ['viewers', 'channels']),
        week: statisticsService.getGrowthTrendOfLastNDays(7, this.stats, ['viewers', 'channels']),
        month: statisticsService.getGrowthTrendOfLastNDays(30, this.stats, ['viewers', 'channels'])
      };
      this.monthlyTrends = statisticsService.getMonthlyTrends(this.stats, ['viewers', 'channels']);
      this.peak = statisticsService.getPeak(this.stats, ['viewers', 'channels']);
      this.avg = statisticsService.getAvgForTimeFrame(this.stats, ['viewers', 'channels'], 'day', 7, 0);
      return res;
    }.bind(this), function () {
      this.error = true;
    }.bind(this)));

    $q.all(requests).then(function () {
      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.options.xAxis.events.afterSetExtremes = handleZoomChange;
      this.viewersChartConfig.options.chart.events.load = chartLoaded;
      this.viewersChartConfig.options.exporting.chartOptions.title.text = 'viewer count on twitch';
      this.viewersChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.viewers];
        })
      });

      this.channelsChartConfig = chartService.getBaseConfig();
      this.channelsChartConfig.options.xAxis.events.afterSetExtremes = handleZoomChange;
      this.channelsChartConfig.options.chart.events.load = chartLoaded;
      this.channelsChartConfig.options.exporting.chartOptions.title.text = 'channel count on twitch';
      this.channelsChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.channels];
        })
      });

      this.ratioChartConfig = chartService.getBaseConfig();
      this.ratioChartConfig.options.xAxis.events.afterSetExtremes = handleZoomChange;
      this.ratioChartConfig.options.chart.events.load = chartLoaded;
      this.ratioChartConfig.options.exporting.chartOptions.title.text = 'avg viewers per channel';
      this.ratioChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      });
    }.bind(this));

    var supportedCharts = ['viewers', 'channels', 'ratio'];
    if (supportedCharts.indexOf($stateParams.chart) > -1) {
      this.currentChart = $stateParams.chart;
    } else {
      this.currentChart = 'viewers';
    }

    this.setCurrentChart = function (chartType) {
      this.currentChart = chartType;
      $state.go('gameDetail', {gameName:  $stateParams.gameName, chart: chartType, zoom: getChartZoom(chartType)}, {notify: false, location: 'replace'});
    }

    var getChartZoom = function (chartType) {
      var zoom;
      switch (chartType) {
        case 'channels':
          zoom = GameDetailCtrl.channelsChartConfig.getHighcharts().xAxis[0].getExtremes();
          break;
        case 'ratio':
          zoom = GameDetailCtrl.ratioChartConfig.getHighcharts().xAxis[0].getExtremes();
          break;
        default:
          zoom = GameDetailCtrl.viewersChartConfig.getHighcharts().xAxis[0].getExtremes();
      }

      return zoom.min + ',' + zoom.max;
    };

    var handleZoomChange = function (value) {
      $state.go('gameDetail', {gameName:  $stateParams.gameName, zoom: value.min + ',' + value.max}, {notify: false, location: 'replace'});
    };

    var chartLoaded = function (chart) {
      // set initial zoom according to url param
      if ($stateParams.zoom && $stateParams.zoom.split(',').length === 2) {
        var zoom = $stateParams.zoom.split(',');
        chart.target.xAxis[0].setExtremes(zoom[0], zoom[1]);
      }
    }
  });
