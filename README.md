# Peer View

 Peer View is a peer-to-peer video chat application. Using WebRTC and Socket.io, it provides secure, authentication-free connection between two clients.

 The app has a simple to use interface, where two people can connect and exchange their video streams and text messages. Each pair of clients are connected through rooms with unique code. One who creates the room has to share the code alloted to him/her with his friend. The other client can then connect to the room. Maximum capacity for any room is 2.

 When connected, the clients can send/receive text messages and also use the onboard controls to manage their chat. The controls available are :
- Hide Video
- Mute Mic
- Disconnect
- Go Fullscreen
- Mute chat sounds

## Installation and Setup

The code structure is quite easy to navigate through. To start a live dev server run:

```
$ npm start
```

The app requires the node server to exchange metadata for the chat via sockets. To start the node server run the usual

```
$ node app.js
```

Or use nodemon, as per your needs.

Finally after the required changes build app for production with:

```
$ gulp build
```
