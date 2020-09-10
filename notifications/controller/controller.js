const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');




module.exports = (router,
    list_of_notifications,
    list_of_notifications_spams,
    list_of_messages,
    list_of_chat_friends,
    list_of_chat_sections,
    list_of_chat_groups,
    list_of_chat_groups_reactions,
    list_of_subscribings,
    list_of_users,
    list_comics_one_shot,
    list_of_comics_serie,
    list_of_comics_chapters,
    list_of_drawings_one_page,
    list_of_drawings_artbook,
    list_of_writings,
    list_of_views,
    list_of_comments,
    list_of_comments_answers,
    list_of_comments_likes,
    list_of_comments_answers_likes,
    list_of_likes,
    list_of_loves,
    list_of_ads,
    list_of_ads_responses) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
        };

    router.get('/get_list_of_notifications', function (req, res) {
        console.log("get_list_of_notifications")
        console.log(req.cookies.currentUser)
        let current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        list_of_notifications.findAll({
            where:{
                id_receiver:current_user,
                type:{[Op.notIn]: ['message']}
            }
            ,
            order: [
                ['createdAt', 'DESC']
              ],
            limit:150,
            })
            .then(notifications=>{res.status(200).send([notifications])})     
    });

    
    router.post('/get_notifications_information', function (req, res) {
        console.log("get_notifications_information")
        let current_user = get_current_user(req.cookies.currentUser);
        const type = req.body.type;
        const publication_category = req.body.publication_category;
        const format = req.body.format;
        const id_user = req.body.id_user;
        const id_receiver = req.body.id_receiver;
        const id_user_name=req.body.id_user_name;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;
        const Op = Sequelize.Op;
        list_of_notifications.findAll({
            where:{
                type:type,
                id_user:current_user,
                publication_category:publication_category,
                format:format,
                publication_id:publication_id,
                chapter_number:chapter_number,
            }
            ,
            order: [
                ['createdAt', 'DESC']
              ]
            })
            .then(notifications=>{res.status(200).send([notifications])})     
    });


    
    router.post('/add_notification', function (req, res) {
        console.log("add_notification")
        console.log(req.cookies.currentUser)
        let current_user = get_current_user(req.cookies.currentUser);
        const type = req.body.type;
        const id_user = req.body.id_user;
        const publication_name=req.body.publication_name;
        const id_receiver = req.body.id_receiver;
        const publication_category = req.body.publication_category;
        const format = req.body.format;
        const publication_id = req.body.publication_id;
        const information = req.body.information;
        const id_user_name=req.body.id_user_name;
        const is_comment_answer = req.body.is_comment_answer;
        const chapter_number = req.body.chapter_number;
        const comment_id=req.body.comment_id;
        const Op = Sequelize.Op;
        if(id_receiver){
            list_of_notifications.create({
                "type":type,
                "id_user":current_user,
                "id_user_name":id_user_name,
                "publication_name":publication_name,
                "id_receiver":id_receiver,
                "publication_category":publication_category,
                "format":format,
                "publication_id":publication_id,
                "chapter_number":chapter_number,
                "is_comment_answer":is_comment_answer,
                "information":information,
                "comment_id":comment_id,
                "status":"unchecked"
            })
            .then(notification=>{res.status(200).send([notification])})   
                
        }
        else{
            list_of_users.findOne({
                where:{
                    id:current_user,
                }
            }).then(user=>{
                let subscribers=user.subscribers;
                let compt=0;
                for(let i=0;i<subscribers.length;i++){
                    list_of_notifications.create({
                        "type":type,
                        "id_user":current_user,
                        "publication_name":publication_name,
                        "id_user_name":user.firstname + ' ' + user.lastname,
                        "id_receiver":subscribers[i],
                        "publication_category":publication_category,
                        "format":format,
                        "publication_id":publication_id,
                        "chapter_number":chapter_number,
                        "status":"unchecked"
                    })
                    .then(notification=>{
                        compt++;
                        if(compt==subscribers.length){
                            res.status(200).send([notification])
                        }
                        
                    })   
                }
            })
        }
        


          
    });



    router.post('/remove_notification', function (req, res) {
        console.log("remove_notification")
        console.log(req.cookies.currentUser)
        let current_user = get_current_user(req.cookies.currentUser);
        const publication_category = req.body.publication_category;
        const type =req.body.type;
        const format = req.body.format;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;
        const is_comment_answer= req.body.is_comment_answer;
        const comment_id = req.body.comment_id;
        const Op = Sequelize.Op;
        list_of_notifications.destroy({
                where:{
                    type:type,
                    id_user:current_user,
                    publication_category:publication_category,
                    format:format,
                    publication_id:publication_id,
                    is_comment_answer:is_comment_answer,
                    chapter_number:chapter_number,
                    comment_id:comment_id,
                }
           
            },{truncate:false})
            .then(notifications=>{res.status(200).send([{suppression:"done"}])})     
    });

    
    

    router.post('/change_all_notifications_status_to_checked', function (req, res) {
        console.log("change_all_notifications_status_to_checked");
        let current_user = req.body.user_id;
        console.log(current_user)
        const Op = Sequelize.Op;
        list_of_notifications.findAll({
                where:{
                    id_receiver:current_user,
                }
            })
            .then(notifications=>{
                let compt=0;
                if(notifications.length>0){
                    for(let i=0;i<notifications.length;i++){
                        notifications[i].update({
                            "status":"checked"
                        }).then(not=>{
                            compt+=1;
                            if(compt==notifications.length){
                                res.status(200).send([notifications])
                            }
                        })
                    }
                }
                else{
                    res.status(200).send([notifications])
                }
                
            })     
    });


    
    router.post('/change_notification_status_to_seen', function (req, res) {
        console.log("change_notification_status_to_seen")
        console.log(req.cookies.currentUser)
        let current_user = get_current_user(req.cookies.currentUser);
        const id_user=req.body.id_user;
        const publication_category = req.body.publication_category;
        const type =req.body.type;
        const format = req.body.format;
        const publication_id = req.body.publication_id;
        const chapter_number = req.body.chapter_number;
        const Op = Sequelize.Op;
             list_of_notifications.findOne({
                 where:{
                    type:type,
                    id_user:id_user,
                    id_receiver:current_user,
                    publication_category:publication_category,
                    format:format,
                    publication_id:publication_id,
                    chapter_number:chapter_number,
                 }
             }).then(notif=>{
                notif.update({
                    "status":"seen"
                })
                res.status(200).send([notif])
             })
                
    });

   
    

}