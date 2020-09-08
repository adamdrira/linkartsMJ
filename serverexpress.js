const express = require('express');
var http = require('http');
const path = require('path');
const app = express();
const cors = require('cors');
var bodyParser = require('body-parser');
const multer = require('multer'); // pour upload d'images
const cookieParser = require('cookie-parser'); 
const routes = require('./data_and_routes/routes/routes'); //récupération des routes qui sont entretenus après "/routes"
var fileUpload = require('express-fileupload');
const python = require('./data_and_routes/routes/python');
global.appRoot = __dirname;  //pour testdb




//Middleware
  app.use(cookieParser());
  app.use(bodyParser.json())
  //Réglage des headers
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200", "http://localhost:777"); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    //pour l'upload de contenus
    next();
  });
  app.use(express.static(path.join(__dirname, 'dist'))); //préciser que les ficheirs de dist sont statics
  app.use('/routes', routes); //le fichier routes.js va s'occuper de gérer les routes à partir d'ici 
  app.use('/python', python);
  app.use(fileUpload()); //pour télécharger des fichiers de pythons
  app.use(bodyParser.urlencoded({ extended: false }));

//Peut-être que cette partie est un doublons des headers précedents
const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:777'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

//const db = require('./authentication/db.config.js');
require('./authentication/user.route.js')(app); //Database configuration, get users with model.



/*récupère tous les autres routes et les retourne dans index.html
app.get('*', (req,res)=> {
    res.sendFile(path.join(__dirname, 'dist/linkarts/index.html'))
});*/

/*****************Partie recupération python files ********************/
/*const PATH = './data/routes/python_files/classement_tendances_bd_oneshot.json';

app.post('/python', function(req, res) {
  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.upload_file;
  console.log(sampleFile);

  //Use the mv() method to place the file somewhere on your server 
  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    res.send('File uploaded!');
  });
});*/


module.exports = app;