'use strict';

angular.module('twitchdata.version', [])
  .controller('VersionCtrl', function (TD_CONFIG) {
    this.version = TD_CONFIG.VERSION;
  });
