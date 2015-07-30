'use strict';

angular.module('twitchdata.components.statistics', [])
  .provider('statisticsService', function () {
    this.$get = function () {
      var monthDiff = function (d1, d2) {
        return d2.getMonth() - d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));
      };

      var addMissing = function (stats, attrs) {
        var attrsObject = {};
        attrs.forEach(function (attr) {
          attrsObject[attr] = 0;
        });

        var tmpStats = stats.slice();
        // floor hours
        tmpStats.map(function (stat) {
          stat.date.setMinutes(0);
          return stat;
        });

        // precition frame dates
        var lastDate = new Date(_.last(stats).date);
        var precisionBorders = statisticsService.getPrecisionBorders(lastDate);
        var firstDate = new Date(_.first(stats).date);

        // generate all expected stats entries
        var expectedStats = {};
        var d;

        var hourCount = Math.floor((lastDate - precisionBorders.hourly) / 36e5) + 1;
        for (var i = 0; i < hourCount; i++) {
          d = new Date(lastDate);
          d.setHours(d.getHours() - i);
          if (d.getTime() < firstDate.getTime()) {
            break;
          }
          expectedStats[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '-' + d.getHours()] = _.extend({
            date: d,
            hour: d.getUTCHours(),
            day: d.getUTCDate(),
            month: d.getUTCMonth()+1,
            year: d.getFullYear()
          }, attrsObject);
        }

        var dayCount = Math.floor((precisionBorders.hourly - precisionBorders.daily) / 864e5) + 1;
        for (var j = 0; j < dayCount; j++) {
          d = new Date(precisionBorders.hourly);
          d.setDate(d.getDate() - j);
          if (d.getTime() < firstDate.getTime()) {
            break;
          }
          expectedStats[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()] = _.extend({
            date: d,
            day: d.getUTCDate(),
            month: d.getUTCMonth()+1,
            year: d.getFullYear()
          }, attrsObject);
        }

        var monthCount = monthDiff(firstDate, precisionBorders.daily) + 1;
        for (var k = 0; k < monthCount; k++) {
          d = new Date(precisionBorders.daily);
          d.setMonth(d.getMonth()- k);
          if (d.getTime() < firstDate.getTime()) {
            break;
          }
          expectedStats[d.getFullYear() + '-' + d.getMonth()] =  _.extend({
            date: d,
            month: d.getUTCMonth()+1,
            year: d.getFullYear()
          }, attrsObject);
        }

        // overwrite expected with real stats where entries are available
        tmpStats.forEach(function (stat) {
          var key;
          if (typeof stat.hour !== 'undefined') {
            key = stat.date.getFullYear() + '-' + stat.date.getMonth() + '-' + stat.date.getDate() + '-' + stat.date.getHours();
          } else if (typeof stat.day !== 'undefined') {
            key = stat.date.getFullYear() + '-' + stat.date.getMonth() + '-' + stat.date.getDate();
            stat.date.setHours(1);
          } else {
            key = stat.date.getFullYear() + '-' + stat.date.getMonth();
            stat.date.setDate(1);
          }
          expectedStats[key] = stat;
        });

        var result = [];
        for (var stat in expectedStats) {
          result.push(expectedStats[stat]);
        }
        return result.reverse();
      };

      var getAvgForTimeFrame = function (stats, attrs, timeframe, limit, offset) {
        var tmpStats = stats.slice();
        tmpStats.reverse();

        var timeFrames =  _.groupBy(tmpStats, function (stat) {
          var group = stat.year;
          if (timeframe === 'month') {
            group += '-' + stat.month;
          } else if (timeframe === 'day') {
            group += '-' + stat.month + '-' + stat.day;
          }
          return group;
        });
        var timeFrameKeys = Object.keys(timeFrames).sort();
        timeFrameKeys.reverse();

        var count = 0;
        var result = {};
        attrs.forEach(function (attr) {
          result[attr] = 0;
        });

        for (var i = 0; i < limit; i++) {
          if (timeFrames[timeFrameKeys[i + offset]]) {
            timeFrames[timeFrameKeys[i+offset]].forEach(function (stat) {
              attrs.forEach(function (attr) {
                result[attr] += stat[attr];
              });
              count++;
            });
          }
        }

        if (count > 0) {
          attrs.forEach(function (attr) {
            result[attr] = result[attr] / count;
          });
        }

        return result;
      };

      var calculateGrowth = function (first, second, attrs) {
        var result = {};

        attrs.forEach(function (attr) {
          result[attr] = second[attr] ? (first[attr] / second[attr]) * 100 - 100 : null;
        });

        return result;
      };

      var statisticsService = {
        // adds missing collection run entries to stats array
        addMissingCollectionRunsToGame: function (stats, lastCollectionRun, attrs) {
          if (_.last(stats).hour !== lastCollectionRun.date.getUTCHours()) {
            var stat = {
              date: lastCollectionRun.date,
              hour: new Date(lastCollectionRun.date).getUTCHours(),
              day: new Date(lastCollectionRun.date).getUTCDate(),
              month: new Date(lastCollectionRun.date).getUTCMonth()+1,
              year: new Date(lastCollectionRun.date).getFullYear()
            };
            attrs.forEach(function (attr) {
              stat[attr] = 0;
            });
            stats.push(stat);
          }

          return addMissing(stats, attrs);
        },
        getGrowthTrendOfLast: function (timeframe, stats, attrs) {
          var last;
          var secondLast;

          if (timeframe === 'week') {
            last = getAvgForTimeFrame(stats, attrs, 'day', 7, 0);
            secondLast = getAvgForTimeFrame(stats, attrs, 'day', 7, 7);
          } else {
            last = getAvgForTimeFrame(stats, attrs, timeframe, 1, 0);
            secondLast = getAvgForTimeFrame(stats, attrs, timeframe, 1, 1);
          }

          var result = {
            growth: calculateGrowth(last, secondLast, attrs),
            last: {},
            secondLast: {}
          };

          attrs.forEach(function (attr) {
            result.last[attr] = last[attr];
            result.secondLast[attr] = secondLast[attr];
          });

          return result;
        },
        getMonthlyTrends: function (stats, attrs) {
          var result = [];
          var months = _.groupBy(stats, function (stat) {
            return stat.year + '-' + stat.month;
          });
          var monthsKeys = Object.keys(months);
          monthsKeys.reverse();

          var monthAvgs = {};
          for (var j = 0, length = Object.keys(months).length; j < length; j++) {
            monthAvgs[monthsKeys[j]] = getAvgForTimeFrame(stats, attrs, 'month', 1, j);
          }

          for (var i = 1, len = Object.keys(months).length; i < len; i++) {
            var last = monthAvgs[monthsKeys[i-1]];
            var secondLast = monthAvgs[monthsKeys[i]];
            result.push({
              year: months[monthsKeys[i-1]][0].year,
              month: months[monthsKeys[i-1]][0].month,
              growth: calculateGrowth(last, secondLast, attrs),
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
        },
        getPrecisionBorders: function (lastDate) {
          var lastMonth = new Date(lastDate.getTime());
          lastMonth = new Date(lastMonth.setMonth(lastMonth.getMonth() - 1));
          var lastQuarter = new Date(lastDate.getTime());
          lastQuarter = new Date(lastQuarter.setMonth(lastQuarter.getMonth() -3));

          return {
            hourly: lastMonth,
            daily: lastQuarter
          };
        },
        monthNames: ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ]
      };

      return statisticsService;
    };
  });
