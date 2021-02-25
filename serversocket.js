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
  console.log("user is connected")
  console.log(url.parse(req.url))
  console.log(req.headers.origin )
  if(req.headers.origin !='http://localhost:4200'){
    return   ws.send(JSON.stringify([{not_allowed:"you are not allowed to connect here"}]));
  }
  //console.log(req.headers.origin[0] )
  var userID = parseInt(url.parse(req.url).query.substring(3));
  let date1 = new Date();
  let speed_limit1=10;
  if(date_of_webSockets_last_connection_ddos[userID] && (date1.getTime() - date_of_webSockets_last_connection_ddos[userID].getTime())<speed_limit1){
    return false;
  }
  date_of_webSockets_last_connection_ddos[userID]=date1;
  if(!webSockets[userID] || !(webSockets[userID].length>0) ){
    console.log("create list and ws")
    webSockets[userID] = [ws];
    
  }
  else{
    console.log("push ws")
    webSockets[userID].push(ws);
    

    
  }

  console.log(Object.keys(webSockets))
  //console.log(webSockets[userID])
  
  console.log('connected: ' + userID + ' number ' + webSockets[userID].length + ' in ' + Object.getOwnPropertyNames(webSockets));
  let now = new Date();
	let connexion_time = now.toString();
  db.users_connexions.create({
    "id_user":userID,
    "connexion_time":connexion_time,
    "deconnexion_time":"websocket",
  })
 
  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
    
  ws.on('message', function incoming(message) {


    console.log('received from ' + userID + ': ' + message)
    var messageArray = JSON.parse(message);
    let date = new Date();
    let speed_limit=10;
    if(date_of_webSockets_last_message[userID] && (date.getTime() - date_of_webSockets_last_message[userID].getTime())<speed_limit){
      return false;
    }
    date_of_webSockets_last_message[userID]=date;
    console.log("messageArray")
    ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
    if(messageArray.for_notifications){


      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/
      /***************************************** NOTIFICATIONS *************************/

      console.log("sending notification for subscribers")
      //for groupe creation
      if(messageArray.list_of_receivers){
        for(let i=0;i<messageArray.list_of_receivers.length;i++){
          var toUserWebSocket = webSockets[messageArray.list_of_receivers[i]];
          if (toUserWebSocket && toUserWebSocket.length>0) {
            console.log("sending notification group creation");
            for(let i=0;i<toUserWebSocket.length;i++){
              console.log("notificaiton sent to " + messageArray.list_of_receivers[i])
              toUserWebSocket[i].send(JSON.stringify([messageArray]));
            }
          } 
        }
      }
      else if(messageArray.id_receiver){
          var toUserWebSocket = webSockets[messageArray.id_receiver];
          if (toUserWebSocket && toUserWebSocket.length>0) {
            console.log("sending notification");
            for(let i=0;i<toUserWebSocket.length;i++){
              console.log("notificaiton sent to " + messageArray.id_receiver)
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
                console.log(subscribers[i].id_user)
                var toUserWebSocket = webSockets[subscribers[i].id_user];
                if (toUserWebSocket && toUserWebSocket.length>0) {
                  console.log("sending notification");
                  for(let i=0;i<toUserWebSocket.length;i++){
                    console.log("notificaiton sent to " + subscribers[i].id_user)
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
      console.log("SEND MESSAGE TO A USER")
       /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      /*****************************************SEND MESSAGE TO A USER  *************************/
      var toUserWebSocket = webSockets[parseInt(messageArray.id_receiver)];
      
      
      console.log("web here")
      const Op = Sequelize.Op;
      const id_user=messageArray.id_user;
      const id_friend=messageArray.id_receiver;
      if(messageArray.status=="writing" ){
        console.log("send writing");
        if (toUserWebSocket && toUserWebSocket.length>0) {
          console.log("sending writing");
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'writing',message:messageArray.chat_section_name,id_user_writing:id_user}]));
          }
         
        }
      }
      
      else if(messageArray.status=='not-writing'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          console.log("sending writing");
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'not-writing',message:messageArray.chat_section_name,id_user_writing:id_user}]));
          }
        }
      }
      else if(messageArray.status=='block'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          console.log("sending writing");
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'block',message:messageArray.chat_section_name,id_user_blocking:id_user}]));
          }
        }
      }
      else if(messageArray.status=='emoji'){
        console.log("messageArray.status=='emoji 1'")
        if (toUserWebSocket && toUserWebSocket.length>0) {
          console.log("sending writing");
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'emoji',message:messageArray,real_id_user:id_user}]));
          }
        }
      }
      else if(messageArray.status=="delete_message" ){
        console.log("send delete_message");
        if (toUserWebSocket && toUserWebSocket.length>0) {
          console.log("sending delete_message");
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'delete_message',message:messageArray,id_user_writing:id_user,id_message:messageArray.id_message}]));
          }
         
        }
      }
      else if(messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  messageArray.status!='emoji' && messageArray.status!='block'){

        /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/


        function send_message_to_friend(){
          console.log("send message to friend")
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
              console.log("friend found");
              
              var now = new Date();
              if(friend){
                console.log(friend.date)
                friend.update({
                  "date":now,
                }).then(s=>{
                  console.log(s.data)
                  if(messageArray.id_user!=messageArray.id_receiver){
                    if (toUserWebSocket && toUserWebSocket.length>0) {
                      console.log("sending message to websocket open");
                      console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
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
                      console.log("send back message with received")
                      console.log(messageArray);
                      let toUserWebSocket1= webSockets[userID];
                      console.log(toUserWebSocket1.length)
                      //console.log(ws)
                      let add_socket=true;
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        console.log(toUserWebSocket1[i]==ws)
                        console.log("sending back to each one")
                        //console.log(toUserWebSocket1[i])
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                      if(!add_socket){
                        console.log("add socket")
                        //webSockets[userID].push(ws);
                        //ws.send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                      
                      
                    }
                    if(messageArray.is_from_server){
                      // for new contacts
                      // pas de new for friends
                      console.log("on renvoie un autre message");
                      console.log(messageArray)
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        console.log("sending back to each one")
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                    }
                  }
                  else{
                    // pour moi meme
                    console.log("for myself")
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one of myself")
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user,real_id_user:messageArray.id_user}]));
                    }
                   
                  }
                
                })
              }
              else{
                console.log("on créé l'ami")
                chat_seq.list_of_chat_friends.create({
                  "id_user":messageArray.id_user,
                  "id_receiver":messageArray.id_receiver,
                  "is_a_group_chat":false,
                  "date":now,
                }).then(t=>{
                  if(messageArray.id_user!=messageArray.id_receiver){
                    if (toUserWebSocket  && toUserWebSocket.length>0) {
                      console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray));
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
                      console.log("send back message with received")
                      console.log(messageArray);
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        console.log("sending back to each one")
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                     
                    }
                    if(messageArray.is_from_server){
                      console.log("nimp, pas de new for friends")
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        console.log("sending back to each one")
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                      }
                    }
                  }
                  else{
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one of myself")
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
          console.log("send message to spam")
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
                    console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray));
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
                    console.log("send back message with received")
                    console.log(messageArray);
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one")
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                   
                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one")
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                  }
                
              }
              else if(!messageArray.is_from_server){
                console.log("creating spam")
                chat_seq.list_of_chat_spams.create({
                  "id_user":messageArray.id_user,
                  "id_receiver":messageArray.id_receiver,
                  "date":now,
                }).then(t=>{
                  if (toUserWebSocket && toUserWebSocket.length>0) {
                    console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray));
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
                    console.log("send back message with received")
                    console.log(messageArray);
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one")
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                    }
                   
                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      console.log("sending back to each one")
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                    }
                  }
                })
              }
            })
          }); 
        }


        if(id_friend==id_user){
          send_message_to_friend();
        } 
        else{
          console.log("check friends");
          console.log(id_friend);
          console.log(id_user)
          chat_seq.list_of_chat_friends.findOne({
            where: {
              is_a_group_chat:{[Op.not]: true},
              [Op.or]:[ {[Op.and]:[{id_user:id_user},{id_receiver:id_friend} ]},{[Op.and]:[{id_receiver:id_user}, {id_user:id_friend}]}],           
            }
          }).then( friend=>{
            console.log("here")
            console.log("first friend found afte chat fiend search")
            if(friend){
              console.log("true");
              send_message_to_friend();
            }
            else{
              console.log("false");
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
      }
      else{
        //for seen
        console.log("sending seen or new")
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
            console.log("id friend");
            console.log(list_of_receivers)
            console.log(id_friend)
            console.log(userID)
            if(messageArray.status=="writing" ){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    console.log("sending writing group");
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
                    console.log("sending not writing group ");
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'not-writing',message:messageArray.chat_section_name,group_chat_id:messageArray.id_receiver,id_user_writing:id_user}]));
                    }
                  }
                }
              }
              
            }
            else if(messageArray.status=='emoji'){
              console.log("messageArray.status=='emoji'")
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    console.log("sending emoji change ");
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
                    console.log("sending  delete_message ");
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'delete_message',message:messageArray,group_chat_id:messageArray.id_receiver,id_message:messageArray.id_message,id_user_writing:id_user}]));
                    }
                  }
                }
              }
            }
            else if(messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  messageArray.status!='emoji'){
      
              console.log("sending message not seen,writ")
              console.log(messageArray)
              
                var toUserWebSocket = webSockets[id_friend];
                console.log("send_message_to_friends_of_group first")
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
                                console.log("sending message to the first user now")
                                console.log(id_friend)
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
                              console.log(id_group)
                              console.log("sending message to websocket open group");
                              console.log('sent to ' + id_friend + ': ' + JSON.stringify(messageArray));
                            }
                            if(!messageArray.is_from_server){
                              console.log("send back message with received")
                              console.log(messageArray);
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                console.log("sending back to each one")
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                              }
                             
                            }
                            if(messageArray.is_from_server && messageArray.message=='New'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                console.log("sending back to each one of the user")
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='New_friend_in_the_group'){
                              console.log("New_friend_in_the_group")
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                console.log("sending back to each one of the user")
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_new_friend_in_the_group', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='new_section'){
                              console.log("new_section")
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                console.log("sending back to each one of the user")
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'new_section', message:messageArray, id_message:r.id,real_id_user:messageArray.id_user}]));
                              }
                            }
                            
                            

                            for(let k=1;k<list_of_receivers.length;k++){
                              if(list_of_receivers[k]!=userID && list_of_receivers[k]!=id_friend){
                                const toUserWebSocket1 = webSockets[list_of_receivers[k]];
                                const id_friend1=list_of_receivers[k];
                                console.log("id_friend1 receiving message")
                                console.log(id_friend1)
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
                                console.log("sending message to the other user")
                                console.log(list_of_receivers[k])
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
                              console.log(id_group)
                              console.log("sending message to websocket open group");
                              console.log('sent to ' + id_friend1 + ': ' + JSON.stringify(messageArray));
                            }
                        })
                      })
                  
                  })
                  
                }
              
          
            }
            else{
              console.log("sending seen or new")
              console.log(messageArray)
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID ){
                  console.log(list_of_receivers[k])
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
    console.log("websocket close")
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
        delete webSockets[userID];
        
      }
    }
    clearInterval(interval);
    //delete webSockets[userID];
    console.log('deleted: ' + userID);
    if(webSockets[userID]){
      console.log(webSockets[userID].length)
    }
    
  })


  let interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        
        if (!ws.isAlive){
          //console.log(getKeyByValue(webSockets),ws);
          console.log("déconnexion")
          return ws.terminate();
        } 
        //ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
        ws.isAlive = false;
        ws.ping(null, false, (err)=>{});
    });
  }, 30000);

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  
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
  for(let i=0;i<list_of_friends.length;i++){
    if(webSockets[(list_of_friends[i]).toString()]){
      list_of_users_connected[i]=true;
    }
    else{
      list_of_users_connected[i]=false;
    }
  }
  if(send_web){
    res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection,list:Object.keys(webSockets)}])
  }
  else{
    res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection}])
  }
 
})


//Ouverture du server
const port = process.env.PORT || 4600;
console.log(process.env.NODE_ENV)
server.listen(port, (req,res)=> {
    console.log(`server http/ws running on port ${port} `);
 });


