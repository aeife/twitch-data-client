'use strict';

angular.module('twitchdata.footer', [])
  .directive('tdFooter', function () {
      return {
        templateUrl: 'app/footer/footer.tpl.html'
      };
  });
