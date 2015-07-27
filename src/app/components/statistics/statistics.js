'use strict';

angular.module('twitchdata.components.statistics', [])
  .provider('statisticsService', function () {

    var monthDiff = function (d1, d2) {
      return d2.getMonth() - d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));
    };

    var addMissing = function (stats) {
      var tmpStats = stats.slice();
      // floor hours
      tmpStats.map(function (stat) {
        stat.date.setMinutes(0);
        return stat;
      });

      // precition frame dates
      var lastDate = new Date(_.last(stats).date);
      var lastMonth = new Date(lastDate.getTime());
      lastMonth = new Date(lastMonth.setMonth(lastMonth.getMonth() - 1));
      var lastQuarter = new Date(lastDate.getTime());
      lastQuarter = new Date(lastQuarter.setMonth(lastQuarter.getMonth() -3));
      var firstDate = new Date(_.first(stats).date);

      // generate all expected stats entries
      var expectedStats = {};
      var d;

      var hourCount = Math.floor((lastDate - lastMonth) / 36e5);
      for (var i = 0; i < hourCount; i++) {
        d = new Date(lastDate);
        d.setHours(d.getHours() - i);
        expectedStats[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '-' + d.getHours()] = {
          viewers: 0,
          channels: 0,
          ratio: 0,
          date: d,
          hour: d.getUTCHours(),
          day: d.getUTCDate(),
          month: d.getUTCMonth()+1,
          year: d.getFullYear()
        };
      }

      var dayCount = Math.floor((lastMonth - lastQuarter) / 864e5);
      for (var j = 0; j < dayCount; j++) {
        d = new Date(lastMonth);
        d.setDate(d.getDate() - j);
        expectedStats[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()] = {
          viewers: 0,
          channels: 0,
          ratio: 0,
          date: d,
          day: d.getUTCDate(),
          month: d.getUTCMonth()+1,
          year: d.getFullYear()
        };
      }

      var monthCount = monthDiff(firstDate, lastQuarter) + 1;
      for (var k = 0; k < monthCount; k++) {
        d = new Date(lastQuarter);
        d.setMonth(d.getMonth()- k);
        expectedStats[d.getFullYear() + '-' + d.getMonth()] = {
          viewers: 0,
          channels: 0,
          ratio: 0,
          date: d,
          month: d.getUTCMonth()+1,
          year: d.getFullYear()
        };
      }

      // overwrite expected with real stats where entries are available
      tmpStats.forEach(function (stat) {
        var key;
        if (stat.hour) {
          key = stat.date.getFullYear() + '-' + stat.date.getMonth() + '-' + stat.date.getDate() + '-' + stat.date.getHours();
        } else if (stat.day) {
          key = stat.date.getFullYear() + '-' + stat.date.getMonth() + '-' + stat.date.getDate();
        } else {
          key = stat.date.getFullYear() + '-' + stat.date.getMonth();
        }
        expectedStats[key] = stat;
      });

      var result = [];
      for (var stat in expectedStats) {
        result.push(expectedStats[stat]);
      }
      return result.reverse();
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

          return addMissing(stats);
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
