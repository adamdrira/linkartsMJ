
var {spawn} = require("child_process");
const fs = require("fs");
const jwt = require('jsonwebtoken');
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
    if( ! request.headers['authorization'] ) {
      return res.status(401).json({msg: "error"});
    }
    else {
      let val=request.headers['authorization'].replace(/^Bearer\s/, '')
      let user= get_current_user(val)
      if(!user){
        return res.status(401).json({msg: "error"});
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
        generate_favorites()
      }
    })

   

    function generate_favorites(){
      pool.query(' SELECT * FROM users WHERE type_of_account=$1 OR type_of_account=$2 OR type_of_account=$3 OR type_of_account=$4 OR type_of_account=$5 AND "createdAt" ::date >= $6 ORDER BY subscribings_number DESC',["Artiste","Artistes","Artiste professionnel","Artiste professionnelle","Artistes professionnels",six_months], (error, results) => {
        if (error) {
          response.status(500).send([{error:err}])
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
                          console.log(err)
                          response.status(500).send([{error:err}])
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
              
              response.status(500).json({msg: "error", details: err});		
            }).then(favorites=>{
              compteur_done++;
              if(compteur_done==list_of_users.length){
                
                return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                  
              }
            })
          }
          else{
            compteur_done++;
              if(compteur_done==list_of_users.length){
                
                return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                  
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
          }).catch(err => {
            
            response.status(500).json({msg: "error", details: err});		
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
              }).catch(err => {
                
                response.status(500).json({msg: "error", details: err});		
              }).then(favorites=>{
                compteur_done++;
                if(compteur_done==list_of_users.length){
                
                  return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                    
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
              }).catch(err => {
                
                response.status(500).json({msg: "error", details: err});		
              }).then(favorites=>{
                compteur_done++;
                if(compteur_done==list_of_users.length){
                
                  return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                    
                }
              })
            }
  
            
          })
        }
  
        function send_email_to_users(list_of_users, list_of_rankings){
          for(let i=0;i<list_of_users.length;i++){
            if(list_of_users[i]){
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
        
              let html='';
              if(Number(mm)<4 ||parseInt(list_of_rankings[i])>30){
                return
              }

              html = `<p> Félicitation ${list_of_users[i].firstname} !</p>`
              if(day==1 && parseInt(list_of_rankings[i])<=15){
                html+=`<p> Vous avez atteint le top ${list_of_rankings[i]} des <b>Coups de cœur</b> du jour. Et puisque nous sommes lundi vous recevez une rémunération bonus ! Le montant de cette rémunération est disponible dans la section "rémunération" de votre compte</p>`
              }
              else if(parseInt(list_of_rankings[i])>15){
                html+=`<p> Vous avez atteint le top ${list_of_rankings[i]} des <b>Coups de cœur</b> du jour. Continuez ainsi afin d'atteindre le top 15 le prochain lundi et obtenir une rémunération !</p>`
              }
              else if(day!=1 && parseInt(list_of_rankings[i])<=15){
                html+=`<p> Vous avez atteint le top ${list_of_rankings[i]} des <b>Coups de cœur</b> du jour. Continuez ainsi afin d'obtenir une rémunération le prochain lundi !</p>`
              }

              html+=`
                <ul>
                    <li><a href="https://linkarts.fr/favorites"> Cliquer ici</a> pour voir le top 30 des <b>Coups de cœur</b> du jour</li>
                    <li><a href="https://linkarts.fr/account/${list_of_users[i].nickname}/${list_of_users[i].id}/my_account"> Cliquer ici</a> pour consuler votre compte.</li>
                </ul>
                <p>L'équipe de LinkArts.</p>`

              var mailOptions = {
                  from: 'Linkarts <services@linkarts.fr>', // sender address
                  to:  list_of_users[i].email, 
                  subject: `Top Coups de coeur !`, // Subject line
                  html:  html,
              };
        
             /*transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log('Error while sending mail: ' + error);
                  }
              })*/
            }
          }
         
        }

      }
     
    }
}




module.exports = {
  generate_or_get_favorites
  }