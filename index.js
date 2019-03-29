#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(1306, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

const clients = new Map()
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    const connection = request.accept('dave-protocol', request.origin);
    //const connection = request.accept()
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
      console.log(message)
        if (message.type === 'utf8') {
          const msgContent = JSON.parse(message.utf8Data)
          console.log(msgContent)
          if(msgContent.type == "add-channel"){
            console.log("receiving a type!");
            clients.set(msgContent.login, connection)
            connection.sendUTF(`You added a channel!`)
          }
          if(msgContent.action == "signIn"){
              console.log("rensonse is logged!");
            clients.set(msgContent.login, connection)
            connection.sendUTF(`You are loggend as: ${msgContent.login}`)
          }
          if(msgContent.action == "sendMessage"){
            if(clients.has(msgContent.to)){
              clients.get(msgContent.to).sendUTF(msgContent.message)
              connection.sendUTF(`You sent a message to: ${msgContent.to}`)
            }else{
              console.log("no exist client ", msgContent.to)
              connection.sendUTF(`no exist user named: ${msgContent.to}`)
            }
          }


          //clients[0].sendUTF(message.utf8Data)
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
      // clients.delete("I dont now yet")
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
})



