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
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdJBL1lwHzfr3';
const stripe_pv_key="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"
const stripe_key="pk_live_51IXGypFGsFyjiwAl8D492zOHpbG8GeS42sjQ9nsl9oSmb8jELhvoUlMBhvLSbfnvf00DPS2Zq7Aq8n5CChdlAV3s00KuTQLvL5";
const stripe = require('stripe')(stripe_pv_key);
const sharp = require('sharp');

module.exports = (router, 
  users,
  users_links,
  users_blocked,
  users_information_privacy,
  users_groups_managment,
  users_mailing,
  users_strikes,
  users_passwords,
  users_cookies,
  users_remuneration,
  users_visited_pages,
  users_contact_us,
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
    let current_user = get_current_user(req.cookies.currentUser);
    if(!current_user){
      return res.status(401).json({msg: "error"});
    }
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
                  quality: [0.8, 0.9]
              })
              ]
            });
            User = await users.findOne({
                where: {
                  id: current_user,
                }
              })
              .catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
              }).then(User =>  {
                User.update({
                  "profile_pic_file_name":filename,
                }).catch(err => {
                  
                  res.status(500).json({msg: "error", details: err});		
                }).then(res.status(200).send(([{ "profile_pic_name": filename}])))
              }); 
        }
        })();
    });
});

router.post('/add_cover_pic', function (req, res) {

  let current_user = get_current_user(req.cookies.currentUser);
  if(!current_user){
    return res.status(401).json({msg: "error"});
  }

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
                  quality: [0.8, 0.9]
              })
              ]
            });
            User = await users.findOne({
                where: {
                  id: current_user,
                }
              })
              .catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
              }).then(User =>  {
                  User.update({
                    "cover_pic_file_name":filename,
                  }).catch(err => {
                    
                       res.status(500).json({msg: "error", details: err});		
                    })
                    .then(res.status(200).send(([{ "cover_pic_file_name": filename}])))
                }); 
        }
        })();
    });
});



router.get('/retrieve_profile_picture/:user_id', function (req, res) {
  
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
 

    const user_id = parseInt(req.params.user_id);
    users.findOne({
      where: {
        id: user_id,
      }
    }).then(User =>  {
      let transform = sharp()
        transform = transform.resize(50,50)
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
        });
      if(User && User.profile_pic_file_name){
        

        let filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
        fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/profile_pics/default_profile_picture.png";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(transform)
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(transform)
          }     
        })

      }
      else{
        filename = "./data_and_routes/profile_pics/default_profile_picture.png";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(transform);
      }
      
    }); 



});

router.get('/retrieve_profile_picture_by_pseudo/:pseudo', function (req, res) {

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

  users.findOne({
    where: {
      nickname: pseudo,
    }
  })
  .catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(User =>  {
    let transform = sharp()
        transform = transform.resize(130 ,130)
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
        });
    if(User && User.profile_pic_file_name){
      let filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
      fs.access(filename, fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/profile_pics/default_profile_picture.png";
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
      filename = "./data_and_routes/profile_pics/default_profile_picture.png";
      var not_found = fs.createReadStream( path.join(process.cwd(),filename))
      not_found.pipe(transform);
    }
    
  }); 



});



router.post('/retrieve_my_profile_picture', function (req, res) {

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
 
  const user_id = get_current_user(req.cookies.currentUser);

  users.findOne({
    where: {
      id: user_id,
    }
  })
  .catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(User =>  {
    let transform = sharp()
        transform = transform.resize(50,50)
        .toBuffer((err, buffer, info) => {
            if (buffer) {
                res.status(200).send(buffer);
            }
        });
    if(User && User.profile_pic_file_name){
      let filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
      fs.access(filename, fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/profile_pics/default_profile_picture.png";
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
      filename = "./data_and_routes/profile_pics/default_profile_picture.png";
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(transform);
    }
    
  }); 



});


router.get('/retrieve_cover_picture/:user_id', function (req, res) {

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

    const user_id = parseInt(req.params.user_id);

    users.findOne({
      where: {
        id: user_id,
      }
    })
   .then(User =>  {
      if(User && User.cover_pic_file_name  ){
        let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
        fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/cover_pics/default_cover_picture.png";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(res);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(res);
          }     
        })
      }
      else{
        filename = "./data_and_routes/cover_pics/default_cover_picture.png";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(res);
      }
     
    }); 


});


router.get('/retrieve_cover_picture_stories/:user_id', function (req, res) {

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

const user_id = parseInt(req.params.user_id);

users.findOne({
  where: {
    id: user_id,
  }
})
.then(User =>  {
  let transform = sharp()
  transform = transform.resize(200,86)
  .toBuffer((err, buffer, info) => {
      if (buffer) {
          res.status(200).send(buffer);
      }
  });
  if(User && User.cover_pic_file_name  ){
    let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
    fs.access(filename, fs.F_OK, (err) => {
      if(err){
        filename = "./data_and_routes/cover_pics/default_cover_picture.png";
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
    filename = "./data_and_routes/cover_pics/default_cover_picture.png";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(transform);
  }
 
}); 


});


router.get('/retrieve_cover_picture_by_pseudo/:pseudo', function (req, res) {

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

users.findOne({
  where: {
    nickname: pseudo,
  }
})
.catch(err => {
  
  res.status(500).json({msg: "error", details: err});		
}).then(User =>  {
  if(User && User.cover_pic_file_name  ){
    let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
    fs.access(filename, fs.F_OK, (err) => {
      if(err){
        filename = "./data_and_routes/cover_pics/default_cover_picture.png";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(res);
      }  
      else{
        var pp = fs.createReadStream( path.join(process.cwd(),filename))
        pp.pipe(res);
      }     
    })
  }
  else{
    filename = "./data_and_routes/cover_pics/default_cover_picture.png";
    var not_found = fs.createReadStream( path.join(process.cwd(),filename))
    not_found.pipe(res);
  }
 
}); 


});


  router.post('/agree_on_cookies', function (req, res) {

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
    const user_id = get_current_user(req.cookies.currentUser);
    users_cookies.findOne({
      where: {
        id_user: user_id,
      }
    })
    .catch(err => {
      	
      res.status(500).json({msg: "error", details: err});		
    }).then(user_found =>  {
      if(user_found){
        res.status(200).send([{ok:"ok"}]);
      }
      else{
        users_cookies.create({
          "id_user":user_id,
          "agreement":true,
        }).catch(err => {
          	
          res.status(500).json({msg: "error", details: err});		
        }).then(user=>{
          res.status(200).send([user])
        })
      }
    
    }); 

  });


  router.post('/retrieve_my_cover_picture', function (req, res) {

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
  
    const user_id = get_current_user(req.cookies.currentUser);

    users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      if(User && User.cover_pic_file_name  ){
        let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
        fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/cover_pics/default_cover_picture.png";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(res);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(res);
          }     
        })
      }
      else{
        filename = "./data_and_routes/cover_pics/default_cover_picture.png";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(res);
      }
    
    }); 


  });


  router.post('/get_my_remuneration', function (req, res) {

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
    const user_id = get_current_user(req.cookies.currentUser);
    const total_gains = req.body.total_gains;
    if(Number(total_gains)<70){
      res.status(200).send([{is_ok:false,reason:"money"}]) 
    }
    else{
      users.findOne({
        where: {
          id: user_id,
        }
      })
      .catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(User_found =>  {
        if(User_found){
          let now_in_seconds= Math.trunc( new Date().getTime()/1000);
                  
          let time =(User_found.createdAt).toString();
          let uploaded_date_in_second = new Date(time).getTime()/1000;
          if((now_in_seconds - uploaded_date_in_second)<7884000){
            res.status(200).send([{is_ok:false,reason:"time"}]) 
          }
          else{
            res.status(200).send([{is_ok:false,reason:"other"}]) 
          }
        }
        else{
          res.status(200).send([{is_ok:false,reason:"other"}]) 
        }
        
      } );
    }
   
});

router.get('/retrieve_profile_data/:user_id', function (req, res) {

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

    const user_id = req.params.user_id;
    users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );
});

router.get('/retrieve_profile_data_and_check_visitor/:user_id', function (req, res) {

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
  const user_id = req.params.user_id;
  users.findOne({
    where: {
      id: user_id,
    }
  })
  .catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(user =>  {
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(visitor =>  {
  
      res.status(200).send([{user:user,visitor:visitor}]);
    } );
  } );


});

router.post('/retrieve_number_of_contents', function (req, res) {

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
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      if(User){
        Liste_Bd_Serie.findAll({
          where:{
            authorid:id,
            status:"public"
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie=>{
          number_of_comics+=bd_serie.length;
          List_comics_one_shot.findAll({
            where:{
              authorid:id,
              status:"public"
            }
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_os=>{
            number_of_comics+=bd_os.length;
            Drawings_one_page.findAll({
              where:{
                authorid:id,
                status:"public"
              }
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(drawings_os=>{
              number_of_drawings+=drawings_os.length;
              Liste_Drawings_Artbook.findAll({
                where:{
                  authorid:id,
                  status:"public"
                }
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(drawings_at=>{
                number_of_drawings+=drawings_at.length;
                Liste_Writings.findAll({
                  where:{
                    authorid:id,
                    status:"public"
                  }
                }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(writings=>{
                  number_of_writings+=writings.length;
                  list_of_ads.findAll({
                    where:{
                      id_user:id,
                      status:"public"
                    }
                  }).catch(err => {
			
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


router.post('/retrieve_number_of_contents_by_pseudo', function (req, res) {

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

    const pseudo = req.body.pseudo;
    let number_of_comics=0;
    let number_of_drawings=0;
    let number_of_writings=0;
    let number_of_ads=0;
    users.findOne({
      where: {
        nickname: pseudo,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      if(User){
        Liste_Bd_Serie.findAll({
          where:{
            authorid:User.id,
            status:"public"
          }
        }).catch(err => {
      
          res.status(500).json({msg: "error", details: err});		
        }).then(bd_serie=>{
          number_of_comics+=bd_serie.length;
          List_comics_one_shot.findAll({
            where:{
              authorid:User.id,
              status:"public"
            }
          }).catch(err => {
      
            res.status(500).json({msg: "error", details: err});		
          }).then(bd_os=>{
            number_of_comics+=bd_os.length;
            Drawings_one_page.findAll({
              where:{
                authorid:User.id,
                status:"public"
              }
            }).catch(err => {
      
              res.status(500).json({msg: "error", details: err});		
            }).then(drawings_os=>{
              number_of_drawings+=drawings_os.length;
              Liste_Drawings_Artbook.findAll({
                where:{
                  authorid:User.id,
                  status:"public"
                }
              }).catch(err => {
      
                res.status(500).json({msg: "error", details: err});		
              }).then(drawings_at=>{
                number_of_drawings+=drawings_at.length;
                Liste_Writings.findAll({
                  where:{
                    authorid:User.id,
                    status:"public"
                  }
                }).catch(err => {
      
                  res.status(500).json({msg: "error", details: err});		
                }).then(writings=>{
                  number_of_writings+=writings.length;
                  list_of_ads.findAll({
                    where:{
                      id_user:User.id,
                      status:"public"
                    }
                  }).catch(err => {
      
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
			
			res.status(500).json({msg: "error", details: err});		
		}).then(links =>  {
        res.status(200).send([links]);
      } );


});

router.get('/get_user_id_by_pseudo/:pseudo', function (req, res) {
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
   users.findOne({
      where: {
        nickname: pseudo,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );


});

router.get('/get_pseudo_by_user_id/:user_id', function (req, res) {

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

    const user_id = parseInt(req.params.user_id);
    User = await users.findOne({
      where: {
        id: user_id,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
        res.status(200).send([User]);
      } );
  })();

});






  //
  router.post('/edit_account_about_1', function (req, res) {

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
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });

  router.post('/edit_account_about_2', function (req, res) {

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
    
    const email_about=req.body.email_about;
    const location= req.body.location;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      User.update({
        "email_about":email_about,
        "location":location,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });

  router.post('/edit_account_about_3', function (req, res) {

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
    
    const firstname=req.body.firstname;
    const lastname= req.body.lastname;
    const birthday= req.body.birthday;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      User.update({
        "firstname":firstname,
        "lastname":lastname,
        "birthday":birthday,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 

   
  });


  router.post('/block_user', function (req, res) {

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
    var date = req.body.date;
    const id_user_blocked= req.body.id_user_blocked;
    let final_date=new Date();
    if(date){
      date.substring(0,date.length - 5);
      date = date.replace("T",' ');
      date = date.replace("-",'/').replace("-",'/');
      final_date= new Date(date + ' GMT');
    };
    
    users_blocked.create({
      "id_user":current_user,
      "id_user_blocked":id_user_blocked,
      "date":date?final_date:null,
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      res.status(200).send([user])
    })
  });


  router.post('/get_list_of_users_blocked', function (req, res) {

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
    users_blocked.findAll({
      where:{
        [Op.or]:[{id_user: current_user},{id_user_blocked:current_user}],
      },
      order: [
        ['createdAt', 'DESC']
      ],
    }).catch(err => {
			
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
    const id_user=req.body.id_user;
    const Op = Sequelize.Op;
    users_blocked.findOne({
      where:{
        [Op.or]:[{[Op.and]:[{id_user: current_user},{id_user_blocked:id_user}]},{[Op.and]:[{id_user: id_user},{id_user_blocked:current_user}]}],
      }
    }).catch(err => {
      	
      throw err;
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
    const id_user=req.body.id_user;
    const Op = Sequelize.Op;
    users_blocked.findOne({
      where:{
        [Op.or]:[{[Op.and]:[{id_user: current_user},{id_user_blocked:id_user}]},{[Op.and]:[{id_user: id_user},{id_user_blocked:current_user}]}],
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      let date=user.date;
      user.destroy({
        truncate: false
      })
      res.status(200).send([{date:date}])
      
      
    })
  });

  

  router.post('/add_page_visited_to_history', function (req, res) {

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
  let device_info=req.body.device_info;
  const page=req.body.page;
  users.findOne({
    where:{
      id:current_user,
    }
  }).catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(user_found=>{
    if(user_found){
      users_visited_pages.create({
        "id_user":current_user,
        "nickname":user_found.nickname,
        "device_info":device_info,
         "url_page":page,
      }).catch(err => {
    
        res.status(500).json({msg: "error", details: err});		
      }).then(created=>{
        res.status(200).send([created]);
      })
        	
    }
    else{
      res.status(200).send({msg: "not_found"});	
    }
  })
});
  

  router.post('/get_pseudos_who_match_for_signup', function (req, res) {

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
    let pseudo = req.body.pseudo;
    const Op = Sequelize.Op;
    users.findOne({
      where: {
        nickname:pseudo ,
        status:"account",
        type_of_account:["Artiste professionnel","Artiste professionnelle","Artiste"],
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      if(User){
        res.status(200).send([User])
      }
      else{
        users.findOne({
          where: {
            nickname:{[Op.iLike]:'%'+ pseudo + '%'},
            type_of_account:["Artiste profession,el","Artiste professionnelle","Artiste"],
            status:"account",
            gender:{[Op.ne]:'Groupe'}
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User=>{
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
    const id_user = req.body.id_user;
    const primary_description_extended = req.body.primary_description_extended;
    users.findOne({
      where: {
        id:id_user,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
        user.update({
          "primary_description_extended":primary_description_extended,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
          res.status(200).send([us])}
          
        )
        
    }); 

   
  });
  

  router.post('/edit_profile_information', function (req, res) {

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
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
        user.update({
          "email_about":email,
          "birthday":birthday,
          "job":job,
          "training":training
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{res.status(200).send([us])}
        )
    }); 

   
  });


  

  router.post('/get_information_privacy', function (req, res) {

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
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			
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
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User=>{
          res.status(200).send([User])
        })
       
      }
     
    }); 

   
  });


  router.post('/change_information_privacy_public', function (req, res) {

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
    let indice = req.body.indice;
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			
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
    let indice = req.body.indice;
    users_information_privacy.findOne({
      where: {
        id_user:id_user,
      }
    })
    .catch(err => {
			
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
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us =>  {
       res.status(200).send([us])
    }); 

   
  });


  router.post('/get_group_information_by_id', function (req, res) {

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


    
  router.post('/add_artist_in_a_group', function (req, res) {

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
    const list_of_ids=req.body.list_of_ids
    const id_group = req.body.id_group;
    const list_of_shares=req.body.list_of_shares;
    let compt=0;
    users.findOne({
      where:{
        id:id_group,
      }
    }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        let list_of_members=user.list_of_members;
        list_of_members= list_of_members.concat(list_of_ids)
        user.update({
          "list_of_members":list_of_members
        });

        for( let i=0;i<list_of_members.length;i++){
          users_groups_managment.findOne({
            where:{
              id_group:id_group,
              id_user:list_of_members[i],
            }
          }).catch(err => {
            
            res.status(500).json({msg: "error", details: err});		
          }).then(user_found=>{
            if(user_found){
                user_found.update({
                  "share":list_of_shares[i],
                })
            }
            else{
              users_groups_managment.create({
                "id_group":id_group,
                "id_user":list_of_members[i],
                "share":list_of_shares[i],
              })
            }
            compt++;
            if(compt==list_of_members.length){
              res.status(200).send([{user:user}])
            }
          })
         
        }
      }
      else{
        res.status(200).send([{error:"not found"}])
      }
    })
  })
  
  router.post('/validate_group_creation_and_shares', function (req, res) {

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
          if(list_of_members_validations.indexOf(current_user)<0){
            list_of_members_validations.push(current_user);
          }
          users.update({
            "list_of_members_validations":list_of_members_validations
          },{
            where: {
              id:id_group,
            }
          });
         
          let compt=0;
          for( let i=0;i<list_of_ids.length;i++){
            users_groups_managment.findOne({
              where:{
                id_group:id_group,
                id_user:list_of_ids[i],
              }
            }).catch(err => {
              
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
          let compt=0;
          for( let i=0;i<list_of_ids.length;i++){
            users_groups_managment.findOne({
              where: {
                id_group:id_group,
                id_user:list_of_ids[i]
              },
            }).catch(err => {
              
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
    let id_group=req.body.id_group;
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:id_group,
        list_of_members: { [Op.contains]: [current_user] },
      } 
    }).catch(err => {
			
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
    let id_user=req.body.id_user;
    let id_group=req.body.id_group;
    const Op = Sequelize.Op;
    
    users.findOne({
      where:{
        id:id_group,
        list_of_members: { [Op.contains]: [id_user] },
      } 
    }).catch(err => {
			
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
            
            res.status(500).json({msg: "error", details: err});		
          }).then(user_of_group=>{
            let num=list_of_members.length-1;
            if(user_of_group.id_user && user_of_group.id_user==id_user){
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
              let index_val=list_of_members_validations.indexOf(id_user);
              if(index_val>=0){
                list_of_members_validations.splice(index_val,1)
              }
              let index=list_of_members.indexOf(id_user)
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
    let motif=req.body.motif;
    users.findOne({
      where:{
        id:current_user,
        status:"account",
      } 
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "status":"deleted",
          "reason":motif,
          "email":null,
          "nickname":"Utilisateur_introuvable_" +user.id,
          "firstname":"Utilisateur introuvable",
          "lastname":"",
          "profile_pic_file_name":"default_profile_picture.png",
					"cover_pic_file_name":"default_cover_picture.png",
        }).catch(err => {
			
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
    let motif=req.body.motif;
    users.findOne({
      where:{
        id:current_user,
        status:"account",
      } 
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "status":"suspended",
          "reason":motif,
        }).catch(err => {
			
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
    
    users.findOne({
      where:{
        id:current_user,
        status:"suspended",
      } 
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        user.update({
          "status":"account",
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
          List_of_loves.update({
            "status":"public"
          },
          {
            where:{
              author_id_who_loves:current_user,
              status:"suspended"
            }
          });
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
    let value=req.body.value;
    users.fi
    users.findOne({
      where:{
        id:current_user,
      } 
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
      if(user){
        if(value){
          user.update({
            "email_authorization":"true",
          })
        }
        else{
          user.update({
            "email_authorization":"false",
          })
        }
        res.status(200).send([user])
      }
    })

    /*users_mailing.findOne({
      where: {
        id_user: current_user,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user =>  {
      if(user){
        user.update({
          "agreement":value,
        }).catch(err => {
          
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
          
          res.status(500).json({msg: "error", details: err});		
        }).then(real_user=>{
          if(real_user && real_user.status=='account'){
            users_mailing.create({
              "id_user":current_user,
              "agreement":value,
            }).catch(err => {
              
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
    }); */

   
  });


  router.post('/send_message_contact_us', function (req, res) {

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
    let firstname=req.body.firstname;
    let lastname=req.body.lastname;
    let email=req.body.email;
    let message=req.body.message;
    users_contact_us.create({
        "id_user": current_user,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "message": message,
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(message_send =>  {
      if(message_send){
          res.status(200).send([message_send])
      }
    }); 

 
});
  


  router.post('/get_mailing_managment', function (req, res) {

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
    users_mailing.findOne({
      where: {
        id_user: current_user,
      }
    })
    .catch(err => {
				
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
    let id = req.body.id;
    let password= req.body.password;
    let pass='';
    users.findOne({
      where:{
        id:id
      }
    }).then(user=>{
      if(user){
        if(user.password_registration==password){
          user.update({
            "email_checked":true,
            "password_registration":null,
          })
          users_passwords.findAll({
            where: {
              id_user: user.id,
            },
            limit:1,
            order: [
              ['createdAt', 'DESC']
            ],
          }).catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
          }).then(user_found=>{
            if(user_found.length>0){
              const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(user_found[0].iv, 'hex'));
              const decrypted = Buffer.concat([decipher.update(Buffer.from(user_found[0].content, 'hex')), decipher.final()]);
              pass=decrypted.toString();
              res.status(200).send([{user_found:user,pass:pass}])
            }
            else{
              res.status(200).send([{error:"error"}])
            }
          })
         
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


  router.post('/check_password_for_registration2', function (req, res) {

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
    let id = req.body.id;
    let password= req.body.password;
    let pass='';
    users.findOne({
      where:{
        id:id
      }
    }).then(user=>{
      if(user){
        if(user.password_registration==password){
          pass=user.temp_pass;
          user.update({
            "password_registration":null,
            "temp_pass":null,
          })
          res.status(200).send([{user_found:user,pass:pass}])
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
  let id = req.body.id;

    users.findOne({
      where:{
        id:id,
      }
    }).then(user=>{
      if(user){
          let password=genere_random_id(user.id);
          user.update({
            "password_registration":password
          })
          let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
          mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
            mail_to_send+=`
            <table style="width:100%;margin-bottom:20px">

                <tr id="tr2" >
                    <td  align="center" style="background: rgb(2, 18, 54)">
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                        <div style="height:1px;width:20px;background:white;"></div>
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Bienvenue</p>
                    </td>
                </tr>
            </table>`;

            
            let name = user.firstname + " " + user.lastname;
            if(!user.lastname || user.lastname==''){
              name=user.firstname
            }
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
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Nous vous souhaitons la bienvenue sur LinkArts. Veuillez cliquer sur le bouton ci-dessous pour confirmer votre inscription : </p>

                      <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <a href="https://www.linkarts.fr/home/registration/${user.id}/${password}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                              Confirmer mon inscription
                          </a>
                      </div>`

                      if(user.type_of_account.includes("Artiste")){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">En tant qu'${user.type_of_account.toLowerCase()} LinkArts vous offre les avantages suivants : </p>
                        <ol style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Rémunération</b> : Vous pouvez générer des gains proportionnels à votre nombre d'abonnés grâce à vos apparitions en tendances.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Visibilité</b> : Si vous écrivez, que vous dessinez ou que vous faites les deux, LinkArts vous permet d'organiser et de mettre en avant les œuvres que vous publiez. LinkArts vous offre aussi une visibilité supplémentaire dans les coups de cœur si votre compte a moins de 6 mois d'existence et qu'il commence à gagner en popularité. Si de plus, vous faites partie du top 15 des coups de cœur le premier du mois, vous générez alors des gains bonus !</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Collaboration</b> : LinkArts met à votre disposition linkcollab, une section entièrement adaptée à la collaboration. Vous pourrez y retrouver des annonces pour tous types de collaborations principalement en lien avec le monde de l'édition. LinkArts met aussi à votre disposition une messagerie vous permettant d'échanger avec de potentiels collaborateurs ou tout simplement avec vos contacts.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Communauté</b> : LinkArts vous permet de créer une communauté qui peux suivre vos projets de manière régulière que ce soit grâce aux LinkArts Stories ou grâce au fil d'actualité des abonnements dans l'accueil. </li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Exploration </b>: Regorgeant d'artistes du monde de l'édition, LinkArts vous offre le moyen d'explorer cet univers en vous recommandant des œuvres qui sont adaptées à vos préférences. Mais n'hésitez surtout pas à vous perdre dans les différents recoins de ce monde en découvrant d'autres œuvres. </li>
                        </ol>`
                      }
                      else if(user.type_of_account.includes("non art")){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">En tant que ${user.type_of_account.toLowerCase()} LinkArts vous offre les avantages suivants : </p>
                        <ol>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Visibilité</b> : LinkArts propose actuellement aux professionnels la mise en avant de leurs produits dans le mode lecture des annonces et des œuvres. LinkArts propose aussi aux professionnels la mise en avant de leur marque en en-tête de la section linkcollab. Par ailleurs, une plateforme de ventes vous permettant de mettre en avant et de vendre vos produits est en cours de construction.   </li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Collaboration</b> : LinkArts met à votre disposition la section linkcollab, une section entièrement adaptée à la collaboration. Vous pourrez y publier des annonces en lien avec vos activitées. LinkArts met aussi à votre disposition une messagerie afin de servir vos intérêts.</li>
                                
                        </ol>`
                      }
                      else if(user.type_of_account.includes("Maison")){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">En tant que ${user.type_of_account.toLowerCase()} LinkArts vous offre les avantages suivants : </p>
                        <ol>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Visibilité</b> : LinkArts propose actuellement aux maisons d'édition la mise en avant de leurs produits dans le mode lecture des annonces et des œuvres. LinkArts propose aussi aux maisons d'édition la mise en avant de leur marque en en-tête de la section linkcollab. Par ailleurs, une plateforme de ventes vous permettant de mettre en avant et de vendre vos produits est en cours de construction.   </li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Collaboration</b> : LinkArts met à votre disposition la section linkcollab, une section entièrement adaptée à la collaboration. Vous pourrez y publier des annonces en lien avec vos activités. LinkArts met aussi à votre disposition une messagerie afin de servir vos intérêts.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Communauté</b> : LinkArts vous permet de créer une communauté qui peux suivre vos projets de manière régulière que ce soit grâce aux LinkArts Stories ou grâce au fil d'actualité des abonnements dans l'accueil. </li>
                        </ol>`
                      }
                      else if(user.type_of_account.includes("Edit")){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">En tant qu'${user.type_of_account.toLowerCase()} LinkArts vous offre les avantages suivants : </p>
                        <ol>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Visibilité</b> : LinkArts propose actuellement aux maisons d'édition et aux éditeurs la mise en avant de leurs produits dans le mode lecture des annonces et des œuvres. LinkArts propose aussi aux maisons d'édition la mise en avant de leur marque en en-tête de la section linkcollab. Par ailleurs, une plateforme de ventes vous permettant de mettre en avant et de vendre vos produits est en cours de construction.   </li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Collaboration</b> : LinkArts met à votre disposition la section linkcollab, une section entièrement adaptée à la collaboration. Vous pourrez y publier des annonces en lien avec vos activités. LinkArts met aussi à votre disposition une messagerie afin de servir vos intérêts.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Communauté</b> : LinkArts vous permet de créer une communauté qui peux suivre vos projets de manière régulière que ce soit grâce aux LinkArts Stories ou grâce au fil d'actualité des abonnements dans l'accueil. </li>
                        </ol>`
                      }
                      else {
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Regorgeant d'artistes du monde de l'édition, LinkArts vous offre le moyen d'explorer cet univers en vous recommandant des œuvres qui sont adaptées à vos préférences. Mais n'hésitez surtout pas à vous perdre dans les différents recoins de ce monde en découvrant d'autres œuvres.</p> `
                      }

            mail_to_send+=`
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Nous vous remercions pour votre inscription et vous souhaitons une très agréable aventure au sein de LinkArts !</p>
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Très sincèrement, </br>L'équipe LinkArts</p>
                      <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="32" style="height:32px;max-height: 32px;float: left;margin-left:2px" />
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
            from: 'Linkarts <services@linkarts.fr>', 
            to: user.email, // my mail
            //to:"appaloosa-adam@hotmail.fr",
            subject: `Bienvenue sur LinkArts !`, 
            html:  mail_to_send,
          };
      
       
    
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(200).send([{error:error}])
            } else {
                res.status(200).send([{sent:'Message sent ' + info.messageId,user:user}])
            }
            

        })

      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
   
  });

  router.post('/send_email_for_group_edition', function (req, res) {

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
    let id =req.body.id;
    const list_of_ids=req.body.list_of_ids;
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
          let compt=0;
          for(let i=0; i<list_of_ids.length;i++){
            users.findOne({
              where:{
                id:list_of_ids[i],
                status:"account",
              }
            }).then(user_found=>{

            
              let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
              mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
                mail_to_send+=`
                <table style="width:100%;margin-bottom:20px">

                    <tr id="tr2" >
                        <td  align="center" style="background: rgb(2, 18, 54)">
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                            <div style="height:1px;width:20px;background:white;"></div>
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Adhésion à un groupe</p>
                        </td>
                    </tr>
                </table>`;

                let name = user_found.firstname + " " + user_found.lastname;
                if(!user_found.lastname || user_found.lastname==''){
                  name=user_found.firstname
                }
                let start=''
                if(user_found.gender=="Homme"){
                  start=`Cher ${name},`
                }
                else if(user_found.gender=="Femme"){
                  start=`Chère ${name},</p>`
                }
                else if(user_found.gender=="Groupe"){
                  start=`Chers membres du groupe ${name},`
                }

                mail_to_send+=`
                <table style="width:100%;margin:25px auto;">
                  <tr id="tr3">

                      <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous venez d'être ajouté au groupe <b>${user.firstname}</b>.</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez confirmer ou rejeter votre adhésion au groupe en cliquant sur le bouton ci-dessous : </p>

                          <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                              <a href="https://linkarts.fr/account/${user_found.nickname}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                  Gérer mon adhésion
                              </a>
                          </div>

                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;">L'équipe LinkArts</p>
                          <img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="32" style="height:32px;max-height: 32px;float: left;margin-left:2px" />
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
                to: user_found.email, // my mail
                //to:"appaloosa-adam@hotmail.fr",
                subject: `Adhésion à un groupe`, // Subject line
                html: mail_to_send , // html body
              };
              
             

              transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    compt++;
                    if(compt==list_of_ids.length){
                      res.status(200).send([{error:error}])
                    }
                   
                } else {
                    compt++;
                    if(compt==list_of_ids.length){
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
  
  router.post('/send_email_for_group_creation', function (req, res) {

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
    let id =req.body.id;
    let admin_name='';
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
          users.findOne({
            where:{
              id:list_of_members[0],
              status:"account",
            }
          }).then(user_found=>{

            let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
              mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
                mail_to_send+=`
                <table style="width:100%;margin-bottom:20px">

                    <tr id="tr2" >
                        <td  align="center" style="background: rgb(2, 18, 54)">
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                            <div style="height:1px;width:20px;background:white;"></div>
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Création de groupe</p>
                        </td>
                    </tr>
                </table>`;

                let name = user_found.firstname + " " + user_found.lastname;
                if(!user_found.lastname || user_found.lastname==''){
                  name=user_found.firstname
                }
                admin_name=name;
                let start=''
                if(user_found.gender=="Homme"){
                  start=`Cher ${name},`
                }
                else if(user_found.gender=="Femme"){
                  start=`Chère ${name},</p>`
                }
                else if(user_found.gender=="Groupe"){
                  start=`Chers membres du groupe ${name},`
                }

                mail_to_send+=`
                <table style="width:100%;margin:25px auto;">
                  <tr id="tr3">

                      <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous venez de crééer le groupe <b>${user.firstname}</b>.</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous devez confirmer la création du groupe en cliquant sur le bouton ci-dessous : </p>

                          <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                              <a href="https://linkarts.fr/account/${user_found.nickname}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                  Confirmer mon adhésion
                              </a>
                          </div>

                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;">L'équipe LinkArts</p>
                          <img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="32" style="height:32px;max-height: 32px;float: left;margin-left:2px" />
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
              to: user_found.email, // my mail
              //to:"appaloosa-adam@hotmail.fr",
              subject: `Création de groupe`, 
              html:  mail_to_send, 
            };
            
           

            transport.sendMail(mailOptions, (error, info) => {
              if (error) {
                  compt++;
                  if(compt==list_of_members.length){
                    res.status(200).send([{error:error}])
                  }
                 
              } else {
                  compt++;
                  if(compt==list_of_members.length){
                    res.status(200).send([{sent:'Message sent ' + info.messageId}])
                  }
                
              }
            })

            for(let i=1; i<list_of_members.length;i++){
              users.findOne({
                where:{
                  id:list_of_members[i],
                  status:"account",
                }
              }).then(user_found=>{
  
                let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
                mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
                  mail_to_send+=`
                  <table style="width:100%;margin-bottom:20px">
                      <tr id="tr2" >
                          <td  align="center" style="background: rgb(2, 18, 54)">
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                              <div style="height:1px;width:20px;background:white;"></div>
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Adhésion à un groupe</p>
                          </td>
                      </tr>
                  </table>`;

                  let name = user_found.firstname + " " + user_found.lastname;
                  if(!user_found.lastname || user_found.lastname==''){
                    name=user_found.firstname
                  }
                  let start=''
                  if(user_found.gender=="Homme"){
                    start=`Cher ${name},`
                  }
                  else if(user_found.gender=="Femme"){
                    start=`Chère ${name},</p>`
                  }
                  else if(user_found.gender=="Groupe"){
                    start=`Chers membres du groupe ${name},`
                  }

                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                    <tr id="tr3">

                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Le groupe <b>${user.firstname}</b> vient d'être créé par <b>${admin_name}</b></p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez confirmer ou rejeter votre adhésion au groupe en cliquant sur le bouton ci-dessous : </p>

                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://linkarts.fr/account/${user_found.nickname}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Gérer mon adhésion
                                </a>
                            </div>

                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="32" style="height:32px;max-height: 32px;float: left;margin-left:2px" />
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
                  to: user_found.email, // my mail
                  //to:"appaloosa-adam@hotmail.fr",
                  subject: `Création de groupe`, // Subject line
                  html:  mail_to_send, // html body
                };
               
  
                transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      compt++;
                      if(compt==list_of_members.length){
                        res.status(200).send([{error:error}])
                      }
                     
                  } else {
                      compt++;
                      if(compt==list_of_members.length){
                        res.status(200).send([{sent:'Message sent ' + info.messageId}])
                      }
                    
                  }
                })
              })
            }

          })
          
      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
   
  });


  router.post('/create_checkout_session', async (req, res) => {
    let value=req.body.value;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      submit_type: 'donate',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Donation pour LinkArts',
              images: ['https://www.linkarts.fr/assets/img/Logo-LA3.png'],
            },
            unit_amount: value,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://www.linkarts.fr/donation/success`,
      cancel_url: `https://www.linkarts.fr/donation/`,
    });
    res.status(200).send([{ id: session.id, key:stripe_key}]);
  });
 
}