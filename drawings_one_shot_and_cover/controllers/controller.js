const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, drawings_one_page) => {
  
  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  

  router.get('/get_cookies_cover_drawings', (req, res)=>{ 
    console.log('get it')
    let value = req.cookies
    res.status(200).send([value]);
    }); 
      

  //var bd_id = 0; // il faut stocker cette valeur dans les cookiers et non ici !!!!!!

  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_drawing_one_page', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
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
        drawings_one_page.create({
                "authorid": current_user,
                "title":title,
                "highlight":highlight,
                "category": category,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
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

    
    router.post('/change_oneshot_drawing_status', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      let drawing_id=req.body.drawing_id;
      let status=req.body.status;
      (async () => {

          drawing = await drawings_one_page.findOne({
              where: {
                  authorid:current_user,
                  drawing_id:drawing_id,
              },
          })
          .then(drawing => {
            drawing.update({
                    "status":status
              }).then(drawing => {
                  res.status(200).send(drawing)
              }
              )
              
          }); 
      })();     
  });

  router.get('/retrieve_private_oneshot_drawings', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    (async () => {
         drawings = await drawings_one_page.findAll({
            where: {
              authorid: current_user,
              status:"private"
            },
            order: [
                ['createdAt', 'DESC']
              ],
          })
          .then(drawings =>  {
            res.status(200).send([drawings]);
          }); 
    })();
  });

    
  router.post('/update_filter_color_drawing_onepage', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    let color = req.body.color;
    let drawing_id = req.body.drawing_id;

    (async () => {
        drawing = await drawings_one_page.findOne({
          where: {
            drawing_id: drawing_id,
            authorid:current_user,
          }
        })
        .then(drawing =>  {
          drawing.update({
            "thumbnail_color": color
          })
          .then(res.status(200).send([drawing]))
        }); 
    })();
    });

    


  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_drawing_one_page', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    const drawing_id = parseInt(req.body.drawing_id);
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
         drawing = await drawings_one_page.findOne({
            where: {
              drawing_id: drawing_id,
              authorid:current_user,
            }
          })
          .then(drawing =>  {
            drawing.update({
              "title":title,
              "category": category,
              "highlight":highlight,
              "firsttag": Tags[0],
              "secondtag": Tags[1],
              "thirdtag": Tags[2],
              "monetization":monetization,
            })
            .then(res.status(200).send([drawing]))
          }); 
          }

    })();
    });


    //on post l'image uploadée
    router.post('/upload_drawing_onepage/:drawing_id',  function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      var drawing_name ='';
      const PATH1= './data_and_routes/drawings_one_page';
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },
      
        filename: (req, file, cb) => {
          var today = new Date();
          var ss = String(today.getSeconds()).padStart(2, '0');
          var mi = String(today.getMinutes()).padStart(2, '0');
          var hh = String(today.getHours()).padStart(2, '0');
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); 
          var yyyy = today.getFullYear();
          let Today = yyyy + mm + dd + hh+ mi + ss;
          drawing_name= current_user + '-' + Today + path.extname(file.originalname);
          cb(null, current_user + '-' + Today + path.extname(file.originalname));
          //enlever nickname
        }
      });
      
      let upload = multer({
        storage: storage
      }).any();

      upload(req, res, function(err){
        console.log("ici on a le nom de l'oeuvre " + drawing_name + " pour l'id ");
          (async () => {
            const drawing_id = req.params.drawing_id;
            
            console.log('File is available!');
            
            const drawing = await drawings_one_page.findOne({
                where: {
                  drawing_id: drawing_id,
                  authorid: current_user,
                }
              });
              if(drawing !== null){
                console.log("drawing found");
                drawing.update({
                    "drawing_name":drawing_name,
                })
                .then(r =>  {
                res.send(r.get({plain:true}));
                }); 
              }
              else {
                console.log("drawing not found")
              }
            
            

          })();
        });
      });


      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_drawing_from_data/:drawing_id', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        
        (async () => {
          let drawing_id = req.params.drawing_id
          const drawing = await drawings_one_page.findOne({
            where: {
                drawing_id: drawing_id,
                authorid: current_user,
            }
          });
          if(drawing !== null){
            console.log( 'suppression drawing en cours');
            drawings_one_page.destroy({
                where: {
                    drawing_id: drawing_id
                    },
                truncate: false
           })
           res.json([drawing]);
          }
          else {
            console.log("page not found")
          }

          
        })();
      });

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_drawing_onepage_from_folder/:drawing_name', function (req, res) {
        fs.access('./data_and_routes/drawings_one_page' + req.params.name, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            return res.status(200)
          }
          console.log( 'annulation en cours');
          const drawing_name  = req.params.drawing_name;
          fs.unlink('./data_and_routes/drawings_one_page/' + drawing_name,  function (err) {
            if (err) {
              console.log("erreur de suppression de drawing one page : " + drawing_name);
            }  
            else {
              console.log( 'fichier supprimé dans le folder');
              return res.status(200)
            }
          });
        });
      });

    
      

    
      

    //on ajoute la cover uploadée dans le dossier et on créer un cookie
    router.post('/add_cover_drawing_onepage_tofolder', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    var filename = ''
    let PATH = './data_and_routes/covers_drawings/';
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, PATH);
          },
        filename: (req, file, cb) => {
            var today = new Date();
            var ss = String(today.getSeconds()).padStart(2, '0');
            var mi = String(today.getMinutes()).padStart(2, '0');
            var hh = String(today.getHours()).padStart(2, '0');
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); 
            var yyyy = today.getFullYear();
            let Today = yyyy + mm + dd + hh+ mi + ss;
            filename = current_user + '-' + Today + '.png'
            cb(null, current_user + '-' + Today + '.png');
          }
    });
    var upload = multer({
        storage: storage
    }).any();

    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end('Error');
        } else {   
            res.status(200).send(([{ "cover_name": filename}]))
        }
    });
    

    });


      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_drawing_onepage_todatabase', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    const name = req.body.name;
    console.log("name : " + name);
    const drawing_id = parseInt(req.body.drawing_id);
    console.log("id : " + drawing_id);

    (async () => {


      if (Object.keys(req.body).length === 0 ) {
        console.log("no inftly");
        return res.send({
          success: false
        });
        
      } else { 
        console.log('infctly');
         drawing = await drawings_one_page.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
            }
          })
          .then(drawing =>  {
            drawing.update({
              "name_coverpage" :name
            })
            .then(res.status(200).send([drawing]))
          }); 
          }

    })();
    });


      //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
      router.delete('/remove_cover_drawing_from_folder/:name', function (req, res) {
        fs.access('./data_and_routes/covers_drawings' + req.params.name, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            return res.status(200)
          }
          console.log( 'annulation en cours');
          const name  = req.params.name;
          fs.unlink('./data_and_routes/covers_drawings/' + name,  function (err) {
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
  router.post('/validation_upload_drawing_onepage', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
       const drawing_id= req.body.drawing_id;
         drawing = await drawings_one_page.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
            }
          })
          .then(drawing =>  {
            drawing.update({
              "status":"public",
            })
            .then(res.status(200).send([drawing]))
          }); 
    })();
    });

    
                   //on valide l'upload
  router.get('/retrieve_drawing_onepage_info_user_id/:user_id', function (req, res) {

    (async () => {

       const user_id= parseInt(req.params.user_id);
         drawings = await drawings_one_page.findAll({
            where: {
              authorid: user_id,
              status:"public"
            },
            order: [
                ['drawing_id', 'ASC']
              ],
          })
          .then(drawings =>  {
            res.status(200).send([drawings]);
          }); 
    })();
    });
 
    router.get('/retrieve_drawing_info_onepage_by_id/:drawing_id', function (req, res) {

      (async () => {
  
         const drawing_id= parseInt(req.params.drawing_id);
           drawing = await drawings_one_page.findOne({
              where: {
                drawing_id: drawing_id,
              }
            })
            .then(drawing =>  {
              res.status(200).send([drawing]);
            }); 
      })();
      });
      
    
  router.get('/retrieve_drawing_thumbnail_picture/:file_name', function (req, res) {

      let filename = "./data_and_routes/covers_drawings/" + req.params.file_name ;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        console.log("thumbnail drawing picture retrieved");
        res.status(200).send(data);
      });
  });

  router.get('/retrieve_drawing_onepage_by_name/:file_name', function (req, res) {

        let filename = "./data_and_routes/drawings_one_page/" + req.params.file_name;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          //blob = data.toBlob('application/image');
          console.log("drawing page retrieved");
          res.status(200).send(data);
        } );

  });



}