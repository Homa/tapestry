/**
 * Tapestry Services
 */

'use strict';

angular.module('tapestry.services', [])
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
