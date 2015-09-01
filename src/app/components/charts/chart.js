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
                type: 'spline',
                events: {}
              },
              colors: [
                '#815fc0', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
                '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'
              ],
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
                ordinal: false,
                events: {}
              },
              navigator: {
                enabled: true
              },
              credits: {
                enabled: false
              },
              legend:{
                enabled:false
              },
              exporting:{
                chartOptions:{
                  legend:{
                    enabled:true
                  },
                  title: {}
                }
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
