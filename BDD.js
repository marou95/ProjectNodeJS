var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Projet-Trello";

//plusieurs MongoClient.connect car on ne peut pas insérer plusieurs collections en même temps (typology destroyed)

//Création de la collection "projects" et création de la base car première collection crée
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
	// Créer une database (quand on se connecte à xxxx /test on créer test
	if (err) throw err;
	console.log("Database \"Projet-Trello\" created!");
	var dbo = db.db("Projet-Trello");
	if (err) throw err;
    //Création de la collection projects
    //*
    dbo.createCollection("projects",   function(err, res) {
    	if (err) throw err;
        console.log("Collection \"projects\" created!");
        db.close();
    	//NOTE: db.close toujours dans l'action car asynchrone
  	});
    //*/
});


// Création collection "users" et ajout d'un user de test
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
	var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //création d'un user test
    var myuser = { name: "jean", password: "test", email: "jean@test.fr"};
    //Création de la collection users
    //*
    dbo.createCollection("users",   function(err, res) {
    	if (err) throw err;
        console.log("Collection \"users\" created!");
        //insertion du user
        dbo.collection("users").insertOne(myuser, function(err, res) {
            if (err) throw err;
            console.log("1 user inserted");
        });
        db.close();
    	//NOTE: db.close toujours dans l'action car asynchrone
  	});
    //*/
});


//créer la collection du contenu d'un projet et insert le nom dans "projects" (liste des projets)
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //correspond au nom du projet crée
    var myproject = { name: "projet1"};
    //*
    dbo.createCollection(myproject.name,   function(err, res) {
        if (err) throw err;
        console.log("Collection \""+ myproject +"\" created!"); 
       
        dbo.collection("projects").insertOne(myproject, function(err, res) {
            if (err) throw err;
            console.log("1 project inserted");
            console.log(myproject);
        });
        db.close();
    });
    //*/
});
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //correspond au nom du projet crée
    var myproject = { name: "projet2"};
    //*
    dbo.createCollection(myproject.name,   function(err, res) {
        if (err) throw err;
        console.log("Collection \""+ myproject +"\" created!"); 
       
        dbo.collection("projects").insertOne(myproject, function(err, res) {
            if (err) throw err;
            console.log("1 project inserted");
            console.log(myproject);
        });
        db.close();
    });
    //*/
});
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //correspond au nom du projet crée
    var myproject = { name: "projet3"};
    //*
    dbo.createCollection(myproject.name,   function(err, res) {
        if (err) throw err;
        console.log("Collection \""+ myproject +"\" created!"); 
       
        dbo.collection("projects").insertOne(myproject, function(err, res) {
            if (err) throw err;
            console.log("1 project inserted");
            console.log(myproject);
        });
        db.close();
    });
    //*/
});
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //correspond au nom du projet crée
    var myproject = { name: "projet4"};
    //*
    dbo.createCollection(myproject.name,   function(err, res) {
        if (err) throw err;
        console.log("Collection \""+ myproject +"\" created!"); 
       
        dbo.collection("projects").insertOne(myproject, function(err, res) {
            if (err) throw err;
            console.log("1 project inserted");
            console.log(myproject);
        });
        db.close();
    });
    //*/
});
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Projet-Trello");
    if (err) throw err;
    //correspond au nom du projet crée
    var myproject = { name: "projet5"};
    //*
    dbo.createCollection(myproject.name,   function(err, res) {
        if (err) throw err;
        console.log("Collection \""+ myproject +"\" created!"); 
       
        dbo.collection("projects").insertOne(myproject, function(err, res) {
            if (err) throw err;
            console.log("1 project inserted");
            console.log(myproject);
        });
        db.close();
    });
    //*/
});


