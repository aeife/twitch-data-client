'use strict';

describe('twitchdata.components.routeMenuState', function () {
    var $timeout;
    var $location;
    var element;
    var liElements;
    var scope;
    var routes;
    var activeClass;

    beforeEach(module('twitchdata.components.routeMenuState'));

    beforeEach(inject(function (_$location_, _$timeout_, _$compile_, _$rootScope_) {
        $location = _$location_;
        $timeout = _$timeout_;
        scope = _$rootScope_.$new();
        liElements = [];
        routes = ['/login', 'test'];
        activeClass = 'active';

        element = angular.element('<ul td-route-menu-state><li><a href="' + routes[0] + '"></a></li><li><a href="' + routes[1] + '"></a></li></ul>');
        _.each(element.find('li'), function (liElement) {
            liElements.push(angular.element(liElement));
        });
        _$compile_(element)(scope);
    }));

    it('should add active state to correct element at beginning', function () {
        spyOn($location, 'path').and.returnValue(routes[0]);

        expect(liElements[0].hasClass(activeClass)).toBe(false);
        expect(liElements[1].hasClass(activeClass)).toBe(false);
        $timeout.flush();
        expect(liElements[0].hasClass(activeClass)).toBe(true);
        expect(liElements[1].hasClass(activeClass)).toBe(false);
    });

    it('should update active state on $routeChangeSuccess', function () {
        $timeout.flush();

        var currentRoute;
        spyOn($location, 'path').and.callFake(function () {
            return currentRoute;
        });

        currentRoute = routes[1];
        scope.$broadcast('$locationChangeSuccess');
        expect(liElements[0].hasClass(activeClass)).toBe(false);
        expect(liElements[1].hasClass(activeClass)).toBe(true);

        currentRoute = routes[0];
        scope.$broadcast('$locationChangeSuccess');
        expect(liElements[0].hasClass(activeClass)).toBe(true);
        expect(liElements[1].hasClass(activeClass)).toBe(false);
    });
});
