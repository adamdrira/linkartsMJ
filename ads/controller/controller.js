const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
var nodemailer = require('nodemailer');


module.exports = (router, list_of_ads,list_of_ads_responses,list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    

    router.post('/check_if_ad_is_ok', function (req, res) {
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
        console.log(err);	
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
            console.log(price_value);

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
                  "status":"public",
                  "refreshment_number":0,
                  "commentariesnumber":0,
                  "date":today,
        
              })
              .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
              list_of_users.findOne({
                where:{
                  id:current_user,
                }
              }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                let number_of_ads=user.number_of_ads+1;
                user.update({
                  "number_of_ads":number_of_ads,
                })
              }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then( ()=>{res.status(200).send([r])})
              
              }); 
        
    });
         
    router.post('/upload_thumbnail_ad', function (req, res) {
             console.log("upload_thumbnail_ad")
             
            let current_user = get_current_user(req.cookies.currentUser);
            var file_name='';
            console.log(current_user)
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
                      quality: [0.5, 0.6]
                    })
                  ]
                });
                console.log("respond name_thumbnail_ad")
                res.cookie('name_thumbnail_ad', file_name).send([{file_name:file_name}]);
               })();
            });
    });

    router.post('/add_thumbnail_ad_to_database', function (req, res) {
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
                ad.update({
                  "thumbnail_name" :name
                })
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{res.status(200).send([ad])})
              }); 
        
    });

    router.delete('/remove_thumbnail_ad_from_folder/:name', function (req, res) {
      console.log("remove_thumbnail_ad_from_folder")
            fs.access('./data_and_routes/thumbnails_ads/' + req.params.name, fs.F_OK, (err) => {
              if(err){
                console.log('suppression already done');
                return res.status(200).send([{delete:"already_done"}])
              }
              console.log( 'annulation en cours');
              const name  = req.params.name;
              fs.unlink('./data_and_routes/thumbnails_ads/' + name,  function (err) {
                if (err) {
                  console.log(err);
                }  
                else {
                  console.log( 'fichier supprimé');
                  return res.status(200).send([{delete:"done"}]);
                }
              });
            });
    });

    router.get('/get_cookies_thumbnail_ad', (req, res)=>{ 
        console.log('get_cookies_thumbnail_ad');
        let value = req.cookies;
        res.status(200).send([value]);
    });

 


    router.post('/upload_attachments_ad', function (req, res) {
      
      var id_ad = parseInt(req.headers.id_ad);
      console.log(id_ad);
      console.log(req.headers.number_of_attachments);
      console.log(req.headers.file_name);
      console.log(parseInt(req.headers.attachment_number)+1);
      var number_of_attachments_retrieved=0;
      var number_of_attachments=parseInt(req.headers.number_of_attachments);
      var attachment_number=parseInt(req.headers.attachment_number)+1;
      var current_user = get_current_user(req.cookies.currentUser);
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
          console.log(name);
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
                console.log(ad.dataValues);
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
                
              }
              if(i==1 && ad.attachment_name_two!=null){
                console.log(ad.dataValues);
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              
              if(i==2 && ad.attachment_name_three!=null){
                console.log(ad.dataValues);
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              if(i==3 && ad.attachment_name_four!=null){
                console.log(ad.dataValues);
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
              if(i==4 && ad.attachment_name_five!=null){
                console.log(ad.dataValues);
                  number_of_attachments_retrieved=number_of_attachments_retrieved+1;
              }
            }
            console.log(number_of_attachments_retrieved);
        }
        (async () => {
            console.log(file_name)
            console.log(path.extname(file_name))
            if(path.extname(file_name)==".jpg" || path.extname(file_name)==".png" || path.extname(file_name)==".jpeg"){
              let filename = "./data_and_routes/attachments_ads/" + file_name ;
              const files = await imagemin([filename], {
                destination: './data_and_routes/attachments_ads',
                plugins: [
                  imageminPngquant({
                    quality: [0.5, 0.6]
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
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
              }).then(ad =>  {
              if(attachment_number==1){
                  ad.update({
                    "attachment_name_one" :file_name,
                    "attachment_real_name_one" :name,
                  })
                  .catch(err => {
                    console.log(err);	
                    res.status(500).json({msg: "error", details: err});		
                  }).then(ad=>{
                    add_number_of_attachments_retrieved(ad);
                    if(number_of_attachments_retrieved==number_of_attachments){
                      ad.update({
                        "number_of_attachments":number_of_attachments,
                      })
                      .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
            res.status(200).send([ads]);
          }); 
    });

    

    router.get('/get_all_my_ads', function (req, res) {
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
           res.status(200).send([ads]);
         }); 
   });

   router.get('/get_all_responses/:id_ad', function (req, res) {
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
         res.status(200).send([ads]);
       }); 
 });

    

    router.get('/retrieve_ad_by_id/:id', function (req, res) {
      const id= parseInt(req.params.id);
        list_of_ads.findOne({
           where: {
             id: id,
           },
         })
         .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
           res.status(200).send([ad]);
         }); 
   });

    router.get('/retrieve_ad_thumbnail_bd_picture/:file_name', function (req, res) {
      (async () => {
        const file_name = req.params.file_name;
        let filename = "./data_and_routes/thumbnails_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          res.status(200).send(data);
        });
        })();
    });

    router.get('/retrieve_ad_picture/:file_name', function (req, res) {
      (async () => {
        const file_name = req.params.file_name;
        let filename = "./data_and_routes/pictures_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          res.status(200).send(data);
        });
        })();
    });

    router.get('/retrieve_ad_attachment/:file_name', function (req, res) {
      (async () => {
        const file_name = req.params.file_name;
        let filename = "./data_and_routes/attachments_ads/" + file_name ;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          res.status(200).send(data);
        });
        })();
    });

    router.delete('/delete_ad/:id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser); 
          const id = parseInt(req.params.id);
          list_of_ads.findOne({
              where: {
                  id:id,
                  id_user:current_user,
              },
          })
          .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
			console.log(err);	
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

  router.get('/get_sorted_ads/:remuneration/:type_of_project/:author/:target/:sorting', function (req, res) {
    console.log("get_sorted_ads ads");
      const remuneration = req.params.remuneration;
      const type_of_project = req.params.type_of_project;
      const author = req.params.author;
      const target = req.params.target;
      const sorting = req.params.sorting;
      console.log((type_of_project != "none") ? type_of_project:"none");
      console.log((author != "none") ? author:"none");
      console.log((target != "none") ? target:"none");
      console.log(sorting);
      console.log(author);
      console.log(remuneration);
      console.log(type_of_project);
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
			console.log(err);	
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
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
      }
      else{
        console.log("here")
        if(sorting=="pertinence"){
          list_of_ads.findAll({
            where: {
              type_of_project: (type_of_project != "none") ? type_of_project: {[Op.ne]:"none"},
              my_description: (author != "none") ? author: {[Op.ne]:"none"},
              [Op.or]: [{ target_one: (target != "none") ? target: {[Op.ne]:"none"}, }, { target_two: (target != "none") ? target: {[Op.ne]:"none"},}],
              status:"public",
              remuneration: {[Op.ne]:true}
              
            },
            order: [
                ['number_of_responses', 'DESC']
              ],
          })
          .catch(err => {
			console.log(err);	
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
              remuneration: {[Op.ne]:true}
            },
            order: [
                ['date', 'DESC']
              ],
          })
          .catch(err => {
			console.log(err);	
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
              remuneration: {[Op.ne]:true}
            },
            order: [
                ['date', 'ASC']
              ],
          })
          .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            res.status(200).send([ad]);});
        }
      }
      
  });


  router.post('/add_ad_response', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    const id_ad = req.body.id_ad;
    const description = req.body.description;
    list_of_ads.findOne({
        where: {
            id: id_ad,
        }
        })
        .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
        const number = ad.number_of_responses + 1;
        ad.update({
            "number_of_responses":number,
        })})
        .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then( ad=>{
          list_of_ads_responses.create({
            "id_ad": id_ad,
            "status":"public",
            "id_user":current_user,
                "description": description,
            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(adr=>{
                res.status(200).send([adr]);
        })
        } );
});




router.post('/upload_attachments_ad_response', function (req, res) {

var id_ad_response = parseInt(req.headers.id_ad_response);
var number_of_attachments_retrieved=0;
var number_of_attachments=parseInt(req.headers.number_of_attachments);
var attachment_number=parseInt(req.headers.attachment_number)+1;
var current_user = get_current_user(req.cookies.currentUser);
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
    console.log(name);
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
          console.log(ad.dataValues);
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
          
        }
        if(i==1 && ad.attachment_name_two!=null){
          console.log(ad.dataValues);
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        
        if(i==2 && ad.attachment_name_three!=null){
          console.log(ad.dataValues);
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        if(i==3 && ad.attachment_name_four!=null){
          console.log(ad.dataValues);
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
        if(i==4 && ad.attachment_name_five!=null){
          console.log(ad.dataValues);
            number_of_attachments_retrieved=number_of_attachments_retrieved+1;
        }
      }
      console.log(number_of_attachments_retrieved);
  }
  (async () => {
      

      list_of_ads_responses.findOne({
        where: {
          id: id_ad_response,
          id_user: current_user,
        }
      })
      .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
        if(attachment_number==1){
            ad.update({
              "attachment_name_one" :file_name,
              "attachment_real_name_one" :name,
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
              add_number_of_attachments_retrieved(ad);
              if(number_of_attachments_retrieved==number_of_attachments){
                ad.update({
                  "number_of_attachments":number_of_attachments,
                })
                .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
			console.log(err);	
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .catch(err => {
			console.log(err);	
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
  console.log("get_number_of_ads_and_responses")
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads =>  {
      console.log(ads.length + "ads length")
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(resp =>  {
            compt++;
            number_of_ads_answers+=resp.length;
            if(compt==ads.length){
              console.log("compt end ads")
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
  console.log("send_email_for_ad_answer")
  const user_name = req.body.user_name;
  const ad_id = req.body.ad_id;
  const author_id = req.body.author_id;
  const title= req.body.title;
  console.log(user_name)
  console.log(ad_id)
  console.log(author_id)
  console.log(title)
  list_of_users.findOne({
    where:{
      id:author_id
    }
  }).then(user=>{
    if(user){
        console.log("user found")
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
  
      var mailOptions = {
          from: 'Linkarts <services@linkarts.fr>', // sender address
          to: user.email, // my mail
          //cc:"adam.drira@etu.emse.fr",
          subject: `Réponse à une annonce`, // Subject line
          //text: 'plain text', // plain text body
          html:  `<p>${user_name} a répondu à votre annonce : ${title}</p>
          <p><a href="http://localhost:4200/ad-page/${title}/${ad_id}"> Cliquer ici pour consulter l'annonce</a></p>`, // html body
          // attachments: params.attachments
      };
  
      transport.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log('Error while sending mail: ' + error);
              res.status(200).send([{error:error}])
          } else {
              console.log('Message sent: %s', info.messageId);
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