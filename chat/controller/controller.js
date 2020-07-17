const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var glob = require("glob")
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_chat_search,list_of_chat_sections,list_of_subscribings, list_of_users) => {

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

     

     

     
     router.get('/get_first_messages/:id_1/:id_2/:id_chat_section', function (req, res) {
        const id_user= parseInt(req.params.id_1);
        const id_friend= parseInt(req.params.id_2);
        const id_chat_section= parseInt(req.params.id_chat_section);
        const Op = Sequelize.Op;
        let compt=0;
        list_of_messages.findAll({
             where: {
                id_chat_section:id_chat_section,
                //[Op.and]:[{[Op.or]:[{id_user: id_user},{id_receiver:id_user}]},{[Op.or]:[{id_user: id_friend},{id_receiver:id_friend}]}],
                [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
               
             },
             order: [
                 ['createdAt', 'DESC']
               ],
            limit:50,
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
        const id_chat_section =req.body.id_chat_section;
        const Op = Sequelize.Op;
        let compt=0;
        list_of_messages.findAll({
            where: {
                id_chat_section:id_chat_section,
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
      let id_chat_section= req.body.id_chat_section;
      let id_friend = req.body.id;
      if(id_friend==id_user){
          res.status(200).send([{value:true}])
        } 
      else{
        list_of_messages.findOne({
          where: {
            id_chat_section:id_chat_section,
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


  

  router.get('/research_chat_sections/:text/:id_friend', function (req, res) {
    let id_user = get_current_user(req.cookies.currentUser);
    let text = req.params.text;
    let id_friend =parseInt(req.params.id_friend);
    const Op = Sequelize.Op;

      list_of_chat_sections.findAll({
        where:{
          chat_section_name:{[Op.like]:'%'+ text + '%' },
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
        },
        order: [
          ['chat_section_name', 'ASC']
        ],
      }).then(sections=>{
          res.status(200).send([sections])
      })
    
    
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
    let file_name = req.headers.file_name;
    console.log(file_name);
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

    router.get('/get_picture_sent_by_msg/:file_name', function (req, res) {

      let file_name=req.params.file_name;

      let filename = "./data_and_routes/chat_images/" +file_name;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        res.status(200).send(data);
      } );
    
    });

    router.get('/get_attachment/:file_name', function (req, res) {

      let file_name=req.params.file_name;

      let filename = "./data_and_routes/chat_attachments/" +file_name;
      fs.readFile( path.join(process.cwd(),filename), function(e,data){
        res.status(200).send(data);
      } );
    
    });

    router.get('/check_if_file_exists/:attachment_name/:value', function (req, res) {

      let attachment_name=req.params.attachment_name;
      let value=parseInt(req.params.value);
      const PATH= './data_and_routes/chat_attachments';
      console.log("checking if file exists");
      console.log(process.cwd() + '/data_and_routes/chat_attachments/' + attachment_name.split('.')[0])
      glob(process.cwd() + '/data_and_routes/chat_attachments/' + attachment_name, function (er, files) {
        if(er){
          //console.log("there is no file with name "+attachment_name.split('.')[0]);
        }
        else{
          console.log(files);
          //console.log(files.length);
          if(files.length>0){
            //console.log(process.cwd() + '/data_and_routes/chat_attachments/' + attachment_name.split('.')[0] +'(' +'[0-9]*'+').'+ attachment_name.split('.')[1])
            glob(process.cwd() + '/data_and_routes/chat_attachments/' + attachment_name.split('.')[0] +'(' +'*([0-9])'+').'+ attachment_name.split('.')[1], function (er, files2) {
              if(er){
                //console.log("there is no file with name "+attachment_name.split('.')[0]);
              }
              else{
                console.log(files2);
                if(files2.length>0){
                  let num =files2.length+1;
                  console.log(num);
                  if(value==1){
                    num-=1;
                  }
                  res.status(200).send([{"value":attachment_name.split('.')[0] +`(${num}).`+ attachment_name.split('.')[1]}])
                }
                else{
                  if(value==0){
                    res.status(200).send([{"value":attachment_name.split('.')[0] +'(1).'+ attachment_name.split('.')[1]}])
                  }
                  else{
                    res.status(200).send([{"value":attachment_name.split('.')[0] +'.'+ attachment_name.split('.')[1]}])
                  }
                   
                }
              }
            })
          }
          else{
            res.status(200).send([{"value":attachment_name}])
          };
        }
      })
    
    });


    router.post('/upload_attachments_for_chat', function (req, res) {
      var attachment_name=req.headers.attachment_name;
      console.log(" we are uploading a file");
      console.log(attachment_name)
      const PATH= './data_and_routes/chat_attachments';
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH);
        },
      
        filename: (req, file, cb) => {
          cb(null, attachment_name);
          
        }
      });
      
      let upload_attachment = multer({
        storage: storage
      }).any();
      
      upload_attachment(req, res, function(err){
            res.status(200).send({ok:"ok"})
      });
      
    });



    router.get('/get_all_files/:date/:friend_id/:id_chat_section', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend = parseInt(req.params.friend_id);
      let id_chat_section = parseInt(req.params.id_chat_section);
      let date=req.params.date;
      if(date=="now"){
        date= new Date();
      }
      const Op = Sequelize.Op;
      list_of_messages.findAll({
           where: {
              createdAt: {[Op.lt]: date},
              id_chat_section:id_chat_section,
              is_an_attachment:true,
              attachment_type:"file_attachment",
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
             
           },
           order: [
               ['createdAt', 'DESC']
             ],
          limit:15,
         })
         .then(files =>  {
             res.status(200).send([files])
         }); 
   });

   router.get('/get_all_pictures/:date/:friend_id/:id_chat_section', function (req, res) {
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend = parseInt(req.params.friend_id);
    let id_chat_section = parseInt(req.params.id_chat_section);
    let date=req.params.date;
      if(date=="now"){
        date= new Date();
      }
    const Op = Sequelize.Op;
    list_of_messages.findAll({
         where: {
            createdAt: {[Op.lt]: date},
            id_chat_section:id_chat_section,
            is_an_attachment:true,
            attachment_type:"picture_attachment",
            [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
           
         },
         order: [
             ['createdAt', 'DESC']
           ],
        limit:15,
       })
       .then(files =>  {
           res.status(200).send([files])
       }); 
 });


 router.post('/delete_message/:id', function (req, res) {
  let id=parseInt(req.params.id);
  list_of_messages.findOne({
    where:
    {id:id}
  }).then(message=>{
    message.update({
      "status": "deleted"
    }).then(message=>{
      if(message.is_an_attachment){
        if(message.attachment_type=="picture_message"){
          fs.access('./data_and_routes/chat_images/' + message.attachment_name, fs.F_OK, (err) => {
            if(err){
              console.log('suppression already done');
              return res.status(200)
            }
            fs.unlink('./data_and_routes/chat_images/' + message.attachment_name,  function (err) {
              if (err) {
                console.log(err);
              }  
              else {
                console.log( 'fichier supprimé');
                return res.status(200).send();
              }
            });
          });
        }
        else{
          fs.access('./data_and_routes/chat_attachments/' + message.attachment_name, fs.F_OK, (err) => {
            if(err){
              console.log('suppression already done');
              return res.status(200)
            }
            fs.unlink('./data_and_routes/chat_attachments/' + message.attachment_name,  function (err) {
              if (err) {
                console.log(err);
              }  
              else {
                console.log( 'fichier supprimé');
                return res.status(200).send();
              }
            });
          });
        }
      }
      else{
        res.status(200)
      }
    })
    
  })
});


router.post('/add_emoji_reaction', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser).toString();
  let type_of_user=req.body.type_of_user;
  let id = req.body.id;
  let emoji = req.body.emoji;
  list_of_messages.findOne({
       where: {
          id:id
       },
     })
     .then(message =>  {
       
       if(type_of_user=="user"){
          message.update({
            'emoji_reaction_user': emoji,
          })
       }
       if(type_of_user=="receiver"){
          message.update({
            'emoji_reaction_receiver': emoji,
          })
       }
        res.status(200).send(message);
         
     }); 
});

router.post('/delete_emoji_reaction', function (req, res) {
  let current_user = get_current_user(req.cookies.currentUser);
  let id = req.body.id;
  let type_of_user=req.body.type_of_user;
  list_of_messages.findOne({
       where: {
          id:id
       },
     })
     .then(message =>  {
      if(type_of_user=="user"){
        message.update({
          'emoji_reaction_user': null,
        })
     }
     if(type_of_user=="receiver"){
        message.update({
          'emoji_reaction_receiver': null,
        })
     }
      res.status(200).send(message);
        
       
     }); 
});


router.get('/get_other_messages/:id_friend/:id_last_message/:id_chat_section', function (req, res) {
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= parseInt(req.params.id_friend);
  const id_chat_section= parseInt(req.params.id_chat_section);
  const id_last_message= parseInt(req.params.id_last_message);
  const Op = Sequelize.Op;
  let compt=0;
  list_of_messages.findAll({
       where: {
          id_chat_section:id_chat_section,
          id: {[Op.lt]: id_last_message},
          //[Op.and]:[{[Op.or]:[{id_user: id_user},{id_receiver:id_user}]},{[Op.or]:[{id_user: id_friend},{id_receiver:id_friend}]}],
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
         
       },
       order: [
           ['createdAt', 'DESC']
         ],
      limit:50,
     })
     .then(messages =>  {
         res.status(200).send([messages])
      });
});

router.get('/get_other_messages_more/:id_friend/:id_last_message/:id_chat_section', function (req, res) {
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= parseInt(req.params.id_friend);
  const id_chat_section= parseInt(req.params.id_chat_section);
  const id_last_message= parseInt(req.params.id_last_message);
  const Op = Sequelize.Op;
  let compt=0;
  list_of_messages.findAll({
       where: {
          id_chat_section:id_chat_section,
          id: {[Op.lt]: id_last_message},
          //[Op.and]:[{[Op.or]:[{id_user: id_user},{id_receiver:id_user}]},{[Op.or]:[{id_user: id_friend},{id_receiver:id_friend}]}],
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
         
       },
       order: [
           ['createdAt', 'DESC']
         ],
      limit:15,
     })
     .then(messages =>  {
         res.status(200).send([messages])
      });
});



router.get('/get_less_messages/:id_friend/:id_first_message/:id_last_message/:id_chat_section', function (req, res) {
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= parseInt(req.params.id_friend);
  const id_first_message= parseInt(req.params.id_first_message);
  const id_chat_section= parseInt(req.params.id_chat_section);
  const id_last_message= parseInt(req.params.id_last_message);
  const Op = Sequelize.Op;
  var id_born_sup=0;
  list_of_messages.findAll({
    where:{
        id_chat_section:id_chat_section,
        id:{[Op.gte]: id_first_message},
    },
    order: [
      ['createdAt', 'ASC']
    ],
    limit:15,
  }).then(msg=>{
    id_born_sup=msg[msg.length-1].id;
    list_of_messages.findAll({
      where: {
         id_chat_section:id_chat_section,
         id:{[Op.and]:[{[Op.gte]: id_last_message},{[Op.lte]: id_born_sup}]},
         [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
        
      },
      order: [
          ['createdAt', 'DESC']
        ],
    })
    .then(messages =>  {
      console.log(msg[msg.length-1].id);
      console.log(id_first_message);
      if(msg[msg.length-1].id!=id_first_message){
        res.status(200).send([messages])
      }
      else{
        res.status(200).send([null])
      }
        
     });
  })

  
});



        

router.get('/get_messages_from_research/:message/:id_chat_section/:id_friend', function (req, res) {
  let id_user = get_current_user(req.cookies.currentUser);
  let id_friend= parseInt(req.params.id_friend);
  let id_chat_section= parseInt(req.params.id_chat_section);
  let message = req.params.message;
  const Op = Sequelize.Op;
  list_of_messages.findAll({
      where:{
          id_chat_section:id_chat_section,
          message:{[Op.like]:'%'+ message + '%' },
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
      },
      order: [
        ['createdAt', 'DESC']
      ],
    }).then(messages=>{
      res.status(200).send([messages])
    })
  });

  
  router.get('/get_messages_around/:id_message/:id_chat_section/:id_friend', function (req, res) {
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend= parseInt(req.params.id_friend);
    let id_chat_section= parseInt(req.params.id_chat_section);
    let id = parseInt(req.params.id_message);
    var id_born_sup=0;
    
    const Op = Sequelize.Op;
    var list_of_messages_to_send=[];
    list_of_messages.findAll({
      where:{
          id_chat_section:id_chat_section,
          id:{[Op.gt]: id},
      },
      order: [
        ['createdAt', 'ASC']
      ],
      limit:5,
    }).then(mess=>{
       id_born_sup=mess[mess.length-1].id;
       console.log("id");
       console.log(id);
       console.log("id_born_sup");
       console.log(id_born_sup);
       list_of_messages.findAll({
        where:{
            id_chat_section:id_chat_section,
            id:{[Op.and]:[{[Op.gt]: id},{[Op.lte]: id_born_sup}]},
            [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
        },
        order: [
          ['createdAt', 'DESC']
        ],
        limit:5,
      }).then(messages=>{
        list_of_messages_to_send=messages;
        list_of_messages.findAll({
          where:{
              id_chat_section:id_chat_section,
              id:{[Op.lte]: id},
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
          order: [
            ['createdAt', 'DESC']
          ],
          limit:6,
        }).then(msg=>{
          list_of_messages_to_send=list_of_messages_to_send.concat(msg);
          res.status(200).json([{ "list_of_messages_to_send":list_of_messages_to_send}])
        })  
        
      })
    })
    
    });

    

    router.get('/get_chat_sections/:id_friend', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= parseInt(req.params.id_friend);
      const Op = Sequelize.Op;
      list_of_chat_sections.findAll({
          where:{
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
          order: [
            ['chat_section_name', 'ASC']
          ],
        }).then(section=>{
          res.status(200).send([section])
        })
      });

    router.post('/add_chat_section', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= req.body.id_friend;
      let chat_section= req.body.chat_section;
      const Op = Sequelize.Op;
      let list_of_id=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
      list_of_chat_sections.findAll({
          where:{
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
        }).then(sections=>{
          if(sections.length>0){
            if(sections.length>14){
              res.status(200).json([{ "is_ok":false,"cause":"number"}])
            }
            else{
              for(let i=0;i<sections.length;i++){
                if(list_of_id.includes(sections[i].id_chat_section)){
                  let index=list_of_id.indexOf(sections[i].id_chat_section);
                  list_of_id.splice(index,1);
                }

                if(sections[i].chat_section_name==chat_section){
                  res.status(200).json([{ "is_ok":false,"cause":"already"}])
                }
                else if(i==sections.length-1){
                  console.log(list_of_id)
                  list_of_chat_sections.create({
                    "id_chat_section":list_of_id[0],
                    "id_user": id_user,
                    "id_receiver": id_friend,
                    "chat_section_name":chat_section,
                  }).then(cr=>{
                    res.status(200).json([{ "is_ok":true,"id_chat_section":list_of_id[0]}])
                  })
                }
              }
            }
          }
          else{
            list_of_chat_sections.create({
              "id_chat_section":2,
              "id_user": id_user,
              "id_receiver": id_friend,
              "chat_section_name":chat_section,
            }).then(cr=>{
              res.status(200).json([{ "is_ok":true,"id_chat_section":2}])
            })
          }
        })
    });

      
    router.delete('/delete_chat_section/:id_chat_section/:id_friend', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_chat_section = parseInt(req.params.id_chat_section);
      let id_friend=parseInt(req.params.id_friend);
      const Op = Sequelize.Op;
      list_of_chat_sections.findOne({
            where: {
              id_chat_section:id_chat_section,
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
            },
          })
          .then(chat_section =>  {
            if(chat_section.id_user==id_user){
              chat_section.destroy({
                truncate: false
              })
              list_of_messages.findAll({
                where:{
                  id_chat_section:id_chat_section,
                  [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
                },
              }).then(messages=>{
                if(messages.length>0){
                  for(let i=0;i<messages.length;i++){
                    messages[i].destroy({
                      truncate: false
                    }).then(des=>{
                      if(i==messages.length-1){
                        res.status(200).send([{ "is_ok":true}])  
                      }
                    })
                    
                  }
                }
                else{
                  res.status(200).send([{ "is_ok":true}])  
                }
                
              })
              
            }
            else{
              res.status(200).send([{ "is_ok":false}]); 
            }
          }); 
    });

    

    router.get('/get_notifications_section/:id_chat_section/:id_friend', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= parseInt(req.params.id_friend);
      let id_chat_section= parseInt(req.params.id_chat_section);
      const Op = Sequelize.Op;
      list_of_messages.findAll({
          where:{
              status:'received',
              id_chat_section:id_chat_section,
              [Op.and]:[ {id_user:id_friend},{id_receiver:id_user}],         
          },
        }).then(messages=>{
          if(messages.length>0){
            res.status(200).send([{ "value":true}]); 
          }
          else{
            res.status(200).send([{ "value":false}]); 
          }
        })
      });

}