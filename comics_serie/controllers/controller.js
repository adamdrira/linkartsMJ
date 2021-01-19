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



module.exports = (router, Liste_bd_serie, chapters_bd_serie, pages_bd_serie,list_of_users,trendings_contents) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };

  router.post('/setcookies_cover_bd_serie/:name', (req, res)=>{ 
    let value = req.params.name;
    res.statuts(200).send(value)
    });



  router.get('/get_cookies_cover_bd_serie', (req, res)=>{ 
    //console.log('get it')
    //console.log(req.cookies)
    let value = req.cookies
    res.status(200).send([value]);
    }); 


  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_bd_serie', function (req, res) {
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

      if (Object.keys(req.body).length === 0 ) {
        //console.log("information isn't uploaded correctly");
        return res.send({
          success: false
        });
        
      } else { 
        //console.log('information uploaded correctly');
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
      bd_id=r.bd_id; // onr récupère l'id de la bd qu'on upload
      res.status(200).send([r]);
      }); 
      }

    });


     //on supprime le fichier de la base de donnée postgresql
     router.delete('/remove_bd_serie/:bd_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      (async () => {
        const bd_id=req.params.bd_id
        const bd = await Liste_bd_serie.findOne({
          where: {
            authorid: current_user,
            bd_id: bd_id,
          }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd=>{
          list_of_users.findOne({
            where:{
              id:current_user,
            }
          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
            if(bd.status=="public"){
              let number_of_comics=user.number_of_comics-1;
              user.update({
                "number_of_comics":number_of_comics,
              })
            }
            if(bd){
              bd.update({
                "status": "deleted"
              });
              res.status(200).send([bd]);
            }
          })
        })
      
        
        
          
        

      })();
    });

    

  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_bd_serie', function (req, res) {
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
            //console.log(err);	
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
              console.log(err);	
              res.status(500).json({msg: "error", details: err});		
            }).then(bd=>{
              res.status(200).send([bd])
            })
        }); 
    });

    router.post('/modify_bd_serie2', function (req, res) {
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
              //console.log(err);	
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
                //console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_os => {
              bd_os.update({
                    "status":status
              }).catch(err => {
			//console.log(err);	
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
      let current_user = get_current_user(req.cookies.currentUser);
      //console.log("add_chapter_bd_serie")
      const title = req.body.Title;
      const chapter_number = req.body.chapter_number;
      const bd_id = req.body.bd_id;
      //console.log(bd_id)
      //console.log("ajout de chapitre")
  
        if (Object.keys(req.body).length === 0 ) {
          //console.log("information isn't uploaded correctly");
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            let chaptersnumber=bd.chaptersnumber+=1;
            bd.update({
              "chaptersnumber":chaptersnumber
            })
          })
          //console.log('on ajoute le chapitre');
          chapters_bd_serie.create({
            "author_id": current_user,
            "title":title,
            "bd_id": bd_id,
            "chapter_number": chapter_number
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
        //console.log("chapitre ajouté numéro :" + chapter_number)
        res.status(200).send([r]);
        }); 
        }
  
      });

  //on modifie le nom du chapitre après modification
  router.post('/modify_chapter_bd_serie', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

  
    const title= req.body.Title;
    const number = req.body.chapter_number;
    //console.log("modification de chapitre")
    const bd_id = req.body.bd_id;
    chapters_bd_serie.findOne({
            where: {
              author_id: current_user,
              bd_id: bd_id,
              chapter_number: number
            }
          })
          .catch(err => {
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
          }).then(chapter =>  {
            chapter.update({
              "title":title,
            }).catch(err => {
              //console.log(err);	
              res.status(500).json({msg: "error", details: err});		
            }).then(res.status(200).send([chapter]));
          });
         
    });

    

      //on supprime le fichier de la base de donnée postgresql
      router.delete('/delete_chapter_bd_serie/:chapter_number/:bd_id', function (req, res) {
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
          let chaptersnumber=bd.chaptersnumber-=1;
          bd.update({
            "chaptersnumber":chaptersnumber
          })
        })
        //console.log( 'suppression en cours');
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
      var file_name ='';
      //console.log("ici" + file_name);

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
            //console.log(bd_id)
          if (err) {
            //console.log("erreur");
            return res.send({
              success: false
            });
        
          } else { 
            //console.log("upload_page_bd_serie")
            //console.log(page);
          chapters_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              author_id: current_user,
            }
          }).catch(err => {
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.send(r.get({plain:true}));
          }); 
          });
          }
      });
    });

  

      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_page_bdserie_from_data/:page/:chapter/:bd_id', function (req, res) {
        (async () => {
          const pagebd = await pages_bd_serie.findOne({
            where: {
              chapter_number: req.params.chapter,
              page_number: req.params.page,
              bd_id: req.params.bd_id,
            }
          });
          if(pagebd !== null){
            res.json([pagebd]);
          }
          else {
            //console.log("page not found")
          }

          //console.log( 'suppression en cours');
          const page  = req.params.page;
          pages_bd_serie.destroy({
            where: {
              page_number:page,
              chapter_number: req.params.chapter,
              bd_id: bd_id 
              },
            truncate: false
          })
        })();
      });

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_page_bdserie_from_folder/:name', function (req, res) {
        fs.access('./data_and_routes/pages_bd_serie' + req.params.name, fs.F_OK, (err) => {
          if(err){
            //console.log('suppression already done');
            return res.status(200).send([{delete:'suppression done'}])
          }
          //console.log( 'annulation en cours');
          const name  = req.params.name;
          fs.unlink('./data_and_routes/pages_bd_serie/' + name,  function (err) {
            if (err) {
              throw err;
            }  
            else {
              //console.log( 'fichier supprimé');
              return res.status(200).send([{delete:'suppression done'}])
            }
          });
        });
      });

      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_bd_serie_todatabase', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    const name = req.body.name;
    const bd_id = req.body.bd_id;

    (async () => {


      if (Object.keys(req.body).length === 0 ) {
        //console.log("no inftly");
        return res.send({
          success: false
        });
        
      } else { 
        //console.log('infctly');
         bd = await Liste_bd_serie.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            bd.update({
              "name_coverpage" :name
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
          }); 
          }

    })();
    });

    router.post('/add_cover_bd_serie_todatabase2', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
  
      const name = req.body.name;
      const bd_id = req.body.bd_id;
      const thumbnail_color=req.body.thumbnail_color;
  
      (async () => {
  
  
        if (Object.keys(req.body).length === 0 ) {
          //console.log("no inftly");
          return res.send({
            success: false
          });
          
        } else { 
          //console.log('infctly');
           bd = await Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
                authorid: current_user,
              }
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
              bd.update({
                "name_coverpage" :name,
                "thumbnail_color":thumbnail_color
              })
              .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
            }); 
            }
  
      })();
      });

 
                  //on valide l'upload
  router.post('/validation_bd_upload_bd_serie', function (req, res) {
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
			//console.log(err);	
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
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd=>{
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
        }); 
          
    })();
    });

    router.post('/validation_chapter_upload_bd_serie', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      //console.log("validation_chapter_upload_bd_serie")
    
        const chapter_number=req.body.chapter_number + 1;
        const number_of_pages=req.body.number_of_pages;
        const bd_id= req.body.bd_id; 
        //console.log(bd_id)
         chapters_bd_serie.findOne({
          where: {
            bd_id: bd_id,
            chapter_number:chapter_number,
            author_id: current_user,
          }
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_chapter =>  {
          bd_chapter.update({
            "status":"public",
            "pagesnumber":number_of_pages,
            "viewnumber": 0,
            "likesnumber": 0,
            "lovesnumber":0,
            "commentarynumbers":0,
          })
          .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd_chapter]))
        }); 
        
      });


                   //on valide l'upload
  router.get('/retrieve_bd_serie_by_user_id/:user_id', function (req, res) {
       const user_id= parseInt(req.params.user_id);
        Liste_bd_serie.findAll({
            where: {
              authorid: user_id,
              status:"public"
            },
            order: [
              ['createdAt', 'DESC']
            ],
          })
          .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
            
            res.status(200).send([bd]);
          }); 
 
    });


    router.post('/get_number_of_bd_series', function (req, res) {
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
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
              res.status(200).send([bd]);
            }); 
      
    });
 
    router.get('/retrieve_bd_serie_by_id/:bd_id', function (req, res) {

      
  
         const bd_id= parseInt(req.params.bd_id);
           Liste_bd_serie.findOne({
              where: {
                bd_id: bd_id,
              }
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
              if(bd){
                trendings_contents.findOne({
                  where:{
                    publication_category:"comics",
                    format:"serie",
                    publication_id:bd.bd_id
                  }
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(tren=>{
                  if(tren){
                    if(bd.trending_rank){
                      if(bd.trending_rank<tren.rank){
                        bd.update({
                          "trending_rank":tren.rank
                        })
                        res.status(200).send([bd]);
                      }
                      else{
                        res.status(200).send([bd]);
                      }
                    }
                    else{
                      bd.update({
                        "trending_rank":tren.rank
                      })
                      res.status(200).send([bd]);
                    }
                   
                  }
                  else{
                    res.status(200).send([bd]);
                  }
                })
                
              }
              else{
                res.status(200).send([bd]);
              }
            }); 
      
      });

  router.get('/retrieve_chapters_by_id/:bd_id', function (req, res) {



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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {          
            res.status(200).send([bd]);
          }); 

    });
  


  router.get('/retrieve_chapter_by_number/:bd_id/:chapter_number', function (req, res) {
    //console.log('tentativee de récupération');

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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
          res.status(200).send([chapter]);
        } );
     
     })();
  });

  router.get('/retrieve_bd_chapter_page/:bd_id/:chapter_number/:bd_page', function (req, res) {



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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(page =>  {
  
        if(page && page.file_name){
          let filename = "./data_and_routes/pages_bd_serie/" + page.file_name;
          fs.readFile( path.join(process.cwd(),filename), function(e,data){
            if(e){
              filename = "./data_and_routes/not-found-image.jpg";
              fs.readFile( path.join(process.cwd(),filename), function(e,data){
                res.status(200).send(data);
              } );
            }
            else{
              res.status(200).send(data);
            }
            //console.log("bd page retrieved");
            
          } );
        }
        else{
          let filename = "./data_and_routes/not-found-image.jpg";
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            } );
        }
        
      });
     
  });


        
}
