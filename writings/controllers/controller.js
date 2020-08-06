const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";



module.exports = (router, Liste_Writings,list_of_users) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };


  router.get('/get_cookies_writing', (req, res)=>{ 
    let value = req.cookies
    res.status(200).send([value]);
    }); 
      


  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_writing', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    
    const highlight = req.body.highlight;
    const title = req.body.Title;
    //const category = req.body.Category;
    const category = (req.body.Category === "Poésie") ? "Poetry": (req.body.Category === "Scénario") ? "Scenario" : (req.body.Category === "Roman illustré") ? "Illustrated novel" : req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    const writing_name = req.body.writing_name;
    for (let i = 0; i < Tags.length; i++){
      if (Tags[i] !=null){
        Tags[i] = Tags[i].substring(1);
        while(Tags[i].charAt(0) <='9' && Tags[i].charAt(0) >='0'){  
            Tags[i] = Tags[i].substr(1);
        }
        Tags[i] = Tags[i].substring(3,Tags[i].length - 1); 
        console.log(Tags[i]);
      }
    }

      if (Object.keys(req.body).length === 0 ) {
        console.log("information isn't uploaded correctly");
        return res.send({
          success: false
        });
        
      } else { 
        console.log('information uploaded correctly');
        Liste_Writings.create({
                "authorid": current_user,
                "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
                "file_name":writing_name,
                "viewnumber": 0,
                "likesnumber": 0,
                "lovesnumber": 0,
                "commentarynumbers": 0,
                "monetization":monetization,
            })
          
          .then(r =>  {
          res.status(200).send([r]);
          }); 
        
      }
  
    });
    

    //on supprime le fichier de la base de donnée postgresql
    router.delete('/remove_writing/:writing_id', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    const writing_id=parseInt(req.params.writing_id);
    Liste_Writings.findOne({
      where: {
        authorid: current_user,
        writing_id: writing_id,
      }
    }).then(writing=>{
      list_of_users.findOne({
        where:{
          id:current_user,
        }
      }).then(user=>{
        if(writing.status=="public"){
          let number_of_writings=user.number_of_writings-1;
          user.update({
            "number_of_writings":number_of_writings,
          })
        }
        writing.destroy({
          truncate: false
          })
          res.json([writing]);
      });
    })
      
  });

      

  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_writing', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    

    (async () => {
      const highlight = req.body.highlight;
      const title = req.body.Title;
      const category = req.body.Category;
      const Tags = req.body.Tags;
      const writing_id = req.body.writing_id;
      for (let i = 0; i < Tags.length; i++){
        if (Tags[i] !=null){
          Tags[i] = Tags[i].substring(1);
          while(Tags[i].charAt(0) <='9' && Tags[i].charAt(0) >='0'){  
              Tags[i] = Tags[i].substr(1);
          }
          Tags[i] = Tags[i].substring(3,Tags[i].length - 1); 
          console.log(Tags[i]);
        }
      }

      if (Object.keys(req.body).length === 0 ) {
        console.log("information isn't uploaded correctly");
        return res.send({
          success: false
        });
        
      } else { 
        console.log('information uploaded correctly');
         writing = await Liste_Writings.findOne({
            where: {
              writing_id: writing_id,
              authorid: current_user,
            }
          })
          .then(writing =>  {
            writing.update({
              "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
            })
            .then(res.status(200).send([writing]))
          }); 
          }

    })();
    });

      
    router.post('/upload_cover_writing', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      var file_name='';
      const PATH2= './data_and_routes/covers_writings';
      let storage2 = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH2);
        },
      
        filename: (req, file, cb) => {
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
          //enlever nickname
        }
      });
      
      let upload_cover = multer({
        storage: storage2
      }).any();

      upload_cover(req, res, function(err){
          res.cookie('name_cover_writing', file_name).send(file_name);
        });
    });

        //on ajoute la cover uploadée dans le dossier et on créer un cookie
    router.post('/upload_writing', function (req, res) {
      console.log(req.headers.type);
      console.log("pistache");
      let current_user = get_current_user(req.cookies.currentUser);
      var file_name='';
      const PATH1= './data_and_routes/writings';
      

      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },

        filename: (req, file, cb) => {
          console.log(file);
          var today = new Date();
          var ss = String(today.getSeconds()).padStart(2, '0');
          var mi = String(today.getMinutes()).padStart(2, '0');
          var hh = String(today.getHours()).padStart(2, '0');
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); 
          var yyyy = today.getFullYear();
          let Today = yyyy + mm + dd + hh+ mi + ss;
          file_name = current_user + '-' + Today + path.extname(file.originalname);
          cb(null, current_user + '-' + Today + path.extname(file.originalname));
          //enlever nickname
        }
      });

      let upload = multer({
        storage: storage
      }).any();

      upload(req, res, function(err) {
        if (err) {
          console.log("erreur");
          return res.send({
            success: false
          });
      
        } else { 
            res.cookie('name_writing', file_name).send(file_name);
        }
      })
    });


    router.post('/add_cover_writing_todatabase', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
  
      const name = req.body.name;
      const writing_id = req.body.writing_id;
  
      (async () => {
  
           writing = await Liste_Writings.findOne({
              where: {
                writing_id: writing_id,
                authorid: current_user,
              }
            })
            .then(writing =>  {
              writing.update({
                "name_coverpage" :name
              })
              .then(res.status(200).send([writing]))
            }); 
            
      })();
      });
  

    router.post('/change_writing_status', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      let writing_id=req.body.writing_id;
      let status=req.body.status;
      (async () => {

        writings = await Liste_Writings.findOne({
              where: {
                  authorid:current_user,
                  writing_id:writing_id,
              },
          })
          .then(writings => {
            writings.update({
                    "status":status
              }).then(writings => {
                  res.status(200).send([writings])
              }
              )
              
          }); 
      })();     
  });

  router.get('/retrieve_private_writings', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    (async () => {
         writings = await Liste_Writings.findAll({
            where: {
              authorid: current_user,
              status:"private"
            },
            order: [
                ['createdAt', 'DESC']
              ],
          })
          .then(writings =>  {
            res.status(200).send([writings]);
          }); 
    })();
  });
 

  //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
  router.delete('/remove_writing_from_folder/:name_writing', function (req, res) {
    console.log( 'tentative annulation');
    fs.access('./data_and_routes/writings/' + req.params.name_writing, fs.F_OK, (err) => {
      if(err){
        console.log('suppression already done');
        return res.status(200)
      }
        console.log( 'annulation en cours');
        const name_writing  = req.params.name_writing;
        fs.unlink('./data_and_routes/writings/' + name_writing,  function (err) {
          if (err) {
            throw err;
          }  
          else {
            console.log( 'fichier supprimé');
            return res.status(200)
          }
        });
      });
  });

                     //on valide l'upload
  router.post('/validation_upload_writing', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
       const writing_id= req.body.writing_id;
         writing = await Liste_Writings.findOne({
            where: {
              writing_id: writing_id,
              authorid: current_user,
            }
          })
          .then(writing =>  {
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).then(user=>{
              let number_of_writings=user.number_of_writings+1;
              user.update({
                "number_of_writings":number_of_writings,
              })
            });
            writing.update({
              "status":"public",
            })
            .then(res.status(200).send([writing]))
          }); 
    })();
    });

                     //récupère toutes les bd selon l'auteur
  router.get('/retrieve_writings_information_by_user_id/:user_id', function (req, res) {

    (async () => {

       const user_id= parseInt(req.params.user_id);
         writings = await Liste_Writings.findAll({
            where: {
              authorid: user_id,
              status:"public"
            },
            order: [
                ['writing_id', 'ASC']
              ],
          })
          .then(writings =>  {
            res.status(200).send([writings]);
          }); 
    })();
    });
 
    router.get('/retrieve_writing_information_by_id/:writing_id', function (req, res) {

      (async () => {
  
         const writing_id= parseInt(req.params.writing_id);
           writing = await Liste_Writings.findOne({
              where: {
                writing_id: writing_id,
              }
            })
            .then(writing =>  {
              res.status(200).send([writing]);
            }); 
      })();
      });

  
    

  router.get('/retrieve_writing_by_name/:file_name', function (req, res) {

        let filename = "./data_and_routes/writings/" + req.params.file_name;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          console.log("bd page retrieved");
          res.status(200).send(data);
        } );

  });

  router.get('/retrieve_thumbnail_writing_picture/:file_name', function (req, res) {

    (async () => {

      
      const file_name = req.params.file_name;
      let filename = "./data_and_routes/covers_writings/" + file_name ;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        console.log("thumbnail writing picture retrieved");
        res.status(200).send(data);
      });
      })();
  });

  

   //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
   router.delete('/remove_last_cover_from_folder/:file_name', function (req, res) {
    
    (async () => {
    const name_coverpage=req.params.file_name;

    console.log( 'tentative annulation');
    fs.access('./data_and_routes/covers_writings/' + name_coverpage, fs.F_OK, (err) => {
      if(err){
        console.log('suppression already done');
        return res.status(200)
      }
        console.log( 'annulation en cours');
        fs.unlink('./data_and_routes/covers_writings/' + name_coverpage,  function (err) {
          if (err) {
            throw err;
          }  
          else {
            console.log( 'fichier supprimé');
            return res.status(200).send({"ok":"ok"})
          }
        });
      });
    })();
  });
 
      
 

}