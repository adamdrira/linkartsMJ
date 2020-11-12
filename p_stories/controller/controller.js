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
        let current_user = get_current_user(req.cookies.currentUser);
        console.log("current user stry");
        console.log(current_user)
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
            file_name = current_user + '-' + Today + '.png';
            cb(null, current_user + '-' + Today + '.png');
            }
        });
        
        let upload_cover = multer({
            storage: storage
        }).any();

        upload_cover(req, res, function(err){
            
                list_of_stories.create({
                    "id_user": current_user,
                    "status":"public",
                    "file_name": file_name,
                    "views_number": 0,
                }).then(stories=>{
                    res.status(200).send([stories]);
                });
            
        });

    });

    router.get('/get_stories_by_user_id/:user_id', function (req, res) {
        
      
        const current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        var today= new Date();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var last_week = new Date();
        last_week.setDate(last_week.getDate() - 7);
        const user_id= parseInt(req.params.user_id);
        console.log(user_id);
            list_of_stories.findAll({
            where: {
                id_user: user_id,
                status:"public",
                createdAt: {[Op.gte]: yesterday}
            },
            order: [
                ['createdAt', 'ASC']
                ],
            })
            .then(stories =>  {
                
                (async () => {
                   const number_of_stories = await list_of_stories.count({
                        where: {
                          status:"public",
                          id_user: user_id,
                          createdAt: {[Op.gte]: yesterday}
                        },
                      });
                      
                      
                    const number_of_stories_seen = await list_of_views.count({
                        where: {
                          status:"public",
                          authorid: user_id,
                          id_user_who_looks: current_user,
                          createdAt: {[Op.gte]: yesterday}
                        },
                      });
                      console.log("get_stories_by_user_id")
                      console.log(current_user)
                      console.log(user_id)
                      console.log(number_of_stories)
                      console.log(number_of_stories_seen)
                    if ((number_of_stories==number_of_stories_seen && number_of_stories>0) || number_of_stories==0){
                        
                        list_of_views.count({
                            where: {
                              status:"public",
                              authorid: user_id,
                              id_user_who_looks: current_user,
                              [Op.and]: [{ createdAt:{[Op.gte]: last_week} }, { createdAt:{[Op.lte]: today} }],
                                  
                            },
                          }).then(number=>{
                            res.status(200).send([{stories:stories,state_of_views:false,number_of_views:number}])
                        })
                       
                    }
                    else{
                        list_of_views.count({
                            where: {
                              status:"public",
                              authorid: user_id,
                              id_user_who_looks: current_user,
                              [Op.and]: [{ createdAt:{[Op.gte]: last_week} }, { createdAt:{[Op.lte]: today} }],
                                  
                            },
                          }).then(number=>{
                                res.status(200).send([{stories:stories,state_of_views:true,number_of_views:number}])
                        })
                    }
                       
                })();
            }); 
        
    });

    router.get('/get_all_my_stories', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let limit= req.params.limit;
        let offset= req.params.offset;
        list_of_stories.findAll({
                where: {
                    id_user: current_user,
                    status:"public",
                },
                order: [
                    ['createdAt', 'DESC']
                ]
                })
                .then(stories =>  {
                res.status(200).send([stories]);
                }); 
    });

    router.post('/hide_story', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let id=req.body.id;
        list_of_stories.findOne({
                where: {
                    id_user: current_user,
                    id:id,
                }
                })
                .then(story =>  {
                    story.update({
                        "status":"hide"
                    })
                    res.status(200).send([story]);
                }); 
    });

    router.get('/check_if_all_stories_seen/:user_id', function (req, res) {
        const current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const user_id= parseInt(req.params.user_id);
        console.log("check_if_all_stories_seen");
        console.log(user_id);
        (async () => {
            
          
           
           const number_of_stories = await list_of_stories.count({
                where: {
                  status:"public",
                  id_user: user_id,
                  createdAt: {[Op.gte]: yesterday}
                },
              });
            console.log("number of stories");
              console.log(number_of_stories);
              
              
            const number_of_stories_seen = await list_of_views.count({
                where: {
                  status:"public",
                  authorid: user_id,
                  id_user_who_looks: current_user,
                  createdAt: {[Op.gte]: yesterday}
                },
              });

            console.log("number_of_stories_seen");
            console.log(number_of_stories_seen);
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
            var before_yesterday = new Date();
            before_yesterday.setDate(before_yesterday.getDate() - 2);
            var today = new Date();
            today.setDate(today.getDate());
            
        
               const authorid= parseInt(req.params.authorid);
               console.log(authorid);
               list_of_views.count({
                    where: {
                      status:"public",
                      authorid: authorid,
                      id_user_who_looks: current_user,
                      [Op.and]: [{ createdAt:{[Op.gte]: before_yesterday} }, { createdAt:{[Op.lte]: today} }],
                          
                    },
                  }).then(number=>{console.log(number);
                      res.status(200).send([{"total":number}])})
                   
           
            });

        router.get('/retrieve_story/:file_name', function (req, res) {
            let filename = "./data_and_routes/stories/" + req.params.file_name ;
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
              res.status(200).send(data);
            });
        });

        router.post('/check_if_story_already_seen', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            
            const  id_story = req.body.id_story;
            list_of_views.findOne({
                where:{
                    status:"public",
                    id_user_who_looks: current_user,
                    id_story:id_story,
                }
                })
                .then(story=>{res.status(200).send([story])})        
    
          
        });

        router.post('/add_view', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            
            const  id_story = req.body.id_story;
            const  authorid = req.body.authorid;
            const  bool = req.body.bool;
            console.log(bool);
            list_of_stories.findOne({
                where:{
                    status:"public",
                    id:id_story,
                }
            }).then(story=>{
                if(story){
                    list_of_views.findOne({
                        where:{
                            "status":"public",
                            "id_user_who_looks": current_user,
                            "authorid": authorid,
                            "id_story": id_story,
                        }
                    }).then(story_view=>{
                        if(story_view){
                            story_view.update({
                                "view": story_view.view+1
                            }).then(view=>{
                                    console.log(view.id);
                                    res.status(200).send([view])
                                });
                    
                        }
                        else{
                            list_of_views.create({
                                "status":"public",
                                "id_user_who_looks": current_user,
                                "authorid": authorid,
                                "id_story": id_story,
                                "view":1
                            }).then(views=>{
                                story.update({
                                    "views_number": story.views_number +1
                                }).then(res.status(200).send([views]));
                            });
                        }
                    })

                }
                else{
                    res.status(200).send([{error:"story_not_found"}])
                }
            })

               
        });


        router.post('/get_last_seen_story', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            const Op = Sequelize.Op;
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const  authorid = req.body.authorid;

            list_of_stories.max('createdAt',{
                where:{
                    status:"public",
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
                                status:"public",
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
           
        });

        router.delete('/delete_story/:id', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
           
                const id = parseInt(req.params.id);
                list_of_stories.findOne({
                    where: {
                        id:id,
                        id_user:current_user,
        
                    },
                })
                .then(story=>{
                    story.update({
                        status: "deleted"
                    })});
                res.status(200).send([story]);
                    
           
            
        });

        router.post('/get_list_of_viewers_for_story', function (req, res) {
            let current_user = get_current_user(req.cookies.currentUser);
            let id_story=req.body.id_story
            const Op = Sequelize.Op;
            list_of_views.findAll({
                where:{
                    id_story:id_story,
                },
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('authorid'),Sequelize.col('id_user_who_looks')), 'users'],'authorid','id_user_who_looks'],
            }).then(stories=>{
                res.status(200).send([stories])
            })
            
         
           
        });


    



    

}