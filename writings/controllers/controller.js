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
var list_of_covers={};
var list_of_writings ={};

module.exports = (router, Liste_Writings,list_of_users,trendings_contents) => {

  function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };

  router.post('/get_covername_writing', (req, res)=>{ 
    let current_user = get_current_user(req.cookies.currentUser);
    let covername =list_of_covers[current_user]
    if(covername){
      res.status(200).send([{covername:covername}]);
    }
    else{
      res.status(200).send([{error:"error_not_found"}]);
    }
   
  }); 

  router.post('/get_writing_name', (req, res)=>{ 
    let current_user = get_current_user(req.cookies.currentUser);
    let name_writing =list_of_writings[current_user]
    if(name_writing){
      res.status(200).send([{name_writing:name_writing}]);
    }
    else{
      res.status(200).send([{error:"error_not_found"}]);
    }
   
  }); 



  
      


  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_writing', function (req, res) {

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
    const total_pages=req.body.total_pages;
    const category = (req.body.Category === "Poésie") ? "Poetry": (req.body.Category === "Scénario") ? "Scenario" : (req.body.Category === "Roman illustré") ? "Illustrated novel" : req.body.Category;
    const Tags = req.body.Tags;
    const monetization = req.body.monetization;
    const writing_name = req.body.writing_name;
      if (Object.keys(req.body).length === 0 ) {
        return res.send({
          success: false
        });
        
      } else { 
        Liste_Writings.create({
                "authorid": current_user,
                "title":title,
                "format":"unknown",
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0],
                "secondtag": Tags[1],
                "thirdtag": Tags[2],
                "file_name":writing_name,
                "viewnumber": 0,
                "likesnumber": 0,
                "lovesnumber": 0,
                "commentarynumbers": 0,
                "monetization":monetization,
                "total_pages":total_pages,
            })
          
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.status(200).send([r]);
          }); 
        
      }
  
    });

    router.post('/add_total_pages_for_writing', function (req, res) {

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
      const writing_id = req.body.writing_id;
      const total_pages=req.body.total_pages;
      Liste_Writings.findOne({
        where:{
          writing_id:writing_id,
        }
      }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing=>{
        if(writing){
          writing.update({
            "total_pages":total_pages,
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(r =>  {
          res.status(200).send([writing]);
          }); 
        }
        else{
          res.status(200).send([{error:"writing_not_found"}]);
        }
      })
          
          
        
    
      });
      



  router.delete('/remove_writing/:writing_id', function (req, res) {
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

    let writing_id = parseInt(req.params.writing_id);
    Liste_Writings.findOne({
      where: {
        writing_id: writing_id,
          authorid: current_user,
      }
      }).catch(err => {
        res.status(500).json({msg: "error", details: err});		
      }).then(writing=>{
        if(writing){
          list_of_users.findOne({
            where:{
              id:current_user,
            }
          }).catch(err => {
            res.status(500).json({msg: "error", details: err});		
          }).then(user=>{
            if(writing.status=="public"){
              let number_of_writings=user.number_of_writings-1;
              user.update({
                "number_of_writings":number_of_writings,
              })
            }
            writing.update({
              "status": "deleted"
            });
            res.status(200).send([writing]);
          })
        }
        else{
          if(current_user==1){
            Liste_Writings.findOne({
              where: {
                writing_id: writing_id,
              }
            }).then(writing_found=>{
              if(writing_found && writing_found.status=="public"){
                writing_found.update({
                  "status": "deleted",
                });
                list_of_users.findOne({
                  where:{
                    id:writing_found.authorid,
                  }
                }).catch(err => {
                  res.status(500).json({msg: "error", details: err});		
                }).then(user_found=>{
                  let number_of_writings=user_found.number_of_writings-1;
                  user_found.update({
                    "number_of_writings":number_of_writings,
                  })
                  res.status(200).send([writing_found]);
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
      
  router.post('/modify_writing', function (req, res) {
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
      const writing_id = req.body.writing_id;
      Liste_Writings.findOne({
            where: {
              writing_id: writing_id,
              authorid: current_user,
            }
          })
          .catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(writing =>  {
            writing.update({
              "title":title,
                "category": category,
                "highlight":highlight,
                "firsttag": Tags[0]?Tags[0]:null,
                "secondtag": Tags[1]?Tags[1]:null,
                "thirdtag": Tags[2]?Tags[2]:null,
            })
            .catch(err => {
              	
              res.status(500).json({msg: "error", details: err});		
            }).then(writing=>{
              Navbar.list_of_navbar_researches.update({
                "style": category,
                "firsttag": Tags[0]?Tags[0]:null,
                "secondtag": Tags[1]?Tags[1]:null,
                "thirdtag": Tags[2]?Tags[2]:null,
              },
              {
                where:{
                  publication_category:"Writing",
                  publication_id:writing_id
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
                  publication_category:"writing",
                  publication_id:writing_id
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
                  publication_category:"writing",
                  publication_id:writing_id
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
                  publication_category:"writing",
                  publication_id:writing_id
                }
              })
              res.status(200).send([writing])
            })
          }); 
          
    });

      
    router.post('/upload_cover_writing', function (req, res) {

      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name='';
      const PATH2= './data_and_routes/covers_writings';
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
          cb(null, current_user + '-' + Today + path.extname(file.originalname));
          //enlever nickname
        }
      });
      
      let upload_cover = multer({
        storage: storage2
      }).any();

      upload_cover(req, res, function(err){
        let filename = "./data_and_routes/covers_writings/" + file_name ;
        (async () => {
            const files = await imagemin([filename], {
              destination: './data_and_routes/covers_writings',
              plugins: [
                imageminPngquant({
                  quality: [0.7, 0.8]
              })
              ]
            });
            list_of_covers[current_user]=file_name
            res.status(200).send([{file_name:file_name}]);

            
        })();
         
        });
    });

    router.post('/upload_writing', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var file_name='';
      const PATH1= './data_and_routes/writings';
      

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
          file_name = current_user + '-' + Today + path.extname(file.originalname);
          cb(null, current_user + '-' + Today + path.extname(file.originalname));
          //enlever nickname
        }
      });

      let upload = multer({
        storage: storage
      }).any();

      upload(req, res, function(err) {
        if (err) {
          return res.send({
            success: false
          });
      
        } else { 
          list_of_writings[current_user]=file_name;
            res.status(200).send([{file_name:file_name}]);
        }
      })
    });


    router.post('/add_cover_writing_todatabase', function (req, res) {

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
      const writing_id = req.body.writing_id;
      Liste_Writings.findOne({
          where: {
            writing_id: writing_id,
            authorid: current_user,
          }
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
          writing.update({
            "name_coverpage" :name
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([writing]))
        }); 
        
      });
  

    router.post('/change_writing_status', function (req, res) {

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
      let writing_id=req.body.writing_id;
      let status=req.body.status;
      (async () => {

        writings = await Liste_Writings.findOne({
              where: {
                  authorid:current_user,
                  writing_id:writing_id,
              },
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writings => {
            writings.update({
                    "status":status
              }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writings => {
                  res.status(200).send([writings])
              }
              )
              
          }); 
      })();     
  });

  router.get('/retrieve_private_writings', function (req, res) {

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
    
          Liste_Writings.findAll({
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
		}).then(writings =>  {
            res.status(200).send([writings]);
          }); 
   
  });
 
  
  router.delete('/remove_writing_cover_from_folder/:name_writing', function (req, res) {

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
    fs.access('./data_and_routes/covers_writings/' + req.params.name_writing, fs.F_OK, (err) => {
      if(err){
        return res.status(200).send([{delete:'suppression done'}])
      }
        const name_writing  = req.params.name_writing;
        fs.unlink('./data_and_routes/covers_writings/' + name_writing,  function (err) {
          if (err) {
            return res.status(200).send([{delete:'suppression done'}])
          }  
          else {
            return res.status(200).send([{delete:'suppression done'}])
          }
        });
      });
  });

  router.delete('/remove_writing_from_folder/:name_writing', function (req, res) {

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
    fs.access('./data_and_routes/writings/' + req.params.name_writing, fs.F_OK, (err) => {
      if(err){
        return res.status(200).send([{delete:'suppression done'}])
      }
        const name_writing  = req.params.name_writing;
        fs.unlink('./data_and_routes/writings/' + name_writing,  function (err) {
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
  router.post('/validation_upload_writing', function (req, res) {

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
       const writing_id= req.body.writing_id;
         writing = await Liste_Writings.findOne({
            where: {
              writing_id: writing_id,
              authorid: current_user,
            }
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
            list_of_users.findOne({
              where:{
                id:current_user,
              }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              let number_of_writings=user.number_of_writings+1;
              user.update({
                "number_of_writings":number_of_writings,
              })
            });
            writing.update({
              "status":"public",
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(res.status(200).send([writing]))
          }); 
    })();
    });

                     //récupère toutes les bd selon l'auteur
  router.get('/retrieve_writings_information_by_user_id/:user_id', function (req, res) {

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
         Liste_Writings.findAll({
            where: {
              authorid: user_id,
              status:"public"
            },
            order: [
                ['writing_id', 'ASC']
              ],
          })
          .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
            
            res.status(200).send([writing]);
          }); 
    
    });

    router.post('/get_number_of_writings', function (req, res) {

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
      let list_of_writings=[];
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
      Liste_Writings.findAll({
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
		}).then(writings =>  {
          if(writings.length>0){
            for(let j=0;j<writings.length;j++){
             list_of_ids.push(writings[j].writing_id)
             list_of_writings.push(writings[j])
            }
          }
           res.status(200).send([{number_of_writings:writings.length,list_of_ids:list_of_ids,list_of_writings:list_of_writings}]);
         }); 

    });



 
    router.get('/retrieve_writing_information_by_id/:writing_id', function (req, res) {

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

     
  
         const writing_id= parseInt(req.params.writing_id);
           Liste_Writings.findOne({
              where: {
                writing_id: writing_id,
              }
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
              if(writing){
                trendings_contents.findOne({
                  where:{
                    publication_category:"writing",
                    publication_id:writing.writing_id
                  }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(tren=>{
                  if(tren){
                    if(writing.trending_rank){
                      if(writing.trending_rank<tren.rank){
                        writing.update({
                          "trending_rank":tren.rank
                        })
                        res.status(200).send([writing]);
                      }
                      else{
                        res.status(200).send([writing]);
                      }
                    }
                    else{
                      writing.update({
                        "trending_rank":tren.rank
                      })
                      res.status(200).send([writing]);
                    }
                    
                  }
                  else{
                    res.status(200).send([writing]);
                  }
                })
                
              }
              else{
                res.status(200).send([writing]);
              }
            }); 
      
      });

      router.get('/retrieve_writing_information_by_id2/:writing_id', function (req, res) {

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
  
        const writing_id= parseInt(req.params.writing_id);
          Liste_Writings.findOne({
             where: {
               writing_id: writing_id,
             }
           })
           .catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(writing =>  {
             if(writing){
               trendings_contents.findOne({
                 where:{
                   publication_category:"writing",
                   publication_id:writing.writing_id
                 }
               }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
              }).then(tren=>{
                 if(tren){
                   if(writing.trending_rank){
                     if(writing.trending_rank<tren.rank){
                       writing.update({
                         "trending_rank":tren.rank
                       })
                       res.status(200).send([{current_user:current_user,data:[writing]}]);
                     }
                     else{
                      res.status(200).send([{current_user:current_user,data:[writing]}]);
                     }
                   }
                   else{
                     writing.update({
                       "trending_rank":tren.rank
                     })
                     res.status(200).send([{current_user:current_user,data:[writing]}]);
                   }
                   
                 }
                 else{
                  res.status(200).send([{current_user:current_user,data:[writing]}]);
                 }
               })
               
             }
             else{
              res.status(200).send([{current_user:current_user,data:[writing]}]);
             }
           }); 
     
     });
    
      
  router.get('/retrieve_writing_by_name/:file_name', function (req, res) {

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

        let filename = "./data_and_routes/writings/" + req.params.file_name;
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
        } );

  });


  

  router.get('/retrieve_writing_for_options/:index', function (req, res) {

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
    //0 conditions d'utilisation
    //1 sécrurité et condit
    //2 qui sommes nous
    //3mentions légales
    //4cookies
    //5 précisions pour la monetization
    let index= parseInt(req.params.index)
    let filename = "./data_and_routes/conditions/" ;
    if(index==0){
      filename += 'only_conditions.pdf'
    }
    else if(index==5){
      filename += 'only_for_remuneration.pdf'
    }
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
    } );

  });

  router.get('/retrieve_thumbnail_writing_picture/:file_name', function (req, res) {

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
      let filename = "./data_and_routes/covers_writings/" + file_name ;
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

  

   //on supprime la cover du dossier data_and_routes/covers_bd_oneshot
   router.delete('/remove_last_cover_from_folder/:file_name', function (req, res) {

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
    
  
    const name_coverpage=req.params.file_name;

    fs.access('./data_and_routes/covers_writings/' + name_coverpage, fs.F_OK, (err) => {
      if(err){
        return res.status(200)
      }
        fs.unlink('./data_and_routes/covers_writings/' + name_coverpage,  function (err) {
          if (err) {
            return res.status(200).send([{delete:'suppression done'}])
          }  
          else {
            return res.status(200).send({"ok":"ok"})
          }
        });
      });
  });
 
      
 

}