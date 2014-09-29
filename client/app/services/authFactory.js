angular.module('app.services', [])

.factory('AuthFactory', function($http, $window, $state, $cookieStore) {
  return {
    isSignedIn: function() {
      //will return true or false if the cookie is present
      return !!$cookieStore.get('todos');
    }
  };

});