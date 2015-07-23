'use strict';

angular.module('twitchdata.components.charts', [])
  .provider('chartService', function () {
    this.$get = function () {
      var chartService = {
        getBaseConfig: function () {
          return {
            options: {
              chart: {
                zoomType: 'x',
                type: 'spline'
              },
              rangeSelector: {
                enabled: true,
                selected: 1,
                buttons: [{
                	type: 'day',
                	count: 1,
                	text: '1d'
                }, {
                	type: 'day',
                	count: 7,
                	text: '7d'
                }, {
                	type: 'month',
                	count: 1,
                	text: '1m'
                }, {
                	type: 'month',
                	count: 3,
                	text: '3m'
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
              xAxis: {
                ordinal: false
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
