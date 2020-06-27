const multer = require('multer');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";



module.exports = (router, Liste_users) => {



function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};

router.post('/add_profile_pic', function (req, res) {
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
            req.files.forEach(function(item) {
                console.log("item uploaded");
            });
            User = await Liste_users.findOne({
                where: {
                  id: current_user,
                }
              })
              .then(User =>  {
                User.update({
                  "profile_pic_file_name":filename,
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
        } else {
            req.files.forEach(function(item) {
                console.log("item uploaded");
            });
            User = await Liste_users.findOne({
                where: {
                  id: current_user,
                }
              })
              .then(User =>  {
                User.update({
                  "cover_pic_file_name":filename,
                }).then(res.status(200).send(([{ "cover_pic_file_name": filename}])))
              }); 
        }
        })();
    });
});



router.get('/retrieve_profile_picture/:user_id', function (req, res) {
  (async () => {

    const user_id = parseInt(req.params.user_id);

    User = await Liste_users.findOne({
      where: {
        id: user_id,
      }
    })
    .then(User =>  {

      let filename = "./data_and_routes/profile_pics/" + User.profile_pic_file_name;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        res.status(200).send(data);
      } );
    }); 

  })();

});


router.get('/retrieve_cover_picture/:user_id', function (req, res) {
  (async () => {

    const user_id = req.params.user_id;

    User = await Liste_users.findOne({
      where: {
        id: user_id,
      }
    })
    .then(User =>  {
      let filename = "./data_and_routes/cover_pics/" + User.cover_pic_file_name ;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        //blob = data.toBlob('application/image');
        res.status(200).send(data);
      } );
    }); 

  })();

});



router.get('/retrieve_profile_data/:user_id', function (req, res) {
  (async () => {

    const user_id = req.params.user_id;
    Liste_users.findOne({
      where: {
        id: user_id,
      }
    })
    .then(User =>  {
      
        res.status(200).send([User]);
      } );
  })();

});

router.get('/get_user_id_by_pseudo/:pseudo', function (req, res) {
  (async () => {

    const pseudo = req.params.pseudo;
    User = await Liste_users.findOne({
      where: {
        nickname: pseudo,
      }
    })
    .then(User =>  {
        res.status(200).send([User]);
      } );
  })();

});

router.get('/get_pseudo_by_user_id/:user_id', function (req, res) {
  (async () => {

    const user_id = parseInt(req.params.user_id);
    User = await Liste_users.findOne({
      where: {
        id: user_id,
      }
    })
    .then(User =>  {
        res.status(200).send([User]);
      } );
  })();

});




  //
  router.post('/modify_bio', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);

    (async () => {
    const bio= req.body.bio;
    const training = req.body.training;
    const job = req.body.job;
    const location = req.body.location;
    
    User = await Liste_users.findOne({
      where: {
        id: current_user,
      }
    })
    .then(User =>  {
      User.update({
        "primary_description":bio,
        "training":training,
        "job":job,
        "location":location,
      }).then(res.status(200).send([User]))
    }); 

    })();
    });






}