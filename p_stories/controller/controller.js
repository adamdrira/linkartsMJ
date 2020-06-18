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
        /*var ss = String(yesterday.getSeconds()).padStart(2, '0');
        var mi = String(yesterday.getMinutes()).padStart(2, '0');
        var hh = String(yesterday.getHours()).padStart(2, '0');
        var dd = String(yesterday.getDate()).padStart(2, '0');
        var mm = String(yesterday.getMonth()+1).padStart(2, '0'); 
        var yyyy = String(yesterday.getFullYear());
        let yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z';*/

        (async () => {
    
           const user_id= parseInt(req.params.user_id);
             stories = await list_of_stories.findAll({
                where: {
                  id_user: user_id,
                  createdAt: {[Op.gte]: yesterday}
                },
                order: [
                    ['createdAt', 'ASC']
                  ],
              })
              .then(stories =>  {
                res.status(200).send([stories]);
              }); 
        })();
        });

        router.get('/get_all_my_stories', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            list_of_stories.findAll({
                    where: {
                      id_user: current_user,
                    },
                    order: [
                        ['createdAt', 'DESC']
                      ],
                  })
                  .then(stories =>  {
                    res.status(200).send([stories]);
                  }); 
            });

    router.get('/check_if_all_stories_seen/:user_id', function (req, res) {
        const current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        //let last_timestamp =  '2020-04-28T06:40:24.000Z';
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        /*var ss = String(yesterday.getSeconds()).padStart(2, '0');
        var mi = String(yesterday.getMinutes()).padStart(2, '0');
        var hh = String(yesterday.getHours()).padStart(2, '0');
        var dd = String(yesterday.getDate()).padStart(2, '0');
        var mm = String(yesterday.getMonth()+1).padStart(2, '0'); 
        var yyyy = String(yesterday.getFullYear());
        let yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z';*/

        (async () => {
            
           const user_id= parseInt(req.params.user_id);
           
           const number_of_stories = await list_of_stories.count({
                where: {
                  id_user: user_id,
                  createdAt: {[Op.gte]: yesterday}
                },
              });
              
            const number_of_stories_seen = await list_of_views.count({
                where: {
                  authorid: user_id,
                  id_user_who_looks: current_user,
                  createdAt: {[Op.gte]: yesterday}
                },
              });
            if (number_of_stories==number_of_stories_seen){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
               
        })();
        });

        router.get('/get_total_number_of_views/:authorid', function (req, res) {
            const current_user = get_current_user(req.cookies.currentUser);
            const Op = Sequelize.Op;
            //let last_timestamp =  '2020-04-28T06:40:24.000Z';
            var last_week = new Date();
            last_week.setDate(before_yesterday.getDate() - 2);
            /*var ss = String(before_yesterday.getSeconds()).padStart(2, '0');
            var mi = String(before_yesterday.getMinutes()).padStart(2, '0');
            var hh = String(before_yesterday.getHours()).padStart(2, '0');
            var dd = String(before_yesterday.getDate()).padStart(2, '0');
            var mm = String(before_yesterday.getMonth()+1).padStart(2, '0'); 
            var yyyy = String(before_yesterday.getFullYear());
            let before_yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z';*/

            var today = new Date();
            today.setDate(today.getDate());
            /*var ss1 = String(today.getSeconds()).padStart(2, '0');
            var mi1 = String(today.getMinutes()).padStart(2, '0');
            var hh1 = String(today.getHours()).padStart(2, '0');
            var dd1 = String(today.getDate()).padStart(2, '0');
            var mm1 = String(today.getMonth()+1).padStart(2, '0'); 
            var yyyy1 = String(today.getFullYear());
            let today_timestamp =  yyyy1 + '-' + mm1 + '-' + dd1 + 'T' + hh1 + ':' + mi1 + ':' + ss1+ '.000Z';*/
    
            (async () => {
        
               const authorid= parseInt(req.params.authorid);
               console.log(authorid);
               const number_of_stories = await list_of_views.count({
                    where: {
                      authorid: authorid,
                      id_user_who_looks: current_user,
                      [Op.and]: [{ createdAt:{[Op.gte]: last_week} }, { createdAt:{[Op.lte]: today} }],
                          
                    },
                  }).then(number=>{console.log(number);
                      res.status(200).send([{"total":number}])})
                   
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
                    const  id_story = req.body.id_story;
                    list_of_views.findOne({
                        where:{
                            id_user_who_looks: current_user,
                            id_story:id_story,
                        }
                        })
                        .then(story=>{res.status(200).send([story])})        
    
            })();
        });

        router.post('/add_view', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            (async () => {
                const  id_story = req.body.id_story;
                const  authorid = req.body.authorid;
                const  bool = req.body.bool;
                console.log(bool);
                let story= await list_of_stories.findOne({
                    where:{
                        id:id_story,
                    }
                })

                if (bool){
                    await list_of_views.create({
                        "id_user_who_looks": current_user,
                        "authorid": authorid,
                        "id_story": id_story,
                        "view":0
                    }).then(views=>{
                        story.update({
                            "views_number": story.views_number +1
                        }).then(res.status(200).send([views]));
                    });
                }
                else{
                    await list_of_views.findOne({
                        where:{
                            "id_user_who_looks": current_user,
                            "authorid": authorid,
                            "id_story": id_story,
                        }
                    }).then(story_view=>{
                        story_view.update({"view": story_view.view+1
                    }).then(view=>{
                            console.log(view.id);
                            res.status(200).send([view])
                        });
                    })
                   

                }
                
    
            })();
        });


        router.post('/get_last_seen_story', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            const Op = Sequelize.Op;
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            (async () => {
                    const  authorid = req.body.authorid;

                    list_of_stories.max('createdAt',{
                        where:{
                            id_user: authorid,
                            createdAt:{[Op.gt]:yesterday}
                        }
                        })
                        .then(date0=>{
                            console.log(date0)
                            if(date0!=0){
                                console.log(date0)
                                list_of_views.max('updatedAt',{
                                    where:{
                                        id_user_who_looks: current_user,
                                        authorid:authorid,
                                        updatedAt:{[Op.gt]:yesterday}
                                    }
                                    })
                                    .then(date=>{
                                        list_of_views.findOne({
                                            where: {
                                                updatedAt:date,
                                            }
                                        }).then(story=>{
                                            res.status(200).send([story])})  
                                        })
                            }
                            else{
                                res.status(200).send([null])
                            }
                            
                        })   
            })();
        });

        router.delete('/delete_story/:id', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            (async () => {    
                const id = parseInt(req.params.id);
                const story =await list_of_stories.findOne({
                    where: {
                        id:id,
                        id_user:current_user,
        
                    },
                })
                .then(story=>{
                    story.destroy({
                        truncate: false
                    })});
                res.status(200).send([story]);
                    
                })();
            
        });


    

    

}