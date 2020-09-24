const multer = require('multer');
const fs = require('fs');
var path = require('path');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";



module.exports = (router, reports) => {



function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};

router.post('/add_primary_information_report', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser);



  const type_of_report = req.body.type_of_report;
  const id_receiver = req.body.id_receiver;
  const publication_category = req.body.publication_category;
  const publication_id = req.body.publication_id;
  const format = req.body.format;
  const chapter_number = req.body.chapter_number;
  const message = req.body.message;

  reports.create({
        "id_user": current_user,
        "type_of_report":type_of_report,
        "id_receiver":id_receiver,
        "publication_category": publication_category,
        "publication_id":publication_id,
        "format":format,
        "chapter_number": chapter_number,
        "message": message,

    })
    .then(r =>  {
      res.status(200).send([r])
    
    }); 

});




router.post('/check_if_content_reported', function (req, res) {
  console.log("check_if_content_reported")
  let current_user = get_current_user(req.cookies.currentUser);
  const publication_category = req.body.publication_category;
  const publication_id = req.body.publication_id;
  const format = req.body.format;
  const chapter_number = req.body.chapter_number;

  reports.findOne({
    where:{
      id_user:current_user,
      publication_category: publication_category,
      publication_id:publication_id,
      format:format,
      chapter_number: chapter_number,
    }
        
    })
    .then(r =>  {
      console.log("result")
      console.log(r)
      if(r){
        res.status(200).send([{nothing:"nothing"}])
      }
      else{
        console.log("send r")
        res.status(200).send([r])
      }
      
    
    }); 

});




router.post('/upload_attachments_reports', function (req, res) {
  var current_user = get_current_user(req.cookies.currentUser);
  var id_report = parseInt(req.headers.id_report);
  var attachment_number=parseInt(req.headers.attachment_number)+1;
  
  var file_name='';
  var name='';
  const PATH= './data_and_routes/reports_attachments';
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, PATH);
    },
  
    filename: (req, file, cb) => {
      name= file.originalname;
      name = name.substring(0,name.indexOf('.'));
      console.log(name);
      var today = new Date();
      var ms = String(today.getMilliseconds()).padStart(2, '0');
      var ss = String(today.getSeconds()).padStart(2, '0');
      var mi = String(today.getMinutes()).padStart(2, '0');
      var hh = String(today.getHours()).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); 
      var yyyy = today.getFullYear();
      let Today = yyyy + mm + dd + hh+ mi + ss + ms;
      file_name = current_user + '-' + Today + path.extname(file.originalname);
      cb(null, current_user + '-' + Today + path.extname(file.originalname));
      
    }
  });
  
  let upload_attachment = multer({
    storage: storage
  }).any();

  upload_attachment(req, res, function(err){

    
    reports.findOne({
      where: {
        id: id_report,
        id_user: current_user,
      }
    })
    .then(report =>  {
      if(attachment_number==1){
          report.update({
            "attachment_name_one" :file_name,
          })
          .then(report=>{
            res.status(200).send([report])
          })
      }

      if(attachment_number==2){
        report.update({
          "attachment_name_two" :file_name,
        })
        .then(report=>{
          res.status(200).send([report])
        })
      }

      if(attachment_number==3){
        report.update({
          "attachment_name_three" :file_name,
        })
        .then(report=>{
          res.status(200).send([report])
        })
      }

      if(attachment_number==4){
        report.update({
          "attachment_name_four" :file_name,
        })
        .then(report=>{
          res.status(200).send([ad])
        })
      }

      if(attachment_number==5){
        report.update({
          "attachment_name_five" :file_name,
        })
        .then(report=>{
          res.status(200).send([report])
        })
      }

    }); 

  
      
  });

});
  


}