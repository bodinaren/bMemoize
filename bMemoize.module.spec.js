describe("Module: hbMemoize -", function () {

    var $rootScope, bMemoize;

    beforeEach(angular.mock.module('bMemoize'));
    beforeEach(inject(function (_$rootScope_, _bMemoize_) {
        $rootScope = _$rootScope_;
        bMemoize = _bMemoize_;
    }));

    it("is a function", function () {
        expect(typeof bMemoize === 'function').toEqual(true);
    });

    it("caches items", function () {
        var i = 0,
            fn = function () { return ++i; },
            mem = bMemoize(fn);

        expect(fn()).toEqual(1);
        expect(mem()).toEqual(2);

        expect(fn()).toEqual(3);
        expect(mem()).toEqual(2);
    });

    it("caches items with arguments", function () {
        var i = [0, 0],
            fn = function (a) { return ++i[a]; },
            mem = bMemoize(fn);

        expect(fn(0)).toEqual(1);
        expect(fn(0)).toEqual(2);
        expect(fn(1)).toEqual(1);
        expect(fn(1)).toEqual(2);

        expect(mem(0)).toEqual(3);
        expect(mem(1)).toEqual(3);
    });

    it("unmemoize all", function () {
        var i = [0, 0],
            mem = bMemoize(function (a, b) { return ++i[a]; }, true);

        expect(mem(0, 1)).toEqual(1);
        expect(mem(0, 1)).toEqual(1);
        expect(mem(1, 1)).toEqual(1);
        expect(mem(1, 1)).toEqual(1);
        mem.unmemoize();
        expect(mem(0, 1)).toEqual(2);
        expect(mem(1, 1)).toEqual(2);
    });

    it("unmemoize one", function () {
        var i = [0, 0],
            mem = bMemoize(function (a, b) { return ++i[a]; }, true);

        expect(mem(0, 1)).toEqual(1);
        expect(mem(0, 1)).toEqual(1);
        expect(mem(1, 1)).toEqual(1);
        expect(mem(1, 1)).toEqual(1);
        mem.unmemoize(0, 1);
        expect(mem(0, 1)).toEqual(2);
        expect(mem(1, 1)).toEqual(1);
    });

    it("clear cache on time", function (done) {
        var i = 0,
            mem = bMemoize(function () { return ++i; }, 50);

        expect(mem()).toEqual(1);

        setTimeout(function () {
            expect(mem()).toEqual(1);
        }, 1);

        setTimeout(function () {
            expect(mem()).toEqual(2);
        }, 100);

        setTimeout(function () {
            expect(mem()).toEqual(3);
            done();
        }, 200);
    });

    it("clear after digest", function () {
        var i = 0,
            mem = bMemoize(function () { return ++i; }, true);

        expect(mem()).toEqual(1);
        expect(mem()).toEqual(1);
        $rootScope.$digest();
        expect(mem()).toEqual(2);
        expect(mem()).toEqual(2);
    });

});