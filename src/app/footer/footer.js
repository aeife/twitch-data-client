'use strict';

angular.module('twitchdata.footer', [])
  .directive('tdFooter', function () {
      return {
        templateUrl: 'app/footer/footer.tpl.html',
        controller: 'FooterCtrl',
        controllerAs: 'FooterCtrl'
      };
  })
  .controller('FooterCtrl', function (TD_CONFIG) {
    this.version = TD_CONFIG.VERSION;
  });
