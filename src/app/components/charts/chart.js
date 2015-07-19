'use strict';

angular.module('twitchdata.components.charts', [])
  .provider('chartService', function () {
    this.$get = function () {
      var chartService = {
        getBaseConfig: function () {
          return {
            options: {
              chart: {
                zoomType: 'x'
              },
              rangeSelector: {
                enabled: true,
                buttons: [{
                	type: 'second',
                	count: 3600,
                	text: '1h'
                }, {
                	type: 'day',
                	count: 1,
                	text: '1d'
                }, {
                	type: 'week',
                	count: 7,
                	text: '7d'
                }, {
                	type: 'month',
                	count: 1,
                	text: '1m'
                }, {
                	type: 'year',
                	count: 1,
                	text: '1y'
                }, {
                	type: 'all',
                	text: 'All'
                }]
              },
              yAxis: {
                min: 0
              },
              navigator: {
                enabled: true
              },
              credits: {
                enabled: false
              }
            },
            series: [],
            useHighStocks: true
          };
        }
      };

      return chartService;
    };
  });
