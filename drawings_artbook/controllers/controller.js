const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";



module.exports = (router, Liste_artbook, pages_artbook) => {

  
  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  

  router.post('/add_drawings_artbook', function (req, res) {
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
        Liste_artbook.create({
                "authorid": current_user,
                "title":title,
                "highlight":highlight,
                "category": category,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
                "pagesnumber": 0,
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



   

  //on modifie les informations du formulaire de la  qu'on upload
  router.post('/modify_drawings_artbook', function (req, res) {
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
         drawing = await Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
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

    router.post('/update_filter_color_drawing_artbook', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      let color = req.body.color;
      let drawing_id = req.body.drawing_id;
  
      (async () => {
          artbook = await Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid:current_user,
            }
          })
          .then(artbook =>  {
            artbook.update({
              "thumbnail_color": color
            })
            .then(res.status(200).send([artbook]))
          }); 
      })();
      });

    router.delete('/remove_drawings_artbook/:drawing_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
            let drawing_id=req.params.drawing_id;
            const artbook = await Liste_artbook.findOne({
              where: {
                authorid: current_user,
                drawing_id: drawing_id,
              }
            });
            if(artbook !== null){
                console.log( 'suppression en cours');
                Liste_artbook.destroy({
                  where: {authorid:current_user, drawing_id: drawing_id },
                  truncate: false
                })
              res.json([artbook]);
            }
            else {
              console.log("artbook not found")
            }
          
          })();
      
        });

        router.post('/change_artbook_drawing_status', function (req, res) {
          let current_user = get_current_user(req.cookies.currentUser);
          let drawing_id=req.body.drawing_id;
          let status=req.body.status;
          (async () => {
    
              artbook = await Liste_artbook.findOne({
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

      router.get('/retrieve_private_artbook_drawings', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
             artbooks = await Liste_artbook.findAll({
                where: {
                  authorid: current_user,
                  status:"private"
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
              })
              .then(artbooks =>  {
                res.status(200).send([artbooks]);
              }); 
        })();
      });

    //on post l'image uploadée
    router.post('/upload_drawing_artbook/:page/:drawing_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      var file_name='';
      const PATH1= './data_and_routes/drawings_pages_artbook';

      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },

        filename: (req, file, cb) => {
          file_name=current_user + '-' + req.params.drawing_id + '-' + req.params.page + path.extname(file.originalname);
          cb(null,current_user + '-' + req.params.drawing_id + '-' +req.params.page + path.extname(file.originalname));
          //enlever nickname
        }
      });

      let upload = multer({
        storage: storage
      }).any();

      upload(req, res, function(err){
          (async () => {
            const page= req.params.page;
            const drawing_id = req.params.drawing_id;
            console.log('File is available!');   
            const drawing = await Liste_artbook.findOne({
                where: {
                  drawing_id: drawing_id,
                  authorid: current_user,
                }
              });
              if(drawing !== null){
                console.log(drawing.drawing_id);
              }
              else {
                console.log("drawing not found")
              }
              pages_artbook.create({
                "drawing_id": drawing_id,
                "author_id": current_user,
                "file_name":file_name,
                "page_number": page
            })
            .then(r =>  {
            res.send(r.get({plain:true}));
            }); 
            

          })();
        });
      });


      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_artbook_page_from_data/:page/:drawing_id', function (req, res) {
        (async () => {
          const pageartbook = await pages_artbook.findOne({
            where: {
              page_number: req.params.page,
              drawng_id: drawing_id,
            }
          });
          if(pageartbook !== null){
            res.json([pageartbook]);
          }
          else {
            console.log("page not found")
          }

          console.log( 'suppression en cours');
          const page  = req.params.page;
          pages_artbook.destroy({
            where: {page_number:page, drawing_id: drawing_id },
            truncate: false
          })
        })();
      });

      //on supprime le fichier du dossier date/drawings_pages_artbook
      router.delete('/remove_artbook_page_from_folder/:name', function (req, res) {
        fs.access('./data_and_routes/drawings_pages_artbook' + req.params.name, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            return res.status(200)
          }
          console.log( 'annulation en cours');
          const name  = req.params.name;
          fs.unlink('./data_and_routes/drawings_pages_artbook/' + name,  function (err) {
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


     //on ajoute le nom de la coverpage dans la base de donnée
      router.post('/add_cover_drawing_artbook_todatabase', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
    
        const name = req.body.name;
        const drawing_id = parseInt(req.body.drawing_id);
    
        (async () => {
    
    
          if (Object.keys(req.body).length === 0 ) {
            console.log("no inftly");
            return res.send({
              success: false
            });
            
          } else { 
            console.log('infctly');
             drawing = await Liste_artbook.findOne({
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

 
//on valide l'upload
  router.post('/validation_upload_drawing_artbook', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
      const page_number=parseInt(req.body.page_number);
      console.log(page_number);
       const drawing_id= req.body.drawing_id;
         drawing = await Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
            }
          })
          .then(drawing =>  {
            drawing.update({
              "status":"public",
              "pagesnumber":page_number,
            })
            .then(res.status(200).send([drawing]))
          }); 
          

    })();
    });


    
                   //on valide l'upload
  router.get('/retrieve_drawing_artbook_info_by_userid/:user_id', function (req, res) {

    (async () => {

       const user_id= parseInt(req.params.user_id);
         artbooks = await Liste_artbook.findAll({
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
 
    router.get('/retrieve_drawing_artbook_by_id/:drawing_id', function (req, res) {

      (async () => {
  
         const drawing_id= parseInt(req.params.drawing_id);
           artbook = await Liste_artbook.findOne({
              where: {
                drawing_id: drawing_id,
              }
            })
            .then(drawing =>  {
              res.status(200).send([drawing]);
            }); 
      })();
      });
      

  router.get('/retrieve_drawing_page_ofartbook/:drawing_id/:drawing_page', function (req, res) {

    (async () => {

      const drawing_id = parseInt(req.params.drawing_id);
      const drawing_page = parseInt(req.params.drawing_page);

      page = await pages_artbook.findOne({
        where: {
          drawing_id: drawing_id,
          page_number:drawing_page,
        }
      })
      .then(page =>  {
  
        let filename = "./data_and_routes/drawings_pages_artbook/" + page.file_name;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          //blob = data.toBlob('application/image');
          console.log("drawing page retrieved");
          res.status(200).send(data);
        } );
      });
     
     })();
  });

        
}

