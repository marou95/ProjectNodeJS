var express = require('express');
var app = express();

//server créé avec Express
app.get('/', function(req, res) {

    res.render("index.ejs");
});

app.get('/sign-up', function(req, res) {

    res.render("signUp.ejs");
});

app.get('/my-projects', function(req, res) {

    res.render("myProjects.ejs");
});

app.get('/tasks', function(req, res) {

    res.render("tasks.ejs");
});

app.get('/new-project', function(req, res) {

    res.render("newProject.ejs");
});

app.get('/task-detail', function(req, res) {

    res.render("taskDetail.ejs");
});

app.get('/conversation', function(req, res) {

    res.render("conversation.ejs");
});

app.get('/Git-commit', function(req, res) {

    res.render("gitCommit.ejs");
});




// route pour jquery et bootstrap

app.get('/vendor/bootstrap/css/bootstrap.min.css', function(req, res) {

    res.sendFile("vendor/bootstrap/css/bootstrap.min.css", {root : '.'});
});

app.get('/css/simple-sidebar.css', function(req, res) {

	res.sendFile("css/simple-sidebar.css", {root : '.'});
});

app.get('/vendor/jquery/jquery.min.js', function(req, res) {

	res.sendFile("vendor/jquery/jquery.min.js", {root : '.'});
});

app.get('/vendor/bootstrap/js/bootstrap.bundle.min.js', function(req, res) {

	res.sendFile("vendor/bootstrap/js/bootstrap.bundle.min.js", {root : '.'});
});




// on defini le port sur lequel on ecoute
//server.listen(8080)
app.listen (8080);