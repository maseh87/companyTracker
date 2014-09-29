angular.module('todoApp', [
  'ui.router',
  'ngCookies',
  'app.login',
  'app.todos',
  'app.services'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/',
      template: '<div ui-view></div>'
    });
  $urlRouterProvider.otherwise('/todos');
})
//when the application is loaded and ready to run this method is run. This is where auth will be checked
.run(function($rootScope, $state, $cookieStore, AuthFactory) {
  var cookie = $cookieStore.get('todos');
  console.log(cookie);
  $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState, fromStateParams) {
    //if the next view has an authentication property and the user does not have proper cookies then take them home
    if(toState.authenticate && !AuthFactory.isSignedIn()) {
      event.preventDefault();
      $state.go('app.login');
    }
  });
});
