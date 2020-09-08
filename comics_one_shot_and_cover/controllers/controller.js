const multer = require('multer');
const fs = require('fs');
const usercontroller = require('../../authentication/user.controller');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";

//On récupère le numéro de la page uplaodé




module.exports = (router, Liste_bd_os, pages_bd_os,list_of_users) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
      console.log(user);
    });
    return user;
  };
  

  router.post('/setcookies_cover_bd_oneshot/:name', (req, res)=>{ 
    

    let value = req.params.name;
    res.send(value)
    //res.cookie('name_cover_bd_oneshot', value).send('cookie set' + value);
    });

  router.get('/clear_cookies_cover_bd_oneshot', function(req, res){
      res.clearCookie('name_cover_bd');
      res.send('cookie cover cleared');
  });
 

  router.get('/get_cookies_cover_bd', (req, res)=>{ 
    console.log('get it');
    let value = req.cookies;
    res.status(200).send([value]);
    }); 
      

  //var bd_id = 0; // il faut stocker cette valeur dans les cookiers et non ici !!!!!!

  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_bd_oneshot', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    /*for (let i = 0; i < Tags.length; i++){
      if (Tags[i] !=null){
        Tags[i] = Tags[i].substring(1);
        while(Tags[i].charAt(0) <='9' && Tags[i].charAt(0) >='0'){  
            Tags[i] = Tags[i].substr(1);
        }
        Tags[i] = Tags[i].substring(3,Tags[i].length - 1); 
      }
    }*/
    Liste_bd_os.create({
      "authorid": current_user,
      "title":title,
      "category": category,
      "highlight":highlight,
      "firsttag": Tags[0],
      "secondtag": Tags[1],
      "thirdtag": Tags[2],
      "pagesnumber": 0,
      "likesnumber": 0,
      "lovesnumber": 0,
      "viewnumber": 0,
      "commentarynumbers":0,
      "monetization":monetization,
    }).then(r =>  {
      res.status(200).send([r]);
      }); 
        
      
  
    });
    

     //on supprime le fichier de la base de donnée postgresql
     router.delete('/remove_bd_oneshot/:bd_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);

        const bd_id=req.params.bd_id
        Liste_bd_os.findOne({
          where: {
            authorid: current_user,
            bd_id: bd_id,
          }
        }).then(bd=>{
          list_of_users.findOne({
            where:{
              id:current_user,
            }
          }).then(user=>{
            if(bd.status=="public"){
              let number_of_comics=user.number_of_comics-1;
              user.update({
                "number_of_comics":number_of_comics,
              })
            }
            bd.destroy({
              truncate: false
            });
            res.json([bd]);
          })
        })
       
          
        
    });


   

  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_bd_oneshot', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    const bd_id = parseInt(req.body.bd_id);
    /*for (let i = 0; i < Tags.length; i++){
      if (Tags[i] !=null){
        Tags[i] = Tags[i].substring(1);
        while(Tags[i].charAt(0) <='9' && Tags[i].charAt(0) >='0'){  
            Tags[i] = Tags[i].substr(1);
        }
        Tags[i] = Tags[i].substring(3,Tags[i].length - 1); 
      }
    }*/

      if (Object.keys(req.body).length === 0 ) {
        console.log("information isn't uploaded correctly");
        return res.send({
          success: false
        });
        
      } else { 
        console.log('information uploaded correctly');
         bd = await Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .then(bd =>  {
            bd.update({
              "title":title,
              "category": category,
              "highlight":highlight,
              "firsttag": Tags[0],
              "secondtag": Tags[1],
              "thirdtag": Tags[2],
              "monetization":monetization,
            })
            .then(res.status(200).send([bd]))
          }); 
          }

    })();
    });

    router.post('/modify_bd_oneshot2', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
  
      (async () => {
      const highlight = req.body.highlight;
      const title = req.body.Title;
      const category = req.body.Category;
      const Tags = req.body.Tags;
      const bd_id = parseInt(req.body.bd_id);
      /*for (let i = 0; i < Tags.length; i++){
        if (Tags[i] !=null){
          Tags[i] = Tags[i].substring(1);
          while(Tags[i].charAt(0) <='9' && Tags[i].charAt(0) >='0'){  
              Tags[i] = Tags[i].substr(1);
          }
          Tags[i] = Tags[i].substring(3,Tags[i].length - 1); 
        }
      }*/
  
        if (Object.keys(req.body).length === 0 ) {
          console.log("information isn't uploaded correctly");
          return res.send({
            success: false
          });
          
        } else { 
          console.log('information uploaded correctly');
           bd = await Liste_bd_os.findOne({
              where: {
                bd_id: bd_id,
                authorid: current_user,
              }
            })
            .then(bd =>  {
              bd.update({
                "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
              })
              .then(res.status(200).send([bd]))
            }); 
            }
  
      })();
      });

    router.post('/change_oneshot_comic_status', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      let bd_id=req.body.bd_id;
      let status=req.body.status;
      (async () => {

          bd_os = await Liste_bd_os.findOne({
              where: {
                  authorid:current_user,
                  bd_id:bd_id,
              },
          })
          .then(bd_os => {
              bd_os.update({
                    "status":status
              }).then(bd_os => {
                  res.status(200).send(bd_os)
              }
              )
              
          }); 
      })();     
  });


    //on post l'image uploadée
    router.post('/upload_page_bd_oneshot/:page/:bd_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      var file_name ='';
      console.log("ici" + file_name);

      const PATH1= './data_and_routes/pages_bd_oneshot';

      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },

        filename: (req, file, cb) => {
          file_name = current_user+ '-' + req.params.bd_id + '-'+ req.params.page + path.extname(file.originalname);
          cb(null, current_user + '-' + req.params.bd_id + '-' + req.params.page+ path.extname(file.originalname));

        }
      });

      var upload = multer({
          storage: storage
      }).any();
      //upload.single('image')
      upload(req, res, function(err){
        (async () => {
        const page= req.params.page;
        const bd_id = req.params.bd_id;
        if (err) {
          console.log("erreur");
          return res.send({
            success: false
          });
      
        } else { 
         const bd = await Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          });
          if(bd !== null){
          }
          else {
            console.log("bd not found")
          }
          pages_bd_os.create({
            "bd_id": bd_id,
            "author_id": current_user,
            "file_name":file_name,
            "page_number": page
        })
        .then(r =>  {
        res.send(r.get({plain:true}));
        }); 
        }

      })();
      });
    });


      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_page_from_data/:page/:bd_id', function (req, res) {
        (async () => {
          const pagebd = await pages_bd_os.findOne({
            where: {
              page_number: req.params.page,
              bd_id: bd_id,
            }
          });
          if(pagebd !== null){
            res.json([pagebd]);
          }
          else {
            console.log("page not found")
          }

          console.log( 'suppression en cours');
          const page  = req.params.page;
          pages_bd_os.destroy({
            where: {page_number:page, bd_id: bd_id },
            truncate: false
          })
        })();
      });

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_page_from_folder/:name', function (req, res) {

        fs.access('./data_and_routes/pages_bd_oneshot' + req.params.name, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            return res.status(200)
          }
          console.log( 'annulation en cours');
          const name  = req.params.name;
          fs.unlink('./data_and_routes/pages_bd_oneshot/' + name,  function (err) {
            if (err) {
              console.log(err);
            }  
            else {
              console.log( 'fichier supprimé');
              return res.status(200).send('suppression done')
            }
          });
        });
      });


        //on ajoute la cover uploadée dans le dossier et on créer un cookie
    router.post('/upload_cover_bd_oneshot', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      var file_name='';
      const PATH2= './data_and_routes/covers_bd';
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
          res.cookie('name_cover_bd', file_name).send(file_name);
        });
      });

      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_bd_oneshot_todatabase', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    const name = req.body.name;
    const bd_id = parseInt(req.body.bd_id);

    (async () => {


      if (Object.keys(req.body).length === 0 ) {
        console.log("no inftly");
        return res.send({
          success: false
        });
        
      } else { 
        console.log('infctly');
         bd = await Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .then(bd =>  {
            bd.update({
              "name_coverpage" :name
            })
            .then(res.status(200).send([bd]))
          }); 
          }

    })();
    });

    router.post('/add_cover_bd_oneshot_todatabase2', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
  
      const name = req.body.name;
      const bd_id = parseInt(req.body.bd_id);
      const thumbnail_color=req.body.thumbnail_color;
  
      (async () => {
  
  
        if (Object.keys(req.body).length === 0 ) {
          console.log("no inftly");
          return res.send({
            success: false
          });
          
        } else { 
          console.log('infctly');
           bd = await Liste_bd_os.findOne({
              where: {
                bd_id: bd_id,
                authorid: current_user,
              }
            })
            .then(bd =>  {
              bd.update({
                "name_coverpage" :name,
                "thumbnail_color":thumbnail_color
              })
              .then(res.status(200).send([bd]))
            }); 
            }
  
      })();
      });


      //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
      router.delete('/remove_cover_bd_from_folder/:name', function (req, res) {
        fs.access('./data_and_routes/covers_bd' + req.params.name, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            return res.status(200)
          }
          console.log( 'annulation en cours');
          const name  = req.params.name;
          fs.unlink('./data_and_routes/covers_bd/' + name,  function (err) {
            if (err) {
              console.log(err);
            }  
            else {
              console.log( 'fichier supprimé');
              return res.status(200).send();
            }
          });
        });
      });


               //on valide l'upload
  router.post('/validation_upload_bd_oneshot', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
       const page_number=parseInt(req.body.page_number);
       const bd_id= req.body.bd_id;
         bd = await Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .then(bd =>  {
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).then(user=>{
              let number_of_comics=user.number_of_comics+1;
              user.update({
                "number_of_comics":number_of_comics,
              }).then(()=>{
                bd.update({
                  "status":"public",
                  "pagesnumber":page_number,
                })
                .then(res.status(200).send([bd]))
              })
            })
            
          }); 
    })();
    });


                   //on valide l'upload
  router.get('/retrieve_bd_by_user_id/:user_id', function (req, res) {

    (async () => {

       const user_id= parseInt(req.params.user_id);
         bd = await Liste_bd_os.findAll({
            where: {
              authorid: user_id,
              status:"public"
            },
            order: [
                ['bd_id', 'ASC']
              ],
          })
          .then(bd =>  {
            res.status(200).send([bd]);
          }); 
    })();
    });

    router.get('/retrieve_private_oneshot_bd', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      (async () => {
           bd = await Liste_bd_os.findAll({
              where: {
                authorid: current_user,
                status:"private"
              },
              order: [
                  ['createdAt', 'DESC']
                ],
            })
            .then(bd =>  {
              res.status(200).send([bd]);
            }); 
      })();
    });
 
    router.get('/retrieve_bd_by_id/:bd_id', function (req, res) {

      (async () => {
  
         const bd_id= parseInt(req.params.bd_id);
         console.log(bd_id);
         console.log(typeof(bd_id));
           bd = await Liste_bd_os.findOne({
              where: {
                bd_id: bd_id,
              }
            })
            .then(bd =>  {
              res.status(200).send([bd]);
            }); 
      })();
      });
      
    
  router.get('/retrieve_thumbnail_bd_picture/:file_name', function (req, res) {

    (async () => {

      const file_name = req.params.file_name;
      let filename = "./data_and_routes/covers_bd/" + file_name ;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        console.log("thumbnail bd picture retrieved");
        res.status(200).send(data);
      });
      })();
  });

  router.get('/retrieve_bd_oneshot_page/:bd_id/:bd_page', function (req, res) {

    (async () => {

      const bd_id = parseInt(req.params.bd_id);
      const bd_page = parseInt(req.params.bd_page);

      page = await pages_bd_os.findOne({
        where: {
          bd_id: bd_id,
          page_number:bd_page,
        }
      })
      .then(page =>  {
  
        let filename = "./data_and_routes/pages_bd_oneshot/" + page.file_name;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          //blob = data.toBlob('application/image');
          console.log("bd page retrieved");
          res.status(200).send(data);
        } );
      });
     
     })();
  });

 


}