const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_chat_search,list_of_subscribings, list_of_users) => {

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


    
    router.post('/get_my_real_friend', function (req, res) {
        let current_user = get_current_user(req.cookies.currentUser);
        let data = req.body.data
        list_of_messages.findAll({
            where: {
                id_user:current_user,
                id_receiver:data
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
            if(friend){
              res.status(200).send([{value:true}])
            }
            else{
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

     

     router.post('/check_if_response_exist', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend = req.body.id;
      if(id_friend==id_user){
          res.status(200).send([{value:true}])
        } 
      else{
        list_of_messages.findOne({
          where: {
            id_user:id_friend,
            id_receiver:id_user
          }
        }).then( message=>{
          if(message){
            res.status(200).send([{value:true}])
          }
          else{
            res.status(200).send([{value:false}])
          }
        });
      }
    
   });

     

     router.get('/get_first_searching_propositions', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      const Op = Sequelize.Op;
      var list_of_users_to_send=[];
      /*attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('id_receiver')), 'users'],'id_user','id_receiver'
      ],*/

      function get_friend(results){
        let num=15-results.length;
                  list_of_chat_friends.findAll({
                    where: {
                       [Op.or]:[{id_user: id_user},{id_receiver:id_user}],
                      
                    },
                    order: [
                        ['date', 'DESC']
                      ],
                    limit:num,
                  })
                  .then(friends =>  {
                    for(let j=0;j<friends.length;j++){
                      if(friends[j].id_user==id_user){
                        list_of_users.findOne({
                          where:{
                            id:friends[j].id_receiver
                          }
                        }).then(l=>{
                          list_of_users_to_send[results.length+j]=l;
                          if(j==friends.length-1){
                            res.status(200).send([{list:list_of_users_to_send}]);
                          }
                        })
                      }
                      else{
                        list_of_users.findOne({
                          where:{
                            id:friends[j].id_user
                          }
                        }).then(l=>{
                          list_of_users_to_send[results.length+j]=l;
                          if(j==friends.length-1){
                            res.status(200).send([{list:list_of_users_to_send}]);
                          }
                        })
                      }
                      
                    }
                      
                  }); 
      }

        list_of_chat_search.findAll({
          where:{
            id_user:id_user
          },
          order: [
            ['createdAt', 'DESC']
          ],
          limit:30,
        }).then(results=>{
            if(results.length>0){
              for(let i=0;i<results.length;i++){
                list_of_users.findOne({
                  where:{
                    id:results[i].id_receiver
                  }
                }).then(r=>{
                  list_of_users_to_send[i]=r;
                  if(i==results.length-1){
                    if(results.length==15){
                      res.status(200).send([{list:list_of_users_to_send}])
                    }
                    else{
                      get_friend(results);
                    }
                  }
                })
              }
            }
            else{
              get_friend(results);
            }
        })
   });


   
   router.get('/get_searching_propositions/:text', function (req, res) {
    let id_user = get_current_user(req.cookies.currentUser);
    let text = req.params.text;
    const Op = Sequelize.Op;
    var list_of_related_users=[];
    var list_of_history=[];
    var list_of_other_users=[];

    list_of_chat_search.findAll({
      where:{
        id_user:id_user
      },
      limit:15,
    }).then(searchs=>{
      if(searchs.length>0){
        for(let i=0;i<searchs.length;i++){
          list_of_users.findOne({
            where:{
              id:searchs[i].id_receiver
            }
          }).then(history=>{
            list_of_history[i]=history;
            if(i==searchs.length-1){
              get_related_users();
            }
          })
        }
      }
      else{
        get_related_users();
      }
      
    })

    function get_related_users(){
      list_of_users.findAll({
        where:{
          [Op.and]:[
            {[Op.or]:[{firstname:{[Op.like]:'%'+ text + '%' }},{lastname:{[Op.like]:'%'+ text + '%' }}]},
            {[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}
            
          ]
        },
        limit:15,
        order: [
          ['subscribers_number', 'DESC']
        ],
      }).then(users=>{
          list_of_related_users= users;
          get_other_users();
      })
    }

    function get_other_users(){
      list_of_users.findAll({
        where:{
          [Op.and]:[
            {[Op.or]:[{firstname:{[Op.like]:'%'+ text + '%' }},{lastname:{[Op.like]:'%'+ text + '%' }}]},
            {[Op.not]:{[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}},
            //{id:{[Op.ne]:id_user}},
            
          ]
        },
        limit:15,
        order: [
          ['subscribers_number', 'DESC']
        ],
      }).then(users=>{
          list_of_other_users= users;
          res.status(200).send([{history:list_of_history,related_users:list_of_related_users,other_users:list_of_other_users}])
      })
    }
    
    
  });

  
  router.post('/add_spam_to_contacts', function (req, res) {
    let id_user = get_current_user(req.cookies.currentUser);
    let id_spam= req.body.id;
    const Op = Sequelize.Op;

    list_of_chat_spams.findOne({
      where: {
        id_user:id_spam,
        id_receiver:id_user,     
      }
      }).then( spam=>{
        spam.destroy({
          truncate: false
        });
        var now = new Date();
        list_of_chat_friends.create({
          "id_user":id_user,
          "id_receiver":id_spam,
          "date":now,
        }).then(
          friend=>{
            res.status(200).send([friend]);
          }
        )
      })
  });

  router.post('/chat_sending_images', function (req, res) {
    let terminaison = req.headers.terminaison;
    let file_name = req.headers.file_name;
    console.log(file_name);
    let current_user = get_current_user(req.cookies.currentUser);
    const PATH2= './data_and_routes/chat_images';
    let storage2 = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, PATH2);
      },
    
      filename: (req, file, cb) => {
        cb(null, file_name);
        //enlever nickname
      }
    });
    
    let upload_cover = multer({
      storage: storage2
    }).any();

    upload_cover(req, res, function(err){
      res.status(200).send(([{ "file_name": file_name}]))
      });
    });


     

}