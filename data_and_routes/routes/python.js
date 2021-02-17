const express = require('express');
const python_router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
var fileUpload = require('express-fileupload');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const trendings_seq= require('../../p_trendings/model/sequelize');
const Sequelize = require('sequelize');


//middleware
python_router.use(cookieParser());

// Cors
const corsOptions = {
   origin: ['http://localhost:4200'],
   optionsSuccessStatus: 200
 };
 python_router.use(cors(corsOptions));

//GET USERS
python_router.use(bodyParser.json())
python_router.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
python_router.use(fileUpload()); 
//python_router.use(fileUpload()); //pour télécharger des fichiers de pythons
//python_router.use(bodyParser.urlencoded({ extended: false }));

python_router.get('/', (request, response) => {
  response.json({ info: 'python files' })
})


function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};



python_router.get('/sorted_favourite_type_list', function(req, res) {
  //console.log("sorted_category_list")
  console.log("checking current: " + req.headers['authorization'] );
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
        }
        else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
                return res.status(401).json({msg: "error"});
            }
        }
  var user=0;
  jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });

  let json = fs.readFileSync( __dirname + `/python_files/recommendations-${user}.json`);
  let test = JSON.parse(json);
  res.send([test]);


  
});

python_router.post('/receive_comics_trendings', function(req, res) {

  console.log("checking current: " + req.headers['authorization'] );
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
        }
        else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
                return res.status(401).json({msg: "error"});
            }
        }
  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  //console.log(date);
  const PATH = `./data_and_routes/routes/python_files/bd_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.parse(sampleFile.data);
  trendings_seq.trendings_comics.findOne({
    where:{
      date: date
    }
  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      //console.log("creating comics trendings");
      trendings_seq.trendings_comics.create({
        "trendings":json,
        "date":date
      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
          res.status(200).send(json);
      })
    }
  })
 

  

});



python_router.get('/get_comics_trendings', function(req, res) {
  
  console.log("checking current: " + req.headers['authorization'] );
  if( ! req.headers['authorization'] ) {
      return res.status(401).json({msg: "error"});
  }
  else {
      let val=req.headers['authorization'].replace(/^Bearer\s/, '')
      let user= get_current_user(val)
      if(!user){
          return res.status(401).json({msg: "error"});
      }
  }
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); 
  let yyyy= today.getFullYear();
  let date = yyyy.toString() + '-' +  mm + '-' + dd;

  let json = fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`);
  let comics_trendings = JSON.parse(json);
  res.status(200).send([{"comics_trendings":comics_trendings}]);
    

    
});


python_router.post('/receive_drawings_trendings', function(req, res) {

  console.log("checking current: " + req.headers['authorization'] );
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
        }
        else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
                return res.status(401).json({msg: "error"});
            }
        }
  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  //console.log(date);
  const PATH = `./data_and_routes/routes/python_files/drawings_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.parse(sampleFile.data);
  //console.log("drawings trendings");
  //console.log(json)
  trendings_seq.trendings_drawings.findOne({
    where:{
      date: date
    }
  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      //console.log("creating drawings trendings");
      trendings_seq.trendings_drawings.create({
        "trendings":json,
        "date":date
      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
          res.status(200).send(json);
      })
    }
  })

  
});

python_router.post('/receive_writings_trendings', function(req, res) {
  console.log("checking current: " + req.headers['authorization'] );
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
        }
        else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
                return res.status(401).json({msg: "error"});
            }
        }
  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  //console.log(date);
  const PATH = `./data_and_routes/routes/python_files/writings_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.parse(sampleFile.data);
  trendings_seq.trendings_writings.findOne({
    where:{
      date: date
    }
  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      //console.log("creating writings trendings");
      trendings_seq.trendings_writings.create({
        "trendings":json,
        "date":date
      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
          res.status(200).send(json);
      })
    }
  })

});

module.exports = python_router;