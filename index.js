var express=require("express"); 
var bodyParser=require("body-parser"); 
app=express();
const popup = require('node-popup');
const popup = require('node-popup/dist/cjs.js');
//package de hashage des mdp
var passwordHash = require('password-hash');

//connection a la bdd avec mongoose
const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/Projet-Trello'); 
var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
    console.log("- Connection succeeded"); 
});
  
app.use(bodyParser.json()); 
//app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
})); 

app.post('/sign_up', function(req,res){ 
    var name = req.body.name;
    var password = req.body.password; 
    var email =req.body.email;
    
    var hashedPassword = passwordHash.generate(password);
    console.log(hashedPassword);

    //objet data 
    var data = { 
        "name": name, 
        "password":hashedPassword, // Hasher le MDP 
        "email":email
    
    } 

// Ajout du user (obj data) en base
db.collection('Users').insertOne(data,function(err, collection){ 
     if (err) throw err; 
     console.log("- User inserted Successfully"); 
     }); 

    // Redirection vers la page index après création du user en base      
    return res.redirect('/'); 

}); 
  

//server créé avec Express
app.get('/', function(req, res) {

    res.render("index.ejs");
});

app.get('/signup', function(req, res) {

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
app.get('/signup_success', function(req, res) {

    res.render("signup_success.ejs");
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