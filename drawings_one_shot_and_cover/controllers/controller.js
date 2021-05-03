const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const Navbar = require('../../navbar/model/sequelize');
const Notations = require('../../publications_notation/model/sequelize');
const sharp = require('sharp');
module.exports = (router, drawings_one_page,list_of_users,trendings_contents) => {
  
  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  

  router.get('/get_cookies_cover_drawings', (req, res)=>{ 
    let value = req.cookies
    res.status(200).send([value]);
    }); 
      
  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_drawing_one_page', function (req, res) {

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
          
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.status(200).send([r]);
          }); 
        
      }
  
    });

    
    router.post('/change_oneshot_drawing_status', function (req, res) {

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

          drawings_one_page.findOne({
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
              }
              )
              
          }); 
  });

  router.get('/retrieve_private_oneshot_drawings', function (req, res) {

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
    
         drawings_one_page.findAll({
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
		}).then(drawings =>  {
            res.status(200).send([drawings]);
          }); 
   
  });

    
  router.post('/update_filter_color_drawing_onepage', function (req, res) {

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

    
       drawings_one_page.findOne({
          where: {
            drawing_id: drawing_id,
            authorid:current_user,
          }
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
          drawing.update({
            "thumbnail_color": color
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([drawing]))
        }); 
    
    });

    


  //on modifie les informations du formulaire de la bd qu'on upload
  router.post('/modify_drawing_one_page', function (req, res) {

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
    drawings_one_page.findOne({
            where: {
              drawing_id: drawing_id,
              authorid:current_user,
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

    router.post('/modify_drawing_one_page2', function (req, res) {

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
      drawings_one_page.findOne({
              where: {
                drawing_id: drawing_id,
                authorid:current_user,
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
                  format:"one-shot",
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
                  format:"one-shot",
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
                  format:"one-shot",
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
                  format:"one-shot",
                  publication_id:drawing_id
                }
              })
              res.status(200).send([drawing])
            })
            }); 
            
      });


    //on post l'image uploadée
    router.post('/upload_drawing_onepage/:drawing_id',  function (req, res) {

      
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
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
          (async () => {
            const drawing_id = req.params.drawing_id;
            
            let file_name = "./data_and_routes/covers_drawings/" + drawing_name ;
            
            const files = await imagemin([file_name], {
              destination: './data_and_routes/covers_drawings',
              plugins: [
                imageminPngquant({
                  quality:  [0.85, 0.95]
              })
              ]
            });
           
            
            const drawing = await drawings_one_page.findOne({
                where: {
                  drawing_id: drawing_id,
                  authorid: current_user,
                }
              });
              if(drawing !== null){
                drawing.update({
                    "drawing_name":drawing_name,
                })
                .catch(err => {
                  	
                  res.status(500).json({msg: "error", details: err});		
                }).then(r =>  {
                 res.send(r.get({plain:true}));
                }); 
              }
              else {
                res.status(500).json({msg: "error", details: err});	
              }
            
            

          })();
        });
      });


      


      router.delete('/remove_drawing_from_data/:drawing_id', function (req, res) {
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
        drawings_one_page.findOne({
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

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_drawing_onepage_from_folder/:drawing_name', function (req, res) {

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
        fs.access('./data_and_routes/drawings_one_page' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200)
          }
          const drawing_name  = req.params.drawing_name;
          fs.unlink('./data_and_routes/drawings_one_page/' + drawing_name,  function (err) {
            if (err) {
              return res.status(200)
            }  
            else {
              return res.status(200)
            }
          });
        });
      });

    
      
    router.post('/send_drawing_height_one_shot', function (req, res) {

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
      drawings_one_page.findOne({
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
    
      

    //on ajoute la cover uploadée dans le dossier et on créer un cookie
    router.post('/add_cover_drawing_onepage_tofolder', function (req, res) {

    let current_user = get_current_user(req.cookies.currentUser);
    if(!current_user){
      return res.status(401).json({msg: "error"});
    }
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
            res.status(500).json({msg: "error", details: err});	
        } else {   
            let file_name = "./data_and_routes/covers_drawings/" + filename ;
            (async () => {
                const files = await imagemin([file_name], {
                  destination: './data_and_routes/covers_drawings',
                  plugins: [
                    imageminPngquant({
                      quality: [0.7, 0.8]
                  })
                  ]
                });
              res.status(200).send([{filename:filename}]);
            })();
        }
    });
    

    });


      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_drawing_onepage_todatabase', function (req, res) {

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
    (async () => {


      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
         drawing = await drawings_one_page.findOne({
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
            res.status(200).send([drawing]);
          }); 
          }

    })();
    });


      //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
      router.delete('/remove_cover_drawing_from_folder/:name', function (req, res) {

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
        fs.access('./data_and_routes/covers_drawings/' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200).send([{delete:'suppression done'}])
          }
          const name  = req.params.name;
          fs.unlink('./data_and_routes/covers_drawings/' + name,  function (err) {
            if (err) {
              return res.status(200).send([{delete:'suppression done'}])
            }  
            else {
              return res.status(200).send([{delete:'suppression done'}])
            }
          });
        });
      });

      


      //on valide l'upload
  router.post('/validation_upload_drawing_onepage', function (req, res) {

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
       const drawing_id= req.body.drawing_id;
         drawing = await drawings_one_page.findOne({
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
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([drawing]))
          }); 
    })();
    });

    
  router.get('/retrieve_drawing_onepage_info_by_pseudo/:pseudo', function (req, res) {

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
          drawings_one_page.findAll({
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
           }).then(drawings =>  {
             res.status(200).send([drawings]);
           }); 
        }
        else{
          res.status(200).send([null]);
        }
      })
   

      
    
    });


   router.post('/get_number_of_drawings_oneshot', function (req, res) {

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
    drawings_one_page.findAll({
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
         res.status(200).send([{number_of_drawings_oneshot:drawings.length,list_of_ids:list_of_ids,list_of_drawings:list_of_drawings}]);
       }); 

  });
 
    router.get('/retrieve_drawing_info_onepage_by_id/:drawing_id', function (req, res) {

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
         drawings_one_page.findOne({
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
      

    router.get('/retrieve_drawing_info_onepage_by_id2/:drawing_id', function (req, res) {

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
         drawings_one_page.findOne({
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
    
  router.get('/retrieve_drawing_thumbnail_picture/:file_name', function (req, res) {

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

      let transform = sharp()
      transform = transform.resize({width:200})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
      let filename = "./data_and_routes/covers_drawings/" + req.params.file_name ;
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
  });


  router.get('/retrieve_drawing_thumbnail_picture_artwork/:file_name', function (req, res) {

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

    let transform = sharp()
      transform = transform.resize({width:320})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
    let filename = "./data_and_routes/covers_drawings/" + req.params.file_name ;
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
  });

  router.get('/retrieve_drawing_thumbnail_picture_navbar/:file_name', function (req, res) {

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

    let transform = sharp()
      transform = transform.resize(35,35)
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
    let filename = "./data_and_routes/covers_drawings/" + req.params.file_name ;
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
  });

  router.get('/retrieve_drawing_onepage_by_name/:file_name/:width', function (req, res) {

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
        const width = parseInt(req.params.width)-20;
        let filename = "./data_and_routes/drawings_one_page/" + req.params.file_name;
        let transform = sharp()
        transform = transform.resize({fit:sharp.fit.inside,width:width})
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
        });
        fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/not-found-image.jpg";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            if(width<700){
              not_found.pipe(transform);
            }
            else{
              not_found.pipe(res);
            }
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            if(width<700){
              pp.pipe(transform);
            }
            else{
              pp.pipe(res);
            }
          }     
        })

  });


  router.get('/retrieve_drawing_onepage_by_name_artwork/:file_name', function (req, res) {

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

      let filename = "./data_and_routes/drawings_one_page/" + req.params.file_name;
      let transform = sharp()
      transform = transform.resize({fit:sharp.fit.inside,height:266,width:266})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
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

});



}