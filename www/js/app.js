var update;
var instagrom = angular.module('instagrom', [])
    .value('base_url', base_url)
    .value('api_url', api_url)
    .value('api_key', "")
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

$("#take_picture").on('click', function() {

    var uploadPhoto = function(file_uri, description) {
        var options = new FileUploadOptions();
        options.fileKey = 'content';
        options.fileName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";

        options.params = {
            description: description
        };

        var file_transfer = new FileTransfer();
        file_transfer.upload(file_uri, encodeURI(api_url + 'groms'), function(message) {
                update();
            },
            function(error) {

            }, options);
    };

    var editPhoto = function(file_uri) {
        var $image_preview = $('#image_preview');
        var $my_feed = $('#my_feed');
        $image_preview.find('img').attr('src', file_uri);
        $image_preview.show();
        $my_feed.hide();
    }

    $("#image_form").on('submit', function(event) {
        var $this = $(this);
        var file_uri = $this.find('img').attr('src');
        var description = $this.find('textarea').val();
        uploadPhoto(file_uri, description);
        $('#image_preview').hide();
        $('#my_feed').show();
        event.preventDefault();
        return false;
    })

    navigator.camera.getPicture(editPhoto, function(message) {
        alert('Failed because: ' + message);
    }, {
        quality: 10,
        destinationType: Camera.DestinationType.FILE_URI,
        saveToPhotoAlbum: true,
        correctOrientation: true
    })
});