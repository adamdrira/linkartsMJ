
var {spawn} = require("child_process");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const authentification = require('../../authentication/db.config');
const favorites_seq= require('../../favorites/model/sequelize');
var nodemailer = require('nodemailer');
const Pool = require('pg').Pool;
/*const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'postgres',
  password: 'test',
  host: 'localhost',
});*/

const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'adamdrira',
  password: 'E273adamZ9Qvps',
  host: 'localhost',
  //dialect: 'postgres'
});

pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
    })
})


function get_current_user(token){
  var user = 0
  jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  return user;
};


  const generate_or_get_favorites = (request, response) => {
    if(request.body.password!="Le-Site-De-Mokhtar-Le-Pdg-For-Trendings" ||  request.body.email!="legroupelinkarts@linkarts.fr"){
      if( ! request.headers['authorization'] ) {
        return response.status(401).json({msg: "error"});
      }
      else {
        let val=request.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return response.status(401).json({msg: "error"});
        }
      }
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    let day = today.getDay();
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    
    var six_months = new Date();
    six_months.setDate(six_months.getDate() - 180);
    favorites_seq.favorites.findAll({
      where:{
        date: date
      },
      order: [
          ['rank', 'ASC']
        ],
      limit: 30,
    }).catch(err => {
			response.status(500).json({msg: "error", details: err});		
		}).then(resu=>{
      if(resu[0]){
        return response.status(200).send([{favorites:resu}]);
      }
      else{

        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
  
        var dd_yes= String(yesterday.getDate()).padStart(2, '0');
        var mm_yes = String(yesterday.getMonth()+1).padStart(2, '0'); 
        var yyyy_yes = yesterday.getFullYear();
        const date_yes = yyyy_yes.toString() + '-' +  mm_yes  + '-' + dd_yes;


        if(request.headers['authorization']){
          favorites_seq.favorites.findAll({
            where:{
              date: date_yes
            },
            order: [
                ['rank', 'ASC']
              ],
            limit: 30,
          }).catch(err => {
            response.status(500).json({msg: "error", details: err});	
          }).then(resu=>{
            if(resu[0]){
              response.status(200).send([{favorites:resu}]);
            }
            generate_favorites();
          })
        }
        
      }
    })

   

    function generate_favorites(){
      pool.query(' SELECT * FROM users WHERE type_of_account=$1 OR type_of_account=$2 OR type_of_account=$3 OR type_of_account=$4 OR type_of_account=$5 AND "createdAt" ::date >= $6 ORDER BY subscribings_number DESC',["Artiste","Artistes","Artiste professionnel","Artiste professionnelle","Artistes professionnels",six_months], (error, results) => {
        if (error) {
        }
        else{
            let fastcsv = require("fast-csv");
            let Path1=`/csvfiles_for_python/favorites_ranking-${date}.csv`;
            let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
            let json_view = JSON.parse(JSON.stringify(results.rows));
            fastcsv.write(json_view, { headers: true })
            .pipe(ws)
            .on('error', function(e){
                console.log(e)
            })
            .on("finish", function() {
                //pour ubuntu  
                const pythonProcess = spawn('python3',['/usr/local/lib/python3.8/dist-packages/favorites.py', date]);
                //const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/favorites.py', date]);
                pythonProcess.stderr.pipe(process.stderr);
                pythonProcess.stdout.on('data', (data) => {
                  //console.log("python res")
                  //console.log(data.toString())
                });
                pythonProcess.stdout.on("end", (data) => {
                  let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/favorites_ranking-${date}.json`));
                  fs.access(__dirname + Path1, fs.F_OK, (err) => {
                    if(err){
                        add_favorites(json,date);
                    }  
                    else{
                      fs.unlink(__dirname + Path1,function (err) {
                        if (err) {
                        } 
                        add_favorites(json,date);
                        
                      });
                      
                    }     
                  })
                  
                });
            })
        }
      })
    }
    
    

    function add_favorites(json,date){
      var list_of_users_for_email=[];
      var list_of_users_for_email_final=[];
      let obj=Object.keys(json.id);
      let compt=0;
      let list_of_users=[]
      let list_of_rankings=[];
      for(let i=0;i<obj.length;i++){
        authentification.users.findOne({
          where:{
            id:json.id[i],
            status:"account",
          }
        }).catch(err => {
          
          response.status(500).json({msg: "error", details: err});		
        }).then(user=>{
          if(user){
            list_of_users[i]=user;
            compt++
            if(compt==obj.length){
              add_to_date()
            }
          }
          else{
            compt++
            if(compt==obj.length){
              add_to_date()
            }
          }
          
        })
        
      }
  
     
      function add_to_date(){
        let compteur_done=0;
        for(let i=0;i<list_of_users.length;i++){

          if(list_of_users[i] && list_of_users_for_email.indexOf(list_of_users[i].id)<0){
            list_of_users_for_email.push(list_of_users[i].id)
            list_of_users_for_email_final.push(list_of_users[i])
          }
          


          let ranking=get_ranking(i);
          list_of_rankings[i]=ranking;
          if(i==list_of_users.length-1){
            send_email_to_users(list_of_users_for_email_final,list_of_rankings)
          }
          let remuneration= '0';
          if( Number(mm)<4){
            remuneration="0";
          }
          else if(list_of_users[i] && day==1){
            remuneration= get_remuneration(list_of_users[i].subscribers.length,ranking);
          }

          if(list_of_users[i] && list_of_users[i].gender=='Groupe'){
            finalize_add_to_data(list_of_users[i],i,ranking,remuneration)
          }
          else if(list_of_users[i]){
            favorites_seq.favorites.create({
              "id_user": list_of_users[i].id,
              "date":date,
              "rank":ranking,
              "remuneration":remuneration,
              "type_of_account":list_of_users[i].type_of_account
            }).catch(err => {
              		
            }).then(favorites=>{
              compteur_done++;
              if(compteur_done==list_of_users.length){
                
                return 
              }
            })
          }
          else{
            compteur_done++;
              if(compteur_done==list_of_users.length){
                
                return 
                  
              }
          }
        }
        

        function get_ranking(i){
          let minus=0;
          for(let k=0;k<i;k++){
            if(!list_of_users[k]){
              minus++;
            }
          }
          return i-minus+1;
        }

        function get_remuneration(number,ranking){
          if(ranking>15){
            return '0'
          }
          if(number<100){
            let num = (1/3)*(1/ranking)*((1/80)*number + 5);
            
            return num.toFixed(2)
          }
          if(number<1000){
            let num = 1/2+ (1/3)*(1/ranking)*((2/1000)*number + 6.05);
            
            return num.toFixed(2)
          }
          if(number<10000){
            let num = 2/5+ (1/3)*(1/ranking)*((3/10000)*number + 7.75);
            return num.toFixed(2)
          }
          if(number<100000){
            let num = 1 + (1/3)*(1/ranking)*((6/1000000)*number + 6);
            return num.toFixed(2)
          }
          if(number<1000000){
            let num = 1 + (1/3)*(1/ranking)*((12/10000000)*number + 8);
            return num.toFixed(2)
          }
          else{
            let num = 1 + (1/3)*(1/ranking)*((24/100000000)*number + 6);
            return num.toFixed(2)
          }
        }
      
  
        function finalize_add_to_data(user,i,ranking,remuneration){
         
          let list_of_members=user.list_of_members;
          let shares={}
          if(list_of_members){
            for(let j=0;j<list_of_members.length<0;j++){
              shares[list_of_members[j]]=(100/list_of_members.length).toFixed(2);
            }
          }
          authentification.user_groups_managment.findAll({
            where:{
              id_group:user.id,
            }
          }).then(members=>{
            
            if(members[0]){
              for(let j=0;j<members.length;j++){
                shares[members[j].id_user]=members[j].share;
              }
              favorites_seq.favorites.create({
                "id_user": list_of_users[i].id,
                "date":date,
                "rank":ranking,
                "remuneration":remuneration,
                "type_of_account":list_of_users[i].type_of_account,
                "shares":[shares],
              }).then(favorites=>{
                compteur_done++;
                if(compteur_done==list_of_users.length){
                  return 
                }
              })
            }
            else{
              favorites_seq.favorites.create({
                "id_user": list_of_users[i].id,
                "date":date,
                "rank":ranking,
                "remuneration":remuneration,
                "type_of_account":list_of_users[i].type_of_account,
              }).then(favorites=>{
                compteur_done++;
                if(compteur_done==list_of_users.length){
                  return 
                }
              })
            }
  
            
          })
        }
  
        function send_email_to_users(list_of_users, list_of_rankings){
          for(let i=0;i<list_of_users.length;i++){
            if(list_of_users[i]){
              
      
              /*if(Number(mm)<4 ||parseInt(list_of_rankings[i])>30){
                return
              }*/
                console.log("send_email " + list_of_users[i])
                const Op = Sequelize.Op;
                var byesterday = new Date();
                byesterday.setDate(byesterday.getDate() - 2);
                authentification.users_connexions.findOne({
                  where:{
                    id_user:list_of_users[i].id,
                    createdAt: {[Op.gte]: byesterday}
                  }
                  
                }).then(r=>{
  
                  if(!r){
                    send_email()
                  }
                })
  
               function send_email(){
                  let text=``;
                  if(day==1 && parseInt(list_of_rankings[i])<=15){
                    text+=`Vous avez atteint le top 30 des <b>Coups de cœur</b> du jour. Et puisque nous sommes lundi vous allez être rémunéré ! Le montant de cette rémunération est disponible dans la section "rémunération" de votre compte.`
                  }
                  else if(parseInt(list_of_rankings[i])>15){
                    text+=`Vous avez atteint le top 30 des <b>Coups de cœur</b> du jour. Continuez ainsi afin d'atteindre le top 15 le prochain lundi et obtenir une rémunération !`
                  }
                  else if(day!=1 && parseInt(list_of_rankings[i])<=15){
                    text+=`Vous avez atteint le top 30 des <b>Coups de cœur</b> du jour. Continuez ainsi afin d'obtenir une rémunération le prochain lundi !`
                  }
                  
                  let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
                  mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
                    mail_to_send+=`
                    <table style="width:100%;margin-bottom:20px">
                        <tr id="tr1">
                            <td align="center" style="padding-top:25px;padding-bottom:15px;text-align:center;">
                                <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3.svg" height="36" width="36" style="margin:auto auto;height:36px;width:36px;max-height: 36px;max-width:36px" />
                            </td>
                        </tr>
        
        
                        <tr id="tr2" >
                            <td  align="center" style="background: rgb(2, 18, 54)">
                                <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
                                <div style="height:1px;width:20px;background:white;"></div>
                                <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Top Coups de cœur !</p>
                            </td>
                        </tr>
                    </table>`;
        
                   
                    mail_to_send+=`
                    <table style="width:100%;margin:25px auto;">
                      <tr id="tr3">
        
                          <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                              <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Félicitation ${list_of_users[i].firstname} !</p>
                              <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${text}</p>
                              <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Cliquez sur le bouton ci-dessous pour accéder aux Coups de cœur et découvrir votre classement : </p>
        
                              <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                  <a href="https://linkarts.fr/favorites" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                      Accéder aux Coups de cœur
                                  </a>
                              </div>
        
                              <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Très sincèrement,</br>L'équipe LinkArts</p>
                              <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3-18-01.svg" height="20" style="height:20px;max-height: 20px;float: left;" />
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

          
                var mailOptions = {
                    from: 'Linkarts <services@linkarts.fr>', // sender address
                    to:  list_of_users[i].email, // my mail
                    //to: "appaloosa-adam@hotmail.fr",
                    subject: `Top Coups de cœur !`, // Subject line
                    html: mail_to_send, // html body
                };
          
                transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error while sending mail: ' + error);
                    }
                })
  
               }
                
            }
          }
         
        }

      }
     
    }
}




module.exports = {
  generate_or_get_favorites
  }