let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./serverexpress');
const url = require('url');
const chat_seq= require('./chat/model/sequelize');
const subscribings_seq= require('./p_subscribings_archives_contents/model/sequelize');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const db = require('./authentication/db.config');
var geoip = require('geoip-lite');
var nodemailer = require('nodemailer');
// Create web socket server on top of a regular http server
let wss = new WSServer({
  server: server,
});

// Also mount the app here
server.on('request', app);
webSockets = {} // userID: webSocket
date_of_webSockets_last_connection={}
date_of_webSockets_last_connection_ddos={};
date_of_webSockets_last_message={};
wss.on('connection', (ws, req)=>{
  if(req.headers.origin !='https://www.linkarts.fr'){
    return   ws.send(JSON.stringify([{not_allowed:"you are not allowed to connect here"}]));
  }
  ws.isAlive = true;
  ws.on('pong', () => {
      ws.isAlive = true;
  });
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
        let ip=null;
    let lat =null;
    let long=null;
    let area=null;
    let country=null;
    let region=null;
    if( req.rawHeaders && req.rawHeaders[1]){
        ip=req.rawHeaders[1]
        var geo;
        if(ip && !ip.includes("linkarts")){
          geo = geoip.lookup(ip);
          if(geo){
            lat=geo.ll[0].toString();
            long=geo.ll[1].toString();
            area=geo.area.toString();
            country=geo.country;
            region=geo.region;
          }
        }
    };
    db.users_connexions.create({
      "id_user":userID,
      "ip":ip,
      "latitude":lat,
      "longitude":long,
      "area":area,
      "country":country,
      "region":region,
      "nickname":user.nickname,
      "connexion_time":connexion_time,
      "status":"websocket",
    })
  })
  ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));

  ws.on('message', function incoming(message) {
    let date = new Date();
    let speed_limit=10;
        var messageArray = JSON.parse(message);
    if(messageArray.status!="not-writing"){
      if(date_of_webSockets_last_message[userID] && (date.getTime() - date_of_webSockets_last_message[userID].getTime())<speed_limit){
        return false;
      }
      date_of_webSockets_last_message[userID]=date;
    }
    ws.send(JSON.stringify([{id_user:"server",id_receiver:userID, message:'Hi there'}]));
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
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'writing',message:messageArray.chat_se>
          }

        }
      }

      else if(messageArray.status=='not-writing'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'not-writing',message:messageArray.cha>
          }
        }
      }
      else if(messageArray.status=='block'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'block',message:messageArray.chat_sect>
          }
        }
      }
      else if(messageArray.status=='emoji'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'emoji',message:messageArray,real_id_u>
          }
        }
      }
      else if(messageArray.status=="delete_message" ){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'delete_message',message:messageArray,>
          }

        }
      }
      else if(messageArray.status=='abort_contract'){
        if (toUserWebSocket && toUserWebSocket.length>0) {
          for(let i=0;i<toUserWebSocket.length;i++){
            toUserWebSocket[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend, is_from_server:true, server_message:'abort_contract',message:messageArray,>
          }
        }
      }
      else if(messageArray.status!='abort_contract'  && messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  messag>

        /*****************************************TO A FRIEND *************************/
    /*****************************************TO A FRIEND *************************/
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
           "chat_friend_id":messageArray.chat_friend_id,
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
                          "chat_id":messageArray.chat_id,
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
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received'>
                      }


                    }
                    if(messageArray.is_from_server){
                      // for new contacts
                      // pas de new for friends
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:mess>
                      }
                    }
                  }
                  else{
                    // pour moi meme
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', >
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
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received'>
                      }

                    }
                    if(messageArray.is_from_server){
                      let toUserWebSocket1= webSockets[userID];
                      for(let i=0;i<toUserWebSocket1.length;i++){
                        toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:userID, is_from_server:true, server_message:'received_new', message:mess>
                      }
                    }
                  }
                  else{
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', >
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
           "chat_friend_id":messageArray.chat_friend_id,
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
                        "to_spam":true,
                        "chat_id":messageArray.chat_id,
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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', >
                    }

                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_ne>
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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received', >
                    }

                  }
                  if(messageArray.is_from_server){
                    let toUserWebSocket1= webSockets[userID];
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'received_ne>
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
                where:{
                  id_user:id_friend,
                  createdAt: {[Op.gte]: yesterday}
                }
              }).then(r=>{
                if(!r){
                  chat_seq.list_of_chat_emails.findOne({
                    where:{
                      id_user:id_user,
                      id_receiver:id_friend,
                      createdAt: {[Op.gt]: yesterday}
                    }
                  }).then(email=>{
                    if(!email){
                      chat_seq.list_of_chat_emails.create({
                        "id_user":id_user,
                        "id_receiver":id_friend,
                        "status":"friend",
                      })

                      db.users.findOne({
                        where:{
                          id:id_friend,
                        }

                      }).then(user_found=>{
                         if(user_found && user_found.email_authorization!="false"){
                        let name = user_found.firstname;
                         let  text=`${name},`



                          let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neu>
                          mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
                            mail_to_send+=`
                            <table style="width:100%">


                                <tr id="tr2" >
                                    <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                                        <div style="height:1px;width:20px;background:white;"></div>
                                        <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Messagerie</p>
                                    </td>
                                </tr>
                            </table>`;


                            mail_to_send+=`
                            <table style="width:100%;margin:0px auto;">
                              <tr id="tr3">

                                  <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px >
                                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${text}</p>
                                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Vous venez de re>
                                      <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Cliquez sur le b>

                                      <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                          <a href="https://www.linkarts.fr/account/for_chat/${user_found.nickname}/${user_found.id}/${messageArray.id_user_name}/${id_u>
                                              Accéder à la messagerie
                                          </a>
                                      </div>
                                        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèreme>
                                                                <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-t>
                                      <img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="40" style="height:40px;max-height: 40px;float: left;margin>
                                  </td>

                              </tr>
                            </table>`

                            mail_to_send+=`
                            <table style="width:100%;margin:25px auto;">
                                <tr id="tr4">
                                    <td align="center">
                                        <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                                        <p style="margin: 10px auto 5px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la c>
                                        <a style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;" href="https://www.linkarts.fr/acc>
                                    </td>

                                </tr>
                            </table>`

                          mail_to_send+='</div>'
                          mail_to_send+='</div>'


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
                            to:user_found.email,
                            bcc:"appaloosa-adam@hotmail.fr",
                            subject: `Messagerie`, // Subject line
                            html:mail_to_send , // html body
                          };
                          transport.sendMail(mailOptions, (error, info) => {

                          })
                        }
                      })
                    }
                  })
                }
                send_message_to_friend();

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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'writing',message:messageA>
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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'not-writing',message:mess>
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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'emoji',message:messageArr>
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
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'delete_message',message:m>
                    }
                  }
                }
              }
            }
            else if(messageArray.status=='abort_contract'){
              for(let k=0;k<list_of_receivers.length;k++){
                if(list_of_receivers[k]!=userID){
                  var toUserWebSocket1 = webSockets[list_of_receivers[k]];
                  const id_friend1=list_of_receivers[k];
                  if (toUserWebSocket1 && toUserWebSocket1.length>0) {
                    for(let i=0;i<toUserWebSocket1.length;i++){
                      toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:id_friend1, is_from_server:true, server_message:'abort_contract',message:m>
                    }
                  }
                }
              }

            }
            else if(messageArray.status!='abort_contract' && messageArray.status!='seen' && messageArray.status!='writing'  && messageArray.status!='not-writing' &&  m>

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
                      "chat_friend_id":messageArray.chat_friend_id,
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
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'r>
                              }

                            }
                            if(messageArray.is_from_server && messageArray.message=='New'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'r>
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='New_friend_in_the_group'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'r>
                              }
                            }
                            if(messageArray.is_from_server && messageArray.message=='new_section'){
                              let toUserWebSocket1= webSockets[userID];
                              for(let i=0;i<toUserWebSocket1.length;i++){
                                toUserWebSocket1[i].send(JSON.stringify([{id_user:"server",id_receiver:messageArray.id_receiver, is_from_server:true, server_message:'n>
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
                                  "chat_id":message.chat_id,
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

  });

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
        [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'max'],'id_user','status','deconnexion_time',

    ],
    group:['id_user','status','deconnexion_time'],
    where:{
            [Op.and]:[{id_user: list_of_friends},{id_user:{[Op.notIn]: list_of_users_connected_only}}],
      status:"websocket",
      deconnexion_time:{[Op.not]: null}
    }
  }).then(friends=>{
    if(send_web){
      let number_of_80s=0;
      if(webSockets[80]){
        number_of_80s=webSockets[80].length;
      }
      res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection,list:Object.keys(web>
    }
    else{
      res.status(200).send([{list_of_users_connected:list_of_users_connected,date_of_webSockets_last_connection:date_of_webSockets_last_connection,deconnected_friends:>
    }
  })


})

//Ouverture du server
const port = process.env.PORT || 4600;
server.listen(port, (req,res)=> {
    console.log(`server http/ws running on port ${port} `);
 });




                                                                          
