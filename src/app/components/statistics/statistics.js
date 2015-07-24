'use strict';

angular.module('twitchdata.components.statistics', [])
  .provider('statisticsService', function () {
    var addMissing = function (attr, stats) {
      var missing;
      do {
        missing = false;

        // find missing run
        for (var i = 1, len = stats.length; i < len; i++) {
          if (stats[i][attr] && stats[i-1][attr] && (stats[i][attr] - stats[i-1][attr] > 1)) {
            missing = i;
            break;
          }
        }

        // add missing runs
        if (missing) {
          var missingCount = stats[missing][attr] - stats[missing-1][attr];
          var lastCollectionDate = new Date(stats[missing-1].date);
          var arr = stats.splice(missing, stats.length);
          for (var j = 1; j < missingCount; j++) {
            var date = new Date(lastCollectionDate.getTime());
            switch (attr) {
              case 'year':
                date = date.setYear(date.getYear() + 1)
                break;
              case 'month':
                date = date.setMonth(date.getMonth() + 1)
                break;
              case 'day':
                date = date.setDate(date.getDate() + 1);
                break;
              default:
                date = date.setHours(date.getHours() + 1);
            }
            stats.push({
              channels: 0,
              viewers: 0,
              date: date,
              hour: new Date(date).getHours(),
              day: new Date(date).getDate(),
              month: new Date(date).getMonth()+1,
              year: new Date(date).getFullYear()
            });
          }
          stats = stats.concat(arr);
        }

      } while (missing);

      return stats;
    };

    var getAvgForTimeFrame = function (stats, attr, limit, offset) {
      var tmpStats = stats.slice();
      tmpStats.reverse();

      var timeFrames =  _.groupBy(tmpStats, function (stat) {
        var group = stat.year;
        if (attr === 'month') {
          group += '-' + stat.month;
        } else if (attr === 'day') {
          group += '-' + stat.month + '-' + stat.day;
        }
        return group;
      });
      var timeFrameKeys = Object.keys(timeFrames).sort();
      timeFrameKeys.reverse();

      var count = 0;
      var result = {
        viewers: 0,
        channels: 0
      };

      for (var i = 0; i < limit; i++) {
        timeFrames[timeFrameKeys[i+offset]].forEach(function (stat) {
          result.viewers += stat.viewers;
          result.channels += stat.channels;
          count++;
        });
      }

      if (count > 0) {
        result.viewers = result.viewers / count;
        result.channels = result.channels / count;
      }

      return result;
    };

    var calculateGrowth = function (first, second) {
      var viewerDiff = second.viewers ? (first.viewers / second.viewers) : 0;
      var channelDiff = second.channels ? (first.channels / second.channels) : 0;

      return {
        viewers: viewerDiff * 100 - 100,
        channels: channelDiff * 100 - 100
      };
    };

    this.$get = function () {
      var statisticsService = {
        // adds missing collection run entries to stats array
        addMissingCollectionRunsToGame: function (stats, lastCollectionRun) {
          if (new Date(_.last(stats).date).getTime() !== new Date(lastCollectionRun.date).getTime()) {
            stats.push({
              viewers: 0,
              channels: 0,
              ratio: 0,
              date: lastCollectionRun.date,
              hour: new Date(lastCollectionRun.date).getHours(),
              day: new Date(lastCollectionRun.date).getDate(),
              month: new Date(lastCollectionRun.date).getMonth()+1,
              year: new Date(lastCollectionRun.date).getFullYear()
            });
          }

          stats = addMissing('hours', stats);
          stats = addMissing('day', stats);
          stats = addMissing('month', stats);
          stats = addMissing('year', stats);

          return stats;
        },
        getGrowthTrendOfLast: function (attr, stats) {
          var last;
          var secondLast;

          if (attr === 'week') {
            last = getAvgForTimeFrame(stats, 'day', 7, 0);
            secondLast = getAvgForTimeFrame(stats, 'day', 7, 7);
          } else {
            last = getAvgForTimeFrame(stats, attr, 1, 0);
            secondLast = getAvgForTimeFrame(stats, attr, 1, 1);
          }

          return {
            growth: calculateGrowth(last, secondLast),
            last: {
              viewers: last.viewers,
              channels: last.channels
            },
            secondLast: {
              viewers: secondLast.viewers,
              channels: secondLast.channels
            }
          };
        },
        getMonthlyTrends: function (stats) {
          var result = [];
          var months = _.groupBy(stats, function (stat) {
            return stat.year + '-' + stat.month;
          });
          var monthsKeys = Object.keys(months).sort();
          monthsKeys.reverse();

          var monthAvgs = {};
          for (var j = 0, length = Object.keys(months).length; j < length; j++) {
            monthAvgs[monthsKeys[j]] = getAvgForTimeFrame(stats, 'month', 1, j);
          }

          for (var i = 1, len = Object.keys(months).length; i < len; i++) {
            var last = monthAvgs[monthsKeys[i-1]];
            var secondLast = monthAvgs[monthsKeys[i]];
            result.push({
              year: months[monthsKeys[i]][0].year,
              month: months[monthsKeys[i]][0].month,
              growth: calculateGrowth(last, secondLast),
              avg: monthAvgs[monthsKeys[i]]
            });
          }
          return result;
        },
        getAvg: function (stats) {
          if (!stats || !stats.length) {
            return null;
          }

          var avg = {
            viewers: 0,
            channels: 0
          };

          stats.forEach(function (stat) {
            avg.viewers += stat.viewers;
            avg.channels += stat.channels;
          });

          return {
            viewers: avg.viewers / stats.length,
            channels: avg.channels / stats.length
          };
        },
        getPeak: function (stats) {
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
              peak.viewers.date = new Date(stat.date);
            }

            if (stat.channels > peak.channels.count) {
              peak.channels.count = stat.channels;
              peak.channels.date = new Date(stat.date);
            }
          });

          return peak;
        }
      };

      return statisticsService;
    };
  });
