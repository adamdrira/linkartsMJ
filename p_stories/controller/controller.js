const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const multer = require('multer');
const fs = require('fs');
var path = require('path');

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");


module.exports = (router, list_of_stories,list_of_views,Users,list_of_subscribings) => {

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
        const Op = Sequelize.Op;
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        list_of_stories.count({
            where: {
                status:"public",
                id_user: current_user,
                createdAt: {[Op.gte]: yesterday}
            },
        }).catch(err => {
            console.log(err)
            res.status(500).send([{error:err}])
        }).then(num=>{
            if(num>15){
                res.status(200).send([{num:15}])
            }
            else{
                add_story()
            }
        })


        function add_story(){
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
                
                file_name = current_user + '-' + Today + '.svg';
                console.log(file_name)
                cb(null, current_user + '-' + Today + '.svg');
                }
            });
            
            let upload_story = multer({
                storage: storage
            }).any();
    
            upload_story(req, res, function(err){
                if(err){
                    console.log(err)
                    res.status(500).send([{error:err}])
                }
                else{
                    console.log("upload story")
                    console.log(req.files);
                    console.log(res.files);
                    (async () => {
                        let filename = "./data_and_routes/stories/" + file_name ;
                        const files = await imagemin([filename], {
                        destination: './data_and_routes/stories',
                        plugins: [
                            imageminPngquant({
                                quality: [0.7, 0.8]
                            })
                        ]
                        });
    
                        console.log("creation")
                        list_of_stories.create({
                            "id_user": current_user,
                            "status":"public",
                            "file_name": file_name,
                            "views_number": 0,
                        }).catch(err => {
                            console.log(err);	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(stories=>{
                            console.log(stories)
                            res.status(200).send([stories]);
                        });
                    })();
                    
    
                    
                }
                    
                
            });
        }
        

    });



    
    router.post('/check_stories_for_account', function (req, res) {
        console.log("check_stories_for_account")
      
        const current_user = get_current_user(req.cookies.currentUser);
        const user_id=req.body.user_id;
        const Op = Sequelize.Op;
        var today= new Date();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let stories_retrieved=[];
        let story_found=false;
        let status=false;

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
            .catch(err => {
                console.log(err);			
            }).then(stories =>  {

                if(stories.length>0){
                    stories_retrieved=stories;
                    story_found=true;

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
    
                        if (number_of_stories==number_of_stories_seen ){
                            res.status(200).send([{stories_retrieved:stories_retrieved,story_found:story_found,status:status}])
                         
                        }
                       
                        else {
                            status=true;
                            res.status(200).send([{stories_retrieved:stories_retrieved,story_found:story_found,status:status}])
                     
                        }
                            
                    })();
                }
                else{
                    stories_found=false;
                    res.status(200).send([{stories_retrieved:stories_retrieved,story_found:story_found,status:status}])

                }
            })
    })
    
    router.post('/get_stories_and_list_of_users', function (req, res) {
        console.log("get_stories_and_list_of_users")
      
        const current_user = get_current_user(req.cookies.currentUser);
        let list_of_users=[current_user];
        const Op = Sequelize.Op;
        var today= new Date();
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        var last_week = new Date();
        last_week.setDate(last_week.getDate() - 7);
        let list_of_stories_s=[];
        let list_of_states=[];
        let list_of_number_of_views=[];
        let compt=0;
        let list_of_users_data=[];
        
        list_of_subscribings.findAll({
            where: {
                status:"public",
                id_user:current_user,
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
        }).then(users =>  {

            if(users.length>0){
                for(let i=0;i<users.length;i++){
                    list_of_users.push(users[i].id_user_subscribed_to);
                }
                for(let i=0;i<list_of_users.length;i++){
                    let user_id= list_of_users[i];
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
                    .catch(err => {
                        console.log(err);			
                    }).then(stories =>  {
                        
                        if(stories.length>0){
                            (async () => {
        
                           
        
                                const user_data = await Users.findOne({
                                    where: {
                                        id:user_id,
                                    },
                                });
                                list_of_users_data[i]=user_data;
            
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
            
                                if ((number_of_stories==number_of_stories_seen && number_of_stories>0) || number_of_stories==0){
                                    
                                    list_of_views.count({
                                        where: {
                                            status:"public",
                                            authorid: user_id,
                                            id_user_who_looks: current_user,
                                            [Op.and]: [{ createdAt:{[Op.gte]: last_week} }, { createdAt:{[Op.lte]: today} }],
                                                
                                        },
                                    }).catch(err => {
                                        console.log(err);		
                                    }).then(number=>{
                                        list_of_stories_s[i]=stories;
                                        list_of_states[i]=false;
                                        list_of_number_of_views[i]=number;
                                        compt++;
                                        if(compt==list_of_users.length){
                                            res.status(200).send([{list_of_users:list_of_users,list_of_stories_s:list_of_stories_s,list_of_states:list_of_states,list_of_number_of_views:list_of_number_of_views,list_of_users_data:list_of_users_data}])
                                        }
                                       
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
                                        }).catch(err => {
                                            console.log(err);		
                                        }).then(number=>{
                                            list_of_stories_s[i]=stories;
                                            list_of_states[i]=true;
                                            list_of_number_of_views[i]=number;
                                            compt++;
                                            if(compt==list_of_users.length){
                                                res.status(200).send([{list_of_users:list_of_users,list_of_stories_s:list_of_stories_s,list_of_states:list_of_states,list_of_number_of_views:list_of_number_of_views,list_of_users_data:list_of_users_data}])
                                            }
                                        })
                                }
                                    
                            })();
                        }
                        else{
                            (async () => {
                                const user_data = await Users.findOne({
                                    where: {
                                        id:user_id,
                                    },
                                });
                                list_of_users_data[i]=user_data;
                                list_of_stories_s[i]=stories;
                                list_of_states[i]=false;
                                list_of_number_of_views[i]=0;
                                compt++;
                                if(compt==list_of_users.length){
                                    res.status(200).send([{list_of_users:list_of_users,list_of_users_data:list_of_users_data,list_of_stories_s:list_of_stories_s,list_of_states:list_of_states,list_of_number_of_views:list_of_number_of_views}])
                                }
                            })();
                           
                        }
                        
                    }); 
                }
            }
            else{
                res.status(200).send([{list_of_users:list_of_users,list_of_users_data:list_of_users_data,list_of_stories_s:list_of_stories_s,list_of_states:list_of_states,list_of_number_of_views:list_of_number_of_views}])
            }
            
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
            .catch(err => {
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(stories =>  {
                
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
                          }).catch(err => {
                            console.log(err);	
                            res.status(500).json({msg: "error", details: err});		
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
                          }).catch(err => {
                                console.log(err);	
                                res.status(500).json({msg: "error", details: err});		
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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(stories =>  {
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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(story =>  {
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
                  }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(number=>{console.log(number);
                      res.status(200).send([{"total":number}])})
                   
           
            });

        router.get('/retrieve_story/:file_name', function (req, res) {
            let filename = "./data_and_routes/stories/" + req.params.file_name ;
            fs.readFile( path.join(process.cwd(),filename), function(e,data){
                if(e){
                    filename = "./data_and_routes/not-found-image.jpg";
                    fs.readFile( path.join(process.cwd(),filename), function(e,data){
                      res.status(200).send(data);
                    } );
                }
                else{
                res.status(200).send(data);
                }
              
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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(story=>{res.status(200).send([story])})        
    
          
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
            }).catch(err => {
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(story=>{
                if(story){
                    list_of_views.findOne({
                        where:{
                            "status":"public",
                            "id_user_who_looks": current_user,
                            "authorid": authorid,
                            "id_story": id_story,
                        }
                    }).catch(err => {
                        console.log(err);	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(story_view=>{
                        if(story_view){
                            story_view.update({
                                "view": story_view.view+1
                            }).catch(err => {
                                console.log(err);	
                                res.status(500).json({msg: "error", details: err});		
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
                            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                story.update({
                                    "views_number": story.views_number +1
                                }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(date0=>{
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
                            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(date=>{
                                list_of_views.findOne({
                                    where: {
                                        updatedAt:date,
                                    }
                                }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(story=>{
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
                order: [
                    ['createdAt', 'DESC']
                ]
                }).catch(err => {
                    console.log(err);	
                    res.status(500).json({msg: "error", details: err});		
                }).then(stories=>{
                res.status(200).send([stories])
            })
            
         
           
        });


    



    

}