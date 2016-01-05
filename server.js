var express = require('express'), app = express();

app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/app.html');
});

var port = process.env.PORT || 3000;
var server = app.listen( port );
console.log('Server started at %s', server.address().port);
