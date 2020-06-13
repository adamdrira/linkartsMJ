const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_subscribings) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    
    router.get('/get_list_of_users_I_talk_to', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        list_of_chat_friends.findAll({
             where: {
                [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
               
             },
             order: [
                 ['date', 'DESC']
               ],
           })
           .then(friends =>  {
               res.status(200).send([friends])
           }); 
     });

     router.get('/get_list_of_spams', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        list_of_chat_spams.findAll({
             where: {
                [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
             },
             order: [
                 ['date', 'DESC']
               ],
           })
           .then(friends =>  {
               res.status(200).send([friends])
           }); 
     });

     

     

     
     router.get('/get_first_messages/:id_1/:id_2', function (req, res) {
        const id_user= parseInt(req.params.id_1);
        const id_friend= parseInt(req.params.id_2);
        const Op = Sequelize.Op;
        let compt=0;
        list_of_messages.findAll({
             where: {
                //[Op.and]:[{[Op.or]:[{id_user: id_user},{id_receiver:id_user}]},{[Op.or]:[{id_user: id_friend},{id_receiver:id_friend}]}],
                [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
               
             },
             order: [
                 ['createdAt', 'DESC']
               ],
            limit:30,
           })
           .then(messages =>  {
               res.status(200).send([messages])
            });
     });

     

     router.post('/get_last_friends_message', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const list_of_friends_ids= req.body.data;
        const Op = Sequelize.Op;
        let compt=0;
        var list_of_friends_messages=[];
        for(let i=0;i<list_of_friends_ids.length;i++){
            list_of_messages.findAll({
                where: {
                   // bon [Op.and]:[ {[Op.or]:[{id_user:list_of_friends_ids[i]},{id_receiver:list_of_friends_ids[i]}]},{[Op.or]:[{id_user: current_user},{id_receiver:current_user}]}],      
                    [Op.and]:[ {[Op.or]:[(list_of_friends_ids[i]!=current_user) ? {id_user:list_of_friends_ids[i]}:{id_user:current_user},(list_of_friends_ids[i]!=current_user) ? {id_receiver:list_of_friends_ids[i]}:{id_user:current_user} ]},{[Op.or]:[(list_of_friends_ids[i]!=current_user) ? {id_user:current_user}:{id_receiver:current_user},(list_of_friends_ids[i]!=current_user) ? {id_receiver:current_user}:{id_receiver:current_user}]}],      
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
               limit:1,
              })
              .then(messages =>  {
                 list_of_friends_messages[i]=messages[0];
                  compt++;
                  if(compt==list_of_friends_ids.length){
                    res.status(200).send([{list_of_friends_messages:list_of_friends_messages}])
                  }
                  
               });
            
        }
        
     });


    
    router.post('/let_all_friend_messages_to_seen', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        const id_user =parseInt(req.body.id_user);
        const Op = Sequelize.Op;
        let compt=0;
        list_of_messages.findAll({
            where: {
               id_user: id_user,
               id_receiver:current_user,
               status: {[Op.ne]:"seen"},
            },
            order: [
                ['createdAt', 'DESC']
              ],
          })
          .then(messages =>  {
              if(messages.length>0){
                for(let i=0;i<messages.length;i++){
                    messages[i].update({
                        "status":"seen",
                    });
                    compt++;
                    if(compt==messages.length){
                        res.status(200).send([messages])
                    }
               }
              }
              else{
                res.status(200).send([{message:null}])
              }
               
           });
    });


    
    router.get('/get_my_real_friend', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        list_of_messages.findAll({
            where: {
                id_user:current_user
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit:1,
            })
            .then(message =>  {
                if(message.length>0){
                    res.status(200).send([message])
                }
                else{
                    // ajouter message du site pour expliquer fonctionnement messagerie
                }
            });
     });

     

     router.post('/check_if_is_related', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let id_friend = req.body.id;
        const Op = Sequelize.Op;
        if(id_friend==id_user){
            res.status(200).send([{value:true}])
          } 
          else{
            list_of_chat_friends.findOne({
              where: {
                [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
              }
            }).then( friend=>{
              console.log("here")
              if(friend){
                console.log("true");
                res.status(200).send([{value:true}])
              }
              else{
                console.log("false");
                list_of_subscribings.findOne({
                  where:{
                    [Op.and]:[{[Op.or]:[{id_user: id_user},{id_user_subscribed_to:id_user}]},{[Op.or]:[{id_user: id_friend},{id_user_subscribed_to:id_friend}]}],
                  }
                }).then(sub=>{
                  if(sub){
                    res.status(200).send([{value:true}])
                  }
                  else{
                    res.status(200).send([{value:false}])
                  } 
                })
              }
            });
          }
      
     });

     

}