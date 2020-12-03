const multer = require('multer');
const fs = require('fs');
var path = require('path');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc78dJBL1awHzfr3';

module.exports = (router, 
  users,
  users_links,
  users_blocked,
  users_information_privacy,
  users_groups_managment,
  users_mailing,
  List_of_views,
  List_of_likes,
  List_of_loves,
  List_of_comments,
  List_of_comments_answers,
  List_of_comments_likes,
  List_of_comments_answers_likes,
  list_of_ads,
  list_of_ads_responses,
  List_of_subscribings, 
  List_of_contents, 
  List_of_stories, 
  List_of_stories_views,
  Liste_Bd_Serie, 
  Chapters_Bd_Serie,
  List_comics_one_shot,
  Liste_Drawings_Artbook,
  Drawings_one_page,
  Liste_Writings,
  List_of_notifications
  ) => {



function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};

function genere_random_id(id){
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(id.toString()), cipher.final()]);
  let string_1=encrypted.toString('hex');
  let string_2=iv.toString('hex');
  
  let string_3=Math.random().toString(36).slice(-8) 
  return string_1 + string_2 + string_3;
  
}


router.post('/add_profile_pic', function (req, res) {
  //console.log("adding pp")
    let current_user = get_current_user(req.cookies.currentUser);
    var filename = ''
    let PATH = './data_and_routes/profile_pics/';

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
            cb(null,current_user + '-' + Today + '.png');
          }
    });
    
    var upload = multer({
        storage: storage
    }).any();

    upload(req, res, function(err) {
        (async () => {
        if (err) {
            return res.end('Error');
        } else {
            let file_name = "./data_and_routes/profile_pics/" + filename ;
            const files = await imagemin([file_name], {
              destination: './data_and_routes/profile_pics',
              plugins: [
                imageminPngquant({
                  quality: [0.5, 0.6]
                })
              ]
            });
            User = await users.findOne({
                where: {
                  id: current_user,
                }
              })
              .catch(err => {
                //console.log(err);	
                res.status(500).json({msg: "error", details: err});		
              }).then(User =>  {
                User.update({
                  "profile_pic_file_name":filename,
                }).catch(err => {
                  //console.log(err);	
                  res.status(500).json({msg: "error", details: err});		
                }).then(res.status(200).send(([{ "profile_pic_name": filename}])))
              }); 
        }
        })();
    });
});

router.post('/add_cover_pic', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser);

    var filename = ''
    let PATH = './data_and_routes/cover_pics/';

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
        (async () => {
            if (err) {
                return res.end('Error');
            } 
            else {

            let file_name = "./data_and_routes/cover_pics/" + filename ;
            const files = await imagemin([file_name], {
              destination: './data_and_routes/cover_pics',
              plugins: [
                imageminPngquant({
                  quality: [0.5, 0.6]
                })
              ]
            });
            User = await users.findOne({
                where: {
                  id: current_user,
                }
              })
              .catch(err => {
                //console.log(err);	
                res.status(500).json({msg: "error", details: err});		
              }).then(User =>  {
                  User.update({
                    "cover_pic_file_name":filename,
                  }).catch(err => {
                    //console.log(err);	
                       res.status(500).json({msg: "error", details: err});		
                    })
                    .then(res.status(200).send(([{ "cover_pic_file_name": filename}])))
                }); 
        }
        })();
    });
});



router.get('/retrieve_profile_picture/:user_id', function (req, res) {
 

    const user_id = parseInt(req.params.user_id);

    users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      if(User){
        let filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
        fs.readFile( path.join(process.cwd(),filename), function(e,data){
          //blob = data.toBlob('application/image');
          res.status(200).send(data);
        } );
      }
      else{
        res.status(500).send({error:"user not found"});
      }
      
    }); 



});


router.get('/retrieve_cover_picture/:user_id', function (req, res) {
  (async () => {

    const user_id = req.params.user_id;

    User = await users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        res.status(200).send(data);
      } );
    }); 

  })();

});



router.get('/retrieve_profile_data/:user_id', function (req, res) {


    const user_id = req.params.user_id;
    users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );


});

router.post('/retrieve_number_of_contents', function (req, res) {

    const id = req.body.id;
    let number_of_comics=0;
    let number_of_drawings=0;
    let number_of_writings=0;
    let number_of_ads=0;
    users.findOne({
      where: {
        id: id,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      if(User){
        Liste_Bd_Serie.findAll({
          where:{
            authorid:id,
            status:"public"
          }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie=>{
          number_of_comics+=bd_serie.length;
          List_comics_one_shot.findAll({
            where:{
              authorid:id,
              status:"public"
            }
          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_os=>{
            number_of_comics+=bd_os.length;
            Drawings_one_page.findAll({
              where:{
                authorid:id,
                status:"public"
              }
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(drawings_os=>{
              number_of_drawings+=drawings_os.length;
              Liste_Drawings_Artbook.findAll({
                where:{
                  authorid:id,
                  status:"public"
                }
              }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(drawings_at=>{
                number_of_drawings+=drawings_at.length;
                Liste_Writings.findAll({
                  where:{
                    authorid:id,
                    status:"public"
                  }
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(writings=>{
                  number_of_writings+=writings.length;
                  list_of_ads.findAll({
                    where:{
                      id_user:id,
                      status:"public"
                    }
                  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads=>{
                    number_of_ads+=ads.length;
                    res.status(200).send([{number_of_ads:number_of_ads,number_of_comics:number_of_comics,number_of_drawings:number_of_drawings,number_of_writings:number_of_writings}])
                  })
                })
              })
            })
          })
        })
      }
      else{
        res.status(200).send([{error:"not_found"}])
      }
      } );


});

router.get('/retrieve_profile_data_links/:id_user', function (req, res) {


    const id_user = req.params.id_user;
    users_links.findAll({
      where: {
        id_user: id_user,
      },
      order: [
        ['link_title', 'ASC']
      ],
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(links =>  {
        res.status(200).send([links]);
      } );


});

router.get('/get_user_id_by_pseudo/:pseudo', function (req, res) {


    const pseudo = req.params.pseudo;
   users.findOne({
      where: {
        nickname: pseudo,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );


});

router.get('/get_pseudo_by_user_id/:user_id', function (req, res) {
  (async () => {

    const user_id = parseInt(req.params.user_id);
    User = await users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );
  })();

});






  //
  router.post('/edit_account_about_1', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    
    const type_of_account=req.body.type_of_account;
    const primary_description= req.body.primary_description;
    const primary_description_extended= req.body.primary_description_extended;
    const training = req.body.training;
    const job = req.body.job;
    const siret = req.body.siret;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      User.update({
        "type_of_account":type_of_account,
        "siret":siret,
        "training":training,
        "primary_description_extended":primary_description_extended,
        "primary_description":primary_description,
        "job":job,
      }).catch(err => {
        //console.log(err);	
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });

  router.post('/edit_account_about_2', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    
    const email_about=req.body.location;
    const location= req.body.location;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      User.update({
        "email_about":email_about,
        "location":location,
      }).catch(err => {
        //console.log(err);	
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });

  router.post('/edit_account_about_3', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    
    const firstname=req.body.firstname;
    const lastname= req.body.lastname;
    const birthday= req.body.birthday;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      User.update({
        "firstname":firstname,
        "lastname":lastname,
        "birthday":birthday,
      }).catch(err => {
        //console.log(err);	
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });


  router.post('/block_user', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    //console.log("block_user");
    var date = req.body.date;
    //console.log(date)
    const id_user_blocked= req.body.id_user_blocked;
    let final_date=new Date();
    if(date){
      date.substring(0,date.length - 5);
      date = date.replace("T",' ');
      date = date.replace("-",'/').replace("-",'/');
      final_date= new Date(date + ' GMT');
    }
    //console.log(final_date);
    
    users_blocked.create({
      "id_user":current_user,
      "id_user_blocked":id_user_blocked,
      "date":date?final_date:null,
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      res.status(200).send([user])
    })
  });


  router.post('/get_list_of_users_blocked', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    users_blocked.findAll({
      where:{
        [Op.or]:[{id_user: current_user},{id_user_blocked:current_user}],
      },
      order: [
        ['createdAt', 'DESC']
      ],
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(users=>{
      if(users.length>0){
        res.status(200).send([users])
      }
      else{
        res.status(200).send([{nothing:"nothing"}])
      }
      
    })
  });


  
  router.post('/check_if_user_blocked', function (req, res) {
    //console.log("check_if_user_blocked")
    let current_user = get_current_user(req.cookies.currentUser);
    const id_user=req.body.id_user;
    const Op = Sequelize.Op;
    users_blocked.findOne({
      where:{
        [Op.or]:[{[Op.and]:[{id_user: current_user},{id_user_blocked:id_user}]},{[Op.and]:[{id_user: id_user},{id_user_blocked:current_user}]}],
      }
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        res.status(200).send([user])
      }
      else{
        res.status(200).send([{nothing:"nothing"}])
      }
      
    })
  });


  
  router.post('/unblock_user', function (req, res) {
    //console.log("unblock user")
    let current_user = get_current_user(req.cookies.currentUser);
    const id_user=req.body.id_user;
    const Op = Sequelize.Op;
    users_blocked.findOne({
      where:{
        [Op.or]:[{[Op.and]:[{id_user: current_user},{id_user_blocked:id_user}]},{[Op.and]:[{id_user: id_user},{id_user_blocked:current_user}]}],
      }
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      let date=user.date;
      //console.log(date)
      user.destroy({
        truncate: false
      })
      res.status(200).send([{date:date}])
      
      
    })
  });

  

  

  router.post('/get_pseudos_who_match_for_signup', function (req, res) {
    //console.log("get_pseudos_who_match_for_signup")
    let pseudo = (req.body.pseudo).toLowerCase();
    const Op = Sequelize.Op;
    users.findOne({
      where: {
        nickname:{[Op.iLike]: pseudo },
        status:"account",
        type_of_account:["Artiste professionel","Artiste professionelle","Artiste"],
        gender:{[Op.ne]:'Groupe'}
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      //console.log("result one")
      //console.log(User)
      if(User){
        res.status(200).send([User])
      }
      else{
        users.findOne({
          where: {
            nickname:{[Op.iLike]:'%'+ pseudo + '%'},
            type_of_account:["Artiste professionel","Artiste professionelle","Artiste"],
            status:"account",
            gender:{[Op.ne]:'Groupe'}
          }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User=>{
          //console.log("result two")
          //console.log(User)
          if(User){
            res.status(200).send([User])
          }
          else{
            res.status(200).send([{"nothing":"nothing"}])
          }
        })
       
      }
     
    }); 

   
  });



  router.post('/edit_primary_description_extended', function (req, res) {
    //console.log("edit_primary_description_extended")
    const id_user = req.body.id_user;
    const primary_description_extended = req.body.primary_description_extended;
    //console.log(primary_description_extended)
    users.findOne({
      where: {
        id:id_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
      //console.log(user.primary_description_extended)
        user.update({
          "primary_description_extended":primary_description_extended,
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
          //console.log(us.primary_description_extended);
          res.status(200).send([us])}
          
        )
        
    }); 

   
  });
  

  router.post('/edit_profile_information', function (req, res) {
    //console.log("edit_profile_information")
    const id_user = req.body.id_user;
    const email = req.body.email;
    const birthday = req.body.birthday;
    const job = req.body.job;
    const training = req.body.training;
    users.findOne({
      where: {
        id:id_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
        user.update({
          "email_about":email,
          "birthday":birthday,
          "job":job,
          "training":training
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{res.status(200).send([us])}
        )
    }); 

   
  });


  

  router.post('/get_information_privacy', function (req, res) {
    //console.log("get_information_privacy")
    let id_user = req.body.id_user;
    //console.log(id_user)
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      if(User){
        res.status(200).send([User])
      }
      else{
        users_information_privacy.create({
          "id_user": id_user,
          "type_of_profile":"public",
          "email_about": "public",
          "primary_description_extended":"public",
          "birthday":"public",
          "job":"public",
          "training":"public",
          "trendings_stats":"public",
          "ads_stats": "public",
          "comics_stats":"public",
          "drawings_stats":"public",
          "writings_stats":"public",
          "profile_stats":"private",

        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User=>{
          //console.log("result two")
          //console.log(User)
          res.status(200).send([User])
        })
       
      }
     
    }); 

   
  });


  router.post('/change_information_privacy_public', function (req, res) {
    //console.log("change_information_privacy_public")
    let id_user = req.body.id_user;
    let indice = req.body.indice;
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        if(indice==0){
          User.update({
            "primary_description_extended":"public",
          })
        }
        if(indice==1){
          User.update({
            "type_of_profile": "public",
          })
        }
        if(indice==2){
          User.update({
           "email_about": "public",
          })
        }
        if(indice==3){
          User.update({
            "birthday":"public",
          })
        }
        if(indice==4){
          User.update({
          "job":"public",
          })
        }
        if(indice==5){
          User.update({
          "training":"public",
          })
        }
        if(indice==6){
          User.update({
          "trendings_stats":"public",
          })
        }
        if(indice==7){
          User.update({
          "ads_stats":"public",
          })
        }
        if(indice==8){
          User.update({
          "comics_stats":"public",
          })
        }
        if(indice==9){
          User.update({
          "drawings_stats":"public",
          })
        }
        if(indice==10){
          User.update({
          "writings_stats":"public",
          })
        }
        if(indice==11){
          User.update({
          "profile_stats":"public",
          })
        }

        res.status(200).send([User])
     
     
    }); 

   
  });

  router.post('/change_information_privacy_private', function (req, res) {
    //console.log("change_information_privacy_private")
    let id_user = req.body.id_user;
    let indice = req.body.indice;
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        if(indice==0){
          User.update({
            "primary_description_extended":"private",
          })
        }
        if(indice==1){
          User.update({
            "type_of_profile": "private",
          })
        }
        if(indice==2){
          User.update({
           "email_about": "private",
          })
        }
        if(indice==3){
          User.update({
            "birthday":"private",
          })
        }
        if(indice==4){
          User.update({
          "job":"private",
          })
        }
        if(indice==5){
          User.update({
          "training":"private",
          })
        }
        if(indice==6){
          User.update({
          "trendings_stats":"private",
          })
        }
        if(indice==7){
          User.update({
          "ads_stats":"private",
          })
        }
        if(indice==8){
          User.update({
          "comics_stats":"private",
          })
        }
        if(indice==9){
          User.update({
          "drawings_stats":"private",
          })
        }
        if(indice==10){
          User.update({
          "writings_stats":"private",
          })
        }
        if(indice==11){
          User.update({
          "profile_stats":"private",
          })
        }
        res.status(200).send([User])
     
     
    }); 

   
  });


  

  router.post('/get_my_list_of_groups_from_users', function (req, res) {
    //console.log("get_my_list_of_groups_from_users")
    let current_user = req.body.id_user;
    const Op = Sequelize.Op;
    users.findAll({
      where: {
        list_of_members: { [Op.contains]: [current_user] },
        gender:"Groupe",
        status:"account",
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(us =>  {
       res.status(200).send([us])
    }); 

   
  });


  router.post('/get_group_information_by_id', function (req, res) {
    //console.log("get_group_information_by_id")
    let current_user = get_current_user(req.cookies.currentUser);
    let id_group=req.body.id_group
    const Op = Sequelize.Op;
    users_groups_managment.findAll({
      where: {
        id_group:id_group,
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(users =>  {
      if(users[0]){
        res.status(200).send([users])
      }
      else{
        res.status(200).send([{error:"not_found"}])
      }
       
    }); 

   
  });


  
  router.post('/validate_group_creation_and_shares', function (req, res) {
    //console.log("validate_group_creation_and_shares")
    let current_user = get_current_user(req.cookies.currentUser);
    let id_group=req.body.id_group;
    let list_of_ids=req.body.list_of_ids;
    let list_of_shares=req.body.list_of_shares;
    const Op = Sequelize.Op;
    users.findOne({
      where:{
        id:id_group,
        list_of_members: { [Op.contains]: [current_user] },
      }
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        let list_of_members_validations=user.list_of_members_validations;
        let created_list=false;
        if(!list_of_members_validations){
          list_of_members_validations=[current_user];
          created_list=true;
        }

        if(list_of_members_validations.indexOf(current_user)<0 ||  created_list){
          //console.log("first if")
          if(list_of_members_validations.indexOf(current_user)<0){
            list_of_members_validations.push(current_user);
          }
          user.update({
            "list_of_members_validations":list_of_members_validations
          })
          let compt=0;
          for( let i=0;i<list_of_ids.length;i++){
            users_groups_managment.findOne({
              where:{
                id_group:id_group,
                id_user:list_of_ids[i],
              }
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user_found=>{
              if(user_found){
                if(list_of_ids[i]==current_user){
                  user_found.update({
                    "share":list_of_shares[i],
                    "status":"validated",
                  })
                }
                else{
                  user_found.update({
                    "share":list_of_shares[i],
                  })
                }
                
              }
              else{
                users_groups_managment.create({
                  "id_group":id_group,
                  "id_user":list_of_ids[i],
                  "share":list_of_shares[i],
                  "status":(list_of_ids[i]==current_user)?"validated":null,
                })
              }
              compt++;
              if(compt==list_of_ids.length){
                res.status(200).send([{user:user,loop:"first"}])
              }
            })
           
          }
        }
        else if(user.id_admin==current_user){
          //console.log(list_of_ids)
          let compt=0;
          for( let i=0;i<list_of_ids.length;i++){
            users_groups_managment.findOne({
              where: {
                id_group:id_group,
                id_user:list_of_ids[i]
              },
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user_of_group=>{
              if(user_of_group && user_of_group.id_user==current_user){
                user_of_group.update({
                  "share":list_of_shares[i],
                  "status":"validated",
                })
              }
              else if(!user_of_group){
                users_groups_managment.create({
                  "id_group":id_group,
                  "id_user":list_of_ids[i],
                  "share":list_of_shares[i],
                  "status":null,
                })
              }
              else{
                user_of_group.update({
                  "share":list_of_shares[i],
                })
              }
              
              compt++;
              if(compt==list_of_ids.length){
                res.status(200).send([{user:user,loop:"second"}])
              }
            })
          }
        }
        else{
          res.status(200).send([{error:"already_validated"}])
        }
      }
      else{
        res.status(200).send([{error:"group_aborted"}])
      }
      
    })
    

   
  });

  router.post('/abort_group_creation', function (req, res) {
    //console.log("abort_group_creation")
    let current_user = get_current_user(req.cookies.currentUser);
    let id_group=req.body.id_group;
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:id_group,
        list_of_members: { [Op.contains]: [current_user] },
      } 
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "email":null,
          "nickname":"Utilisateur_introuvable_" +user.id,
          "status": "deleted",
          "list_of_members_validations":null,
        })
        res.status(200).send([{deletion:"done",id:id_group}])
      }
      else{
        res.status(200).send([{error:"not_found"}])
      }
     
    })
  });

  router.post('/exit_group', function (req, res) {
    //console.log("exit_group")
    let current_user = get_current_user(req.cookies.currentUser);
    let id_group=req.body.id_group;
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:id_group,
        list_of_members: { [Op.contains]: [current_user] },
      } 
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        let list_of_members=user.list_of_members;
        let compt=0;
        for( let i=0;i<list_of_members.length;i++){
          users_groups_managment.findOne({
            where: {
              id_group:id_group,
              id_user:list_of_members[i]
            },
          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user_of_group=>{
            let num=list_of_members.length-1;
            if(user_of_group.id_user && user_of_group.id_user==current_user){
              user_of_group.destroy({
                truncate: false
              })
            }
            else{
              user_of_group.update({
                "share":(100/num).toFixed(2),
              })
            }
            compt++;
            if(compt==list_of_members.length){
              let list_of_members_validations=user.list_of_members_validations;
              let index_val=list_of_members_validations.indexOf(current_user);
              if(index_val>=0){
                list_of_members_validations.splice(index_val,1)
              }
              let index=list_of_members.indexOf(current_user)
              list_of_members.splice(index,1);
              user.update({
                "list_of_members":list_of_members,
                "list_of_members_validations":list_of_members_validations,
              })
              res.status(200).send([user])
            }
          })
        }
      }
      else{
        res.status(200).send([{exit:"done"}])
      }
     
    })
  });


  

  /****************************************  DELETE AND SUSPEND ACCOUNT  *******************************/

  

  router.post('/delete_account', function (req, res) {
    //console.log("delete_account")
    let current_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:current_user,
        status:"account",
      } 
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "status":"deleted",
          "email":null,
          "nickname":"Utilisateur_introuvable_" +user.id,
          "firstname":"Utilisateur introuvable",
          "lastname":"",
          "profile_pic_file_name":"default_profile_picture.png",
					"cover_pic_file_name":"default_cover_picture.png",
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
          List_of_loves.update({
            "status":"deleted"
          },
          {
            where:{
              author_id_who_loves:current_user
            }
          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
            List_of_likes.update({
              "status":"deleted"
            },
            {
              where:{
                author_id_who_likes:current_user
              }
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
              List_of_comments.update({
                "status":"deleted"
              },
              {
                where:{
                  author_id_who_comments:current_user
                }
              }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                List_of_comments_answers.update({
                  "status":"deleted"
                },
                {
                  where:{
                    author_id_who_replies:current_user
                  }
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                  List_of_comments_answers_likes.update({
                    "status":"deleted"
                  },
                  {
                    where:{
                      author_id_who_likes:current_user
                    }
                  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                    List_of_comments_likes.update({
                      "status":"deleted"
                    },
                    {
                      where:{
                        author_id_who_likes:current_user
                      }
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                      List_of_subscribings.update({
                        "status":"deleted"
                      },
                      {
                        where:{
                          [Op.or]:[{id_user: current_user},{id_user_subscribed_to:current_user}],
                        }
                      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                        list_of_ads.update({
                          "status":"deleted"
                        },
                        {
                          where:{
                            id_user: current_user,
                          }
                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                          list_of_ads_responses.update({
                            "status":"deleted"
                          },
                          {
                            where:{
                              id_user: current_user,
                            }
                          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                            List_of_stories.update({
                              "status":"deleted"
                            },
                            {
                              where:{
                                id_user: current_user,
                              }
                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                              List_of_stories_views.update({
                                "status":"deleted"
                              },
                              {
                                where:{
                                  authorid: current_user,
                                }
                              }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                List_of_contents.update({
                                  "status":"deleted"
                                },
                                {
                                  where:{
                                    id_user: current_user,
                                  }
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                  Liste_Bd_Serie.update({
                                    "status":"deleted"
                                  },
                                  {
                                    where:{
                                      authorid: current_user,
                                    }
                                  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                     List_comics_one_shot.update({
                                       "status":"deleted"
                                     },
                                     {
                                      where:{
                                        authorid:current_user
                                      }
                                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                      Drawings_one_page.update({
                                        "status":"deleted"
                                      },
                                      {
                                        where:{
                                          authorid: current_user,
                                        }
                                      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                        Liste_Drawings_Artbook.update({
                                          "status":"deleted"
                                        },
                                        {
                                          where:{
                                            authorid: current_user,
                                          }
                                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                          Liste_Writings.update({
                                            "status":"deleted"
                                          },
                                          {
                                            where:{
                                              authorid: current_user,
                                            }
                                          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                            List_of_notifications.update({
                                              "status":"deleted"
                                            },
                                            {
                                              where:{
                                                id_user: current_user,
                                              }
                                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                              res.status(200).send([user])
                                            )
                                          )
                                        )
                                      )
                                     )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )

          )
        )
        
       
      }
      else{
        res.status(200).send([{deletion:"already_done"}])
      }
     
    })
  });


  router.post('/suspend_account', function (req, res) {
    //console.log("suspend_account")
    let current_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:current_user,
        status:"account",
      } 
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "status":"suspended",
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
          List_of_loves.update({
            "status":"suspended"
          },
          {
            where:{
              author_id_who_loves:current_user
            }
          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
            List_of_likes.update({
              "status":"suspended"
            },
            {
              where:{
                author_id_who_likes:current_user
              }
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
              List_of_comments.update({
                "status":"suspended"
              },
              {
                where:{
                  author_id_who_comments:current_user
                }
              },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                List_of_comments_answers.update({
                  "status":"suspended"
                },
                {
                  where:{
                    author_id_who_replies:current_user
                  }
                },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                  List_of_comments_answers_likes.update({
                    "status":"suspended"
                  },
                  {
                    where:{
                      author_id_who_likes:current_user
                    }
                  },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                    List_of_comments_likes.update({
                      "status":"suspended"
                    },
                    {
                      where:{
                        author_id_who_likes:current_user
                      }
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                      List_of_subscribings.update({
                        "status":"suspended"
                      },
                      {
                        where:{
                          [Op.or]:[{id_user: current_user},{id_user_subscribed_to:current_user}],
                        }
                      },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                        list_of_ads.update({
                          "status":"suspended"
                        },
                        {
                          where:{
                            id_user: current_user,
                          }
                        },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                          list_of_ads_responses.update({
                            "status":"suspended"
                          },
                          {
                            where:{
                              id_user: current_user,
                            }
                          }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                            List_of_stories.update({
                              "status":"suspended"
                            },
                            {
                              where:{
                                id_user: current_user,
                              }
                            },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                              List_of_stories_views.update({
                                "status":"suspended"
                              },
                              {
                                where:{
                                  authorid: current_user,
                                }
                              },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                List_of_contents.update({
                                  "status":"suspended"
                                },
                                {
                                  where:{
                                    id_user: current_user,
                                  }
                                },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                  Liste_Bd_Serie.update({
                                    "status":"suspended"
                                  },
                                  {
                                    where:{
                                      authorid: current_user,
                                    }
                                  }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                     List_comics_one_shot.update({
                                       "status":"suspended"
                                     },
                                     {
                                      where:{
                                        authorid:current_user
                                      }
                                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                      Drawings_one_page.update({
                                        "status":"suspended"
                                      },
                                      {
                                        where:{
                                          authorid: current_user,
                                        }
                                      }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                        Liste_Drawings_Artbook.update({
                                          "status":"suspended"
                                        },
                                        {
                                          where:{
                                            authorid: current_user,
                                          }
                                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                          Liste_Writings.update({
                                            "status":"suspended"
                                          },
                                          {
                                            where:{
                                              authorid: current_user,
                                            }
                                          },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                            List_of_notifications.update({
                                              "status":"suspended"
                                            },
                                            {
                                              where:{
                                                id_user: current_user,
                                              }
                                            },).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
                                              res.status(200).send([user])
                                            )
                                          )
                                        )
                                      )
                                     )
                                    )
                                  )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )

          )
        )
        
       
      }
      else{
        res.status(200).send([{deletion:"already_done"}])
      }
     
    })
  });


  router.post('/get_back_suspended_account', function (req, res) {
    //console.log("get_back_suspended_account")
    let current_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:current_user,
        status:"suspended",
      } 
    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        //console.log("get_back_suspended_account user found")
        user.update({
          "status":"account",
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
          //console.log("love update")
          List_of_loves.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_loves:current_user,
              status:"suspended"
            }
          });
          //console.log("like update")
          List_of_likes.update(
          
          {
            "status":"public"
          },
          {
            where:{
              author_id_who_likes:current_user,
              status:"suspended"
            }
          });
          List_of_comments.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_comments:current_user,
              status:"suspended"
            }
          });
          List_of_comments_answers.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_replies:current_user,
              status:"suspended"
            }
          });
          List_of_comments_answers_likes.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_likes:current_user,
              status:"suspended"
            }
          })
          List_of_comments_likes.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_likes:current_user,
              status:"suspended"
            }
          })
          List_of_subscribings.update({
            "status":"public"
          },
          {
            where:{
              [Op.or]:[{id_user: current_user},{id_user_subscribed_to:current_user}],
              status:"suspended"
            }
          })
          list_of_ads.update({
            "status":"public"
          },
          {
            where:{
              id_user: current_user,
              status:"suspended"
            }
          })
          list_of_ads_responses.update({
            "status":"public"
          },
          {
            where:{
              id_user: current_user,
              status:"suspended"
            }
          },)
          List_of_stories.update({
            "status":"public"
          },
          {
            where:{
              id_user: current_user,
              status:"suspended"
            }
          })
          List_of_stories_views.update({
            "status":"public"
          },
          {
            where:{
              authorid: current_user,
              status:"suspended"
            }
          })
          List_of_contents.update({
            "status":"ok"
          },
          {
            where:{
              id_user: current_user,
              status:"suspended"
            }
          })
          Liste_Bd_Serie.update({
            "status":"public"
          },
          {
            where:{
              authorid: current_user,
              status:"suspended"
            }
          })
          List_comics_one_shot.update({
            "status":"public"
          },
          {
            where:{
              authorid:current_user,
              status:"suspended"
            }
          })
          Drawings_one_page.update({
            "status":"public"
          },
          {
            where:{
              authorid: current_user,
              status:"suspended"
            }
          })
          Liste_Drawings_Artbook.update({
            "status":"public"
          },
          {
            where:{
              authorid: current_user,
              status:"suspended"
            }
          })
          Liste_Writings.update({
            "status":"public"
          },
          {
            where:{
              authorid: current_user,
              status:"suspended"
            }
          })
          List_of_notifications.update({
            "status":"checked"
          },
          {
            where:{
              id_user: current_user,
              status:"suspended"
            }
          })
          res.status(200).send([user])
        })
        
       
      }
      else{
        res.status(200).send([{deletion:"already_done"}])
      }
     
    })
  });


  
  
  router.post('/change_mailing_managment', function (req, res) {
    //console.log("change_mailing_managment")
    let current_user = get_current_user(req.cookies.currentUser);
    let type=req.body.type;
    let special_visitor_type=req.body.special_visitor_type;
    let value=req.body.value
    const Op = Sequelize.Op;
    users_mailing.findOne({
      where: {
        id_user: current_user ,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
      if(user){
        user.update({
          "trending_mail":(type=="trending_mail")?value:user.trending_mail,
          "ads_answers":(type=="ads_answers")?value:user.ads_answers,
          "special_visitor_type":special_visitor_type,
          "special_visitor":(type=="special_visitor")?value:user.special_visitor,
          "group_creation":(type=="group_creation")?value:user.group_creation,
          "group_shares":(type=="group_shares")?value:user.group_shares,
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(mailing=>{
          res.status(200).send([mailing])
        })
      }
      else{
        users.findOne({
          where:{
            id:current_user
          }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(real_user=>{
          if(real_user && real_user.status=='account'){
            users_mailing.create({
              "id_user":current_user,
              "trending_mail":(type=="trending_mail")?value:true,
              "ads_answers":(type=="ads_answers")?value:true,
              "special_visitor_type":special_visitor_type,
              "special_visitor":(type=="special_visitor")?value:true,
              "group_creation":(type=="group_creation")?value:true,
              "group_shares":(type=="group_shares")?value:true,
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(mailing=>{
              res.status(200).send([mailing])
            })
          }
          else{
            res.status(200).send([{error:"not_found"}]);
          }
        })
        
      }
    }); 

   
  });


  

  router.post('/update_special_visitor', function (req, res) {
    //console.log("update_special_visitor")
    let current_user = get_current_user(req.cookies.currentUser);
    let special_visitor_type=req.body.special_visitor_type;
    const Op = Sequelize.Op;
    users_mailing.findOne({
      where: {
        id_user: current_user ,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
      if(user){
        user.update({
          "special_visitor_type":special_visitor_type,
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(mailing=>{
          res.status(200).send([mailing])
        })
      }
      else{
        users.findOne({
          where:{
            id:current_user
          }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(real_user=>{
          if(real_user && real_user.status=='account'){
            users_mailing.create({
              "id_user":current_user,
              "special_visitor_type":special_visitor_type,
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(mailing=>{
              res.status(200).send([mailing])
            })
          }
          else{
            res.status(200).send([{error:"not_found"}]);
          }
        })
        
      }
    }); 

   
  });

  router.post('/get_mailing_managment', function (req, res) {
    console.log("get_mailing_managment")
    let current_user = get_current_user(req.cookies.currentUser);

    const Op = Sequelize.Op;
    users_mailing.findOne({
      where: {
        id_user: current_user,
      }
    })
    .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
      if(user){
          res.status(200).send([user])
      }
      else{
            res.status(200).send([{error:"not_found"}]);
      }
    }); 

   
  });


  

  router.post('/check_password_for_registration', function (req, res) {
    console.log("check_password_for_registration")
    let id = req.body.id;
    let password= req.body.password;
    console.log(id);
    console.log(password);
    users.findOne({
      where:{
        id:id
      }
    }).then(user=>{
      if(user){
        if(user.password_registration==password){
          console.log("match")
          console.log(user.password_registration)
          user.update({
            "email_checked":true,
            "password_registration":null,
          })
          res.status(200).send([{user_found:user}])
        }
        else{
          res.status(200).send([{error:"error"}])
        }
      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
  })

  router.post('/send_email_for_account_creation', function (req, res) {
    console.log("send_email_for_account_creation")
    let id = req.body.id;
    users.findOne({
      where:{
        id:id
      }
    }).then(user=>{
      if(user){
          let password=genere_random_id(user.id);
          console.log(user.email)
          console.log(password)
          user.update({
            "password_registration":password
          })

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
            subject: `Confirmation d'inscription`, // Subject line
            //text: 'plain text', // plain text body
            html:  `<p><a href="http://localhost:4200/registration/${user.id}/${password}"> Cliquer ici pour confirmer son inscription </a></p>`, // html body
            // attachments: params.attachments
          };
      
       
    
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error while sending mail: ' + error);
                res.status(200).send([{error:error}])
            } else {
                console.log('Message sent: %s', info.messageId);
                res.status(200).send([{sent:'Message sent ' + info.messageId}])
            }
            

        })

      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
   
  });

  
  router.post('/send_email_for_group_creation', function (req, res) {
    console.log("send_email_for_group_creation")
    let id =req.body.id;
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

    users.findOne({
      where:{
        id:id
      }
    }).then(user=>{
      if(user){
          let list_of_members=user.list_of_members;
          let compt=0;
          for(let i=0; i<list_of_members.length;i++){
            users.findOne({
              where:{
                id:list_of_members[i],
                status:"account",
              }
            }).then(user_found=>{

              if(user.type_of_account.includes('Artiste')){
                var mailOptions = {
                  from: 'Linkarts <services@linkarts.fr>', // sender address
                  to: user_found.email, // my mail
                  //cc:"adam.drira@etu.emse.fr",
                  subject: `Création d'un groupe`, // Subject line
                  //text: 'plain text', // plain text body
                  html:  `<p><a href="http://localhost:4200/account/${user_found.nickname}/${user_found.id}"> Cliquer ici pour confirmer ou rejeter la création du groupe </a></p>`, // html body
                  // attachments: params.attachments
                };
              }
              else{
                let password=genere_random_id(user_found.id);
                console.log(user.email)
                console.log(password)
                user_found.update({
                  "password_registration":password
                })
                var mailOptions = {
                  from: 'Linkarts <services@linkarts.fr>', // sender address
                  to: user_found.email, // my mail
                  //cc:"adam.drira@etu.emse.fr",
                  subject: `Confirmation d'inscription`, // Subject line
                  //text: 'plain text', // plain text body
                  html:  `<p><a href="http://localhost:4200/registration/${user_found.id}/${password}"> Cliquer ici pour confirmer son inscription </a></p>`, // html body
                  // attachments: params.attachments
                };
              }
             

              transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error while sending mail: ' + error);
                    compt++;
                    if(compt==list_of_members.length){
                      res.status(200).send([{error:error}])
                    }
                   
                } else {
                    console.log('Message sent: %s', info.messageId);
                    compt++;
                    if(compt==list_of_members.length){
                      res.status(200).send([{sent:'Message sent ' + info.messageId}])
                    }
                  
                }
            })
            })
          }

        
    
        
    
      

      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
   
  });


 
}