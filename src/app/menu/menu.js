'use strict';

angular.module('twitchdata.menu', ['twitchdata.components.routeMenuState'])
  .directive('tdMenu', function () {
      return {
        templateUrl: 'app/menu/menu.tpl.html'
      };
  });
