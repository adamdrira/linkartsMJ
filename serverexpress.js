const express = require('express');
const  session = require('express-session');
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
  process.env.NODE_ENV="production"
  app.use(session({secret:'zz',resave:true,saveUninitialized:true}))
  app.use(cookieParser());
  app.use(bodyParser.json())
  //Réglage des headers
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Origin", ["http://localhost:4200"]); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    //pour l'upload de contenus
    next();
  });
  //Peut-être que cette partie est un doublons des headers précedents
  const corsOptions = {
    origin: ['http://localhost:4200'],
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  console.log("lancement prod");
  app.use(express.static(path.join(__dirname, 'dist'))); //pour lancer angular en mode production
  app.use('/routes', routes); //le fichier routes.js va s'occuper de gérer les routes à partir d'ici 
  app.use('/python', python);
  app.use(fileUpload()); //pour télécharger des fichiers de pythons
  app.use(bodyParser.urlencoded({ extended: false }));
  require('./authentication/user.route.js')(app); //Database configuration, get users with model.
  app.get('*',(req,res)=>{
    var re = /(?:\.([^.]+))?$/;
    if( req.url.includes(".") && (re.exec(req.url)[1]=="js" || re.exec(req.url)[1]=="map" || re.exec(req.url)[1]=="css" || re.exec(req.url)[1]=="svg" || re.exec(req.url)[1]=="ico")){
      return res.sendFile(path.join(__dirname, 'dist/linkarts' + `${req.url}`))
    }
    else if(req.url.substring(0,7)=="/assets"){
      return res.sendFile(path.join(__dirname, 'dist/linkarts' + `${req.url}`))
    }
    else{
      return res.sendFile(path.join(__dirname, 'dist/linkarts/index.html'))
    }
   
  })









module.exports = app;