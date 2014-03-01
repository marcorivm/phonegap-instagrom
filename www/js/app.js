var Instaphone = angular.module('instaphone', ['ngRoute']);
Instaphone.value('base_url', base_url);
Instaphone.value('api_url', api_url);
Instaphone.value('api_key', getApiKey());
Instaphone.config(['$routeProvider',
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
]);
Instaphone.run(['$rootScope', '$location',
    function($rootScope, $location) {
        $(".logout-btn").on('click', function() {
            window.localStorage.removeItem('api_key');
            window.sessionStorage.removeItem('api_key');
            window.location = 'index.html';
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
]);
Instaphone.controller('photoUploadController', function($scope, $location, api_url, api_key) {
    $("#upload_form").on('submit', function(event) {
        var $this = $(this);
        var file_uri = $scope.file_uri;
        var description = $scope.description;

        var options = new FileUploadOptions();
        options.fileKey = "content";
        options.fileName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";

        var params = {
            api_key: api_key,
            description: description
        };

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(file_uri, encodeURI(api_url + 'groms'), function() {
            $location.path('/');
        }, function(error) {
            console.log(error);
        }, options);

        event.preventDefault();
        return false;
    });
});
Instaphone.controller('feedController', function($scope, api_url, base_url, api_key) {
    $scope.groms = [];
    $scope.api_url = api_url;
    $scope.base_url = base_url;

    var update = function() {
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
                $scope.groms.unshift(data[i]);
            };
            $scope.$apply();
            setTimeout(update, 5000);
        }, 'jsonp')
    }
    update();
});