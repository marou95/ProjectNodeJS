var request= require("./requeteBDD");
var express=require("express");
var app=express();  
var bodyParser=require("body-parser");
 
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Projet-Trello";

app.use(express.urlencoded({ extended: true }));

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

    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
        if (err) throw err;
        var dbo = db.db("Projet-Trello");
        if (err) throw err;
        // Ajout du user (obj data) en base
        dbo.collection('users').insertOne(data,function(err, collection){ 
            if (err) throw err; 
            console.log("Record inserted Successfully"); 
            db.close();
            res.redirect('/');
        });
    });
    
}); 

//sauvegarde un projet (nouveau ou pas), champs : titre , personList
app.post('/save_project/:name', function(req,res){
    
    var title = req.body.title;
    
    //transforme string du formulaire en Array d'objet pour la personList
    var members= req.body.members;
    var tabMembers= members.split(",");
    var tabMembersObj = [];
    for(var i = 0; i<tabMembers.length; i++){
        tabMembersObj[i] = {nameP: tabMembers[i], roleP: "member"};
    }
    
    if(req.params.name == 'new'){
        var projectObject = {name: title, personList: tabMembersObj};
        request.insertNewProject(projectObject).then(
            res.redirect("/my-projects")
            );
    } else {
        request.defineNewMemberList(req.params.name, tabMembersObj).then(
            res.redirect("/my-projects")
        );
    }    
});


//server créé avec Express
// route des pages
app.get('/', function(req, res) {

    res.render("index.ejs");
});

app.get('/sign-up', function(req, res) {

    res.render("signUp.ejs");
});

app.get('/my-projects', function(req, res) {
    request.getAllProject().then((projects) => {
        res.render("myProjects.ejs",{projects: projects});
    });
});

app.get('/tasks/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        res.render("tasks.ejs",{project: project});
    });
});

//if et else car si nouveau projet titre modifiable
app.get('/project/:name', function(req, res) {
    if(req.params.name == 'new'){
        console.log("new project !");
        res.render("project.ejs",{project: req.params.name});
    }
    else{
        request.getProject(req.params.name).then((project) => {
            res.render("project.ejs",{project: project});
        });
    }
});

app.get('/task-detail', function(req, res) {

    res.render("taskDetail.ejs");
});

app.get('/conversation/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        res.render("conversation.ejs",{project: project});
    });
});

app.get('/Git-commit/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        res.render("gitCommit.ejs",{project: project});
    });
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
app.listen (8080);