var app = angular.module('JuTubeApp', []);
var socket = io();
var currentTicket = undefined;
var isPlaying = false;

socket.on("get status", data => {
  isPlaying = data;
});

app.run(function () {
});

// Config

app.config(function ($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

// Service

app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
  var tickets = [];
  var results = [];
  this.listResults = function (data) {
    results.length = 0;
    for (var i = data.items.length - 1; i >= 0; i--) {
      results.push({
        id: data.items[i].id.videoId,
        title: data.items[i].snippet.title,
        description: data.items[i].snippet.description,
        thumbnail: data.items[i].snippet.thumbnails.default.url,
        author: data.items[i].snippet.channelTitle
      });
    }
    return results;
  }

  this.getResults = function () {
    return results;
  };

  this.addTickets = function (data) {
    tickets = data;
  }

  this.addTicket = function (data) {
    tickets.push(data);
    return data;
  }

  this.addMusic = function (current, data) {
    const actual = tickets.find(p => p._id === current);
    actual.playList.push(data);
  }

  this.update = function (data) {
    const ticketActual = tickets.findIndex(p => p._id === data._id);
    tickets[ticketActual].isRunning = data.isRunning;
  }

  this.getMusic = function (current) {
    const actual = tickets.find(p => p._id === current);
    const actualMusic = actual.playList.find(p => p.state === false);
    return actualMusic;
  }

  this.getTicketById = function (ticketId) {
    return tickets.find(p => p._id === ticketId);
  }
  this.deleteMusicById = function (music) {
    const ticketActual = tickets.findIndex(p => p._id === music.ticketId);
    tickets[ticketActual].playList.splice(tickets[ticketActual].playList.findIndex(r => r._id === music._id), 1);
  }

  this.updateItem = function (current) {
    const ticketActual = tickets.findIndex(p => p._id === current.ticketId);
    const actual = tickets[ticketActual].playList.findIndex(r => r._id === current._id);
    tickets[ticketActual].playList[actual].state = current.state;
    return this.getMusic(current.ticketId);
  }

  this.deleteTickets = function (list, id) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i]._id === id) {
        list.splice(i, 1);
        break;
      }
    }
  };

  this.deleteTicket = function (id) {
    tickets.splice(tickets.findIndex(p => p._id === id._id), 1);
  }

  this.getTickets = function () {
    return tickets;
  }
}]);

app.controller('VideosController', function ($scope, $http, $log, VideosService, $document) {

  init();
  initSearch();
  function init() {
    $http.get('http://localhost:3000/ticket/day')
      .success(function (data) {
        VideosService.addTickets(data);
        $scope.tickets = VideosService.getTickets();
      })
      .error(function () {
        $log.info('Search error');
      });
    $scope.results = VideosService.getResults();
  }

  $scope.play = function () {
    socket.emit("play");
  }

  $scope.pause = function () {
    socket.emit("pause");
  }

  $scope.stop = function () {
    socket.emit("stop");
  }

  function initSearch() {
    $http.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: 'AIzaSyBRxGR8hQNIS0trqabLdz-yGG_mleG-Ru8',
        type: 'video',
        maxResults: '8',
        part: 'id,snippet',
        fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
        q: "simple plan"
      }
    })
      .success(function (data) {
        VideosService.listResults(data);
        $log.info(data);
      })
      .error(function () {
        $log.info('Search error');
      });
  }

  $scope.createTicket = function () {
    $http.post('http://localhost:3000/ticket')
      .success(function (data) {
        VideosService.addTicket(data);
      })
      .error(function () {
        $log.info('Search error');
      });
  }

  $scope.playTicket = function (id) {
    if (containMusic(id)) {
      if (!isPlaying) {
        $http.put('http://localhost:3000/ticket/playing/' + id)
          .success(function (data1) {
            VideosService.update(data1);
            socket.emit("playLoad", VideosService.getMusic(id));
            isPlaying = true;
          })
          .error(function () {
            alert("Fallo al actualizar");
          });
      } else {
        alert("Esta tocando...");
      }
    }
  }

  $scope.queue = function (data) {
    if (VideosService.getTickets().length == 0 || currentTicket == undefined) {
      alert("creer un ticket o seleccione por favor");
    } else {
      addMusic(data);
    }
  }

  socket.on("endedMusic", (data) => {
    const current = VideosService.updateItem(data);
    if (current !== undefined) {
      socket.emit("playLoad", current);
    } else {
      console.log("completed");
      updateTicket(data);
    }
  });

  function containMusic(ticketId) {
    var ticket = VideosService.getTicketById(ticketId);
    if (ticket.playList.length < 3) {
      alert("Por favor agrege playlist");
      return false;
    }
    return true;
  }
  function checkList() {
    if (VideosService.getTickets().length != 0) {
      const current = VideosService.getTickets()[0];
      $scope.launchList(current);
      $scope.playTicket(current._id);
    } else {
      socket.emit("last");
    }
  }

  function updateTicket(data) {
    $http.delete('http://localhost:3000/ticket/' + data.ticketId)
      .success(function (data1) {
        VideosService.deleteTicket(data1);
        isPlaying = false;
        $scope.playList = [];
        checkList();
      })
      .error(function () {
        alert("Fallo al eliminar");
      });
  }

  function addMusic(data) {
    var music = {
      name: data.title,
      state: false,
      ticketId: currentTicket,
      urlVideo: data.id
    }

    $http.post('http://localhost:3000/ticket/' + currentTicket, music)
      .success(function (data1) {
        VideosService.addMusic(currentTicket, data1);
      })
      .error(function () {
        alert("no puede agregar mas musica");
      });
  }

  // $scope.play = function() {
  //   if (currentTicket !== undefined && isPlaying == false) {
  //       // $document[0].getElementById("play").style.visibility = "hidden";
  //       // $document[0].getElementById("pause").style.position = "visible";
  //       $document[0].getElementById(currentTicket).style.pointerEvents = "none";
  //       socket.emit("play music", currentTicket);
  //       isPlaying = true;
  //   } else if(isPlaying) {
  //       // socket.emit("play current");
  //   } else {
  //       alert("seleccione un ticket por favor!");
  //   }
  // }

  $scope.search = function () {
    $http.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: 'AIzaSyBRxGR8hQNIS0trqabLdz-yGG_mleG-Ru8',
        type: 'video',
        maxResults: '8',
        part: 'id,snippet',
        fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
        q: this.query
      }
    })
      .success(function (data) {
        VideosService.listResults(data);
        $log.info(data);
      })
      .error(function () {
        $log.info('Search error');
      });
  }

  $scope.launchList = function (data) {
    VideosService.getTickets().forEach(element => {
      if (element._id == data._id) {
        console.log(element._id);
        currentTicket = element._id;
        $document[0].getElementById(element.number).style.background = "#1171A2";
      } else {
        $document[0].getElementById(element.number).style.background = "#22242a";
      }
    });
    $scope.playList = data.playList;
  }

  $scope.deleteTicket = function (list, id) {
    $http.delete('http://localhost:3000/ticket/' + id)
      .success(function (data1) {
        VideosService.deleteTickets(list, id);
        $scope.playList = [];
      })
      .error(function () {
        alert("El ticket actual ya esta tocando");
      });

  }

  $scope.deleteMusic = function (music) {
    var current = VideosService.getTicketById(music.ticketId);
    if (!current.isRunning) {
      $http.post('http://localhost:3000/ticket/musicdelete', music)
        .success(function () {
          VideosService.deleteMusicById(music);
        })
        .error(function () {
          alert("Fallo al eliminar");
        });

    } else {
      alert("Actual tickes no se puede eliminar porque ya esta tocando.")
    }
  }

});