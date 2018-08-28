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

server.listen(init.portNode, init.hostNode);
app.use(express.static(__dirname + '/html'));

// __________________________________________________________________________________Login statik
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/html/' + 'index.html'));
});

//  __________________________________________________________________________________4D_Global
function C4D(data) {
  var options = {
    method: 'POST',
    url: init.url4D,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'multipart/form-data;'
    },
    formData: data
  };

  request(options, function(error, response, body) {
    if (response.statusCode == 200) {
      var body = JSON.parse(response.body);
      switch (data.action) {
        case 'function':
          data.callBack(body);
          break;
        case 'http':
          data.callBack.send(body);
          break;
        case 'io':
          data.callBack.emit(body.action, body);
          break;
      }
      console.log({
        C4D: body
      });
    }
  });

}

// __________________________________________________________________________________HTTP
app.get("/C4DHTTP", function(req, res) {
  console.log({
    C4DHTTP: req.originalUrl
  });
  C4D({
    action: 'http',
    callBack: res,
    data: req.query
  });
});

// __________________________________________________________________________________IO
io.on('connection', function(socket) {

  socket.on('C4DFN', function(data, fn) {
    console.log({
      C4DFN: data
    });
    C4D({
      action: 'function',
      callBack: fn,
      data: data
    });
  });

  socket.on('C4DIO', function(data) {
    console.log({
      C4DIO: data
    });
    C4D({
      action: 'io',
      callBack: socket,
      data: data
    });
  });

});
