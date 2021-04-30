const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Navbar = require('../../navbar/model/sequelize');
const Notations = require('../../publications_notation/model/sequelize');
const Sequelize = require('sequelize');
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const sharp = require('sharp');


module.exports = (router, Liste_bd_serie, chapters_bd_serie, pages_bd_serie,list_of_users,trendings_contents) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };

  router.post('/setcookies_cover_bd_serie/:name', function (req, res) {

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
    let value = req.params.name;
    res.statuts(200).send(value)
    });



  router.get('/get_cookies_cover_bd_serie', function (req, res) {

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
    let value = req.cookies
    res.status(200).send([value]);
    }); 


  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_bd_serie', function (req, res) {

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
    let current_user = get_current_user(req.cookies.currentUser);

    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;

      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
        Liste_bd_serie.create({
          "authorid": current_user,
          "title":title,
          "highlight":highlight,
          "category": category,
          "firsttag": Tags[0],
          "secondtag": Tags[1],
          "thirdtag": Tags[2],
          "pagesnumber": 0,
          "likesnumber": 0,
          "lovesnumber": 0,
          "viewnumber": 0,
          "commentarynumbers":0,
          "monetization":monetization,

      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
      bd_id=r.bd_id; // onr récupère l'id de la bd qu'on upload
      res.status(200).send([r]);
      }); 
      }

    });


    router.delete('/remove_bd_serie/:bd_id', function (req, res) {
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
      let current_user = get_current_user(req.cookies.currentUser);

        const bd_id=parseInt(req.params.bd_id);
        Liste_bd_serie.findOne({
          where: {
            authorid: current_user,
            bd_id: bd_id,
          }
        }).catch(err => {
          res.status(500).json({msg: "error", details: err});		
        }).then(bd=>{
          if(bd){
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
              res.status(500).json({msg: "error", details: err});		
            }).then(user=>{
              if(bd.status=="public"){
                let number_of_comics=user.number_of_comics-1;
                user.update({
                  "number_of_comics":number_of_comics,
                })
              }
              bd.update({
                "status": "deleted"
              });
              res.status(200).send([bd]);
            })
          }
          else{
            if(current_user==1){
              Liste_bd_os.findOne({
                where: {
                  bd_id: bd_id,
                }
              }).then(bd_found=>{
                if(bd_found && bd_found.status=="public"){
                  bd_found.update({
                    "status": "deleted",
                  });
                  list_of_users.findOne({
                    where:{
                      id:bd_found.authorid,
                    }
                  }).catch(err => {
                    res.status(500).json({msg: "error", details: err});		
                  }).then(user_found=>{
                    let number_of_comics=user_found.number_of_comics-1;
                    user_found.update({
                      "number_of_comics":number_of_comics,
                    })
                    res.status(200).send([bd_found]);
                  })
                }
              })
            }
            else{
              res.status(200).send([{"err":"not found"}]);
            }
          }
        }) 
        
    });

    

  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_bd_serie', function (req, res) {

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
    let current_user = get_current_user(req.cookies.currentUser);

    
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const bd_id = req.body.bd_id;
    const monetization = req.body.monetization;
    Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
            
            res.status(500).json({msg: "error", details: err});		
          }).then(bd =>  {
            bd.update({
              "title":title,
              "category": category,
              "highlight":highlight,
              "firsttag": Tags[0]?Tags[0]:null,
              "secondtag": Tags[1]?Tags[1]:null,
              "thirdtag": Tags[2]?Tags[2]:null,
              "monetization":monetization,
            })
            .catch(err => {	
              res.status(500).json({msg: "error", details: err});		
            }).then(bd=>{
              res.status(200).send([bd])
            })
        }); 
    });

    router.post('/modify_bd_serie2', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
  
     
      const highlight = req.body.highlight;
      const title = req.body.Title;
      const category = req.body.Category;
      const Tags = req.body.Tags;
      const bd_id = req.body.bd_id;
      Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
                authorid: current_user,
              }
            })
            .catch(err => {
              	
              res.status(500).json({msg: "error", details: err});		
            }).then(bd =>  {
              bd.update({
                "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0]?Tags[0]:null,
                "secondtag": Tags[1]?Tags[1]:null,
                "thirdtag": Tags[2]?Tags[2]:null,
              })
              .catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
              }).then(bd=>{
                Navbar.list_of_navbar_researches.update({
                  "style": category,
                  "firsttag": Tags[0]?Tags[0]:null,
                  "secondtag": Tags[1]?Tags[1]:null,
                  "thirdtag": Tags[2]?Tags[2]:null,
                },
                {
                  where:{
                    publication_category:"Comic",
                    format:"serie",
                    target_id:bd_id
                  }
                })
                Notations.List_of_likes.update({
                  "style": category,
                  "firsttag": Tags[0]?Tags[0]:null,
                  "secondtag": Tags[1]?Tags[1]:null,
                  "thirdtag": Tags[2]?Tags[2]:null,
                },
                {
                  where:{
                    publication_category:"comic",
                    format:"serie",
                    publication_id:bd_id
                  }
                })
                Notations.List_of_loves.update({
                  "style": category,
                  "firsttag": Tags[0]?Tags[0]:null,
                  "secondtag": Tags[1]?Tags[1]:null,
                  "thirdtag": Tags[2]?Tags[2]:null,
                },
                {
                  where:{
                    publication_category:"comic",
                    format:"serie",
                    publication_id:bd_id
                  }
                })
                Notations.List_of_views.update({
                  "style": category,
                  "firsttag": Tags[0]?Tags[0]:null,
                  "secondtag": Tags[1]?Tags[1]:null,
                  "thirdtag": Tags[2]?Tags[2]:null,
                },
                {
                  where:{
                    publication_category:"comic",
                    format:"serie",
                    publication_id:bd_id
                  }
                })
                res.status(200).send([bd])
              })
            }); 
           
      });

    router.post('/change_serie_comic_status', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
      let bd_id=req.body.bd_id;
      let status=req.body.status;
      (async () => {

          bd_os = await Liste_bd_serie.findOne({
              where: {
                  authorid:current_user,
                  bd_id:bd_id,
              },
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_os => {
              bd_os.update({
                    "status":status
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_os => {
                  res.status(200).send(bd_os)
              }
              )
              
          }); 
      })();     
  });

    //on ajoute les infos du chapitre ajouté
    router.post('/add_chapter_bd_serie', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
      const title = req.body.Title;
      const chapter_number = req.body.chapter_number;
      const bd_id = req.body.bd_id;
        if (Object.keys(req.body).length === 0 ) {
          return res.send({
            success: false
          });
          
        } else { 
          Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            let chaptersnumber=bd.chaptersnumber+=1;
            bd.update({
              "chaptersnumber":chaptersnumber
            })
          })
          chapters_bd_serie.create({
            "author_id": current_user,
            "title":title,
            "bd_id": bd_id,
            "chapter_number": chapter_number
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
        res.status(200).send([r]);
        }); 
        }
  
      });

  //on modifie le nom du chapitre après modification
  router.post('/modify_chapter_bd_serie', function (req, res) {

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
    let current_user = get_current_user(req.cookies.currentUser);

  
    const title= req.body.Title;
    const number = req.body.chapter_number;
    const bd_id = req.body.bd_id;
    chapters_bd_serie.findOne({
            where: {
              author_id: current_user,
              bd_id: bd_id,
              chapter_number: number
            }
          })
          .catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(chapter =>  {
            chapter.update({
              "title":title,
            }).catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(res.status(200).send([chapter]));
          });
         
    });

    

      //on supprime le fichier de la base de donnée postgresql
      router.delete('/delete_chapter_bd_serie/:chapter_number/:bd_id', function (req, res) {
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
        let current_user = get_current_user(req.cookies.currentUser);
        const chapter_number = parseInt(req.params.chapter_number);
        const bd_id = parseInt(req.params.bd_id);
        Liste_bd_serie.findOne({
          where: {
            bd_id: bd_id,
            authorid: current_user,
          }
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
          let chaptersnumber=(bd.chaptersnumber>0)?bd.chaptersnumber-1:0;
          bd.update({
            "chaptersnumber":chaptersnumber
          })
        })
        chapters_bd_serie.destroy({
          where: {
            chapter_number: chapter_number,
            bd_id: bd_id 
            },
          truncate: false
        })
        res.send([{"ok":"ok"}]);
      });


      //on post l'image uploadée
    router.post('/upload_page_bd_serie/:page/:chapter/:bd_id', function (req, res) {

      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name ='';

      const PATH1= './data_and_routes/pages_bd_serie';
      

      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },

        filename: (req, file, cb) => {
          file_name = current_user + '-' + req.params.bd_id + '-' + req.params.chapter  + '-'+ req.params.page + path.extname(file.originalname);
          cb(null, current_user+ '-' + req.params.bd_id + '-' + req.params.chapter + '-' + req.params.page+ path.extname(file.originalname));

        }
      });

      var upload = multer({
          storage: storage
      }).any();
      //upload.single('image')
        upload(req, res, function(err){
            const chapter_number= (parseInt(req.params.chapter)+1);
            const bd_id = parseInt(req.params.bd_id);
            const page= req.params.page;
            (async () => {
              let filename = "./data_and_routes/pages_bd_serie/" + file_name ;
              const files = await imagemin([filename], {
                destination: './data_and_routes/pages_bd_serie',
                plugins: [
                  imageminPngquant({
                    quality: [0.7, 0.8]
                })
                ]
              });
            })();
          if (err) {
            return res.send({
              success: false
            });
        
          } else { 
          chapters_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              author_id: current_user,
            }
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter_bd => {
          pages_bd_serie.create({
            "bd_id": bd_id,
            "chapter_id":chapter_bd.chapter_id,
            "chapter_number": chapter_number,
            "author_id": current_user,
            "page_number": page,
            "file_name":file_name,
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.send(r.get({plain:true}));
          }); 
          });
          }
      });
    });

  
    router.delete('/remove_all_pages_from_bd_chapter/:chapter/:bd_id', function (req, res) {
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
 
        pages_bd_serie.destroy({
          where: {
            chapter_number: req.params.chapter,
            bd_id: parseInt(req.params.bd_id),
            },
          truncate: false
        })
        res.status(200).send([{done:"done"}])
    });

      //on supprime le fichier de la base de donnée postgresql
    router.delete('/remove_page_bdserie_from_data/:page/:chapter/:bd_id', function (req, res) {

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
 
          const page  = parseInt(req.params.page);
          pages_bd_serie.destroy({
            where: {
              page_number:page,
              chapter_number: req.params.chapter,
              bd_id: parseInt(req.params.bd_id)
              },
            truncate: false
          })
          res.status(200).send([{done:"done"}])
      });

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_page_bdserie_from_folder/:name', function (req, res) {

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
        fs.access('./data_and_routes/pages_bd_serie' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200).send([{delete:'suppression done'}])
          }
          const name  = req.params.name;
          fs.unlink('./data_and_routes/pages_bd_serie/' + name,  function (err) {
            if (err) {
              return res.status(200).send([{delete:'suppression done'}])
            }  
            else {
              return res.status(200).send([{delete:'suppression done'}])
            }
          });
        });
      });

      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_bd_serie_todatabase', function (req, res) {

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
    let current_user = get_current_user(req.cookies.currentUser);

    const name = req.body.name;
    const bd_id = req.body.bd_id;

    (async () => {


      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
         bd = await Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            bd.update({
              "name_coverpage" :name
            })
            .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
          }); 
          }

    })();
    });

    router.post('/add_cover_bd_serie_todatabase2', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
  
      const name = req.body.name;
      const bd_id = req.body.bd_id;
      const thumbnail_color=req.body.thumbnail_color;
  
      (async () => {
  
  
        if (Object.keys(req.body).length === 0 ) {
          return res.send({
            success: false
          });
          
        } else { 
           bd = await Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
                authorid: current_user,
              }
            })
            .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
              bd.update({
                "name_coverpage" :name,
                "thumbnail_color":thumbnail_color
              })
              .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
            }); 
            }
  
      })();
      });

 
                  //on valide l'upload
  router.post('/validation_bd_upload_bd_serie', function (req, res) {

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
    let current_user = get_current_user(req.cookies.currentUser);
    var average_page_by_chapter=0;
    (async () => {
       const number_of_chapters=req.body.number_of_chapters;
       const bd_id= req.body.bd_id;
        bd = await Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            chapters_bd_serie.findAll({
              where: {
                bd_id: bd_id,
                author_id: current_user,
              },
              order: [
                ['chapter_id', 'ASC']
              ],
            })
            .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_chapters =>  {
              for(let step = 0; step < number_of_chapters; step++){
                average_page_by_chapter = average_page_by_chapter + bd_chapters[step].dataValues.pagesnumber;
              };
              average_page_by_chapter = Math.trunc(average_page_by_chapter/number_of_chapters);
          })});
        bd = await Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd=>{
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              let number_of_comics=user.number_of_comics+1;
              user.update({
                "number_of_comics":number_of_comics,
              })
            });
            bd.update({
              "status":"public",
              "chaptersnumber":number_of_chapters,
              "pagesnumber": average_page_by_chapter,
            })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
        }); 
          
    })();
    });

    router.post('/validation_chapter_upload_bd_serie', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
        const chapter_number=req.body.chapter_number + 1;
        const number_of_pages=req.body.number_of_pages;
        const bd_id= req.body.bd_id; 
         chapters_bd_serie.findOne({
          where: {
            bd_id: bd_id,
            chapter_number:chapter_number,
            author_id: current_user,
          }
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_chapter =>  {
          bd_chapter.update({
            "status":"public",
            "pagesnumber":number_of_pages,
            "viewnumber": 0,
            "likesnumber": 0,
            "lovesnumber":0,
            "commentarynumbers":0,
          }).then(chapter=>{
            chapters_bd_serie.findAll({
              where: {
                bd_id: bd_id,
                author_id: current_user,
                status:"public"
              }
            }).then(serie=>{
              Liste_bd_serie.update({
                "chaptersnumber":serie.length
              },{
                where:{
                  bd_id: bd_id,
                  authorid: current_user,
                  status:"public"
                }
              })
              res.status(200).send([serie]);
            })
          })
        
         
        }); 
        
      });


  router.get('/retrieve_bd_serie_by_pseudo/:pseudo', function (req, res) {

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

      const pseudo = req.params.pseudo;
      list_of_users.findOne({
          where:{
              nickname:pseudo
          }
      }).catch(err => {
              
        res.status(500).json({msg: "error", details: err});		
      })
      .then(user=>{
        if(user){
          Liste_bd_serie.findAll({
              where: {
                authorid: user.id,
                status:"public"
              },
              order: [
                ['createdAt', 'DESC']
              ],
            })
            .catch(err => {
        
              res.status(500).json({msg: "error", details: err});		
            }).then(bd =>  {
              
              res.status(200).send([bd]);
            }); 
        }
      })
       
 
    });


    router.post('/get_number_of_bd_series', function (req, res) {

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
      const id_user= req.body.id_user;
      let date_format=req.body.date_format;
      const Op = Sequelize.Op;
      let list_of_ids=[];
      let list_of_comics=[];
      let date=new Date();

      if(date_format==0){
          var last_month = new Date();
          date=last_month.setDate(last_month.getDate() - 8);
      }
      else if(date_format==1){
          var last_month = new Date();
          date=last_month.setDate(last_month.getDate() - 30);
      }
      else if(date_format==2){
        var last_month = new Date();
        date=last_month.setDate(last_month.getDate() - 365);
      }
       Liste_bd_serie.findAll({
           where: {
             authorid: id_user,
             status:"public",
             createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
           },
           order: [
            ['createdAt', 'DESC']
          ],
         })
         .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
          if(bd.length>0){
            for(let j=0;j<bd.length;j++){
             list_of_ids.push(bd[j].bd_id)
             list_of_comics.push(bd[j])
            }
          }
           res.status(200).send([{number_of_bd_series:bd.length,list_of_ids:list_of_ids,list_of_comics:list_of_comics}]);
         }); 

   });

    router.get('/retrieve_private_serie_bd', function (req, res) {

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
      let current_user = get_current_user(req.cookies.currentUser);
    
           Liste_bd_serie.findAll({
              where: {
                authorid: current_user,
                status:"private"
              },
              order: [
                  ['createdAt', 'DESC']
                ],
            })
            .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
              res.status(200).send([bd]);
            }); 
      
    });

    router.get('/retrieve_bd_serie_by_id/:bd_id', function (req, res) {

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

  
  
         const bd_id= parseInt(req.params.bd_id);
           Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
              }
            })
            .catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(bd =>  {
              if(bd){
                res.status(200).send([bd]);
              }
            }); 
      
      });
 
    router.get('/retrieve_bd_serie_by_id2/:bd_id', function (req, res) {

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

      let current_user = get_current_user(req.cookies.currentUser);
  
         const bd_id= parseInt(req.params.bd_id);
           Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
              }
            })
            .catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(bd =>  {
              if(bd){
                res.status(200).send([{current_user:current_user,data:[bd]}]);
              }
            }); 
      
      });

  router.get('/retrieve_chapters_by_id/:bd_id', function (req, res) {
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


        const bd_id= parseInt(req.params.bd_id);
         chapters_bd_serie.findAll({
            where: {
              bd_id: bd_id,
            },
            order: [
              ['chapter_number', 'ASC']
            ],
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {          
            res.status(200).send([bd]);
          }); 

    });
  


  router.get('/retrieve_chapter_by_number/:bd_id/:chapter_number', function (req, res) {

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
    (async () => {

      const bd_id = parseInt(req.params.bd_id);
      const chapter_number = parseInt(req.params.chapter_number);
      

      chapter = await chapters_bd_serie.findOne({
        where: {
          bd_id: bd_id,
          chapter_number:chapter_number,
        }
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
          res.status(200).send([chapter]);
        } );
     
     })();
  });

  router.get('/retrieve_bd_chapter_page/:bd_id/:chapter_number/:bd_page/:width', function (req, res) {

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



      const bd_id = parseInt(req.params.bd_id);
      const chapter_number = req.params.chapter_number;
      const bd_page = parseInt(req.params.bd_page);
      const width = parseInt(req.params.width)-20;
      pages_bd_serie.findOne({
        where: {
          bd_id: bd_id,
          chapter_number:chapter_number,
          page_number:bd_page,
        }
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(page =>  {
  
        let transform = sharp()
        transform = transform.resize({fit:sharp.fit.inside,width:width})
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
        });
        if(page && page.file_name){
          
          let filename = "./data_and_routes/pages_bd_serie/" + page.file_name;
          fs.access(filename, fs.F_OK, (err) => {
            if(err){
              filename = "./data_and_routes/not-found-image.jpg";
              var not_found = fs.createReadStream( path.join(process.cwd(),filename))
              not_found.pipe(transform);
            }  
            else{
              var pp = fs.createReadStream( path.join(process.cwd(),filename))
              pp.pipe(transform);
            }     
          })
        }
        else{
          filename = "./data_and_routes/not-found-image.jpg";
              var not_found = fs.createReadStream( path.join(process.cwd(),filename))
              not_found.pipe(transform);
        }
        
      });
     
  });


  router.get('/retrieve_bd_chapter_page_artwork/:bd_id/:chapter_number/:bd_page', function (req, res) {

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



    const bd_id = parseInt(req.params.bd_id);
    const chapter_number = req.params.chapter_number;
    const bd_page = parseInt(req.params.bd_page);

    pages_bd_serie.findOne({
      where: {
        bd_id: bd_id,
        chapter_number:chapter_number,
        page_number:bd_page,
      }
    })
    .catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(page =>  {

      let transform = sharp()
      transform = transform.resize({fit:sharp.fit.inside,height:266,width:266})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
      if(page && page.file_name){
        
        let filename = "./data_and_routes/pages_bd_serie/" + page.file_name;
        fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/not-found-image.jpg";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(transform);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(transform);
          }     
        })
      }
      else{
        filename = "./data_and_routes/not-found-image.jpg";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(transform);
      }
      
    });
   
  });
        
}
