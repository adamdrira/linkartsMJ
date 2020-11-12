const multer = require('multer');
const fs = require('fs');
var path = require('path');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";



module.exports = (router, 
  reports,
  Liste_Bd_Serie, 
  Chapters_Bd_Serie,
  list_comics_one_shot,
  Liste_Drawings_Artbook,
  Drawings_one_page,
  Liste_Writings,
  List_of_contents, 
  List_of_ads
  ) => {



function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};

router.post('/add_primary_information_report', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser);
  console.log("add_primary_information_report")


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
      if(publication_category=="comic"){
        if(format=="one-shot"){
          list_comics_one_shot.findOne({
            where:{
              bd_id:publication_id,
              status:"public",
            }
          }).then(bd=>{
            if(bd){
              let list_of_reporters=bd.list_of_reporters;
              if(!list_of_reporters ){
                list_of_reporters=[current_user]
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else if(list_of_reporters.indexOf(current_user)<0){
                list_of_reporters.push(current_user);
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          })
        }
        else{
          Liste_Bd_Serie.findOne({
            where:{
              bd_id:publication_id,
              status:"public",
            }
          }).then(bd=>{
            if(bd){
              let list_of_reporters=bd.list_of_reporters;
              if(!list_of_reporters ){
                list_of_reporters=[current_user];
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else if(list_of_reporters.indexOf(current_user)<0){
                list_of_reporters.push(current_user);
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          })
          
        }
      }
      else if(publication_category=="drawing"){
        if(format=="one-shot"){
          Drawings_one_page.findOne({
            where:{
              drawing_id:publication_id,
              status:"public",
            }
          }).then(bd=>{
            if(bd){
              let list_of_reporters=bd.list_of_reporters;
              if(!list_of_reporters ){
                list_of_reporters=[current_user];
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else if(list_of_reporters.indexOf(current_user)<0){
                list_of_reporters.push(current_user);
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          })
        }
        else{
          Liste_Drawings_Artbook.findOne({
            where:{
              drawing_id:publication_id,
              status:"public",
            }
          }).then(bd=>{
            if(bd){
              let list_of_reporters=bd.list_of_reporters;
              if(!list_of_reporters ){
                list_of_reporters=[current_user];
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else if(list_of_reporters.indexOf(current_user)<0){
                list_of_reporters.push(current_user);
                bd.update({
                  "list_of_reporters":list_of_reporters
                })
                report_content_and_create(bd)
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          })
          
        }
      }
      else if(publication_category=="writing"){
        Liste_Writings.findOne({
          where:{
            writing_id:publication_id
          }
        }).then(bd=>{
          if(bd){
            let list_of_reporters=bd.list_of_reporters;
            if(!list_of_reporters ){
              list_of_reporters=[current_user];
              bd.update({
                "list_of_reporters":list_of_reporters
              })
              report_content_and_create(bd)
            }
            else if(list_of_reporters.indexOf(current_user)<0){
              list_of_reporters.push(current_user);
              bd.update({
                "list_of_reporters":list_of_reporters
              })
              report_content_and_create(bd)
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          }
          else{
            res.status(200).send([{error:"not_found"}])
          }
        })
      }
      else if(publication_category=="ad"){
        List_of_ads.findOne({
          where:{
            id:publication_id
          }
        }).then(bd=>{
          if(bd){
            let list_of_reporters=bd.list_of_reporters;
            if(!list_of_reporters ){
              list_of_reporters=[current_user];
              bd.update({
                "list_of_reporters":list_of_reporters
              })
              report_content_and_create(bd)
            }
            else if(list_of_reporters.indexOf(current_user)<0){
              list_of_reporters.push(current_user);
              bd.update({
                "list_of_reporters":list_of_reporters
              })
              report_content_and_create(bd)
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          }
          else{
            res.status(200).send([{error:"not_found"}])
          }
        })
      }
     
    
    }); 


    function report_content_and_create(bd){
      console.log("report_content_and_create")
      List_of_contents.findOne({
        where:{
          publication_category: publication_category,
          publication_id:publication_id,
          format:format,
          status:"ok",
        }
        
      }).then(content=>{
        if(content){
          let list_of_reporters=content.list_of_reporters;
          console.log(list_of_reporters)
          if(!list_of_reporters ){
            list_of_reporters=[current_user];
            content.update({
              "list_of_reporters":list_of_reporters
            })
            res.status(200).send([bd])
          }
          else if(list_of_reporters.indexOf(current_user)<0){
            list_of_reporters.push(current_user);
            content.update({
              "list_of_reporters":list_of_reporters
            })
            res.status(200).send([bd])
          }
          else{
            res.status(200).send([{error:"not_found"}])
          }
        }
        else{
          res.status(200).send([{error:"not_found"}])
        }
      })
    }
});




router.post('/check_if_content_reported', function (req, res) {
  console.log("check_if_content_reported")
  let current_user = get_current_user(req.cookies.currentUser);
  const publication_category = req.body.publication_category;
  const publication_id = req.body.publication_id;
  const format = req.body.format;
  const chapter_number = req.body.chapter_number;

  if(!(format=="serie" && chapter_number==0)){
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
          res.status(200).send([{error:"nothing_found"}])
        }
        
      
      }); 
  }
  else{
    reports.findOne({
      where:{
        id_user:current_user,
        publication_category: publication_category,
        publication_id:publication_id,
        format:format,
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
  }
 

});


router.post('/cancel_report', function (req, res) {
  console.log("cancel_report")
  let current_user = get_current_user(req.cookies.currentUser);
  const publication_category = req.body.publication_category;
  const publication_id = req.body.publication_id;
  const format = req.body.format;

    reports.findOne({
      where:{
        id_user:current_user,
        publication_category: publication_category,
        publication_id:publication_id,
        format:format,
      }
          
      })
      .then(report =>  {
        if(report){
          report.destroy({
            truncate:false,
          })
          if(publication_category=="comic"){
            if(format=="one-shot"){
              list_comics_one_shot.findOne({
                where:{
                  bd_id:publication_id,
                  status:"public",
                }
              }).then(bd=>{
                if(bd){
                  let list_of_reporters=bd.list_of_reporters;
                  if(list_of_reporters &&  list_of_reporters.indexOf(current_user)>=0){
                    let i=list_of_reporters.indexOf(current_user)
                    list_of_reporters.splice(i,1);
                    bd.update({
                      "list_of_reporters":list_of_reporters
                    })
                    delete_and_send(bd)
                  }
                  else{
                    res.status(200).send([{error:"not_found"}])
                  }
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              })
            }
            else{
              Liste_Bd_Serie.findOne({
                where:{
                  bd_id:publication_id,
                  status:"public",
                }
              }).then(bd=>{
                if(bd){
                  let list_of_reporters=bd.list_of_reporters;
                  if(list_of_reporters &&  list_of_reporters.indexOf(current_user)>=0){
                    let i=list_of_reporters.indexOf(current_user)
                    list_of_reporters.splice(i,1);
                    bd.update({
                      "list_of_reporters":list_of_reporters
                    })
                    delete_and_send(bd)
                  }
                  else{
                    res.status(200).send([{error:"not_found"}])
                  }
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              })
              
            }
          }
          else if(publication_category=="drawing"){
            if(format=="one-shot"){
              Drawings_one_page.findOne({
                where:{
                  drawing_id:publication_id,
                  status:"public",
                }
              }).then(bd=>{
                if(bd){
                  let list_of_reporters=bd.list_of_reporters;
                  if( list_of_reporters &&  list_of_reporters.indexOf(current_user)>=0){
                    let i=list_of_reporters.indexOf(current_user)
                    list_of_reporters.splice(i,1);
                    bd.update({
                      "list_of_reporters":list_of_reporters
                    })
                    delete_and_send(bd)
                  }
                  else{
                    res.status(200).send([{error:"not_found"}])
                  }
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              })
            }
            else{
              Liste_Drawings_Artbook.findOne({
                where:{
                  drawing_id:publication_id,
                  status:"public",
                }
              }).then(bd=>{
                if(bd){
                  let list_of_reporters=bd.list_of_reporters;
                  if( list_of_reporters && list_of_reporters.indexOf(current_user)>=0){
                    let i=list_of_reporters.indexOf(current_user)
                    list_of_reporters.splice(i,1);
                    bd.update({
                      "list_of_reporters":list_of_reporters
                    })
                    delete_and_send(bd)
                  }
                  else{
                    res.status(200).send([{error:"not_found"}])
                  }
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              })
              
            }
          }
          else if(publication_category=="writing"){
            Liste_Writings.findOne({
              where:{
                writing_id:publication_id,
                status:"public",
              }
            }).then(bd=>{
              if(bd){
                let list_of_reporters=bd.list_of_reporters;
                if( list_of_reporters && list_of_reporters.indexOf(current_user)>=0){
                  let i=list_of_reporters.indexOf(current_user)
                  list_of_reporters.splice(i,1);
                  bd.update({
                    "list_of_reporters":list_of_reporters
                  })
                  delete_and_send(bd)
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            })
          }
          else if(publication_category=="ad"){
            List_of_ads.findOne({
              where:{
                id:publication_id,
                status:"public",
              }
            }).then(bd=>{
              if(bd){
                let list_of_reporters=bd.list_of_reporters;
                if( list_of_reporters && list_of_reporters.indexOf(current_user)>=0){
                  let i=list_of_reporters.indexOf(current_user)
                  list_of_reporters.splice(i,1);
                  bd.update({
                    "list_of_reporters":list_of_reporters
                  })
                  delete_and_send(bd)
                }
                else{
                  res.status(200).send([{error:"not_found"}])
                }
              }
              else{
                res.status(200).send([{error:"not_found"}])
              }
            })
          }
         
        }
        else{
          console.log("send r")
          res.status(200).send([{error:"nothing_found"}])
        }
        
      
      }); 
  
 
    
      function delete_and_send(bd){
        List_of_contents.findOne({
          where:{
            publication_category: publication_category,
            publication_id:publication_id,
            format:format,
            status:"ok",
          }
         
        }).then(content=>{
          if(content){
            let list_of_reporters=content.list_of_reporters;
           if(list_of_reporters && list_of_reporters.indexOf(current_user)>=0){
              let i=list_of_reporters.indexOf(current_user)
              list_of_reporters.splice(i,1);
              content.update({
                "list_of_reporters":list_of_reporters
              })
              res.status(200).send([bd])
            }
            else{
              res.status(200).send([{error:"not_found"}])
            }
          }
          else{
            res.status(200).send([{error:"not_found"}])
          }
        })
      }
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