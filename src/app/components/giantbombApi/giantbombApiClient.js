'use strict';

angular.module('twitchdata.components.giantbombApi', [])
  .provider('giantbombApiClient', function () {
    var _baseUrl = 'http://api.giantbomb.com';
    this.$get = function ($http) {
      var giantbombApiClient = {
        getDataForGame: function (game, options) {
          if (!options) {
            options = {};
          }
          _.defaults(options, {
            api_key: '97c0263425ea09240ac1eda63985d198a39c67ce',
            format: 'jsonp',
            json_callback: 'JSON_CALLBACK',
            field_list: 'genres,name,original_game_rating,original_release_date,platforms,site_detail_url,developers,publishers,similar_games,deck'
          });

          return $http({
            url: _baseUrl + '/game/' + game,
            method: 'JSONP',
            params: options
          }).then(function (res) {
            console.log("DSgifdsf");
            var giantbombData = res.data.results;
            console.log(giantbombData);
            return {
              description: giantbombData.deck,
              genres: giantbombData.genres && giantbombData.genres.map(function (genre) {
                return genre.name;
              }).join(', '),
              platforms: giantbombData.platforms && giantbombData.platforms.map(function (platform) {
                return platform.name;
              }).join(', '),
              ratings: giantbombData.original_game_rating && giantbombData.original_game_rating.map(function (rating) {
                return rating.name;
              }).join(', '),
              developers: giantbombData.developers && giantbombData.developers.map(function (developer) {
                return developer.name;
              }).join(', '),
              publishers: giantbombData.publishers && giantbombData.publishers.map(function (publisher) {
                return publisher.name;
              }).join(', '),
              similar: giantbombData.similar_games && giantbombData.similar_games.map(function (game) {
                return game.name;
              }).join(', '),
              release: giantbombData.original_release_date && new Date(giantbombData.original_release_date),
              url: giantbombData.site_detail_url
            };
          });
        }
      };

      return giantbombApiClient;
    };
  });
