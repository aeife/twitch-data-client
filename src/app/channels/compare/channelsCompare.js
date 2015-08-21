'use strict';

angular.module('twitchdata.channels.compare', [
  'twitchdata.components.api.channels',
  'twitchdata.components.charts',
  'twitchdata.components.statistics',
  'highcharts-ng'
])
  .controller('ChannelsCompareCtrl', function ($http, $stateParams, $state, $q, $scope, channelService, statisticsService, chartService) {
    console.log("ctrl");
    var ChannelsCompareCtrl = this;

    this.viewersChartConfig = chartService.getBaseConfig();
    this.viewersChartConfig.options.navigator = {enabled : false};
    this.followersChartConfig = chartService.getBaseConfig();
    this.followersChartConfig.options.navigator = {enabled : false};
    this.followersChartConfig.options.chart.type = 'column';
    this.channels = [];

    var fetchChannelData = function (channelName) {
      var channel;
      var stats;
      var followerStats;
      var requests = [];

      requests.push(channelService.getChannelByName(channelName).then(function (res) {
        channel = res.data;
        return res;
      }));

      requests.push(channelService.getStatsForChannel(channelName).then(function (res) {
        res.data.stats = statisticsService.convertFollowersToFollowersGrowth(res.data.stats);

        // save follower stats separate as missing values should not be translated to zero values
        followerStats = res.data.stats;

        stats = statisticsService.addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun, ['viewers', 'followersGrowth']);

        return res;
      }));

      $q.all(requests).then(function () {
        ChannelsCompareCtrl.viewersChartConfig.series.push({
          name: channel.name,
          data: stats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.viewers];
          })
        });

        ChannelsCompareCtrl.followersChartConfig.series.push({
          name: channel.name,
          data: followerStats.map(function (stat) {
            return [new Date(stat.date).getTime(), stat.followersGrowth];
          })
        });

        ChannelsCompareCtrl.channels.push(channel);
      });
    };

    ChannelsCompareCtrl.addChannel = function (channelName) {
      var exists = ChannelsCompareCtrl.channels.some(function (channel) {
        return channel.name === channelName;
      });

      if (!exists) {
        fetchChannelData(channelName);
        var newChannelParam = ChannelsCompareCtrl.channels.map(function (channel) {
          return channel.name;
        });
        newChannelParam.push(channelName);
        $state.go('channelsCompare', {channelNames: newChannelParam.join(',')}, {notify: false});
      }

      ChannelsCompareCtrl.newChannel = '';
    };

    ChannelsCompareCtrl.removeChannel = function (channelName) {
      _.remove(ChannelsCompareCtrl.channels, function (channel) {
        return channel.name === channelName;
      });
      _.remove(ChannelsCompareCtrl.viewersChartConfig.series, function (serie) {
        return serie.name === channelName;
      });
      _.remove(ChannelsCompareCtrl.followersChartConfig.series, function (serie) {
        return serie.name === channelName;
      });
    };

    ChannelsCompareCtrl.getChannels = function (name) {
      return channelService.getChannels({
        limit: 100,
        offset: 0,
        search: name
      }).then(function (res) {
        return res.data.channels.map(function (channel) {
          return channel.name;
        });
      });
    };

    $scope.$watch(function () {
      return ChannelsCompareCtrl.newChannel;
    }, function (newChannel) {
      console.log(newChannel);
      if (newChannel && newChannel.length) {
        ChannelsCompareCtrl.addChannel(newChannel);
      }
    });

    var init = function () {
      ChannelsCompareCtrl.currentChart = 'viewers';

      if ( $stateParams.channelNames &&  $stateParams.channelNames.length) {
        var channelNames = $stateParams.channelNames.split(',');
        channelNames.forEach(function (channelName) {
          fetchChannelData(channelName);
        });
      }
    };

    init();
  });
