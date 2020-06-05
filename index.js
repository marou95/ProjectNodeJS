var request= require("./js/requeteBDD");
var express=require("express");
var app=express();  
var bodyParser=require("body-parser");
var server = require('http').Server(app);
var io = require('socket.io')(server);
 
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Cookies = require('cookies');

 //package de hashage des mdp
var passwordHash = require('password-hash');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var JSONGit;
 
// EN DUR POUR VERIFIER LE FONCTIONNEMENT
var NAME = "letest";

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Projet-L3";

var rp = require('request-promise');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//appel des derniers commits Github
  

// fonction middleware d'authentification: verification du token user
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        const privateKey = fs.readFileSync('private.key'); //lecture du fichier de la clé privé

        jwt.verify(token, privateKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


app.post('/sign_up', function(req,res){ 
    name = req.body.name;
    var password = req.body.password; 
    var email =req.body.email;
    
    var hashedPassword = passwordHash.generate(password);
    //console.log(hashedPassword); //mdp hashé

    //objet data 
    var data = { 
        "name": name, 
        "password":hashedPassword, 
        "email":email
    }

    //Ajout utilisateur en base via le signup form
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
        if (err) throw err;
        var dbo = db.db("Projet-L3");

        //recherche dans la base si le username existe deja
        dbo.collection('users').findOne({name : name}, function(err, result) {
            if(err) throw err;
            if(result){ //Si le username existe deja..
                console.log("Found: "+name);
                res.send('<script>alert("This username is already taken.")</script>');
                // res.redirect('/signup');
            }  
            else{ //Sinon l'ajouter à la bdd
                console.log("Not found: "+name);
                dbo.collection('users').insertOne(data,function(err, collection){ 
                    res.redirect('/');
                    db.close();
                });
                
            } 
        }); 
    }); 
});

app.get('/signup_success', function(req, res) {

    res.render("signup_success.ejs");
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
        res.render("myProjects.ejs",{projects: projects, userName: NAME});
    });
});

//if et else car si nouveau projet titre modifiable
app.get('/project/:name', function(req, res) {
    request.getAllProject().then((projects) => {
        var projectNameList = [];
        for(var i = 0; i < projects.length; i++){
            projectNameList[i] = projects[i].name;
        }

        if(req.params.name == 'new'){
            console.log("new project !");
            res.render("project.ejs",{project: req.params.name, projectNameList: projectNameList});       
        }
        else{
            request.getProject(req.params.name).then((project) => {
                res.render("project.ejs",{project: project, projectNameList: projectNameList});
            });
        }
   });	
});

app.post('/connexion', function (req, res) {
    console.log('connexion called');
    var password = req.body.password;
    var name = req.body.name;

    // check si les données sont dans la requête post
    if (!password || !name) {
        res.send(undefined);
    }
    else {
        //connexion a la db 
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db("Projet-Trello");
        dbo.collection('users').findOne({ name: name }, function (err, user) {  //requete pour trouver le user par son name
            if (user) {  // si on trouve un user ET si le le mdp correcpond au hash en base
                    if (passwordHash.verify(password, user.password)) {
                        //res.send(user);
                        var privateKey = fs.readFileSync('private.key');
                        console.log(privateKey);
                        var token = jwt.sign(user, privateKey,{ expiresIn: '24h' }); //
                        var decoded = jwt.verify(token, privateKey);
                        var cookies = new Cookies(req, res)
                        var now = new Date()
                        cookies.set('token', token, {expires: now.setTime(now.getTime+(24*60*60*1000) )})  
                        console.log(decoded);
                        res.redirect('/my-projects'/*?token=' + token + "&id=" + user._id*/ )
                    }
                    
                    else {
                        console.log('1');
                        res.redirect('/sign-up');
                        //res.send(undefinded);
                        
                    }
                
            } else {
                console.log('2');
                res.redirect('/sign-up');
                //res.send(undefinded);
                
            }
        })
    });
    }
    
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

//affiche les taches d'un projet
app.get('/tasks/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        
        var to_do = [];
        var in_progress = [];
        var done = [];
        var tasksObj;
        //si des tache pour le projet existe alors les trie (todo, inprogress, done)
        // l'objet tasksObj contient l'ensemble des taches trié 
        if(project.tasksList != undefined){
            for(var i = 0; i < project.tasksList.length; i++){
                if(project.tasksList[i].status == "todo"){
                    to_do.push(project.tasksList[i]);  
                } else if(project.tasksList[i].status == "inprogress"){
                    in_progress.push(project.tasksList[i]);  
                } else {
                    done.push(project.tasksList[i]);  
                }          
            }
            tasksObj = {todo: to_do, inprogress: in_progress, done: done};
        }
        res.render("tasks.ejs",{project: project, sortedTasks: tasksObj});
    });
});


//formulaire pour modif/creer une tâche
//if et else car si nouveau projet titre modifiable
app.get('/task-detail/:name/:task', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        var taskObj;
        if(req.params.task == 'new'){
            console.log("new task !");
            res.render("taskDetail.ejs",{task: "new", project: project}); 
        } else {
            for(var i = 0; i < project.tasksList.length; i++){
                if(project.tasksList[i].nameT == req.params.task){
                    taskObj = project.tasksList[i];
                    console.log("task found !");
                }
            }
            res.render("taskDetail.ejs",{task: taskObj, project: project});
        }
    });
});

//sauvegarde de nouveau ou tache deja existante
app.post('/save_task/:name/:task', function(req,res){

    var desc = req.body.description;
    var status = req.body.status;
    var assignee = req.body.assignee;
    var tag1 = req.body.tag1;
    var tag2 = req.body.tag2;
    
    //si new alors le titre viens du formulaire sinon de l'url 
    if(req.params.task == 'new'){
        var title = req.body.title;
        var taskObj = {nameT: title, descT: desc, status: status, assignee: assignee,tags: [tag1,tag2]};
        request.insertNewtask(req.params.name, taskObj).then(
            res.redirect("/tasks/"+req.params.name)
            );
    } else {
        var taskObj = {nameT: req.params.task, descT: desc, status: status, assignee: assignee,tags: [tag1,tag2]};
        request.updateExistingTask(req.params.name, taskObj, req.params.task).then(
            res.redirect("/tasks/"+req.params.name)
        );
    }  
});

//userName utilisé pour savoir quels sont les messages que nous avons écrit
app.get('/conversation/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
        res.render("conversation.ejs",{project: project, userName: NAME});
        
    });
});

app.get('/Git-commit/:name', function(req, res) {
    request.getProject(req.params.name).then((project) => {
 
        var authorName;
        var authorEmail;
        var dateCommit;
        var commitMessage;
        
        var options = {
            uri: 'https://api.github.com/repos/marou95/ProjectNodeJS/commits',
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
        
        rp(options)
            .then(function (result) {
                //on récupère en variable les informations de l'objet JSON(url) que l'on voudra afficher
                 for(i=0; i<result.length; i++){
                    
                    authorName = result[i].commit.author.name;
                    authorEmail= result[i].commit.author.email;
                    dateCommit = result[i].commit.author.date;
                    commitMessage = result[i].commit.message;
    
                 }
                res.render("gitCommit.ejs",{project: project, 
                    result:result,
                    authorName: authorName,  
                    authorEmail:authorEmail,
                    dateCommit: dateCommit,
                    commitMessage: commitMessage });
        
            })
            .catch(function (err) {
                // API call failed...
                console.log(err)
                res.status(500).send();
            });
    
    });
});

//socket.io
io.on('connection', function(socket) {
    
    //important car le socket.on coté client appel joinGroup pour avoir des conversation de projet
    socket.emit('announcements', { message: 'A new user has joined!' });

    //quand on veut envoyer un message
    socket.on('newmsg', function(data) {
        console.log("c'est arrivé au serveur je renvoie");
        var messageObj = {author: NAME, message: data.message}
        request.insertNewMessage(data.group, messageObj)
        //emit au group (chaque groupe correspond à un projet)
        socket.to(data.group).emit('receivedmsg', messageObj);
        //emit => que à l'émetteur
        socket.emit('receivedmymsg', messageObj);
    });

    //ajoute le client dans le groupe projet
    socket.on('joinGroup',function(name){
        socket.join(name);
        console.log("added to " + name);
    });


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
server.listen (8080);