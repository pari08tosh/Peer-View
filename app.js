const express = require('express');
const bodyParser = require('body-parser');
const randomstring = require('randomstring');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let clients = {};
let rooms = {};

app.use(express.static('dist'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

io.on('connection', (socket) => {

    function log(data) {
        socket.broadcast.emit('message', data);
    }

    socket.on('createRoom', () => {
        let room = randomstring.generate({
            length: 5,
            charset: 'alphanumeric',
            capitalization: 'lowercase'
          });
        
        socket.join(room);
        clients[socket] = room;
        rooms[room] = 1;
        socket.emit('room', room);
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        clients[socket] = room;
        rooms[room]++;
    });

    socket.on('handshake', (data, room) => {
        socket.broadcast.in(room).emit('handshake', data);
    });

    socket.on('exit', (room) => {
        socket.broadcast.in(room).emit('exit');
        delete rooms[room];
    });
});


function generateCode() {
    let code = randomstring.generate({
        length: 5,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
      });
    while(code in rooms) {
        code = randomstring.generate({
            length: 5,
            charset: 'alphanumeric',
            capitalization: 'lowercase'
          });
    }
    return code;
}

app.post('/checkVacancy', (req, res) => {
    if (req.body.room in rooms) {
        if (rooms[req.body.room] < 2) {
            res.json({
                vacancy: true
            });
        } else {
            res.json({
                vacancy: false,
                msg: `Sorry, this room is full.`
            })
        }
    } else {
        res.json({
            vacancy: false,
            msg: `This room doesn't exist. Plese check your code.`
        })
    }
});

server.listen(3333, () => {
    console.log(`Server started on port 3333`);
})


