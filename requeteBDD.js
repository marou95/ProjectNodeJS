var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Projet-Trello";
let DATABASE = "Projet-Trello";
let PROJECT_COL = "projects";
let USER_COL = "users";



async function insertNewProject(data){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout d'un projet (data) en base
            dbo.collection(PROJECT_COL).insertOne(data,function(err, collection){ 
                if (err) throw err; 
                console.log(data.name + " is inserted Successfully"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.insertNewProject = insertNewProject;

async function defineNewMemberList(projectName, newMemberList){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // défini la personLlist du projet ayant pour nom projectName
            dbo.collection(PROJECT_COL).updateOne({ name: projectName }, {$set: {personList: newMemberList}},function(err, collection){ 
                if (err) throw err; 
                console.log("personList updated!"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.defineNewMemberList = defineNewMemberList;

async function getAllProject(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) 
                throw err;
            var dbo = db.db(DATABASE);
            if (err)
                throw err;
            //récupère tout les projets et les tries par ordre alphabétique
            dbo.collection(PROJECT_COL).find({}).sort({ name: 1 }).toArray(function (err, result) {
                if (err)
                    throw err;
                console.log("result = " + result);
                db.close();
                if(result != undefined){
                    resolve(result);
                } else {
                    reject("Error");
                }
            });
        });	
    });
}
exports.getAllProject = getAllProject;

async function getProject(name){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout du user (obj data) en base
            dbo.collection(PROJECT_COL).findOne({name: name}, function(err, projet){ 
                if (err) throw err; 
                console.log( name + " found !"); 
                console.log(projet);
                db.close();
                if (projet != undefined){
                    resolve(projet);
                } else {
                    reject ("Error");
                }
            });
        });
    });
}
exports.getProject = getProject;

//Non testé
async function deleteProject(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout du user (obj data) en base
            dbo.collection(PROJECT_COL).deleteOne({name: data.name},function(err, collection){ 
                if (err) throw err; 
                console.log(data.name + " is deleted Successfully"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.deleteProject = deleteProject;

async function insertNewMessage(projectName, message){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout d'un projet (data) en base
            dbo.collection(PROJECT_COL).updateOne({ name: projectName }, {$push: {msgList: message}},function(err, collection){ 
                if (err) throw err; 
                console.log("msgList updated!"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.insertNewMessage = insertNewMessage;

// non testé
async function insertNewUser(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout du user (obj data) en base
            dbo.collection(USER_COL).insertOne(data,function(err, collection){ 
                if (err) throw err; 
                console.log(data.getName() + " is inserted Successfully"); 
                db.close();
                resolve("Success");
            });
        });
    });
}

async function insertNewtask(projectName, task){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout de task (obj task) en base
            dbo.collection(PROJECT_COL).updateOne({ name: projectName }, {$push: {tasksList: task}},function(err, collection){ 
                if (err) throw err; 
                console.log("inserted new task to tasksList!"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.insertNewtask = insertNewtask;

async function updateExistingTask(projectName, task, taskName){
    console.log("/////" + task.nameT);
    console.log("/////" + task.descT);
    console.log("/////" + task.status);
    console.log("/////" + task.assignee);
    console.log("/////" + task.tags[0]);
    console.log("/////" + task.tags[1]);
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) { 
            if (err) throw err;
            var dbo = db.db(DATABASE);
            if (err) throw err;
            // Ajout de task (obj task) en base
            dbo.collection(PROJECT_COL).updateOne({ name: projectName, "tasksList.nameT": taskName}, {$set: {"tasksList.$": task}},function(err, collection){ 
                if (err) throw err; 
                console.log("task in tasksList updated!"); 
                db.close();
                resolve("Success");
            });
        });
    });
}
exports.updateExistingTask = updateExistingTask;
