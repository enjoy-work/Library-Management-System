(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router'])
        .config(config)
        .run(run);
 
    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                data: { activeTab: 'home' }
            })
            .state('addremoveBook', {
                url: '/addremoveBook',
                templateUrl: 'addremoveBook/index.html',
                controller: 'addremoveBook.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'addremoveBook' }
            })
            .state('issuereturnBook', {
                url: '/issuereturnBook',
                templateUrl: 'issuereturnBook/index.html',
                controller: 'issuereturnBook.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'issuereturnBook' }
            });
    }
 
    function run($http, $rootScope, $window) {

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
 
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }
 

    $(function () {
        $.get('/app/token', function (token) {
            window.jwtToken = token;
 
            angular.bootstrap(document, ['app']);
        });
    });

    $(".container").on('click', function (e){
      if(e.target.id.toLowerCase() != 'btnadd' && e.target.id.toLowerCase() != 'btnremove' && e.target.id.toLowerCase() != 'btnissue' && e.target.id.toLowerCase() != 'btnreturn')
         $(".flash-message").css("display","none");
      else
        $(".flash-message").css("display","block");
});

})();
 