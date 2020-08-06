const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');




module.exports = (router, list_of_subscribings, list_of_contents,list_of_archives, list_of_users) => {

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
        (async () => {
                list_of_archives.create({
                        "id_archiver": current_user,
                        "publication_id":publication_id,
                        "format":format,
                        "publication_category":publication_category,
                    })
                    .then(archives=>{res.status(200).send([archives])})        
        })();
    });

    router.post('/unarchive', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let publication_id=req.body.publication_id;
        let  format = req.body.format;
        let  publication_category = req.body.publication_category;
        (async () => {
            
                list_of_archives.findOne({
                    where:{
                        id_archiver: current_user,
                        publication_id:publication_id,
                        format:format,
                        publication_category:publication_category,
                        }
                    })
                    .then(archives=>{

                        archives.destroy({
                            truncate: false
                          })
                        res.status(200).json([{"delete":"ok"}])
                    })        
        })();
    });

    

    

    router.get('/check_if_publication_archived/:publication_category/:format/:publication_id', function (req, res) {
        (async () => {
        let current_user = get_current_user(req.cookies.currentUser);
        const publication_category=req.params.publication_category;
        const format=req.params.format;
        const publication_id=parseInt(req.params.publication_id);
        archives = await list_of_archives.findAll({
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
        .then(archives =>  {
            if(archives.length>0){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
            
        }); 
    })();
    });

    router.get('/list_of_archives_comics', function (req, res) {
        (async () => {
        let current_user = get_current_user(req.cookies.currentUser);
        archives = await list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"comics",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(archives =>  {
            res.status(200).send([archives])
        }); 
    })();
    });

    router.get('/list_of_archives_drawings', function (req, res) {
        (async () => {
        let current_user = get_current_user(req.cookies.currentUser);
        archives = await list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"drawings",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(archives =>  {
            res.status(200).send([archives])
        }); 
    })();
    });

    router.get('/list_of_archives_writings', function (req, res) {
        (async () => {
        let current_user = get_current_user(req.cookies.currentUser);
        archives = await list_of_archives.findAll({
            where: {
                id_archiver:current_user,
                publication_category:"writings",
            },
            order: [
                ['createdAt', 'DESC']
            ]
        })
        .then(archives =>  {
            res.status(200).send([archives])
        }); 
    })();
    });

    router.get('/list_of_archives_ads', function (req, res) {
        (async () => {
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
        .then(archives =>  {
            res.status(200).send([archives])
        }); 
    })();
    });
  
    router.post('/subscribe_to_a_user', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
                const id_user_to_subscribe = req.body.id_user_to_subscribe;
                list_of_subscribings.create({
                        "id_user": current_user,
                        "id_user_subscribed_to":id_user_to_subscribe,
                    })
                    .then(subscribings=>{
                        list_of_users.findOne({
                            where:{
                                id:id_user_to_subscribe,
                            }
                        }).then(user=>{
                            let number=user.subscribers_number +1;
                            user.update({
                                'subscribers': Sequelize.fn('array_append', Sequelize.col('subscribers'), current_user),
                                'subscribers_number':number,
                            },
                               ).then(user=>{
                                list_of_users.findOne({
                                    where:{
                                        id:current_user,
                                    }
                                }).then(user1=>{
                                    let number1=user1.subscribings_number +1;
                                    user1.update( {
                                        'subscribings': Sequelize.fn('array_append', Sequelize.col('subscribings'), id_user_to_subscribe),
                                        'subscribings_number':number1,
                                    },
                                    ).then(m=>{
                                        res.status(200).send([subscribings])
                                    })
                                })
                            })
                        })
                    })        

        })();
    });

    router.delete('/remove_subscribtion/:id_user_subscribed_to', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
                const id_user_subscribed_to = req.params.id_user_subscribed_to;
            
                subscribings = await list_of_subscribings.findOne({
                    where: {
                        id_user:current_user,
                        id_user_subscribed_to:id_user_subscribed_to
                    },
                })
                .then(subscribings=>{
                    subscribings.destroy({
                        truncate: false
                      }).then(subscribings=>{
                        list_of_users.findOne({
                            where:{
                                id:id_user_subscribed_to,
                            }
                        }).then(user=>{
                            let number=user.subscribers_number -1;
                            user.update({
                                'subscribers': Sequelize.fn('array_remove', Sequelize.col('subscribers'), current_user),
                                'subscribers_number':number,
                            },
                               ).then(user=>{
                                list_of_users.findOne({
                                    where:{
                                        id:current_user,
                                    }
                                }).then(user1=>{
                                    let number1=user1.subscribings_number -1;
                                    user1.update( {
                                        'subscribings': Sequelize.fn('array_remove', Sequelize.col('subscribings'), id_user_subscribed_to),
                                        'subscribings_number':number1,
                                    },
                                       ).then(m=>{
                                        res.status(200).send([subscribings])
                                    })
                                })
                            })
                        })
                    })          
                    })
        })();
    });

    router.get('/get_all_users_subscribed_to_today/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        const Op = Sequelize.Op;
        //let last_timestamp =  '2020-04-28T06:40:24.000Z';
        var today = new Date();
        today.setDate(today.getDate() - 1);
        var ss = String(today.getSeconds()).padStart(2, '0');
        var mi = String(today.getMinutes()).padStart(2, '0');
        var hh = String(today.getHours()).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth()+1).padStart(2, '0'); 
        var yyyy = String(today.getFullYear());
        let yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z';
        (async () => {

            list_of_subscribings.findAll({
                where: {
                    id_user:id_user,
                    createdAt: {[Op.gte]: yesterday_timestamp,}
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 20,
            })
            .then(users_subscribed_to =>  {
                res.status(200).send([users_subscribed_to])
            }); 
        })();     
    });


    router.get('/get_all_users_subscribed_to/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        const Op = Sequelize.Op;
        //let last_timestamp =  '2020-04-28T06:40:24.000Z';
        var today = new Date();
        today.setDate(today.getDate() - 1);
        var ss = String(today.getSeconds()).padStart(2, '0');
        var mi = String(today.getMinutes()).padStart(2, '0');
        var hh = String(today.getHours()).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = String(today.getFullYear());
        let yesterday_timestamp =  yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi + ':' + ss+ '.000Z' ;
        (async () => {

            users_subscribed_to = await list_of_subscribings.findAll({
                where: {
                    id_user:id_user,
                    createdAt: {[Op.lt]: yesterday_timestamp,}
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 20,
            })
            .then(users_subscribed_to =>  {
                res.status(200).send([users_subscribed_to])
            }); 
        })();     
    });

    router.get('/get_all_subscribed_users/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            users_subscribed_to = await list_of_subscribings.findAll({
                where: {
                    id_user_subscribed_to:id_user,
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 20,
            })
            .then(users_subscribed_to =>  {
                res.status(200).send([users_subscribed_to])
            }); 
        })();     
    });

    router.get('/check_if_visitor_susbcribed/:id_user_to_check', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {

            const id_user_to_check = req.params.id_user_to_check;
            

            subscribtion = await list_of_subscribings.findOne({
                where: {
                    id_user:current_user,
                    id_user_subscribed_to:id_user_to_check
                },
            })
            if(subscribtion!=null){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
        })();     
    });
    
    router.post('/add_content', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
    (async () => {    
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
            .then(contents => {res.status(200).send([contents])})
            
        })();
        
    });

    router.post('/validate_content', function (req, res) {
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
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number
            },
        }).then(content=>{
            content.update({
                "status":"ok"
            }).then(content => {res.status(200).send([content])})
        })
            
        })();
        
    });

    router.delete('/remove_content/:category/:format/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
    (async () => {    
        const category = req.params.category;
        const format = req.params.format;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        contents = await list_of_contents.findOne({
            where: {
                id_user:current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number

            },
        })
        .then(contents=>{
            contents.destroy({
                truncate: false
              })})
        res.status(200).send([contents])
            
        })();
        
    });

    router.post('/get_all_subscribings_contents', function (req, res) {
        let formdata = req.body.formData;  
        (async () => {

            contents = await list_of_contents.findAll({
                where: {
                    id_user: formdata,
                    status:"ok",
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 3,
            })
            .then(contents =>  {
                res.status(200).send([contents])
            }); 
        })();   
    });

    router.get('/get_last_contents_of_a_subscribing/:id_user', function (req, res) {
        let id_user = req.params.id_user;  
        (async () => {

            contents = await list_of_contents.findAll({
                where: {
                    id_user: id_user,
                    status:"ok",
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 3,
            })
            .then(contents =>  {
                res.status(200).send([contents])
            }); 
        })();   
    });


    router.post('/see_more_contents', function (req, res) {
        const Op = Sequelize.Op;
        let formdata = req.body.formData;  
        let last_timestamp = req.body.last_timestamp;

        
        (async () => {

            contents = await list_of_contents.findAll({
                where:[
                     {
                    id_user: formdata,
                    status:"ok",
                    createdAt: {[Op.lt]: last_timestamp,}
                     }
                ],
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 3,
            })
            .then(contents =>  {
                res.status(200).send([contents])
            }); 
        })();   
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
        }).then(content=>{
            content.update({
                "emphasize":"yes"
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
        }).then(content=>{
            content.update({
                "emphasize":"no"
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
        }).then(content => {res.status(200).send([content])})
        })();
    });

    router.get('/get_new_comic_contents/:id_user', function (req, res) {
        (async () => {    
            const id_user = parseInt(req.params.id_user);
            contents = await list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"comics",
                    status:"ok",
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 5,
            }).then(content => {res.status(200).send([content])})
            })();
    });

    router.get('/get_new_writing_contents/:id_user', function (req, res) {
        (async () => {    
            const id_user = parseInt(req.params.id_user);
            contents = await list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"writing",
                    status:"ok",
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 5,
            }).then(content => {res.status(200).send([content])})
        })();
    });

    router.get('/get_new_drawing_contents/:id_user', function (req, res) {
        (async () => {    
            const id_user = parseInt(req.params.id_user);
            contents = await list_of_contents.findAll({
                where: {
                    id_user:id_user,
                    publication_category:"drawing",
                    status:"ok",
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 5,
            }).then(content => {res.status(200).send([content])})
            })();
        });

    

}