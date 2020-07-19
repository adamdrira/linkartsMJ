let WSServer = require('ws').Server;
let server = require('http').createServer();
let multer= require('multer');
let app = require('./serverexpress');
const url = require('url');
const chat_seq= require('./chat/model/sequelize');
const subscribings_seq= require('./p_subscribings_archives_contents/model/sequelize');
const Sequelize = require('sequelize');

// Create web socket server on top of a regular http server
let wss = new WSServer({
  server: server,
});

// Also mount the app here
server.on('request', app);
webSockets = {} // userID: webSocket

wss.on('connection', (ws, req)=>{
  ws.isAlive = true;
  ws.on('pong', () => {
    console.log("pong");
      ws.isAlive = true;
  });
  console.log(url.parse(req.url))
  var userID = parseInt(url.parse(req.url).query.substring(3));
  webSockets[userID] = ws;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(webSockets));

 
  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
    
  ws.on('message', function incoming(message) {


    console.log('received from ' + userID + ': ' + message)
    var messageArray = JSON.parse(message);
    var toUserWebSocket = webSockets[parseInt(messageArray.id_receiver)];
    const Op = Sequelize.Op;
    const id_user=messageArray.id_user;
    const id_friend=messageArray.id_receiver;
    if(messageArray.status=="writing" ){
      if (toUserWebSocket) {
        console.log("sending writing");
        toUserWebSocket.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'writing',message:messageArray.chat_section_name}]));
      }
    }
    if(messageArray.status=='not-writing'){
      if (toUserWebSocket) {
        console.log("sending writing");
        toUserWebSocket.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'not-writing',message:messageArray.chat_section_name}]));
      }
    }

    if(messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing'){

      
      function send_message_to_friend(){
        chat_seq.list_of_messages.create({
          "id_receiver": messageArray.id_receiver,
          "id_user":messageArray.id_user,
          "message":messageArray.message,
          "is_from_server":messageArray.is_from_server,
          "attachment_name":messageArray.attachment_name,
          "size":messageArray.size,
          "is_a_response":messageArray.is_a_response,
          "id_message_responding":messageArray.id_message_responding,
          "message_responding_to":messageArray.message_responding_to,
          "id_chat_section":messageArray.id_chat_section,
          "is_an_attachment":messageArray.is_an_attachment,
          "attachment_type":messageArray.attachment_type,
          "status":'received',
        })
        .then(r =>  {
          chat_seq.list_of_chat_friends.findOne({
            where: {
              [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
            }
          }).then(friend=>{
            var now = new Date();
            if(friend){
              friend.update({
                "date":now,
              }).then(s=>{
                if(messageArray.id_user!=messageArray.id_receiver){
                  if (toUserWebSocket) {
                    console.log("sending message to websocket open");
                    console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                    toUserWebSocket.send(JSON.stringify([{
                      "id":r.id,
                      "id_receiver": messageArray.id_receiver,
                      "id_user":messageArray.id_user,
                      "message":messageArray.message,
                      "is_from_server":messageArray.is_from_server,
                      "attachment_name":messageArray.attachment_name,
                      "size":messageArray.size,
                      "is_a_response":messageArray.is_a_response,
                      "id_message_responding":messageArray.id_message_responding,
                      "message_responding_to":messageArray.message_responding_to,
                      "id_chat_section":messageArray.id_chat_section,
                      "is_an_attachment":messageArray.is_an_attachment,
                      "attachment_type":messageArray.attachment_type,
                    }]));
                  }
                  if(!messageArray.is_from_server || messageArray.is_from_server==null){
                    console.log("send back message with received")
                    console.log(messageArray);
                    ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                  }
                  if(messageArray.is_from_server){
                    console.log("on renvoie un autre message");
                    console.log(messageArray)
                    ws.send(JSON.stringify([{
                      "id":r.id,
                      "id_receiver": messageArray.id_receiver,
                      "id_user":messageArray.id_user,
                      "message":messageArray.message,
                      "size":messageArray.size,
                      "is_from_server":messageArray.is_from_server,
                      "attachment_name":messageArray.attachment_name,
                      "is_a_response":messageArray.is_a_response,
                      "id_message_responding":messageArray.id_message_responding,
                      "message_responding_to":messageArray.message_responding_to,
                      "is_an_attachment":messageArray.is_an_attachment,
                      "status":'received',
                    }]));
                  }
                }
                else{
                  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                }
               
              })
            }
            else{
              console.log("on créé l'ami")
              chat_seq.list_of_chat_friends.create({
                "id_user":messageArray.id_user,
                "id_receiver":messageArray.id_receiver,
                "date":now,
              }).then(t=>{
                if(messageArray.id_user!=messageArray.id_receiver){
                  if (toUserWebSocket) {
                    console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                    toUserWebSocket.send(JSON.stringify([{
                      "id":r.id,
                      "id_receiver": messageArray.id_receiver,
                      "id_user":messageArray.id_user,
                      "message":messageArray.message,
                      "is_from_server":messageArray.is_from_server,
                      "attachment_name":messageArray.attachment_name,
                      "size":messageArray.size,
                      "is_a_response":messageArray.is_a_response,
                      "id_message_responding":messageArray.id_message_responding,
                      "message_responding_to":messageArray.message_responding_to,
                      "id_chat_section":messageArray.id_chat_section,
                      "is_an_attachment":messageArray.is_an_attachment,
                      "attachment_type":messageArray.attachment_type,
                    }]));
                  }
                  if(!messageArray.is_from_server || messageArray.is_from_server==null){
                    console.log("send back message with received")
                    console.log(messageArray);
                    ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                  }
                  if(messageArray.is_from_server){
                    console.log("on renvoie un autre message");
                    console.log(messageArray)
                    ws.send(JSON.stringify([{
                      "id":r.id,
                      "id_receiver": messageArray.id_receiver,
                      "id_user":messageArray.id_user,
                      "message":messageArray.message,
                      "is_from_server":messageArray.is_from_server,
                      "attachment_name":messageArray.attachment_name,
                      "is_an_attachment":messageArray.is_an_attachment,
                      "is_a_response":messageArray.is_a_response,
                      "id_message_responding":messageArray.id_message_responding,
                      "message_responding_to":messageArray.message_responding_to,
                      "size":messageArray.size,
                      "status":'received',
                    }]));
                  }
                }
                else{
                  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
                }
                
              })
            }
          })
        }); 
      }
      
      function send_message_to_spam(){
        chat_seq.list_of_messages.create({
          "id_receiver": messageArray.id_receiver,
          "id_user":messageArray.id_user,
          "message":messageArray.message,
          "attachment_name":messageArray.attachment_name,
          "is_an_attachment":messageArray.is_an_attachment,
          "size":messageArray.size,
          "attachment_type":messageArray.attachment_type,
          "is_a_response":messageArray.is_a_response,
          "id_message_responding":messageArray.id_message_responding,
          "id_chat_section":messageArray.id_chat_section,
          "message_responding_to":messageArray.message_responding_to,
          "status":'received',
        })
        .then(r =>  {
          chat_seq.list_of_chat_spams.findOne({
            where: {
              id_user:messageArray.id_user,
              id_receiver:messageArray.id_receiver,
            }
          }).then(spam=>{
            var now = new Date();
            if(spam){
              spam.update({
                "date":now,
              }).then(s=>{
                if (toUserWebSocket) {
                  console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                  toUserWebSocket.send(JSON.stringify([{
                    "id":r.id,
                    "id_receiver": messageArray.id_receiver,
                    "id_user":messageArray.id_user,
                    "message":messageArray.message,
                    "is_from_server":messageArray.is_from_server,
                    "attachment_name":messageArray.attachment_name,
                    "size":messageArray.size,
                    "is_a_response":messageArray.is_a_response,
                    "id_message_responding":messageArray.id_message_responding,
                    "message_responding_to":messageArray.message_responding_to,
                    "id_chat_section":messageArray.id_chat_section,
                    "is_an_attachment":messageArray.is_an_attachment,
                    "attachment_type":messageArray.attachment_type,
                  }]));;
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message:r.id}]));
              })
            }
            else{
              chat_seq.list_of_chat_spams.create({
                "id_user":messageArray.id_user,
                "id_receiver":messageArray.id_receiver,
                "date":now,
              }).then(t=>{
                if (toUserWebSocket) {
                  console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                  toUserWebSocket.send(JSON.stringify([{
                    "id":r.id,
                    "id_receiver": messageArray.id_receiver,
                    "id_user":messageArray.id_user,
                    "message":messageArray.message,
                    "is_from_server":messageArray.is_from_server,
                    "attachment_name":messageArray.attachment_name,
                    "size":messageArray.size,
                    "is_a_response":messageArray.is_a_response,
                    "id_message_responding":messageArray.id_message_responding,
                    "message_responding_to":messageArray.message_responding_to,
                    "id_chat_section":messageArray.id_chat_section,
                    "is_an_attachment":messageArray.is_an_attachment,
                    "attachment_type":messageArray.attachment_type,
                  }]));(JSON.stringify([messageArray]));
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received', message:messageArray, id_message}]));
              })
            }
          })
        }); 
      }


    if(id_friend==id_user){
      send_message_to_friend();
    } 
    else{
      chat_seq.list_of_chat_friends.findOne({
        where: {
          [Op.and]:[ {[Op.or]:[(id_friend!=id_user) ? {id_user:id_friend}:{id_user:id_user},(id_friend!=id_user) ? {id_receiver:id_friend}:{id_user:id_user} ]},{[Op.or]:[(id_friend!=id_user) ? {id_user:id_user}:{id_receiver:id_user},(id_friend!=id_user) ? {id_receiver:id_user}:{id_receiver:id_user}]}],      
        }
      }).then( friend=>{
        console.log("here")
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
      if(toUserWebSocket){
        toUserWebSocket.send(JSON.stringify([messageArray]));
      }
    }
  });



  function check_if_user_is_sub(id_user,id_receiver) {
    
    
};

  ws.on('close', function () {
    clearInterval(interval);
    delete webSockets[userID];
    console.log('deleted: ' + userID);
  })


  let interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        
        if (!ws.isAlive){
          console.log(getKeyByValue(webSockets),ws);
          console.log("déconnexion")
          return ws.terminate();
        } 
        ws.isAlive = false;
        ws.ping(null, false, true);
        console.log("ping");
    });
  }, 10000);

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  
});




//Ouverture du server
const port = process.env.PORT || 4600;
server.listen(port, (req,res)=> {
    console.log(`server http/ws running on port ${port} `);
 });


