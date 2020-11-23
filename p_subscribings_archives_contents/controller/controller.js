const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');




module.exports = (router, list_of_subscribings, list_of_contents,list_of_archives, list_of_users, list_of_navbar) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
        };

    router.post('/add_to_archive', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let publication_id=req.body.publication_id;
        let  format = req.body.format;
        let  publication_category = req.body.publication_category;
        list_of_archives.create({
                "id_archiver": current_user,
                "publication_id":publication_id,
                "format":format,
                "publication_category":publication_category,
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives=>{res.status(200).send([archives])})     
    });

    router.post('/unarchive', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let publication_id=req.body.publication_id;
        let  format = req.body.format;
        let  publication_category = req.body.publication_category;
        list_of_archives.findOne({
            where:{
                id_archiver: current_user,
                publication_id:publication_id,
                format:format,
                publication_category:publication_category,
                }
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives=>{

                archives.destroy({
                    truncate: false
                    })
                res.status(200).json([{"delete":"ok"}])
            })   
    });

    
    
    

    router.get('/check_if_publication_archived/:publication_category/:format/:publication_id', function (req, res) {
        
        let current_user = get_current_user(req.cookies.currentUser);
        const publication_category=req.params.publication_category;
        const format=req.params.format;
        const publication_id=parseInt(req.params.publication_id);
        list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:publication_category,
                format:format,
                publication_id:publication_id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives =>  {
            if(archives.length>0){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
            
        }); 
    });

    router.get('/list_of_archives_comics', function (req, res) {
        
        let current_user = get_current_user(req.cookies.currentUser);
        list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"comic",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives =>  {
            res.status(200).send([archives])
        }); 
    
    });

    router.get('/list_of_archives_drawings', function (req, res) {
       
        let current_user = get_current_user(req.cookies.currentUser);
        list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"drawings",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives =>  {
            res.status(200).send([archives])
        }); 
   
    });

    router.get('/list_of_archives_writings', function (req, res) {
        
        let current_user = get_current_user(req.cookies.currentUser);
        list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"writings",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives =>  {
            res.status(200).send([archives])
        }); 
   
    });

    router.get('/list_of_archives_ads', function (req, res) {
       
        let current_user = get_current_user(req.cookies.currentUser);
        list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"ad",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(archives =>  {
            res.status(200).send([archives])
        }); 
    });
  
    router.post('/subscribe_to_a_user', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const id_user_to_subscribe = req.body.id_user_to_subscribe;
        list_of_users.findOne({
            where:{
                id:id_user_to_subscribe,
            }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
            if(us && us.status=="account"){
                list_of_subscribings.create({
                    "status":"public",
                    "id_user": current_user,
                    "id_user_subscribed_to":id_user_to_subscribe,
                })
                .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                    list_of_users.findOne({
                        where:{
                            id:id_user_to_subscribe,
                        }
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                        let list = user.subscribers;
                        if(!list.includes(current_user)){
                            let number=user.subscribers_number +1;
                            user.update({
                                'subscribers': Sequelize.fn('array_append', Sequelize.col('subscribers'), current_user),
                                'subscribers_number':number,
                            })
                            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                                list_of_users.findOne({
                                    where:{
                                        id:current_user,
                                    }
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user1=>{
                                    let list1 = user1.subscribings;
                                    if(list1.includes(id_user_to_subscribe)){
                                            res.status(200).send([{"subscribings":"already sbscribed"}])
                                    }
                                    else{
                                        let number1=user1.subscribings_number +1;
                                        user1.update( {
                                            'subscribings': Sequelize.fn('array_append', Sequelize.col('subscribings'), id_user_to_subscribe),
                                            'subscribings_number':number1,
                                        },
                                        ).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
                                            res.status(200).send([subscribings])
                                        })
                                    }
                                
                                })
                            })
                        }
                        else{
                            list_of_users.findOne({
                                where:{
                                    id:current_user,
                                }
                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user1=>{
                                let list1 = user1.subscribings;
                                if(list1.includes(id_user_to_subscribe)){
                                        res.status(200).send([{"subscribings":"already sbscribed"}])
                                }
                                else{
                                    let number1=user1.subscribings_number +1;
                                    user1.update( {
                                        'subscribings': Sequelize.fn('array_append', Sequelize.col('subscribings'), id_user_to_subscribe),
                                        'subscribings_number':number1,
                                    },
                                    ).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
                                        res.status(200).send([subscribings])
                                    })
                                }
                            
                            })
                        }
                        
                    })
                })  
            }
            else{
                res.status(200).send([{error:"user_deleted"}])
            }
        })
        
       
              

        
    });

    router.delete('/remove_subscribtion/:id_user_subscribed_to', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        
        const id_user_subscribed_to = req.params.id_user_subscribed_to;
    
        list_of_subscribings.findOne({
            where: {
                status:"public",
                id_user:current_user,
                id_user_subscribed_to:id_user_subscribed_to
            },
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
            if(subscribings){
                subscribings.destroy({
                    truncate: false
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                    list_of_users.findOne({
                        where:{
                            id:id_user_subscribed_to,
                        }
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                        let number=user.subscribers_number -1;
                        user.update({
                            'subscribers': Sequelize.fn('array_remove', Sequelize.col('subscribers'), current_user),
                            'subscribers_number':number,
                        },
                            ).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            list_of_users.findOne({
                                where:{
                                    id:current_user,
                                }
                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user1=>{
                                let number1=user1.subscribings_number -1;
                                user1.update( {
                                    'subscribings': Sequelize.fn('array_remove', Sequelize.col('subscribings'), id_user_subscribed_to),
                                    'subscribings_number':number1,
                                },
                                    ).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
                                    res.status(200).send([subscribings])
                                })
                            })
                        })
                    })
                })   
            }
            else{
                res.status(200).send([{error:"already_removed"}])
            }
                   
        })
        
    });

    router.get('/get_all_users_subscribed_to_today/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        const Op = Sequelize.Op;
        var today = new Date();
        today.setDate(today.getDate() - 1);
        list_of_subscribings.findAll({
            where: {
                id_user:id_user,
                status:"public",
                createdAt: {[Op.gte]: today}
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(users_subscribed_to =>  {
            res.status(200).send([users_subscribed_to])
        });   
    });


    router.get('/get_all_users_subscribed_to/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        const Op = Sequelize.Op;
        var today = new Date();
        today.setDate(today.getDate() - 1);
        list_of_subscribings.findAll({
            where: {
                status:"public",
                id_user:id_user,
                createdAt: {[Op.lt]: today}
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(users_subscribed_to =>  {
            res.status(200).send([users_subscribed_to])
        }); 
    });

    router.get('/get_all_subscribed_users/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        list_of_subscribings.findAll({
            where: {
                status:"public",
                id_user_subscribed_to:id_user,
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(users_subscribed_to =>  {
            res.status(200).send([users_subscribed_to])
        });    
    });

    router.get('/check_if_visitor_susbcribed/:id_user_to_check', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);

        //console.log("check_if_visitor_susbcribed")
        const id_user_to_check = req.params.id_user_to_check;
        //console.log(current_user)
        //console.log(id_user_to_check)

        list_of_subscribings.findOne({
            where: {
                id_user:current_user,
                id_user_subscribed_to:id_user_to_check
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribtion=>{
            if(subscribtion){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
        })
            
    
    });
    
    router.post('/add_content', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);

        const category = req.body.category;
        const format = req.body.format;
        const publication_id = parseInt(req.body.publication_id);
        const chapter_number = req.body.chapter_number;
        list_of_contents.create({
            "id_user": current_user,
            "publication_category":category,
            "format": format,
            "publication_id": publication_id,
            "chapter_number": chapter_number,
        
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(contents => {res.status(200).send([contents])})

        
    });


    router.post('/validate_content', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);  
        const category = req.body.category;
        const format = req.body.format;
        const publication_id = parseInt(req.body.publication_id);
        const chapter_number = req.body.chapter_number;
        var today = new Date();
        list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
            if(content){
                content.update({
                    "status":"ok",
                    "real_date":today
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
            }
            else{
                list_of_contents.create({
                    "id_user": current_user,
                    "publication_category":category,
                    "format": format,
                    "publication_id": publication_id,
                    "chapter_number": chapter_number,
                    "status":"ok",
                    "real_date":today
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
            }
            
        })
        
    });

    router.post('/extend_serie_and_update_content', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser); 
        const number_of_chapters = req.body.number_of_chapters;
        const bd_id = req.body.bd_id;
        //console.log("extend_serie_and_update_content")
        //console.log(bd_id)
        //console.log(number_of_chapters)
        var today = new Date();
        list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:"comic",
                format: "serie",
                publication_id: bd_id,
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
            if(content){
                //console.log(content.createdAt)
                content.update({
                    "real_date":today,
                    "chapter_number":number_of_chapters,
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(cont => {
                    //console.log(cont.createdAt)
                    res.status(200).send([cont])
                })
            }
            else{
                res.status(200).send([{error:"content_not_found"}])
            }
            
        })
        
    });

    

    router.post('/change_content_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);  
        const category = req.body.category;
        const format = req.body.format;
        const publication_id = parseInt(req.body.publication_id);
        const chapter_number = req.body.chapter_number;
        const status=req.body.status;
        list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(first_content=>{
            first_content.update({
                "status":status
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {
                let cat=(category=="writing")?"Writing":(category=="drawing")?"Drawing":"Comic";
                //console.log("catcat")
                //console.log(cat)
                list_of_navbar.findAll({
                    where: {
                        publication_category:cat,
                        format: format,
                        target_id: publication_id,
                    },
                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(research=>{
                    if(research.length>0){
                        for(let i=0;i<research.length;i++){
                            if(status=="private"){
                                let stat=(research[i].status=="clicked")?"clicked_private":"clicked_after_research_private"
                                research[i].update({
                                    "status":stat,
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(l=>{
                                    if(i==research.length-1){
                                        res.status(200).send([content])
                                    }
                                })
                            }
                            else{
                                let stat=(research[i].status=="clicked_private")?"clicked":"clicked_after_research"
                                research[i].update({
                                    "status":stat,
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(l=>{
                                    if(i==research.length-1){
                                        res.status(200).send([content])
                                    }
                                })
                            }
                        }
                    }
                    else{
                        res.status(200).send([content])
                    }
                    
                    
                })
                
            })
        })    
    });

    router.delete('/remove_content/:category/:format/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
       
        const category = req.params.category;
        const format = req.params.format;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

      list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number

            },
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(contents=>{
            contents.destroy({
                truncate: false
              })})
        res.status(200).send([contents])
            
    
        
    });

    router.post('/get_all_subscribings_contents', function (req, res) {
        let formdata = req.body.formData;  
        

            list_of_contents.findAll({
                where: {
                    id_user: formdata,
                    status:"ok",
                },
                order: [
                    ['real_date', 'DESC']
                ],
                limit: 15,
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(contents =>  {
                res.status(200).send([contents])
            }); 
         
    });

    router.get('/get_last_contents_of_a_subscribing/:id_user', function (req, res) {
        let id_user = req.params.id_user;  
       

            list_of_contents.findAll({
                where: {
                    id_user: id_user,
                    status:"ok",
                },
                order: [
                    ['real_date', 'DESC']
                ],
                limit: 5,
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(contents =>  {
                res.status(200).send([contents])
            }); 
       
    });


    router.post('/see_more_contents', function (req, res) {
        const Op = Sequelize.Op;
        let formdata = req.body.formData;  
        let last_timestamp = req.body.last_timestamp;
        list_of_contents.findAll({
            where:[
                    {
                id_user: formdata,
                status:"ok",
                createdAt: {[Op.lt]: last_timestamp,}
                    }
            ],
            order: [
                ['real_date', 'DESC']
            ],
            limit: 5,
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(contents =>  {
            res.status(200).send([contents])
        }); 
          
    });


    router.post('/emphasize_content', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
    (async () => {    
        const category = req.body.category;
        const format = req.body.format;
        const publication_id = parseInt(req.body.publication_id);
        const chapter_number = req.body.chapter_number;
        contents = await list_of_contents.findOne({
            where: {
                id_user:current_user,
                emphasize:"yes"
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
            if(content != null){
                content.update({
                    "emphasize":"no"
                })
            }
        });

        content = await list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
            content.update({
                "emphasize":"yes"
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
        })
        })();
    });


    router.post('/remove_emphasizing', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
    (async () => {    
        const category = req.body.category;
        const format = req.body.format;
        const publication_id = parseInt(req.body.publication_id);
        const chapter_number = req.body.chapter_number;
        contents = await list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                publication_id:publication_id,
                format:format,
                chapter_number:chapter_number,
                emphasize:"yes"
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
            content.update({
                "emphasize":"no"
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
        })
        })();
    });

    router.get('/get_emphasized_content/:id_user', function (req, res) {
    (async () => {    
        const id_user = parseInt(req.params.id_user);
        contents = await list_of_contents.findOne({
            where: {
                id_user:id_user,
                emphasize:"yes",
            },
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
        })();
    });

    router.get('/get_new_comic_contents/:id_user', function (req, res) {
         
            const id_user = parseInt(req.params.id_user);
           list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"comic",
                    status:"ok",
                },
                order: [
                    ['real_date', 'DESC']
                ],
                limit: 6,
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
           
    });

    router.get('/get_new_writing_contents/:id_user', function (req, res) {
         
            const id_user = parseInt(req.params.id_user);
            list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"writing",
                    status:"ok",
                },
                order: [
                    ['real_date', 'DESC']
                ],
                limit: 6,
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
       
    });

    router.get('/get_new_drawing_contents/:id_user', function (req, res) {
        
            const id_user = parseInt(req.params.id_user);
            list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"drawing",
                    status:"ok",
                },
                order: [
                    ['real_date', 'DESC']
                ],
                limit: 6,
            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(content => {res.status(200).send([content])})
          
    });


    

    router.post('/remove_all_subscribtions_both_sides', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const id_friend = req.body.id_friend;
    
        list_of_subscribings.findOne({
            where: {
                id_user:current_user,
                id_user_subscribed_to:id_friend
            },
        })
        .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
            if(subscribings){
                subscribings.destroy({
                    truncate: false
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                    list_of_users.findOne({
                        where:{
                            id:id_friend,
                        }
                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                        let number=user.subscribers_number;
                        let subscribers=user.subscribers;
                        if(subscribers && subscribers.indexOf(current_user)>=0){
                            let i= subscribers.indexOf(current_user)
                            number=user.subscribers_number -1;
                            subscribers.splice(i,1)
                        }
                        user.update({
                            'subscribers':subscribers,
                            'subscribers_number':number,
                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            list_of_users.findOne({
                                where:{
                                    id:current_user,
                                }
                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user1=>{
                                let number1=user1.subscribings_number;
                                let subscribings=user1.subscribings;
                                if(subscribings && subscribings.indexOf(id_friend)>=0){
                                    let i= subscribings.indexOf(id_friend)
                                    subscribings.splice(i,1);
                                    number1=user1.subscribings_number -1;
                                }
                                user1.update( {
                                    'subscribings': subscribings,
                                    'subscribings_number':number1,
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
                                        delete_other_subscribtion()
                                })
                            })
                        })
                    })
                })  
            }
            else{
                delete_other_subscribtion()
            }
                    
        })

        function delete_other_subscribtion(){
            list_of_subscribings.findOne({
                where: {
                    id_user:id_friend,
                    id_user_subscribed_to:current_user
                },
            })
            .catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                if(subscribings){
                    subscribings.destroy({
                        truncate: false
                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                        list_of_users.findOne({
                            where:{
                                id:current_user,
                            }
                        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            let number=user.subscribers_number;
                            let subscribers=user.subscribers;
                            if(subscribers && subscribers.indexOf(id_friend)>=0){
                                number=user.subscribers_number -1;
                                let i= subscribers.indexOf(id_friend)
                                subscribers.splice(i,1)
                            }
                            user.update({
                                'subscribers': subscribers,
                                'subscribers_number':number,
                            }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                                list_of_users.findOne({
                                    where:{
                                        id:id_friend,
                                    }
                                }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user1=>{
                                    let number1=user1.subscribings_number;
                                    let subscribings=user1.subscribings;
                                    if(subscribings && subscribings.indexOf(current_user)>=0){
                                        let i= subscribings.indexOf(current_user)
                                        subscribings.splice(i,1);
                                        number1=user1.subscribings_number -1;
                                    }
                                    user1.update( {
                                        'subscribings': subscribings,
                                        'subscribings_number':number1,
                                    }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
                                        res.status(200).send([subscribings])
                                    })
                                })
                            })
                        })
                    }) 
                }
                else{
                    res.status(200).send([{nothing:"nothing"}])
                }
                         
            })
        }

        


    })

    

}