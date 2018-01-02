var Peer = require('simple-peer')

var socket = io.connect();
var initiator = false;
var roomCode; // The current room of the client.
var connected;
var fullscreen = false;
var muteChat = false;

window.addEventListener('unload', function(event) {
    socket.emit('exit', roomCode);
  });

$(() => {
    $('.create-room').click(() => {
        $('.create-room').prop('disabled', true);
        initiator = false;
        socket.emit('createRoom');
        start();

        $('.home-div').fadeOut(300, () => {
            $('.chat-div').fadeIn(300);
        });
    });

    $('.join-room').click(() => {
        $('.buttons').fadeOut(300, () => {
            $('.room-code').fadeIn(300);
        });
    });

    $('#room-code-form').submit((e) => {
        e.preventDefault();
        let room = $('#room').val();
        if (room === '') {
            Materialize.toast(`Enter room code`, 3000, 'red lighten-1');
            return;
        }
        if (room.length !== 5) {
            Materialize.toast(`Invalid room code`, 3000, 'red lighten-1');
            return;
        }
        $.post('checkVacancy', { room: room }).done((data) => {
            if (data.vacancy) {
                socket.emit('joinRoom', room);
                updateRoom(room);
                initiator = true;
                $('.waiting-div').hide();
                $('.connecting-div').show();
                $('.home-div').fadeOut(300, () => {
                    $('.chat-div').fadeIn(300);
                });
                start();
            } else {
                Materialize.toast(data.msg, 3000, 'red lighten-1');
            }
        })
    });

    $('#full-screen-btn').click(() => {
        toggleFullscreen();
    });

    $('#disconnect-btn').click(() => {
        location.reload();
    });

    $('#receive-message').prop('volume', .5);

    $("#mute-chat").click(() => {
        $('#mute-chat').toggleClass('grey');
        muteChat = !muteChat;
    });

});

socket.on('room', (data) => {
   updateRoom(data);
})


function start() {
    navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia(
        { 
            video: {
                optional: [
                  {minWidth: 320},
                  {minWidth: 640},
                  {minWidth: 1024},
                  {minWidth: 1280},
                  {minWidth: 1920},
                  {minWidth: 2560},
                ]
            },
            audio: true 
        }, gotMedia, function () {});
}

function gotMedia (stream) {
    var video = document.querySelector('video#myVideo');
    video.src = window.URL.createObjectURL(stream);
    video.play();


    var p = new Peer({ initiator: initiator, trickle: false, stream: stream })
     
    p.on('error', function (err) { 
        console.log('error', err);
        Materialize.toast(`Something went wrong. Please try again. Disconnecting...`, 4000, 'red lighten-1');
        setTimeout(() => {
            location.reload();
        }, 3000); 
    })
     
    p.on('signal', function (data) {
      socket.emit('handshake', data, roomCode);
    });

    socket.on('handshake', (data) => {
        p.signal(data);
    });

    $("#chat-message").keypress(function (e) {
        if(e.which === 13 && !e.shiftKey) {        
            $(this).closest("form").submit();
            e.preventDefault();
            return false;
        }
    });

    $('#chat-form').submit((e) => {
        e.preventDefault();
        if ($('#chat-message').val() === '') {
            return;
        }
        $('.chat-box').append('<p class="my-message">' + $('#chat-message').val() + '</p>');
        $(".chat-box").animate({ scrollTop: $('.chat-box').prop("scrollHeight")}, 300);
        if (connected) {
            p.send($('#chat-message').val());
        }
        $("#chat-message").val('');
    })
     
    p.on('connect', function () {
      connected = true;
      $('.waiting-div').fadeOut(300);
      $('.connecting-div').fadeOut(300);
      $('#chat-message').prop('disabled', false);
      $('.fa-circle').css('color', '#4caf50');
      $('.send-message').prop('disabled', false);
    })
     
    p.on('data', function (data) {
      if ( $('.text-div').css('display') === 'none') {
        Materialize.toast(`Your friend sent you a message, but chat facility is not available on mobile devices.`, 4000, 'indigo');
      } else {
        $('.chat-box').append('<p class="remote-message">' + data + '</p>');
        $(".chat-box").animate({ scrollTop: $('.chat-box').prop("scrollHeight")}, 300);
        if (!muteChat) {
            $('#receive-message')[0].currentTime = 0;
            $('#receive-message').trigger("play");
        }
        if (fullscreen) {
          Materialize.toast(`New Message Received`, 2000, 'indigo');
        }
      }
    })

    p.on('stream', function (stream) {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video#remoteVideo');
        video.src = window.URL.createObjectURL(stream);
        video.play();
    })

    socket.on('exit', () => {
        $('.disconnected-div').fadeIn(300);
        $('#chat-message').prop('disabled', true);
        $('.fa-circle').css('color', '#f44336');
        $('.send-message').prop('disabled', true);
        setTimeout(() => {
            location.reload();
        }, 3000);
    });

    // Audio Video Controls

    $('#mute-btn').click(() => {
        $('#mute-btn').toggleClass('grey');
        stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    });

    $('#hide-video').click(() => {
        $('#hide-video').toggleClass('grey');
        stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
    });
}


function updateRoom(room) {
    roomCode = room;
    $('.chat-room').html('<p><i class="fa fa-circle" aria-hidden="true"></i> Room - '+ roomCode + '</p>');
    $('.waiting-div').append('<p style="font-size: 120%; color: white; padding-top: 60px;"> Ask Him/Her to join room ' + roomCode + '</p>');
}

function toggleFullscreen() {
    $('#full-screen-btn').toggleClass('grey');
    if (fullscreen) {
        $('.video-grid').css({
            'width': '70%',
            'z-index': 'auto'
        });
        $('.text-div').css('opacity', '1');
        $('#myVideo').css('width', '200px');
        fullscreen = false;
    } else {
        $('.video-grid').css({
            'width': '100%',
            'z-index': '50'
        });

        $('.text-div').css('opacity', '0');
        $('#myVideo').css('width', '250px');
        fullscreen = true;
    }
}