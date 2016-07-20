; (function (window, angular, undefined) {
    "use strict";

    angular.module("bMemoize", [])
        .factory("bMemoize", bMemoize)
        .factory("bMemoizeAfterEveryDigest", bMemoizeAfterEveryDigest);

    bMemoize.$inject = ["bMemoizeAfterEveryDigest"];

    function bMemoize(bMemoizeAfterEveryDigest) {

        function getHash(args) {
            var argsLength = args.length,
                hash = "",
                current = undefined;

            while (argsLength--) {
                current = args[argsLength];

                hash += (typeof current === "object")
                    ? JSON.stringify(current)
                    : current;
                hash += "_";
            }

            return hash;
        }

        function unmemoize(...args) {
            if (args.length > 0) delete this.memoized[getHash(Array.prototype.slice.call(args))];
            else delete this.memoized;
        }

        return function memoize(fn, timeout, clearAfterDigest) {

            if (typeof timeout === "boolean") {
                clearAfterDigest = timeout;
                timeout = 0;
            }

            if (!angular.isFunction(fn)) {
                throw new TypeError;
            }

            var memoized = function (...args) {
                var hash = getHash(args);

                fn.memoized || (fn.memoized = {});

                if (!(hash in fn.memoized)) {
                    fn.memoized[hash] = fn.apply(this, args);

                    if (timeout) setTimeout(memoized.unmemoize.bind(fn), timeout);
                }

                return fn.memoized[hash];
            }

            memoized.unmemoize = unmemoize.bind(fn);

            if (clearAfterDigest) {
                bMemoizeAfterEveryDigest(memoized.unmemoize);
            }

            return memoized;
        }
    }


    bMemoizeAfterEveryDigest.$inject = ["$rootScope"];
    function bMemoizeAfterEveryDigest($rootScope) {

        var watch, toUnmemoize = [];

        function registerWatch() {
            if (watch) return;

            var isRegistered = false;
            watch = $rootScope.$watch(function () {
                if (isRegistered) return;
                isRegistered = true;

                $rootScope.$$postDigest(function () {
                    isRegistered = false;
                    angular.forEach(toUnmemoize, function (unmemoizeFn) {
                        unmemoizeFn();
                    });
                });
            });
        }

        function unregister(unmemoizeFn) {
            toUnmemoize.splice(toUnmemoize.indexOf(unmemoizeFn), 1);

            if (toUnmemoize.length === 0) watch();
        }

        return function register(unmemoizeFn) {
            toUnmemoize.push(unmemoizeFn);
            registerWatch();

            return unregister.bind(this, unmemoizeFn);
        };
    }

})(window, window.angular);