'use strict';

angular.module('twitchdata.channels.list', ['twitchdata.components.api.channels'])
  .controller('ChannelsListCtrl', function ($http, $state, channelService) {
    var ChannelsListCtrl = this;

    var fetchData = function () {
      channelService.getChannels({
        limit: ChannelsListCtrl.pagination.pageSize,
        offset: (ChannelsListCtrl.pagination.currentPage-1) * ChannelsListCtrl.pagination.pageSize,
        sortAttr: ChannelsListCtrl.sorting.attr,
        order: (ChannelsListCtrl.sorting.reverse) ? 'asc' : 'desc',
        search: ChannelsListCtrl.searchText
      }).then(function (res) {
        ChannelsListCtrl.channels = res.data.channels;
        ChannelsListCtrl.totalChannels = res.data.count;
      });
    };

    var init = function () {
      fetchData();
    };

    ChannelsListCtrl.pagination = {
      currentPage: 1,
      pageSize: 48,
      update: fetchData
    };

    ChannelsListCtrl.sorting = {
      attr: 'viewers',
      reverse: false
    };

    ChannelsListCtrl.sortBy = function (sortAttr) {
      if (ChannelsListCtrl.sorting.attr === sortAttr) {
        ChannelsListCtrl.sorting.reverse = !ChannelsListCtrl.sorting.reverse;
      } else {
        ChannelsListCtrl.sorting.attr = sortAttr;
        ChannelsListCtrl.sorting.reverse = false;
      }

      ChannelsListCtrl.pagination.currentPage = 1;
      ChannelsListCtrl.pagination.update();
    };

    ChannelsListCtrl.search = function () {
      fetchData();
    };

    init();
  });
