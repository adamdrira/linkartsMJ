
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, 
    Liste_of_likes,
    Liste_of_loves,
    Liste_Bd_Oneshot,
    Liste_Bd_Serie,
    Chapters_Bd_Serie,
    Drawings_one_page,
    Liste_Drawings_Artbook,
    Liste_Writings,
    List_of_views,
    List_of_comments,
    List_of_comments_answers,
    List_of_comments_likes,
    List_of_comments_answers_likes,
    list_of_ads,
    User,
    List_of_contents
    ) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{	
            if(decoded){
                user=decoded.id;
            }	
        });
        return user;
    };

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }


  router.post('/add_like/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_liked', function (req, res) {
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
    
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = parseInt(req.params.publication_id);
            const chapter_number = parseInt(req.params.chapter_number);
            const firsttag=req.params.firsttag;
            const secondtag=req.params.secondtag;
            const thirdtag=req.params.thirdtag;
            const author_id_liked=parseInt(req.params.author_id_liked);
            

            Liste_of_loves.findOne({
                where:{
                    author_id_who_loves: current_user,
                    publication_category:category,
                    format: format,
                    publication_id: publication_id,
                    chapter_number: chapter_number,
                }
            }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(love=>{
                if(!love){
                    Liste_of_likes.findOne({
                        where:{
                            author_id_who_likes: current_user,
                            publication_category:category,
                            format: format,
                            publication_id: publication_id,
                            chapter_number: chapter_number,
                            author_id_liked:author_id_liked,
                        }
                    }).catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(like=>{
                        if(!like){
                            add_like()
                        }
                        else{
                            res.status(200).send([{error:"already_liked"}])
                        }
                    })
                }
                else{
                    res.status(200).send([{error:"loved"}])
                }
            })
            
            function add_like(){
                if (category === "comic" ) {
                    if(format === "one-shot"){
                        Liste_Bd_Oneshot.findOne({
                            where: {
                            bd_id: publication_id,
                            }
                        })
                        .catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(bd =>  {
                            const likes = bd.likesnumber + 1;
                            bd.update({
                            "likesnumber":likes,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(create(bd))
                        }); 
                        
                    }
                    else if (format === "serie"){
    
                        Chapters_Bd_Serie.findOne({
                            where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {                      
                            const likes = chapter.likesnumber + 1;
                            chapter.update({
                            "likesnumber":likes,
                            }) 
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  { 
                                    Liste_Bd_Serie.findOne({
                                        where: {
                                        bd_id: chapter.bd_id,
                                        }
                                    })
                                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie =>  {  
                                        const likes = bd_serie.likesnumber + 1;
                                        bd_serie.update({
                                        "likesnumber":likes,
                                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie=>{create(bd_serie)})
                                    })                   
                                    
                                })
                        })                 
    
                    }
                    
                }
    
                else  if (category === "drawing" ) {
                    if(format === "one-shot"){
                        Drawings_one_page.findOne({
                            where: {
                                drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const likes = drawing.likesnumber + 1;
                            drawing.update({
                            "likesnumber":likes,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(create(drawing))
                        }); 
                    }
    
                    else if(format === "artbook"){
                        Liste_Drawings_Artbook.findOne({
                            where: {
                            drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const likes = drawing.likesnumber + 1;
                            drawing.update({
                            "likesnumber":likes,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(create(drawing))
                        }); 
                    }
                }
    
                else  if (category === "writing" ) {
                    Liste_Writings.findOne({
                        where: {
                            writing_id: publication_id,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
                        const likes = writing.likesnumber + 1;
                        writing.update({
                        "likesnumber":likes,
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(create(writing))
                    }); 
                    
                }
            }
            
            function create(content){
                Liste_of_likes.create({
                        "status":"public",
                        "author_id_who_likes": current_user,
                        "publication_category":category,
                        "format": format,
                        "style":style,
                        "firsttag":firsttag,
                        "secondtag":secondtag,
                        "thirdtag":thirdtag,
                        "publication_id": publication_id,
                        "chapter_number": chapter_number,
                        "author_id_liked":author_id_liked,
                        "monetization":content.monetization,
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                    User.findOne({
                        where:{
                            id:content.authorid
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                        let number_of_likes=(user.number_of_likes)?(user.number_of_likes+1):1;
                        user.update({
                            number_of_likes:number_of_likes,
                        })
                        res.status(200).send([content])
                    })
                   
                })
            }
                  
            
    });

    router.delete('/remove_like/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {

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
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = parseInt(req.params.publication_id);
            const chapter_number = parseInt(req.params.chapter_number);
           
            Liste_of_likes.findOne({
                where:{
                    author_id_who_likes:current_user,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(like=>{
                if(like){
                    like.destroy({
                        truncate: false
                    })
                    remove_like();
                }
                else{
                    res.status(200).send([{error:"already_removed"}])
                }
            } )
        
            function remove_like(){
                if (category === "comic" ) {
                    if(format === "one-shot"){
                        Liste_Bd_Oneshot.findOne({
                            where: {
                            bd_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
                            const likes = bd.likesnumber - 1;
                            bd.update({
                            "likesnumber":(likes>=0)?likes:0,
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(destroy(bd))
                        }); 
                        
                    }
                    else if (format === "serie"){
            
                        Chapters_Bd_Serie.findOne({
                            where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
       
                            const likes = chapter.likesnumber - 1;      
                            chapter.update({
                            "likesnumber":(likes>=0)?likes:0,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {  
                                Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .catch(err => {
                                    	
                                    res.status(500).json({msg: "error", details: err});		
                                }).then(bd_serie =>  {  
                                    const likes = bd_serie.likesnumber - 1;
                                    bd_serie.update({
                                    "likesnumber":(likes>=0)?likes:0,
                                    });
                                    destroy(bd_serie)
                                })                   
                            
                            
                            })
                        })
            
                    }
                    
                }
            
                else  if (category === "drawing" ) {
                    if(format === "one-shot"){
                        Drawings_one_page.findOne({
                            where: {
                                drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const likes = drawing.likesnumber - 1;
                            drawing.update({
                            "likesnumber":(likes>=0)?likes:0,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(drawing))
                        }); 
                    }
            
                    else if(format === "artbook"){
                        Liste_Drawings_Artbook.findOne({
                            where: {
                            drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const likes = drawing.likesnumber - 1;
                            drawing.update({
                            "likesnumber":(likes>=0)?likes:0,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(drawing))
                        }); 
                    }
                }
            
                else  if (category === "writing" ) {
                     Liste_Writings.findOne({
                        where: {
                            writing_id: publication_id,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
                        const likes = writing.likesnumber - 1;
                        writing.update({
                        "likesnumber":(likes>=0)?likes:0,
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(writing))
                    }); 
                    
                }
            }
             
            function destroy(content){
                User.findOne({
                    where:{
                        id:content.authorid
                    }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                    let number_of_likes=(user.number_of_likes && user.number_of_likes>0)?(user.number_of_likes-1):0;
                    user.update({
                        number_of_likes:number_of_likes,
                    })
                    res.status(200).send([content])
                })
            }
            
                
    });
        

    router.post('/add_love/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_loved', function (req, res) {
        
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
        
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = parseInt(req.params.publication_id);
            const chapter_number = parseInt(req.params.chapter_number);
            const firsttag=req.params.firsttag;
            const secondtag=req.params.secondtag;
            const thirdtag=req.params.thirdtag;
            const author_id_loved=parseInt(req.params.author_id_loved);

            Liste_of_likes.findOne({
                where:{
                    author_id_who_likes: current_user,
                    publication_category:category,
                    format: format,
                    publication_id: publication_id,
                    chapter_number: chapter_number,
                }
            }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(like=>{
                if(!like){
                    Liste_of_loves.findOne({
                        where:{
                            author_id_who_loves: current_user,
                            publication_category:category,
                            format: format,
                            publication_id: publication_id,
                            chapter_number: chapter_number,
                            author_id_loved:author_id_loved,
                        }
                    }).catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(love=>{
                        if(!love){
                            add_love()
                        }
                        else{
                            res.status(200).send([{error:"already_loved"}])
                        }
                    })
                }
                else{
                    res.status(200).send([{error:"liked"}])
                }
            })

            

            function add_love(){
                if (category === "comic" ) {
                    if(format === "one-shot"){
                        Liste_Bd_Oneshot.findOne({
                            where: {
                                bd_id: publication_id,
                            }
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(bd =>  {
                            const loves = bd.lovesnumber + 1;
                            bd.update({
                                "lovesnumber":loves,
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(create(bd))
                            }); 
                        
                    }
                    else if (format === "serie"){
    
                        Chapters_Bd_Serie.findOne({
                            where: {
                                bd_id: publication_id,
                                chapter_number:chapter_number,
                            }
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(chapter =>  {
                            const loves = chapter.lovesnumber + 1;
                            chapter.update({
                                "lovesnumber":loves,
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(chapter =>  { 
                            
                                  Liste_Bd_Serie.findOne({
                                        where: {
                                        bd_id: chapter.bd_id,
                                        }
                                    })
                                    .catch(err => {
                                            	
                                            res.status(500).json({msg: "error", details: err});		
                                    }).then(bd_serie =>  {  
                                        const loves = bd_serie.lovesnumber + 1;
                                        bd_serie.update({
                                        "lovesnumber":loves,
                                        }).catch(err => {
                                            	
                                            res.status(500).json({msg: "error", details: err});		
                                        }).then(bd_serie=>{create(bd_serie)})
                                    })                   
                                    
                                
                                })
                            })
    
                    }
                    
                 }
                    else  if (category === "drawing" ) {
                    if(format === "one-shot"){
                        Drawings_one_page.findOne({
                            where: {
                                drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(drawing =>  {
                            const loves = drawing.lovesnumber + 1;
                            drawing.update({
                            "lovesnumber":loves,
                            })
                            .catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(create(drawing))
                                            }); 
                    }
    
                    else if(format === "artbook"){
                        Liste_Drawings_Artbook.findOne({
                            where: {
                            drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(drawing =>  {
                            const loves = drawing.lovesnumber + 1;
                            drawing.update({
                            "lovesnumber":loves,
                            })
                            .catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(create(drawing))
                        }); 
                    }
                    }
    
                    else  if (category === "writing" ) {
                    Liste_Writings.findOne({
                        where: {
                            writing_id: publication_id,
                        }
                    })
                    .catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(writing =>  {
                        const loves = writing.lovesnumber + 1;
                        writing.update({
                        "lovesnumber":loves,
                        })
                        .catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(create(writing))
                    }); 
                    
                    }
            }

            function create(content){
                Liste_of_loves.create({
                        "status":"public",
                        "author_id_who_loves": current_user,
                        "publication_category":category,
                        "format": format,
                        "style":style,
                        "firsttag":firsttag,
                        "secondtag":secondtag,
                        "thirdtag":thirdtag,
                        "publication_id": publication_id,
                        "chapter_number": chapter_number,
                        "author_id_loved":author_id_loved,
                        "monetization":content.monetization,
                    }) .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(love=>{
                        User.findOne({
                            where:{
                                id:content.authorid
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            let number_of_loves=(user.number_of_loves)?(user.number_of_loves+1):1;
                            user.update({
                                number_of_loves:number_of_loves,
                            })
                            res.status(200).send([content])
                        })
                    })
            }
               
                
            
    });

    router.delete('/remove_love/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {

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
        

        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        
        Liste_of_loves.findOne({
            where:{
                author_id_who_loves:current_user,
                publication_category: category,
                format:format,
                publication_id:publication_id,
                chapter_number:chapter_number,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(love=>{
            if(love){
                love.destroy({
                    truncate: false
                })
                remove_love();
            }
            else{
                res.status(200).send([{error:"already_removed"}])
            }
        } )

        function remove_love(){
            if (category === "comic" ) {
                if(format === "one-shot"){
                   Liste_Bd_Oneshot.findOne({
                        where: {
                            bd_id: publication_id,
                        }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
                        const loves = bd.lovesnumber - 1;
                        bd.update({
                            "lovesnumber":(loves>=0)?loves:0,
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(bd))
                        }); 
                    
                }
                else if (format === "serie"){
    
                   Chapters_Bd_Serie.findOne({
                        where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                        }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
                        const loves = chapter.lovesnumber - 1;
                        chapter.update({
                            "lovesnumber":(loves>=0)?loves:0,
                        }) 
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {  
                            Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .catch(err => {
                                    	
                                    res.status(500).json({msg: "error", details: err});		
                                }).then(bd_serie =>  {  
                                    const loves = bd_serie.lovesnumber - 1;
                                    bd_serie.update({
                                    "lovesnumber":(loves>=0)?loves:0,
                                    })
                                    destroy(bd_serie)
                                })     
                            })
                        })
    
                }
                
                }
    
                else  if (category === "drawing" ) {
                    if(format === "one-shot"){
                        Drawings_one_page.findOne({
                            where: {
                                drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const loves = drawing.lovesnumber - 1;
                            drawing.update({
                            "lovesnumber":(loves>=0)?loves:0,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(drawing))
                        }); 
                    }
    
                    else if(format === "artbook"){
                         Liste_Drawings_Artbook.findOne({
                            where: {
                            drawing_id: publication_id,
                            }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                            const loves = drawing.lovesnumber - 1;
                            drawing.update({
                            "lovesnumber":(loves>=0)?loves:0,
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(drawing))
                        }); 
                    }
                }
    
                else  if (category === "writing" ) {
                Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
                    const loves = writing.lovesnumber - 1;
                    writing.update({
                    "lovesnumber":(loves>=0)?loves:0,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(destroy(writing))
                }); }
        }
            
        


        function destroy(content){
            User.findOne({
                where:{
                    id:content.authorid
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                let number_of_loves=(user.number_of_loves && user.number_of_loves>0)?(user.number_of_loves-1):0;
                user.update({
                    number_of_loves:number_of_loves,
                })
                res.status(200).send([content])
            })
        }
    });





    router.post('/add_view/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_viewed', function (req, res) {

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
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        const firsttag=req.params.firsttag;
        const secondtag=req.params.secondtag;
        const thirdtag=req.params.thirdtag;
        const author_id_viewed=parseInt(req.params.author_id_viewed);
        List_of_views.findAll({
            where:{
                status:"public",
                author_id_who_looks: current_user,
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number,
                author_id_viewed:author_id_viewed
            },
            limit:1,
            order: [['createdAt', 'DESC']]
            
        }).catch(err => {
            	
            res.status(500).json({msg: "error", details: err});		
        }).then(view_found => {
            if(view_found[0]){
                let now_in_seconds= Math.trunc( new Date().getTime()/1000);
                let time =(view_found[0].createdAt).toString();
                let uploaded_date_in_second = new Date(time).getTime()/1000;
                if((now_in_seconds - uploaded_date_in_second)>120){
                    add_view()
                }
                else{
                    res.status(200).send([{id:0}]) 
                }
            }
            else{
                add_view()
            }
        })

        function add_view(){
            List_of_views.create({
                "status":"public",
                "author_id_who_looks": current_user,
                "publication_category":category,
                "format": format,
                "style":style,
                "firsttag":firsttag,
                "secondtag":secondtag,
                "thirdtag":thirdtag,
                "publication_id": publication_id,
                "chapter_number": chapter_number,
                "author_id_viewed":author_id_viewed
            })
            .catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(list_of_view => {
                List_of_contents.findOne({
                    where:{
                         publication_id : publication_id,
                         publication_category :category,
                         format : format,
                    }
                }).catch(err => {
                    	
                    res.status(500).json({msg: "error", details: err});		
                }).then(content=>{
                    if(content){
                        User.findOne({
                            where:{
                                id:content.id_user
                            }
                        }).catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(user=>{
                            let number_of_views=(user.number_of_views)?(user.number_of_views+1):1;
                            user.update({
                                number_of_views:number_of_views,
                            })
                            res.status(200).send([list_of_view])
                        })
                    }
                    else{
                        res.status(200).send([list_of_view])
                    }
                   
                })
                
            })
        }
       
            
       
        
        });

    router.post('/add_view_time', function (req, res) {

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
        const id_view_created = req.body.id_view_created;
        const view_time = req.body.view_time;
        if(id_view_created>0){
            List_of_views.findOne({
                where: {
                    id:id_view_created,
                }
            })
            .catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(view =>  {
                if(view){
                    if(view_time>5){
                        if (view.publication_category=== "comic" ) {
                            if(view.format === "one-shot"){
                                Liste_Bd_Oneshot.findOne({
                                    where: {
                                        bd_id: view.publication_id,
                                    }
                                    })
                                    .catch(err => {
                                        	
                                        res.status(500).json({msg: "error", details: err});		
                                    }).then(bd =>  {
                                        const views = bd.viewnumber + 1;
                                        bd.update({
                                            "viewnumber":views,
                                        })
                                        if(bd.firsttag=='Romantique' || bd.firsttag=='Shojo' || bd.firsttag=='Yuri' || bd.firsttag=='Yaoi' || bd.firsttag=='Josei' 
                                        || bd.secondtag=='Romantique' || bd.secondtag=='Shojo' || bd.secondtag=='Yuri' || bd.secondtag=='Yaoi' || bd.secondtag=='Josei' 
                                        || bd.thirdtag=='Romantique' || bd.thirdtag=='Shojo' || bd.thirdtag=='Yuri' || bd.thirdtag=='Yaoi' || bd.thirdtag=='Josei'){
                                            if(getRandomInt(5)==0){
                                                
                                                view.update({
                                                    "view_time":view_time,
                                                    "monetization":bd.monetization,
                                                }).catch(err => {
                                                    	
                                                    res.status(500).json({msg: "error", details: err});		
                                                }).then(view=>{
                                                    res.status(200).send([view])
                                                })
                                            }
                                            else{
                                                res.status(200).send([view])
                                                
                                            } 
                                        }
                                        else if(bd.firsttag=='Caricatural' || bd.firsttag=='Religion' 
                                        || bd.secondtag=='Caricatural' || bd.secondtag=='Religion' 
                                        || bd.thirdtag=='Caricatural' || bd.thirdtag=='Religion'){
                                            if(getRandomInt(20)==0){
                                                
                                                view.update({
                                                    "view_time":view_time,
                                                    "monetization":bd.monetization,
                                                }).catch(err => {
                                                    	
                                                    res.status(500).json({msg: "error", details: err});		
                                                }).then(view=>{
                                                    res.status(200).send([view])
                                                })
                                            }
                                            else{
                                                res.status(200).send([view])
                                                
                                            } 
                                        }
                                        else{
                                            view.update({
                                                "view_time":view_time,
                                                "monetization":bd.monetization,
                                            })
                                            res.status(200).send([view])
                                        }
                                        
                                    }); 
                                
                            }
                            else if (view.format === "serie"){
                
                                Chapters_Bd_Serie.findOne({
                                    where: {
                                        bd_id: view.publication_id,
                                        chapter_number:view.chapter_number,
                                    }
                                    })
                                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
                                        const views = chapter.viewnumber + 1;
                                        chapter.update({
                                            "viewnumber":views,
                                        })
                                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {  
                                            
                                            Liste_Bd_Serie.findOne({
                                                where: {
                                                bd_id: chapter.bd_id,
                                                }
                                            })
                                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
                                                const viewnumber = bd.viewnumber + 1;
                                                bd.update({
                                                    "viewnumber":viewnumber,
                                                    
                                                })
                                                if(bd.firsttag=='Romantique' || bd.firsttag=='Shojo' || bd.firsttag=='Yuri' || bd.firsttag=='Yaoi' || bd.firsttag=='Josei' 
                                                || bd.secondtag=='Romantique' || bd.secondtag=='Shojo' || bd.secondtag=='Yuri' || bd.secondtag=='Yaoi' || bd.secondtag=='Josei' 
                                                || bd.thirdtag=='Romantique' || bd.thirdtag=='Shojo' || bd.thirdtag=='Yuri' || bd.thirdtag=='Yaoi' || bd.thirdtag=='Josei'){
                                                    if(getRandomInt(5)==0){
                                                        view.update({
                                                            "view_time":view_time,
                                                            "monetization":bd.monetization,
                                                        })
                                                        res.status(200).send([view])
                                                        
                                                    }
                                                    else{
                                                        res.status(200).send([view])
                                                    } 
                                                }
                                                else if(bd.firsttag=='Caricatural' || bd.firsttag=='Religion' 
                                                || bd.secondtag=='Caricatural' || bd.secondtag=='Religion'  
                                                || bd.thirdtag=='Caricatural' || bd.thirdtag=='Religion' ){
                                                    if(getRandomInt(20)==0){
                                                        view.update({
                                                            "view_time":view_time,
                                                            "monetization":bd.monetization,
                                                        })
                                                        res.status(200).send([view])
                                                        
                                                    }
                                                    else{
                                                        res.status(200).send([view])
                                                    } 
                                                }
                                                else{
                                                    
                                                    view.update({
                                                        "view_time":view_time,
                                                        "monetization":bd.monetization,
                                                    })
                                                    res.status(200).send([view])
                                                }
                                            })  
                                        
                                        })
                                    })
                
                            }
                            
                        }
                        else if (view.publication_category === "drawing" ) {
                            if(view.format === "one-shot"){
                                Drawings_one_page.findOne({
                                    where: {
                                        drawing_id: view.publication_id,
                                    }
                                })
                                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                                    const views = drawing.viewnumber + 1;
                                    drawing.update({
                                        "viewnumber":views,
                                    })
                                    if(drawing.firsttag=='Romantique' || drawing.firsttag=='Shojo' || drawing.firsttag=='Yuri' || drawing.firsttag=='Yaoi' || drawing.firsttag=='Josei' 
                                    || drawing.secondtag=='Romantique' || drawing.secondtag=='Shojo' || drawing.secondtag=='Yuri' || drawing.secondtag=='Yaoi' || drawing.secondtag=='Josei' 
                                    || drawing.thirdtag=='Romantique' || drawing.thirdtag=='Shojo' || drawing.thirdtag=='Yuri' || drawing.thirdtag=='Yaoi' || drawing.thirdtag=='Josei'){
                                        if(getRandomInt(5)==0){
                                            view.update({
                                                "view_time":view_time,
                                                "monetization":drawing.monetization,
                                            })
                                            res.status(200).send([view])
                                            
                                        }
                                        else{
                                            res.status(200).send([view])
                                        } 
                                    }
                                    else if(drawing.firsttag=='Caricatural' || drawing.firsttag=='Religion'  
                                    || drawing.secondtag=='Caricatural' || drawing.secondtag=='Religion' 
                                    || drawing.thirdtag=='Caricatural' || drawing.thirdtag=='Religion' ){
                                        if(getRandomInt(20)==0){
                                            
                                            view.update({
                                                "view_time":view_time,
                                                "monetization":drawing.monetization,
                                            })
                                            res.status(200).send([view])
                                            
                                        }
                                        else{
                                            res.status(200).send([view])
                                        } 
                                    }
                                    else{
                                        view.update({
                                            "view_time":view_time,
                                            "monetization":drawing.monetization,
                                        })
                                        res.status(200).send([view])
                                    }
                                }); 
                            }
                
                            else if(view.format === "artbook"){
                                Liste_Drawings_Artbook.findOne({
                                    where: {
                                        drawing_id: view.publication_id,
                                    }
                                })
                                .catch(err => {
				
                                    res.status(500).json({msg: "error", details: err});		
                                }).then(drawing =>  {
                                    const views = drawing.viewnumber + 1;
                                    drawing.update({
                                        "viewnumber":views,
                                    })
                                    if(drawing.firsttag=='Romantique' || drawing.firsttag=='Shojo' || drawing.firsttag=='Yuri' || drawing.firsttag=='Yaoi' || drawing.firsttag=='Josei' 
                                    || drawing.secondtag=='Romantique' || drawing.secondtag=='Shojo' || drawing.secondtag=='Yuri' || drawing.secondtag=='Yaoi' || drawing.secondtag=='Josei' 
                                    || drawing.thirdtag=='Romantique' || drawing.thirdtag=='Shojo' || drawing.thirdtag=='Yuri' || drawing.thirdtag=='Yaoi' || drawing.thirdtag=='Josei'){
                                        if(getRandomInt(5)==0){
                                            view.update({
                                                "view_time":view_time,
                                                "monetization":drawing.monetization,
                                            })
                                            res.status(200).send([view])
                                            
                                        }
                                        else{
                                            res.status(200).send([view])
                                        } 
                                    }
                                    else if(drawing.firsttag=='Caricatural' || drawing.firsttag=='Religion'  
                                    || drawing.secondtag=='Caricatural' || drawing.secondtag=='Religion' 
                                    || drawing.thirdtag=='Caricatural' || drawing.thirdtag=='Religion'){
                                        if(getRandomInt(20)==0){
                                            view.update({
                                                "view_time":view_time,
                                                "monetization":drawing.monetization,
                                            })
                                            res.status(200).send([view])
                                            
                                        }
                                        else{
                                            res.status(200).send([view])
                                        } 
                                    }
                                    else{
                                       
                                        view.update({
                                            "view_time":view_time,
                                            "monetization":drawing.monetization,
                                        })
                                        res.status(200).send([view])
                                    }
                                }); 
                            }
                        }
                        else if (view.publication_category === "writing" ) {
                            Liste_Writings.findOne({
                                where: {
                                    writing_id: view.publication_id,
                                }
                            })
                            .catch(err => {
				
                                res.status(500).json({msg: "error", details: err});		
                            }).then(writing =>  {
                                
                                const views = writing.viewnumber + 1;
                                writing.update({
                                    "viewnumber":views,
                                })
                                if(writing.firsttag=='Romantique' || writing.firsttag=='Shojo' || writing.firsttag=='Yuri' || writing.firsttag=='Yaoi' || writing.firsttag=='Josei' 
                                || writing.secondtag=='Romantique' || writing.secondtag=='Shojo' || writing.secondtag=='Yuri' || writing.secondtag=='Yaoi' || writing.secondtag=='Josei' 
                                || writing.thirdtag=='Romantique' || writing.thirdtag=='Shojo' || writing.thirdtag=='Yuri' || writing.thirdtag=='Yaoi' || writing.thirdtag=='Josei'){
                                    if(getRandomInt(5)==0){
                                        
                                        view.update({
                                            "view_time":view_time,
                                            "monetization":writing.monetization,
                                        })
                                        res.status(200).send([view])
                                        
                                    }
                                    else{
                                        res.status(200).send([view])
                                    } 
                                }
                                else if(writing.firsttag=='Caricatural' || writing.firsttag=='Religion' 
                                || writing.secondtag=='Caricatural' || writing.secondtag=='Religion' 
                                || writing.thirdtag=='Caricatural' || writing.thirdtag=='Religion' ){
                                    if(getRandomInt(20)==0){
                                        
                                        view.update({
                                            "view_time":view_time,
                                            "monetization":writing.monetization,
                                        })
                                        res.status(200).send([view])
                                        
                                    }
                                    else{
                                        res.status(200).send([view])
                                    } 
                                }
                                else{
                                    view.update({
                                        "view_time":view_time,
                                        "monetization":writing.monetization,
                                    })
                                    res.status(200).send([view])
                                }
                            }); 
                            
                        }
                    }
                    else{
                        res.status(200).send([{error:"already_added_view_time"}])
                    }
                }
                else{
                    res.status(200).send([{error:"already_added_view_time"}])
                }
                    
                        
            });  
        }
        else{
            res.status(200).send([{error:"already_added_view_time"}])
        }
            
        
        });


        
    router.post('/get_content_marks', function (req, res) {

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
        
        const category = req.body.category;
        const format = req.body.format;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;
        let list_of_likes=[];
        let list_of_comments=[];
        let list_of_views=[];
        let list_of_loves=[];
        const Op = Sequelize.Op;
        Liste_of_likes.findAll({
            where: {
                status:"public",
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: (format=="serie" && chapter_number!=0)?chapter_number:{[Op.ne]:-1},
            },
            order: [
                ['createdAt', 'DESC']
            ],
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
            list_of_likes=likes;
            Liste_of_loves.findAll({
                where: {
                    status:"public",
                    publication_category:category,
                    format: format,
                    publication_id: publication_id,
                    chapter_number: (format=="serie" && chapter_number!=0)?chapter_number:{[Op.ne]:-1},
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            })
            .catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(loves =>  {
                list_of_loves=loves;
                List_of_views.findAll({
                    where: {
                        status:"public",
                        publication_category:category,
                        format: format,
                        publication_id: publication_id,
                        chapter_number: (format=="serie" && chapter_number!=0)?chapter_number:{[Op.ne]:-1},
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                })
                .catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(views =>  {
                    list_of_views=views;
                    List_of_comments.findAll({
                        where: {
                            status:"public",
                            publication_category:category,
                            format: format,
                            publication_id: publication_id,
                            chapter_number: (format=="serie" && chapter_number!=0)?chapter_number:{[Op.ne]:-1},
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ],
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                        list_of_comments=comments;
                        res.status(200).send([{list_of_likes:list_of_likes,list_of_loves:list_of_loves,list_of_views:list_of_views,list_of_comments:list_of_comments}])
                    }); 
                }); 
            }); 
        }); 
    
    });

    router.get('/get_likes/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {

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
        
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        Liste_of_likes.findAll({
            where: {
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number,
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
            res.status(200).send([likes])
        }); 
 
    });

    router.get('/get_loves/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {

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
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        Liste_of_loves.findAll({
            where: {
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number,
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
            res.status(200).send([loves])
        }); 
     })();     
    });



    router.post('/add_commentary', function (req, res) {

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
        
        const category = req.body.category;
        const format = req.body.format;
        const style = req.body.style;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;
        const commentary = req.body.commentary;

        if (category === "comic" ) {
            if(format === "one-shot"){
                Liste_Bd_Oneshot.findOne({
                    where: {
                        bd_id: publication_id,
                    }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
                    const number = bd.commentarynumbers + 1;
                    bd.update({
                        "commentarynumbers":number,
                    })
                    create(bd.authorid)
                }); 
                
            }
            else if (format === "serie"){
                Chapters_Bd_Serie.findOne({
                        where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
                    const number = chapter.commentarynumbers + 1;
                    chapter.update({
                        "commentarynumbers":number,
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  { 
                            Liste_Bd_Serie.findOne({
                                where: {
                                bd_id: chapter.bd_id,
                                }
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie =>  {  
                                const number = bd_serie.commentarynumbers + 1;
                                bd_serie.update({
                                "commentarynumbers":number,
                                })
                                create(bd_serie.authorid)
                            })  
                        })
                    })

            }
            
        }
        else  if (category === "drawing" ) {
            if(format === "one-shot"){
                Drawings_one_page.findOne({
                    where: {
                        drawing_id: publication_id,
                    }
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                    const number = drawing.commentarynumbers + 1;
                    drawing.update({
                    "commentarynumbers":number,
                    })
                    create(drawing.authorid);
                }); 
            }

            else if(format === "artbook"){
                Liste_Drawings_Artbook.findOne({
                    where: {
                    drawing_id: publication_id,
                    }
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                    const number = drawing.commentarynumbers + 1;
                    drawing.update({
                    "commentarynumbers":number,
                    })
                    create(drawing.authorid)
                }); 
            }
        }
        else  if (category === "writing" ) {
            Liste_Writings.findOne({
                where: {
                    writing_id: publication_id,
                }
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
                const number = writing.commentarynumbers + 1;
                writing.update({
                "commentarynumbers":number,
                })
                create(writing.authorid)
            }); 
            
        }
        else if(category=="ad"){
                list_of_ads.findOne({
                    where: {
                        id: publication_id,
                    }
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
                    let number=0;
                    if(!ad.commentariesnumber){
                        number=1;
                    }
                    else{
                        number = ad.commentariesnumber + 1;
                    }
                    ad.update({
                    "commentariesnumber":number,
                    })
                    create(ad.id_user)
                });
        }

        function create(id){
            List_of_comments.create({
                "author_id_who_comments": current_user,
                "publication_category":category,
                "format": format,
                "style":style,
                "publication_id": publication_id,
                "chapter_number": chapter_number,
                "number_of_likes":0,
                "number_of_answers":0,
                "status":"public",
                "commentary":commentary
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comment=>{
                User.findOne({
                    where:{
                        id:id
                    }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                    let number_of_comments=(user.number_of_comments)?(user.number_of_comments+1):1;
                    user.update({
                        number_of_comments:number_of_comments,
                    })
                    res.status(200).send([comment])
                })
            })
        }
            
                
           
    });

    router.delete('/remove_commentary/:category/:format/:style/:publication_id/:chapter_number/:comment_id', function (req, res) {

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
         

        const category = req.params.category;
        const comment_id = req.params.comment_id;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        List_of_comments.findOne({
            where: {
                id:comment_id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comment=>{
            if(comment){
                List_of_contents.findOne({
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(content=>{
                    if(content){
                        if((content.id_user==current_user && content.publication_category!='ad') || comment.author_id_who_comments==current_user){
                            comment.destroy({
                                where: {
                                    id:comment_id,
                                        },
                                truncate: false
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then( remove_comment(comment))
                           
                        }
                        else{
                            res.status(200).send([{error:"not_allowed_to_remove"}]);  
                        }
                    }
                    else{
                        res.status(200).send([{error:"content_not_found"}]); 
                    }
                })
                
            }
            else {
                res.status(200).send([{error:"comment_not_found"}]); 
            }
           
        })

        function remove_comment(comment){
            if (category === "comic" ) {
                if(format === "one-shot"){
                    Liste_Bd_Oneshot.findOne({
                        where: {
                            bd_id: publication_id,
                        }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd =>  {
                            const commentarynumbers = bd.commentarynumbers - 1;
                            bd.update({
                                "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                            })
                            destroy(bd.authorid,comment)
                        }); 
                    
                }
                else if (format === "serie"){
    
                   Chapters_Bd_Serie.findOne({
                        where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                        }
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {
                        const commentarynumbers = chapter.commentarynumbers - 1;
                        chapter.update({
                            "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                        }) 
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(chapter =>  {  
                            Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(bd_serie =>  {  
                                    const commentarynumbers = bd_serie.commentarynumbers - 1;
                                    bd_serie.update({
                                    "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                                    })
                                    destroy(bd_serie.authorid,comment)
                                })  
                            })
                        })
                }
                
            }
            else  if (category === "drawing" ) {
                if(format === "one-shot"){
                    Drawings_one_page.findOne({
                        where: {
                            drawing_id: publication_id,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                        const commentarynumbers = drawing.commentarynumbers - 1;
                        drawing.update({
                        "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                        })
                        destroy(drawing.authorid,comment)
                    }); 
                }
    
                else if(format === "artbook"){
                    Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing =>  {
                        const commentarynumbers = drawing.commentarynumbers - 1;
                        drawing.update({
                        "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                        })
                        destroy(drawing.authorid,comment)
                    }); 
                }
            }
            else  if (category === "writing" ) {
                Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(writing =>  {
                    const commentarynumbers = writing.commentarynumbers - 1;
                    writing.update({
                    "commentarynumbers":(commentarynumbers>=0)?commentarynumbers:0,
                    })
                    destroy(writing.authorid,comment)
                }); 
                
            }
            else if(category=="ad"){
                    list_of_ads.findOne({
                        where: {
                            id: publication_id,
                        }
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ad =>  {
                        const commentariesnumber = ad.commentariesnumber - 1;
                        ad.update({
                        "commentariesnumber":(commentariesnumber>=0)?commentariesnumber:0,
                        })
                        destroy(ad.id_user,comment)
                    });
            };
        }
        

        function destroy(id,comment){
            User.findOne({
                where:{
                    id:id
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                let number_of_comments=(user.number_of_comments && user.number_of_comments>0)?(user.number_of_comments-1):0;
                user.update({
                    number_of_comments:number_of_comments,
                })
                res.status(200).send([comment])
            })
        }
            
        
            
            
            
        
    });

    router.post('/modify_commentary', function (req, res) {

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
        
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            const id=req.body.id;
            const commentary = req.body.commentary;
            List_of_comments.findOne({
                where: {
                    id:id,
                    author_id_who_comments:current_user,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                comments.update({
                    "commentary":commentary
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    res.status(200).send([comments]);
                })
               
            })
    });

    router.post('/add_like_on_commentary', function (req, res) {

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
        
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            const id = req.body.id;

            List_of_comments_likes.findOne({
                where:{
                    author_id_who_likes: current_user,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
                    	
                    res.status(500).json({msg: "error", details: err});		
                }).then(like=>{
                if(!like){
                    add_like()
                }
                else{
                    res.status(200).send([{error:"already_liked"}])
                }
            })

            function add_like(){
                List_of_comments.findOne({
                    where: {
                        id:id,
                        publication_category: category,
                        format:format,
                        publication_id:publication_id,
                        chapter_number:chapter_number,
                    }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    let number_of_likes=comments.number_of_likes+1;
                    comments.update({
                        "number_of_likes":number_of_likes
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                        List_of_comments_likes.create({
                        "status":"public",
                        "author_id_who_likes": current_user,
                        "comment_id":comments.id,
                        "publication_category": category,
                        "format":format,
                        "style":style,
                        "publication_id":publication_id,
                        "chapter_number":chapter_number,
                        });
                        res.status(200).send([comments]);
                    })
                   
                })
            }

            
    });

    router.post('/add_answer_on_commentary', function (req, res) {

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
        
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const commentary = req.body.commentary;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            const id = req.body.id;
            List_of_comments.findOne({
                where: {
                    id:id,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                let number_of_answers=comments.number_of_answers+1;
                comments.update({
                    "number_of_answers":number_of_answers
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    List_of_comments_answers.create({
                        "status":"public",
                        "author_id_who_replies": current_user,
                        "number_of_likes":0,
                        "comment_id": comments.id,
                        "commentary":commentary,
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(answer=>{res.status(200).send([answer])});
                    
                })
               
            })
        
    });

    

    router.post('/edit_answer_on_commentary', function (req, res) {

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
        
            const commentary = req.body.commentary;
            const id = req.body.id;
            
            List_of_comments_answers.findOne({
                where: {
                    id:id,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    comments.update({
                        "commentary":commentary,
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(answer=>{res.status(200).send([answer])});
                    
                })
         
    });

    router.post('/edit_commentary', function (req, res) {

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
       
            const commentary = req.body.commentary;
            const id = req.body.id;
            
            List_of_comments.findOne({
                where: {
                    id:id,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    comments.update({
                        "commentary":commentary,
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
            }).then(answer=>{
                res.status(200).send([answer])
            });
                    
        })
           
    });


    router.get('/get_number_of_likes_by_comment/:comment_id', function (req, res) {

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
         
        const comment_id = parseInt(req.params.comment_id);
        
        List_of_comments_likes.findAll({
            where: {
                comment_id:comment_id,
            }
        }).catch(err => {
            
              res.status(500).json({msg: "error", details: err});		
          }).then(comments=>{
              if(comments){
                res.status(200).send([{length:comments.length}])
              }
                      
          })
             
      });

    
    

    router.post('/add_like_on_commentary_answer', function (req, res) {

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
        const comment_answer_id = req.body.comment_answer_id;

        List_of_comments_answers_likes.findOne({
            where:{
                author_id_who_likes: current_user,
                comment_answer_id:comment_answer_id
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(like=>{
            if(!like){
                add_like()
            }
            else{
                res.status(200).send([{error:"already_liked"}])
            }
        })

        function add_like(){
            List_of_comments_answers.findOne({
                where: {
                    id:comment_answer_id,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                let number_of_likes=comments.number_of_likes+1;
                comments.update({
                    "number_of_likes":number_of_likes
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    List_of_comments_answers_likes.create({
                    "status":"public",
                    "author_id_who_likes": current_user,
                    "comment_answer_id":comments.id
                    });
                    res.status(200).send([comments]);
                })
                
            })
           
        }

        
    });

    
    router.delete('/remove_like_on_commentary_answer/:comment_answer_id', function (req, res) {

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
        const comment_answer_id = req.params.comment_answer_id;

        List_of_comments_answers_likes.findOne({
            where:{
                author_id_who_likes:current_user,
                comment_answer_id:comment_answer_id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(like=>{
            if(like){
                like.destroy({
                    truncate: false
                })
                remove_like();
            }
            else{
                res.status(200).send([{error:"already_removed"}])
            }
        } )
       
        function remove_like(){
            List_of_comments_answers.findOne({
                where: {
                    id:comment_answer_id,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                let number_of_likes=comments.number_of_likes-1;
                comments.update({
                    "number_of_likes":(number_of_likes>=0)?number_of_likes:0,
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    List_of_comments_answers_likes.destroy({
                        where: {
                            author_id_who_likes:current_user,
                            comment_answer_id:comments.id,
                                },
                        truncate: false
                    });
                    res.status(200).send([comments]);
                })
                
            })
        }
        
    });

    router.get('/get_commentary_information_by_id/:id/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {

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
        
            const id = req.params.id;
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = req.params.publication_id;
            const chapter_number = req.params.chapter_number;
            List_of_comments.findOne({
                where: {
                    status:"public",
                    id:id,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    res.status(200).send([comments]);
                })
           
    });

    router.get('/get_commentary_likes_by_id/:comment_id', function (req, res) {

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
       
            const comment_id = req.params.comment_id;
            List_of_comments_likes.findAll({
                where: {
                    status:"public",
                    comment_id:comment_id,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    res.status(200).send([comments]);
                })
          
    });

    router.get('/get_commentary_answers_by_id/:comment_id', function (req, res) {

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
        
            const comment_id = req.params.comment_id;
            List_of_comments_answers.findAll({
                where: {
                    status:"public",
                    comment_id:comment_id,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    res.status(200).send([comments]);
                })
       
    });

    router.get('/get_commentary_answers_likes_by_id/:comment_answer_id', function (req, res) {

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
     
        const comment_answer_id = req.params.comment_answer_id;
        List_of_comments_answers_likes.findAll({
            where: {
                status:"public",
                comment_answer_id:comment_answer_id,
            },
            order: [
                ['createdAt', 'DESC']
                ],
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                res.status(200).send([comments]);
            })
        
    });

    router.post('/remove_like_on_commentary', function (req, res) {

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
        const category = req.body.category;
        const format = req.body.format;
        const style = req.body.style;
        const id = req.body.id;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;

        List_of_comments_likes.findOne({
            where:{
                author_id_who_likes:current_user,
                publication_category: category,
                format:format,
                publication_id:publication_id,
                chapter_number:chapter_number,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(like=>{
            if(like){
                like.destroy({
                    truncate: false
                })
                remove_like();
            }
            else{
                res.status(200).send([{error:"already_removed"}])
            }
        } )

        function remove_like(){
            List_of_comments.findOne({
                where: {
                    id:id,
                    publication_category: category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                let number_of_likes=comments.number_of_likes-1;
                comments.update({
                    "number_of_likes":(number_of_likes>=0)?number_of_likes:0,
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                    List_of_comments_likes.destroy({
                        where: {
                            author_id_who_likes:current_user,
                            comment_id:comments.id,
                                },
                        truncate: false
                    });
                    res.status(200).send([comments]);
                })
               
            })
        }
            
            
        
    });

    

    

    

    router.delete('/remove_commentary_answer/:category/:format/:style/:publication_id/:chapter_number/:comment_anwser_id/:comment_id', function (req, res) {

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
        const category = req.params.category;
        const format = req.params.format;
        const comment_id = parseInt(req.params.comment_id);
        const publication_id = parseInt(req.params.publication_id);
        const comment_anwser_id =req.params.comment_anwser_id;
        List_of_comments.findOne({
            where: {
                id:comment_id
            }
        }).catch(err => {
			console.log(err)
			res.status(500).json({msg: "error", details: err});		
		}).then(comment=>{
            if(comment){
                List_of_comments_answers.findOne({
                    where: {
                        id:comment_anwser_id,
                        }
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({msg: "error", details: err});		
                }).then(comment_answer=>{
                    if(comment_answer){
                        List_of_contents.findOne({
                            where:{
                                publication_category: category,
                                format:format,
                                publication_id:publication_id,
                                status:"ok"
                            }
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({msg: "error", details: err});		
                        }).then(content=>{
                            if(content){
                                if(comment_answer.author_id_who_replies==current_user || content.id_user){
                                    comment_answer.update({
                                        status:"deleted"
                                    }).then(an=>{
                                        List_of_comments_answers.findAll({
                                            where: {
                                                comment_id:comment.id,
                                                status:"public"
                                                }
                                        }).catch(err => {
                                                
                                            res.status(500).json({msg: "error", details: err});		
                                        }).then(last_answers=>{
                                            List_of_comments.update({
                                                number_of_answers:last_answers.length,
                                            },
                                                {
                                                where: {
                                                   id:comment_id,
                                                }
                                            })
                                            res.status(200).send([comment_answer]);
                                            
                                          
                                        })

                                       
                                    })
                                    
                                }
                                else{
                                    res.status(200).send([{error:"not_allowed"}]); 
                                }
                            }
                            else{
                                res.status(200).send([{error:"content_not_found"}]);
                            }
                        })
                    }
                    else{
                        res.status(200).send([{error:"comment_answer_not_found"}]);
                    }
                    
                })
            }
            else{
                res.status(200).send([{error:"comment_not_found"}]);
            }
           
            
        })
            
    });

    router.get('/get_my_commentaries/:category/:format/:publication_id/:chapter_number', function (req, res) {

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
         
        const category = req.params.category;
        const format = req.params.format;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        List_of_comments.findAll({
            where: {
                status:"public",
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number,
                author_id_who_comments:current_user
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
            res.status(200).send([comments])
        }); 
 
    });


    router.get('/get_commentaries/:category/:format/:publication_id/:chapter_number', function (req, res) {

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
        
        const category = req.params.category;
        const format = req.params.format;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        List_of_comments.findAll({
            where: {
                status:"public",
                publication_category:category,
                format: format,
                publication_id: publication_id,
                chapter_number: chapter_number,
                author_id_who_comments:{[Op.ne]:current_user}
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
            res.status(200).send([comments])
        }); 
  
    });



   

    router.post('/get_number_of_ads_comments', function (req, res) {

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
        let list_of_ads_ids = req.body.list_of_ads_ids;
        let number_of_comments=0
        let compt=0
        for(let i=0;i<list_of_ads_ids.length;i++){
            List_of_comments.findAll({
                where: {
                    publication_category:'ad',
                    publication_id: list_of_ads_ids[i],
                }
            })
            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                number_of_comments+=comments.length
                compt++;
                if(compt==list_of_ads_ids.length){
                    res.status(200).send([{number_of_comments:number_of_comments}])
                }
            }); 
        }
    });


    router.post('/get_number_of_notations', function (req, res) {

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
        let list_of_ids = req.body.list_of_ids;
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let number_of_views=0;
        let number_of_likes=0;
        let number_of_loves=0;
        let number_of_comments=0;
        let compt=0;
        for(let i=0;i<list_of_ids.length;i++){
            List_of_views.findAll({
                where: {
                    publication_category:publication_category,
                    format: format,
                    publication_id: list_of_ids[i],
                },
            })
            .catch(err => {
			console.log(err)
			res.status(500).json({msg: "error", details: err});		
		}).then(views =>  {
                number_of_views+=views.length
                Liste_of_likes.findAll({
                    where: {
                        publication_category:publication_category,
                        format: format,
                        publication_id: list_of_ids[i],
                    },
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
                    number_of_likes+=likes.length
                    Liste_of_loves.findAll({
                        where: {
                            publication_category:publication_category,
                            format: format,
                            publication_id: list_of_ids[i],
                        },
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
                        number_of_loves+=loves.length;
                        List_of_comments.findAll({
                            where: {
                                publication_category:publication_category,
                                format: format,
                                publication_id: list_of_ids[i],
                            },
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                            number_of_comments+=comments.length
                            compt++;
                            if(compt==list_of_ids.length){
                                res.status(200).send([{number_of_views:number_of_views,number_of_likes:number_of_likes,number_of_loves:number_of_loves,number_of_comments:number_of_comments}])
                            }
                        }); 
                    })
                })
                
            }); 
        }
        
 
    });

    
    router.post('/get_notations_for_a_content', function (req, res) {

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
        let publication_id = req.body.publication_id;
        let publication_category = req.body.publication_category;
        let date_format = req.body.date_format;
        let format = req.body.format;
        let list_of_views=[];
        let list_of_likes=[];
        let list_of_loves=[];
        let list_of_comments=[];
        let compt=0;
        const Op = Sequelize.Op;

        if(date_format==0){
            let today=new Date();
            for(let i=0;i<8;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));

                List_of_views.findAll({
                    where: {
                        publication_category:publication_category,
                        format: format,
                        publication_id: publication_id,
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views =>  {
                    list_of_views[i]=views.length
                    Liste_of_likes.findAll({
                        where: {
                            publication_category:publication_category,
                            format: format,
                            publication_id: publication_id,
                            [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                        },
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
                        list_of_likes[i]=likes.length
                        Liste_of_loves.findAll({
                            where: {
                                publication_category:publication_category,
                                format: format,
                                publication_id: publication_id,
                                [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                            },
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
                            list_of_loves[i]=loves.length;
                            List_of_comments.findAll({
                                where: {
                                    publication_category:publication_category,
                                    format: format,
                                    publication_id: publication_id,
                                    [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                                },
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                                list_of_comments[i]=comments.length
                                compt++;
                                if(compt==8){
                                    res.status(200).send([{list_of_views:list_of_views,list_of_likes:list_of_likes,list_of_loves:list_of_loves,list_of_comments:list_of_comments}])
                                }
                            }); 
                        })
                    })
                    
                }); 

                
            }
        
        }

        if(date_format==1){
            let today=new Date();
            for(let i=0;i<30;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                
                List_of_views.findAll({
                    where: {
                        publication_category:publication_category,
                        format: format,
                        publication_id: publication_id,
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views =>  {
                    list_of_views[i]=views.length
                    Liste_of_likes.findAll({
                        where: {
                            publication_category:publication_category,
                            format: format,
                            publication_id: publication_id,
                            [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                        },
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
                        list_of_likes[i]=likes.length
                        Liste_of_loves.findAll({
                            where: {
                                publication_category:publication_category,
                                format: format,
                                publication_id: publication_id,
                                [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                            },
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
                            list_of_loves[i]=loves.length;
                            List_of_comments.findAll({
                                where: {
                                    publication_category:publication_category,
                                    format: format,
                                    publication_id: publication_id,
                                    [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                                },
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                                list_of_comments[i]=comments.length
                                compt++;
                                if(compt==30){
                                    res.status(200).send([{list_of_views:list_of_views,list_of_likes:list_of_likes,list_of_loves:list_of_loves,list_of_comments:list_of_comments}])
                                }
                            }); 
                        })
                    })
                    
                }); 
                
            }
        
        }
     
        if(date_format==2){
            for(let i=0;i<53;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                
                List_of_views.findAll({
                    where: {
                        publication_category:publication_category,
                        format: format,
                        publication_id: publication_id,
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views =>  {
                    list_of_views[i]=views.length
                    Liste_of_likes.findAll({
                        where: {
                            publication_category:publication_category,
                            format: format,
                            publication_id: publication_id,
                            [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                        },
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
                        list_of_likes[i]=likes.length
                        Liste_of_loves.findAll({
                            where: {
                                publication_category:publication_category,
                                format: format,
                                publication_id: publication_id,
                                [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                            },
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
                            list_of_loves[i]=loves.length;
                            List_of_comments.findAll({
                                where: {
                                    publication_category:publication_category,
                                    format: format,
                                    publication_id: publication_id,
                                    [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                                },
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                                list_of_comments[i]=comments.length
                                compt++;
                                if(compt==53){
                                    res.status(200).send([{list_of_views:list_of_views,list_of_likes:list_of_likes,list_of_loves:list_of_loves,list_of_comments:list_of_comments}])
                                }
                            }); 
                        })
                    })
                    
                }); 

                
            }
        
        }

        if(date_format==3){
            var date1 = new Date('08/01/2019');
            var date2 = new Date();
            var difference = date2.getTime() - date1.getTime();
            var days = Math.ceil(difference / (1000 * 3600 * 24));
            var weeks = Math.ceil(days/7) + 1;
            for(let i=0;i<weeks;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                
                List_of_views.findAll({
                    where: {
                        publication_category:publication_category,
                        format: format,
                        publication_id: publication_id,
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                })
                .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views =>  {
                    list_of_views[i]=views.length
                    Liste_of_likes.findAll({
                        where: {
                            publication_category:publication_category,
                            format: format,
                            publication_id: publication_id,
                            [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                        },
                    })
                    .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes =>  {
                        list_of_likes[i]=likes.length
                        Liste_of_loves.findAll({
                            where: {
                                publication_category:publication_category,
                                format: format,
                                publication_id: publication_id,
                                [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                            },
                        })
                        .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves =>  {
                            list_of_loves[i]=loves.length;
                            List_of_comments.findAll({
                                where: {
                                    publication_category:publication_category,
                                    format: format,
                                    publication_id: publication_id,
                                    [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                                },
                            })
                            .catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments =>  {
                                list_of_comments[i]=comments.length
                                compt++;
                                if(compt==weeks){
                                    res.status(200).send([{list_of_views:list_of_views,list_of_likes:list_of_likes,list_of_loves:list_of_loves,list_of_comments:list_of_comments}])
                                }
                            }); 
                        })
                    })
                    
                }); 

               
                
            }
        }
    });

    
    

    router.post('/update_marks', function (req, res) {

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
        

        const Op = Sequelize.Op;


        let number_of_likes=0;
        let number_of_comments=0;
        let number_of_views=0;
        let number_of_loves=0
        let compteur_category=0;

        Liste_Bd_Oneshot.findAll({
            where:{
                authorid:id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(series=>{
            if(series[0]){
                let compt=0
                for(let i=0;i<series.length;i++){
                    Liste_of_likes.findAll({
                        where: {
                            status:"public",
                            publication_category:"comic",
                            format: "one-shot",
                            publication_id: series[i].bd_id,
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                        number_of_likes+=likes.length;
                        Liste_of_loves.findAll({
                            where: {
                                status:"public",
                                publication_category:"comic",
                                format: "one-shot",
                                publication_id: series[i].bd_id,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves=>{
                            number_of_loves+=loves.length;
                            List_of_views.findAll({
                                where: {
                                    status:"public",
                                    publication_category:"comic",
                                    format: "one-shot",
                                    publication_id: series[i].bd_id,
                                }
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                number_of_views+=views.length;
                                List_of_comments.findAll({
                                    where: {
                                        status:"public",
                                        publication_category:"comic",
                                        format: "one-shot",
                                        publication_id: series[i].bd_id,
                                    }
                                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                                    number_of_comments+=comments.length;
                                    
                                    compt++
                                    if(compt==series.length){
                                        compteur_category++;
                                        check_compteur_category()
                                    }
                                })
                            })
                        })
                    })
                }
            }
            else{
                compteur_category++;
                check_compteur_category()
            }
        })
      
        Liste_Bd_Serie.findAll({
            where:{
                authorid:id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(series=>{
            if(series[0]){
                let compt=0
                for(let i=0;i<series.length;i++){
                    Liste_of_likes.findAll({
                        where: {
                            status:"public",
                            publication_category:"comic",
                            format: "serie",
                            publication_id: series[i].bd_id,
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                        number_of_likes+=likes.length;
                        Liste_of_loves.findAll({
                            where: {
                                status:"public",
                                publication_category:"comic",
                                format: "serie",
                                publication_id: series[i].bd_id,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves=>{
                            number_of_loves+=loves.length;
                            List_of_views.findAll({
                                where: {
                                    status:"public",
                                    publication_category:"comic",
                                    format: "serie",
                                    publication_id: series[i].bd_id,
                                }
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                number_of_views+=views.length;
                                List_of_comments.findAll({
                                    where: {
                                        status:"public",
                                        publication_category:"comic",
                                        format: "serie",
                                        publication_id: series[i].bd_id,
                                    }
                                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                                    number_of_comments+=comments.length;
                                    
                                    compt++
                                    if(compt==series.length){
                                        compteur_category++;
                                        check_compteur_category()
                                    }
                                })
                            })
                        })
                    })
                }
            }
            else{
                compteur_category++;
                check_compteur_category()
            }
        })

        Drawings_one_page.findAll({
            where:{
                authorid:id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(series=>{
            if(series[0]){
                let compt=0
                for(let i=0;i<series.length;i++){
                    Liste_of_likes.findAll({
                        where: {
                            status:"public",
                            publication_category:"drawing",
                            format: "one-shot",
                            publication_id: series[i].drawing_id,
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                        number_of_likes+=likes.length;
                        Liste_of_loves.findAll({
                            where: {
                                status:"public",
                                publication_category:"drawing",
                            format: "one-shot",
                            publication_id: series[i].drawing_id,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves=>{
                            number_of_loves+=loves.length;
                            List_of_views.findAll({
                                where: {
                                    status:"public",
                                    publication_category:"drawing",
                            format: "one-shot",
                            publication_id: series[i].drawing_id,
                                }
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                number_of_views+=views.length;
                                List_of_comments.findAll({
                                    where: {
                                        status:"public",
                                        publication_category:"drawing",
                            format: "one-shot",
                            publication_id: series[i].drawing_id,
                                    }
                                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                                    number_of_comments+=comments.length;
                                    
                                    compt++
                                    if(compt==series.length){
                                        compteur_category++
                                        check_compteur_category()
                                    }
                                })
                            })
                        })
                    })
                }
            }
            else{
                compteur_category++;
                check_compteur_category()
            }
        })

        Liste_Drawings_Artbook.findAll({
            where:{
                authorid:id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(series=>{
            if(series[0]){
                let compt=0
                for(let i=0;i<series.length;i++){
                    Liste_of_likes.findAll({
                        where: {
                            status:"public",
                            publication_category:"drawing",
                            format: "artbook",
                            publication_id: series[i].drawing_id,
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                        number_of_likes+=likes.length;
                        Liste_of_loves.findAll({
                            where: {
                                status:"public",
                                publication_category:"drawing",
                                format: "artbook",
                                publication_id: series[i].drawing_id,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves=>{
                            number_of_loves+=loves.length;
                            List_of_views.findAll({
                                where: {
                                    status:"public",
                                    publication_category:"drawing",
                                    format: "artbook",
                                    publication_id: series[i].drawing_id,
                                }
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                number_of_views+=views.length;
                                List_of_comments.findAll({
                                    where: {
                                        status:"public",
                                        publication_category:"drawing",
                                        format: "artbook",
                                        publication_id: series[i].drawing_id,
                                    }
                                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                                    number_of_comments+=comments.length;
                                    
                                    compt++
                                    if(compt==series.length){
                                        compteur_category++;
                                        check_compteur_category()
                                    }
                                })
                            })
                        })
                    })
                }
            }
            else{
                compteur_category++;
                check_compteur_category()
            }
        })

        Liste_Writings.findAll({
            where:{
                authorid:id,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(series=>{
            if(series[0]){
                let compt=0
                for(let i=0;i<series.length;i++){
                    Liste_of_likes.findAll({
                        where: {
                            status:"public",
                            publication_category:"writing",
                            publication_id: series[i].writing_id,
                        }
                    }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(likes=>{
                        number_of_likes+=likes.length;
                        Liste_of_loves.findAll({
                            where: {
                                status:"public",
                                publication_category:"writing",
                                publication_id: series[i].writing_id,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(loves=>{
                            number_of_loves+=loves.length;
                            List_of_views.findAll({
                                where: {
                                    status:"public",
                                    publication_category:"writing",
                                    publication_id: series[i].writing_id,
                                }
                            }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(views=>{
                                number_of_views+=views.length;
                                List_of_comments.findAll({
                                    where: {
                                        status:"public",
                                        publication_category:"writing",
                                        publication_id: series[i].writing_id,
                                    }
                                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(comments=>{
                                    number_of_comments+=comments.length;
                                    
                                    compt++
                                    if(compt==series.length){
                                        compteur_category++;
                                        check_compteur_category()
                                    }
                                })
                            })
                        })
                    })
                }
            }
            else{
                compteur_category++;
                check_compteur_category()
            }
        })

        function check_compteur_category(){
            if(compteur_category==5){
                User.findOne({
                    where:{
                        id:id
                    }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                    if(user){
                        user.update({
                            "number_of_likes":number_of_likes,
                            "number_of_loves":number_of_loves,
                            "number_of_views":number_of_views,
                            "number_of_comments":number_of_comments,
                        })
                        res.status(200).send([user])
                    }
                    else{
                        res.status(200).send([{error:"not found"}])
                    }
                })
            }
        }
    
    });


    router.get('/get_user_public_stats/:pseudo', function (req, res) {

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
        let pseudo = req.params.pseudo;
        
        

        let likes=0;
        let views=0;
        let loves=0
        let compteur_category=0;


        User.findOne({
            where:{
                nickname:pseudo
            }
        }).then(r=>{
            if(r){
                get_stats(r)
            }
            else{
                return res.status(200).json([{likes:likes,loves:loves,views:views}]);
            }
        })
  
        function get_stats(user){
            Liste_of_likes.count({
                where:{
                    author_id_liked:user.id
                }
            }).then(num=>{
                likes=num;
                compteur_category+=1
                if(compteur_category==3){
                    return res.status(200).json([{likes:likes,loves:loves,views:views}]);
                }
            })

            List_of_views.count({
                where:{
                    author_id_viewed:user.id
                }
            }).then(num=>{
                views=num;
                compteur_category+=1
                if(compteur_category==3){
                    return res.status(200).json([{likes:likes,loves:loves,views:views}]);
                }
            })

            Liste_of_loves.count({
                where:{
                    author_id_loved:user.id
                }
            }).then(num=>{
                loves=num;
                compteur_category+=1
                if(compteur_category==3){
                    return res.status(200).json([{likes:likes,loves:loves,views:views}]);
                }
            })
        }
        
          
      
    });
}