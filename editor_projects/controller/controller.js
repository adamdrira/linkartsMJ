const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
var nodemailer = require('nodemailer');
module.exports = (router,list_of_projects, list_of_projects_responses,list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    router.post('/submit_project_for_editor', function (req, res) {

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
      const title=req.body.title;
      const category=req.body.category;
      const user_name=req.body.user_name;
      const user_verified=req.body.user_verified;
      const user_description=req.body.user_description;
      const user_nickname=req.body.user_nickname;
      const genres=req.body.genres;
      const target_id=req.body.target_id;
      const editor_name=req.body.editor_name;
      const editor_nickname=req.body.editor_nickname;
      const formula=req.body.formula;
      const price=req.body.price;
      const delay=req.body.delay;
      const likes=req.body.likes;
      const loves=req.body.loves;
      const views=req.body.views;
      const subscribers_number=req.body.subscribers_number;
      const number_of_visits=req.body.number_of_visits;
      const number_of_comics=req.body.number_of_comics;
      const number_of_drawings=req.body.number_of_drawings;
      const number_of_writings=req.body.number_of_writings;
      const number_of_ads=req.body.number_of_ads;
      const number_of_artpieces=req.body.number_of_artpieces;
      const file_name=req.body.file_name;
     
      let date=new Date()
      date.setDate(date.getDate() + delay);

      list_of_projects.create({
        "id_user": current_user,
        "user_verified":user_verified,
        "user_description":user_description,
        "delay_date":date,
        "user_name": user_name,
        "user_nickname": user_nickname,
        "title":title,
        "category": category,
        "genres":genres,
        "target_id":target_id,
        "editor_name":editor_name,
        "editor_nickname":editor_nickname,
        "formula":formula,
        "price":price,
        "delay":delay,
        "likes":likes,
        "loves": loves,
        "views": views,
        "subscribers_number":subscribers_number,
        "number_of_visits": number_of_visits,
        "number_of_comics":number_of_comics,
        "number_of_drawings": number_of_drawings,
        "number_of_writings": number_of_writings,
        "number_of_ads": number_of_ads,
        "number_of_artpieces": number_of_artpieces,
        "payement_status":"not_done",
        "responded":false,
        "project_name":file_name,
        "is_multiple":req.body.is_multiple?req.body.is_multiple:null,
        "id_multiple":req.body.id_multiple?req.body.id_multiple:null,
      }).catch(err => {
          console.log(err)
        res.status(500).json({msg: "error", details: err});		
      }).then(r =>  {

        list_of_users.findOne({
          where:{
            id:current_user,
          }
        }).catch(err => {
          console.log(err)
          res.status(500).json({msg: "error", details: err});		
        }).then(user =>  {
          if(user){
            let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
            mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
              mail_to_send+=`
              <table style="width:100%">
  
                  <tr id="tr2" >
                      <td  align="center" style="background: rgb(2, 18, 54);border-radius: 12px 12px 6px 6px">
                          <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                          <div style="height:1px;width:20px;background:white;"></div>
                          <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Projet reçu !</p>
                      </td>
                  </tr>
              </table>`;
  
              
              
              let start=`${editor_name},`
  
              mail_to_send+=`
              <table style="width:100%;margin:0px auto;">
                <tr id="tr3">
  
                    <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
                        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Un projet vient de vous être soumis de la part de <b>${user.firstname}</b>. Voici les informations concernant le projet : </p>`
  
                        
                          

                        mail_to_send+= `
                        <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Titre</b> : ${title}.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Catégorie </b> : ${category}.</li>
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Genres </b> : ` 
                                
                                for(let i=0;i<genres.length;i++){
                                  if(i==0){
                                    mail_to_send+=`${genres[i]},`
                                  }
                                  else if(i!=genres.length-1){
                                    mail_to_send+=` ${genres[i]},`
                                  }
                                  else{
                                    mail_to_send+=` ${genres[i]}.`
                                  }
                                 
                                }
                                
                                
                                mail_to_send+=`</li>                                
                                <li style="margin-top: 5px;margin-bottom: 15px;"><b>Formule </b> : ${formula}.</li>

                          </ul>
                         
                          
                          <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 25px;">Pour consulter le dossier du projet, le comparer et le trier avec d'autres projets, ainsi que pour répondre à l'artiste, nous vous invitons à consulter vos projets : </p>
                            <a href="https://www.linkarts.fr/account/${editor_nickname}/projects" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                Consulter mes projets
                            </a>
                        </div>`
                      
                        mail_to_send+= `
                        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Voici par ailleurs, les informations concernant l'artiste : </p>
                          <ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Pseudo</b> : ${user.nickname}.</li>`

                                  if(user.certified_account){

                                    mail_to_send+= `<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte certifié </b> : Oui.</li>`
                                  
                                  }
                                  else{
                                    mail_to_send+= `<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte certifié </b> : Non.</li>`
                                  }

                                  if(user.primary_description){
                                    mail_to_send+= `<li style="margin-top: 5px;margin-bottom: 15px;"><b>Description courte </b> : ${user.primary_description}</li>`
                                  
                                  }

                                  if(user.location){
                                    mail_to_send+= `<li style="margin-top: 5px;margin-bottom: 15px;"><b>Localisation </b> : ${user.location}.</li>`
                                  
                                  }

                                  
                                  mail_to_send+= `
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre d'abonnés </b> : ${subscribers_number}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de visiteurs</b> : ${number_of_visits}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de bandes dessinées</b> : ${number_of_comics}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de dessins</b> : ${number_of_drawings}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre d'écrits</b> : ${number_of_writings}.</li>

                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de mentions vue</b> : ${views}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de mentions j'aime</b> : ${likes}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre de mentions j'adore</b> : ${loves}.</li>
                                  <li style="margin-top: 5px;margin-bottom: 15px;"><b>Nombre d'annonces</b> : ${number_of_ads}.</li>`
                                  
                                                                                                                      

                                                                                                                
                                  if(user.links){
                                    if(user.links[0].instagram){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Instagram</b> : <a href="${user.links[0].instagram}">${user.links[0].instagram}</a>.</li>`
                                    }
                                    if(user.links[0].facebook){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Facebook</b> : <a href="${user.links[0].facebook}">${user.links[0].facebook}</a>.</li>`
                                    }
                                    if(user.links[0].twitter){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Twitter</b> : <a href="${user.links[0].twitter}">${user.links[0].twitter}</a>.</li>`
                                    }
                                    if(user.links[0].artstation){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Artstation</b> : <a href="${user.links[0].artstation}">${user.links[0].artstation}</a>.</li>`
                                    }
                                    if(user.links[0].webtoon){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Webtoon</b> : <a href="${user.links[0].webtoon}">${user.links[0].webtoon}</a>.</li>`
                                    }
                                    if(user.links[0].mangadraft){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Mangadraft</b> : <a href="${user.links[0].mangadraft}">${user.links[0].mangadraft}</a>.</li>`
                                    }
                                    if(user.links[0].pinterest){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Compte Pinterest</b> : <a href="${user.links[0].pinterest}">${user.links[0].pinterest}</a>.</li>`
                                    }
                                    if(user.links[0].website){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Site perso.</b> : <a href="${user.links[0].website}">${user.links[0].website}</a>.</li>`
                                    }
                                    if(user.links[0].shopping){
                                      mail_to_send+=`<li style="margin-top: 5px;margin-bottom: 15px;"><b>Boutique en ligne</b> : <a href="${user.links[0].shopping}">${user.links[0].shopping}</a>.</li>`
                                    }
                                  }
                          
                          
                          mail_to_send+= ` </ul>
                           <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                           <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 25px;">Pour plus d'informations nous vous invitons à directement consulter sa page de profil : </p>
                              <a href="https://www.linkarts.fr/account/${user.nickname}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                 Accéder au profil
                              </a>
                          </div>`
                      
                       
  
                          mail_to_send+=`
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                                        <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                                    <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
                                </td>
              
                            </tr>
                          </table>`
  
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                      <tr id="tr4">
                          <td align="center">
                              <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                              <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
                              
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
  

            list_of_users.findOne({
              where:{
                id:target_id,
              }
            }).then(editor=>{
              if(editor){
                var mailOptions = {
                  from: 'Linkarts <services@linkarts.fr>', 
                  to: editor.email, // my mail
                  bcc:"appaloosa-adam@hotmail.fr",
                  subject: `Projet reçu !`, 
                  html:  mail_to_send,
                };
      
                transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                     console.log(error)
                  }
                })
              }
            })
          
            

            res.status(200).send([r]);
          }
          else{
            res.status(200).send([r]);
          }
        })
        
          
        });
      
  
    });

    router.post('/submit_response_for_artist', function (req, res) {

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
      


      const id_project=req.body.id_project;
      const response=req.body.response;
      const formula=req.body.formula;
      const jugement=req.body.jugement;
      const mark=req.body.mark;
      const target_id=req.body.target_id;
      const target_nickname=req.body.target_nickname;
      const target_name=req.body.target_name;
      const user_nickname=req.body.user_nickname;
      const user_name=req.body.user_name;
      const price=req.body.price;
     
      list_of_projects_responses.create({
        "id_user":current_user,
        "id_project": id_project,
        "formula":formula,
        "response":response,
        "user_name": user_name,
        "user_nickname": user_nickname,
        "jugement":jugement,
        "mark": mark,
        "target_nickname":target_nickname,
        "target_id":target_id,
        "target_name":target_name,
        "price":price,
        "response_on_time":true,
      }).catch(err => {
          console.log(err)
        res.status(500).json({msg: "error", details: err});		
      }).then(r =>  {
        list_of_projects.update({
          "responded":true,
          "read":true,
        },{
          where:{
            id:id_project,
          }
         
        }).then(update=>{
          res.status(200).send([r]);
        })
       
      });
      
  
    });

    

    router.post('/upload_project_for_editor/:id_project/:file_name/:multiple', function (req, res) {
      let current_user = get_current_user(req.cookies.currentUser);
      if(!current_user){
        return res.status(401).json({msg: "error"});
      }
      const file_name=req.params.file_name;
      const multiple=req.params.multiple;
      const id_project=parseInt(req.params.id_project);
      const PATH1= './data_and_routes/projects_for_editors';
      
  
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, PATH1);
        },
  
        filename: (req, file, cb) => {
          cb(null,file_name);
        }
      });
  
      let upload = multer({
        storage: storage
      }).any();
  
      upload(req, res, function(err) {
        if (err) {
          return res.send({
            success: false
          });
      
        } else { 
          if(multiple=="false"){
            list_of_projects.update({
              "project_name":file_name  
            },{
            where:{
              id:id_project,
              }
            }).then(r=>{
              return res.status(200).send([{file_name:file_name}])
            })
          }
          else{
            list_of_projects.update({
              "project_name":file_name  
            },{
            where:{
              id_multiple:id_project,
              }
            }).then(r=>{
              return res.status(200).send([{file_name:file_name}])
            })
          }
          
        }
      })
    });


    

    router.post('/set_payement_done_for_project', function (req, res) {

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
        const id_project = req.body.id_project;
        const multiple = req.body.multiple;
        if(multiple){
          list_of_projects.update({
            "payement_status":"done",
            "password_payement":null,
          },
            {
              where:{
                id_multiple:id_project,
                id_user:current_user,
              }
              })
              .catch(err => {
          
              res.status(500).json({msg: "error", details: err});		
            }).then(project=>{res.status(200).send([project])})   
        }
        else{
          list_of_projects.update({
            "payement_status":"done",
            "password_payement":null,
          },
            {
              where:{
                id:id_project,
                id_user:current_user,
              }
              })
              .catch(err => {
          
              res.status(500).json({msg: "error", details: err});		
            }).then(project=>{res.status(200).send([project])})   
        }
          
    });


    

    router.post('/check_if_payement_done', function (req, res) {

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
        const id_project = req.body.id_project;
        const password= req.body.password;
        const multiple=req.body.is_multiple;
        if(multiple){
          list_of_projects.findOne(
            {
              where:{
                id_user:current_user,
                password_payement:password,
                is_multiple:true,
                id_multiple:`${id_project}`,
              }
            })
            .catch(err => {
              console.log(err)
            res.status(500).json({msg: "error", details: err});		
          }).then(project=>{res.status(200).send([project])})   
        }
        else{
          list_of_projects.findOne(
            {
              where:{
                id:id_project,
                id_user:current_user,
                password_payement:password
              }
            })
            .catch(err => {
              console.log(err)
            res.status(500).json({msg: "error", details: err});		
          }).then(project=>{res.status(200).send([project])})   
        }
         
    });


    router.post('/set_project_read', function (req, res) {

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
        const id_project = req.body.id_project;
        list_of_projects.update({
          "read":true,
        },
          {
            where:{
              id:id_project,
              target_id:current_user,
            }
          })
          .catch(err => {
            console.log(err)
          res.status(500).json({msg: "error", details: err});		
        }).then(project=>{res.status(200).send([project])})     
    });




    

  router.post('/get_sorted_applications', function (req, res) {
      
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

    const target = req.body.target;
    const author = req.body.author;
    const category = req.body.category;
    const sort_formula = req.body.sort_formula.toLowerCase();
    const sort_time = req.body.sort_time;
    const sort_pertinence = req.body.sort_pertinence;
    const genres = req.body.genres;
    const offset_applications = req.body.offset_applications;
    const responded=req.body.responded;

    let pertinence_to_sort='';
    if(sort_pertinence!='none'){
      if(sort_pertinence=="Nombre d'abonnés"){
        pertinence_to_sort="subscribers_number";
      }
      else if(sort_pertinence=="Nombre de visites du profil"){
        pertinence_to_sort="number_of_visits";
      }
      else if(sort_pertinence=="Nombre d'œuvres"){
        pertinence_to_sort="number_of_artpieces";
      }
      else if(sort_pertinence=="Nombre de bandes dessinées"){
        pertinence_to_sort="number_of_comics";
      }
      else if(sort_pertinence=="Nombre de dessins"){
        pertinence_to_sort="number_of_drawings";
      }
      else if(sort_pertinence=="Nombre d'écrits"){
        pertinence_to_sort="number_of_writings";
      }
      else if(sort_pertinence=="Nombre d'annonces"){
        pertinence_to_sort="number_of_ads";
      }
      else if(sort_pertinence=="Mentions j'aime"){
        pertinence_to_sort="likes";
      }
      else if(sort_pertinence=="Mentions j'adore"){
        pertinence_to_sort="loves";
      }
      else if(sort_pertinence=="Mentions vues"){
        pertinence_to_sort="views";
      }
    }

    const Op = Sequelize.Op;
    let number_of_applications=0;
    let applications_to_look_for={}
    let order_to_look_for=[];

    var today = new Date();

    applications_to_look_for={
      id_user:(target == "artist") ? author.id: {[Op.ne]:0},
      category: (category != "none") ? category: {[Op.ne]:"none"},
      genres:(genres.length>0) ? { [Op.contains]: genres }: {[Op.ne]:["none"]},
      target_id: (target == "artist") ? {[Op.ne]:0}: author.id,
      formula: (sort_formula != "none") ? sort_formula: {[Op.ne]:"none"},
      payement_status:"done",
      responded:responded,
      delay_date:{[Op.gt]:today}
    }
    if(sort_time.toLowerCase().includes("retour")){
      if(sort_pertinence!="none" ){
        if(sort_time.toLowerCase().includes("asc")){
          order_to_look_for=[
            [pertinence_to_sort, 'DESC'],
            ['delay_date', 'ASC'],
          ]
        }
        else{
          order_to_look_for=[
            [pertinence_to_sort, 'DESC'],
            ['delay_date', 'DESC'],
          ]
        }
        
      }
      else if(sort_pertinence=="none"){
        if(sort_time.toLowerCase().includes("asc")){
          order_to_look_for=[
            ['delay_date', 'ASC'],
          ]
        }
        else{
          order_to_look_for=[
            ['delay_date', 'DESC'],
          ]
        }
      }
    }
    else{
      if(sort_pertinence!="none" ){
        if(sort_time.toLowerCase().includes("asc")){
          order_to_look_for=[
            [pertinence_to_sort, 'DESC'],
            ['createdAt', 'ASC'],
          ]
        }
        else{
          order_to_look_for=[
            [pertinence_to_sort, 'DESC'],
            ['createdAt', 'DESC'],
          ]
        }
        
      }
      else if(sort_pertinence=="none"){
        if(sort_time.toLowerCase().includes("asc")){
          order_to_look_for=[
            ['createdAt', 'ASC'],
          ]
        }
        else{
          order_to_look_for=[
            ['createdAt', 'DESC'],
          ]
        }
      }
    }
   
    

    list_of_projects.count({
      where:applications_to_look_for,
    }).catch(err => {
      console.log(err)
      res.status(500).json({msg: "error", details: err});		
    }).then(number=>{
      if(number){
        number_of_applications=number;
        list_of_projects.findAll({
          where: applications_to_look_for,
          order: order_to_look_for,
          limit:10,
          offset:offset_applications
        })
        .catch(err => {
          console.log(err)
          res.status(500).json({msg: "error", details: err});		
        }).then(results=>{
          res.status(200).send([{number_of_applications:number_of_applications,results:results}]);
        });
      }
      else{
        res.status(200).send([{number_of_applications:number_of_applications,results:[]}]);
      }
    });

   
      
  });
  router.get('/get_all_last_emitted_project/:visitor_id/', function (req, res) {

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
      let visitor_id = req.params.visitor_id;
      const Op = Sequelize.Op;
      var last_month = new Date();
      last_month.setDate(last_month.getDate() - 30);
      list_of_projects.findAll({
          where:{
              id_user:visitor_id,
              payement_status:"done",
              createdAt:{[Op.gt]:last_month}
          },
          order: [
              ['createdAt', 'DESC']
            ],
      })
      .catch(err => {
          
        res.status(500).json({msg: "error", details: err});		
      }).then(project=>{res.status(200).send([project])})     
  });
  
  router.get('/get_last_emitted_project/:visitor_id/:target_id', function (req, res) {

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
      let visitor_id = req.params.visitor_id;
      let target_id = req.params.target_id;
      const Op = Sequelize.Op;
      var last_month = new Date();
      last_month.setDate(last_month.getDate() - 30);
      list_of_projects.findAll({
          where:{
              id_user:visitor_id,
              target_id:target_id, 
              payement_status:"done",
              createdAt:{[Op.gt]:last_month}
          },
          order: [
              ['createdAt', 'DESC']
            ],
          limit:1,
      })
      .catch(err => {
          
        res.status(500).json({msg: "error", details: err});		
      }).then(project=>{res.status(200).send([project])})     
  });

  

  router.get('/get_project_response/:project_id', function (req, res) {

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
      let project_id = req.params.project_id;
      const Op = Sequelize.Op;
      list_of_projects_responses.findOne({
          where:{
            id_project:project_id,
          }
      })
      .catch(err => {
          
        res.status(500).json({msg: "error", details: err});		
      }).then(project=>{res.status(200).send([project])})     
  });


  router.get('/retrieve_project_by_name/:file_name', function (req, res) {

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

    let filename = "./data_and_routes/projects_for_editors/" + req.params.file_name;
    fs.access(path.join(process.cwd(),filename), fs.F_OK, (err) => {
      if(err){
        filename = "./data_and_routes/file-not-found.pdf";
        var not_found = fs.createReadStream( path.join(process.cwd(),filename))
        not_found.pipe(res);
      }  
      else{
        var pp = fs.createReadStream( path.join(process.cwd(),filename))
        pp.pipe(res);
      }     
    })



  });


  router.post('/get_all_editors_gains', function (req, res) {

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
      const Op = Sequelize.Op;
      const  date_format = req.body.date_format;
      let id_user = get_current_user(req.cookies.currentUser);
      let date=new Date();
  
      if(date_format==0){
          date.setDate(date.getDate() - 8);
      }
      if(date_format==1){
          date.setDate(date.getDate() - 30);
      }
      else if(date_format==2){
          date.setDate(date.getDate() - 365);
      }
      
      list_of_projects_responses.findAll({
          where:{
              createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
              id_user:id_user,
          }
          ,order: [
              ['createdAt', 'DESC']
          ]
      }).catch(err => {
            
          res.status(500).json({msg: "error", details: err});		
      }).then(projects=>{
          let list_of_contents=projects
          res.status(200).send([{list_of_contents:list_of_contents}])

      })
      
  });

  router.post('/get_total_editors_gains', function (req, res) {

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
      let total_gains=0;
      list_of_projects_responses.findAll({
          where:{
              id_user:current_user,
          }
          ,order: [
              ['createdAt', 'DESC']
          ]
      }).catch(err => {
      
        res.status(500).json({msg: "error", details: err});		
      }).then(responses=>{

          if(responses.length>0){
              for( let i=0;i<responses.length;i++){
                  total_gains+= responses[i].price;
              }
          }
          res.status(200).json([{total:total_gains}]);	
      })
      
  });


  router.post('/get_projects_stats', function (req, res) {

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
    let type_of_account=req.body.type_of_account;
    let number_of_projects=0;
    let number_of_projects_responses=0;
    let number_of_projects_consulted=0;
    let list_of_projects_number=[];
    let list_of_projects_responses_number=[];
    let date_format=req.body.date_format;
    let compteur_functions=0;
    const Op = Sequelize.Op;
    let date=new Date();

    if(date_format==0){
      let today=new Date();
      let compteur_of_days=0;
      for(let i=0;i<8;i++){
          let day_i=new Date();
          day_i.setDate(day_i.getDate() - i);
          let day_i_1=new Date();
          day_i_1.setDate(today.getDate() - (i+1));
          list_of_projects.findAll({
              where:{
                id_user: !type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                target_id: type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                payement_status:"done",
                  [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
              }
            }).catch(err => {
  
              res.status(500).json({msg: "error", details: err});		
          }).then(projects=>{
              list_of_projects_number[i]=projects.length;
              list_of_projects_responses_number[i]=0
              for(let j=0;j<projects.length;j++){
                if(projects[j].responded){
                  list_of_projects_responses_number[i]+=1;
                }
              }
              compteur_of_days++;
              if(compteur_of_days==8){
                  compteur_functions+=1
                  if(compteur_functions==2){
                    send_response()
                  }
              }
              
              
          })
          
      }
  
    }

    if(date_format==1){
        let today=new Date();
        let compteur_of_days=0;
        for(let i=0;i<30;i++){
            let day_i=new Date();
            day_i.setDate(day_i.getDate() - i);
            let day_i_1=new Date();
            day_i_1.setDate(today.getDate() - (i+1));
            list_of_projects.findAll({
                where:{
                  id_user: !type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  target_id: type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  payement_status:"done",
                    [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                }
              }).catch(err => {
    
                res.status(500).json({msg: "error", details: err});		
            }).then(projects=>{
                list_of_projects_number[i]=projects.length;
                list_of_projects_responses_number[i]=0
                for(let j=0;j<projects.length;j++){
                  if(projects[j].responded){
                    list_of_projects_responses_number[i]+=1;
                  }
                }
                compteur_of_days++;
                if(compteur_of_days==30){
                    compteur_functions+=1
                    if(compteur_functions==2){
                      send_response()
                    }
                }
                
            })
            
        }
    
    }

    if(date_format==2){
        let compteur_of_months=0;
        for(let i=0;i<53;i++){
            let week_i=new Date();
            week_i.setDate(week_i.getDate() - 7*i);
            let week_i_1=new Date();
            week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
            list_of_projects.findAll({
                where:{
                  id_user: !type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  target_id: type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  payement_status:"done",
                  [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                }
              }).catch(err => {
                    
                res.status(500).json({msg: "error", details: err});		
            }).then(projects=>{
                list_of_projects_number[i]=projects.length;
                list_of_projects_responses_number[i]=0
                for(let j=0;j<projects.length;j++){
                  if(projects[j].responded){
                    list_of_projects_responses_number[i]+=1;
                  }
                }
                compteur_of_months++;
                if(compteur_of_months==53){
                    compteur_functions+=1
                    if(compteur_functions==2){
                      send_response()
                    }
                }
            })
            
        }
    
    }

    if(date_format==3){
        var date1 = new Date('08/01/2019');
        var date2 = new Date();
        var difference = date2.getTime() - date1.getTime();
        var days = Math.ceil(difference / (1000 * 3600 * 24));
        var weeks = Math.ceil(days/7) + 1;
        let compteur_of_years=0;
        for(let i=0;i<weeks;i++){
            let week_i=new Date();
            week_i.setDate(week_i.getDate() - 7*i);
            let week_i_1=new Date();
            week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
            list_of_projects.findAll({
                where:{
                  id_user: !type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  target_id: type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
                  payement_status:"done",
                  [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                }
              }).catch(err => {
                    
                res.status(500).json({msg: "error", details: err});		
            }).then(projects=>{
                list_of_projects_number[i]=projects.length;
                list_of_projects_responses_number[i]=0
                for(let j=0;j<projects.length;j++){
                  if(projects[j].responded){
                    list_of_projects_responses_number[i]+=1;
                  }
                }
                compteur_of_years++;
                if(compteur_of_years==weeks){
                    compteur_functions+=1;
                    if(compteur_functions==2){
                      send_response()
                    }
                }
                
            })
            
        }
    }
    
    if(date_format==0){
      date.setDate(date.getDate() - 8);
    }
    else if(date_format==1){
        date.setDate(date.getDate() - 30);
    }
    if(date_format==2){
      date.setDate(date.getDate() - 365);
    }

    list_of_projects.findAll({
        where: {
          id_user: !type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
          target_id: type_of_account.includes('dit')? id_user :{[Op.ne]:0} ,
          payement_status:"done",
          createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
        },
        order: [
          ['createdAt', 'DESC']
        ],
      })
      .catch(err => {
          
        res.status(500).json({msg: "error", details: err});		
      }).then(projects =>  {
        if(projects.length>0 ){
          number_of_projects+=projects.length;
          for(let i=0;i<projects.length;i++){
            if(projects[i].responded){
              number_of_projects_responses+=1;
             
            }

            if(projects[i].read){
              number_of_projects_consulted+=1;
            }
          }

          compteur_functions+=1
          if(compteur_functions==2){
            send_response()
          }
          
        }
        else{
          compteur_functions+=1
          if(compteur_functions==2){
            send_response()
          }
          
        }
        
        
      }); 

      function send_response(){
        res.status(200).send([{number_of_projects:number_of_projects,number_of_projects_consulted:number_of_projects_consulted,number_of_projects_responses:number_of_projects_responses,list_of_projects_number:list_of_projects_number,list_of_projects_responses_number:list_of_projects_responses_number}]);
      }
     
    });


    router.get('/get_number_of_projects_submited/:id_user', function (req, res) {

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
        list_of_projects.count({
          where:{target_id:parseInt(req.params.id_user)}
        }).catch(err => {
				
            res.status(500).json({msg: "error", details: err});		
          }).then(number=>{res.status(200).send([{number:number}])})     
    });


}