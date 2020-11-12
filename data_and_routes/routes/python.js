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
   origin: ['http://localhost:4200', 'http://localhost:777'],
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

/*****************Partie recupération python files ********************/

/*
python_router.post('/python_recommendations', function(req, res) {

  const user_id = (JSON.stringify(req.headers.user_id)).substring(1,JSON.stringify(req.headers.user_id).length - 1);

  //const PATH = `./data_and_routes/routes/python_files/recommendations-${user_id}.json`;
  //const json =require("./python_files/recommendations.json");
  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);
  res.send(json);

  //Use the mv() method to place the file somewhere on your server 
  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    console.log("json received");
    res.send(json);
  });
});

python_router.post('/python_artpieces', function(req, res) {

  const user_id = (JSON.stringify(req.headers.user_id)).substring(1,JSON.stringify(req.headers.user_id).length - 1);

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);
  res.send(json);

});


*/


python_router.get('/sorted_category_list', function(req, res) {
  console.log("getting sorted type list")
    var user;
    jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

    var index_bd=-1;
    var index_writing=-1;
    var index_drawing=-1;
    let json = fs.readFileSync( __dirname + `/python_files/recommendations-${user}.json`);
    console.log(json)
    let test = JSON.parse(json);

    for (let step=0; step <Object.keys(test).length;step++){
      if(test.bd!= undefined){
        if (test.bd[step]!=null){
          index_bd=step
         };
      }
      if(test.drawing!=undefined){
        if (test.drawing[step]!=null){
          index_drawing=step
        };
      }
      
      if(test.writing!=undefined){
        if (test.writing[step]!=null){
          index_writing=step
        };
      }
     
      
    }
    var sorted_list_category = {
      "bd": index_bd,
      "writing": index_writing,
      "drawing": index_drawing,
    }

    let json2 = fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`);
    console.log("reading json 2 before sending cookies")
    res.cookie("rec_art_home",JSON.parse(json2)).send([sorted_list_category]);

    /*fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
      if(err){
        console.log('suppression already done');
        res.cookie("rec_art_home",JSON.parse(json2)).send([sorted_list_category]);
      }  
      else{
        fs.unlink(__dirname + `/python_files/recommendations_artpieces-${user}.json`,function (err) {
          if (err) {
            throw err;
          } 
          else{
            console.log("suppression de fichier artpieces done")
            res.cookie("rec_art_home",JSON.parse(json2)).send([sorted_list_category]);
          }
        }); 
      }
      
      
    }) */
    
});

python_router.delete('/delete_recommendations_artpieces', function(req, res) {
  console.log("delting recom artpieces file");
  var user;
    jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

  let json2 = fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`);
  console.log("reading json 2 before sending cookies")
  fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
    if(err){
      console.log('suppression already done');
      res.cookie("rec_art_home",JSON.parse(json2)).send([{}]);
    }  
    else{
      fs.unlink(__dirname + `/python_files/recommendations_artpieces-${user}.json`,function (err) {
        if (err) {
          throw err;
        } 
        else{
          console.log("suppression de fichier artpieces done")
          res.cookie("rec_art_home",JSON.parse(json2)).send([{}]);
        }
      }); 
    }
  }) 
});


python_router.get('/sorted_favourite_type_list', function(req, res) {
  console.log("sorted_category_list")
  var user=0;
  jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });

  let json = fs.readFileSync( __dirname + `/python_files/recommendations-${user}.json`);
  let test = JSON.parse(json);
  res.send([test]);
  /*fs.access(__dirname + `/python_files/recommendations-${user}.json`, fs.F_OK, (err) => {
    if(err){
      console.log('suppression already done');
      res.send([test]);
    }  
    else{
      fs.unlink(__dirname + `/python_files/recommendations-${user}.json`,function (err) {
        if (err) {
          throw err;
        } 
        else{
          res.send([test]);
        }
      });  
      
    }
    
  }) */

  
});

python_router.post('/receive_comics_trendings', function(req, res) {

  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
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
  }).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      console.log("creating comics trendings");
      trendings_seq.trendings_comics.create({
        "trendings":json,
        "date":date
      }).then(result=>{
          res.status(200).send(json);
      })
    }
  })
 

  

});



python_router.get('/get_comics_trendings', function(req, res) {
  

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

  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
  const PATH = `./data_and_routes/routes/python_files/drawings_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.parse(sampleFile.data);
  console.log("drawings trendings");
  console.log(json)
  trendings_seq.trendings_drawings.findOne({
    where:{
      date: date
    }
  }).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      console.log("creating drawings trendings");
      trendings_seq.trendings_drawings.create({
        "trendings":json,
        "date":date
      }).then(result=>{
          res.status(200).send(json);
      })
    }
  })

  
});

python_router.post('/receive_writings_trendings', function(req, res) {
  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
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
  }).then(resu=>{
    if(resu){
      res.status(200).send(resu.trendings);
    }
    else{
      console.log("creating writings trendings");
      trendings_seq.trendings_writings.create({
        "trendings":json,
        "date":date
      }).then(result=>{
          res.status(200).send(json);
      })
    }
  })

});

module.exports = python_router;