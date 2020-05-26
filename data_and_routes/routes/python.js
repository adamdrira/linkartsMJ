const express = require('express');
const python_router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
var fileUpload = require('express-fileupload');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";


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


python_router.post('/python_recommendations', function(req, res) {

  const user_id = (JSON.stringify(req.headers.user_id)).substring(1,JSON.stringify(req.headers.user_id).length - 1);
  console.log(user_id);

  const PATH = `./data_and_routes/routes/python_files/recommendations-${user_id}.json`;
  //const json =require("./python_files/recommendations.json");
  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);

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
  const PATH = `./data_and_routes/routes/python_files/recommendations_artpieces-${user_id}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);


  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    console.log("json received");
    res.send(json);
  });
});





python_router.get('/sorted_category_list', function(req, res) {
    var user;
    jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

    var index_bd=-1;
    var index_writing=-1;
    var index_drawing=-1;
    const json =require(`./python_files/recommendations-${user}.json`);
    const test = JSON.parse(JSON.stringify(json));
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

    res.send([sorted_list_category]);
});


python_router.get('/sorted_favourite_type_list', function(req, res) {
  var user=0;
  jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });

  const json =require(`./python_files/recommendations-${user}.json`);
  const test = JSON.parse(JSON.stringify(json));

  res.send([test]);
});

python_router.post('/receive_bd_trendings', function(req, res) {

  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
  const PATH = `./data_and_routes/routes/python_files/bd_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);


  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    console.log("bd trendings received");
    res.status(200).send(json);
  });
});



python_router.get('/get_bd_trendings/:date', function(req, res) {

  let date = req.params.date;
  const json =require(`./python_files/bd_rankings_for_trendings-${date}.json`);
  let bd_trendings = JSON.parse(JSON.stringify(json));

    console.log("bd trendings sent");
    res.status(200).send([{"bd_trendings":bd_trendings}]);
});


python_router.post('/receive_drawings_trendings', function(req, res) {

  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
  const PATH = `./data_and_routes/routes/python_files/drawings_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);


  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    console.log("drawings trendings received");
    res.status(200).send(json);
  });
});

python_router.post('/receive_writings_trendings', function(req, res) {
  console.log('writiiiiiiiiiiiiiiiiiiiiiiiiiiings');
  let date =(JSON.stringify(req.headers.date)).substring(1,JSON.stringify(req.headers.date).length - 1);
  console.log(date);
  const PATH = `./data_and_routes/routes/python_files/writings_rankings_for_trendings-${date}.json`;

  if (!req.files){
    return res.status(400).send({some:'No files were uploaded.'});
  }
  

  let sampleFile = req.files.upload_file;
  let json = JSON.stringify(sampleFile);


  sampleFile.mv(PATH, function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
      
    }
    console.log("writings trendings received");
    res.status(200).send(json);
  });
});

module.exports = python_router;