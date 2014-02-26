var base_url = "http://10.16.90.97/";
var api_url = base_url + "api/v1/";
var update;
var instagrom = angular.module('instagrom', [])
    .value('base_url', base_url)
    .value('api_url', api_url)
    .controller('feedController',
        function($scope, api_url, base_url) {
            $scope.groms = [];
            $scope.api_url = api_url;
            $scope.base_url = base_url;

            update = function() {
                $.get(api_url + 'groms', function(resultado) {
                    var data = resultado.data
                    var last = $scope.groms[0];
                    for (var i = 0, j = data.length - 1; i <= j; i++) {
                        if (last != undefined && data[i].id <= last.id) {
                            break;
                        }
                        $scope.groms.unshift(data[i]);
                    };
                    $scope.$apply();
                    setTimeout(update, 5000);
                }, 'jsonp')
            }
            update();
        });

$("#take_picture").on('click', function() {

    var uploadPhoto = function(file_uri) {
        var options = new FileUploadOptions();
        options.fileKey = 'content';
        options.fileName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";

        options.params = {
            user_id: 1
        };

        var file_transfer = new FileTransfer();
        file_transfer.upload(file_uri, encodeURI(api_url + 'groms'), function(message) {
                update();
            },
            function(error) {

            }, options);
    };

    navigator.camera.getPicture(uploadPhoto, function(message) {
        alert('Failed because: ' + message);
    }, {
        quality: 10,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true,
        correctOrientation: true
    })
});