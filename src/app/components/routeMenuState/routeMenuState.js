'use strict';

angular.module('twitchdata.components.routeMenuState', [])
    .directive('tdRouteMenuState', function($location, $timeout) {
        var currentLink;
        var urlMap = {};
        var toggleClass;

        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                toggleClass = attrs.tdRouteMenuState || 'active';

                var updateState = function () {
                    var pathLink = urlMap[$location.path()];
                    if (pathLink) {
                        if (currentLink) {
                            currentLink.parent('li').removeClass(toggleClass);
                        }
                        currentLink = pathLink;
                        currentLink.parent('li').addClass(toggleClass);
                    }
                };

                $timeout(function () {
                    var links = element.find('a');

                    for (var i = 0, len = links.length; i < len; i++) {
                        var link = angular.element(links[i]);
                        var url = link.attr('href') || link.attr('ng-href');

                        if ($location.$$html5) {
                            urlMap[url] = link;
                        } else if (url) {
                            urlMap[url.replace(/^#[^/]*/, '')] = link;
                        }
                    }

                    updateState();

                    scope.$on('$locationChangeSuccess', function() {
                        updateState();
                    });
                }, 0);

            }
        };
    });
