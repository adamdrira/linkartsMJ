const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
var nodemailer = require('nodemailer');
var list_covers_by_id={};
module.exports = (router, list_of_ads,list_of_ads_responses,list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    router.post('/check_if_ad_is_ok', function (req, res) {

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
      const Op = Sequelize.Op;
      var today = new Date();
      today.setDate(today.getDate() - 8);
      const type_of_project = req.body.type_of_project;
      const my_description = req.body.my_description;
      const targets = req.body.targets;

      list_of_ads.findOne({
        where:{
          id_user:current_user,
          status:"public",
          createdAt: {[Op.gte]: today},
          type_of_project:type_of_project,
          my_description:my_description,
          [Op.or]: [{ target_one: {[Op.in]:targets} }, { target_two: {[Op.in]:targets}}],
        }
      }).catch(err => {
        	
        res.status(500).json({msg: "error", details: err});		
      }).then(ad=>{
        if(ad){
          res.status(200).send([{result:ad}])
        }
        else{
          res.status(200).send([{result:"ok"}])
        }
      })
    })

    router.post('/add_primary_information_ad', function (req, res) {
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

      var today = new Date();
  
      const description = req.body.description;
      const title = req.body.title;
      const location = req.body.location;
      const type_of_project = req.body.type_of_project;
      const my_description = req.body.my_description;
      const targets = req.body.targets;
      const remuneration = req.body.remuneration;
      const price_value = req.body.price_value;
      const price_type = req.body.price_type;
      const service = req.body.service;
      const offer_or_demand = req.body.offer_or_demand;
      const price_value_service = req.body.price_value_service;
      const price_type_service = req.body.price_type_service;

      list_of_ads.create({
            "id_user": current_user,
            "title":title,
            "type_of_project": type_of_project,
            "description":description,
            "location":location,
            "my_description": my_description,
            "target_one": targets[0],
            "target_two": targets[1],
            "number_of_pictures":0,
            "number_of_attachments":0,
            "number_of_responses":0,
            "remuneration":remuneration,
            "price_value":price_value,
            "price_type":price_type,
            "service":service,
            "price_value_service":price_value_service,
            "price_type_service":price_type_service,
            "status":"public",
            "refreshment_number":0,
            "commentariesnumber":0,
            "offer_or_demand":offer_or_demand,
            "date":today,
  
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
              list_of_users.findOne({
                where:{
                  id:current_user,
                }
              }).catch(err => {
                
              res.status(500).json({msg: "error", details: err});		
            }).then(user=>{
                let number_of_ads=user.number_of_ads+1;
                user.update({
                  "number_of_ads":number_of_ads,
                })
              }).catch(err => {
				
            res.status(500).json({msg: "error", details: err});		
          }).then( ()=>{res.status(200).send([r])})
              
              }); 
        
    });

    router.post('/edit_primary_information_ad', function (req, res) {
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

  
      const ad_id = req.body.ad_id;
      const description = req.body.description;
      const title = req.body.title;
      const location = req.body.location;
      const remuneration = req.body.remuneration;
      const price_value = req.body.price_value;
      const price_type = req.body.price_type;
      const service = req.body.service;
      const offer_or_demand = req.body.offer_or_demand;
      const price_value_service = req.body.price_value_service;
      const price_type_service = req.body.price_type_service;

      list_of_ads.findOne({
        where:{
          id_user: current_user,
          id:ad_id,
        }
      })
      .catch(err => {

        res.status(500).json({msg: "error", details: err});		
        }).then(r =>  {
          if(r){
            r.update({
              "title":title,
              "description":description,
              "location":location,
              "remuneration":remuneration,
              "price_value":price_value,
              "price_type":price_type,
              "service":service,
              "price_value_service":price_value_service,
              "price_type_service":price_type_service,
              "status":"public",
              "offer_or_demand":offer_or_demand,
            }).then(ad=>{
              res.status(200).send([ad])
            })
          }
          else{
            res.status(200).send([{"reload":reload}])
          }
          
        
    }); 
  
  });
         
    router.post('/upload_thumbnail_ad', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name='';
      const PATH2= './data_and_routes/thumbnails_ads';
      let storage = multer.diskStorage({
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
          
        }
      });
      
      let upload_cover = multer({
        storage: storage
      }).any();

      upload_cover(req, res, function(err){
        let filename = "./data_and_routes/thumbnails_ads/" + file_name ;
        (async () => {
          const files = await imagemin([filename], {
            destination: './data_and_routes/thumbnails_ads',
            plugins: [
              imageminPngquant({
                quality: [0.7, 0.8]
            })
            ]
          });
          list_covers_by_id[current_user]=file_name;
          res.status(200).send([{file_name:file_name}]);
          })();
      });
    });

    router.post('/add_thumbnail_ad_to_database', function (req, res) {

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
            const id = req.body.id;
            list_of_ads.findOne({
                where: {
                  id: id,
                  id_user: current_user,
                }
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
                ad.update({
                  "thumbnail_name" :name
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
              }); 
        
    });

    router.delete('/remove_thumbnail_ad_from_folder/:name', function (req, res) {

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
            fs.access('./data_and_routes/thumbnails_ads/' + req.params.name, fs.F_OK, (err) => {
              if(err){
                return res.status(200).send([{delete:"already_done"}])
              }
              const name  = req.params.name;
              fs.unlink('./data_and_routes/thumbnails_ads/' + name,  function (err) {
                if (err) {
                  
                }  
                else {
                  return res.status(200).send([{delete:"done"}]);
                }
              });
            });
    });

    router.get('/get_thumbnail_ad_name', (req, res)=>{ 
        let current_user = get_current_user(req.cookies.currentUser);
        let covername=list_covers_by_id[current_user];
        if(covername){
          res.status(200).send([{name_thumbnail_ad:covername}]);
        }
        else{
          res.status(200).send([{error:"cover_not_found"}]);
        }
    });

 


    router.post('/upload_attachments_ad/:attachment_number/:id_ad/:file_name/:number_of_attachments', function (req, res) {

      
      var id_ad = parseInt(req.params.id_ad);
      var number_of_attachments_retrieved=0;
      var number_of_attachments=parseInt(req.params.number_of_attachments);
      var attachment_number=parseInt(req.params.attachment_number)+1;
      var current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name='';
      var name='';
      const PATH= './data_and_routes/attachments_ads';
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH);
        },
      
        filename: (req, file, cb) => {
          name= file.originalname;
          name = name.substring(0,name.indexOf('.'));
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

        function add_number_of_attachments_retrieved(ad){
            for(let i=0;i<5;i++){
              
              if(i==0 && ad.attachment_name_one!=null){
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
                
              }
              if(i==1 && ad.attachment_name_two!=null){
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              
              if(i==2 && ad.attachment_name_three!=null){
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              if(i==3 && ad.attachment_name_four!=null){
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              if(i==4 && ad.attachment_name_five!=null){
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
            }
        }
        (async () => {
            if(path.extname(file_name)==".jpg" || path.extname(file_name)==".png" || path.extname(file_name)==".jpeg"){
              let filename = "./data_and_routes/attachments_ads/" + file_name ;
              const files = await imagemin([filename], {
                destination: './data_and_routes/attachments_ads',
                plugins: [
                  imageminPngquant({
                    quality: [0.7, 0.8]
                })
                ]
              });
            }
            

            list_of_ads.findOne({
              where: {
                id: id_ad,
                id_user: current_user,
              }
            })
            .catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
              }).then(ad =>  {
              if(attachment_number==1){
                  ad.update({
                    "attachment_name_one" :file_name,
                    "attachment_real_name_one" :name,
                  })
                  .catch(err => {
                    	
                    res.status(500).json({msg: "error", details: err});		
                  }).then(ad=>{
                    add_number_of_attachments_retrieved(ad);
                    if(number_of_attachments_retrieved==number_of_attachments){
                      ad.update({
                        "number_of_attachments":number_of_attachments,
                      })
                      .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
                    }
                    else{
                      res.status(200).send([ad])}
                    }
                    )
              }

              if(attachment_number==2){
                ad.update({
                  "attachment_name_two" :file_name,
                  "attachment_real_name_two" :name,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
                  }
                  else{
                    res.status(200).send([ad])}
                  })
              }

              if(attachment_number==3){
                ad.update({
                  "attachment_name_three" :file_name,
                  "attachment_real_name_three" :name,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
                  }
                  else{
                    res.status(200).send([ad])}
                  })
              }

              if(attachment_number==4){
                ad.update({
                  "attachment_name_four" :file_name,
                  "attachment_real_name_four" :name,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
                  }
                  else{
                    res.status(200).send([ad])}
                  })
              }

              if(attachment_number==5){
                ad.update({
                  "attachment_name_five" :file_name,
                  "attachment_real_name_five" :name,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
                  }
                  else{
                    res.status(200).send([ad])}
                  })
              }

            }); 
          })();
        });
    
  });


  router.get('/get_ads_by_user_id/:user_id', function (req, res) {

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
       const user_id= parseInt(req.params.user_id);
         list_of_ads.findAll({
            where: {
              id_user: user_id,
              status:"public"
            },
            order: [
                ['date', 'DESC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
            res.status(200).send([ads]);
          }); 
    });

    

    router.get('/get_all_my_ads', function (req, res) {

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
        list_of_ads.findAll({
           where: {
             id_user: current_user,
             status:"public"
           },
           order: [
               ['date', 'DESC']
             ],
         })
         .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
           res.status(200).send([ads]);
         }); 
   });

   router.get('/get_all_responses/:id_ad', function (req, res) {

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
    let id_ad = parseInt(req.params.id_ad);
      list_of_ads_responses.findAll({
         where: {
           id_ad: id_ad,
           status:"public",
         },
         order: [
             ['createdAt', 'DESC']
           ],
       })
       .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
         res.status(200).send([ads]);
       }); 
 });

    

 

  router.post('/check_if_ad_answered', function (req, res) {

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
    const id_ad= req.body.ad_id;
    let current_user = get_current_user(req.cookies.currentUser); 
      list_of_ads_responses.findOne({
        where: {
          id_ad: id_ad,
          id_user:current_user
        },
      })
      .catch(err => {
    	
    res.status(500).json({msg: "error", details: err});		
  }).then(ad =>  {
        if(ad){
          res.status(200).send([{answered:true}]);
        }
        else{
          res.status(200).send([{answered:false}]);
        }
        
      }); 
  });

    router.get('/retrieve_ad_by_id/:id', function (req, res) {

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
      const id= parseInt(req.params.id);
        list_of_ads.findOne({
           where: {
             id: id,
           },
         })
         .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
           res.status(200).send([ad]);
         }); 
   });

    router.get('/retrieve_ad_thumbnail_picture/:file_name', function (req, res) {

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
        let filename = "./data_and_routes/thumbnails_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          
          if(e){
            let filename = "./data_and_routes/not-found-image.jpg";
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            } );
          }
          else{
            res.status(200).send(data);
          }
          
        });

    });

    router.get('/retrieve_ad_picture/:file_name', function (req, res) {

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
        let filename = "./data_and_routes/pictures_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          if(e){
            let filename = "./data_and_routes/not-found-image.jpg";
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            } );
          }
          else{
            res.status(200).send(data);
          }
          
        });
    });

    router.get('/retrieve_ad_attachment/:file_name', function (req, res) {

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
        let filename = "./data_and_routes/attachments_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          if(e){
            let filename = "./data_and_routes/file-not-found.pdf";
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            } );
          }
          else{
            res.status(200).send(data);
          }
         
        });
    });

    router.delete('/delete_ad/:id', function (req, res) {

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
          const id = parseInt(req.params.id);
          list_of_ads.findOne({
              where: {
                  id:id,
                  id_user:current_user,
              },
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              let number_of_ads=user.number_of_ads-1;
              user.update({
                "number_of_ads":number_of_ads,
              })
            })
            ad.update({
                  "status": "deleted"
              });
              res.status(200).send([ad]);
            });
  });

  router.post('/get_sorted_ads_linkcollab', function (req, res) {
      
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
    const remuneration = req.body.remuneration;
    const service = req.body.service;
    const offer_or_demand = req.body.offer_or_demand;
    const type_of_remuneration = req.body.type_of_remuneration;
    const type_of_service = req.body.type_of_service;
    const offset = req.body.offset;
    const type_of_project = req.body.type_of_project;
    const author = req.body.author;
    const target = req.body.target;
    const sorting = req.body.sorting;
    const Op = Sequelize.Op;
    let number_of_ads=0;
    let ads_to_look_for={}
    let order_to_look_for=[]
    if(remuneration){
      //collab rémunérés
      ads_to_look_for={
        type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
        my_description: (author != "none") ? author: {[Op.ne]:"none"},
        price_type: (type_of_remuneration != "none") ? type_of_remuneration: {[Op.ne]:"none"},
        [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"} }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
        status:"public",
        remuneration: true,
        service: {[Op.not]:true}
        
      };

      if(sorting=="pertinence"){
        order_to_look_for=[
          ['number_of_responses', 'DESC'],
          ['createdAt', 'DESC'],
        ]
      }
      else if(sorting=="récent"){
        order_to_look_for=[
          ['date', 'DESC']
        ]
      }
      else if(sorting=="ancient"){
        order_to_look_for=[
          ['date', 'ASC']
        ]
      }
      else if(sorting=="croissant"){
        order_to_look_for=[
          [ Sequelize.cast(Sequelize.col('price_value'), 'BIGINT') , 'ASC' ]
        ]
      }
      else if(sorting=="décroissant"){
        order_to_look_for=[
          [ Sequelize.cast(Sequelize.col('price_value'), 'BIGINT') , 'DESC' ]
        ]
      }
      
      
    }
    else if(service){
      // produits ou services
      ads_to_look_for={
        type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
        my_description: (author != "none") ? author: {[Op.ne]:"none"},
        price_type_service: (type_of_service != "none") ? type_of_service: {[Op.ne]:"none"},
        offer_or_demand: (offer_or_demand != "none") ? offer_or_demand: {[Op.ne]:"none"},
        [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"} }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
        status:"public",
        remuneration: {[Op.not]:true},
        service: true
        
      };

      if(sorting=="pertinence"){
        order_to_look_for=[
          ['number_of_responses', 'DESC'],
          ['createdAt', 'DESC'],
        ]
      }
      else if(sorting=="récent"){
        order_to_look_for=[
          ['date', 'DESC']
        ]
      }
      else if(sorting=="ancient"){
        order_to_look_for=[
          ['date', 'ASC']
        ]
      }
      else if(sorting=="croissant"){
        order_to_look_for=[
          [ Sequelize.cast(Sequelize.col('price_value_service'), 'BIGINT') , 'ASC' ]
        ]
      }
      else if(sorting=="décroissant"){
        order_to_look_for=[
          [ Sequelize.cast(Sequelize.col('price_value_service'), 'BIGINT') , 'DESC' ]
        ]
      }
    }
    else{
      //benevoles
      ads_to_look_for={
        type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
        my_description: (author != "none") ? author: {[Op.ne]:"none"},
        [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"} }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
        status:"public",
        remuneration: {[Op.not]:true},
        service: {[Op.not]:true}
        
      };

      if(sorting=="pertinence"){
        order_to_look_for=[
          ['number_of_responses', 'DESC'],
          ['createdAt', 'DESC'],
        ]
      }
      else if(sorting=="récent"){
        order_to_look_for=[
          ['date', 'DESC']
        ]
      }
      else if(sorting=="ancient"){
        order_to_look_for=[
          ['date', 'ASC']
        ]
      }
    }

    list_of_ads.count({
      where:ads_to_look_for,
    }).catch(err => {
      res.status(500).json({msg: "error", details: err});		
    }).then(number=>{
      if(number){
        number_of_ads=number;
        list_of_ads.findAll({
          where: ads_to_look_for,
          order: order_to_look_for,
          limit:5,
          offset:offset
        })
        .catch(err => {
          	
          res.status(500).json({msg: "error", details: err});		
        }).then(results=>{
          res.status(200).send([{number_of_ads:number_of_ads,results:results}]);
        });
      }
      else{
        res.status(200).send([{number_of_ads:number_of_ads,results:[]}]);
      }
    });

   
      
  });

  router.get('/get_sorted_ads/:remuneration/:type_of_project/:author/:target/:sorting', function (req, res) {

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
      const remuneration = req.params.remuneration;
      const type_of_project = req.params.type_of_project;
      const author = req.params.author;
      const target = req.params.target;
      const sorting = req.params.sorting;
      const Op = Sequelize.Op;
      if(remuneration=='true'){
        if(sorting=="pertinence"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"} }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: true
              
            },
            order: [
                ['number_of_responses', 'DESC'],
                ['createdAt', 'DESC'],
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
  
        else if(sorting=="récent"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: true
            },
            order: [
                ['date', 'DESC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
  
        else if(sorting=="ancient"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: true
            },
            order: [
                ['date', 'ASC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
      }
      else{
        if(sorting=="pertinence"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: {[Op.not]:true}
              
            },
            order: [
                ['number_of_responses', 'DESC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
  
        else if(sorting=="récent"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: {[Op.not]:true}
            },
            order: [
                ['date', 'DESC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
  
        else if(sorting=="ancient"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: {[Op.not]:true}
            },
            order: [
                ['date', 'ASC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
      }
      
  });


  router.post('/add_ad_response', function (req, res) {

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
    const id_ad = req.body.id_ad;
    const description = req.body.description;
    list_of_ads.findOne({
        where: {
            id: id_ad,
        }
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
        const number = ad.number_of_responses + 1;
        ad.update({
            "number_of_responses":number,
        })})
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then( ad=>{
          list_of_ads_responses.create({
            "id_ad": id_ad,
            "status":"public",
            "id_user":current_user,
                "description": description,
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(adr=>{
                res.status(200).send([adr]);
        })
        } );
});





router.post('/check_if_response_sent', function (req, res) {
  
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
    const id_ad = req.body.id_ad;
    list_of_ads_responses.findOne({
        where: {
            id: id_ad,
            id_user:current_user,
        }
        })
        .catch(err => {
          res.status(500).json({msg: "error", details: err});		
        }).then(response =>  {
          	if(response){
              res.status(200).json([{response:response}]);
            }
            else{
              res.status(200).json([{msg:"not found"}]);		
            }
        })
     
  });

router.post('/upload_attachments_ad_response/:attachment_number/:id_ad_response/:file_name/:number_of_attachments', function (req, res) {


  var id_ad_response = parseInt(req.params.id_ad_response);
  var number_of_attachments_retrieved=0;
  var number_of_attachments=parseInt(req.params.number_of_attachments);
  var attachment_number=parseInt(req.params.attachment_number)+1;
  var current_user = get_current_user(req.cookies.currentUser);
  if(!current_user){
    return res.status(401).json({msg: "error"});
  }
  var file_name='';
  var name='';
  const PATH= './data_and_routes/attachments_ads';
  let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },

  filename: (req, file, cb) => {
    name= file.originalname;
    name = name.substring(0,name.indexOf('.'));
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

  function add_number_of_attachments_retrieved(ad){
      for(let i=0;i<5;i++){
        
        if(i==0 && ad.attachment_name_one!=null){
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
          
        }
        if(i==1 && ad.attachment_name_two!=null){
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        
        if(i==2 && ad.attachment_name_three!=null){
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        if(i==3 && ad.attachment_name_four!=null){
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        if(i==4 && ad.attachment_name_five!=null){
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
      }
  }
  (async () => {
      

      list_of_ads_responses.findOne({
        where: {
          id: id_ad_response,
          id_user: current_user,
        }
      })
      .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
        if(attachment_number==1){
            ad.update({
              "attachment_name_one" :file_name,
              "attachment_real_name_one" :name,
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
              add_number_of_attachments_retrieved(ad);
              if(number_of_attachments_retrieved==number_of_attachments){
                ad.update({
                  "number_of_attachments":number_of_attachments,
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
              }
              else{
                res.status(200).send([ad])}
              }
              )
        }

        if(attachment_number==2){
          ad.update({
            "attachment_name_two" :file_name,
            "attachment_real_name_two" :name,
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
            }
            else{
              res.status(200).send([ad])}
            })
        }

        if(attachment_number==3){
          ad.update({
            "attachment_name_three" :file_name,
            "attachment_real_name_three" :name,
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
            }
            else{
              res.status(200).send([ad])}
            })
        }

        if(attachment_number==4){
          ad.update({
            "attachment_name_four" :file_name,
            "attachment_real_name_four" :name,
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
            }
            else{
              res.status(200).send([ad])}
            })
        }

        if(attachment_number==5){
          ad.update({
            "attachment_name_five" :file_name,
            "attachment_real_name_five" :name,
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
            }
            else{
              res.status(200).send([ad])}
            })
        }

      }); 
    })();
  });

});





router.post('/get_number_of_ads_and_responses', function (req, res) {

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
  let id_user = req.body.id_user;
  let number_of_ads_answers=0;
  let list_of_ads_ids=[];
  let date_format=req.body.date_format;
  const Op = Sequelize.Op;
  let date=new Date();

  if(date_format==0){
    date.setDate(date.getDate() - 8);
  }
  else if(date_format==1){
      date.setDate(date.getDate() - 30);
  }
  if(date_format==2){
    date.setDate(date.getDate() - 365);
  }

  list_of_ads.findAll({
      where: {
        id_user: id_user,
        status:"public",
        createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })
    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
      if(ads.length>0 ){
        let compt=0;
        for(let i=0;i<ads.length;i++){
          list_of_ads_ids.push(ads[i].id)
          list_of_ads_responses.findAll({
            where: {
              id_ad: ads[i].id
            }
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(resp =>  {
            compt++;
            number_of_ads_answers+=resp.length;
            if(compt==ads.length){
              res.status(200).send([{number_of_ads:ads.length,number_of_ads_answers:number_of_ads_answers,list_of_ads_ids:list_of_ads_ids}]);
            }
            
          });
        }
         
      }
      else{
        res.status(200).send([{number_of_ads:0,number_of_ads_answers:0,list_of_ads_ids:null}]);
      }
      
      
    }); 
});




router.post('/send_email_for_ad_answer', function (req, res) {
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
  const user_name = req.body.user_name;
  const ad_id = req.body.ad_id;
  const author_id = req.body.author_id;
  const title= req.body.title;
  list_of_users.findOne({
    where:{
      id:author_id
    }
  }).then(user=>{
    if(user){
        const transport = nodemailer.createTransport({
          host: "pro2.mail.ovh.net",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "services@linkarts.fr", // compte expéditeur
            pass: "Le-Site-De-Mokhtar-Le-Pdg" // mot de passe du compte expéditeur
          },
              tls:{
                ciphers:'SSLv3'
          }
        });
  
        let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
          mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
            mail_to_send+=`
            <table style="width:100%;margin-bottom:20px">
                <tr id="tr1">
                    <td align="center" style="padding-top:25px;padding-bottom:15px;text-align:center;">
                        <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3.svg" height="36" width="36" style="margin:auto auto;height:36px;width:36px;max-height: 36px;max-width:36px" />
                    </td>
                </tr>


                <tr id="tr2" >
                    <td  align="center" style="background: rgb(2, 18, 54)">
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                        <div style="height:1px;width:20px;background:white;"></div>
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Réponse à une annonce</p>
                    </td>
                </tr>
            </table>`;

            let name = user.firstname + ' ' + user.lastname;
            let start=''
            if(user.gender=="Homme"){
              start=`Cher ${name},`
            }
            else if(user.gender=="Femme"){
              start=`Chère ${name},</p>`
            }
            else if(user.gender=="Groupe"){
              start=`Chers membres du groupe ${name},`
            }

            mail_to_send+=`
            <table style="width:100%;margin:25px auto;">
              <tr id="tr3">

                  <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${user_name} a répondu à votre annonce : <b> ${title}</b>.</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez consulter votre annonce et les réponses la concernant en cliquant sur le bouton ci-dessous : </p>

                      <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <a href="https://www.linkarts.fr/ad-page/${title}/${ad_id}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                              Consulter mon annonce
                          </a>
                      </div>

                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Très sincèrement,</br>L'équipe LinkArts</p>
                      <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3-18-01.svg" height="20" style="height:20px;max-height: 20px;float: left;" />
                  </td>

              </tr>
            </table>`

            mail_to_send+=`
            <table style="width:100%;margin:25px auto;">
                <tr id="tr4">
                    <td align="center">
                        <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                        <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
                    </td>

                </tr>
            </table>`

        mail_to_send+='</div>'
        mail_to_send+='</div>'
        var mailOptions = {
            from: 'Linkarts <services@linkarts.fr>', // sender address
            //to: user.email, // my mail
            to: "appaloosa-adam@hotmail.fr",
            subject: `Réponse à une annonce`, // Subject line
            //text: 'plain text', // plain text body
            html:  mail_to_send, // html body
            // attachments: params.attachments
        };
    
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(200).send([{error:error}])
            } else {
                res.status(200).send([{sent:'Message sent ' + info.messageId }])
            }
            

        })

    }
    else{
      res.status(200).send([{error:"error"}])
    }

  })
 
});
}