let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./serverexpress');
const url = require('url');
const chat_seq= require('./chat/model/sequelize');
const db = require('./authentication/db.config');
const subscribings_seq= require('./p_subscribings_archives_contents/model/sequelize');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
var nodemailer = require('nodemailer');
// Create web socket server on top of a regular http server
let wss = new WSServer({
  server: server,
});

// Also mount the app here
server.on('request', app);
webSockets = {} // userID: webSocket
date_of_webSockets_last_connection={};
date_of_webSockets_last_connection_ddos={};
date_of_webSockets_last_message={};
wss.on('connection', (ws, req)=>{
  
  ws.isAlive = true;
  ws.on('pong', () => {
      ws.isAlive = true;
  });
  if(req.headers.origin !='http://localhost:4200'){
    return   ws.send(JSON.stringify([{not_allowed:"you are not allowed to connect here"}]));
  }
  var userID = parseInt(url.parse(req.url).query.substring(3));
  let date1 = new Date();
  let speed_limit1=10;
  if(date_of_webSockets_last_connection_ddos[userID] && (date1.getTime() - date_of_webSockets_last_connection_ddos[userID].getTime())<speed_limit1){
    return false;
  }
  date_of_webSockets_last_connection_ddos[userID]=date1;
  if(!webSockets[userID] || !(webSockets[userID].length>0) ){
    webSockets[userID] = [ws];
    
  }
  else{
    webSockets[userID].push(ws);
  }
 let now = new Date();
	let connexion_time = now.toString();
  db.users.findOne({
    where:{
      id:userID
    }
  }).then(user=>{
    db.users_connexions.create({
      "id_user":userID,
      "nickname":user.nickname,
      "connexion_time":connexion_time,
      "status":"websocket",
    })
  })
  
 
  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
    
  ws.on('message', function incoming(message) {

    var messageArray = JSON.parse(message);
    let date = new Date();
    let speed_limit=10;
    
    if(messageArray.status!="not-writing"){
      if(date_of_webSockets_last_message[userID] && (date.getTime() - date_of_webSockets_last_message[userID].getTime())<speed_limit){
        return false;
      }
      date_of_webSockets_last_message[userID]=date;
    }
    
    if(messageArray.for_notifications){


      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/

      //for groupe creation
      if(messageArray.list_of_receivers){
        for(let i=0;i<messageArray.list_of_receivers.length;i++){
          var toUserWebSocket = webSockets[messageArray.list_of_receivers[i]];
          if (toUserWebSocket && toUserWebSocket.length>0) {
            for(let i=0;i<toUserWebSocket.length;i++){
              toUserWebSocket[i].send(JSON.stringify([messageArray]));
            }
          } 
        }
      }
      else if(messageArray.id_receiver){
          var toUserWebSocket = webSockets[messageArray.id_receiver];
          if (toUserWebSocket && toUserWebSocket.length>0) {
            for(let i=0;i<toUserWebSocket.length;i++){
              toUserWebSocket[i].send(JSON.stringify([messageArray]));
            }
          } 
      }
      else{
        subscribings_seq.list_of_subscribings.findAll({
          where:{
              id_user_subscribed_to:messageArray.id_user,
          }
        }).then(subscribers=>{
            if(subscribers.length>0){
              for(let i=0;i<subscribers.length;i++){
                var toUserWebSocket = webSockets[subscribers[i].id_user];
                if (toUserWebSocket && toUserWebSocket.length>0) {
                  for(let i=0;i<toUserWebSocket.length;i++){
                    toUserWebSocket[i].send(JSON.stringify([messageArray]));
                  }
                } 
              }
            }
            
        })
      }
      

    }
    /***************************************** CHAT *************************/
    /***************************************** CHAT *************************/
     /***************************************** CHAT *************************/
    /***************************************** CHAT *************************/


    if(!messageArray.is_a_group_chat && !messageArray.for_notifications){
       /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      var toUserWebSocket = webSockets[parseInt(messageArray.id_receiver)];
      
      
      const Op = Sequelize.Op;
      const id_user=messageArray.id_user;
      const id_friend=messageArray.id_receiver;
      if(messageArray.status=="writing" ){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'writing',message:messageArray.chat_section_name,id_user_writing:id_user}]));
          }
         
        }
      }
      
      else if(messageArray.status=='not-writing'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'not-writing',message:messageArray.chat_section_name,id_user_writing:id_user}]));
          }
        }
      }
      else if(messageArray.status=='block'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'block',message:messageArray.chat_section_name,id_user_blocking:id_user}]));
          }
        }
      }
      else if(messageArray.status=='emoji'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'emoji',message:messageArray,real_id_user:id_user}]));
          }
        }
      }
      else if(messageArray.status=="delete_message" ){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'delete_message',message:messageArray,id_user_writing:id_user,id_message:messageArray.id_message}]));
          }
         
        }
      }
      else if(messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  messageArray.status!='emoji' && messageArray.status!='block'){


        if(id_friend==id_user){
          send_message_to_friend();
        } 
        else{
          chat_seq.list_of_chat_friends.findOne({
            where: {
              is_a_group_chat:{[Op.not]: true},
              [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],           
            }
          }).then( friend=>{
            if(friend){
              var yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              db.users_connexions.findOne({
                id_user:id_friend,
                createdAt: {[Op.gte]: yesterday}
              }).then(r=>{
                if(!r){
                  chat_seq.list_of_chat_emails.findOne({
                    where:{
                      id_user:id_user,
                      id_receiver:id_friend,
                      createdAt: {[Op.gte]: yesterday}
                    }
                  }).then(email=>{
                    if(!email){
                      chat_seq.list_of_chat_emails.create({
                        "id_user":id_user,
                        "id_receiver":id_friend,
                        "status":"friend",
                      })

                      let user_name='';

                      db.users.findOne({
                        where:{
                          id:id_friend,
                        }
                        
                      }).then(user_found=>{
                        user_name= user_found.firstname + ' ' + user_found.lastname;
                        let mail_to_send='';
                        let name = user_name;
                        if(user_found.gender=="Homme"){
                          mail_to_send=`<p>Cher ${name},</p>`
                          }
                          else if(user_found.gender=="Femme"){
                          mail_to_send=`<p>Chère ${name},</p>`
                          }
                          else if(user_found.gender=="Groupe"){
                          mail_to_send=`<p>Chers membres du groupe ${name},</p>`
                          }
  
                          
                          if(messageArray.message && messageArray.message.length>0){
                            mail_to_send+=`<p>Vous venez de recevoir un message de la part de l'utilisateur @${messageArray.id_user_name} : </p>`
                            mail_to_send+=`<p>"${messageArray.message}".</p>`
                          }
                          
                          
                          mail_to_send+=`<p><a href="http://localhost:4200/for_chat/${user_found.nickname}/${user_found.id}/${messageArray.id_user_name}/${id_user}">Cliquer ici</a> pour ouvrir la messagerie.</p>`
                          
                          mail_to_send+=`<p>Très sincèrement, l'équipe de LinkArts.</p>`
  
  
                          const transport = nodemailer.createTransport({
                            host: "pro2.mail.ovh.net",
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                              user: "services@linkarts.fr", // compte expéditeur
                              pass: "Le-Site-De-Mokhtar-Le-Pdg" // mot de passe du compte expéditeur
                            },
                              tls:{
                                ciphers:'SSLv3'
                            }
                            });
                        
                          var mailOptions = {
                            from: 'Linkarts <services@linkarts.fr>', // sender address
                            to:"appaloosa-adam@hotmail.fr",
                            subject: `Notification de la messagerie`, // Subject line
                            html:mail_to_send , // html body
                          };
                          transport.sendMail(mailOptions, (error, info) => {
                            if (error) {
                              res.status(200).send([{error:error}])
                            } else {
                              res.status(200).send([{sent:'Message sent ' + info.messageId}])
                            }
                          })
                      })
                    }
                    send_message_to_friend();
                  })
                }
                else{
                  send_message_to_friend();
                }
              })
             
            }
            else{
              subscribings_seq.list_of_subscribings.findOne({
                where:{
                  [Op.and]:[{[Op.or]:[{id_user: id_user},{id_user_subscribed_to:id_user}]},{[Op.or]:[{id_user: id_friend},{id_user_subscribed_to:id_friend}]}],
                }
              }).then(sub=>{
                if(sub){
                  send_message_to_friend();
                }
                else{
                  send_message_to_spam();
                } 
              })
            }
          });
        }

        /*****************************************TO A FRIEND *************************/
        /*****************************************TO A FRIEND *************************/
        /*****************************************TO A FRIEND *************************/
        /*****************************************TO A FRIEND *************************/


        function send_message_to_friend(){
          chat_seq.list_of_messages.create({
            "id_user_name":messageArray.id_user_name,
            "id_receiver": messageArray.id_receiver,
            "id_user":messageArray.id_user,
            "message":messageArray.message,
            "is_from_server":messageArray.is_from_server,
            "attachment_name":messageArray.attachment_name,
            "size":(messageArray.size)?(messageArray.size).toString():null,
            "is_a_response":messageArray.is_a_response,
            "id_message_responding":messageArray.id_message_responding,
            "message_responding_to":messageArray.message_responding_to,
            "id_chat_section":messageArray.id_chat_section,
            "is_an_attachment":messageArray.is_an_attachment,
            "attachment_type":messageArray.attachment_type,
            "is_a_group_chat":messageArray.is_a_group_chat,
            "status":'received',
          })
          .then(r =>  {
            chat_seq.list_of_chat_friends.findOne({
              where: {
                is_a_group_chat:(messageArray.is_a_group_chat)?true:{[Op.not]: true},
                [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],       
              }
            }).then(friend=>{
              var now = new Date();
              if(friend){
                friend.update({
                  "date":now,
                }).then(s=>{
                  if(messageArray.id_user!=messageArray.id_receiver){
                    if (toUserWebSocket && toUserWebSocket.length>0) {
                      for(let i=0;i<toUserWebSocket.length;i++){
                        toUserWebSocket[i].send(JSON.stringify([{
                          "id":r.id,
                          "id_receiver": messageArray.id_receiver,
                          "id_user":messageArray.id_user,
                          "message":messageArray.message,
                          "is_from_server":messageArray.is_from_server,
                          "attachment_name":messageArray.attachment_name,
                          "size":(messageArray.size)?(messageArray.size).toString():null,
                          "is_a_response":messageArray.is_a_response,
                          "id_message_responding":messageArray.id_message_responding,
                          "message_responding_to":messageArray.message_responding_to,
                          "id_chat_section":messageArray.id_chat_section,
                          "is_an_attachment":messageArray.is_an_attachment,
                          "attachment_type":messageArray.attachment_type,
                          "is_a_group_chat":messageArray.is_a_group_chat,
                        }]));
                      }
                      
                    }
                    if(!messageArray.is_from_server || messageArray.is_from_server==null){
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                      
                    }
                    if(messageArray.is_from_server){
                      // for new contacts
                      // pas de new for friends
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                    }
                  }
                  else{
                    // pour moi meme
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user,real_id_user:messageArray.id_user}]));
                    }
                   
                  }
                
                })
              }
              else{
                chat_seq.list_of_chat_friends.create({
                  "id_user":messageArray.id_user,
                  "id_receiver":messageArray.id_receiver,
                  "is_a_group_chat":false,
                  "date":now,
                }).then(t=>{
                  if(messageArray.id_user!=messageArray.id_receiver){
                    if (toUserWebSocket  && toUserWebSocket.length>0) {
                      for(let i=0;i<toUserWebSocket.length;i++){
                        toUserWebSocket[i].send(JSON.stringify([{
                          "chat_id":t.id,
                          "id":r.id,
                          "id_receiver": messageArray.id_receiver,
                          "id_user":messageArray.id_user,
                          "message":messageArray.message,
                          "is_from_server":messageArray.is_from_server,
                          "attachment_name":messageArray.attachment_name,
                          "size":(messageArray.size)?(messageArray.size).toString():null,
                          "is_a_response":messageArray.is_a_response,
                          "id_message_responding":messageArray.id_message_responding,
                          "message_responding_to":messageArray.message_responding_to,
                          "id_chat_section":messageArray.id_chat_section,
                          "is_an_attachment":messageArray.is_an_attachment,
                          "attachment_type":messageArray.attachment_type,
                          "is_a_group_chat":messageArray.is_a_group_chat,
                        }]));
                      }
                      
                    }
                    if(!messageArray.is_from_server || messageArray.is_from_server==null){
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                     
                    }
                    if(messageArray.is_from_server){
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                    }
                  }
                  else{
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user,real_id_user:messageArray.id_user}]));
                    }
                  }
                  
                })
              }
            })
          }); 
        }
        
        /*****************************************to a spam  *************************/
        /*****************************************to a spam   *************************/
        /*****************************************to a spam  *************************/
        /*****************************************to a spam  *************************/
        /*****************************************to a spam   *************************/
        /*****************************************to a spam  *************************/

        
        function send_message_to_spam(){
          chat_seq.list_of_messages.create({
            "id_user_name":messageArray.id_user_name,
            "id_receiver": messageArray.id_receiver,
            "id_user":messageArray.id_user,
            "message":messageArray.message,
            "attachment_name":messageArray.attachment_name,
            "is_an_attachment":messageArray.is_an_attachment,
            "is_from_server": messageArray.is_from_server,
            "size":(messageArray.size)?(messageArray.size).toString():null,
            "attachment_type":messageArray.attachment_type,
            "is_a_response":messageArray.is_a_response,
            "id_message_responding":messageArray.id_message_responding,
            "id_chat_section":messageArray.id_chat_section,
            "message_responding_to":messageArray.message_responding_to,
            "is_a_group_chat":false,
            "status":'received',
          })
          .then(r =>  {
            let id_friend=messageArray.id_receiver;
            let id_user=messageArray.id_user;
            chat_seq.list_of_chat_spams.findOne({
              where: {
                [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],            
              }
            }).then(spam=>{
              var now = new Date();
              if(spam || (!spam && messageArray.is_from_server)){
                  if(spam){
                    spam.update({
                      "date":now,
                    })
                  }
                  if (toUserWebSocket && toUserWebSocket.length>0) {
                    for(let i=0;i<toUserWebSocket.length;i++){
                      toUserWebSocket[i].send(JSON.stringify([{
                        "id":r.id,
                        "id_receiver": messageArray.id_receiver,
                        "id_user":messageArray.id_user,
                        "message":messageArray.message,
                        "is_from_server":messageArray.is_from_server,
                        "attachment_name":messageArray.attachment_name,
                        "size":(messageArray.size)?(messageArray.size).toString():null,
                        "is_a_response":messageArray.is_a_response,
                        "id_message_responding":messageArray.id_message_responding,
                        "message_responding_to":messageArray.message_responding_to,
                        "id_chat_section":messageArray.id_chat_section,
                        "is_an_attachment":messageArray.is_an_attachment,
                        "attachment_type":messageArray.attachment_type,
                        "is_a_group_chat":false,
                      }]));
                    }
                   
                  }
                  if(!messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                   
                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                  }
                
              }
              else if(!messageArray.is_from_server){
                chat_seq.list_of_chat_spams.create({
                  "id_user":messageArray.id_user,
                  "id_receiver":messageArray.id_receiver,
                  "date":now,
                }).then(t=>{
                  if (toUserWebSocket && toUserWebSocket.length>0) {
                    for(let i=0;i<toUserWebSocket.length;i++){
                      toUserWebSocket[i].send(JSON.stringify([{
                        "id":r.id,
                        "id_receiver": messageArray.id_receiver,
                        "id_user":messageArray.id_user,
                        "message":messageArray.message,
                        "is_from_server":messageArray.is_from_server,
                        "attachment_name":messageArray.attachment_name,
                        "size":(messageArray.size)?(messageArray.size).toString():null,
                        "is_a_response":messageArray.is_a_response,
                        "id_message_responding":messageArray.id_message_responding,
                        "message_responding_to":messageArray.message_responding_to,
                        "id_chat_section":messageArray.id_chat_section,
                        "is_an_attachment":messageArray.is_an_attachment,
                        "attachment_type":messageArray.attachment_type,
                        "is_a_group_chat":messageArray.is_a_group_chat,
                      }]));
                    }
                   
                  }
                  if(!messageArray.is_from_server || messageArray.is_from_server==null){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                    }
                   
                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                  }
                })
              }
            })
          }); 
        }


        
      }
      else{
        //for seen
        if(toUserWebSocket && toUserWebSocket.length>0){
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([messageArray]));
          }
         
        }
      }
    }
    else if(!messageArray.for_notifications){

      /*****************************************SEND MESSAGE TO A GROUP  *************************/
    /*****************************************SEND MESSAGE TO A GROUP  *************************/
    /*****************************************SEND MESSAGE TO A GROUP  *************************/
    /*****************************************SEND MESSAGE TO A GROUP  *************************/
    /*****************************************SEND MESSAGE TO A GROUP  *************************/
    /*****************************************SEND MESSAGE TO A GROUP  *************************/


      let list_of_receivers=[];
      const id_group=messageArray.id_receiver;
      chat_seq.list_of_chat_groups.findOne({
        where:{
          id:id_group
        }
      }).then( group=>{
        if(!group){

          // ajouter en cas de discussion introuvable
         }
        else{
        
        list_of_receivers=group.list_of_receivers_ids;
            const Op = Sequelize.Op;
            const id_user=messageArray.id_user;
            const id_friend=(list_of_receivers[0]!=userID)?list_of_receivers[0]:list_of_receivers[1];
            if(messageArray.status=="writing" ){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'writing',message:messageArray.chat_section_name,group_chat_id:messageArray.id_receiver,id_user_writing:id_user}]));
                    }
                  }
                }
              }
            }
            else if(messageArray.status=='not-writing'){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'not-writing',message:messageArray.chat_section_name,group_chat_id:messageArray.id_receiver,id_user_writing:id_user}]));
                    }
                  }
                }
              }
              
            }
            else if(messageArray.status=='emoji'){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'emoji',message:messageArray,group_chat_id:messageArray.id_receiver,id_message:messageArray.id_message}]));
                    }
                  }
                }
              }
            }
            else if(messageArray.status=="delete_message" ){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'delete_message',message:messageArray,group_chat_id:messageArray.id_receiver,id_message:messageArray.id_message,id_user_writing:id_user}]));
                    }
                  }
                }
              }
            }
            else if(messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  messageArray.status!='emoji'){
      
             
                var toUserWebSocket = webSockets[id_friend];
                    chat_seq.list_of_messages.create({
                      "id_user_name":messageArray.id_user_name,
                      "id_receiver": id_group,
                      "id_user":messageArray.id_user,
                      "message":messageArray.message,
                      "list_of_names_added":(messageArray.list_of_names_added)?messageArray.list_of_names_added:null,
                      "is_from_server":messageArray.is_from_server,
                      "attachment_name":messageArray.attachment_name,
                      "is_an_attachment":messageArray.is_an_attachment,
                      "size":(messageArray.size)?(messageArray.size).toString():null,
                      "attachment_type":messageArray.attachment_type,
                      "is_a_response":messageArray.is_a_response,
                      "id_message_responding":messageArray.id_message_responding,
                      "id_chat_section":messageArray.id_chat_section,
                      "message_responding_to":messageArray.message_responding_to,
                      "is_a_group_chat":messageArray.is_a_group_chat,
                      "status":'received',
                      "list_of_users_who_saw":[messageArray.id_user],
                      "list_of_users_in_the_group":list_of_receivers,
                    }).then(r =>  {
                      chat_seq.list_of_chat_friends.findOne({
                        where: {
                          is_a_group_chat:true,
                          id_receiver:id_group,
                        }
                      }).then(friend=>{
                        var now = new Date();
                        friend.update({
                          "date":now,
                        }).then(s=>{
                            if (toUserWebSocket && toUserWebSocket.length>0) {
                              
                              for(let i=0;i<toUserWebSocket.length;i++){
                                toUserWebSocket[i].send(JSON.stringify([{
                                  "id":r.id,
                                  "user_name":(messageArray.user_name)?messageArray.user_name:null,
                                  "list_of_names_added":(messageArray.list_of_names_added)?messageArray.list_of_names_added:null,
                                  "id_receiver":id_friend,
                                  "id_user":id_group,
                                  "real_id_user":messageArray.id_user,
                                  "message":messageArray.message,
                                  "is_from_server":messageArray.is_from_server,
                                  "attachment_name":messageArray.attachment_name,
                                  "size":(messageArray.size)?(messageArray.size).toString():null,
                                  "is_a_response":messageArray.is_a_response,
                                  "id_message_responding":messageArray.id_message_responding,
                                  "message_responding_to":messageArray.message_responding_to,
                                  "id_chat_section":messageArray.id_chat_section,
                                  "is_an_attachment":messageArray.is_an_attachment,
                                  "attachment_type":messageArray.attachment_type,
                                  "is_a_group_chat":messageArray.is_a_group_chat,
                                  "list_of_users_who_saw":messageArray.list_of_users_who_saw,
                                  "list_of_users_in_the_group":list_of_receivers,
                                  "group_name":(messageArray.group_name)?messageArray.group_name:null,
                                }]));
                              }
                            }
                            if(!messageArray.is_from_server){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                              }
                             
                            }
                            if(messageArray.is_from_server && messageArray.message=='New'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='New_friend_in_the_group'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new_friend_in_the_group', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='new_section'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'new_section', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            
                            

                            for(let k=1;k<list_of_receivers.length;k++){
                              if(list_of_receivers[k]!=userID && list_of_receivers[k]!=id_friend){
                                const toUserWebSocket1 = webSockets[list_of_receivers[k]];
                                const id_friend1=list_of_receivers[k];
                                send_message_to_friends_of_group1(toUserWebSocket1,id_friend1,k)
                              }
                            }
                        })
                      })
                    }); 
                

                function send_message_to_friends_of_group1(toUserWebSocket1,id_friend1,k){
                  chat_seq.list_of_messages.findOne({
                    where:{
                      id_receiver:id_group,
                      id_user:messageArray.id_user,
                      message:messageArray.message,
                      is_from_server:messageArray.is_from_server,
                      attachment_name:(messageArray.attachment_name)?messageArray.attachment_name:null,
                      size:(messageArray.size)?(messageArray.size).toString():null,
                      is_a_response:messageArray.is_a_response,
                      id_message_responding:(messageArray.id_message_responding)?messageArray.id_message_responding:null,
                      message_responding_to:(messageArray.message_responding_to)?messageArray.message_responding_to:null,
                      id_chat_section:messageArray.id_chat_section,
                      is_an_attachment:messageArray.is_an_attachment,
                      attachment_type:(messageArray.attachment_type)?messageArray.attachment_type:null,
                      is_a_group_chat:messageArray.is_a_group_chat,
                      status:'received',
                    }
                  }).then(message=>{
                      chat_seq.list_of_chat_friends.findOne({
                        where: {
                          is_a_group_chat:true,
                          id_receiver:id_group,
                        }
                      }).then(friend=>{
                        var now = new Date();
                        friend.update({
                          "date":now,
                        }).then(s=>{
                            if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                              
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{
                                  "id":message.id,
                                  "id_receiver":id_friend1,
                                  "user_name":(messageArray.user_name)?messageArray.user_name:null,
                                  "list_of_names_added":(messageArray.list_of_names_added)?messageArray.list_of_names_added:null,
                                  "id_user":id_group,
                                  "real_id_user":messageArray.id_user,
                                  "message":messageArray.message,
                                  "is_from_server":messageArray.is_from_server,
                                  "attachment_name":messageArray.attachment_name,
                                  "size":(messageArray.size)?(messageArray.size).toString():null,
                                  "is_a_response":messageArray.is_a_response,
                                  "id_message_responding":messageArray.id_message_responding,
                                  "message_responding_to":messageArray.message_responding_to,
                                  "id_chat_section":messageArray.id_chat_section,
                                  "is_an_attachment":messageArray.is_an_attachment,
                                  "attachment_type":messageArray.attachment_type,
                                  "is_a_group_chat":messageArray.is_a_group_chat,
                                  "group_name":(messageArray.group_name)?messageArray.group_name:null,
                                  "list_of_users_who_saw":messageArray.list_of_users_who_saw,
                                  "list_of_users_in_the_group":list_of_receivers,
                                }]));
                              }
                            }
                        })
                      })
                  
                  })
                  
                }
              
          
            }
            else{
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID ){
                  const toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  if(toUserWebSocket1 && toUserWebSocket1.length>0){
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([messageArray]));
                    }
                  }
                }
              }
             
            }
        }
      })
      
    }
    
    return false;

  });




  ws.on('close', function () {
    date_of_webSockets_last_connection[userID]=new Date();
    if(webSockets[userID] && webSockets[userID].length>0){
      let index=-1;
      for(let i=0;i<webSockets[userID].length;i++){
        if(webSockets[userID][i]==ws){
          index=i
        }
      }
      webSockets[userID].splice(index,1);
      if(webSockets[userID].length==0){
        let now = new Date();
	      let deconnexion_time = now.toString();
        db.users_connexions.update(
          {
          "deconnexion_time":deconnexion_time
        },{
          where:{
            id_user:userID,
            status:"websocket",
          }
        })
        delete webSockets[userID];
        
      }
    }
    clearInterval(interval);
    
  })


  let interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        
        if (!ws.isAlive){
          return ws.terminate();
        } 
        ws.isAlive = false;
        ws.ping(null, false, (err)=>{});
    });
  }, 30000);


  
});

function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};


app.post('/get_users_connected_in_the_chat', function(req, res) {
  let current_user = get_current_user(req.cookies.currentUser);
  let send_web=false;
  if(current_user!=1 && current_user!=2){
    if( !req.headers['authorization'] ) {
      return res.status(401).json({msg: "error"});
    }
    else {
      let val=req.headers['authorization'].replace(/^Bearer\s/, '')
      let user= get_current_user(val)
      if(!user){
        return res.status(401).json({msg: "error"});
      }
    }
  }
  else{
    send_web=true
   
  }
  let list_of_friends=req.body.list_of_friends
  let list_of_users_connected=[];
  let list_of_users_connected_only=[]
  for(let i=0;i<list_of_friends.length;i++){
    if(webSockets[(list_of_friends[i]).toString()]){
      list_of_users_connected[i]=true;
      list_of_users_connected_only.push(list_of_friends[i])
    }
    else{
      list_of_users_connected[i]=false;
    }
  }
  const Op = Sequelize.Op;
  db.users_connexions.findAll({
    attributes: [
        [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'max'],'id_user','status','nickname','deconnexion_time',
      
    ],
    group:['id_user','status','nickname','deconnexion_time'],
    where:{
      [Op.and]:[{id_user: list_of_friends},{id_user:{[Op.notIn]: list_of_users_connected_only}}],
      status:"websocket",
      deconnexion_time:{[Op.not]: null}
    }
  }).then(friends=>{
    if(send_web){
      res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection,list:Object.keys(webSockets),deconnected_friends:friends}])
    }
    else{
      res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection,deconnected_friends:friends}])
    }
  })
  
 
})


//Ouverture du server
const port = process.env.PORT || 4600;
server.listen(port, (req,res)=> {
    console.log(`server http/ws running on port ${port} `);
 });


