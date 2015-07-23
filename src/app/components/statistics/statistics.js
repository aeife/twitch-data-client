'use strict';

angular.module('twitchdata.components.statistics', [])
  .provider('statisticsService', function () {
    var addMissing = function (attr, stats) {
      var missing;
      do {
        missing = false;

        // find missing run
        for (var i = 1, len = stats.length; i < len; i++) {
          if (stats[i][attr] - stats[i-1][attr] > 1) {
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
              date: date
            });
          }
          stats = stats.concat(arr);
        }

      } while (missing);

      return stats;
    };

    this.$get = function () {
      var statisticsService = {
        // adds missing collection run entries to stats array
        addMissingCollectionRunsToGame: function (stats, lastCollectionRun) {
          if (_.last(stats).run !== lastCollectionRun.run) {
            stats.push({
              viewers: 0,
              channels: 0,
              ratio: 0,
              date: lastCollectionRun.date,
              run: lastCollectionRun.run
            });
          }

          stats = addMissing('hours', stats);
          stats = addMissing('day', stats);
          stats = addMissing('month', stats);
          stats = addMissing('year', stats);

          // var missing;
          // do {
          //   missing = false;
          //
          //   // find missing run
          //   for (var i = 0, len = stats.length; i < len; i++) {
          //     if (i > 0 && stats[i].run - stats[i-1].run > 1){
          //       missing = i;
          //       break;
          //     }
          //   }
          //
          //   // add missing runs
          //   if (missing) {
          //     var missingCount = (stats[missing].run - stats[missing-1].run);
          //     var collectionDateDiff = new Date(stats[missing].date) - new Date(stats[missing-1].date);
          //     var collectionDateDistance = collectionDateDiff / missingCount;
          //     var lastCollectionDate = new Date(stats[missing-1].date);
          //     var arr = stats.splice(missing, stats.length);
          //     for (var j = 1; j < missingCount; j++) {
          //       stats.push({
          //         channels: 0,
          //         viewers: 0,
          //         run: stats[missing-1].run + j,
          //         date: (new Date(lastCollectionDate.getTime() + collectionDateDistance * j))
          //       });
          //     }
          //     stats = stats.concat(arr);
          //   }
          // } while(missing);

          console.log(stats);
          return stats;
        },
        getTrend: function (stats, lastCollectionRun) {
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
            var date = new Date(stat.date);
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
