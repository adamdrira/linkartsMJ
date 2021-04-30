const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const Sequelize = require('sequelize');
const Navbar = require('../../navbar/model/sequelize');
const Notations = require('../../publications_notation/model/sequelize');
const sharp = require('sharp');

module.exports = (router, Liste_artbook, pages_artbook,list_of_users,trendings_contents) => {

  
  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  

  router.post('/add_drawings_artbook', function (req, res) {

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
          
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.status(200).send([r]);
          }); 
        
      }
  
    });



   

  //on modifie les informations du formulaire de la  qu'on upload
  router.post('/modify_drawings_artbook', function (req, res) {

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
    const drawing_id = req.body.drawing_id;
    Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
            }
          })
          .catch(err => {
          	
          res.status(500).json({msg: "error", details: err});		
        }).then(drawing =>  {
            drawing.update({
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
        }).then(res.status(200).send([drawing]))
          }); 

    });

    router.post('/modify_drawings_artbook2', function (req, res) {

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
      const drawing_id = req.body.drawing_id;
      Liste_artbook.findOne({
              where: {
                drawing_id: drawing_id,
                authorid: current_user,
              }
            })
            .catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(drawing =>  {
              drawing.update({
                "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0]?Tags[0]:null,
              "secondtag": Tags[1]?Tags[1]:null,
              "thirdtag": Tags[2]?Tags[2]:null,
              })
              .catch(err => {
              	
              res.status(500).json({msg: "error", details: err});		
            }).then(drawing=>{

              Navbar.list_of_navbar_researches.update({
                "style": category,
                "firsttag": Tags[0]?Tags[0]:null,
              "secondtag": Tags[1]?Tags[1]:null,
              "thirdtag": Tags[2]?Tags[2]:null,
              },
              {
                where:{
                  publication_category:"Drawing",
                  format:"artbook",
                  target_id:drawing_id
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
                  publication_category:"drawing",
                  format:"artbook",
                  publication_id:drawing_id
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
                  publication_category:"drawing",
                  format:"artbook",
                  publication_id:drawing_id
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
                  publication_category:"drawing",
                  format:"artbook",
                  publication_id:drawing_id
                }
              })
              res.status(200).send([drawing])
            })
            }); 
  
      });

    router.post('/update_filter_color_drawing_artbook', function (req, res) {

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
      let color = req.body.color;
      let drawing_id = req.body.drawing_id;
  
      (async () => {
          artbook = await Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid:current_user,
            }
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(artbook =>  {
            artbook.update({
              "thumbnail_color": color
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([artbook]))
          }); 
      })();
      });


      router.delete('/remove_drawings_artbook/:drawing_id', function (req, res) {
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
  
        let drawing_id = parseInt(req.params.drawing_id);
        Liste_artbook.findOne({
          where: {
              drawing_id: drawing_id,
              authorid: current_user,
          }
          }).catch(err => {
            res.status(500).json({msg: "error", details: err});		
          }).then(drawing=>{
            if(drawing){
              list_of_users.findOne({
                where:{
                  id:current_user,
                }
              }).catch(err => {
                res.status(500).json({msg: "error", details: err});		
              }).then(user=>{
                if(drawing.status=="public"){
                  let number_of_drawings=user.number_of_drawings-1;
                  user.update({
                    "number_of_drawings":number_of_drawings,
                  })
                }
                drawing.update({
                  "status": "deleted"
                });
                res.status(200).send([drawing]);
              })
            }
            else{
              if(current_user==1){
                drawings_one_page.findOne({
                  where: {
                    drawing_id: drawing_id,
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
                      let number_of_drawings=user_found.number_of_drawings-1;
                      user_found.update({
                        "number_of_drawings":number_of_drawings,
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


        router.post('/change_artbook_drawing_status', function (req, res) {

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
          let drawing_id=req.body.drawing_id;
          let status=req.body.status;
          (async () => {
    
              artbook = await Liste_artbook.findOne({
                  where: {
                      authorid:current_user,
                      drawing_id:drawing_id,
                  },
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing => {
                drawing.update({
                        "status":status
                  }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing => {
                      res.status(200).send(drawing)
                  })
                  
              }); 
          })();     
      });

      router.get('/retrieve_private_artbook_drawings', function (req, res) {

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
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(artbooks =>  {
                res.status(200).send([artbooks]);
              }); 
        })();
      });

    //on post l'image uploadée
    router.post('/upload_drawing_artbook/:page/:drawing_id', function (req, res) {

      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
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
            let filename = "./data_and_routes/drawings_pages_artbook/" + file_name ;
            const files = await imagemin([filename], {
              destination: './data_and_routes/drawings_pages_artbook',
              plugins: [
                imageminPngquant({
                  quality: [0.7, 0.8]
              })
              ]
            });

              pages_artbook.create({
                "drawing_id": drawing_id,
                "author_id": current_user,
                "file_name":file_name,
                "page_number": page
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
            res.send(r.get({plain:true}));
            }); 
            

          })();
        });
      });


      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_artbook_page_from_data/:page/:drawing_id', function (req, res) {

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

        const page  = req.params.page;
        pages_artbook.destroy({
          where: {page_number:page, drawing_id: drawing_id },
          truncate: false
        })

        res.status(200).send([{done:"done"}])
      });

      //on supprime le fichier du dossier date/drawings_pages_artbook
      router.delete('/remove_artbook_page_from_folder/:name', function (req, res) {

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
        fs.access('./data_and_routes/drawings_pages_artbook' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200).send([{delete:'suppression done'}])
          }
          const name  = req.params.name;
          fs.unlink('./data_and_routes/drawings_pages_artbook/' + name,  function (err) {
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
      router.post('/add_cover_drawing_artbook_todatabase', function (req, res) {

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
        const drawing_id = req.body.drawing_id;
        Liste_artbook.findOne({
                where: {
                  drawing_id: drawing_id,
                  authorid: current_user,
                }
              })
              .catch(err => {
                  	
                  res.status(500).json({msg: "error", details: err});		
                }).then(drawing =>  {
                drawing.update({
                  "name_coverpage" :name
                })
                .catch(err => {
                  	
                  res.status(500).json({msg: "error", details: err});		
                }).then(res.status(200).send([drawing]))
              }); 
    
        });

 
//on valide l'upload
  router.post('/validation_upload_drawing_artbook', function (req, res) {

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

    (async () => {
      const page_number=req.body.page_number;
       const drawing_id= req.body.drawing_id;
         drawing = await Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
              authorid: current_user,
            }
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
           list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              let number_of_drawings=user.number_of_drawings+1;
              user.update({
                "number_of_drawings":number_of_drawings,
              })
            });
            drawing.update({
              "status":"public",
              "pagesnumber":page_number,
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([drawing]))
          }); 
          

    })();
    });


    router.post('/send_drawing_height_artbook', function (req, res) {

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
      let drawing_id=req.body.drawing_id;
      let height=req.body.height;
      Liste_artbook.findOne({
        where:{
          drawing_id:drawing_id,
          authorid:current_user
        }
      }).catch(err => {
        res.status(500).json({msg: "error", details: err});		
      }).then(drawing=>{
        if(drawing){
          drawing.update({
            height:height
          })
          res.status(200).send([drawing]);
        }
        else{
          res.status(200).send([{error:'drawing_not_found'}]);
        }
      })
    })

    

  router.get('/retrieve_drawing_artbook_info_by_pseudo/:pseudo', function (req, res) {

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
          Liste_artbook.findAll({
            where: {
              authorid: user.id,
              status:"public"
            },
            order: [
                ['drawing_id', 'ASC']
              ],
          })
          .catch(err => {
				
            res.status(500).json({msg: "error", details: err});		
          }).then(drawing =>  {
            
            res.status(200).send([drawing]);
            
          }); 
        }
      })
       
   
    });

    router.post('/get_number_of_drawings_artbook', function (req, res) {

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
      let list_of_drawings=[];
      const Op = Sequelize.Op;
      let list_of_ids=[];
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
      Liste_artbook.findAll({
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
		}).then(drawings =>  {
          if(drawings.length>0){
            for(let j=0;j<drawings.length;j++){
             list_of_ids.push(drawings[j].drawing_id)
             list_of_drawings.push(drawings[j])
            }
          }
           res.status(200).send([{number_of_drawings_artbook:drawings.length,list_of_ids:list_of_ids,list_of_drawings:list_of_drawings}]);
         }); 

    });

 
 
    router.get('/retrieve_drawing_artbook_by_id/:drawing_id', function (req, res) {

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

  
  
         const drawing_id= parseInt(req.params.drawing_id);
           Liste_artbook.findOne({
              where: {
                drawing_id: drawing_id,
              }
            })
            .catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(drawing =>  {
              if(drawing){
                res.status(200).send([drawing]);
              }
            }); 
    
      });
      
  router.get('/retrieve_drawing_artbook_by_id2/:drawing_id', function (req, res) {

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

        const drawing_id= parseInt(req.params.drawing_id);
          Liste_artbook.findOne({
            where: {
              drawing_id: drawing_id,
            }
          })
          .catch(err => {
          	
          res.status(500).json({msg: "error", details: err});		
        }).then(drawing =>  {
            if(drawing){
              res.status(200).send([{current_user:current_user,data:[drawing]}]);
            }
          }); 
  
    });

  router.get('/retrieve_drawing_page_ofartbook/:drawing_id/:drawing_page/:width', function (req, res) {

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



      const drawing_id = parseInt(req.params.drawing_id);
      const drawing_page = parseInt(req.params.drawing_page);
      const width = parseInt(req.params.width)-20;
      pages_artbook.findOne({
        where: {
          drawing_id: drawing_id,
          page_number:drawing_page,
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
          let filename = "./data_and_routes/drawings_pages_artbook/" + page.file_name;
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

       
  router.get('/retrieve_drawing_page_ofartbook_artwork/:drawing_id/:drawing_page', function (req, res) {

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



    const drawing_id = parseInt(req.params.drawing_id);
    const drawing_page = parseInt(req.params.drawing_page);

    pages_artbook.findOne({
      where: {
        drawing_id: drawing_id,
        page_number:drawing_page,
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
        let filename = "./data_and_routes/drawings_pages_artbook/" + page.file_name;
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
}

