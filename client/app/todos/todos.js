angular.module('app.todos', [])

.config(function($stateProvider) {
  $stateProvider
    .state('app.todos', {
      url: 'todos',
      templateUrl: '/app/todos/todos.tpl.html',
      controller: 'TodosController',
      authenticate: true
    });
})
.controller('TodosController', function($scope, $http) {
  $scope.todo = '';

  $http.get('/todos').then(function(res) {
    $scope.todos = res.data;
  });

  $scope.submit = function() {
    $http({
      method: 'POST',
      url: '/todos',
      data: {todo: $scope.todo}
    }).then(function(res) {
      $scope.todos.push(res.data);
      $scope.todo = '';
    });
  };

  $scope.finished = function(index) {
    $http({
      method: 'DELETE',
      url: '/todos/' + $scope.todos[index].id,
    }).then(function(res) {
      for(var i = 0; i < $scope.todos.length; i++) {
        if($scope.todos[i].id === parseInt(res.data.id)) {
          $scope.todos.splice(i, 1);
        }
      }
    }).catch(function(err) {
      console.log(err, ' err');
    });
  };
});