const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_ads,list_of_ads_responses,list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


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
                  "status":"public",
                  "refreshment_number":0,
                  "date":today,
        
              })
              .then(r =>  {
              list_of_users.findOne({
                where:{
                  id:current_user,
                }
              }).then(user=>{
                let number_of_ads=user.number_of_ads+1;
                user.update({
                  "number_of_ads":number_of_ads,
                })
              }).then( ()=>{res.status(200).send([r])})
              
              }); 
        
    });
         
    router.post('/upload_thumbnail_ad', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
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
                res.cookie('name_thumbnail_ad', file_name).send(file_name);
              });
    });

    router.post('/add_thumbnail_ad_to_database', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
        
            const name = req.body.name;
            const id = parseInt(req.body.id);
        
            (async () => {
                console.log('infctly');
                  await list_of_ads.findOne({
                    where: {
                      id: id,
                      id_user: current_user,
                    }
                  })
                  .then(ad =>  {
                    ad.update({
                      "thumbnail_name" :name
                    })
                    .then(ad=>{res.status(200).send([ad])})
                  }); 
        
            })();
    });

    router.delete('/remove_thumbnail_ad_from_folder/:name', function (req, res) {
            fs.access('./data_and_routes/thumbnails_ads/' + req.params.name, fs.F_OK, (err) => {
              if(err){
                console.log('suppression already done');
                return res.status(200)
              }
              console.log( 'annulation en cours');
              const name  = req.params.name;
              fs.unlink('./data_and_routes/thumbnails_ads/' + name,  function (err) {
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

    router.get('/get_cookies_thumbnail_ad', (req, res)=>{ 
        console.log('get_cookies_thumbnail_ad');
        let value = req.cookies;
        res.status(200).send([value]);
    });

    router.post('/upload_pictures_ad', function (req, res) {
      
        var id_ad = parseInt(req.headers.id_ad);
        var number_of_pictures_retrieved=0;
        var number_of_pictures=parseInt(req.headers.number_of_pictures);
        var picture_number=parseInt(req.headers.picture_number)+1;
        var current_user = get_current_user(req.cookies.currentUser);
        var file_name='';
        const PATH= './data_and_routes/pictures_ads';
        let storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, PATH);
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
        
        let upload_picture = multer({
          storage: storage
        }).any();

        upload_picture(req, res, function(err){

          function add_number_of_pictures_retrieved(ad){
              for(let i=0;i<5;i++){
                
                if(i==0 && ad.picture_name_one!=null){
                  console.log(ad.dataValues);
                    number_of_pictures_retrieved=number_of_pictures_retrieved+1;
                  
                }
                if(i==1 && ad.picture_name_two!=null){
                  console.log(ad.dataValues);
                    number_of_pictures_retrieved=number_of_pictures_retrieved+1;
                }
                
                if(i==2 && ad.picture_name_three!=null){
                  console.log(ad.dataValues);
                    number_of_pictures_retrieved=number_of_pictures_retrieved+1;
                }
                if(i==3 && ad.picture_name_four!=null){
                  console.log(ad.dataValues);
                    number_of_pictures_retrieved=number_of_pictures_retrieved+1;
                }
                if(i==4 && ad.picture_name_five!=null){
                  console.log(ad.dataValues);
                    number_of_pictures_retrieved=number_of_pictures_retrieved+1;
                }
              }
              console.log(number_of_pictures_retrieved);
          }
          (async () => {
              

              list_of_ads.findOne({
                where: {
                  id: id_ad,
                  id_user: current_user,
                }
              })
              .then(ad =>  {
                if(picture_number==1){
                    ad.update({
                      "picture_name_one" :file_name,
                    })
                    .then(ad=>{
                      add_number_of_pictures_retrieved(ad);
                      if(number_of_pictures_retrieved==number_of_pictures){
                        ad.update({
                          "number_of_pictures":number_of_pictures,
                        })
                        .then(ad=>{res.status(200).send([ad])})
                      }
                      else{
                        res.status(200).send([ad])}
                      }
                      )
                }

                if(picture_number==2){
                  ad.update({
                    "picture_name_two" :file_name,
                  })
                  .then(ad=>{
                    add_number_of_pictures_retrieved(ad);
                    if(number_of_pictures_retrieved==number_of_pictures){
                      ad.update({
                        "number_of_pictures":number_of_pictures,
                      })
                      .then(ad=>{res.status(200).send([ad])})
                    }
                    else{
                      res.status(200).send([ad])}
                    })
                }

                if(picture_number==3){
                  ad.update({
                    "picture_name_three" :file_name,
                  })
                  .then(ad=>{
                    add_number_of_pictures_retrieved(ad);
                    if(number_of_pictures_retrieved==number_of_pictures){
                      ad.update({
                        "number_of_pictures":number_of_pictures,
                      })
                      .then(ad=>{res.status(200).send([ad])})
                    }
                    else{
                      res.status(200).send([ad])}
                    })
                }

                if(picture_number==4){
                  ad.update({
                    "picture_name_four" :file_name,
                  })
                  .then(ad=>{
                    add_number_of_pictures_retrieved(ad);
                    if(number_of_pictures_retrieved==number_of_pictures){
                      ad.update({
                        "number_of_pictures":number_of_pictures,
                      })
                      .then(ad=>{res.status(200).send([ad])})
                    }
                    else{
                      res.status(200).send([ad])}
                    })
                }

                if(picture_number==5){
                  ad.update({
                    "picture_name_five" :file_name,
                  })
                  .then(ad=>{
                    add_number_of_pictures_retrieved(ad);
                    if(number_of_pictures_retrieved==number_of_pictures){
                      ad.update({
                        "number_of_pictures":number_of_pictures,
                      })
                      .then(ad=>{res.status(200).send([ad])})
                    }
                    else{
                      res.status(200).send([ad])}
                    })
                }

              }); 
            })();
          });
      
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
            

            list_of_ads.findOne({
              where: {
                id: id_ad,
                id_user: current_user,
              }
            })
            .then(ad =>  {
              if(attachment_number==1){
                  ad.update({
                    "attachment_name_one" :file_name,
                    "attachment_real_name_one" :name,
                  })
                  .then(ad=>{
                    add_number_of_attachments_retrieved(ad);
                    if(number_of_attachments_retrieved==number_of_attachments){
                      ad.update({
                        "number_of_attachments":number_of_attachments,
                      })
                      .then(ad=>{res.status(200).send([ad])})
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
                .then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .then(ad=>{res.status(200).send([ad])})
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
                .then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .then(ad=>{res.status(200).send([ad])})
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
                .then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .then(ad=>{res.status(200).send([ad])})
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
                .then(ad=>{
                  add_number_of_attachments_retrieved(ad);
                  if(number_of_attachments_retrieved==number_of_attachments){
                    ad.update({
                      "number_of_attachments":number_of_attachments,
                    })
                    .then(ad=>{res.status(200).send([ad])})
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
          .then(ads =>  {
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
         .then(ads =>  {
           res.status(200).send([ads]);
         }); 
   });

   router.get('/get_all_responses/:id_ad', function (req, res) {
    let id_ad = parseInt(req.params.id_ad);
      list_of_ads_responses.findAll({
         where: {
           id_ad: id_ad,
         },
         order: [
             ['createdAt', 'DESC']
           ],
       })
       .then(ads =>  {
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
         .then(ad =>  {
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

    router.delete('/delete_attachment/:id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser); 
          const id = parseInt(req.params.id);
          list_of_ads.findOne({
              where: {
                  id:id,
                  id_user:current_user,
              },
          })
          .then(ad=>{
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).then(user=>{
              let number_of_ads=user.number_of_ads-11;
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
    console.log("chocolat ads");
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
                ['number_of_responses', 'DESC']
              ],
          })
          .then(ad=>{
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
          .then(ad=>{
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
          .then(ad=>{
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
          .then(ad=>{
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
          .then(ad=>{
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
          .then(ad=>{
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
        .then(ad =>  {
        const number = ad.number_of_responses + 1;
        ad.update({
            "number_of_responses":number,
        })})
        .then( ad=>{
          list_of_ads_responses.create({
            "id_ad": id_ad,
            "id_user":current_user,
                "description": description,
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
      .then(ad =>  {
        if(attachment_number==1){
            ad.update({
              "attachment_name_one" :file_name,
              "attachment_real_name_one" :name,
            })
            .then(ad=>{
              add_number_of_attachments_retrieved(ad);
              if(number_of_attachments_retrieved==number_of_attachments){
                ad.update({
                  "number_of_attachments":number_of_attachments,
                })
                .then(ad=>{res.status(200).send([ad])})
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
          .then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .then(ad=>{res.status(200).send([ad])})
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
          .then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .then(ad=>{res.status(200).send([ad])})
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
          .then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .then(ad=>{res.status(200).send([ad])})
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
          .then(ad=>{
            add_number_of_attachments_retrieved(ad);
            if(number_of_attachments_retrieved==number_of_attachments){
              ad.update({
                "number_of_attachments":number_of_attachments,
              })
              .then(ad=>{res.status(200).send([ad])})
            }
            else{
              res.status(200).send([ad])}
            })
        }

      }); 
    })();
  });

});




}