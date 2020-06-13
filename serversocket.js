let WSServer = require('ws').Server;
let server = require('http').createServer();
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
waiting_messages_list={}

wss.on('connection', (ws, req)=>{
  ws.isAlive = true;
  ws.on('pong', () => {
    console.log("pong");
      ws.isAlive = true;
  });
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
    if(messageArray.status!='seen'){
      function send_message_to_friend(){
        chat_seq.list_of_messages.create({
          "id_receiver": messageArray.id_receiver,
          "id_user":messageArray.id_user,
          "message":messageArray.message,
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
                if (toUserWebSocket) {
                  console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                  messageArray[0] = userID
                  toUserWebSocket.send(JSON.stringify([messageArray]));
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'received'}]));
              })
            }
            else{
              chat_seq.list_of_chat_friends.create({
                "id_user":messageArray.id_user,
                "id_receiver":messageArray.id_receiver,
                "date":now,
              }).then(t=>{
                if (toUserWebSocket) {
                  console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                  messageArray[0] = userID
                  toUserWebSocket.send(JSON.stringify([messageArray]));
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'received'}]));
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
          "status":'received',
        })
        .then(r =>  {
          chat_seq.list_of_chat_spams.findOne({
            where: {
              id_user:messageArray.id_user,
              id_receiver:messageArray.id_receiver,
            }
          }).then(friend=>{
            var now = new Date();
            if(friend){
              friend.update({
                "date":now,
              }).then(s=>{
                if (toUserWebSocket) {
                  console.log('sent to ' + messageArray.id_receiver + ': ' + JSON.stringify(messageArray))
                  messageArray[0] = userID
                  toUserWebSocket.send(JSON.stringify([messageArray]));
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'received'}]));
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
                  messageArray[0] = userID
                  toUserWebSocket.send(JSON.stringify([messageArray]));
                }
                ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'received'}]));
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
      toUserWebSocket.send(JSON.stringify([messageArray]));
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
          console.log("il y a un problème de co")
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


