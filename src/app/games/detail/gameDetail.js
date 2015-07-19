'use strict';

angular.module('twitchdata.games.detail', [
  'twitchdata.components.api.games',
  'twitchdata.components.charts',
  'twitchdata.components.twitchApi',
  'twitchdata.components.giantbombApi',
  'highcharts-ng'
  ])
  .controller('GameDetailCtrl', function ($http, $stateParams, gameService, twitchApiClient, giantbombApiClient, chartService) {
    var GameDetailCtrl = this;
    this.getFormattedName = function () {
      if (this.game) {
        var test = this.game.name.replace(/\s/g, '-').toLowercase;
        return test;
      }
    };

    // adds missing collection run entries to stats array
    var addMissingCollectionRunsToGame = function (game, lastCollectionRun) {
      if (_.last(game.stats).collectionRun._id !== lastCollectionRun._id) {
        game.stats.push({
          viewers: 0,
          channels: 0,
          ratio: 0,
          collectionRun: lastCollectionRun
        });
      }

      var missing;
      do {
        missing = false;

        for (var i = 0, len = game.stats.length; i < len; i++) {
          if (i > 0 && game.stats[i].collectionRun._id - game.stats[i-1].collectionRun._id > 1){
            missing = i;
            break;
          }
        }

        if (missing) {
          var missingCount = (game.stats[missing].collectionRun._id - game.stats[missing-1].collectionRun._id);
          var collectionDateDiff = new Date(game.stats[missing].collectionRun.date) - new Date(game.stats[missing-1].collectionRun.date);
          var collectionDateDistance = collectionDateDiff / missingCount;
          var lastCollectionDate = new Date(game.stats[missing-1].collectionRun.date);
          var arr = game.stats.splice(missing, game.stats.length);
          for (var j = 1; j < missingCount; j++) {
            game.stats.push({
              channels: 0,
              viewers: 0,
              collectionRun: {
                _id: game.stats[missing-1].collectionRun._id + j,
                date: (new Date(lastCollectionDate.getTime() + collectionDateDistance * j))
              }
            });
          }
          game.stats = game.stats.concat(arr);
        }
      } while(missing);
    };

    var getTrend = function (game, lastCollectionRun) {
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
      game.stats.forEach(function (stat) {
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
      console.log(trend);
      return trend;
    };

    var getPeak = function (game) {
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

      game.stats.forEach(function (stat) {
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

    gameService.getGameByName($stateParams.gameName).then(function (res) {
      this.game = res.data.game;
      addMissingCollectionRunsToGame(this.game, res.data.lastCollectionRun);
      this.trend = getTrend(this.game, res.data.lastCollectionRun);
      this.peak = getPeak(this.game);

      giantbombApiClient.getDataForGame(this.game.giantbombId).then(function (data) {
        GameDetailCtrl.giantbomb = data;
      });

      twitchApiClient.getTopStreamsForGame(this.game.name).then(function (res) {
        GameDetailCtrl.currentTopStreams = res.data.streams;
      });

      this.viewersChartConfig = chartService.getBaseConfig();
      this.viewersChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.viewers];
        })
      });

      this.channelsChartConfig = chartService.getBaseConfig();
      this.channelsChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), stat.channels];
        })
      });

      this.ratioChartConfig = chartService.getBaseConfig();
      this.ratioChartConfig.series.push({
        name: this.game.name,
        data: this.game.stats.map(function (stat) {
          return [new Date(stat.collectionRun.date).getTime(), (stat.viewers > 0 && stat.channels > 0) ? stat.viewers / stat.channels : 0];
        })
      });
    }.bind(this));
  });
