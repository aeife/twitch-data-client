'use strict';

angular.module('twitchdata.channels.detail', [
  'twitchdata.channels.detail.live',
  'twitchdata.components.api.channels',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.statistics',
  'twitchdata.components.trendText',
  'twitchdata.components.monthFilter',
  'highcharts-ng'
  ])
  .controller('ChannelDetailCtrl', function ($http, $stateParams, $q, channelService, twitchApiClient, chartService, statisticsService) {
    var ChannelDetailCtrl = this;
    this.getFormattedName = function () {
      if (this.game) {
        var test = this.game.name.replace(/\s/g, '-').toLowercase;
        return test;
      }
    };

    var requests = [];

    requests.push(twitchApiClient.getChannelData($stateParams.channelName).then(function (res) {
      this.channel = res.data;
    }.bind(this)));

    requests.push(channelService.getStatsForChannel($stateParams.channelName).then(function (res) {
      // save follower stats separate as missing values should not be translated to zero values
      this.followerStats = res.data.stats;

      this.stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun, ['viewers', 'followers']);
      this.trend = {
        day: statisticsService.getGrowthTrendOfLast('day', this.stats, ['viewers', 'followers']),
        week: statisticsService.getGrowthTrendOfLast('week', this.stats, ['viewers', 'followers']),
        month: statisticsService.getGrowthTrendOfLast('month', this.stats, ['viewers', 'followers'])
      };
      this.monthlyTrends = statisticsService.getMonthlyTrends(this.stats, ['viewers', 'followers']);
      this.peak = statisticsService.getPeak(this.stats, ['viewers', 'followers']);
      this.avg = statisticsService.getAvg(this.stats, ['viewers', 'followers']);
      return res;
    }.bind(this)));

    $q.all(requests).then(function () {
      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.series.push({
        name: this.channel.display_name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.viewers];
        })
      });

      this.followersChartConfig = chartService.getBaseConfig();
      this.followersChartConfig.series.push({
        name: this.channel.display_name,
        data: this.followerStats.map(function (stat) {
          return [new Date(stat.date).getTime(), stat.followers];
        })
      });
    }.bind(this));

    this.currentChart = 'viewers';
  });
