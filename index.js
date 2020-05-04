var express = require('express');
var app = express();

//server créé avec Express
app.get('/', function(req, res) {

    res.render("index.ejs");
});


// on defini le port sur lequel on ecoute
//server.listen(8080)
app.listen (8080);