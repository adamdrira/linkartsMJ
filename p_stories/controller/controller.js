const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const multer = require('multer');
const fs = require('fs');
var path = require('path');




module.exports = (router, list_of_stories,list_of_views) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    router.post('/upload_story', function (req, res) {
        (async () => {
            let current_user = get_current_user(req.cookies.currentUser);
            var file_name='';
            const PATH2= './data_and_routes/stories';
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
                //enlever nickname
                }
            });
            
            let upload_cover = multer({
                storage: storage
            }).any();
        
            upload_cover(req, res, function(err){
                (async ()=> {
                    const stories = await list_of_stories.create({
                        "id_user": current_user,
                        "file_name": file_name,
                        "views_number": 0,
                    }).then(stories=>{
                        res.status(200).send([stories]);
                    });
                })();
                
            });

        })();
    });

    router.get('/get_stories_by_user_id/:user_id', function (req, res) {
        const Op = Sequelize.Op;
        //let last_timestamp =  '2020-04-28T06:40:24.000Z';
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var ss = String(yesterday.getSeconds()).padStart(2, '0');
        var mi = String(yesterday.getMinutes()).padStart(2, '0');
        var hh = String(yesterday.getHours()).padStart(2, '0');
        var dd = String(yesterday.getDate()).padStart(2, '0');
        var mm = String(yesterday.getMonth()+1).padStart(2, '0'); 
        var yyyy = String(yesterday.getFullYear());
        let yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z';

        (async () => {
    
           const user_id= parseInt(req.params.user_id);
             stories = await list_of_stories.findAll({
                where: {
                  id_user: user_id,
                  createdAt: {[Op.gte]: yesterday_timestamp,}
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
              })
              .then(stories =>  {
                res.status(200).send([stories]);
              }); 
        })();
        });

        router.get('/retrieve_story/:file_name', function (req, res) {
            let filename = "./data_and_routes/stories/" + req.params.file_name ;
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            });
        });

        router.post('/check_if_story_already_seen', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            (async () => {
                    const  id_story = req.body.id;
                    list_of_views.findOne({
                            "id_user_who_looks": current_user,
                            "id_story":id_story,
                        })
                        .then(story=>{res.status(200).send([story])})        
    
            })();
        });



    

    

}