var app = angular.module('LoginApp', []);

app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
    var tickets = [];
    this.addTickets = function (data) {
        tickets = data;
    }
    this.getTickets = function () {
        return tickets;
    }
}]);

app.controller('VideosController', function ($scope, $http, $log, VideosService, $document, $window) {

    $scope.login = function () {
        // alert($scope.username, $scope.password);
        var login = {
            username: $scope.username,
            password: $scope.password
          }
      
        $http.post('http://localhost:3000/user/login', login)
        .success(function (data) {
            $window.location.href = "http://localhost:3000/admin";
        })
        .error(function () {
            alert("fallo al ingresar");
        });
      }

    function init() {
        $http.get('http://localhost:3000/ticket/')
            .success(function (data) {
                VideosService.addTickets(data);
                $scope.tickets = VideosService.getTickets();
                $scope.totalTicket = VideosService.getTickets().length;
            })
            .error(function () {
                $log.info('Search error');
            });

            $http.get('http://localhost:3000/ticket/today')
            .success(function (data) {
                $scope.totalTicketToday = data.length;
            })
            .error(function () {
                $log.info('Search error');
            });
    }

});