
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
    list_of_ads
    ) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }


  //on poste les premières informations du formulaire et on récupère l'id de la bd
  router.post('/add_like/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_liked', function (req, res) {
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
            console.log(firsttag);
            if (category === "bd" ) {
                if(format === "one-shot"){
                    Liste_Bd_Oneshot.findOne({
                        where: {
                        bd_id: publication_id,
                        }
                    })
                    .then(bd =>  {
                        const likes = bd.likesnumber + 1;
                        bd.update({
                        "likesnumber":likes,
                        })
                        .then(create(bd))
                    }); 
                    
                }
                else if (format === "serie"){

                    Chapters_Bd_Serie.findOne({
                        where: {
                        bd_id: publication_id,
                        chapter_number:chapter_number,
                        }
                    })
                    .then(chapter =>  {                      
                        const likes = chapter.likesnumber + 1;
                        chapter.update({
                        "likesnumber":likes,
                        }) 
                        .then(chapter =>  { 
                                Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .then(bd_serie =>  {  
                                    const likes = bd_serie.likesnumber + 1;
                                    bd_serie.update({
                                    "likesnumber":likes,
                                    })
                                })                   
                                .then(create(bd_serie))
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
                    .then(drawing =>  {
                        const likes = drawing.likesnumber + 1;
                        drawing.update({
                        "likesnumber":likes,
                        })
                        .then(create(drawing))
                    }); 
                }

                else if(format === "artbook"){
                    Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const likes = drawing.likesnumber + 1;
                        drawing.update({
                        "likesnumber":likes,
                        })
                        .then(create(drawing))
                    }); 
                }
            }

            else  if (category === "writing" ) {
                Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .then(writing =>  {
                    const likes = writing.likesnumber + 1;
                    writing.update({
                    "likesnumber":likes,
                    })
                    .then(create(writing))
                }); 
                
            }
            
            function create(content){
                console.log('ajout de like ok');
                Liste_of_likes.create({
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
                }).then(res.status(200).send([content]))
            }
                  
            
    });

    router.delete('/remove_like/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = parseInt(req.params.publication_id);
            const chapter_number = parseInt(req.params.chapter_number);
           
        
            if (category === "bd" ) {
                if(format === "one-shot"){
                    Liste_Bd_Oneshot.findOne({
                        where: {
                        bd_id: publication_id,
                        }
                    })
                    .then(bd =>  {
                        const likes = bd.likesnumber - 1;
                        bd.update({
                        "likesnumber":likes,
                        })
                        .then(res.status(200).send([bd]))
                    }); 
                    
                }
                else if (format === "serie"){
        
                    Chapters_Bd_Serie.findOne({
                        where: {
                        bd_id: publication_id,
                        chapter_number:chapter_number,
                        }
                    })
                    .then(chapter =>  {
   
                        const likes = chapter.likesnumber - 1;      
                        chapter.update({
                        "likesnumber":likes,
                        })
                        .then(chapter =>  {  
                            Liste_Bd_Serie.findOne({
                                where: {
                                bd_id: chapter.bd_id,
                                }
                            })
                            .then(bd_serie =>  {  
                                const likes = bd_serie.likesnumber - 1;
                                bd_serie.update({
                                "likesnumber":likes,
                                })
                            })                   
                            .then(res.status(200).send([chapter]))
                        
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
                    .then(drawing =>  {
                        const likes = drawing.likesnumber - 1;
                        drawing.update({
                        "likesnumber":likes,
                        })
                        .then(res.status(200).send([drawing]))
                    }); 
                }
        
                else if(format === "artbook"){
                    Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const likes = drawing.likesnumber - 1;
                        drawing.update({
                        "likesnumber":likes,
                        })
                        .then(res.status(200).send([drawing]))
                    }); 
                }
            }
        
            else  if (category === "writing" ) {
                 Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .then(writing =>  {
                    const likes = writing.likesnumber - 1;
                    writing.update({
                    "likesnumber":likes,
                    })
                    .then(res.status(200).send([writing]))
                }); 
                
            }
                
                console.log('suppression de like ok');
                Liste_of_likes.destroy({
                    where: {
                        author_id_who_likes:current_user,
                        publication_category: category,
                        format:format,
                        style:style,
                        publication_id:publication_id,
                        chapter_number:chapter_number,
                        },
                    truncate: false
                })
                
    });
        

    router.post('/add_love/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_loved', function (req, res) {
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
            if (category === "bd" ) {
                if(format === "one-shot"){
                    Liste_Bd_Oneshot.findOne({
                        where: {
                            bd_id: publication_id,
                        }
                        })
                        .then(bd =>  {
                        const loves = bd.lovesnumber + 1;
                        bd.update({
                            "lovesnumber":loves,
                        })
                        .then(create(bd))
                        }); 
                    
                }
                else if (format === "serie"){

                    Chapters_Bd_Serie.findOne({
                        where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number,
                        }
                        })
                        .then(chapter =>  {
                        const loves = chapter.lovesnumber + 1;
                        chapter.update({
                            "lovesnumber":loves,
                        })
                        .then(chapter =>  { 
                        
                              Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .then(bd_serie =>  {  
                                    const loves = bd_serie.lovesnumber + 1;
                                    bd_serie.update({
                                    "lovesnumber":loves,
                                    })
                                })                   
                                .then(create(bd_serie))
                            
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
                    .then(drawing =>  {
                        const loves = drawing.lovesnumber + 1;
                        drawing.update({
                        "lovesnumber":loves,
                        })
                        .then(create(drawing))
                    }); 
                }

                else if(format === "artbook"){
                    Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const loves = drawing.lovesnumber + 1;
                        drawing.update({
                        "lovesnumber":loves,
                        })
                        .then(create(drawing))
                    }); 
                }
                }

                else  if (category === "writing" ) {
                Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .then(writing =>  {
                    const loves = writing.lovesnumber + 1;
                    writing.update({
                    "lovesnumber":loves,
                    })
                    .then(create(writing))
                }); 
                
                }

                function create(content){
                    console.log('ajout de love ok');
                    Liste_of_loves.create({
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
                        }) .then(res.status(200).send([content]))
                }
               
                
            
    });

    router.delete('/remove_love/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 

        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        if (category === "bd" ) {
            if(format === "one-shot"){
                bd = await Liste_Bd_Oneshot.findOne({
                    where: {
                        bd_id: publication_id,
                    }
                    })
                    .then(bd =>  {
                    const loves = bd.lovesnumber - 1;
                    bd.update({
                        "lovesnumber":loves,
                    })
                    .then(res.status(200).send([bd]))
                    }); 
                
            }
            else if (format === "serie"){

                chapter = await Chapters_Bd_Serie.findOne({
                    where: {
                        bd_id: publication_id,
                        chapter_number:chapter_number,
                    }
                    })
                    .then(chapter =>  {
                    const loves = chapter.lovesnumber - 1;
                    chapter.update({
                        "lovesnumber":loves,
                    }) 
                    .then(chapter =>  {  
                        (async () => {
                            bd_serie = await Liste_Bd_Serie.findOne({
                                where: {
                                bd_id: chapter.bd_id,
                                }
                            })
                            .then(bd_serie =>  {  
                                const loves = bd_serie.lovesnumber - 1;
                                bd_serie.update({
                                "lovesnumber":loves,
                                })
                            })                   
                            .then(res.status(200).send([chapter]))
                        })();
                        
                        })
                    })

            }
            
            }

            else  if (category === "drawing" ) {
                if(format === "one-shot"){
                    drawing = await Drawings_one_page.findOne({
                        where: {
                            drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const loves = drawing.lovesnumber - 1;
                        drawing.update({
                        "lovesnumber":loves,
                        })
                        .then(res.status(200).send([drawing]))
                    }); 
                }

                else if(format === "artbook"){
                    drawing = await Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const loves = drawing.lovesnumber - 1;
                        drawing.update({
                        "lovesnumber":loves,
                        })
                        .then(res.status(200).send([drawing]))
                    }); 
                }
            }

            else  if (category === "writing" ) {
            writing = await Liste_Writings.findOne({
                where: {
                    writing_id: publication_id,
                }
            })
            .then(writing =>  {
                const loves = writing.lovesnumber - 1;
                writing.update({
                "lovesnumber":loves,
                })
                .then(res.status(200).send([writing]))
            }); 
            
            }
            { 
            console.log('suppression de love ok');
            Liste_of_loves.destroy({
                where: {
                    author_id_who_loves:current_user,
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                        },
                truncate: false
                })
            }
        })();
    });





    router.post('/add_view/:category/:format/:style/:publication_id/:chapter_number/:firsttag/:secondtag/:thirdtag/:author_id_viewed', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        console.log(" adding view")
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        const firsttag=req.params.firsttag;
        const secondtag=req.params.secondtag;
        const thirdtag=req.params.thirdtag;
        const author_id_viewed=parseInt(req.params.author_id_viewed);
        console.log("format");
        console.log(format);
        console.log(category);
        console.log(style);
        console.log(publication_id)
        console.log('ajout de view ok');
        List_of_views.create({
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
        .then(list_of_view => {res.status(200).send([list_of_view])})
            
       
        
        });

    router.post('/add_view_time', function (req, res) {
        console.log(" adding add_view_time")
        let current_user = get_current_user(req.cookies.currentUser);
        const id_view_created = req.body.id_view_created;
        const view_time = req.body.view_time;
        console.log("add_view_time")
        console.log(id_view_created)

        console.log(view_time)

        console.log("adding view time in progress");
        if(id_view_created>0){
            List_of_views.findOne({
                where: {
                    id:id_view_created,
                }
            })
            .then(view =>  {
                if(view){
                    if(view_time>5){
                        if (view.publication_category=== "bd" ) {
                            if(view.format === "one-shot"){
                                Liste_Bd_Oneshot.findOne({
                                    where: {
                                        bd_id: view.publication_id,
                                    }
                                    })
                                    .then(bd =>  {
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
                                    .then(chapter =>  {
                                        const views = chapter.viewnumber + 1;
                                        chapter.update({
                                            "viewnumber":views,
                                        })
                                        .then(chapter =>  {  
                                            console.log("la boucle de vue est dans l'ajout de like bd serie " + chapter.bd_id);
                                    
                                            Liste_Bd_Serie.findOne({
                                                where: {
                                                bd_id: chapter.bd_id,
                                                }
                                            })
                                            .then(bd =>  {
                                                console.log(bd_serie.viewnumber);
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
                                .then(drawing =>  {
                                    const views = drawing.viewnumber + 1;
                                    drawing.update({
                                        "viewnumber":views,
                                    })
                                    if(drawing.firsttag=='Romantique' || drawing.firsttag=='Shojo' || drawing.firsttag=='Yuri' || drawing.firsttag=='Yaoi' || drawing.firsttag=='Josei' 
                                    || drawing.secondtag=='Romantique' || drawing.secondtag=='Shojo' || drawing.secondtag=='Yuri' || drawing.secondtag=='Yaoi' || drawing.secondtag=='Josei' 
                                    || drawing.thirdtag=='Romantique' || drawing.thirdtag=='Shojo' || drawing.thirdtag=='Yuri' || drawing.thirdtag=='Yaoi' || drawing.thirdtag=='Josei'){
                                        if(getRandomInt(5)==0){
                                            console.log("pass")
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
                                        console.log("no pass")
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
                                .then(drawing =>  {
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
                            console.log("ajout vu pour writing");
                            Liste_Writings.findOne({
                                where: {
                                    writing_id: view.publication_id,
                                }
                            })
                            .then(writing =>  {
                                
                                const views = writing.viewnumber + 1;
                                writing.update({
                                    "viewnumber":views,
                                })
                                console.log(writing)
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
                }
                else{
                    res.status(200).send([{nothing:"nothing"}])
                }
                    
                        
            });  
        }
           
            
        
        });



    router.get('/get_likes/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {   
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        likes = await Liste_of_likes.findAll({
            where: {
                publication_category:category,
                format: format,
                style: style,
                publication_id: publication_id,
                chapter_number: chapter_number,
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .then(likes =>  {
            res.status(200).send([likes])
        }); 

    })();    
    });

    router.get('/get_loves/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        
        (async () => {
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);
        console.log("get loves")
        console.log(publication_id)
        console.log(style)
        console.log(format)
        console.log(style);
        console.log(category)
        console.log(chapter_number);
        Liste_of_loves.findAll({
            where: {
                publication_category:category,
                format: format,
                style: style,
                publication_id: publication_id,
                chapter_number: chapter_number,
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .then(loves =>  {
            console.log("result loves")
            console.log(loves);
            res.status(200).send([loves])
        }); 
     })();     
    });



    router.post('/add_commentary', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            console.log("adding comment")
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            const commentary = req.body.commentary;
            console.log(category)
            console.log(publication_id)
            if (category === "comic" ) {
                if(format === "one-shot"){
                    bd = await Liste_Bd_Oneshot.findOne({
                        where: {
                            bd_id: publication_id,
                        }
                        })
                        .then(bd =>  {
                        const number = bd.commentarynumbers + 1;
                        bd.update({
                            "commentarynumbers":number,
                        })
                        
                        }); 
                    
                }
                else if (format === "serie"){

                    chapter = await Chapters_Bd_Serie.findOne({
                        where: {
                            bd_id: publication_id,
                            chapter_number:chapter_number + 1,
                        }
                        })
                        .then(chapter =>  {
                        console.log(chapter);
                        const number = chapter.commentarynumbers + 1;
                        chapter.update({
                            "commentarynumbers":number,
                        })
                        .then(chapter =>  { 
                            (async () => { 
                        
                                bd_serie = await Liste_Bd_Serie.findOne({
                                    where: {
                                    bd_id: chapter.bd_id,
                                    }
                                })
                                .then(bd_serie =>  {  
                                    const number = bd_serie.commentarynumbers + 1;
                                    bd_serie.update({
                                    "commentarynumbers":number,
                                    })
                                })                   
                            })();
                            
                            })
                        })

                }
                
             }
                else  if (category === "drawing" ) {
                if(format === "one-shot"){
                    drawing = await Drawings_one_page.findOne({
                        where: {
                            drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const number = drawing.commentarynumbers + 1;
                        drawing.update({
                        "commentarynumbers":number,
                        })
                    }); 
                }

                else if(format === "artbook"){
                    drawing = await Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const number = drawing.commentarynumbers + 1;
                        drawing.update({
                        "commentarynumbers":number,
                        })
                    }); 
                }
                }

                else  if (category === "writing" ) {
                writing = await Liste_Writings.findOne({
                    where: {
                        writing_id: publication_id,
                    }
                })
                .then(writing =>  {
                    const number = writing.commentarynumbers + 1;
                    writing.update({
                    "commentarynumbers":number,
                    })
                }); 
                
                }

                else if(category=="ad"){
                    console.log("looking for ad")
                    list_of_ads.findOne({
                        where: {
                            id: publication_id,
                        }
                    })
                    .then(ad =>  {
                        console.log(ad)
                        let number=0;
                        if(!ad.commentariesnumber){
                            number=1;
                        }
                        else{
                            number = ad.commentariesnumber + 1;
                        }
                        console.log(number);
                        ad.update({
                        "commentariesnumber":number,
                        })
                    });
                }
                console.log('ajout de commentair ok');
                List_of_comments.create({
                        "author_id_who_comments": current_user,
                        "publication_category":category,
                        "format": format,
                        "style":style,
                        "publication_id": publication_id,
                        "chapter_number": chapter_number,
                        "number_of_likes":0,
                        "number_of_answers":0,
                        "commentary":commentary
                    }).then(comments=>{
                        res.status(200).send([comments]);
                    })
                
            })();
    });

    router.post('/modify_commentary', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
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
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                comments.update({
                    "commentary":commentary
                }).then(comments=>{
                    res.status(200).send([comments]);
                })
               
            })
            })();
    });

    router.post('/add_like_on_commentary', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            const id = req.body.id;
            List_of_comments.findOne({
                where: {
                    id:id,
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                let number_of_likes=comments.number_of_likes+1;
                comments.update({
                    "number_of_likes":number_of_likes
                }).then(comments=>{
                    List_of_comments_likes.create({
                    "author_id_who_likes": current_user,
                    "comment_id":comments.id
                    });
                    res.status(200).send([comments]);
                })
               
            })
            })();
    });

    router.post('/add_answer_on_commentary', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
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
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                let number_of_answers=comments.number_of_answers+1;
                comments.update({
                    "number_of_answers":number_of_answers
                }).then(comments=>{
                    List_of_comments_answers.create({
                        "author_id_who_replies": current_user,
                        "number_of_likes":0,
                        "comment_id": comments.id,
                        "commentary":commentary,
                    }).then(answer=>{res.status(200).send([answer])});
                    
                })
               
            })
            })();
    });

    

    router.post('/edit_answer_on_commentary', function (req, res) {
        (async () => { 
            const commentary = req.body.commentary;
            const id = req.body.id;
            console.log(id);
            List_of_comments_answers.findOne({
                where: {
                    id:id,
                }
            }).then(comments=>{
                    comments.update({
                        "commentary":commentary,
                    }).then(answer=>{res.status(200).send([answer])});
                    
                })
            })();
    });

    router.post('/edit_commentary', function (req, res) {
        (async () => { 
            const commentary = req.body.commentary;
            const id = req.body.id;
            console.log(id);
            List_of_comments.findOne({
                where: {
                    id:id,
                }
            }).then(comments=>{
                    comments.update({
                        "commentary":commentary,
                    }).then(answer=>{res.status(200).send([answer])});
                    
                })
            })();
    });

    

    router.post('/add_like_on_commentary_answer', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            const comment_answer_id = req.body.comment_answer_id;
            List_of_comments_answers.findOne({
                where: {
                    id:comment_answer_id,
                }
            }).then(comments=>{
                let number_of_likes=comments.number_of_likes+1;
                comments.update({
                    "number_of_likes":number_of_likes
                }).then(comments=>{
                    List_of_comments_answers_likes.create({
                    "author_id_who_likes": current_user,
                    "comment_answer_id":comments.id
                    });
                    res.status(200).send([comments]);
                })
               
            })
            })();
    });

    
    router.delete('/remove_like_on_commentary_answer/:comment_answer_id', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            const comment_answer_id = req.params.comment_answer_id;
            List_of_comments_answers.findOne({
                where: {
                    id:comment_answer_id,
                }
            }).then(comments=>{
                let number_of_likes=comments.number_of_likes-1;
                comments.update({
                    "number_of_likes":number_of_likes
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
            })();
    });

    router.get('/get_commentary_information_by_id/:id/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        (async () => { 
            const id = req.params.id;
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = req.params.publication_id;
            const chapter_number = req.params.chapter_number;
            List_of_comments.findOne({
                where: {
                    id:id,
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                    res.status(200).send([comments]);
                })
            })();
    });

    router.get('/get_commentary_likes_by_id/:comment_id', function (req, res) {
        (async () => { 
            const comment_id = req.params.comment_id;
            List_of_comments_likes.findAll({
                where: {
                    comment_id:comment_id,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
            }).then(comments=>{
                    res.status(200).send([comments]);
                })
            })();
    });

    router.get('/get_commentary_answers_by_id/:comment_id', function (req, res) {
        (async () => { 
            const comment_id = req.params.comment_id;
            List_of_comments_answers.findAll({
                where: {
                    comment_id:comment_id,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
            }).then(comments=>{
                    res.status(200).send([comments]);
                })
            })();
    });

    router.get('/get_commentary_answers_likes_by_id/:comment_answer_id', function (req, res) {
        (async () => { 
            const comment_answer_id = req.params.comment_answer_id;
            List_of_comments_answers_likes.findAll({
                where: {
                    comment_answer_id:comment_answer_id,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
            }).then(comments=>{
                    res.status(200).send([comments]);
                })
            })();
    });

    router.post('/remove_like_on_commentary', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            const category = req.body.category;
            const format = req.body.format;
            const style = req.body.style;
            const id = req.body.id;
            const publication_id = req.body.publication_id;
            const chapter_number = req.body.chapter_number;
            List_of_comments.findOne({
                where: {
                    id:id,
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                let number_of_likes=comments.number_of_likes-1;
                comments.update({
                    "number_of_likes":number_of_likes
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
            })();
    });

    

    router.delete('/remove_commentary_answer/:category/:format/:style/:publication_id/:chapter_number/:comment_anwser_id', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 
            const category = req.params.category;
            const format = req.params.format;
            const style = req.params.style;
            const publication_id = parseInt(req.params.publication_id);
            const chapter_number = parseInt(req.params.chapter_number);
            const comment_anwser_id =req.params.comment_anwser_id;
            List_of_comments.findOne({
                where: {
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                let number_of_answers=comments.number_of_answers-1;
                comments.update({
                    "number_of_answers":number_of_answers
                }).then(comments=>{
                    List_of_comments_answers.findOne({
                        where: {
                            author_id_who_replies:current_user,
                            id:comment_anwser_id,
                            }
                    }).then(comment=>{
                        List_of_comments_answers.destroy({
                            where: {
                                author_id_who_replies:current_user,
                                id:comment_anwser_id,
                                    },
                            truncate: false
                        });
                        res.status(200).send([comment]);
                    })
                    
                })
               
            })
            })();
    });

    router.delete('/remove_commentary/:category/:format/:style/:publication_id/:chapter_number/:comment_id', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => { 

        const category = req.params.category;
        const comment_id = req.params.comment_id;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        if (category === "comic" ) {
            if(format === "one-shot"){
                bd = await Liste_Bd_Oneshot.findOne({
                    where: {
                        bd_id: publication_id,
                    }
                    })
                    .then(bd =>  {
                    const commentarynumbers = bd.commentarynumbers - 1;
                    bd.update({
                        "commentarynumbers":commentarynumbers,
                    })
                    }); 
                
            }
            else if (format === "serie"){

                chapter = await Chapters_Bd_Serie.findOne({
                    where: {
                        bd_id: publication_id,
                        chapter_number:chapter_number +1,
                    }
                    })
                    .then(chapter =>  {
                    const commentarynumbers = chapter.commentarynumbers - 1;
                    chapter.update({
                        "commentarynumbers":commentarynumbers,
                    }) 
                    .then(chapter =>  {  
                        (async () => {
                            bd_serie = await Liste_Bd_Serie.findOne({
                                where: {
                                bd_id: chapter.bd_id,
                                }
                            })
                            .then(bd_serie =>  {  
                                const commentarynumbers = bd_serie.commentarynumbers - 1;
                                bd_serie.update({
                                "commentarynumbers":commentarynumbers,
                                })
                            })                   
                        })();
                        })
                    })
            }
            
            }

            else  if (category === "drawing" ) {
                if(format === "one-shot"){
                    drawing = await Drawings_one_page.findOne({
                        where: {
                            drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const commentarynumbers = drawing.commentarynumbers - 1;
                        drawing.update({
                        "commentarynumbers":commentarynumbers,
                        })
                    }); 
                }

                else if(format === "artbook"){
                    drawing = await Liste_Drawings_Artbook.findOne({
                        where: {
                        drawing_id: publication_id,
                        }
                    })
                    .then(drawing =>  {
                        const commentarynumbers = drawing.commentarynumbers - 1;
                        drawing.update({
                        "commentarynumbers":commentarynumbers,
                        })
                    }); 
                }
            }

            else  if (category === "writing" ) {
            writing = await Liste_Writings.findOne({
                where: {
                    writing_id: publication_id,
                }
            })
            .then(writing =>  {
                const commentarynumbers = writing.commentarynumbers - 1;
                writing.update({
                "commentarynumbers":commentarynumbers,
                })
            }); 
            
            }
            
            else if(category=="ad"){
                list_of_ads.findOne({
                    where: {
                        id: publication_id,
                    }
                })
                .then(ad =>  {
                    const number = ad.commentariesnumber - 1;
                    ad.update({
                    "commentariesnumber":number,
                    })
                });
            };
            console.log('suppression de commentaire ok');
            List_of_comments.findOne({
                where: {
                    id:comment_id,
                    author_id_who_comments:current_user,
                    publication_category: category,
                    format:format,
                    style:style,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                }
            }).then(comments=>{
                comments.destroy({
                    where: {
                        id:comment_id,
                        author_id_who_comments:current_user,
                        publication_category: category,
                        format:format,
                        style:style,
                        publication_id:publication_id,
                        chapter_number:chapter_number,
                            },
                    truncate: false
                });
                res.status(200).send([comments]);
            })
            
            
        })();
    });

    router.get('/get_my_commentaries/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        (async () => {   
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        comments = await List_of_comments.findAll({
            where: {
                publication_category:category,
                format: format,
                style: style,
                publication_id: publication_id,
                chapter_number: chapter_number,
                author_id_who_comments:current_user
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .then(comments =>  {
            res.status(200).send([comments])
        }); 

    })();    
    });


    router.get('/get_commentaries/:category/:format/:style/:publication_id/:chapter_number', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        (async () => {   
        const category = req.params.category;
        const format = req.params.format;
        const style = req.params.style;
        const publication_id = parseInt(req.params.publication_id);
        const chapter_number = parseInt(req.params.chapter_number);

        comments = await List_of_comments.findAll({
            where: {
                publication_category:category,
                format: format,
                style: style,
                publication_id: publication_id,
                chapter_number: chapter_number,
                author_id_who_comments:{[Op.ne]:current_user}
            },
            order: [
                ['createdAt', 'DESC']
              ],
        })
        .then(comments =>  {
            res.status(200).send([comments])
        }); 

    })();    
    });


}