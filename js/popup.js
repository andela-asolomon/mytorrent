/**
*  Module
*
* Description
*/
angular.module('MyTorrent', [])
  .controller('TorrentCtrl', ['$scope', '$http', function ($scope, $http) {

      var opts = {
        lines: 13 // The number of lines to draw
      , length: 28 // The length of each line
      , width: 14 // The line thickness
      , radius: 42 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
      }
      var target = document.getElementById('foo')
      var spinner = new Spinner(opts).spin(target);

      $scope.getMovies = function() {
        $http.get('https://yts.to/api/v2/list_movies.json?sort_by=year&limit=50').
          then(function(response) {
          if (response.status === 200) {

            $scope.data = [];

            var values = response.data.data.movies;
            angular.forEach(values, function(val, key) {
             $scope.data.push(val);
            });
          }

        }, function(error) {
          alert("Issues connecting to the server. Check your internet connection or Please try again later.");
        });
      }

      $scope.getSearchQuery = function() {

        var url = "https://getstrike.net/api/v2/torrents/search/?phrase=" + $scope.search_term;

        $http.get(url)
          .then(function (response) {

            console.log("Response: ", response);
            var filters = _.findKey(response.data.torrents, { 'sub_category': "Highres Movies", 'uploader_username': 'YIFY' });
            var result = response.data.torrents[filters];

            console.log("Filters: ", filters);
            console.log("Result: ", result);

            $scope.download = result.torrent_hash;

            var imdbidUrl = "http://www.omdbapi.com/?i=" + result.imdbid + "&plot=short&r=json";

            $http.get(imdbidUrl)
              .then(function(details) {
                $scope.imdbResponse = details.data;
                console.log($scope.imdbResponse);
              }, function(error) {
                console.log("Error: ", error);
              });

          }, function(error) {
            console.log("Error: ", error);
          })

        $scope.search_term = "";
      }
  }])
  .directive('ngSearch', [function () {
      return function(scope, elem, attrs) {
        elem.bind('keydown keypress', function(event) {
          if (event.which === 13) {
            scope.$apply(function() {
              scope.$eval(attrs.ngSearch);
            });

            event.preventDefault();
          }
        });
      }
  }]);
