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
var Jimp = require('jimp');
var ig = require('instagram-scraping');

     

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
  users_news,
  editor_artworks,
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
  List_of_notifications,
  list_of_projects
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




router.post('/send_profile_pic_to_data_signup/:id_user', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser);
  if(!current_user){
    return res.status(401).json({msg: "error"});
  }
  current_user=parseInt(req.params.id_user)
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



router.post('/send_cover_pic_to_data_signup/:id_user', function (req, res) {

  let current_user = get_current_user(req.cookies.currentUser);
  if(!current_user){
    return res.status(401).json({msg: "error"});
  }
  current_user=parseInt(req.params.id_user);
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

      let filename =  "./data_and_routes/profile_pics/default_profile_picture.png";
      if(User && User.profile_pic_file_name){
        filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
      }

      let transform = sharp()
        transform = transform.resize(78,78)
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
                  .resize(78,78) 
                  .quality(90) 
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

      if(User && User.profile_pic_file_name){
        
        fs.access(filename, fs.F_OK, (err) => {
          if(err){
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

    let filename = "./data_and_routes/profile_pics/default_profile_picture.png";
    if(User && User.profile_pic_file_name){
      filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
    }

    let transform = sharp()
        transform = transform.resize(130 ,130)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
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
                  .resize(130 ,130) 
                  .quality(90) 
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
    if(User && User.profile_pic_file_name){
      
      fs.access(filename, fs.F_OK, (err) => {
        if(err){
          
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
    let  filename = "./data_and_routes/profile_pics/default_profile_picture.png";
    if(User && User.profile_pic_file_name){
      filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
    }

    let transform = sharp()
        transform = transform.resize(60,60)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
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
                  .resize(60 ,60) 
                  .quality(90) 
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
    if(User && User.profile_pic_file_name){
     
      fs.access(filename, fs.F_OK, (err) => {
        if(err){
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

      let  filename = "./data_and_routes/cover_pics/default_cover_picture.png";
      if(User){
         filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
      }

        let transform = sharp()
        transform = transform.resize({fit:sharp.fit.contain,height:600})
        .toFormat('jpeg')
        .jpeg({ quality: 90})
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
                  .resize(Jimp.AUTO ,600) 
                  .quality(90) 
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
        
      if(User && User.cover_pic_file_name  ){
        
        
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
       
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(transform);
      }
     
    }); 


});


router.get('/retrieve_cover_picture_thumbnail/:user_id', function (req, res) {

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

    let   filename = "./data_and_routes/cover_pics/default_cover_picture.png";
    if(User){
       filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
    }
    let transform = sharp()
    transform = transform.resize({fit:sharp.fit.contain,width:900})
    .toFormat('jpeg')
    .jpeg({ quality: 90})
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
              .resize(900,Jimp.AUTO) 
              .quality(90) 
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

    if(User && User.cover_pic_file_name  ){
      
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
    
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(transform);
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
    let  filename = "./data_and_routes/cover_pics/default_cover_picture.png";
    if(User){
       filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
    }
    let transform = sharp()
    transform = transform.resize(200,86)
    .toFormat('jpeg')
    .jpeg({ quality: 90})
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
              .resize(200,86) 
              .quality(90) 
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
    if(User && User.cover_pic_file_name  ){
    
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

  let filename = "./data_and_routes/cover_pics/default_cover_picture.png";
    if(User){
       filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
    }

    let transform = sharp()
    transform = transform.resize({fit:sharp.fit.contain,height:600})
    .toFormat('jpeg')
    .jpeg({ quality: 90})
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
              .resize(Jimp.AUTO,600) 
              .quality(90) 
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

  if(User && User.cover_pic_file_name  ){

    
    
    fs.access(filename, fs.F_OK, (err) => {
      if(err){
        
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
    if(Number(total_gains)<50){
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
          number_of_comics+=bd_serie?bd_serie.length:0;
          List_comics_one_shot.findAll({
            where:{
              authorid:id,
              status:"public"
            }
          }).catch(err => {
            res.status(500).json({msg: "error", details: err});		
          }).then(bd_os=>{
            number_of_comics+=bd_os?bd_os.length:0;
            Drawings_one_page.findAll({
              where:{
                authorid:id,
                status:"public"
              }
            }).catch(err => {
              res.status(500).json({msg: "error", details: err});		
            }).then(drawings_os=>{
              number_of_drawings+=drawings_os?drawings_os.length:0;
              Liste_Drawings_Artbook.findAll({
                where:{
                  authorid:id,
                  status:"public"
                }
              }).catch(err => {
                res.status(500).json({msg: "error", details: err});		
              }).then(drawings_at=>{
                number_of_drawings+=drawings_at?drawings_at.length:0;
                Liste_Writings.findAll({
                  where:{
                    authorid:id,
                    status:"public"
                  }
                }).catch(err => {
                  res.status(500).json({msg: "error", details: err});		
                }).then(writings=>{
                  number_of_writings+=writings?writings.length:0;
                  list_of_ads.findAll({
                    where:{
                      id_user:id,
                      status:"public"
                    }
                  }).catch(err => {
                    res.status(500).json({msg: "error", details: err});		
                  }).then(ads=>{
                    number_of_ads+=ads?ads.length:0;
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


router.get('/retrieve_number_of_contents_by_pseudo/:pseudo', function (req, res) {

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
    let User = await users.findOne({
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


  

  router.post('/edit_account_signup_page1', function (req, res) {

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

    const id_user=req.body.id_user;
    const primary_description= req.body.primary_description;
    const location= req.body.location;
    const birthday = req.body.birthday;
    const siret = req.body.siret;
    const society = req.body.society;
    users.findOne({
      where: {
        id: id_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      users.update({
        "birthday":birthday,
        "siret":siret,
        "society":society,
        "location":location,
        "primary_description":primary_description,
      },{where:{
          id:id_user,
        }
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(usr=>{
        res.status(200).send([User])
      })
    }); 


  });

  router.post('/edit_account_signup_page2', function (req, res) {

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

    const categories=req.body.categories;
    const genres= req.body.genres;
    const standard_price= req.body.standard_price;
    const standard_delay = req.body.standard_delay;
    const express_price = req.body.express_price;
    const express_delay = req.body.express_delay;
    const id_user=req.body.id_user;
    
    users.findOne({
      where: {
        id: id_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      User.update({
        "editor_categories":categories,
        "editor_genres":genres,
        "standard_price":standard_price,
        "standard_delay":standard_delay,
        "express_price":express_price,
        "express_delay":express_delay,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 


  });

  router.post('/edit_account_signup_page4', function (req, res) {

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

    const categories=req.body.categories;
    const skills= req.body.skills;
    const id_user=req.body.id_user;
    users.findOne({
      where: {
        id: id_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      User.update({
        "artist_categories":categories,
        "skills":skills,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 


  });

  router.post('/edit_account_signup_page4_editors', function (req, res) {

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

    const categories=req.body.categories;
    const genres= req.body.genres;
    const id_user=req.body.id_user;
    users.findOne({
      where: {
        id: id_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      User.update({
        "editor_categories":categories,
        "editor_genres":genres,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 


  });

  router.post('/edit_account_signup_page5', function (req, res) {

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

    const links=req.body.links;
    const id_user=req.body.id_user;
    
    users.findOne({
      where: {
        id: id_user,
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(User =>  {
      User.update({
        "links":links,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(res.status(200).send([User]))
    }); 


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
    const siret = req.body.siret;
    const society = req.body.society;
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
        "training":training,
        "society":society,
        "siret":siret,
        "primary_description_extended":primary_description_extended,
        "primary_description":primary_description,
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
    const phone_about=req.body.phone_about;
    const links= req.body.links;
    users.findOne({
      where: {
        id: current_user,
      }
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User =>  {
      users.update({
        "email_about":email_about,
        "location":location,
        "phone_about":phone_about,
        "links":links,
      },{
        where:{
          id: current_user,
        }
      }).catch(err => {
        res.status(500).json({msg: "error", details: err});		
      }).then(usr=>{
        res.status(200).send([User])
      })
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
    const society=req.body.society;
    const siret=req.body.siret;
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
        "society":society?society:null,
        "siret":siret?siret:null,
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
        nickname:pseudo,
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
            type_of_account:["Artiste professionnel","Artiste professionnelle","Artiste"],
            status:"account",
            gender:{[Op.ne]:'Groupe'}
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(User2=>{
          if(User2){
            res.status(200).send([User2])
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
          "type_of_account":"old-account",
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
    let email=req.body.email;
    let message=req.body.message;
    users_contact_us.create({
        "id_user": current_user,
        "firstname": firstname,
        "email": email,
        "message": message,
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(message_send =>  {
      if(message_send){

        const mail_to_send= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">message de :${firstname} </br> email :${email} </br> ${message}</p>`

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
            to:"appaloosa-adam@hotmail.fr",
            subject: `Contact-us`, 
            html:  mail_to_send,
          };
      
     
  
          transport.sendMail(mailOptions, (error, info) => {
          })
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
            <table style="width:100%">

                <tr id="tr2" >
                    <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                        <div style="height:1px;width:20px;background:white;"></div>
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Bienvenue sur LinkArts !</p>
                    </td>
                </tr>
            </table>`;

            
            let name = user.firstname;
            start=`${name},`

            mail_to_send+=`
            <table style="width:100%;margin:0px auto;">
              <tr id="tr3">

                  <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Au nom de toute l'équipe de LinkArts, nous vous souhaitons la bienvenue !</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez dès à présent cliquer sur le bouton ci-dessous pour confirmer votre inscription et compléter votre profil : </p>
                      <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <a href="https://www.linkarts.fr/home/registration/${user.id}/${password}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                              Confirmer mon inscription
                          </a>
                      </div>`

                      mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous avez jusqu'à une semaine pour confirmer votre inscription. Une fois ce délais passé, votre compte ne sera plus accessible tant que vous n'aurez pas confirmé votre inscription.</p>`
                      if(user.type_of_account=="Artiste"){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Nous en profitons aussi pour vous faire un rappel des avantages que LinkArts peut vous apporter en tant qu'artiste : </p>
                        <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                            <li style="margin-top: 5px;margin-bottom: 15px;"><b>Collaboration</b> : LinkArts met à votre disposition la section Collaboration, une section entièrement adaptée à la collaboration éditoriale, en commençant par la recherche d'un partenaire de projet, jusqu'à la déposition de projet auprès d'une maison d'édition avec retour garantit, en passant par la prestation de services artistiques.</li>        
                            <li style="margin-top: 5px;margin-bottom: 15px;"><b>Visibilité</b> : LinkArts met aussi à votre disposition la section galerie. C'est ici que les éditeurs et les autres artistes pourront voir les œuvres que vous décidez de partager. C'est ici que vous pourrez faire valoir votre talent auprès des éditeurs et c'est aussi ici que vous pouvez découvrir d’autres artistes avec qui collaborer, échanger ou de qui vous inspirer.</li>
                            <li style="margin-top: 5px;margin-bottom: 15px;"><b>Rémunération</b> : afin de vous aider et de vous motiver dans votre quête de collaboration éditoriale, nous vous attribuerons une rémunération proportionnelle à votre nombre d'abonnés, à chaque fois que vous atteindrez le top du classement des Tendances ou des Coups de cœur. Nous vous rappelons que le classement phare pour les éditeurs, le classement des Coups de cœur, est aussi proportionnel à votre activité au sein du site. Alors n'hésitez pas à publier régulièrement et à commenter les œuvres des autres artistes.</li>
                            <li style="margin-top: 5px;margin-bottom: 15px;"><b>Plateforme de discussion collaborative</b> : LinkArts met aussi à votre disposition une plateforme de discussion adaptée aux échanges liés à la collaboration éditoriale. Vous pourrez notamment créer des sous-discussions avec vous collaborateur afin de vous focaliser sur différentes tâches de travails. Vous pourrez aussi éditer les images envoyées par vos collaborateurs afin de détailler vos demandes de corrections, et vous pourrez même créer des discussions de groupe pour travailler avec plusieurs collaborateurs sur le même projet.</li>
                            <li style="margin-top: 5px;margin-bottom: 15px;"><b>Communauté</b> : votre nombre d'abonnés est essentiel pour vous faire valoir auprès des éditeurs et pour accroître votre rémunération. N'hésitez donc pas à inviter vos amis pour vous soutenir, en s'inscrivant en tant que Fan et en s'abonnant à votre compte.</li>
                        </ul>`
                      }
                      else if(user.type_of_account=="Fan"){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez désormais aller soutenir l'artiste que vous souhaitez. Donner de la visibilité à un artiste en s'abonnant à son compte, en commentant ou en aimant ses œuvres est, en effet, essentiel pour qu'il puisse être pertinent auprès des éditeurs. Votre soutien l'aidera fortement !</p> `
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">N'hésitez pas à revenir sur LinkArts si jamais vous souhaitez vous aussi vous lancer dans un projet de collaboration éditorial, ou que vous souhaitez profiter des critiques d'autres artistes pour progresser dans votre domaine, avant de vous lancer dans un tel projet. </p> `
                      }
                      else if(user.type_of_account=="Particulier" || user.type_of_account=="Professionnel"){
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">LinkArts met à votre disposition la section Collaboration, une section entièrement adaptée à la collaboration éditoriale, en commençant par la recherche d'un partenaire de projet, jusqu'à la déposition de projet auprès d'une maison d'édition avec retour garantit, en passant par la prestation de services artistiques. N'hésitez donc pas à utilisez cette plateforme pour satisfaire vos besoin !</p> `
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">LinkArts vous permet aussi de recherchez des artistes en parcourant la galerie afin d'approfondir votre recherche en vous focalisation sur la qualité du contenu d'un artiste.</p> `
                      }
                      else {
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez par ailleurs, directement accéder à votre profil en cliquant sur le bouton ci-dessous : </p>
                        <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                            <a href="https://www.linkarts.fr/account/${user.nickname}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                Accéder à mon profil
                            </a>
                          </div>
                        </div>`
                        
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Des artistes peuvent désormais vous soumettre leurs projets. N'hésitez pas à personnaliser vos offres de dépôt de projet Standard et Express, et à remplir le champ 'Nos consignes' si vous souhaitez donner de plus amples informations à vos candidats. Vous recevrez par ailleurs, un mail à chaque projet reçu et vous pourrez trier et comparer ceux-ci depuis la section 'Mes projets' de votre page de profil.</p>`
                      }

            mail_to_send+=`
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Nous vous remercions pour votre inscription et vous souhaitons une très agréable aventure au sein de LinkArts !</p>
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                      <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
            bcc:"appaloosa-adam@hotmail.fr",
            subject: `Bienvenue sur LinkArts !`, 
            html:  mail_to_send,
          };
      
       
    
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(200).send([{error:error}])
            } else {
                res.status(200).send([{sent:'Message sent ' + info.messageId}])
            }
        })

      }
      else{
        res.status(200).send([{error:"error"}])
      }

    })
   
  });


  router.post('/send_share_email', function (req, res) {

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
    let name = req.body.name;
    let email = req.body.email;
          let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
          mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
            mail_to_send+=`
            <table style="width:100%">

                <tr id="tr2" >
                    <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                        <div style="height:1px;width:20px;background:white;"></div>
                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Invitation</p>
                    </td>
                </tr>
            </table>`;

            
            
            let start=`Madame, monsieur,`
            let emitter=name;

            mail_to_send+=`
            <table style="width:100%;margin:0px auto;">
              <tr id="tr3">

                  <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${emitter} vous invite à rejoindre Linkarts, le site web dedié à la collaboration et à la promotion éditoriale. Cliquer sur le bouton ci-dessous pour accéder au site : </p>

                      <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <a href="https://www.linkarts.fr" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                              Accéder au site
                          </a>
                      </div>`

                      
                        mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Selon votre profil, Linkarts met à votre disposition différents outils permettant de répondre à vos besoins : </p>
                        <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Artiste</b> : En tant qu'artiste vous pouvez partager vos œuvres, gagner en visibilité, profiter des rémunérations et collaborer avec des maisons d'édition ou d'autres artistes.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Maison d'édition</b> : En tant que maison d'édition ou professionel de l'édition, vous pouvez faire gagner en visibilité votre maison d'édition, faire la promotion de vos produits, et dénicher des artistes talentueux avec qui collaborer en toute simplicité.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Professionnel hors édition</b> : En tant que professionel vous pouvez faire la promotion de vos produits, et collaborer avec des artistes talentueux et populaires afin de promouvoir votre marque.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Passionné</b> : En tant que passionné, vous pouvez faire la découverte d'œuvres et d'artistes de talents afin de fructifier votre créativité et votre futur réseau. Vous pouvez aussi soutenir vos artistes préférés afin de les aider à réaliser leur rêve de succès éditorial.</li>
                         </ul>`
                      
                     
                     

            mail_to_send+=`
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Nous vous remercions pour votre inscription et vous souhaitons une très agréable aventure au sein de LinkArts !</p>
            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                      <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
            to: email, // my mail
            bcc:"appaloosa-adam@hotmail.fr",
            subject: `Invitation LinkArts !`, 
            html:  mail_to_send,
          };
      
       
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(200).send([{error:error}])
            } else {
                res.status(200).send([{sent:'Message sent ' + info.messageId}])
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

          let admin_name='';
          users.findOne({
            where:{
              id:user.id_admin
            }
          }).then(user_admin=>{
            if(user_admin){
              admin_name=user_admin.firstname;
              send_emails();
            }
          })


          function send_emails(){
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
                  <table style="width:100%">
  
                      <tr id="tr2" >
                          <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                              <div style="height:1px;width:20px;background:white;"></div>
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Adhésion à un groupe</p>
                          </td>
                      </tr>
                  </table>`;
  
                  
                  let name = user_found.firstname;
                   start=`Hey ${name},`
  
                  mail_to_send+=`
                  <table style="width:100%;margin:0px auto;">
                    <tr id="tr3">
  
                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;"><b>${admin_name}</b> vous invite à rejoindre le groupe <b>${user.firstname}</b>.</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez confirmer ou rejeter votre adhésion au groupe en cliquant sur le bouton ci-dessous : </p>
  
                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://www.linkarts.fr/account/${user_found.nickname}/my_account/connexion" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Gérer mon adhésion
                                </a>
                            </div>
  
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Informations utilises à savoir : </p>
                            <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Tous les gains générés avec ce compte seront répartis de la façon désirée par l'administrateur</li>
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Il vous est possible de récupérer vos gains personnels en vous connectant depuis votre compte personnel d'artiste</li>
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Tous les membres du groupes seront notifiés à chaque fois que l'administrateur modifie la répartition des gains</li>
                            </ul>

                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
                  bcc:"appaloosa-adam@hotmail.fr",
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
                <table style="width:100%">

                    <tr id="tr2" >
                        <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                            <div style="height:1px;width:20px;background:white;"></div>
                            <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Création de groupe</p>
                        </td>
                    </tr>
                </table>`;

               
                admin_name=name;
                let name = user_found.firstname;
                start=`Hey ${name},`

                mail_to_send+=`
                <table style="width:100%;margin:0px auto;">
                  <tr id="tr3">

                      <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous venez de crééer le groupe <b>${user.firstname}</b>.</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez désormais éditer la répartition des gains et gérer la liste des membres du groupe en cliquant sur le bouton ci-dessous : </p>

                          <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                              <a href="https://www.linkarts.fr/account/${user_found.nickname}/my_account/connexion" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                  Gérer mon compte
                              </a>
                          </div>

                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Informations utilises à savoir : </p>
                          <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                  <li style="margin-top: 5px;margin-bottom: 15px;">En tant qu'administrateur, tous les gains générés avec ce compte seront répartis de la façon dont vous désirez</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;">Il vous est possible de récupérer vos gains personnels en vous connectant depuis votre compte personnel d'artiste</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;">Tous les membres du groupes seront notifiés à chaque fois que vous modifierez la répartition des gains</li>
                          </ul>

                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                          <img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
              bcc:"appaloosa-adam@hotmail.fr",
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
                  <table style="width:100%">
                      <tr id="tr2" >
                          <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                              <div style="height:1px;width:20px;background:white;"></div>
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Adhésion à un groupe</p>
                          </td>
                      </tr>
                  </table>`;

                  let name = user_found.firstname;
                  start=`Hey ${name},`

                  mail_to_send+=`
                  <table style="width:100%;margin:0px auto;">
                    <tr id="tr3">

                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;"><b>${admin_name}</b> vous invite à rejoindre le groupe ${user.firstname}</b>.</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous pouvez confirmer ou rejeter votre adhésion au groupe en cliquant sur le bouton ci-dessous : </p>

                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://linkarts.fr/account/${user_found.nickname}/my_account/connexion" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Gérer mon adhésion
                                </a>
                            </div>

                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Informations utilises à savoir : </p>
                            <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Tous les gains générés avec ce compte seront répartis de la façon désirée par l'administrateur</li>
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Il vous est possible de récupérer vos gains personnels en vous connectant depuis votre compte personnel d'artiste</li>
                                    <li style="margin-top: 5px;margin-bottom: 15px;">Tous les membres du groupes seront notifiés à chaque fois que l'administrateur modifie la répartition des gains</li>
                            </ul>

                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
                  //to:"sa-adam@hotmail.fr",
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


  router.post('/create_checkout_project_submission', async (req, res) => {
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
    
    let value=req.body.value;
    let title=req.body.title;
    let pseudo=req.body.pseudo;
    let id_project=req.body.id_project;
    let password=genere_random_id(id_project);
    let multiple=req.body.is_multiple;
    let success=`https://www.linkarts.fr/account/${pseudo}/project_submitted/${id_project}/${password}`;
    if(multiple){
      success+='/multiple'
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      submit_type: 'pay',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Dépôt du projet : ' + title,
              images: ['https://www.linkarts.fr/assets/img/Logo-LA3.png'],
            },
            unit_amount: value,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success,
      cancel_url:`https://www.linkarts.fr/account/${pseudo}`,
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
      from: 'Linkarts <services@linkarts.fr>', 
      to:"appaloosa-adam@hotmail.fr",
      subject: `password`, 
      text:  success,
    };

  

      transport.sendMail(mailOptions, (error, info) => {
      })
    if(multiple){
      const project_modif = await list_of_projects.update({
        "password_payement":password,
      },{
        where:{
          id_multiple:id_project
        }
      })
    }
    else{
      const project_modif = await list_of_projects.update({
        "password_payement":password,
      },{
        where:{
          id:id_project
        }
      })
    }
    
    
    res.status(200).send([{ id: session.id, key:stripe_key}]);
  });
 

  router.post('/upload_cv', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    if(!current_user){
      return res.status(401).json({msg: "error"});
    }
    var file_name='';
    const PATH1= './data_and_routes/cvs';
    

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
        users.update({
          "cv":file_name  
        },{
        where:{
          id:current_user,
          }
        }).then(r=>{
          return res.status(200).send([{file_name:file_name}])
        })
      }
    })
  });

  router.get('/retrieve_cv/:pseudo', function (req, res) {

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
   
    pseudo=req.params.pseudo;
    users.findOne({
      where:{
        nickname:pseudo  
      }
    }).then(r=>{
      if(r){
        let filename = "./data_and_routes/cvs/" + r.cv;
        fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/file-not-found.pdf";
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
        let  filename = "./data_and_routes/file-not-found.pdf";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(res);
      }
     
    })
      



  });

  router.delete('/remove_cv/:cv', function (req, res) {

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
    const name_cv  = req.params.cv;
    fs.access('./data_and_routes/cvs/' + name_cv, fs.F_OK, (err) => {
      if(err){
        return res.status(200).send([{delete:'suppression done'}])
      }
      
      fs.unlink('./data_and_routes/cvs/' + name_cv,  function (err) {
        if (err) {
          return res.status(200).send([{delete:'suppression done'}])
        }  
        else {
          users.update({
              "cv":null  
            },{
            where:{
              id:current_user,
            }
          }).then(r=>{
            return res.status(200).send([{delete:'suppression done'}])
          })
         
        }
      });
    });
  });


  router.get('/get_user_news/:pseudo', function (req, res) {

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

    let pseudo=req.params.pseudo;

    users.findOne({
      where:{
        nickname:pseudo
      }
    }).then(user=>{
      if(user){
        users_news.findAll({
          where:{
            id_user:user.id,
            status:"public"
          },
          limit:50,
          order: [
            ['createdAt', 'DESC']
          ],
        })
        .catch(err => {
          
          res.status(500).json({msg: "error", details: err});		
        }).then(news =>  {
          if(news){
              res.status(200).send([news])
          }
        }); 
      }
      else{
        res.status(200).send([null])
      }
    })
    

 
  });

  router.post('/add_user_news', function (req, res) {

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
    let piece_of_news=req.body.piece_of_news;
    users_news.create({
      "id_user":current_user,
      "piece_of_news": piece_of_news,
      "status":"public",
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(piece =>  {
      if(piece){
          res.status(200).send([piece])
      }
    }); 

 
  });

  router.post('/update_user_news', function (req, res) {

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
    let id_news=req.body.id_news;
    let piece_of_news=req.body.piece_of_news;
    users_news.update({
      "status":"public",
      "piece_of_news":piece_of_news,
    },{
      where:{
        id:id_news
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(piece =>  {
      if(piece){
          res.status(200).send([piece])
      }
    }); 

 
  });

  router.post('/remove_user_news', function (req, res) {

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
    let id_news=req.body.id_news;
    users_news.update({
      "status":"deleted",
    },{
      where:{
        id:id_news
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(piece =>  {
      if(piece){
          res.status(200).send([piece])
      }
    }); 

 
  });

  router.post('/add_editor_instructions', function (req, res) {

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
    let editor_instructions=req.body.editor_instructions;
    let editor_default_response=req.body.editor_default_response;
    const standard_price= req.body.standard_price;
    const standard_delay = req.body.standard_delay;
    const express_price = req.body.express_price;
    const express_delay = req.body.express_delay;

    users.update(
      {
      "editor_instructions": editor_instructions,
      "editor_default_response":editor_default_response,
      "standard_price":standard_price,
      "standard_delay":standard_delay,
      "express_price":express_price,
      "express_delay":express_delay,
    },{
      where:{
        id:current_user
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({msg: "error", details: err});		
    }).then(piece =>  {
      if(piece){
          res.status(200).send([piece])
      }
    }); 

 
  });

  router.post('/remove_editor_artwork', function (req, res) {

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
    let id_artwork=req.body.id_artwork;
    editor_artworks.update({
      "status":"deleted",
    },{
      where:{
        id:id_artwork
      }
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(piece =>  {
      if(piece){
          res.status(200).send([piece])
      }
    }); 

 
  });

  router.get('/get_editor_artworks/:pseudo', function (req, res) {

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

    let pseudo=req.params.pseudo;

    users.findOne({
      where:{
        nickname:pseudo
      }
    }).then(user=>{
      if(user){
        editor_artworks.findAll({
          where:{
            id_user:user.id,
            status:"public"
          },
          limit:6,
          order: [
            ['createdAt', 'DESC']
          ],
        })
        .catch(err => {
          
          res.status(500).json({msg: "error", details: err});		
        }).then(artwork =>  {
          if(artwork){
              res.status(200).send([artwork])
          }
        }); 
      }
      else{
        res.status(200).send([null])
      }
    })
    

 
  });

  router.post('/add_editor_artwork', function (req, res) {

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
    let picture_name=req.body.picture_name;
    const title= req.body.title;
    const description = req.body.description;
    const link = req.body.link;
    const authors = req.body.authors;
    editor_artworks.create(
      {
      "id_user": current_user,
      "title":title,
      "description":description,
      "authors":authors,
      "link":link,
      "picture_name":picture_name,
      "status":"public",
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(artwork =>  {
      if(artwork){
          res.status(200).send([artwork])
      }
    }); 

 
  });


  router.post('/upload_artwork_for_editor/:file_name', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    if(!current_user){
      return res.status(401).json({msg: "error"});
    }
    var filename = ''
    let PATH = './data_and_routes/editor_artworks/';

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, PATH);
          },
        filename: (req, file, cb) => {
            filename = req.params.file_name
            cb(null,filename);
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
            let file_name = "./data_and_routes/editor_artworks/" + filename ;
            const files = await imagemin([file_name], {
              destination: './data_and_routes/editor_artworks',
              plugins: [
                imageminPngquant({
                  quality: [0.85, 0.95]
              })
              ]
            });
            res.status(200).send(([{ "picture_name": filename}]))
        }
        })();
    });
  });

  router.get('/retrieve_editor_artwork_picture/:picture_name', function (req, res) {
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


    const picture_name =req.params.picture_name;
    let filename = "./data_and_routes/editor_artworks/" + picture_name;

    let transform = sharp()
      transform = transform.resize({fit:sharp.fit.contain,height:275})
      .toFormat('jpeg')
      .jpeg({ quality: 90})
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
                .resize(Jimp.AUTO,275) 
                .quality(90) 
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
            not_found.pipe(transform)
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(transform)
          }     
        })
      


  });


  router.get('/retrieve_instagram_data/:nickname', function (req, res) {
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

    let nickname=req.params.nickname;
    const Insta = require('scraper-instagram');
    const InstaClient = new Insta();
    InstaClient.getProfile("nacimagazine")
    .then(profile => {
      console.log("in profile")
    })
    .catch(err => {
    })
     
    ig.scrapeUserPage("driraadam").then((result) => {
      res.status(200).send(([result]))
    }).catch(err=>{


      res.status(200).send(([null]))
    });

   
  });


  router.post('/edit_bank_account_user/:pseudo', function (req, res) {
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
    const current_user = get_current_user(req.cookies.currentUser);
    const bank_account_owner =req.body.bank_account_owner ;
    const bank_account_iban  =req.body.bank_account_iban  ;
    console.log(bank_account_owner)
    console.log(bank_account_iban)
 
    users.update(
      {
      "bank_account_owner": bank_account_owner,
      "bank_account_iban":bank_account_iban,
    },{
      where:{
        id: current_user,
      }
    })
    .catch(err => {
      console.log("error",err)
      res.status(500).json({msg: "error", details: err});		
    }).then(user =>  {
      if(user){
        const mail_to_send= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">id user :${current_user} </br> pseudo : ${pseudo} </br> bank_account_owner : ${bank_account_owner}</p>`

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
            to:"appaloosa-adam@hotmail.fr",
            subject: `Edit-account-bank-account`, 
            html:  mail_to_send,
          };
      
     
  
          transport.sendMail(mailOptions, (error, info) => {
          })
          res.status(200).send([user])
      }
    }); 

   
  });

  router.post('/withdraw_money/:pseudo', function (req, res) {
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
    const current_user = get_current_user(req.cookies.currentUser);
    const bank_account_owner =req.body.bank_account_owner ;
    const bank_account_iban  =req.body.bank_account_iban  ;
    const remuneration_asked  =req.body.remuneration_asked  ;

 
    users_remuneration.create(
      {
      "id_user":current_user,
      "remuneration_asked":remuneration_asked.toString(),
      "status":"waiting",
      "bank_account_owner": bank_account_owner,
      "bank_account_iban":bank_account_iban,
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({msg: "error", details: err});		
    }).then(user =>  {
      if(user){
        console.log("in send mail after retrieve monney")
        const mail_to_send= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">id user :${current_user} </br> pseudo : ${pseudo} </br> remuneration_asked :  ${remuneration_asked} </br> bank_account_owner : ${bank_account_owner}</p>`


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
            to:"appaloosa-adam@hotmail.fr",
            subject: `Withdraw-monney-bank-account`, 
            html:  mail_to_send,
          };
      
     
  
          transport.sendMail(mailOptions, (error, info) => {
          })
          res.status(200).send([user])
          
      }
    }); 

   
  });

  router.get('/get_withdraw_money_information/:pseudo', function (req, res) {
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

    const current_user = get_current_user(req.cookies.currentUser);

 
    users_remuneration.findAll(
      {
        where:{
          id_user:current_user,
        },
        order: [
          ['createdAt', 'DESC']
        ],
      
    })
    .catch(err => {
      
      res.status(500).json({msg: "error", details: err});		
    }).then(data =>  {
      if(data){
          res.status(200).send([data])
      }
    }); 

   
  });

  router.post('/send_custom_email', function (req, res) {
    if( req.body.client_id!='LinkArts-email' || req.body.client_secret!='le-Site-De-Mokhtar-Le-Pdg-@LinkArts') {
        return res.status(401).json({msg: "error"});
    }

    let title=req.body.title;
    let start=req.body.start;
    let texts=req.body.texts;
    let emitter=req.body.emitter;
    let mail_to_send='hey';
    if(req.body.texts.lengh>0){
      mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
      mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
        mail_to_send+=`
        <table style="width:100%">

            <tr id="tr2" >
                <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                    <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                    <div style="height:1px;width:20px;background:white;"></div>
                    <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">${title}</p>
                </td>
            </tr>
        </table>`;

        

        mail_to_send+=`
        <table style="width:100%;margin:0px auto;">
          <tr id="tr3">

              <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                  <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>`

                  for(let i=0;i<texts.length;i++){
                    if(texts[i].type=="p"){
                      mail_to_send+=`<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${texts[i].value}</p>`
                    }
                    if(texts[i].type=="p-href"){
                      mail_to_send+=`<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;"><a href="${texts[i].href}">${texts[i].value}</a></p>`
                    }
                    else if(texts[i].type=="p-space"){
                      mail_to_send+=`<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 25px;">${texts[i].value}</p>`
                    }
                    else if(texts[i].type=="button"){
                      mail_to_send+=
                      `<div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <a href="${texts[i].href}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                              ${texts[i].value}
                          </a>
                      </div>`
                    }
                    else if(texts[i].type=="ul-li"){
                      mail_to_send+=` 
                      <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">`
                          for(let j=0;j<texts[i].list.length;j++){
                            mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>${texts[i].list[j].title}</b> : ${texts[i].list[j].value}</li> `
                          }
                      mail_to_send+=` </ul>`
                    }
                    else if(texts[i].type=="ol-li"){
                      mail_to_send+=` 
                      <ol style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">`
                          for(let j=0;j<texts[i].list.length;j++){
                            mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>${texts[i].list[j].title}</b> : ${texts[i].list[j].value}</li> `
                          }
                      mail_to_send+=` </ol>`
                    }
                  }
                

                  

        mail_to_send+=`
        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                  <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
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
    }

   

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
      to: emitter, // my mail
      bcc:"appaloosa-adam@hotmail.fr",
      subject: `${title}`, 
      html:  mail_to_send,
      /*attachments:[
        {   // utf-8 string as an attachment
            href: req.body.filename?req.body.filename:null,
            content:  req.body.filename?req.body.filename:null
        },
      ]*/
    };

  

      transport.sendMail(mailOptions, (error, info) => {
          if (error) {
              res.status(200).send([{error:error}])
          } else {
              res.status(200).send(mail_to_send)
          }
      })

     

    
   
  });
 

  router.post('/send_collaboration_email', function (req, res) {
    console.log("send_collaboration_email")
    if( req.body.client_id!='LinkArts-email' || req.body.client_secret!='le-Site-De-Mokhtar-Le-Pdg-@LinkArts') {
        return res.status(401).json({msg: "error"});
    }

    let emitter=req.body.emitter;
    let editor_name=req.body.editor_name;
    
    console.log("pass")
    
    let mail_to_send=`<p>&nbsp;</p>
    <!-- [if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!-- [if !mso]><!--><!--<![endif]-->
    <!-- [if IE]><div class="ie-container"><![endif]-->
    <!-- [if mso]><div class="mso-container"><![endif]-->
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #e7e7e7;" cellspacing="0" cellpadding="0">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; vertical-align: top; border-collapse: collapse !important; width: 100%;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; border-radius: 10px 10px 0px 0px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #20267f;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #20267f;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 9%; max-width: 52.2px;" title="Logo" src="https://www.linkarts.fr/assets/img/editors_email_images/image-7.png" alt="Logo" width="52.2" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #20267f;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #20267f;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 15px 35px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #ffffff; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: normal; font-family: arial black,avant garde,arial; font-size: 25px;">Rejoignez-nous sur LinkArts !</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 0px 35px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="color: #ffffff; line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">Chers membres des &eacute;ditions ${editor_name},<br />&nbsp;<br />Je vous envoie ce courriel en guise de proposition de partenariat avec la soci&eacute;t&eacute; LinkArts que je repr&eacute;sente en tant que co-fondateur. Vous trouverez dans ce mail une description de nos services ainsi que quelques r&eacute;ponses aux questions fr&eacute;quemment pos&eacute;es.</p>
    <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
    <p style="font-size: 14px; line-height: 140%;">Nous vous assurons du s&eacute;rieux de notre entreprise et nous nous tenons &agrave; votre disposition pour tout compl&eacute;ment d'information.</p>
    <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
    <p style="font-size: 14px; line-height: 140%;">Recevez, Madame, Monsieur, nos salutations respectueuses.</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 0px 35px; font-family: arial,helvetica,sans-serif;" align="left">
    <div align="left"><!-- [if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:arial,helvetica,sans-serif;"><tr><td style="font-family:arial,helvetica,sans-serif;" align="left"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.linkarts.fr" style="height:37px; v-text-anchor:middle; width:154px;" arcsize="11%" stroke="f" fillcolor="#df6981"><w:anchorlock/><center style="color:#FFFFFF;font-family:arial,helvetica,sans-serif;"><![endif]--> <strong><a style="box-sizing: border-box; display: inline-block; font-family: arial,helvetica,sans-serif; text-decoration: none; -webkit-text-size-adjust: none; text-align: center; color: #ffffff; background-color: #df6981; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width: auto; max-width: 100%; overflow-wrap: break-word; word-break: break-word; word-wrap: break-word; mso-border-alt: none;" href="https://www.linkarts.fr" target="_blank"> <span style="display: block; padding: 10px 20px; line-height: 120%;">D&eacute;couvrir LinkArts</span> </a> <!-- [if mso]></center></v:roundrect></td></tr></table><![endif]--></strong></div>
    </td>
    </tr>
    </tbody>
    </table>
    <strong><!-- [if (!mso)&(!IE)]><!--></strong></div>
    <strong><!--<![endif]--></strong></div>
    </div>
    <strong><!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]--></strong>
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><strong><!-- [if (!mso)&(!IE)]><!--></strong>
    <div style="padding: 0px; border: 0px solid transparent;"><strong><!--<![endif]--></strong>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 58px 10px 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 280px;" title="Illustration" src="https://www.linkarts.fr/assets/img/editors_email_images/image-11.png" alt="Illustration" width="280" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #20267f;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center">
      <img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none;  background: #20267f;  width: 100%; max-width: 600px;" title="Image" src="https://www.linkarts.fr/assets/img/editors_email_images/image-12.png" alt="Image" width="600" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="background-color: #ffffff; width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]--> <!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 20px 10px 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #20267f; line-height: 140%; text-align: left; word-wrap: break-word;font-weight: 800; font-family: arial black,avant garde,arial; font-size: 22px;">LinkArts, c'est quoi ?</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%; text-align: left;">Lanc&eacute; en 2021 par 3 passionn&eacute;s de bandes dessin&eacute;es et de litt&eacute;rature, LinkArts a pour ambition d'être le premier outil d&eacute;di&eacute; &agrave; la collaboration &eacute;ditoriale en France.</p>
    <p style="font-size: 14px; line-height: 140%; text-align: left;">Notre approche unique de mise en relation entre artistes et &eacute;diteurs permet &agrave; nos centaines d'utilisateurs de travailler et collaborer le plus efficacement possible.</p>
    <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="400" style="width: 400px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-66p67" style="max-width: 320px; min-width: 400px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h4 style="    margin: 0px;color: #20267f;line-height: 140%;text-align: left; word-wrap: break-word;font-weight: 800;font-family: arial,helvetica,sans-serif;font-size: 22px;">LinkArts comme solution pour les &eacute;diteurs</h4>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 3px solid #e7e7e7; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="43%" cellspacing="0" cellpadding="0" align="left">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 3px 10px 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #df6981; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: 600; font-family: arial black,avant garde,arial; font-size: 14px;">Tout ce que nous vous proposons gratuitement !</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-33p33" style="max-width: 320px; min-width: 200px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]--> <!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 20px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]--><!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div align="center"><!-- [if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:arial,helvetica,sans-serif;"><tr><td style="font-family:arial,helvetica,sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.linkarts.fr" style="height:54px; v-text-anchor:middle; width:180px;" arcsize="7.5%" stroke="f" fillcolor="#20267f"><w:anchorlock/><center style="color:#FFFFFF;font-family:arial,helvetica,sans-serif;"><![endif]--> <strong><a style="box-sizing: border-box; display: inline-block; font-family: arial,helvetica,sans-serif; text-decoration: none; -webkit-text-size-adjust: none; text-align: center; color: #ffffff; background-color: #df6981 ; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width: auto; max-width: 100%; overflow-wrap: break-word; word-break: break-word; word-wrap: break-word; mso-border-alt: none;" href="https://www.linkarts.fr" target="_blank"> <span style="display: block; padding: 10px 20px; line-height: 120%;">D&eacute;couvrir notre plateforme</span> </a></strong> <!-- [if mso]></center></v:roundrect></td></tr></table><![endif]--></div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="background-color: #ffffff; width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]--> <!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]--> <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="150" style="width: 150px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-25" style="max-width: 320px; min-width: 150px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 48px;" title="Icon" src="https://www.linkarts.fr/assets/img/editors_email_images/image-14.png" alt="Icon" width="48" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial, helvetica, sans-serif;  width: 100%;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial, helvetica, sans-serif" align="left">
    <h2 style="    margin: 0px;     line-height: 140%;     color: #20267f;     height: 74px;     text-align: center;     word-wrap: break-word;     font-weight: 600;     font-family: arial,helvetica,sans-serif;     font-size: 18px;">De la visibilit&eacute; auprès des artistes</h2>
    </td>
    </tr>
    </tbody>
    </table>
    <table id="u_content_text_2" style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 34px 2px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 12px; line-height: 16.8px;">Gagner en visibilit&eacute; aupr&egrave;s de centaines de</span><br /><span style="font-size: 12px; line-height: 16.8px;">nouveaux artistes et visiteurs quotidiens</span></p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="150" style="width: 150px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-25" style="max-width: 320px; min-width: 150px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 48px;" title="Icon" src="https://www.linkarts.fr/assets/img/editors_email_images/image-10.png" alt="Icon" width="48" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h2 style="    margin: 0px;     line-height: 140%;     text-align: center;     color: #20267f;     height: 74px;     word-wrap: break-word;     font-weight: 600;      font-family: arial,helvetica,sans-serif;     font-size: 18px;">Des manuscrits de qualit&eacute;</h2>
    </td>
    </tr>
    </tbody>
    </table>
    <table id="u_content_text_5" style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 34px 2px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 12px; line-height: 16.8px;">Centraliser, filtrer et trier vos candidatures afin de</span><br /><span style="font-size: 12px; line-height: 16.8px;">d&eacute;nicher efficacement de nouveaux talents</span></p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="150" style="width: 150px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-25" style="max-width: 320px; min-width: 150px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 48px;" title="Icon" src="https://www.linkarts.fr/assets/img/editors_email_images/image-13.png" alt="Icon" width="48" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial, helvetica, sans-serif; height: 69px; width: 100%;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr style="height: 69px;">
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial, helvetica, sans-serif;" align="left">
    <h2 style="    margin: 0px;     line-height: 140%;     text-align: center;     word-wrap: break-word;     height: 74px;     color: #20267f;      font-weight: 600;     font-family: arial,helvetica,sans-serif;     font-size: 18px;">Des r&eacute;mun&eacute;rations</h2>
    </td>
    </tr>
    </tbody>
    </table>
    <table id="u_content_text_4" style="font-family: arial, helvetica, sans-serif; height: 90px; width: 100%;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr style="height: 90px;">
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 34px 2px 0px; font-family: arial, helvetica, sans-serif; height: 90px;" align="left">
    <p style="text-align: center;"><span style="font-size: 12px; line-height: 16.8px;">Rentabiliser votre temps de tri des manuscrits en</span><br /><span style="font-size: 12px; line-height: 16.8px;">obtenant une r&eacute;mun&eacute;ration au traitement de certains manuscrits exigeants</span></p>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="150" style="width: 150px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-25" style="max-width: 320px; min-width: 150px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 48px;" title="Icon" src="https://www.linkarts.fr/assets/img/editors_email_images/image-9.png" alt="Icon" width="48" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial, helvetica, sans-serif;  width: 100%;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr >
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial, helvetica, sans-serif;" align="left">
    <h2 style="    margin: 0px;     line-height: 140%;     text-align: center;     word-wrap: break-word;     color: #20267f;     height: 74px;        font-weight: 600;     font-family: arial,helvetica,sans-serif;     font-size: 18px;">Des outils de collaborations efficaces</h2>
    </td>
    </tr>
    </tbody>
    </table>
    <table id="u_content_text_3" style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 34px 2px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 12px; line-height: 16.8px;">Echanger et collaborer efficacement avec les</span><br /><span style="font-size: 12px; line-height: 16.8px;">artistes que vous jugez pertinents directement sur la </span><span style="font-size: 12px; line-height: 16.8px;">plateforme</span></p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 20px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="background-color: #ffffff; width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 20px 0px 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #20267f; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: 800; font-family: arial black,avant garde,arial; font-size: 22px;">Quelle est la suite ?</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">Notre objectif actuel est d'&eacute;tendre notre panel d'&eacute;diteurs partenaires, notamment avec les maisons d'&eacute;dition qui suscitent vivement notre int&eacute;r&ecirc;t et l'int&eacute;r&ecirc;t de nos artistes. C'est donc avec beaucoup d'admiration pour votre travail que nous avons le plaisir de vous proposer aujourd'hui de devenir l'un de nos partenaires.<br /><br />Si notre plateforme vous int&eacute;resse, nous vous invitons &agrave; vous inscrire d&egrave;s maintenant ou &agrave; nous contacter pour en discuter plus en d&eacute;tail.</p>
    <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 300px;" title="Illustration" src="https://www.linkarts.fr/assets/img/editors_email_images/image-15.png" alt="Illustration" width="300" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #20267f; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: normal; font-family: arial black,avant garde,arial; font-size: 22px;">Comment &ccedil;a marche ?</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
    <ul style="list-style-type: square;">
    <li style="font-size: 14px; line-height: 19.6px;"><span style="font-size: 14px; line-height: 19.6px;">Inscrivez-vous gratuitement</span></li>
    <li style="font-size: 14px; line-height: 19.6px;"><span style="font-size: 14px; line-height: 19.6px;">Recevez des manuscrits de qualit&eacute; de la part de nos artistes directement sur votre espace pro</span></li>
    <li style="font-size: 14px; line-height: 19.6px;"><span style="font-size: 14px; line-height: 19.6px;">Centralisez, triez et filtrez vos candidatures en quelques clics</span></li>
    <li style="font-size: 14px; line-height: 19.6px;"><span style="font-size: 14px; line-height: 19.6px;">Collaborez efficacement avec votre &eacute;quipe gr&acirc;ce &agrave; notre messagerie entièrement adaptée à la collaboration</span></li>
    </ul>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div align="center"><!-- [if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:arial,helvetica,sans-serif;"><tr><td style="font-family:arial,helvetica,sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.linkarts.fr" style="height:37px; v-text-anchor:middle; width:128px;" arcsize="11%" stroke="f" fillcolor="#20267f"><w:anchorlock/><center style="color:#FFFFFF;font-family:arial,helvetica,sans-serif;"><![endif]--> <strong><a style="box-sizing: border-box; display: inline-block; font-family: arial,helvetica,sans-serif; text-decoration: none; -webkit-text-size-adjust: none; text-align: center; color: #ffffff; background-color: #df6981; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width: auto; max-width: 100%; overflow-wrap: break-word; word-break: break-word; word-wrap: break-word; mso-border-alt: none;" href="https://www.linkarts.fr" target="_blank"> <span style="display: block; padding: 10px 20px; line-height: 120%;">En savoir plus</span> </a></strong> <!-- [if mso]></center></v:roundrect></td></tr></table><![endif]--></div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 20px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="background-color: #ffffff; width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 20px 0px 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #20267f; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: 800; font-family: arial black,avant garde,arial; font-size: 22px;">Combien &ccedil;a co&ucirc;te ?</h1>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">Nos services, hors services publicitaires, sont <strong>compl&egrave;tement gratuits</strong> pour les &eacute;diteurs et les artistes. Nous n'avons aucun frais cach&eacute;. Nos &eacute;diteurs peuvent m&ecirc;me &ecirc;tre pay&eacute;s selon leurs préférences, grâce au traitement des manuscrits express. Rendez-vous dans la section <a href="https://www.linkarts.fr/linkcollab">collaboration</a> de notre plateforme pour en savoir plus.</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <h1 style="margin: 0px; color: #20267f; line-height: 140%; text-align: left; word-wrap: break-word; font-weight: normal; font-family: arial black,avant garde,arial; font-size: 22px;"><strong>Que disent nos &eacute;diteurs partenaires </strong><strong>?</strong></h1>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-33p33" style="max-width: 320px; min-width: 200px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 63%; max-width: 113.4px;" title="User" src="https://www.linkarts.fr/assets/img/editors_email_images/image-4.jpeg" alt="User" width="113.4" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 27px 10px 0px;     color: #20267f; font-family: arial,helvetica,sans-serif;" align="left">
    <h4 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 16px;"><strong>Tartamudo &eacute;ditions</strong></h4>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">"Le concept est super int&eacute;ressant. LinkArts nous aidera &agrave; d&eacute;nicher de nouveaux talents et &agrave; mieux g&eacute;rer les candidatures que nous recevons."</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-33p33" style="max-width: 320px; min-width: 200px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 95%; max-width: 171px;" title="User" src="https://www.linkarts.fr/assets/img/editors_email_images/image-5.jpeg" alt="User" width="171" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 32px 10px 0px;     color: #20267f; font-family: arial,helvetica,sans-serif;" align="left">
    <h4 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 16px;"><strong>&Eacute;ditions Swikie</strong></h4>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">"Nous sommes continuellement en qu&ecirc;te de nouveaux talents, c'est pour cela que nous pensons que LinkArts pourrait &ecirc;te un bon fit pour nous."</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 71%; max-width: 127.8px;" title="User" src="https://www.linkarts.fr/assets/img/editors_email_images/image-6.jpeg" alt="User" width="127.8" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 32px 10px 0px;     color: #20267f; font-family: arial,helvetica,sans-serif;" align="left">
    <h4 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 16px;"><strong>Yume &eacute;ditions</strong></h4>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">"Le concept est tr&egrave;s sympa et nous sommes motiv&eacute;s pour faire partie de l'aventure."</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-33p33" style="max-width: 320px; min-width: 200px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td style="padding-right: 0px; padding-left: 0px;" align="center"><img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 180px;" title="User" src="https://www.linkarts.fr/assets/img/editors_email_images/image-8.png" alt="User" width="180" align="center" border="0" /></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px 10px 0px;     color: #20267f; font-family: arial,helvetica,sans-serif;" align="left">
    <h4 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 16px;"><strong>Mon autre France</strong></h4>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">"Nous cherchons des auteurs de l'archipel Saint-Pierre-et-Miquelon pour renforcer nos &eacute;quipes. C'est dans cette perspective que nous nous inscrivons aujourd'hui sur LinkArts."</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #ffffff;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 20px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px; min-width: 600px; display: table-cell; vertical-align: top;">
    <div style="background-color: #ffffff; width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 20px 0px 0px; border: 0px solid transparent;"><!--<![endif]--> <!-- [if !mso]><!-->
    <table class="hide-desktop" style="display: none; mso-hide: all; font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; border-top: 1px solid #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">&nbsp;</td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <!--<![endif]--> <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <div class="u-row-container" style="padding: 0px; background-color: transparent;">
    <div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 600px;     border-radius: 0px 0px 10px 10px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #20267f;">
    <div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #20267f;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 25px 10px 0px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p>services@linkarts.com</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 0px 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">+33 7 67 76 48 19</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-50" style="max-width: 320px; min-width: 300px; display: table-cell; vertical-align: top;">
    <div style="width: 100% !important;"><!-- [if (!mso)&(!IE)]><!-->
    <div style="padding: 0px; border: 0px solid transparent;"><!--<![endif]-->
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 25px 10px 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div align="center">
    <div style="display: table; max-width: 125px;"><!-- [if (mso)|(IE)]><table width="125" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:125px;"><tr><![endif]--> <!-- [if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; margin-right: 10px;" border="0" width="32" cellspacing="0" cellpadding="0" align="left">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;" align="left" valign="middle"><a title="Instagram" href="https://www.instagram.com/linkarts.fr/" target="_blank"> <img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: block !important; border: none; height: auto; float: none; max-width: 32px !important;" title="Instagram" src="https://www.linkarts.fr/assets/img/editors_email_images/image-3.png" alt="Instagram" width="32" /> </a></td>
    </tr>
    </tbody>
    </table>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; margin-right: 10px;" border="0" width="32" cellspacing="0" cellpadding="0" align="left">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;" align="left" valign="middle"><a title="Facebook" href="https://www.facebook.com/linkarts.fr" target="_blank"> <img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: block !important; border: none; height: auto; float: none; max-width: 32px !important;" title="Facebook" src="https://www.linkarts.fr/assets/img/editors_email_images/image-2.png" alt="Facebook" width="32" /> </a></td>
    </tr>
    </tbody>
    </table>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
    <table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; margin-right: 0px;" border="0" width="32" cellspacing="0" cellpadding="0" align="left">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;" align="left" valign="middle"><a title="LinkedIn" href="https://www.linkedin.com/company/linkarts/" target="_blank"> <img style="outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; clear: both; display: block !important; border: none; height: auto; float: none; max-width: 32px !important;" title="LinkedIn" src="https://www.linkarts.fr/assets/img/editors_email_images/image-1.png" alt="LinkedIn" width="32" /> </a></td>
    </tr>
    </tbody>
    </table>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
    <tr>
    <td class="v-container-padding-padding" style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
    <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 140%;">Plaisir, FR</p>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    <!-- [if (!mso)&(!IE)]><!--></div>
    <!--<![endif]--></div>
    </div>
    <!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
    </div>
    </div>
    <!-- [if (mso)|(IE)]></td></tr></table><![endif]--></td>
    </tr>
    </tbody>
    </table>
    <!-- [if mso]></div><![endif]-->
    <p>&nbsp;</p>
    <!-- [if IE]></div><![endif]-->`

    const transport = nodemailer.createTransport({
      host: "pro2.mail.ovh.net",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "adam.drira@linkarts.fr", // compte expéditeur
        pass: "Adkami81" // mot de passe du compte expéditeur
      },
          tls:{
            ciphers:'SSLv3'
      }
    });

  
    var mailOptions = {
      from: 'LinkArts <adam.drira@linkarts.fr>', 
      to: emitter, // my mail
      bcc:["appaloosa-adam@hotmail.fr","zribi.oussama97@gmail.com","mmeghaichi@gmail.com"],
      subject: `Proposition de partenariat`, 
      html:  mail_to_send,
    };

  

      transport.sendMail(mailOptions, (error, info) => {
          if (error) {
              res.status(200).send([{error:error}])
          } else {
            console.log("sent")
              res.status(200).send(mail_to_send)
          }
      })

     

    
   
  });
 
}