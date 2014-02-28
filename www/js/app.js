var update;
var api_key = (function() {
    if (window.sessionStorage.getItem('api_key') != null) {
        return window.sessionStorage.getItem('api_key');
    } else if (window.localStorage.getItem('api_key') != null) {
        return window.localStorage.getItem('api_key');
    } else {
        window.location = 'login.html';
    }
})();


var instagrom = angular.module('instagrom', ['ngRoute'])
    .value('base_url', base_url)
    .value('api_url', api_url)
    .value('api_key', api_key)
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'partials/home.html',
                controller: 'feedController'
            });
            $routeProvider.when('/upload', {
                templateUrl: 'partials/upload.html',
                controller: 'photoUploadController'
            });
            $routeProvider.otherwise({
                redirectTo: '/'
            });
        }
    ])
    .run(['$rootScope', '$location',
        function($rootScope, $location) {
            $(".logout-btn").on("click", function() {
                window.localStorage.removeItem('api_key');
                window.sessionStorage.removeItem('api_key');
                window.location = 'login.html';
            });
            $(".take-picture").on('click', function() {
                var editPhoto = function(file_uri) {
                    $rootScope.file_uri = file_uri;
                    $location.path('/upload');
                }

                navigator.camera.getPicture(editPhoto, function(message) {
                    alert('Failed because: ' + message);
                }, {
                    quality: 10,
                    destinationType: Camera.DestinationType.FILE_URI,
                    saveToPhotoAlbum: true,
                    correctOrientation: true
                })
            });
        }
    ])
    .controller('photoUploadController',
        function($scope, $location, api_url, api_key) {
            var uploadPhoto = function(file_uri, description) {
                var options = new FileUploadOptions();
                options.fileKey = 'content';
                options.fileName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";

                options.params = {
                    description: description,
                    api_key: api_key
                };

                var file_transfer = new FileTransfer();
                file_transfer.upload(file_uri, encodeURI(api_url + 'groms'), function(message) {
                        $location.path('/');
                    },
                    function(error) {

                    }, options);
            };

            $("#image_form").on('submit', function(event) {
                var $this = $(this);
                var description = $this.find('textarea').val();
                uploadPhoto($scope.file_uri, description);
                event.preventDefault();
                return false;
            })
        })
    .controller('feedController',
        function($scope, api_url, base_url, api_key) {
            $scope.groms = [];
            $scope.api_url = api_url;
            $scope.base_url = base_url;

            update = function() {
                $.get(api_url + 'groms', {
                    api_key: api_key
                }, function(resultado) {
                    var data = resultado.groms.data
                    var last = typeof $scope.groms[0] !== 'undefined' ? $scope.groms[0] : {
                        id: 0
                    };
                    for (var i = data.length - 1; i >= 0; i--) {
                        if (last != undefined && data[i].id <= last.id) {
                            continue;
                        }
                        console.log("Valor " + i + ":");
                        console.log(data[i]);
                        console.log("Ultimo");
                        console.log(last);
                        $scope.groms.unshift(data[i]);
                    };
                    $scope.$apply();
                    setTimeout(update, 5000);
                }, 'jsonp')
            }
            update();
        });