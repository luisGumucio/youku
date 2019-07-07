var app = angular.module('TicketsApp', []);

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

    $scope.totalTicket = 0;
    $scope.totalTicketToday = 0;
    $scope.user = null;
    let today = new Date();
    $scope.date1 = new Date();
    $scope.date2 = Date.now();
    $scope.total = 0;
    ticketCopy = [];
    initLogin();
    	
    $scope.logout = function() {
        $http.post('http://localhost:3000/user/logout', $scope.user)
        .success(function (data) {
            $window.location.href = "http://localhost:3000/login";
        })
        .error(function () {
            // $window.location.href = "http://localhost:3000/login";
        });
    }
    $scope.myFilter = function() {
        let date = {
            "date": $scope.date1
        }
        $http.post('http://localhost:3000/ticket/date', date)
        .success(function (data) {
            $scope.tickets = data;
        })
        .error(function () {
            console.log("failed");
        });
    }

    function initLogin() {
        $http.post('http://localhost:3000/user/')
        .success(function (data) {
            $scope.user = data;
            init();
        })
        .error(function () {
            $window.location.href = "http://localhost:3000/login";
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

    $scope.myFunc = function(date1) {
        if (date1 != "") {
            let date = {
                "date": date1
            }
            $http.post('http://localhost:3000/ticket/date', date)
            .success(function (data) {
                $scope.tickets = data;
                $scope.total = data.length;
            })
            .error(function () {
                console.log("failed");
            });
        } else  {
            $scope.total = 0;
            init();
        }
    };

});

//   app.filter("myfilter", function($http) {
//     return function(items, from) {
//         if(from != undefined) {
//             let date = {
//                 "date": from
//             }
//             $http.post('http://localhost:3000/ticket/date', date)
//             .success(function (data) {
//                 return data
//             })
//             .error(function () {
//                 console.log("failed");
//             });
//         }
//         //   var df = parseDate(from);
//         //   var dt = parseDate(to);
//         //   var result = [];        
//         //   for (var i=0; i<items.length; i++){
//         //       var tf = new Date(items[i].date1 * 1000),
//         //           tt = new Date(items[i].date2 * 1000);
//         //       if (tf > df && tt < dt)  {
//         //           result.push(items[i]);
//         //       }
//         //   }            
//           return items;
//     };
//   });