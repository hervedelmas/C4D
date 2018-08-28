const init = {
    hostNode: '0.0.0.0',
    portNode: 8080,
    url4D: 'http://0.0.0.0/4DACTION/C4D'
  },
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io')(server, {
    origins: '*:*'
  }),
  request = require('request'),
  bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

server.listen(init.portNode, init.hostNode, function() {
  console.log('* * * ECOUTE SUR http://' + init.hostNode + ':' + init.portNode);
});

//  __________________________________________________________________________________Function
function stringifyData(data) {
  var arKey = Object.keys(data);
  var arVal = Object.values(data);
  for (var i = 0; i < arKey.length; i++) {
    if (typeof arVal[i] != 'string') {
      data[arKey[i]] = JSON.stringify(arVal[i]);
    }
  }
  return data;
}

//  __________________________________________________________________________________4D_Global
function C4D(http, socket, data) {
  var options = {
    method: 'POST',
    url: init.url4D,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'multipart/form-data;'
    },
    formData: stringifyData(data)
  };

  request(options, function(error, response, body) {
    if (response.statusCode == 200) {
      var body = JSON.parse(response.body);
      if (socket) {
        socket.emit(body.action, body);
      }
      if (http) {
        http.send(body);
      }
      console.log({
        C4D: body
      });
    }
  });

}

// __________________________________________________________________________________HTTP
app.get("/C4D", function(req, res) {
  console.log({
      C4DHTTP: req.originalUrl
  });
  C4D(res, null, req.query);
});

// __________________________________________________________________________________IO
io.on('connection', function(socket) {

  socket.on('C4D', function(data) {
    console.log({
      C4DIO: data
    });
    C4D(null, socket, data);
  });

  socket.on('disconnect', function() {

  });
});
