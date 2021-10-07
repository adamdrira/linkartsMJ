const multer = require('multer');
const fs = require('fs');
const Sequelize = require('sequelize');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const Navbar = require('../../navbar/model/sequelize');
const Notations = require('../../publications_notation/model/sequelize');
const sharp = require('sharp');
var Jimp = require('jimp');
var list_covers_by_id={};



module.exports = (router, Liste_bd_os, pages_bd_os,list_of_users,trendings_contents) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
      
    });
    return user;
  };
  

  router.post('/get_covername_comic', function (req, res) {

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
    let covername=list_covers_by_id[current_user];
    if(covername){
      res.status(200).send([{covername:covername}]);
    }
    else{
      res.status(200).send([{error:"cover_not_found"}]);
    }
    }); 
      

  //var bd_id = 0; // il faut stocker cette valeur dans les cookiers et non ici !!!!!!

  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_bd_oneshot', function (req, res) {

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
    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
      res.status(200).send([r]);
      }); 
        
      
  
    });
    

     //on supprime le fichier de la base de donnée postgresql
     router.delete('/remove_bd_oneshot/:bd_id', function (req, res) {
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
        Liste_bd_os.findOne({
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


   

  router.post('/modify_bd_oneshot', function (req, res) {

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
    const highlight = req.body.highlight;
    const title = req.body.Title;
    const category = req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    const bd_id = req.body.bd_id;

      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
         bd = await Liste_bd_os.findOne({
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
		}).then(res.status(200).send([bd]))
          }); 
          }

    })();
    });

    router.post('/modify_bd_oneshot2', function (req, res) {

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
        
      Liste_bd_os.findOne({
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
              format:"one-shot",
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
              format:"one-shot",
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
              format:"one-shot",
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
              format:"one-shot",
              publication_id:bd_id
            }
          })
          res.status(200).send([bd])
        })
      }); 
            
      });

    router.post('/change_oneshot_comic_status', function (req, res) {

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
      Liste_bd_os.findOne({
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
  });

      router.post('/update_pages_bd_oneshot', function (req, res) {

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
          const number_of_pages=req.body.number_of_pages;
          const bd_id= req.body.bd_id; 
          Liste_bd_os.update({
            "pagesnumber":number_of_pages,
          },
            {
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
        
            res.status(500).json({msg: "error", details: err});		
          }).then(bd =>  {
              res.status(200).send([bd]);
        }); 
          
    });

    router.post('/upload_page_bd_oneshot/:page/:bd_id', function (req, res) {

      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name ='';
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
      upload(req, res, function(err){
        (async () => {
        const page= req.params.page;
        const bd_id = req.params.bd_id;
        if (err) {
          return res.send({
            success: false
          });
      
        } else { 
         
          (async () => {
            let filename = "./data_and_routes/pages_bd_oneshot/" + file_name ;
              const files = await imagemin([filename], {
                destination: './data_and_routes/pages_bd_oneshot',
                plugins: [
                  imageminPngquant({
                    quality:  [0.9, 1]
                })
                ]
              });

              pages_bd_os.create({
                "bd_id": bd_id,
                "author_id": current_user,
                "file_name":file_name,
                "page_number": page
              })
              .catch(err => {
          
              res.status(500).json({msg: "error", details: err});		
              }).then(r =>  {
                  const Op = Sequelize.Op;
                  pages_bd_os.destroy({
                    where: {
                      page_id:{[Op.lt]: r.page_id},
                      page_number:page,
                      bd_id: bd_id,
                      },
                    truncate: false
                  }).catch(err=>{
                    console.log("err")
                    console.log(err)
                  })
                    res.send(r.get({plain:true}));
              }); 

          })();


         
        
        }

      })();
      });
    });


      //on supprime le fichier de la base de donnée postgresql
      router.delete('/remove_page_from_data/:page/:bd_id', function (req, res) {

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
        pages_bd_os.destroy({
          where: {page_number:page, bd_id: bd_id },
          truncate: false
        })
        res.status(200).send([{done:"done"}])
      });

      //on supprime le fichier du dossier date/pages_bd_onshot
      router.delete('/remove_page_from_folder/:name', function (req, res) {

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

        fs.access('./data_and_routes/pages_bd_oneshot' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200).send([{delete:'suppression done'}])
          }
          const name  = req.params.name;
          fs.unlink('./data_and_routes/pages_bd_oneshot/' + name,  function (err) {
            if (err) {
              return res.status(200).send([{delete:'suppression done'}])
            }  
            else {
              return res.status(200).send([{delete:'suppression done'}])
            }
          });
        });
      });


    router.post('/compress_all_comics_thumbnails',function(req,res){
      (async () => {
        const files = await imagemin(['./data_and_routes/covers_bd/*.{png,jpeg,jpg}'], {
          destination: './data_and_routes/covers_bd',
          plugins: [
            imageminPngquant({
              quality:[0.9, 1]
          })
          ]
        });
       
      res.status(200).send([{compressed:"ok"}]);
    })();
    })

    router.post('/upload_cover_bd_oneshot', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name='';
      const PATH2= './data_and_routes/covers_bd';
      var ext='';
      
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
          ext=path.extname(file.originalname)
          cb(null, current_user + '-' + Today + path.extname(file.originalname));
          //enlever nickname
        }
      });
      
      let upload_cover = multer({
        storage: storage2
      }).any();

      upload_cover(req, res, function(err){
        let filename = "./data_and_routes/covers_bd/" + file_name ;
         (async () => {
            const files = await imagemin([filename], {
              destination: './data_and_routes/covers_bd',
              plugins: [
                imageminPngquant({
                  quality:[0.9, 1]
              })
              ]
            });
            list_covers_by_id[current_user]=file_name;
            res.status(200).send([{file_name:file_name}]);
        })();
         
        });
      });

      
      //on ajoute le nom de la coverpage dans la base de donnée
  router.post('/add_cover_bd_oneshot_todatabase', function (req, res) {

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
      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
        Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          }).catch(err => {
            	
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

    });

    router.post('/add_cover_bd_oneshot_todatabase2', function (req, res) {

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
        if (Object.keys(req.body).length === 0 ) {
          return res.send({
            success: false
          });
          
        } else { 
           Liste_bd_os.findOne({
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
      });


      //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
      router.delete('/remove_cover_bd_from_folder/:name', function (req, res) {

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
        fs.access('./data_and_routes/covers_bd/' + req.params.name, fs.F_OK, (err) => {
          if(err){
            return res.status(200).send([{delete:"already_done"}]);
          }
          const name  = req.params.name;
          fs.unlink('./data_and_routes/covers_bd/' + name,  function (err) {
            if (err) {
              
            }  
            else {
              return res.status(200).send([{delete:"done"}]);
            }
          });
        });
      });


  router.post('/validation_upload_bd_oneshot', function (req, res) {

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
       const bd_id= req.body.bd_id;
         bd = await Liste_bd_os.findOne({
            where: {
              bd_id: bd_id,
              authorid: current_user,
            }
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
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
              }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
                bd.update({
                  "status":"public",
                  "pagesnumber":page_number,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([bd]))
              })
            })
            
          }); 
    })();
    });


                   //on valide l'upload
  router.get('/retrieve_bd_by_pseudo/:pseudo', function (req, res) {

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
          Liste_bd_os.findAll({
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
        else{
          res.status(200).send([null]);
        }
      })
  

      
    });

    router.post('/get_number_of_bd_oneshot', function (req, res) {

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
      Liste_bd_os.findAll({
           where: {
             authorid: id_user,
             status:"public",
             createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
           }
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
           res.status(200).send([{number_of_bd_oneshot:bd.length,list_of_ids:list_of_ids,list_of_comics:list_of_comics}]);
         }); 

   });

    router.get('/retrieve_private_oneshot_bd', function (req, res) {

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
      Liste_bd_os.findAll({
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
 
    router.get('/retrieve_bd_by_id/:bd_id', function (req, res) {

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
           Liste_bd_os.findOne({
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
              else{
                res.status(200).send([{status:"deleted"}]);
              }
            }); 
      });
      

      router.get('/retrieve_bd_by_id2/:bd_id', function (req, res) {

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
          Liste_bd_os.findOne({
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
             else{
              res.status(200).send([{current_user:current_user,data:[{status:"deleted"}]}]);
            }
           }); 
     });
    
  router.get('/retrieve_thumbnail_bd_picture/:file_name', function (req, res) {

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
      const file_name = req.params.file_name;
      let filename = "./data_and_routes/covers_bd/" + file_name ;
      let transform = sharp()
      transform = transform.resize(200,268)
      .toFormat('jpeg')
      .jpeg({ quality: 100})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
          else{
            Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
              if (err){
                res.status(404).send({err:"error"});
              }
              else{
                lenna
                .resize(200,268) 
                .quality(100) 
                .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                  if(err){
                    res.status(404).send({err:err});
                  }
                  else{
                    res.status(200).send(buffer);
                  }
                  
                });
              }
              
            });
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

  router.get('/retrieve_thumbnail_bd_picture_artwork/:file_name', function (req, res) {

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
    
    const file_name = req.params.file_name;
    let filename = "./data_and_routes/covers_bd/" + file_name ;

    let transform = sharp()
    transform = transform.resize(320,430)
    .toFormat('jpeg')
    .jpeg({ quality: 100})
    .toBuffer((err, buffer, info) => {
        if (buffer) {
            res.status(200).send(buffer);
        }
        else{
          Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
            if (err){
              res.status(404).send({err:"error"});
            }
            else{
              lenna
              .resize(320,430) 
              .quality(100) 
              .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                if(err){
                  res.status(404).send({err:err});
                }
                else{
                  res.status(200).send(buffer);
                }
                
              });
            }
            
          });
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

router.get('/retrieve_thumbnail_bd_picture_navbar/:file_name', function (req, res) {

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
  const file_name = req.params.file_name;
  let filename = "./data_and_routes/covers_bd/" + file_name ;

  let transform = sharp()
  transform = transform.resize(35,35)
  .toFormat('jpeg')
  .jpeg({ quality: 100})
  .toBuffer((err, buffer, info) => {
      if (buffer) {
          res.status(200).send(buffer);
      }
      else{
        Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
          if (err){
            res.status(404).send({err:"error"});
          }
          else{
            lenna
            .resize(35,35) 
            .quality(100) 
            .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
              if(err){
                res.status(404).send({err:err});
              }
              else{
                res.status(200).send(buffer);
              }
              
            });
          }
          
        });
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

  router.get('/retrieve_bd_oneshot_page/:bd_id/:bd_page/:width', function (req, res) {

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
      const bd_page = parseInt(req.params.bd_page);
      const width = parseInt(req.params.width)-20;
       pages_bd_os.findOne({
        where: {
          bd_id: bd_id,
          page_number:bd_page,
        }
      })
      .catch(err => {	
        res.status(500).json({msg: "error", details: err});		
      }).then(page =>  {

        let transform = sharp()
        transform = transform.resize({fit:sharp.fit.inside,width:width})
        .toFormat('jpeg')
        .jpeg({ quality: 100})
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
            else{
              let filename = "./data_and_routes/not-found-image.jpg";
              Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
                if (err){
                  res.status(404).send({err:"error"});
                }
                else{
                  lenna
                  .resize(width,Jimp.AUTO) 
                  .quality(100) 
                  .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                    if(err){
                      res.status(404).send({err:err});
                    }
                    else{
                      res.status(200).send(buffer);
                    }
                    
                  });
                }
                
              });
            }
        });

        if(page && page.file_name){
          let filename = "./data_and_routes/pages_bd_oneshot/" + page.file_name;

          let transform2 = sharp()
          transform2 = transform2.resize({fit:sharp.fit.inside,width:width})
          .toFormat('jpeg')
          .jpeg({ quality: 100})
          .toBuffer((err, buffer, info) => {
              if (buffer) {
                  res.status(200).send(buffer);
              }
              else{
                Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
                  if (err){
                    res.status(404).send({err:"error"});
                  }
                  else{
                    lenna
                    .resize(width,Jimp.AUTO) 
                    .quality(100) 
                    .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                      if(err){
                        res.status(404).send({err:err});
                      }
                      else{
                        res.status(200).send(buffer);
                      }
                      
                    });
                  }
                  
                });
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
              pp.pipe(transform2)
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

  router.get('/retrieve_bd_oneshot_page_artwork/:bd_id/:bd_page', function (req, res) {

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
    const bd_page = parseInt(req.params.bd_page);
     pages_bd_os.findOne({
      where: {
        bd_id: bd_id,
        page_number:bd_page,
      }
    })
    .catch(err => {	
      res.status(500).json({msg: "error", details: err});		
    }).then(page =>  {

      let transform = sharp()
      transform = transform.resize({fit:sharp.fit.inside,width:266})
      .toFormat('jpeg')
      .jpeg({ quality: 100})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
          else{
            let filename = "./data_and_routes/not-found-image.jpg";
            Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
              if (err){
                res.status(404).send({err:"error"});
              }
              else{
                lenna
                .resize(266,Jimp.AUTO) 
                .quality(100) 
                .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                  if(err){
                    res.status(200).send({err:err});
                  }
                  else{
                    res.status(200).send(buffer);
                  }
                  
                });
              }
              
            });
          }
      });

      if(page && page.file_name){
        let filename = "./data_and_routes/pages_bd_oneshot/" + page.file_name;
        let transform2 = sharp()
        transform2 = transform2.resize({fit:sharp.fit.inside,width:266})
        .toFormat('jpeg')
        .jpeg({ quality: 100})
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
            else{
              Jimp.read(path.join(process.cwd(),filename), (err, lenna) => {
                if (err){
                  res.status(404).send({err:"error"});
                }
                else{
                  lenna
                  .resize(266,Jimp.AUTO) 
                  .quality(100) 
                  .getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
                    if(err){
                      res.status(404).send({err:err});
                    }
                    else{
                      res.status(200).send(buffer);
                    }
                    
                  });
                }
               
              });
            }
        });
        
        fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/not-found-image.jpg";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(transform);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(transform2);
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