var request= require("./requeteBDD");
var express=require("express");
var app=express();  
var bodyParser=require("body-parser");
var server = require('http').Server(app);
var io = require('socket.io')(server);

// EN DUR POUR VERIFIER LE FONCTIONNEMENT
var NAME = "letest";

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
        res.render("gitCommit.ejs",{project: project});
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