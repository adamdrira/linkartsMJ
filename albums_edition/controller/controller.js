const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_albums) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
        };


  
    router.post('/add_album_comics', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
                const album = req.body.album;
                const title = req.body.title;
                list_of_albums.create({
                        "id_user": current_user,
                        "album_name":title,
                        "album_category":"comics",
                        "album_content":album,
                        "status":"public"
                    })
                    .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(album=>{res.status(200).send([album])})  
        })();
    });

    router.post('/add_album_drawings', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
                const album = req.body.album;
                const title = req.body.title;
                const number_cover=req.body.number_cover;
                list_of_albums.create({
                        "id_user": current_user,
                        "album_name":title,
                        "album_category":"drawings",
                        "album_content":album,
                        "thumbnail_cover_drawing":number_cover,
                        "status":"public"
                    })
                    .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(album=>{res.status(200).send([album])})        

        })();
    });

    router.post('/add_album_writings', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {
                const album = req.body.album;
                const title = req.body.title;
                list_of_albums.create({
                        "id_user": current_user,
                        "album_name":title,
                        "album_category":"writings",
                        "album_content":album,
                        "status":"public"
                    })
                    .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(album=>{res.status(200).send([album])})        

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
                .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{
                    subscribings.destroy({
                        truncate: false
                      })
                        .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(subscribings=>{res.status(200).send([subscribings])})        
                    })
        })();
    });



    router.get('/get_albums_comics/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            albums = await list_of_albums.findAll({
                where: {
                    id_user:id_user,
                    album_category:"comics",
                    status:"public"
                },
                order: [
                    ['createdAt', 'ASC']
                ],
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums =>  {
                res.status(200).send(albums)
            }); 
        })();     
    });

    router.get('/get_standard_albums_comics/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            albums = await list_of_albums.findAll({
                where: {
                    id_user:id_user,
                    album_category:"comics",
                    status:["standard","hidden"]
                },
                order: [
                    ['album_name', 'ASC']
                ],
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums =>  {
                res.status(200).send(albums)
            }); 
        })();     
    });

    router.post('/change_comic_album_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.body.album_name;
        let current_status=req.body.current_status;
        let new_status=req.body.new_status;
        (async () => {

            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"comics",
                    album_name:album_name,
                    status:current_status,
                },
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.update({
                    "status":new_status
                }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                    res.status(200).send([albums])
                }
                )
                
            }); 
        })();     
    });

    router.delete('/remove_comic_album/:album_name/:current_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.params.album_name;
        let current_status=req.params.current_status;
        (async () => {
            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"comics",
                    album_name:album_name,
                    status:current_status
                },
            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.destroy({
                    where: {
                        id_user:current_user,
                        album_category:"drawings",
                        album_name: album_name
                     },
                    truncate: false
                  });
                  res.status(200).send(albums);
            })
        })();     
    });

    router.get('/get_albums_drawings/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            albums = await list_of_albums.findAll({
                where: {
                    id_user:id_user,
                    album_category:"drawings",
                    status:["public","private"]
                },
                order: [
                    ['createdAt', 'ASC']
                ],
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums =>  {
                res.status(200).send(albums)
            }); 
        })();     
    });

    router.get('/standard_albums_drawings/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            albums = await list_of_albums.findAll({
                where: {
                    id_user:id_user,
                    album_category:"drawings",
                    status:["standard","hidden"]
                },
                order: [
                    ['album_name', 'DESC']
                ],
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums =>  {
                res.status(200).send(albums)
            }); 
        })();     
    });

    router.post('/change_drawing_album_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.body.album_name;
        let current_status=req.body.current_status;
        let new_status=req.body.new_status;
        
        (async () => {

            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"drawings",
                    album_name:album_name,
                    status:current_status,
                },
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.update({
                    "status":new_status
                }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                    res.status(200).send(albums)
                }
                )
                
            }); 
        })();     
    });

    router.delete('/remove_drawing_album/:album_name/:current_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.params.album_name;
        let current_status=req.params.current_status;
        (async () => {


            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"drawings",
                    album_name:album_name,
                    status:current_status,
                },
            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.destroy({
                    where: {
                        id_user:current_user,
                        album_category:"drawings",
                        album_name: album_name
                     },
                    truncate: false
                  });
                  res.status(200).send(albums);
            })
           
        })();     
    });


    
    

    router.get('/get_albums_writings/:id_user', function (req, res) {
        let id_user = req.params.id_user;
        (async () => {

            albums = await list_of_albums.findAll({
                where: {
                    id_user:id_user,
                    album_category:"writings",
                    status:["public","private"]
                },
                order: [
                    ['createdAt', 'ASC']
                ],
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums =>  {
                res.status(200).send(albums)
            }); 
        })();     
    });


    router.post('/change_writing_album_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.body.album_name;
        let current_status=req.body.current_status;
        let new_status=req.body.new_status;
        (async () => {

            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"writings",
                    album_name:album_name,
                    status:current_status,
                },
            })
            .catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.update({
                    "status":new_status
                }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                    res.status(200).send(albums)
                }
                )
                
            }); 
        })();     
    });

    router.delete('/remove_writing_album/:album_name/:current_status', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let album_name=req.params.album_name;
        let current_status=req.params.current_status;
        (async () => {


            albums = await list_of_albums.findOne({
                where: {
                    id_user:current_user,
                    album_category:"writings",
                    album_name:album_name,
                    status:current_status,
                },
            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(albums => {
                albums.destroy({
                    where: {
                        id_user:current_user,
                        album_category:"writings",
                        album_name: album_name
                     },
                    truncate: false
                  });
                  res.status(200).send(albums);
            })
           
        })();     
    });





}