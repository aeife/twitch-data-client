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
                date = date.setYear(date.getYear() + 1);
                break;
              case 'month':
                date = date.setMonth(date.getMonth() + 1);
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
        if (timeFrames[timeFrameKeys[i + offset]]) {
          timeFrames[timeFrameKeys[i+offset]].forEach(function (stat) {
            result.viewers += stat.viewers;
            result.channels += stat.channels;
            count++;
          });
        }
      }

      if (count > 0) {
        result.viewers = result.viewers / count;
        result.channels = result.channels / count;
      }

      return result;
    };

    var calculateGrowth = function (first, second) {
      return {
        viewers: second.viewers ? (first.viewers / second.viewers) * 100 - 100 : null,
        channels: second.channels ? (first.channels / second.channels) * 100 - 100 : null
      };
    };

    this.$get = function () {
      var statisticsService = {
        // adds missing collection run entries to stats array
        addMissingCollectionRunsToGame: function (stats, lastCollectionRun) {
          if (_.last(stats).hour !== lastCollectionRun.date.getUTCHours()) {
            stats.push({
              viewers: 0,
              channels: 0,
              ratio: 0,
              date: lastCollectionRun.date,
              hour: new Date(lastCollectionRun.date).getUTCHours(),
              day: new Date(lastCollectionRun.date).getUTCDate(),
              month: new Date(lastCollectionRun.date).getUTCMonth()+1,
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
          var monthsKeys = Object.keys(months);
          monthsKeys.reverse();

          var monthAvgs = {};
          for (var j = 0, length = Object.keys(months).length; j < length; j++) {
            monthAvgs[monthsKeys[j]] = getAvgForTimeFrame(stats, 'month', 1, j);
          }

          for (var i = 1, len = Object.keys(months).length; i < len; i++) {
            var last = monthAvgs[monthsKeys[i-1]];
            var secondLast = monthAvgs[monthsKeys[i]];
            result.push({
              year: months[monthsKeys[i-1]][0].year,
              month: months[monthsKeys[i-1]][0].month,
              growth: calculateGrowth(last, secondLast),
              avg: monthAvgs[monthsKeys[i-1]]
            });
          }
          return result;
        },
        getAvg: function (stats, attrs) {
          if (!stats || !stats.length) {
            return null;
          }

          var avg = {};
          attrs.forEach(function (attr) {
            avg[attr] = 0;
          });

          stats.forEach(function (stat) {
            attrs.forEach(function (attr) {
              avg[attr] += stat[attr];
            });
          });

          var result = {};
          attrs.forEach(function (attr) {
            result[attr] = avg[attr] / stats.length;
          });

          return result;
        },
        getPeak: function (stats, attrs) {
          var peak = {};

          attrs.forEach(function (attr) {
            peak[attr] = {
              count: 0,
              date: null
            };
          });

          stats.forEach(function (stat) {
            attrs.forEach(function (attr) {
              if (stat[attr] > peak[attr].count) {
                peak[attr].count = stat[attr];
                peak[attr].date = new Date(stat.date);
              }
            });
          });

          return peak;
        }
      };

      return statisticsService;
    };
  });
