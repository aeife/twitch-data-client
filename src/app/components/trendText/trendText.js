'use strict';

angular.module('twitchdata.components.trendText', [])
  .directive('tdTrendText', function() {
    return {
      scope: {
        value: '='
      },
      templateUrl: 'app/components/trendText/trendText.tpl.html'
    };
  });
