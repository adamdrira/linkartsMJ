const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var glob = require("glob")
var path = require('path');
const jwt = require('jsonwebtoken');
const mkdirp = require('mkdirp')
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const sharp = require('sharp');
module.exports = (router, list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_chat_search,list_of_chat_sections,list_of_subscribings, list_of_users,list_of_chat_groups,list_of_chat_groups_reactions,list_of_chat_folders) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    
    router.get('/get_list_of_users_I_talk_to', function (req, res) {

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
        list_of_chat_friends.findAll({
             where: {
                [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
                is_a_group_chat:{[Op.not]: true},
             },
             order: [
                 ['date', 'DESC']
               ],
           })
           .catch(err => {
              res.status(500).json({msg: "error", details: err});		
            }).then(friends =>  {
               res.status(200).send([{friends:friends,current_user:current_user}])
           }); 
     });

     router.get('/get_list_of_users_I_talk_to_navbar', function (req, res) {

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
        list_of_chat_friends.findAll({
             where: {
                [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
                is_a_group_chat:{[Op.not]: true},
             },
             order: [
                 ['date', 'DESC']
               ],
             limit:10,
           })
           .catch(err => {
              res.status(500).json({msg: "error", details: err});		
            }).then(friends =>  {
               res.status(200).send([{friends:friends,current_user:current_user}])
           }); 
     });

     router.get('/get_number_of_unseen_messages',function(req,res){
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
      let list_of_users=[];
      let list_of_groups=[];
      let number_of_unseen_messages=0;
      list_of_chat_friends.findAll({
           where: {
              [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
              is_a_group_chat:{[Op.not]: true},
           },
           order: [
               ['date', 'DESC']
             ],
         })
         .catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(friends =>  {
              if(friends.length>0){
                for(let j=0;j<friends.length;j++){
                  if(friends[j].id_user==current_user && friends[j].id_receiver!=current_user){
                    list_of_users.push(friends[j].id_receiver)
                  }
                  else if(friends[j].id_user!=current_user && friends[j].id_receiver==current_user){
                    list_of_users.push(friends[j].id_user)
                  }
                }
                list_of_chat_groups.findAll({
                  where: {
                    list_of_receivers_ids: { [Op.contains]: [current_user] },
                  },
                  order: [
                      ['createdAt', 'DESC']
                    ],
                }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(groups=>{
                  if(groups.length>0){
                    for(let j=0;j<groups.length;j++){
                      list_of_groups.push(groups[j].id)
                    }
                  }
                  let compt1=0;
                  if(list_of_users.length>0){
                    for(let i=0;i<list_of_users.length;i++){
                      list_of_messages.findOne({
                        where:{
                          id_user:list_of_users[i],
                          id_receiver:current_user,
                          status:"received",
                          is_a_group_chat:false,
                        }
                        
                      }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
                        if(r){
                          number_of_unseen_messages+=1;
                        }
                        compt1+=1;
                        if(compt1==list_of_users.length){
                          let compt2=0;
                          if(list_of_groups.length>0){
                            for(let k=0;k<list_of_groups.length;k++){
                              list_of_messages.findAll({
                                where:{
                                  id_user:{[Op.ne]:current_user},
                                  id_receiver:list_of_groups[k],
                                  
                                  is_a_group_chat:true,
                                },
                                where:Sequelize.where(Sequelize.fn('array_length', Sequelize.col('list_of_users_who_saw'), 1), 1),
                                limit:1,
                                order: [
                                  ['createdAt', 'DESC']
                                ],
                                
                              }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
                                  if(r.length>0){
                                    number_of_unseen_messages+=1;
                                  }
                                  compt2+=1;
                                  if(compt2==list_of_groups.length){
                                    res.status(200).send([{number_of_unseen_messages:number_of_unseen_messages}])
                                  }
                                })
                            }
                          }
                          else{
                            res.status(200).send([{number_of_unseen_messages:number_of_unseen_messages}])
                          }
                          
                          
                        }
                      })
                    }
                  }
                  else{
                    res.status(200).send([{number_of_unseen_messages:0}])
                  }
                  
                })
              }
              else{
                res.status(200).send([{number_of_unseen_messages:0}])
              }
             
              
         }); 
     })

     router.get('/get_number_of_unseen_messages_spams',function(req,res){
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
      let list_of_users=[];
      let number_of_unseen_messages=0;
      list_of_chat_spams.findAll({
           where: {
              [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
           },
           order: [
               ['date', 'DESC']
             ],
         })
         .catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(friends =>  {
              if(friends.length>0){
                for(let j=0;j<friends.length;j++){
                  if(friends[j].id_user==current_user && friends[j].id_receiver!=current_user){
                    list_of_users.push(friends[j].id_receiver)
                  }
                  else if(friends[j].id_user!=current_user && friends[j].id_receiver==current_user){
                    list_of_users.push(friends[j].id_user)
                  }
                }
                let compt1=0;
                for(let i=0;i<list_of_users.length;i++){
                  list_of_messages.findAll({
                    where:{
                      id_user:list_of_users[i],
                      id_receiver:current_user,
                      status:"received",
                      is_a_group_chat:false,
                    },
                    limit:1,
                    order: [
                      ['createdAt', 'DESC']
                    ],
                    
                  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
                    if(r.length>0){
                      number_of_unseen_messages+=1;
                    }
                    compt1+=1;
                    if(compt1==list_of_users.length){
                      res.status(200).send([{number_of_unseen_messages:number_of_unseen_messages}])
                    }
                  })
                }
              }
              else{
                res.status(200).send([{number_of_unseen_messages:0}])
              }
              

                
              
         }); 
     })

     router.get('/get_list_of_spams', function (req, res) {

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
        list_of_chat_spams.findAll({
             where: {
                [Op.or]:[{id_user: current_user},{id_receiver:current_user}],
             },
             order: [
                 ['date', 'DESC']
               ],
           })
           .catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(friends =>  {
               res.status(200).send([friends])
           }); 
     });

     

     

     
     router.get('/get_first_messages/:id_1/:id_2/:id_chat_section/:is_a_group_chat', function (req, res) {

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
        const id_user= parseInt(req.params.id_1);
        const id_friend= parseInt(req.params.id_2);
        const id_chat_section= parseInt(req.params.id_chat_section);
        const is_a_group_chat =(req.params.is_a_group_chat=='true')?true:false;
        const Op = Sequelize.Op;
        let compt=0;
        if(is_a_group_chat){
          list_of_messages.findAll({
            where: {
               id_chat_section:id_chat_section,
               is_a_group_chat:true,
               id_receiver:id_friend,
              
            },
            order: [
                ['createdAt', 'DESC']
              ],
           limit:50,
          })
          .catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(messages =>  {
              let list_of_messages_reactions={};
              if(messages.length>0){
               
                list_of_chat_groups_reactions.findAll({
                  where:{
                    id_group_chat:id_friend,
                    id_message:{[Op.gte]: messages[messages.length-1].id},
                  }
                }).catch(err => {
                    
                    res.status(500).json({msg: "error", details: err});		
                  }).then(reacts=>{
                  for(let i=0;i<reacts.length;i++){
                    if(list_of_messages_reactions[reacts[i].id_message]){
                      list_of_messages_reactions[reacts[i].id_message].push(reacts[i].emoji_reaction)
                    }
                    else{
                      list_of_messages_reactions[reacts[i].id_message]=[reacts[i].emoji_reaction];
                    }
                  }
                  res.status(200).send([messages,{list_of_messages_reactions:list_of_messages_reactions}])
                })
              }
              else{
                res.status(200).send([messages,{list_of_messages_reactions:list_of_messages_reactions}])
              }
           });
        }
        else{
          list_of_messages.findAll({
            where: {
               id_chat_section:id_chat_section,
               is_a_group_chat:{[Op.not]: true},
               [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
              
            },
            order: [
                ['createdAt', 'DESC']
              ],
           limit:50,
          })
          .catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(messages =>  {
              res.status(200).send([messages])
           });
        }
        
     });

     

     router.post('/get_last_friends_message', function (req, res) {

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
        const list_of_friends_ids= req.body.data;
        const Op = Sequelize.Op;
        let compt=0;
        var list_of_friends_messages=[];
        for(let i=0;i<list_of_friends_ids.length;i++){
            list_of_messages.findAll({
                where: {
                   is_a_group_chat:{[Op.not]: true},
                   [Op.and]:[ {[Op.or]:[(list_of_friends_ids[i]!=current_user) ? {id_user:list_of_friends_ids[i]}:{id_user:current_user},(list_of_friends_ids[i]!=current_user) ? {id_receiver:list_of_friends_ids[i]}:{id_user:current_user} ]},{[Op.or]:[(list_of_friends_ids[i]!=current_user) ? {id_user:current_user}:{id_receiver:current_user},(list_of_friends_ids[i]!=current_user) ? {id_receiver:current_user}:{id_receiver:current_user}]}],      
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
               limit:1,
              })
              .catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
              }).then(messages =>  {
                 list_of_friends_messages[i]=messages[0];
                  compt++;
                  if(compt==list_of_friends_ids.length){
                    res.status(200).send([{list_of_friends_messages:list_of_friends_messages}])
                  }
                  
               });
            
        }
        
     });


    
    router.post('/let_all_friend_messages_to_seen', function (req, res) {

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
        const id_friend=req.body.id_user;
        const id_chat_section =req.body.id_chat_section;
        const is_a_group_chat =req.body.is_a_group_chat;
        const Op = Sequelize.Op;
        let compt=0;
        if(is_a_group_chat){
          list_of_messages.findAll({
            where: {
              id_chat_section:id_chat_section,
                id_receiver: id_friend,
                is_a_group_chat:true,
                id_user:{[Op.ne]:current_user},
                status: {[Op.notIn]:["seen","deleted"]},
            },
            order: [
                ['createdAt', 'DESC']
              ],
          })
          .catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
              }).then(messages =>  {
              if(messages.length>0){
                for(let i=0;i<messages.length;i++){
                    if(messages[i].list_of_users_who_saw.indexOf(current_user)<0){
                      let list=messages[i].list_of_users_who_saw;
                      list.push(current_user)
                      if(list.length<messages[i].list_of_users_in_the_group.length){
                        list_of_messages.update({
                          "list_of_users_who_saw":list,
                        },{
                          where:{
                            id: messages[i].id
                          }
                        });
                      }
                      else{
                        messages[i].update({
                          "list_of_users_who_saw":list,
                          "status":"seen",
                        });
                      }
                    }
                    compt++;
                    if(compt==messages.length){
                        res.status(200).send([messages])
                    }
                }
              }
              else{
                res.status(200).send([{message:"nothing"}])
              }
                
            });
          
        }
        else{
          
          list_of_messages.findAll({
            where: {
                id_chat_section:id_chat_section,
               id_user: id_friend,
               is_a_group_chat:{[Op.not]: true},
               id_receiver:current_user,
               status: {[Op.notIn]:["seen","deleted"]},
            },
            order: [
                ['createdAt', 'DESC']
              ],
          })
          .catch(err => {
            
            res.status(500).json({msg: "error", details: err});		
          }).then(messages =>  {
              if(messages.length>0){

                list_of_messages.update({
                  "status":"seen",
                },
                {where:{
                  id_chat_section:id_chat_section,
                  id_user: id_friend,
                  is_a_group_chat:{[Op.not]: true},
                  id_receiver:current_user,
                  status:{[Op.ne]:"deleted"},
                }});

                res.status(200).send([messages])
                /*for(let i=0;i<messages.length;i++){
                    messages[i].update({
                        "status":"seen",
                    },
                    {where:{
                      "status":{[Op.ne]:"deleted"},
                    }});
                    compt++;
                    if(compt==messages.length){
                        res.status(200).send([messages])
                    }
               }*/
              }
              else{
                res.status(200).send([{message:"nothing"}])
              }
               
           });
        }
        
    });


    
    router.post('/get_my_real_friend', function (req, res) {

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
        let data = req.body.data;
        const Op = Sequelize.Op;
        list_of_messages.findAll({
            where: {
                id_user:current_user,
                id_receiver:data,
                is_a_group_chat:{[Op.not]: true},
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit:1,
            })
            .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message =>  {
                if(message.length>0){
                    res.status(200).send([message])
                }
                else{
                  res.status(200).send([{message:null}])
                }
            });
     });

     

     router.post('/check_if_is_related', function (req, res) {
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
        let id_user = get_current_user(req.cookies.currentUser);
        let id_friend = req.body.id;
        const Op = Sequelize.Op;
        
        
        if(id_friend==id_user){
            res.status(200).send([{value:true}])
          } 
        else{
          list_of_chat_friends.findOne({
            where: {
              is_a_group_chat:{[Op.not]: true},
              [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],      
            }
          }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then( friend=>{
            if(friend){
              res.status(200).send([{value:true}])
            }
            else{
              list_of_subscribings.findOne({
                where:{
                  [Op.and]:[{[Op.or]:[{id_user: id_user},{id_user_subscribed_to:id_user}]},{[Op.or]:[{id_user: id_friend},{id_user_subscribed_to:id_friend}]}],
                }
              }).catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_chat_section= req.body.id_chat_section;
      let id_friend = req.body.id;
      const is_a_group_chat =req.body.is_a_group_chat;
      const Op = Sequelize.Op;
      if(id_friend==id_user && !is_a_group_chat){
          res.status(200).send([{value:true}])
        } 
      else if(!is_a_group_chat && id_friend!=id_user){
        list_of_messages.findOne({
          where: {
            id_chat_section:id_chat_section,
            id_user:id_friend,
            id_receiver:id_user,
            is_a_group_chat:{[Op.not]: true},
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then( message=>{
          if(message){
            res.status(200).send([{value:true}])
          }
          else{
            res.status(200).send([{value:false}])
          }
        });
      }
      else if(is_a_group_chat ){
        list_of_messages.findOne({
          where: {
            id_chat_section:id_chat_section,
            id_receiver:id_friend,
            is_a_group_chat:true,
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
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

     
   
   router.post('/add_to_chat_searchbar_history', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    const id_receiver=req.body.id_receiver;
    const friend_type=(req.body.friend_type=='group')?true:false;
    list_of_chat_search.findOne({
      where: {
          id_user:id_user,
          id_receiver:id_receiver,
          is_a_group_chat:friend_type,
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
      var date= new Date();
      if(result){
        result.update({
          "date":date,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
          res.status(200).send([r]);
        })
      }
      else{
        list_of_chat_search.create({
          "id_user":id_user,
          "id_receiver":id_receiver,
          "is_a_group_chat":friend_type,
          "date":date,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
          res.status(200).send([r]);
        })
      }
    })

   })

     router.get('/get_first_searching_propositions', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      const Op = Sequelize.Op;
      var list_of_users_to_send=[];
      /*attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('id_receiver')), 'users'],'id_user','id_receiver'
      ],*/
      list_of_chat_friends.findAll({
        where: {
            [Op.or]:[{id_user: id_user},{id_receiver:id_user}],
            is_a_group_chat:{[Op.not]: true},
        },
        order: [
            ['date', 'DESC']
          ],
        limit:10,
      }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(friends =>  {
       
        if(friends.length>0){
          let compt=0;
          let end=friends.length;
          for(let j=0;j<friends.length;j++){
            if(friends[j].id_user==id_user && friends[j].id_receiver!=id_user){
              list_of_users.findOne({
                where:{
                  id:friends[j].id_receiver
                }
              }).catch(err => {
			
                res.status(500).json({msg: "error", details: err});		
              }).then(l=>{
                list_of_users_to_send[j]=l;
                compt++;
                if(compt==end){
                  delete_null_and_send(list_of_users_to_send)
                }
              })
            }
            else if(friends[j].id_user!=id_user && friends[j].id_receiver==id_user){
              list_of_users.findOne({
                where:{
                  id:friends[j].id_user
                }
              }).catch(err => {
			
                res.status(500).json({msg: "error", details: err});		
              }).then(l=>{
                list_of_users_to_send[j]=l;
                compt++;
                if(compt==end){
                  delete_null_and_send(list_of_users_to_send)
                  
                }
              })
            }
            else{
              compt++;
              if(compt==end){
                delete_null_and_send(list_of_users_to_send)
              }
            }
          }
        }
        else{
          res.status(200).send([{list:[]}]);
        }
        
        function delete_null_and_send(list){
          let len=list.length;
          for(let i=0;i<len;i++){
            if(!list[len-i-1]){
              list.splice(len-i-1,1);
            }
          }
          res.status(200).send([{list:list_of_users_to_send}]);
        }
      }); 
      
   });

   router.get('/get_chat_history', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    let list_of_history=[];
    list_of_chat_search.findAll({
      where:{
        id_user:id_user,
        is_a_group_chat:{[Op.not]: true},
      },
      order: [
        ['date', 'DESC']
      ],
      limit:10,
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(searchs=>{
      if(searchs.length>0){
        let compt=0
        let end=searchs.length;
        for(let i=0;i<searchs.length;i++){
          if(searchs[i].id_receiver!=id_user){
            list_of_users.findOne({
              where:{
                id:searchs[i].id_receiver
              }
            }).catch(err => {
                
                res.status(500).json({msg: "error", details: err});		
            }).then(history=>{
              list_of_history[i]=history;
              delete_and_send(list_of_history)
            })
          }
          else{
            
            delete_and_send(list_of_history);
          }
        }

        function delete_and_send(list){
          compt++;
          if(compt==end){
            let len=list.length;
            for(let i=0;i<len;i++){
              if(!list[len-i-1]){
                list.splice(len-i-1,1);
              }
            }
            res.status(200).send([{"list_of_history":list_of_history}]);
          }
        }
      }
      else{
        res.status(200).send([{"list_of_history":[]}]);
      }
      
    })
   })


   
   router.get('/get_searching_propositions/:text/:is_for_chat', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let text = (req.params.text).toLowerCase();
    let is_for_chat=req.params.is_for_chat;
    const Op = Sequelize.Op;
    var list_of_related_users=[];
    var list_of_other_users=[];
    let list_of_words=text.split(" ");
    
    list_of_users.findAll({
      where:{
        [Op.and]:[
          {[Op.or]:[ 
            {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
            {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
          ]},
         
          {[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}
          
        ]
      },
      limit:25,
      order: [
        ['subscribers_number', 'DESC']
      ],
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(users=>{
        list_of_related_users= users;
        if(is_for_chat=='false'){
          get_other_users();
        }
        else{
          // si on créée un groupe on va aussi chercher les utilisateurs amis.
          let list_of_users_ids=[];
          for(let i=0;i<list_of_related_users.length;i++){
            list_of_users_ids.push(list_of_related_users[i].id)
          }
          list_of_users_ids.push(id_user)
          list_of_chat_friends.findAll({
            where: {
                [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:{[Op.notIn]: list_of_users_ids}} ]},{[Op.and]:[{id_receiver:id_user},{id_user:{[Op.notIn]: list_of_users_ids}} ]}],      
                is_a_group_chat:{[Op.not]: true},
            },
            order: [
                ['date', 'DESC']
              ],
            limit:25,
          })
          .catch(err => {
            
            res.status(500).json({msg: "error", details: err});		
          }).then(friends =>  {
            if(friends.length>0){
              let compte=0;
              for(let j=0;j<friends.length;j++){
                if(friends[j].id_user==id_user){
                  list_of_users.findOne({
                    where:{
                      [Op.and]:[
                        {[Op.or]:[ 
                          {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                          {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                        ]},
                        {id:friends[j].id_receiver}
                      ]
                    }
                  }).catch(err => {
                    
                    res.status(500).json({msg: "error", details: err});		
                  }).then(us=>{
                    if(us){
                      list_of_related_users.push(us);
                    }
                    compte++;
                    if(compte==friends.length){
                      res.status(200).send([{related_users:list_of_related_users,other_users:[]}])
                    }
                  })
                }
                else{
                  list_of_users.findOne({
                    where:{
                      [Op.and]:[
                        {[Op.or]:[ 
                          {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                          {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                        ]},
                        {id:friends[j].id_user}
                      ]
                    }
                  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
                    if(us){
                      list_of_related_users.push(us);
                    }
                    compte++;
                    if(compte==friends.length){
                      res.status(200).send([{related_users:list_of_related_users,other_users:[]}])
                    }
                  })
                }
                
              }
            }
            else{
              res.status(200).send([{related_users:list_of_related_users,other_users:[]}])
            }
          })
        }
    })
    

    function get_other_users(){
      list_of_users.findAll({
        where:{
          [Op.and]:[
            {[Op.or]:[ 
              {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
              {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
            ]},
            {[Op.not]:{[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}},
            //{id:{[Op.ne]:id_user}},
            
          ]
        },
        limit:25,
        order: [
          ['subscribers_number', 'DESC']
        ],
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(users=>{
          list_of_other_users= users;
          res.status(200).send([{related_users:list_of_related_users,other_users:list_of_other_users}])
      })
    }
    
    
  });


  router.get('/get_all_searching_propositions/:text/:is_for_chat/:limit/:offset', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let text = (req.params.text).toLowerCase();
    let is_for_chat=req.params.is_for_chat;
    const Op = Sequelize.Op;
    const limit = parseInt(req.params.limit);
    const offset = parseInt(req.params.offset);
    var list_of_related_users=[];
    let list_of_words=text.split(" ");
    list_of_users.findAll({
      where:{
        [Op.and]:[
          {[Op.or]:[ 
            {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
            {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
          ]},
          
          {[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}
          
        ]
      },
      order: [
        ['subscribers_number', 'DESC']
      ],
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(users=>{
        if(users.length>offset){
          if((users.length-offset)>=limit){
            list=users.slice(offset,offset+limit);
            res.status(200).send([{list:list,"search_more":true}])
          }
          else{
            let len=users.length
            list_of_related_users=users.slice(offset,len);
            if(is_for_chat=='false'){
              get_other_users(0,limit-(len-offset));
            }
            else{
              get_friends_for_groups(0,limit-(len-offset),true);
            }
            
          }
        }
        else{
          let len=users.length
          if(is_for_chat=='false'){
            get_other_users((offset-len),limit);
          }
          else{
            list_of_related_users=users;
            get_friends_for_groups((offset-len),limit,false);
          }
          
        }
        
        
    })
    
  
    

    function get_friends_for_groups(offset,limit,value){
      let list_of_users_ids=[];
      if(list_of_related_users.length>0){
        for(let i=0;i<list_of_related_users.length;i++){
          list_of_users_ids.push(list_of_related_users[i].id)
        }
      }
      list_of_users_ids.push(id_user);
      list_of_chat_friends.findAll({
        where: {
            [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:{[Op.notIn]: list_of_users_ids}} ]},{[Op.and]:[{id_receiver:id_user},{id_user:{[Op.notIn]: list_of_users_ids}} ]}],      
            is_a_group_chat:{[Op.not]: true},
        },
        order: [
            ['date', 'DESC']
          ],
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friends =>  {
        if(friends.length>0){
          let list2=[];
          let compte=0;
          for(let j=0;j<friends.length;j++){
              let pass=true;
              if(friends[j].id_user==id_user && pass){
                list_of_users.findOne({
                  where:{
                    [Op.and]:[
                      {[Op.or]:[ 
                        {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                        {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                      ]},
                      {id:friends[j].id_receiver}
                    ]
                  }
                }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
                  if(us){
                    list2[j]=us;
                  }
                  compte++;
                  if(compte==friends.length){
                    pass=false;
                    if(list2.length-offset>=limit){
                      if(list_of_related_users.length>0 && value){
                        list=list_of_related_users.concat(list2.slice(offset,offset+limit));
                        res.status(200).send([{list:list,"search_more":true}])
                      }
                      else{
                        list=list2.slice(offset,offset+limit);
                        res.status(200).send([{list:list,"search_more":true}])
                      }
                    }
                    else if(list2.length-offset>0){
                      if(list_of_related_users.length>0 && value){
                        let len =lit2.length;
                        list=list_of_related_users.concat(list2.slice(offset,len));
                        res.status(200).send([{list:list,"search_more":false}])
                      }
                      else{
                        let len =lit2.length;
                        list=list2.slice(offset,len);
                        res.status(200).send([{list:list,"search_more":false}])
                      }
                    }
                    else{
                      list=[];
                      res.status(200).send([{list:list,"search_more":false}])
                    }
                  }
                })
              }
              else{
                list_of_users.findOne({
                  where:{
                    [Op.and]:[
                      {[Op.or]:[ 
                        {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                        {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                      ]},
                      {id:friends[j].id_user}
                    ]
                  }
                }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
                  if(us){
                    list2[j]=us;
                  }
                  compte++;
                  if(compte==friends.length){
                    if(list2.length-offset>=limit){
                      if(list_of_related_users.length>0 && value){
                        list=list_of_related_users.concat(list2.slice(offset,offset+limit));
                        res.status(200).send([{list:list,"search_more":true}])
                      }
                      else{
                        list=list2.slice(offset,offset+limit);
                        res.status(200).send([{list:list,"search_more":true}])
                      }
                    }
                    else if(list2.length-offset>0){
                      if(list_of_related_users.length>0 && value){
                        let len =lit2.length;
                        list=list_of_related_users.concat(list2.slice(offset,len));
                        res.status(200).send([{list:list,"search_more":false}])
                      }
                      else{
                        let len =lit2.length;
                        list=list2.slice(offset,len);
                        res.status(200).send([{list:list,"search_more":false}])
                      }
                    }
                    else{
                      list=[];
                      res.status(200).send([{list:list,"search_more":false}])
                    }
                  }
                })
              }
            
            
            
          }
        }
        else{
          if(list_of_related_users.length>0){
            list=list_of_related_users
            res.status(200).send([{list:list,"search_more":false}])
          }
          else{
            list=[]
            res.status(200).send([{list:list,"search_more":false}])
          }
        }
      })
    }

    function get_other_users(offset,limit){
      list_of_users.findAll({
        where:{
          [Op.and]:[
            {[Op.or]:[ 
              {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
              {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
            ]},
            {[Op.not]:{[Op.or]:[{subscribings:{[Op.contains]:[id_user]}}, {subscribers:{[Op.contains]:[id_user]}}]}},
            //{id:{[Op.ne]:id_user}},
            
          ]
        },
        offset:offset,
        limit:limit,
        order: [
          ['subscribers_number', 'DESC']
        ],
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(users=>{
          if(users.length>0){
            if(list_of_related_users.length>0){
              list= list_of_related_users.concat(users);
            }
            else{
              list=users;
            }
          }
          else{
            if(list_of_related_users.length>0){
              list= list_of_related_users;
            }
            else{
              list=[];
            }
          }

          if(list.length>0){
            res.status(200).send([{list:list,"search_more":true}])
          }
          else{
            res.status(200).send([{list:list,"search_more":false}])
          }
          
          
      })
    }
    
    
  });

  router.get('/get_searching_propositions_group/:text', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let text = (req.params.text).toLowerCase();
    const Op = Sequelize.Op;

    
    list_of_chat_groups.findAll({
      where:{
          name:{[Op.iLike]:'%'+ text + '%' },
          list_of_receivers_ids: { [Op.contains]: [id_user] },
      },
      order: [
        ['updatedAt', 'DESC']
      ],
      limit:50,
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(groups=>{
      res.status(200).send([groups])
    })
    

    
  });


  

  router.get('/research_chat_sections/:text/:id_friend/:is_a_group_chat', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let text = (req.params.text).toLowerCase();
    let id_friend =parseInt(req.params.id_friend);
    let is_a_group_chat=(req.params.is_a_group_chat=='true')?true:false;
    const Op = Sequelize.Op;
    if(is_a_group_chat){
      list_of_chat_sections.findAll({
        where:{
          is_a_group_chat:true,
          chat_section_name:{[Op.iLike]:'%'+ text + '%' },
          id_receiver:id_friend,
        },
        order: [
          ['chat_section_name', 'ASC']
        ],
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(sections=>{
          res.status(200).send([sections])
      })
    }
    else{
      list_of_chat_sections.findAll({
        where:{
          is_a_group_chat:{[Op.not]: true},
          chat_section_name:{[Op.iLike]:'%'+ text + '%' },
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
        },
        order: [
          ['chat_section_name', 'ASC']
        ],
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(sections=>{
          res.status(200).send([sections])
      })
    }
    
    
    
  });
  
  router.post('/add_spam_to_contacts', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend= req.body.id;
    const Op = Sequelize.Op;

    list_of_chat_spams.findOne({
      where: {
        [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],        
      }
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then( spam=>{
        spam.destroy({
          truncate: false
        })
        var now = new Date();
        list_of_chat_friends.create({
          "id_user":id_user,
          "id_receiver":id_friend,
          "date":now,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(
          friend=>{
            res.status(200).send([friend]);
          }
        )
      })
  });

  router.post('/chat_sending_images/:file_name', function (req, res) {
    let current_user = get_current_user(req.cookies.currentUser);
    if(!current_user){
      return res.status(401).json({msg: "error"});
    }
    let file_name = req.params.file_name;
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
      (async () => {
        let filename = "./data_and_routes/chat_images/" + file_name ;
        const files = await imagemin([filename], {
        destination: './data_and_routes/chat_images',
        plugins: [
          imageminPngquant({
            quality: [0.7, 0.8]
        })
        ]
        });
        res.status(200).send(([{ "file_name": file_name}]))
      })();
      
      });
    });

    router.get('/get_picture_sent_by_msg/:file_name', function (req, res) {

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

      let file_name=req.params.file_name;

      let filename = "./data_and_routes/chat_images/" +file_name;
      fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/not-found-image.jpg";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(res);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(res);
          }     
        })
    
    });

    router.get('/get_attachment/:file_name/:friend_type/:friend_id', function (req, res) {

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
      let file_name=req.params.file_name;
      let friend_type=req.params.friend_type;
      let friend_id=parseInt(req.params.friend_id);
      let filename = '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/` +file_name;

      let transform = sharp()
      transform = transform.resize({fit:sharp.fit.contain,height:300})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
      fs.access( path.join(process.cwd(),filename), fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/not-found-image.jpg";
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(transform);
        }  
        else{
          var pp = fs.createReadStream( path.join(process.cwd(),filename))
          pp.pipe(transform);
        }     
      })
    
    });

    

    router.get('/get_attachment_svg/:file_name/:friend_type/:friend_id', function (req, res) {

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
      let file_name=req.params.file_name;
      let friend_type=req.params.friend_type;
      let friend_id=parseInt(req.params.friend_id);
      let filename = '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/` +file_name;

      fs.access( path.join(process.cwd(),filename), fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/not-found-image.jpg";
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(res);
        }  
        else{
          var pp = fs.createReadStream( path.join(process.cwd(),filename))
          pp.pipe(res);
        }     
      })
    
    });

    router.get('/get_attachment_popup/:file_name/:friend_type/:friend_id', function (req, res) {

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
      let file_name=req.params.file_name;
      let friend_type=req.params.friend_type;
      let friend_id=parseInt(req.params.friend_id);
      let filename = '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/` +file_name;
     
      fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/not-found-image.jpg";
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(res);
        }  
        else{
          var pp = fs.createReadStream( path.join(process.cwd(),filename))
          pp.pipe(res);
        }     
      })
    
    });

    router.get('/get_attachment_right/:file_name/:friend_type/:friend_id', function (req, res) {

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
      let file_name=req.params.file_name;
      let friend_type=req.params.friend_type;
      let friend_id=parseInt(req.params.friend_id);
      let filename = '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/` +file_name;
      let transform = sharp()
      transform = transform.resize({fit:sharp.fit.contain,height:75})
      .toBuffer((err, buffer, info) => {
          if (buffer) {
              res.status(200).send(buffer);
          }
      });
      fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
        if(err){
          filename = "./data_and_routes/not-found-image.jpg";
          var not_found = fs.createReadStream( path.join(process.cwd(),filename))
          not_found.pipe(transform);
        }  
        else{
          var pp = fs.createReadStream( path.join(process.cwd(),filename))
          pp.pipe(transform);
        }     
      })
    
    });

    router.get('/check_if_file_exists/:friend_type/:friend_id/:attachment_name/:value', function (req, res) {

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

      let attachment_name=req.params.attachment_name;
      let value=parseInt(req.params.value);
      let friend_type = req.params.friend_type
      let friend_id = parseInt(req.params.friend_id);
      const PATH= '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`;
      glob(process.cwd() + PATH + attachment_name, function (er, files) {
        if(er){
          res.status(200).send([{"value":attachment_name}])
        }
        else{
          if(files.length>0){
            glob(process.cwd() + PATH + attachment_name.split('.')[0] +'(' +'*([0-9])'+').'+ attachment_name.split('.')[1], function (er, files2) {
              if(er){
                res.status(200).send([{"value":attachment_name}])
              }
              else{
                if(files2.length>0){
                  let num =files2.length+1;
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


    router.get('/check_if_file_exists_png/:friend_type/:friend_id/:attachment_name', function (req, res) {

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

      let attachment_name=req.params.attachment_name;
      let friend_type = req.params.friend_type
      let friend_id = parseInt(req.params.friend_id);
      const PATH= '/data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`;
      glob(process.cwd() + PATH + attachment_name, function (er, files) {
        if(er){
          res.status(200).send([{"value":attachment_name}])
        }
        else{
          if(files.length>0){
            glob(process.cwd() + PATH + attachment_name.split('.')[0] +'(' +'*([0-9])'+').png', function (er, files2) {
              if(er){
                res.status(200).send([{"value":attachment_name.split('.')[0] +'.png'}])
              }
              else{
                if(files2.length>0){
                  let num =files2.length+1;
                  res.status(200).send([{"value":attachment_name.split('.')[0] +`(${num}).png`}])
                }
                else{
                    res.status(200).send([{"value":attachment_name.split('.')[0] +'.png'}])
                }
              }
            })
          }
          else{
            res.status(200).send([{"value":attachment_name.split('.')[0] +'.svg'}])
          };
        }
      })
    
    });

    router.post('/upload_attachments_for_chat/:friend_type/:friend_id/:name', function (req, res) {
      let friend_type = req.params.friend_type
      let friend_id = parseInt(req.params.friend_id);
      let name = req.params.name;
      var current_user = get_current_user(req.cookies.currentUser);
      
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      const PATH2= './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`;
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {

          mkdirp(PATH2, err => {
            cb(err, PATH2)
          })
          
        },
      
        filename: (req, file, cb) => {
          cb(null, name);
          
        }
      });
      
      let upload_attachment = multer({
        storage: storage
      }).any();
      
      upload_attachment(req, res, function(err){
        (async () => {
          let sufix=path.extname(name).toLowerCase();
          if(sufix==".jpg" || sufix==".png" || sufix==".jpeg" || sufix==".gif"){
            let file_name = './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/` + name ;
            const files = await imagemin([file_name], {
            destination: './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`,
            plugins: [
              imageminPngquant({
                quality: [0.7, 0.8]
            })
            ]
            });
          }
          res.status(200).send([{ok:"ok"}])
        })();
            
      });
      
    });

    router.post('/chat_upload_svg/:file_name/:friend_type/:friend_id', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      let file_name = req.params.file_name;
      let friend_type = req.params.friend_type
      let friend_id = parseInt(req.params.friend_id);

      const PATH2= './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`;
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
        (async () => {
          let filename = './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`; + file_name ;
          const files = await imagemin([filename], {
          destination: './data_and_routes/chat_attachments' + `/${friend_type}/${friend_id}/`,
          plugins: [
            imageminPngquant({
              quality: [0.8, 0.9]
          })
          ]
          });
          res.status(200).send(([{ "file_name": file_name}]))
        })();
        
        });
      });

    router.get('/get_size_of_files/:friend_id/:id_chat_section/:friend_type', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend = parseInt(req.params.friend_id);
      let id_chat_section = parseInt(req.params.id_chat_section);
      let friend_type=req.params.friend_type;
      const Op = Sequelize.Op;
      if(friend_type=='group'){
        list_of_messages.findAll({
          attributes: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('size'), 'decimal')), 'total']],
          where:{
            id_receiver:id_friend,
            attachment_type:"file_attachment",
            id_chat_section:id_chat_section,
            is_a_group_chat:true,
          }
         })
         .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
             res.status(200).send([files])
         }); 
      }
      else{
        list_of_messages.findAll({
          attributes: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('size'), 'decimal')), 'total']],
          where:{
            [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
            attachment_type:"file_attachment",
            id_chat_section:id_chat_section,
            is_a_group_chat:{[Op.not]: true},
          }
         })
         .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
             res.status(200).send([files])
         }); 
      }
      
   });

   router.get('/get_size_of_pictures/:friend_id/:id_chat_section/:friend_type', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend = parseInt(req.params.friend_id);
    let id_chat_section = parseInt(req.params.id_chat_section);
    let friend_type=req.params.friend_type;
    const Op = Sequelize.Op;
    if(friend_type=='group'){
      list_of_messages.findAll({
        attributes: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('size'), 'decimal')), 'total']],
        where:{
          id_receiver:id_friend,
          attachment_type:"picture_attachment",
          id_chat_section:id_chat_section,
          is_a_group_chat:true,
        }
       })
       .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
           res.status(200).send([files])
       }); 
    }
    else{
      list_of_messages.findAll({
        attributes: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('size'), 'decimal')), 'total']],
        where:{
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
          attachment_type:"picture_attachment",
          id_chat_section:id_chat_section,
          is_a_group_chat:{[Op.not]: true},
        }
       })
       .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
           res.status(200).send([files])
       }); 
    }
    
 });


    router.get('/get_all_files/:date/:friend_id/:id_chat_section/:friend_type', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend = parseInt(req.params.friend_id);
      let id_chat_section = parseInt(req.params.id_chat_section);
      let date_entry=req.params.date;
      let friend_type=req.params.friend_type;
      const Op = Sequelize.Op;
      let date =new Date();
      if(date_entry!="now"){
        date_entry.substring(0,date_entry.length - 5);
        date_entry = date_entry.replace("T",' ');
        date_entry = date_entry.replace("-",'/').replace("-",'/');
        date= new Date(date_entry + ' GMT');
      }
      if(friend_type=='group'){
        const Op = Sequelize.Op;
        list_of_messages.findAll({
             where: {
                is_a_group_chat:true,
                createdAt: {[Op.lt]: date},
                id_chat_section:id_chat_section,
                is_an_attachment:true,
                attachment_type:"file_attachment",
                id_receiver:id_friend,
               
             },
             order: [
                 ['createdAt', 'DESC']
               ],
            limit:15,
           })
           .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
               res.status(200).send([files])
           }); 
      }
      else{
        const Op = Sequelize.Op;
        list_of_messages.findAll({
             where: {
                is_a_group_chat:{[Op.not]: true},
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
           .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
               res.status(200).send([files])
           }); 
      }
      
   });

   router.get('/get_all_pictures/:date/:friend_id/:id_chat_section/:friend_type', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend = parseInt(req.params.friend_id);
    let id_chat_section = parseInt(req.params.id_chat_section);
    let date_entry=req.params.date;
    let friend_type=req.params.friend_type;
    const Op = Sequelize.Op;
    let date =new Date();
    if(date_entry!="now"){
      date_entry.substring(0,date_entry.length - 5);
      date_entry = date_entry.replace("T",' ');
      date_entry = date_entry.replace("-",'/').replace("-",'/');
      date= new Date(date_entry + ' GMT');
    }
    if(friend_type=='group'){
      list_of_messages.findAll({
        where: {
           is_a_group_chat:true,
           createdAt: {[Op.lt]: date},
           id_chat_section:id_chat_section,
           is_an_attachment:true,
           attachment_type:"picture_attachment",
           id_receiver:id_friend,    
          
        },
        order: [
            ['createdAt', 'DESC']
          ],
       limit:15,
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
          res.status(200).send([files])
      }); 
    }
    else{
      list_of_messages.findAll({
        where: {
           is_a_group_chat:{[Op.not]: true},
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
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(files =>  {
          res.status(200).send([files])
      }); 
    }
    
    
 });


 router.post('/delete_message/:id', function (req, res) {

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
  let id=parseInt(req.params.id);
  const Op = Sequelize.Op;
  list_of_messages.findOne({
    where:
    {id:id}
  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message=>{
    message.update({
      "status": "deleted"
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message=>{
      if(message.is_an_attachment){
        if(message.is_a_group_chat){
          let friend_type=(message.is_a_group_chat)?"group":"user";
          let friend_id=message.id_receiver;
  
  
          if(message.attachment_type=="picture_message"){
            fs.access('./data_and_routes/chat_images/' +`/${friend_type}/${friend_id}/` + message.attachment_name, fs.F_OK, (err) => {
              if(err){
                return res.status(200).send([{"ok":"ok"}]);
              }
              fs.unlink('./data_and_routes/chat_images/' +`/${friend_type}/${friend_id}/` + message.attachment_name,  function (err) {
                if (err) {
                  return res.status(200).send([{"ok":"ok"}]);
                }  
                else {
                  return res.status(200).send([{"ok":"ok"}]);
                }
              });
            });
          }
          else{
            fs.access('./data_and_routes/chat_attachments/'  +`/${friend_type}/${friend_id}/`+ message.attachment_name, fs.F_OK, (err) => {
              if(err){
                return res.status(200).send([{"ok":"ok"}]);
              }
              fs.unlink('./data_and_routes/chat_attachments/' +`/${friend_type}/${friend_id}/` + message.attachment_name,  function (err) {
                if (err) {
                  return res.status(200).send([{"ok":"ok"}]);
                }  
                else {
                  return res.status(200).send([{"ok":"ok"}]);
                }
              });
            });
          }
        }
        else{
          list_of_chat_friends.findOne({
            where:{
              is_a_group_chat:{[Op.not]: true},
              [Op.or]:[ {[Op.and]:[{id_user:message.id_user},{id_receiver:message.id_receiver} ]},{[Op.and]:[{id_receiver:message.id_user}, {id_user:message.id_receiver}]}],      
            }
          }).catch(err => {
            
            res.status(500).json({msg: "error", details: err});		
          }).then(friend=>{
            
            if(friend){
              let friend_type="user";
              let friend_id=friend.id;
      
      
              if(message.attachment_type=="picture_message"){
                fs.access('./data_and_routes/chat_images/' +`/${friend_type}/${friend_id}/` + message.attachment_name, fs.F_OK, (err) => {
                  if(err){
                    return res.status(200).send([{"ok":"ok"}]);
                  }
                  fs.unlink('./data_and_routes/chat_images/' +`/${friend_type}/${friend_id}/` + message.attachment_name,  function (err) {
                    if (err) {
                      return res.status(200).send([{"ok":"ok"}]);
                    }  
                    else {
                      return res.status(200).send([{"ok":"ok"}]);
                    }
                  });
                });
              }
              else{
                fs.access('./data_and_routes/chat_attachments/'  +`/${friend_type}/${friend_id}/`+ message.attachment_name, fs.F_OK, (err) => {
                  if(err){
                    return res.status(200).send([{"ok":"ok"}]);
                  }
                  fs.unlink('./data_and_routes/chat_attachments/' +`/${friend_type}/${friend_id}/` + message.attachment_name,  function (err) {
                    if (err) {
                      return res.status(200).send([{"ok":"ok"}]);
                    }  
                    else {
                      return res.status(200).send([{"ok":"ok"}]);
                    }
                  });
                });
              }
            }
            else{
              return res.status(200).send([{"ok":"ok"}]);
            }
            
          })
        }
       
      }
      else{
        return res.status(200).send([{"ok":"ok"}]);
      }
    })
    
  })
});


router.post('/add_emoji_reaction', function (req, res) {

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
  let current_user = get_current_user(req.cookies.currentUser).toString();
  let type_of_user=req.body.type_of_user;
  let id = req.body.id;
  let emoji = req.body.emoji;
  let is_a_group_chat=req.body.is_a_group_chat;
  if(is_a_group_chat){
    if(type_of_user=="create"){
      list_of_messages.findOne({
        where:{
          id:id,
          is_a_group_chat:true,
        }
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message=>{
        list_of_chat_groups_reactions.create({
          "id_user":current_user,
          "id_message":id,
          "id_group_chat":message.id_receiver,
          "emoji_reaction":emoji,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(react=>{
          res.status(200).send([react])
        })
      })
      
    }
    else{
      list_of_chat_groups_reactions.update({
        "emoji_reaction":emoji,
      },
      {where:{
        id:id,
      }}).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(react=>{
        res.status(200).send([react])
      })
    }
    
  }
  else{
    list_of_messages.findOne({
      where: {
         id:id
      },
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message =>  {
      
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
  }
  
});

router.post('/delete_emoji_reaction', function (req, res) {

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
  let id = req.body.id;
  let type_of_user=req.body.type_of_user;
  let is_a_group_chat=req.body.is_a_group_chat;
  if(is_a_group_chat){
    list_of_chat_groups_reactions.destroy({
      where:{
        id:id
      }
    },{truncate:false}).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(
      res.status(200).send([{done:"done"}])
    )
  }
  else{
    list_of_messages.findOne({
      where: {
         id:id
      },
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message =>  {
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
  }
 
});


router.post('/get_other_messages', function (req, res) {

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
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= req.body.id_friend;
  const id_chat_section= req.body.id_chat_section;
  const id_last_message= req.body.id_last_message;
  const is_a_group_chat= req.body.is_a_group_chat;
  var list_of_messages_reactions=req.body.list_of_messages_reactions;
  const Op = Sequelize.Op;
  let compt=0;
  if(!is_a_group_chat){
    list_of_messages.findAll({
      where: {
         id_chat_section:id_chat_section,
         id: {[Op.lt]: id_last_message},
         is_a_group_chat:{[Op.not]: true},
         [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
        
      },
      order: [
          ['createdAt', 'DESC']
        ],
     limit:50,
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
       res.status(200).send([messages,{list_of_messages_reactions:list_of_messages_reactions}])

     });
  }
  else{
    list_of_messages.findAll({
      where: {
         id_chat_section:id_chat_section,
         id: {[Op.lt]: id_last_message},
         is_a_group_chat:true,
         id_receiver:id_friend,
        
      },
      order: [
          ['createdAt', 'DESC']
        ],
     limit:50,
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
      if(messages.length>1){
       list_of_chat_groups_reactions.findAll({
         where:{
           id_group_chat:id_friend,
           [Op.and]:[{id_message:{[Op.gte]: messages[messages.length-1].id}},{id_message:{[Op.lt]: id_last_message}}],          
         }
       }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(reacts=>{
         for(let i=0;i<reacts.length;i++){
           if(list_of_messages_reactions[reacts[i].id_message]){
             list_of_messages_reactions[reacts[i].id_message].push(reacts[i].emoji_reaction)
           }
           else{
             list_of_messages_reactions[reacts[i].id_message]=[reacts[i].emoji_reaction];
           }
         }
         res.status(200).send([messages,{list_of_messages_reactions:list_of_messages_reactions}])
       })
      }
      else{
       res.status(200).send([messages,{list_of_messages_reactions:list_of_messages_reactions}])
      }
       
     });
  }
  
});



router.post('/get_reactions_by_user',function(req,res){
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
  let id_message=req.body.id_message;
  list_of_chat_groups_reactions.findAll({
    where:{
      id_message:id_message
    }
  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(reacts=>{
    res.status(200).send([reacts])
  })
})

router.get('/get_other_messages_more/:id_friend/:id_last_message/:id_chat_section/:friend_type', function (req, res) {

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
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= parseInt(req.params.id_friend);
  const id_chat_section= parseInt(req.params.id_chat_section);
  const id_last_message= parseInt(req.params.id_last_message);
  const friend_type=req.params.friend_type;
  const Op = Sequelize.Op;
  let compt=0;
  if(friend_type=='group'){
    list_of_messages.findAll({
      where: {
         id_chat_section:id_chat_section,
         id: {[Op.lt]: id_last_message},
         is_a_group_chat:true,
         id_receiver:id_friend,
      },
      order: [
          ['createdAt', 'DESC']
        ],
     limit:15,
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
        res.status(200).send([messages])
     });
  }
  else{
    list_of_messages.findAll({
      where: {
         id_chat_section:id_chat_section,
         id: {[Op.lt]: id_last_message},
         is_a_group_chat:{[Op.not]: true},
         [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
        
      },
      order: [
          ['createdAt', 'DESC']
        ],
     limit:15,
    })
    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
        res.status(200).send([messages])
     });
  }
  
});



router.get('/get_less_messages/:id_friend/:id_first_message/:id_last_message/:id_chat_section/:friend_type', function (req, res) {

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
  const id_user = get_current_user(req.cookies.currentUser);
  const id_friend= parseInt(req.params.id_friend);
  const id_first_message= parseInt(req.params.id_first_message);
  const id_chat_section= parseInt(req.params.id_chat_section);
  const id_last_message= parseInt(req.params.id_last_message);
  const friend_type= req.params.friend_type;
  const Op = Sequelize.Op;
  var id_born_sup=0;
  if(friend_type=='group'){
    list_of_messages.findAll({
      where:{
          is_a_group_chat:true,
          id_chat_section:id_chat_section,
          id:{[Op.gte]: id_first_message},
          id_receiver:id_friend,
        },
      order: [
        ['createdAt', 'ASC']
      ],
      limit:15,
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(msg=>{
      id_born_sup=msg[msg.length-1].id;
      list_of_messages.findAll({
        where: {
           is_a_group_chat:true,
           id_chat_section:id_chat_section,
           id:{[Op.and]:[{[Op.gte]: id_last_message},{[Op.lte]: id_born_sup}]},
           id_receiver:id_friend,
        },
        order: [
            ['createdAt', 'DESC']
          ],
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
        if(msg[msg.length-1].id!=id_first_message){
          res.status(200).send([messages])
        }
        else{
          res.status(200).send([null])
        }
          
       });
    })
  }
  else{
    list_of_messages.findAll({
      where:{
          is_a_group_chat:{[Op.not]: true},
          id_chat_section:id_chat_section,
          id:{[Op.gte]: id_first_message},
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
      },
      order: [
        ['createdAt', 'ASC']
      ],
      limit:15,
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(msg=>{
      id_born_sup=msg[msg.length-1].id;
      list_of_messages.findAll({
        where: {
           is_a_group_chat:{[Op.not]: true},
           id_chat_section:id_chat_section,
           id:{[Op.and]:[{[Op.gte]: id_last_message},{[Op.lte]: id_born_sup}]},
           [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
          
        },
        order: [
            ['createdAt', 'DESC']
          ],
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
        if(msg[msg.length-1].id!=id_first_message){
          res.status(200).send([messages])
        }
        else{
          res.status(200).send([null])
        }
          
       });
    })
  
  }
  
  
});



        

router.get('/get_messages_from_research/:message/:id_chat_section/:id_friend/:friend_type', function (req, res) {

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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_friend= parseInt(req.params.id_friend);
  let id_chat_section= parseInt(req.params.id_chat_section);
  let friend_type= req.params.friend_type;
  let message = (req.params.message).toLowerCase();
  const Op = Sequelize.Op;
  if(friend_type=='group'){
    list_of_messages.findAll({
      where:{
          is_a_group_chat:true,
          id_chat_section:id_chat_section,
          message:{[Op.iLike]:'%'+ message + '%' },
          id_receiver:id_friend,
        },
      order: [
        ['createdAt', 'DESC']
      ],
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
      res.status(200).send([messages])
    })
  }
  else{
    list_of_messages.findAll({
      where:{
          is_a_group_chat:{[Op.not]: true},
          id_chat_section:id_chat_section,
          message:{[Op.iLike]:'%'+ message + '%' },
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
      },
      order: [
        ['createdAt', 'DESC']
      ],
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
      res.status(200).send([messages])
    })
  }
  
  });

  
  router.get('/get_messages_around/:id_message/:id_chat_section/:id_friend/:friend_type', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend= parseInt(req.params.id_friend);
    let id_chat_section= parseInt(req.params.id_chat_section);
    let id = parseInt(req.params.id_message);
    let friend_type= req.params.friend_type;
    var id_born_sup=0;
    const Op = Sequelize.Op;
    var list_of_messages_to_send=[];

    if(friend_type=='group'){
      list_of_messages.findAll({
        where:{
            is_a_group_chat:true,
            id_chat_section:id_chat_section,
            id:{[Op.gt]: id},
        },
        order: [
          ['createdAt', 'ASC']
        ],
        limit:5,
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(mess=>{
         id_born_sup=mess[mess.length-1].id;
         list_of_messages.findAll({
          where:{
             is_a_group_chat:true,
              id_chat_section:id_chat_section,
              id:{[Op.and]:[{[Op.gt]: id},{[Op.lte]: id_born_sup}]},
              id_receiver:id_friend,
            },
          order: [
            ['createdAt', 'DESC']
          ],
          limit:5,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
          list_of_messages_to_send=messages;
          list_of_messages.findAll({
            where:{
                is_a_group_chat:true,
                id_chat_section:id_chat_section,
                id:{[Op.lte]: id},
                id_receiver:id_friend,
              },
            order: [
              ['createdAt', 'DESC']
            ],
            limit:6,
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(msg=>{
            list_of_messages_to_send=list_of_messages_to_send.concat(msg);
            res.status(200).json([{ "list_of_messages_to_send":list_of_messages_to_send}])
          })  
          
        })
      })
    }
    else{
      list_of_messages.findAll({
        where:{
          is_a_group_chat:{[Op.not]: true},
            id_chat_section:id_chat_section,
            id:{[Op.gt]: id},
        },
        order: [
          ['createdAt', 'ASC']
        ],
        limit:5,
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(mess=>{
         id_born_sup=mess[mess.length-1].id;
         list_of_messages.findAll({
          where:{
            is_a_group_chat:{[Op.not]: true},
              id_chat_section:id_chat_section,
              id:{[Op.and]:[{[Op.gt]: id},{[Op.lte]: id_born_sup}]},
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
          order: [
            ['createdAt', 'DESC']
          ],
          limit:5,
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
          list_of_messages_to_send=messages;
          list_of_messages.findAll({
            where:{
              is_a_group_chat:{[Op.not]: true},
                id_chat_section:id_chat_section,
                id:{[Op.lte]: id},
                [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
            },
            order: [
              ['createdAt', 'DESC']
            ],
            limit:6,
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(msg=>{
            list_of_messages_to_send=list_of_messages_to_send.concat(msg);
            res.status(200).json([{ "list_of_messages_to_send":list_of_messages_to_send}])
          })  
          
        })
      })
    }
    
    });

    

    router.get('/get_chat_sections/:id_friend/:is_a_group_chat', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= parseInt(req.params.id_friend);
      let is_a_group_chat=(req.params.is_a_group_chat=='true')?true:false;
      const Op = Sequelize.Op;
      if(is_a_group_chat){
        list_of_chat_sections.findAll({
          where:{
              is_a_group_chat:true,
              id_receiver:id_friend,
             },
          
          order: [
            ['chat_section_name', 'ASC']
          ],
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(section=>{
          res.status(200).send([section])
        })
      }
      else{
        list_of_chat_sections.findAll({
          where:{
              is_a_group_chat:{[Op.not]: true},
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
          
          order: [
            ['chat_section_name', 'ASC']
          ],
        }).catch(err => {
          res.status(500).json({msg: "error", details: err});		
        }).then(section=>{
              res.status(200).send([section])
            })
      }
      });

    router.post('/add_chat_section', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= req.body.id_friend;
      let chat_section= req.body.chat_section;
      let is_a_group_chat=req.body.is_a_group_chat;
      const Op = Sequelize.Op;
      let list_of_id=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];

      if(is_a_group_chat){
        list_of_chat_sections.findAll({
          where:{
              is_a_group_chat:true,
              id_receiver:id_friend,
            },
        }).catch(err => {
			
          res.status(500).json({msg: "error", details: err});		
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
                  list_of_chat_sections.create({
                    "id_chat_section":list_of_id[0],
                    "id_user": id_user,
                    "id_receiver": id_friend,
                    "chat_section_name":chat_section,
                    "is_a_group_chat": true,
                  }).catch(err => {
			
                  res.status(500).json({msg: "error", details: err});		
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
              "is_a_group_chat": true,
            }).catch(err => {
			
              res.status(500).json({msg: "error", details: err});		
            }).then(cr=>{
              res.status(200).json([{ "is_ok":true,"id_chat_section":2}])
            })
          }
        })
      }
      else{
        list_of_chat_sections.findAll({
          where:{
              is_a_group_chat:{[Op.not]: true},
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
        }).catch(err => {
			
          res.status(500).json({msg: "error", details: err});		
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
                  list_of_chat_sections.create({
                    "id_chat_section":list_of_id[0],
                    "id_user": id_user,
                    "id_receiver": id_friend,
                    "chat_section_name":chat_section,
                    "is_a_group_chat": false,
                  }).catch(err => {
			
                      res.status(500).json({msg: "error", details: err});		
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
              "is_a_group_chat": false,
            }).catch(err => {
			
            res.status(500).json({msg: "error", details: err});		
          }).then(cr=>{
              res.status(200).json([{ "is_ok":true,"id_chat_section":2}])
            })
          }
        })
      }
      
    });

      
    router.delete('/delete_chat_section/:id_chat_section/:id_friend/:is_a_group_chat', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_chat_section = parseInt(req.params.id_chat_section);
      let id_friend=parseInt(req.params.id_friend);
      let is_a_group_chat=(req.params.is_a_group_chat=='true')?true:false;
      const Op = Sequelize.Op;
      if(is_a_group_chat){
        list_of_chat_sections.findOne({
          where: {
            is_a_group_chat:true,
            id_chat_section:id_chat_section,
            id_receiver:id_friend,
          },
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(chat_section =>  {
          if(chat_section.id_user==id_user){
            chat_section.destroy({
              truncate: false
            })
            list_of_messages.findAll({
              where:{
                is_a_group_chat:true,
                id_chat_section:id_chat_section,
                id_receiver:id_friend,
              },
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
              if(messages.length>0){
                for(let i=0;i<messages.length;i++){
                  messages[i].destroy({
                    truncate: false
                  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
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
      }
      else{
        list_of_chat_sections.findOne({
          where: {
            is_a_group_chat:{[Op.not]: true},
            id_chat_section:id_chat_section,
            [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
          },
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(chat_section =>  {
          if(chat_section.id_user==id_user){
            chat_section.destroy({
              truncate: false
            })
            list_of_messages.findAll({
              where:{
                is_a_group_chat:{[Op.not]: true},
                id_chat_section:id_chat_section,
                [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],         
              },
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
              if(messages.length>0){
                for(let i=0;i<messages.length;i++){
                  messages[i].destroy({
                    truncate: false
                  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
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
      }
     
    });

    

    router.get('/get_notifications_section/:id_chat_section/:id_friend/:is_a_group_chat', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_friend= parseInt(req.params.id_friend);
      let id_chat_section= parseInt(req.params.id_chat_section);
      let is_a_group_chat=(req.params.is_a_group_chat=='true')?true:false;
      const Op = Sequelize.Op;
      if(is_a_group_chat){
        list_of_messages.findAll({
          where:{
              is_a_group_chat:true,
              id_chat_section:id_chat_section,
              id_receiver:id_friend, 
              id_user:{[Op.ne]:id_user},     
              status:"received",
              [Op.not]: {
                list_of_users_who_saw: {
                 [Op.contains]: [id_user],
                },
              },
          },
        
        }).catch(err => {
          res.status(500).json({msg: "error", details: err});		
        }).then(messages=>{
          if(messages.length>0){
            res.status(200).send([{ "value":true}]); 
          }
          else{
            res.status(200).send([{ "value":false}]); 
          }
        })
      }
      else{
        list_of_messages.findAll({
          where:{
               is_a_group_chat:{[Op.not]: true},
              status:'received',
              id_chat_section:id_chat_section,
              [Op.and]:[ {id_user:id_friend},{id_receiver:id_user}],         
          },
        }).catch(err => {
          
          res.status(500).json({msg: "error", details: err});		
        }).then(messages=>{
          if(messages.length>0){
            res.status(200).send([{ "value":true}]); 
          }
          else{
            res.status(200).send([{ "value":false}]); 
          }
        })
      }
      
      });


    /*************************GROUP CHAT ************************************** */
    /*************************GROUP CHAT ************************************** */
    /*************************GROUP CHAT ************************************** */
    /*************************GROUP CHAT ************************************** */

    
    router.post('/create_group_chat', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let name= req.body.name;
      let list_of_ids= req.body.list_of_ids;
      var chat_profile_pic_name='';
      const Op = Sequelize.Op;
      list_of_users.findOne({
        where:{
          id:id_user,
        }
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
        chat_profile_pic_name=user.profile_pic_file_name;
        list_of_chat_groups.create({
          "id_user":id_user,
          "name":name,
          "list_of_receivers_ids":list_of_ids,
          
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
            var now = new Date();
            list_of_chat_friends.create({
              "id_user":id_user,
              "id_receiver":group.id,
              "is_a_group_chat":true,
              "profile_pic_origin":"user",
            "chat_profile_pic_name":chat_profile_pic_name,
              "date":now,
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(
              friend=>{
                res.status(200).send([group]);
              }
            )
          })
        
      })
      
    });

    router.get('/retrieve_chat_profile_picture/:chat_profile_pic_name/:origin', function (req, res) {

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

        const chat_profile_pic_name = req.params.chat_profile_pic_name;
        const origin =req.params.origin;
        let filename=''
        if(origin=="user"){
            filename = "./data_and_routes/profile_pics/" + chat_profile_pic_name;
        }
        else{
          filename = "./data_and_routes/chat_profile_pics/" + chat_profile_pic_name;
        }

        fs.access(filename, fs.F_OK, (err) => {
          if(err){
            filename = "./data_and_routes/not-found-image.jpg";
            var not_found = fs.createReadStream( path.join(process.cwd(),filename))
            not_found.pipe(res);
          }  
          else{
            var pp = fs.createReadStream( path.join(process.cwd(),filename))
            pp.pipe(res);
          }     
        })
        
    
    });

    router.get('/get_group_chat_name/:id', function (req, res) {

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
      let id= req.params.id;
      list_of_chat_groups.findOne({
          where:{
            id:id
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
          res.status(200).send([group]);
        })
      });

    router.post('/get_group_chat_as_friend', function (req, res) {

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
      let id_receiver= req.body.id_receiver;
      list_of_chat_friends.findOne({
          where:{
            id_receiver:id_receiver,
            is_a_group_chat:true,
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
          res.status(200).send([friend]);
        })
      });

    router.get('/get_the_group_creator/:id_friend', function (req, res) {

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
      let id= parseInt(req.params.id_friend);
      list_of_chat_groups.findOne({
          where:{
            id:id
          }
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
          res.status(200).send([group]);
        })
      });

     
      
    router.post('/exit_group_chat', function (req, res) {

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
      let id_user = get_current_user(req.cookies.currentUser);
      let id_receiver= req.body.id_receiver;
      const Op = Sequelize.Op;
      list_of_chat_groups.findOne({
        where:{
          id:id_receiver,
        }
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
        if(group.id_user==id_user){
          let list_of_receivers_ids=group.list_of_receivers_ids;
          if(list_of_receivers_ids.length==1){
            list_of_chat_groups.destroy({
              where:{
                id:id_receiver,
              }
            },
            {truncate: false}).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
              list_of_chat_friends.destroy({
                where:{  
                  id_receiver:id_receiver,
                  is_a_group_chat:true,
                }
              },
              {truncate: false}).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
                list_of_messages.destroy(
                  {where:{
                    id_receiver:id_receiver,
                    is_a_group_chat:true,
                  }},
                  {truncate: false}
                )
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(()=>{
                res.status(200).send([{"supression":"done"}])
              })
            })
          }
          else{
            let index=list_of_receivers_ids.indexOf(id_user);
            list_of_receivers_ids.splice(index);
            group.update({
                "id_user":list_of_receivers_ids[0],
                "list_of_receivers_ids":list_of_receivers_ids,
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(grp=>{
              list_of_chat_friends.findOne({
                where:{  
                  id_receiver:id_receiver,
                  is_a_group_chat:true,
                }
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friends=>{
                friends.update({
                  "id_user":list_of_receivers_ids[0]
                }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
                  list_of_messages.update({
                    "list_of_users_in_the_group":list_of_receivers_ids},
                    {where:{
                      id_receiver:id_receiver,
                      is_a_group_chat:true,
                    }
                  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
                    res.status(200).send([friend])
                  })
                  
                  })
                })
                
            })

          }
        }
        else{
          let index=list_of_receivers_ids.indexOf(id_user);
            list_of_receivers_ids.splice(index);
            group.update({
                "list_of_receivers_ids":list_of_receivers_ids,
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
              list_of_messages.update({
                "list_of_users_in_the_group":list_of_receivers_ids},
                {where:{
                  id_receiver:id_receiver,
                  is_a_group_chat:true,
                }
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
                res.status(200).send([group])
              })
            })
        }
      })
    });


    router.get('/get_my_list_of_groups', function (req, res) {

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
      list_of_chat_groups.findAll({
            where: {
              list_of_receivers_ids: { [Op.contains]: [current_user] },
            },
            order: [
                ['createdAt', 'DESC']
              ],
            
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(groups =>  {
              res.status(200).send([groups])
          }); 
    });
      


    router.get('/get_my_list_of_groups_navbar', function (req, res) {

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
      list_of_chat_groups.findAll({
            where: {
              list_of_receivers_ids: { [Op.contains]: [current_user] },
            },
            order: [
                ['updatedAt', 'DESC']
              ],
            limit:10,
            
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(groups =>  {
              res.status(200).send([groups])
          }); 
    });

    

    router.post('/get_list_of_groups_I_am_in', function (req, res) {

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
      let list_of_ids=req.body.list_of_ids;
      let friends=[];
      let compt=0;
      const Op = Sequelize.Op;
      for(let i=0;i<list_of_ids.length;i++){
        list_of_chat_friends.findAll({
          where: {
             id_receiver:list_of_ids[i],
             is_a_group_chat: true,
          },
          order: [
              ['date', 'DESC']
            ],
         limit:1,
        })
        .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend =>  {
            friends[i]=friend[0]
            compt++;
            if(compt==list_of_ids.length){
              res.status(200).send([{"friends":friends}])
            }
            
        }); 

      }
      
   });

   router.post('/get_last_friends_groups_message', function (req, res) {

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
    const list_of_friends_ids= req.body.data;
    const Op = Sequelize.Op;
    let compt=0;
    var list_of_friends_messages=[];
    for(let i=0;i<list_of_friends_ids.length;i++){
        list_of_messages.findAll({
            where: {
               is_a_group_chat:true,
               id_receiver:list_of_friends_ids[i],
            },
            order: [
                ['createdAt', 'DESC']
              ],
           limit:1,
          })
          .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(messages =>  {
             list_of_friends_messages[i]=messages[0];
              compt++;
              if(compt==list_of_friends_ids.length){
                res.status(200).send([{list_of_friends_messages:list_of_friends_messages}])
              }
              
           });
        
    }
    
 });

 

 router.post('/get_my_last_real_friend', function (req, res) {

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
        let list_of_groups_ids = req.body.list_of_groups_ids;
        let friend_id = req.body.friend_id;
        const Op = Sequelize.Op;
        list_of_messages.findAll({
            where: {
                id_user:current_user,
                id_receiver:list_of_groups_ids,
                is_a_group_chat:true,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit:1,
            })
            .catch(err => {
              
              res.status(500).json({msg: "error", details: err});		
            }).then(message =>  {
                if(message.length>0){
                    let id=message[0].id;
                    list_of_messages.findAll({
                      where: {
                          id_user:current_user,
                          id_receiver:friend_id,
                          is_a_group_chat:{[Op.not]: true},
                      },
                      order: [
                          ['createdAt', 'DESC']
                      ],
                      limit:1,
                      })
                      .catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                      }).then(message2=>{
                        if(message2.length>0){
                          if(message2[0].id>id){
                            res.status(200).send([message2])
                          }
                          else{
                            res.status(200).send([message])
                          }
                        }
                        else{
                          res.status(200).send([message])
                        }
                      })
                }
                else{
                  list_of_messages.findAll({
                    where: {
                        id_user:current_user,
                        id_receiver:friend_id,
                        is_a_group_chat:{[Op.not]: true},
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    limit:1,
                    })
                    .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(message2=>{
                      if(message2.length>0){
                        res.status(200).send([message2])
                      }
                      else{
                        res.status(200).send([{nothing_found:"null"}])
                      }
                    })
                }
            });
   });



   router.post('/modify_chat_profile_pic/:id_receiver', function (req, res) {
      let id_receiver=parseInt(req.params.id_receiver);
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      var filename = ''
      let PATH = './data_and_routes/chat_profile_pics/';
  
      var storage = multer.diskStorage({
          destination: (req, file, cb) => {
              cb(null, PATH);
            },
          filename: (req, file, cb) => {
              var today = new Date();
              var ms = String(today.getMilliseconds()).padStart(2, '0');
              let Today = ms;
              filename = current_user + '-' + id_receiver + '-' + Today + '.png'
              cb(null,current_user + '-' + id_receiver + '-' + Today + '.png');
            }
      });
      
      var upload = multer({
          storage: storage
      }).any();
  
      upload(req, res, function(err) {
          if (err) {
              return res.end('Error');
          } else {
              (async () => {
                let file_name = "./data_and_routes/chat_profile_pics/" + filename ;
                const files = await imagemin([file_name], {
                destination: './data_and_routes/chat_profile_pics',
                plugins: [
                  imageminPngquant({
                    quality: [0.7, 0.8]
                })
                ]
                });
              })();
              list_of_chat_friends.findOne({
                  where: {
                    id_receiver: id_receiver,
                    is_a_group_chat:true,
                  }
                })
                .catch(err => {
                    res.status(500).json({msg: "error", details: err});		
                  }).then(group =>  {
                  group.update({
                    "chat_profile_pic_name":filename,
                    "profile_pic_origin":'group',
                  }).catch(err => {
                    
                    res.status(500).json({msg: "error", details: err});		
                  }).then(res.status(200).send(([{ "chat_profile_pic_name": filename}])))
                }); 
          }
      });
  });



  
  router.post('/get_chat_first_propositions_add_friend', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    const friend_id= req.body.friend_id;
    const Op = Sequelize.Op;
    let compt=0;
    let list=[];
    list_of_chat_groups.findOne({
      where:{
        id:friend_id
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
      let list_of_users_ids=group.list_of_receivers_ids;
      list_of_chat_friends.findAll({
        where:{
          [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:{[Op.notIn]: list_of_users_ids}} ]},{[Op.and]:[{id_receiver:id_user},{id_user:{[Op.notIn]: list_of_users_ids}} ]}],      
          is_a_group_chat:{[Op.not]: true},
        },
        order: [
          ['date', 'DESC']
        ],
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friends=>{
        for(let i=0;i<friends.length;i++){
          if(friends[i].id_user==id_user){
            list_of_users.findOne({
              where:{
                id:friends[i].id_receiver
              }
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              list[i]=user;
              compt++;
              if(compt==friends.length){
                res.status(200).send([{"list":list}])
              }
            })
          }
          else{
            list_of_users.findOne({
              where:{
                id:friends[i].id_user
              }
            }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
              list[i]=user;
              compt++;
              if(compt==friends.length){
                res.status(200).send([{"list":list}])
              }
            })
          }
        }
      })
    })

  });

  

  router.post('/get_chat_propositions_add_friend', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    const text= (req.body.text).toLowerCase();
    let list_of_words=text.split(" ");
    const friend_id=req.body.friend_id;
    const Op = Sequelize.Op;
    let list=[];
    list_of_chat_groups.findOne({
      where:{
        id:friend_id
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
      let list_of_users_ids=group.list_of_receivers_ids;
      list_of_chat_friends.findAll({
        where: {
            [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:{[Op.notIn]: list_of_users_ids}} ]},{[Op.and]:[{id_receiver:id_user},{id_user:{[Op.notIn]: list_of_users_ids}} ]}],      
            is_a_group_chat:{[Op.not]: true},
        },
        order: [
            ['date', 'DESC']
          ],
      })
      .catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friends =>  {
        if(friends.length>0){
          let compte=0;
          for(let j=0;j<friends.length;j++){
            if(friends[j].id_user==id_user){
              list_of_users.findOne({
                where:{
                  [Op.and]:[
                    {[Op.or]:[ 
                      {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                      {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                    ]},
                    {id:friends[j].id_receiver}
                  ]
                }
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
                if(us){
                  list.push(us);
                }
                compte++;
                if(compte==friends.length){
                  
                  res.status(200).send([{"list":list}])
                }
              })
            }
            else{
              list_of_users.findOne({
                where:{
                  [Op.and]:[
                    {[Op.or]:[ 
                      {[Op.or]:[{firstname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]},
                      {[Op.or]:[{firstname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{lastname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }},{nickname:(list_of_words[1])?{[Op.iLike]:'%'+ list_of_words[1] + '%' }:{[Op.iLike]:'%'+ list_of_words[0] + '%' }}]}
                    ]},
                    {id:friends[j].id_user}
                  ]
                }
              }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(us=>{
                if(us){
                  list.push(us);
                }
                compte++;
                if(compte==friends.length){
                  res.status(200).send([{"list":list}])
                }
              })
            }
            
          }
        }
        else{
          res.status(200).send([{list:[]}])
        }
      })

    })
    
  });


  
 
 
  router.post('/add_new_friends_to_a_group', function (req, res) {

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
    let list_of_friends = req.body.list_of_friends;
    let friend_id = req.body.friend_id;
    const Op = Sequelize.Op;
    list_of_chat_groups.findOne({
      where:{
        id:friend_id
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(group=>{
      list_of_receivers_ids=group.list_of_receivers_ids;
      if(list_of_receivers_ids.length+list_of_friends.length>10){
        res.status(200).send([{"warning":"too_much_friends"}])
      }
      else{
        list_of_receivers_ids=list_of_receivers_ids.concat(list_of_friends);
        group.update({
          "list_of_receivers_ids":list_of_receivers_ids
        }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(l=>{
          list_of_messages.update({
            "list_of_users_in_the_group":list_of_receivers_ids},
            {where:{
              id_receiver:friend_id,
              is_a_group_chat:true,
            }
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
            
            res.status(200).send([group])
          })
          
        })
      }
      
    })
});




router.get('/get_chat_first_propositions_group', function (req, res) {

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
  let id_user = get_current_user(req.cookies.currentUser);
  const Op = Sequelize.Op;
  let list=[]
  let list_of_history=[];
  let list_of_ids=[];
  list_of_chat_search.findAll({
    where:{
      id_user:id_user,
      is_a_group_chat:true,
    },
    order: [
      ['date', 'DESC']
    ],
    limit:5,
  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(searchs=>{
    if(searchs.length>0){
      let compt=0
      let end=searchs.length;
      for(let i=0;i<searchs.length;i++){
          list_of_ids.push(searchs[i].id_receiver)
          list_of_chat_groups.findOne({
            where:{
              id:searchs[i].id_receiver
            }
          }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(history=>{
            list_of_history[i]=history;
            compt++;
            if(compt==end){
              get_other_propositions();
            }
          })
      }
    }
    else{
      get_other_propositions();
    }
    
  })

  function get_other_propositions(){
      let limit=10-list_of_history.length;
      list_of_chat_groups.findAll({
        where: {
          list_of_receivers_ids: { [Op.contains]: [id_user] },
          id:{[Op.notIn]: list_of_ids}
        },
        order: [
            ['updatedAt', 'DESC']
          ],
        limit:limit
      }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(groups=>{
        if(groups.length>0){
          if(list_of_history.length>0){
            list=list_of_history.concat(groups)
          }
          else{
            list=groups
          }
        }
        res.status(200).send([{"list":list}])
      })
  }

 })



 router.get('/get_group_chat_information/:id', function (req, res) {

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
    let id_user = get_current_user(req.cookies.currentUser);
    const Op = Sequelize.Op;
    let id=parseInt(req.params.id);
    list_of_chat_groups.findOne({
      where:{
        id:id,
        list_of_receivers_ids: { [Op.contains]: [id_user] },
      }
    }).catch(err => {
        
        res.status(500).json({msg: "error", details: err});		
      }).then(r=>{

      res.status(200).send([r])
    })

 });



 
 router.post('/get_my_emojis_reactions_for_msg_group',function(req,res){
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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_message = req.body.id_message;
  let id_group_chat= req.body.id_group_chat;
  list_of_chat_groups_reactions.findOne({
    where:{
      id_user:id_user,
      id_group_chat:id_group_chat,
      id_message:id_message,
    }
  }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(react=>{
    if(react){
      res.status(200).send([react])
    }
    else{
      res.status(200).send([{message:"nothing"}])
    }
    
  })
 })


 router.post('/get_chat_friend',function(req,res){
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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_friend = req.body.friend_id;
  let is_a_group_chat=req.body.is_a_group_chat;
  const Op = Sequelize.Op;
  if(is_a_group_chat){
    list_of_chat_friends.findOne({
      where:{
        is_a_group_chat:true,
        id_receiver:id_friend,      
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
      
      if(friend){
        res.status(200).send([friend])
      }
      else{
        res.status(200).send([{nothing:'null'}])
      }
      
    })
  }
  else{
    list_of_chat_friends.findOne({
      where:{
        is_a_group_chat:{[Op.not]: true},
        [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],      
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
      
      if(friend){
        res.status(200).send([friend])
      }
      else{
        res.status(200).send([{nothing:'null'}])
      }
      
    })
  }
  
 })


 router.post('/remove_friend',function(req,res){
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
    let id_user = get_current_user(req.cookies.currentUser);
    let id_friend = req.body.id_friend;
    const Op = Sequelize.Op;
    list_of_chat_friends.findOne({
      where:{
        is_a_group_chat:{[Op.not]: true},
        [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],      
      }
    }).catch(err => {
			
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
      if(friend){
        let date=friend.date;
        friend.destroy({
          truncate: false
        })
        res.status(200).send([{deletion:'done',date:date}])
      }
      else{
        res.status(200).send([{nothing:'null'}])
      }
      
    })
  
 })

 router.post('/remove_spam',function(req,res){
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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_friend = req.body.id_friend;
  const Op = Sequelize.Op;
  list_of_chat_spams.findOne({
    where:{
      [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],      
    }
  }).catch(err => {
    
    res.status(500).json({msg: "error", details: err});		
  }).then(friend=>{
    if(friend){
      let date=friend.date;
      friend.destroy({
        truncate: false
      })
      res.status(200).send([{deletion:'done',date:date}])
    }
    else{
      res.status(200).send([{nothing:'null'}])
    }
    
  })

})


 router.post('/add_chat_friend',function(req,res){
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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_friend = req.body.id_friend;
  let date = req.body.date;
  date.substring(0,date.length - 5);
  date = date.replace("T",' ');
  date = date.replace("-",'/').replace("-",'/');
  let final_date= new Date(date + ' GMT');
  const Op = Sequelize.Op;
  list_of_chat_friends.findOne({
    where:{
      is_a_group_chat:{[Op.not]: true},
      [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],      
    }
  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(friend=>{
    if(friend){
      res.status(200).send([{add:'done'}])
    }
    else{
      list_of_chat_friends.create({
        "id_user":id_user,
        "id_receiver":id_friend,
        "date":final_date,
      }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(r=>{
        res.status(200).send([r])
      })
    }
    
  })
 
})



router.post('/add_chat_folder',function(req,res){
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
  let id_user = get_current_user(req.cookies.currentUser);
  let id_chat_friend = req.body.id_chat_friend;
  let title = capitalizeFirstLetter(req.body.title);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const Op = Sequelize.Op;
  list_of_chat_folders.findOne({
    where:{
      id_chat_friend:id_chat_friend,
      title:{[Op.iLike]: title},}
  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(folder=>{
    if(folder){
      res.status(200).send([{error:'found'}])
    }
    else{
      list_of_chat_folders.create({
        "id_user":id_user,
        "id_chat_friend":id_chat_friend,
        "title":title,
        "number_of_files":0,
      }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
      }).then(r=>{

        list_of_chat_folders.findAll({
          where:{
            id_chat_friend:id_chat_friend,
          }, 
          order: [
            ['title', 'ASC']
          ],
        }).catch(err => {
            res.status(500).json({msg: "error", details: err});		
          }).then(folders=>{
          if(folders){
            res.status(200).send([folders])
          }
          
        })
      })
    }
    
  })
 
})




router.post('/rename_chat_folder',function(req,res){
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
  let id_folder = req.body.id_folder;
  let title = capitalizeFirstLetter(req.body.title);
  let id_chat_friend= req.body.chat_friend_id;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const Op = Sequelize.Op;
  list_of_chat_folders.findOne({
    where:{
      id_chat_friend:id_chat_friend,
      title:{[Op.iLike]: title},}
  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(folder=>{
    if(folder){
      res.status(200).send([{error:'found'}])
    }
    else{
      list_of_chat_folders.findOne({
        where:{
          id:id_folder}
      }).catch(err => {
          res.status(500).json({msg: "error", details: err});		
        }).then(folder=>{
        if(folder){
          folder.update({
            "title":title,
          })
          res.status(200).json([{done:title}]);		
        }
      })
    }
  })
 
 
})


router.post('/get_chat_folders',function(req,res){
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
  let id_chat_friend = req.body.id_chat_friend;
  list_of_chat_folders.findAll({
    where:{
      id_chat_friend:id_chat_friend,
    }, 
    order: [
      ['title', 'ASC']
    ],
  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(folders=>{
    if(folders){
      res.status(200).send([folders])
    }
    
  })
 
})

router.post('/get_files_by_folder',function(req,res){
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
  let id_folder = req.body.id_folder;
  let offset=req.body.offset
  list_of_messages.findAll({
    where:{
      id_folder:id_folder,
    }, 
    order: [
      ['createdAt', 'DESC']
    ],
    offset:offset,
    limit:15,
  }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(messages=>{
    if(messages){
      if(offset==0){

        list_of_messages.count({
          where: {
            id_folder:id_folder,
          },
        }).catch(err => {
            res.status(500).send([{error:err}])
        }).then(num=>{
          list_of_chat_folders.update({
            "number_of_files":num},
            {where:{
              id:id_folder,
            }
          })
          res.status(200).send([{messages:messages,num:num}]);
        })
      }
      else{
        res.status(200).send([{messages:messages}])
      }
      
      
    }
    
  })
 
})

  router.post('/archive_chat_message',function(req,res){
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
    let id_folder = req.body.id_folder;
    let id_message=req.body.id_message;
    
      
    list_of_messages.update({
      "id_folder":id_folder},
      {where:{
        id:id_message,
      }
    })

    list_of_messages.count({
      where: {
        id_folder:id_folder,
      },
    }).catch(err => {
        res.status(500).send([{error:err}])
    }).then(num=>{
      list_of_chat_folders.update({
        "number_of_files":num},
        {where:{
          id:id_folder,
        }
      })
      res.status(200).send([{done:"done"}])
    })
    
  })

  router.post('/unarchive_chat_message',function(req,res){
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
    let id_message=req.body.id_message;
    let id_folder=req.body.id_folder;
      
    list_of_messages.update({
      "id_folder":0},
      {where:{
        id:id_message,
      }
    })
    list_of_messages.count({
      where: {
        id_folder:id_folder,
      },
    }).catch(err => {
        res.status(500).send([{error:err}])
    }).then(num=>{
      list_of_chat_folders.update({
        "number_of_files":num},
        {where:{
          id:id_folder,
        }
      })
      res.status(200).send([{done:"done"}])
    })
  })


  router.post('/remove_folder',function(req,res){
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
    let id_folder=req.body.id_folder;
    let id_user = get_current_user(req.cookies.currentUser);
    let id_chat_friend=req.body.id_chat_friend
    list_of_chat_folders.findOne(
      {where:{
        id:id_folder,
        id_user:id_user,
      }
    }).catch(err => {
        res.status(500).send([{error:err}])
    }).then(folder=>{
      if(folder){
        folder.destroy({
          truncate: false
        })
        list_of_chat_folders.findAll({
          where:{
            id_chat_friend:id_chat_friend,
          }, 
          order: [
            ['title', 'ASC']
          ],
        }).catch(err => {
            res.status(500).json({msg: "error", details: err});		
          }).then(folders=>{
          if(folders){
            res.status(200).send([folders])
          }
          
        })

      }
      else{
        res.status(200).send([{error:"not_found"}])
      }
    })
  })

  
}