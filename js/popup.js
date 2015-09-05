/**
*  Module
*
* Description
*/
angular.module('MyTorrent', [])
  .controller('TorrentCtrl', ['$scope', '$http', function ($scope, $http) {
      $scope.loading = false;

      $scope.getMovies = function() {
        $http.get('https://yts.to/api/v2/list_movies.json?sort_by=year&limit=50').
          then(function(response) {
          if (response.status === 200) {

            $scope.data = [];

            var values = response.data.data.movies;
            angular.forEach(values, function(val, key) {
             $scope.data.push(val);
            });

            $scope.loading = true;
          }

        }, function(error) {
          alert("Issues connecting to the server. Check your internet connection or Please try again later.");
        });
      }

      $scope.getSearchQuery = function() {

        $scope.loading = false;
        var url = "https://getstrike.net/api/v2/torrents/search/?phrase=" + $scope.search_term;

        $http.get(url)
          .then(function (response) {

            if (response.status === 200) {
              var arr = [];
              angular.forEach(response.data.torrents, function(val, key) {
                if (val.seeds >= 500 || val.sub_category === "Highres Movies" && val.imdbid != " ") {
                  arr.push(val);
                }
              });

              filterData(arr);

            } else {
              alert(response.data.message);
            }

          }, function(error) {
            alert(error.data.message);
          })

        $scope.search_term = "";
      }

      function filterData (arr) {

        var object = {};
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].imdbid === "none" || arr[i] === " ") {
            return;
          } else {
            fetchDataFromIMDB(arr[i]);
          }
        }
      }

      function fetchDataFromIMDB(arr) {

        $scope.imdbResponse = [];
        var imdbidUrl = "http://www.omdbapi.com/?i=" + arr.imdbid + "&plot=short&r=json";

        $http.get(imdbidUrl)
          .then(function(details) {

            if (details.status === 200) {
              $scope.loading = true;
              details.data["seeds"] = arr.seeds;
              details.data["magnet"] = arr.magnet_uri;
              details.data["hash"] = arr.torrent_hash;
              details.data["size"] = convertSize(arr.size);
              details.data["leeches"] = arr.leeches;

              $scope.imdbResponse.push(details.data);
            } else {
              alert(details.data.message);
            }

          }, function(error) {
            alert(error.data.message);
          });
      }

      function convertSize(size) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (size === 0) return '0 ' + sizes[0];
        var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
        return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
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
