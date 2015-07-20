'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.giantbombApi',
  'highcharts-ng'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, $q, gameService, twitchApiClient, giantbombApiClient, chartService) {
    var GameDetailCtrl = this;
    this.getFormattedName = function () {
      if (this.game) {
        var test = this.game.name.replace(/\s/g, '-').toLowercase;
        return test;
      }
    };

    // adds missing collection run entries to stats array
    var addMissingCollectionRunsToGame = function (stats, lastCollectionRun) {
      if (_.last(stats).collectionRun.run !== lastCollectionRun.run) {
        stats.push({
          viewers: 0,
          channels: 0,
          ratio: 0,
          collectionRun: lastCollectionRun
        });
      }

      var missing;
      do {
        missing = false;

        for (var i = 0, len = stats.length; i < len; i++) {
          if (i > 0 && stats[i].collectionRun.run - stats[i-1].collectionRun.run > 1){
            missing = i;
            break;
          }
        }

        if (missing) {
          var missingCount = (stats[missing].collectionRun.run - stats[missing-1].collectionRun.run);
          var collectionDateDiff = new Date(stats[missing].collectionRun.date) - new Date(stats[missing-1].collectionRun.date);
          var collectionDateDistance = collectionDateDiff / missingCount;
          var lastCollectionDate = new Date(stats[missing-1].collectionRun.date);
          var arr = stats.splice(missing, stats.length);
          for (var j = 1; j < missingCount; j++) {
            stats.push({
              channels: 0,
              viewers: 0,
              collectionRun: {
                _id: stats[missing-1].collectionRun.run + j,
                date: (new Date(lastCollectionDate.getTime() + collectionDateDistance * j))
              }
            });
          }
          stats = stats.concat(arr);
        }
      } while(missing);

      return stats;
    };

    var getTrend = function (stats, lastCollectionRun) {
      var currentDate = new Date(lastCollectionRun.date);
      var trend = {
        days: {
          growth: {
            viewers: 0,
            channels: 0
          },
          last: {
            date: new Date(),
            viewers: 0,
            channels: 0
          },
          secondLast: {
            date: new Date(),
            viewers: 1,
            channels: 1
          }
        }
      };
      trend.days.last.date.setDate(currentDate.getDate() - 1);
      trend.days.secondLast.date.setDate(currentDate.getDate() - 2);
      stats.forEach(function (stat) {
        var date = new Date(stat.collectionRun.date);
        if (date > trend.days.last.date) {
          trend.days.last.viewers += stat.viewers;
          trend.days.last.channels += stat.channels;
        } else if (date < trend.days.last.date && date > trend.days.secondLast.date){
          trend.days.secondLast.viewers += stat.viewers;
          trend.days.secondLast.channels += stat.channels;
        }
      });

      trend.days.growth.viewers = (trend.days.last.viewers / trend.days.secondLast.viewers) * 100 - 100;
      trend.days.growth.channels = (trend.days.last.channels / trend.days.secondLast.channels) * 100 - 100;
      return trend;
    };

    var getPeak = function (stats) {
      var peak = {
        viewers: {
          count: 0,
          date: null,
        },
        channels: {
          count: 0,
          date: null
        }
      };

      stats.forEach(function (stat) {
        if (stat.viewers > peak.viewers.count) {
          peak.viewers.count = stat.viewers;
          peak.viewers.date = new Date(stat.collectionRun.date);
        }

        if (stat.channels > peak.channels.count) {
          peak.channels.count = stat.channels;
          peak.channels.date = new Date(stat.collectionRun.date);
        }
      });

      return peak;
    };

    var requests = [];

    requests.push(
      gameService.getGameByName($stateParams.gameName).then(function (res) {
        this.game = res.data;
        giantbombApiClient.getDataForGame(this.game.giantbombId).then(function (data) {
          GameDetailCtrl.giantbomb = data;
        });
        twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
          GameDetailCtrl.currentTopStreams = res.data.streams;
        });
        return res;
      }.bind(this))
    );

    requests.push(
      gameService.getStatsForGame($stateParams.gameName).then(function (res) {
        this.stats = addMissingCollectionRunsToGame(res.data.stats, res.data.lastCollectionRun);
        this.trend = getTrend(this.stats, res.data.lastCollectionRun);
        this.peak = getPeak(this.stats);
        return res;
      }.bind(this))
    );

    $q.all(requests).then(function () {
      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.viewers];
        })
      });

      this.channelsChartConfig = chartService.getBaseConfig();
      this.channelsChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.channels];
        })
      });

      this.ratioChartConfig = chartService.getBaseConfig();
      this.ratioChartConfig.series.push({
        name: this.game.name,
        data: this.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      });
    }.bind(this));
  });
