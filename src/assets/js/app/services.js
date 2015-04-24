/**
 * Tapestry Services
 */

'use strict';

angular.module('tapestry.services', [])
  .factory('patternData', ['$http', '$log', '$cacheFactory', '$q', '$filter', function($http, $log, $cacheFactory, $q, $filter) {

    var cache = $cacheFactory.get('cache');

    var getPatternData = function() {
        var requests = [],
            names = [],
            slug = [],
            styles = [];

        angular.forEach(jsonPath, function(value) {
            // Add Pattern name in array
            names.push(value.name);
            slug.push(value.slug);

            requests.push($http.get(value.path, {cache: cache}));
        });


        // when all requests are completed
        var all = $q.all(requests).then(function(response) {

            angular.forEach(response, function(r, i) {
                var parseObject = r.data;

                // create a slug from the title - a URL which identifies a page using human-readable keywords
                // for example Listing Pages becomes => listing-pages
                angular.forEach(parseObject, function(value) {
                value.slug = $filter('anchor')(value.name);
                });

                styles.push({
                    name: names[i],
                    slug: slug[i],
                    data: parseObject
                });
            });

            return styles;
        });

        return all;
    };

    return {
        getPatternData : getPatternData
    };
}])
.factory('flattener', function() {
    /**
     * Flattening Array
     * @param  {Object}
     * @return {Object} Flattened array
     */
    function arrayFlattener(arrr, template, category) {

        var a = [];

        var flattenArray = function(arr, parent) {

            for(var i = 0; i< arr.length; i++) {

                parent = parent? parent: '';
                var root = parent.replace(/\s+/g, '-').toLowerCase(),
                    slug = arr[i].name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').replace(/\s+/g, '-').toLowerCase();

                a.push({
                value: arr[i].name,
                slug: slug,
                root: root,
                template: arr[i].template? arr[i].template: null,
                url: '/' + category + '/' + (root? root : slug) + (slug !== root && root? '/' + slug : '') ,
                category: category
                });

                if(arr[i].children && typeof arr[i].children === 'object') {
                    var p = parent? parent : arr[i].name;
                    flattenArray(arr[i].children, p);
                }
            }

            return a;
        };

        return flattenArray(arrr);
    }

    return { arrayFlattener: arrayFlattener};
});
