'use strict';

angular.module('twitchdata.channels.detail.live', ['twitchdata.components.twitchApi'])
  .directive('tdChannelLiveInfo', function () {
    return {
        restrict: 'E',
        scope: {
          channel: '='
        },
        templateUrl: 'app/channels/detail/live/channelsDetailLive.tpl.html',
        controller: 'ChannelDetailLiveCtrl',
        controllerAs: 'ChannelDetailLiveCtrl',
        bindToController: true
    };
  })
  .controller('ChannelDetailLiveCtrl', function (twitchApiClient) {
    twitchApiClient.getLiveStreamData(this.channel.name).then(function (res) {
      this.stream = res.data.stream;
    }.bind(this)).finally(function () {
      this.loaded = true;
    }.bind(this));
  });
