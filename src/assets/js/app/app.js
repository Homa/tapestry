'use strict';

/**
 * Configuration
 */

var version = '1.0.0',
    lastUpdated = '26 Feb 2014',
    disqus_shortname = 'tapestryapp';


/* jsonPath of the files will be inserted by gulp-script-inject after reading /src/json folder */

/**
 * Tapestry Module
 */

angular.module('tapestry', [
    'tapestry.services',
    'tapestry.controllers',
    'tapestry.directives',
    'tapestry.filters',
    'ngRoute',
    'once'
    ])

    .value('version', version)

    .value('lastUpdated', lastUpdated)

    .value('isMobile', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( (navigator.userAgent||navigator.vendor||window.opera)))

    .value('disqus_shortname', disqus_shortname)
    /**
     * Router provider
     * @param  {[type]} $routeProvider [description]
     */
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.hashPrefix('!');

        /* Homepage */

        $routeProvider.when('/', {
            title: 'Overview',
            templateUrl: 'assets/js/templates/home.html',
            controller: 'headerController'

        })

        /* Homepage */

        $routeProvider.when('/changelog', {
            title: 'Changelog',
            templateUrl: 'assets/js/templates/changelog.html',
            controller: 'headerController'

        })

        /* All other routes */

        $routeProvider.otherwise({redirectTo: '/'})


        /* Add new routes based on the Configuration */

        angular.forEach(jsonPath, function(value, key){

            value.slug = value.name.replace(/\s+/g, '-').toLowerCase()

            if(value.slug == "templates"){

                $routeProvider.when('/' + value.slug + '/:slug', {
                    templateUrl: 'assets/js/templates/listing-template.html',
                    controller: 'templateController'
                })

            }else{

                $routeProvider.when('/' + value.slug + '/:slug', {
                    templateUrl: 'assets/js/templates/listing.html',
                    controller: 'listingController'
                })

                $routeProvider.when('/' + value.slug + '/:slug/:section', {
                    templateUrl: 'assets/js/templates/listing.html',
                    controller: 'listingController'
                })
            }

        })


    }])

    /**
     * Runs once the app is initialized
     * @param  {[type]} $rootScope   [description]
     * @param  {[type]} $http        [description]
     * @return {[type]}              [description]
     */
    .run(['$rootScope', '$http', '$q', '$filter', '$cacheFactory', 'flattener', 'patternData',
        function($rootScope, $http, $q, $filter, $cacheFactory, flattener, patternData){

        $rootScope.styles = [];

        patternData.getPatternData().then(function(response) {
            $rootScope.styles = response;
        });

        /**
         * Change Title on routeChange
         */

        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

            if(current.$$route && current.$$route.title){

                $rootScope.$broadcast('sectionChange', current.$$route.title)

            }

        });



        /**
         * Watch changes and add to Autocomplete
         */



        $rootScope.$watch('styles', function(newValue){

            if(newValue.length){

                /**
                 * Creates a flattened version of the array
                 */

                var autoCompleteArray = []

                angular.forEach(newValue, function(value, index){

                    autoCompleteArray.push(flattener.arrayFlattener(value.data, value.name, value.slug))

                })

                /**
                 * Combines Arrays
                 */

                var data = autoCompleteArray.reduce(function(a, b, index, array){
                    return a.concat(b);
                })

                /**
                 * Invokes autocomplete
                 */

                window.$autocomplete = $('.js-pattern-search').autocomplete({

                    lookup: data,

                    onSelect: function(value){

                        var location = window.location.href,
                            hashPrefix = '#!',
                            path = location.split(hashPrefix)[0]

                        window.location.href = path + hashPrefix + value.url;

                    },

                    formatResult: function (suggestion, currentValue) {
                        var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'),
                            pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';

                        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>') +
                        '<span class="ac__desc">'+ suggestion.category + ' &rarr; ' + suggestion.root+'</span>';
                    }
                })


                /**
                 * hide Menu
                 */

                setTimeout(function(){
                    angular.element('html').removeClass('menu__opened');
                }, 2000)

            }

        }, true)


        /**
         * Fix position of autocomplete on scroll
         */
        angular.element(window).bind('scroll resize', function(){

            $autocomplete && $autocomplete.autocomplete('fixPosition')

        });

    }]);
