const category = require('../../comics_one_shot_and_cover/controllers/controller');
const fetch = require("node-fetch");
var {spawn} = require("child_process")
const usercontroller = require('../../authentication/user.controller');
var Request = require('request');
var fastcsv = require("fast-csv");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const authentification = require('../../authentication/db.config');
const comics_oneshot_seq= require('../../comics_one_shot_and_cover/models/sequelize');
const comics_serie_seq= require('../../comics_serie/models/sequelize');
const drawings_oneshot_seq= require('../../drawings_one_shot_and_cover/models/sequelize');
const drawings_artbook_seq= require('../../drawings_artbook/models/sequelize');
const writings_seq= require('../../writings/models/sequelize');
const trendings_seq= require('../../p_trendings/model/sequelize');
const Sequelize = require('sequelize');
var nodemailer = require('nodemailer');
const Pool = require('pg').Pool;
const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'postgres',
  password: 'test',
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

  const get_trendings_for_tomorrow=(request,response) =>{
  /*  var today = new Date();
    
    
    let Path1=`/csvfiles_for_python/view_rankings.csv`;
    let Path2=`/csvfiles_for_python/likes_rankings.csv`;
    let Path3=`/csvfiles_for_python/loves_rankings.csv`
    let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
    let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
    let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);

    const Op = Sequelize.Op;
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 89);

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() +1);
    var dd = String(tomorrow.getDate()).padStart(2, '0');
    var mm = String(tomorrow.getMonth()+1).padStart(2, '0'); 
    var yyyy = tomorrow.getFullYear();
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    console.log(date)
    console.log("voici date")

    pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null ', [today,_before_before_yesterday], (error, results) => {
      if (error) {
        console.log(error)
        response.status(200).send([{"error":error}]); 
      }
      else{
        let json_view = JSON.parse(JSON.stringify(results.rows));
        fastcsv.write(json_view, { headers: true })
        .pipe(ws)
        .on('error', function(e){
          console.log(e)
        })
        .on("finish", function() {
          pool.query(' SELECT * FROM list_of_likes WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
            if (error) {
              console.log(error)
              response.status(200).send([{"error":error}]); 
            }
            else{
              let json_view = JSON.parse(JSON.stringify(results.rows));
              fastcsv.write(json_view, { headers: true })
              .pipe(ws1)
              .on('error', function(e){
                console.log(e)
              })
              .on("finish", function() {
                pool.query(' SELECT * FROM list_of_loves WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2   AND monetization=$3', [today,_before_before_yesterday,'true'], (error, results) => {
                    if (error) {
                      console.log(error)
                      response.status(200).send([{"error":error}]); 
                    }
                      else{
                      let json_loves = JSON.parse(JSON.stringify(results.rows));
                      fastcsv.write(json_loves, { headers: true })
                      .pipe(ws2)
                        .on('error', function(e){
                          console.log(e)
                        })
                        .on("finish", function() {

                          const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/rankings.py', date]);
                          //console.log(pythonProcess)
                          pythonProcess.stderr.pipe(process.stderr);
                          pythonProcess.stdout.on('data', (data) => {
                            console.log("python res")
                            //console.log(data.toString())
                          });
                          pythonProcess.stdout.on("end", (data) => {
                            console.log("end received data python: ");
                             response.status(200).send([{"data":"ok"}]); 
                                   
                          });



                        });
                        }
                      })                           
                });
                  }
              })  
            })
          }
      })*/

  }

  const send_rankings_and_get_trendings_comics = (request, response) => {

    var today = new Date();
    
    const Op = Sequelize.Op;
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 150);
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    
    trendings_seq.trendings_comics.findOne({
      where:{
        date:date
      }
    }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
      if(result){
        console.log("trendings exist");
       
        response.status(200).send([{"comics_trendings":result.trendings}]);
      }
      else{
        // si les tendances n'ont pas déjà été chargé pour la journée on les charges

       
        let Path1=`/csvfiles_for_python/view_rankings.csv`;
        let Path2=`/csvfiles_for_python/likes_rankings.csv`;
        let Path3=`/csvfiles_for_python/loves_rankings.csv`
        let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
        let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
        let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);


        
        pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
          if (error) {
            console.log(error)
            response.status(200).send([{"error":error}]); 
          }
          else{
            let json_view = JSON.parse(JSON.stringify(results.rows));
            fastcsv.write(json_view, { headers: true })
            .pipe(ws)
            .on('error', function(e){
              console.log(e)
            })
            .on("finish", function() {
              pool.query(' SELECT * FROM list_of_likes WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
                  if (error) {
                    console.log(error)
                    response.status(200).send([{"error":error}]); 
                  }
                  else{

                  let json_likes = JSON.parse(JSON.stringify(results.rows));
                  fastcsv.write(json_likes, { headers: true })
                  .pipe(ws1)
                    .on('error', function(e){
                      console.log(e)
                    })
                    .on("finish", function() {
                  
                      pool.query(' SELECT * FROM list_of_loves WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2   AND monetization=$3', [today,_before_before_yesterday,'true'], (error, results) => {
                          if (error) {
                            console.log(error)
                            response.status(200).send([{"error":error}]); 
                          }
                          else{
                          let json_loves = JSON.parse(JSON.stringify(results.rows));
                          fastcsv.write(json_loves, { headers: true })
                          .pipe(ws2)
                            .on('error', function(e){
                              console.log(e)
                            })
                            .on("finish", function() {
                              
                              const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/rankings.py', date]);
                              //console.log(pythonProcess)
                              pythonProcess.stderr.pipe(process.stderr);
                              pythonProcess.stdout.on('data', (data) => {
                                console.log("python res")
                                //console.log(data.toString())
                              });
                              pythonProcess.stdout.on("end", (data) => {
                                console.log("end received data python: ");
                                let files = [__dirname + Path1,__dirname + Path2,__dirname + Path3];
                                for (let i=0;i<files.length;i++){
                                  fs.access(files[i], fs.F_OK, (err) => {
                                    if(err){
                                      console.log('suppression already done for first path'); 
                                      if(i==files.length -1){
                                        let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`));
                                        trendings_seq.trendings_comics.create({
                                          "trendings":json,
                                          "date":date
                                        }).catch(err => {
                                          console.log(err);	
                                          res.status(500).json({msg: "error", details: err});		
                                        }).then(result=>{
                                          add_comics_trendings(json,date);
                                            return response.status(200).send([{comics_trendings:json}]); 
                                        })
                                      } 
                                    }  
                                    else{
                                      fs.unlink(files[i],function (err) {
                                        if (err) {
                                          console.log(error)
                                          response.status(200).send([{"error":error}]); 
                                        } 
                                        if(i==files.length -1){
                                          let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`));
                                          trendings_seq.trendings_comics.create({
                                            "trendings":json,
                                            "date":date
                                          }).catch(err => {
                                            console.log(err);	
                                            res.status(500).json({msg: "error", details: err});		
                                          }).then(result=>{
                                            add_comics_trendings(json,date);
                                              return response.status(200).send([{comics_trendings:json}]); 
                                          }) 
                                        } 
                                      });
                                      
                                    }     
                                  })
                                }   
                              });



                            });
                            }
                          })                           
                    });
                      }
                  })  
                })
              }
          })

      }
      
    })

}


const get_drawings_trendings = (request, response) => {

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); 
  let yyyy= today.getFullYear();
  let date = yyyy.toString() + '-' +  mm + '-' + dd;

  console.log("get_drawings_trendings")
  console.log(date)
  trendings_seq.trendings_drawings.findOne({
    where:{
      date:date
    }
  }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
    if(result){
      console.log("it exists rankings draw");
      /*fs.access(__dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
        if(err){
          console.log('suppression already done rankings draw');
          response.status(200).send([{"drawings_trendings":result.trendings}]);
        }  
        else{
          fs.unlink(__dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`,function (err) {
            if (err) {
              throw err;
            } 
            else{
              response.status(200).send([{"drawings_trendings":result.trendings}]);
            }
          });  
          
        }
        
      })*/
      response.status(200).send([{"drawings_trendings":result.trendings}]);
    }
    else{
      let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`));
      trendings_seq.trendings_drawings.create({
        "trendings":json,
        "date":date
      }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
           add_drawings_trendings(json,date)
          return response.status(200).send([{"drawings_trendings":json}]); 
      })
      /*fs.access( __dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
        if(err){
          console.log(" no rankigns drawings anywhere");
          }
          else{
            let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`));
            trendings_seq.trendings_drawings.create({
              "trendings":json,
              "date":date
            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
                return response.status(200).send([{"drawings_trendings":json}]); 
            })
           
          }
        })*/
    }
  })

  
  

}

const get_writings_trendings = (request, response) => {

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); 
  let yyyy= today.getFullYear();
  let date = yyyy.toString() + '-' +  mm + '-' + dd;

  trendings_seq.trendings_writings.findOne({
    where:{
      date:date
    }
  }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
    if(result){
      response.status(200).send([{"writings_trendings":result.trendings}]);
      console.log("it exists");
    }
    else{
      let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`));
      trendings_seq.trendings_writings.create({
        "trendings":json,
        "date":date
      }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
          add_writings_trendings(json,date)
          return response.status(200).send([{"writings_trendings":json}]); 
      })

      
    }
  })


}


  function add_comics_trendings(json,date){
    var list_of_users_for_email=[];
    console.log("add_comics_trendings")
    console.log(Object.keys(json.format).length)
    let list_of_comics=[];
    let obj=Object.keys(json.format);
    let compt=0;
    for(let i=0;i<obj.length;i++){
      if(json.format[i]=='serie'){
        comics_serie_seq.Liste_Bd_Serie.findOne({
          where:{
            bd_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
        }).then(bd=>{
          if(bd){
            list_of_comics[i]=bd;
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          else{
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          
        })
      }
      else{
        comics_oneshot_seq.list_comics_one_shot.findOne({
          where:{
            bd_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
        }).then(bd=>{
          if(bd){
            list_of_comics[i]=bd;
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          else{
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          
        })
      }
    }

    function add_to_data(){
      console.log("add_to_data")
      
      for(let i=0;i<list_of_comics.length;i++){
        if(list_of_comics[i] && list_of_users_for_email.indexOf(list_of_comics[i].authorid)<0){
          list_of_users_for_email.push(list_of_comics[i].authorid)
        }
        if(i==list_of_comics.length-1){
          send_email_to_users(list_of_users_for_email)
        }
        
        if(list_of_comics[i] && !list_of_comics[i].chaptersnumber){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_comics[i].authorid
            }
          }).catch(err => {
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
          }).then(user=>{
            let remuneration= get_remuneration(user.subscribers.length,ranking);
            if(user.gender=='Groupe'){
              finalize_add_to_data(user,i,ranking,remuneration)
            }
            else{
              trendings_seq.trendings_contents.create({
                "publication_category": "comic",
                "id_user": list_of_comics[i].authorid,
                "date":date,
                "rank":ranking,
                "title":list_of_comics[i].title,
                "publication_id":json.publication_id[i],
                "remuneration":remuneration,
                "format":"one-shot"
              })
            }
          })
          
        }
        if(list_of_comics[i] && list_of_comics[i].chaptersnumber>=0){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_comics[i].authorid
            }
          }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
            let remuneration= get_remuneration(user.subscribers.length,ranking);
            if(user.gender=='Groupe'){
              finalize_add_to_data(user,i,ranking,remuneration)
            }
            else{
              trendings_seq.trendings_contents.create({
                "publication_category": "comic",
                "id_user": list_of_comics[i].authorid,
                "date":date,
                "rank":ranking,
                "title":list_of_comics[i].title,
                "publication_id":json.publication_id[i],
                "remuneration":remuneration,
                "format":"serie"
              })
            }
           
          })
          
        }
      }

      function get_ranking(i){
        let minus=0;
        for(let k=0;k<i;k++){
          if(!list_of_comics[k]){
            minus++;
          }
        }
        return i-minus+1;
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
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
        }).then(members=>{
              
          if(members[0]){
            console.log("members_found")
            for(let j=0;j<members.length;j++){
              shares[members[j].id_user]=members[j].share;
            }
            console.log(shares)
            trendings_seq.trendings_contents.create({
              "publication_category": "comic",
              "id_user": list_of_comics[i].authorid,
              "date":date,
              "rank":ranking,
              "shares":[shares],
              "title":list_of_comics[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }
          else{
            trendings_seq.trendings_contents.create({
              "publication_category": "comic",
              "id_user": list_of_comics[i].authorid,
              "date":date,
              "rank":ranking,
              "title":list_of_comics[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }

          
        })
      }

      function send_email_to_users(list_of_users){
        console.log("send_email_to_users")
        console.log(list_of_users)
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user){
              console.log("send email")
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
                to:  user.email, // my mail
                //cc:"adam.drira@etu.emse.fr",
                subject: `Top tendances !`, // Subject line
                //text: 'plain text', // plain text body
                html:  `<p> Félicitation ${user.firstname} ! l'une de vos ouvres a atteint le top tendances pour la catégorie "Bandes dessinées"</p>
                <p><a href="http://localhost:4200/trendings/comics"> Cliquer ici pour voir les tendances</a></p>`, // html body
                // attachments: params.attachments
            };
        
            /*transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error while sending mail: ' + error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                }
            })*/
            }
          })
        }
      }

    }
   
  }


  function add_drawings_trendings(json,date){
    console.log("add_drawings_trendings")
    console.log(Object.keys(json.format).length)
    let list_of_users_for_email=[]
    let list_of_drawings=[];
    let obj=Object.keys(json.format);
    let compt=0;
    for(let i=0;i<obj.length;i++){
      if(json.format[i]=='artbook'){
        drawings_artbook_seq.Liste_Drawings_Artbook.findOne({
          where:{
            drawing_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing=>{
          if(drawing){
            list_of_drawings[i]=drawing;
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          else{
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          
        })
      }
      else{
        drawings_oneshot_seq.Drawings_one_page.findOne({
          where:{
            drawing_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(drawing=>{
          if(drawing){
            list_of_drawings[i]=drawing;
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          else{
            compt++;
            if(compt==obj.length){
              add_to_data()
            }
          }
          
        })
      }
    }

    function add_to_data(){
      console.log("add_to_data draw")
      for(let i=0;i<list_of_drawings.length;i++){
        if(list_of_drawings[i] && list_of_users_for_email.indexOf(list_of_drawings[i].authorid)<0){
          list_of_users_for_email.push(list_of_drawings[i].authorid)
        }
        if(i==list_of_drawings.length-1){
          send_email_to_users(list_of_users_for_email)
        }
        
        if(list_of_drawings[i] && !list_of_drawings[i].pagesnumber){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_drawings[i].authorid
            }
          }).catch(err => {
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
          }).then(user=>{
            let remuneration= get_remuneration(user.subscribers.length,ranking);
            trendings_seq.trendings_contents.create({
              "publication_category": "drawing",
              "id_user": list_of_drawings[i].authorid,
              "date":date,
              "rank":ranking,
              "title":list_of_drawings[i].title,
              "publication_id":json.publication_id[i],
              "remuneration":remuneration,
              "format":"one-shot"
            })
          })
          
        }
        if(list_of_drawings[i] && list_of_drawings[i].pagesnumber>=0){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_drawings[i].authorid
            }
          }).catch(err => {
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
          }).then(user=>{
            let remuneration= get_remuneration(user.subscribers.length,ranking);
            if(user.gender=='Groupe'){
              finalize_add_to_data(user,i,ranking,remuneration);
            }
            else{
              trendings_seq.trendings_contents.create({
                "publication_category": "drawing",
                "id_user": list_of_drawings[i].authorid,
                "date":date,
                "rank":ranking,
                "title":list_of_drawings[i].title,
                "publication_id":json.publication_id[i],
                "remuneration":remuneration,
                "format":"artbook"
              })
            }
            
          })
          
        }
      }

      function get_ranking(i){
        let minus=0;
        for(let k=0;k<i;k++){
          if(!list_of_drawings[k]){
            minus++;
          }
        }
        return i-minus+1;
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
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
        }).then(members=>{
          
          if(members[0]){
            for(let j=0;j<members.length;j++){
              shares[members[j].id_user]=members[j].share;
            }
            trendings_seq.trendings_contents.create({
              "publication_category": "drawing",
              "id_user": list_of_drawings[i].authorid,
              "date":date,
              "rank":ranking,
              "shares":[shares],
              "title":list_of_drawings[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }
          else{
            trendings_seq.trendings_contents.create({
              "publication_category": "drawing",
              "id_user": list_of_drawings[i].authorid,
              "date":date,
              "rank":ranking,
              "title":list_of_drawings[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }

          
        })
      }


      function send_email_to_users(list_of_users){
        console.log("send_email_to_users")
        console.log(list_of_users)
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user){
              console.log("send email")
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
                to: user.email, // my mail
                //cc:"adam.drira@etu.emse.fr",
                subject: `Top tendances !`, // Subject line
                //text: 'plain text', // plain text body
                html:  `<p> Félicitation ${user.firstname} ! l'une de vos ouvres a atteint le top tendances pour la catégorie "Dessins"</p>
                <p><a href="http://localhost:4200/trendings/drawings"> Cliquer ici pour voir les tendances</a></p>`, // html body
                // attachments: params.attachments
            };
        
            /*transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error while sending mail: ' + error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                }
            })*/
            }
          })
        }
      }
    }
   
  }
  


  function add_writings_trendings(json,date){
    console.log("add_writings_trendings")
    console.log(Object.keys(json.format).length)
    let list_of_writings=[];
    let list_of_users_for_email=[]
    let obj=Object.keys(json.format);
    let compt=0;
    for(let i=0;i<obj.length;i++){
      writings_seq.Liste_Writings.findOne({
        where:{
          writing_id:json.publication_id[i],
          status:"public",
        }
      }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(writing=>{
        if(writing){
          list_of_writings[i]=writing;
          compt++;
          if(compt==obj.length){
            add_to_data()
          }
        }
        else{
          compt++;
          if(compt==obj.length){
            add_to_data()
          }
        }
        
      })
      
    }

    function add_to_data(){
      console.log("add_to_data writing")
      for(let i=0;i<list_of_writings.length;i++){
        if(list_of_writings[i] && list_of_users_for_email.indexOf(list_of_writings[i].authorid)<0){
          list_of_users_for_email.push(list_of_writings[i].authorid)
        }
        if(i==list_of_writings.length-1){
          send_email_to_users(list_of_users_for_email)
        }
        if(list_of_writings[i]){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_writings[i].authorid
            }
          }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
            let remuneration= get_remuneration(user.subscribers.length,ranking)
            if(user.gender='Groupe'){
              finalize_add_to_data(user,i,ranking,remuneration)
            }
            else{
              trendings_seq.trendings_contents.create({
                "publication_category": "writing",
                "id_user": list_of_writings[i].authorid,
                "date":date,
                "rank":ranking,
                "title":list_of_writings[i].title,
                "remuneration":remuneration,
                "publication_id":json.publication_id[i],
              })
            }
           
          })
          
        }
        
      }

      function get_ranking(i){
        let minus=0;
        for(let k=0;k<i;k++){
          if(!list_of_writings[k]){
            minus++;
          }
        }
        return i-minus+1;
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
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
        }).then(members=>{
          
          if(members[0]){
            for(let j=0;j<members.length;j++){
              shares[members[j].id_user]=members[j].share;
            }
            trendings_seq.trendings_contents.create({
              "publication_category": "writing",
              "id_user": list_of_writings[i].authorid,
              "date":date,
              "rank":ranking,
              "shares":[shares],
              "title":list_of_writings[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }
          else{
            trendings_seq.trendings_contents.create({
              "publication_category": "writing",
              "id_user": list_of_writings[i].authorid,
              "date":date,
              "rank":ranking,
              "title":list_of_writings[i].title,
              "remuneration":remuneration,
              "publication_id":json.publication_id[i],
            })
          }

          
        })
      }

      function send_email_to_users(list_of_users){
        console.log("send_email_to_users")
        console.log(list_of_users)
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user){
              console.log("send email")
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
                to:  user.email, // my mail
                //cc:"adam.drira@etu.emse.fr",
                subject: `Top tendances !`, // Subject line
                //text: 'plain text', // plain text body
                html:  `<p> Félicitation ${user.firstname} ! l'une de vos ouvres a atteint le top tendances pour la catégorie "Ecrits"</p>
                <p><a href="http://localhost:4200/trendings/writings"> Cliquer ici pour voir les tendances</a></p>`, // html body
                // attachments: params.attachments
            };
        
            /*transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error while sending mail: ' + error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                    
                }
            })*/
            }
          })
        }
      }
    }
   
  }


  function get_remuneration(number,ranking){
    if(ranking>15){
      return '0'
    }
    if(number<1000){
      let num = 1/2+ (1/3)*(1/ranking)*((1/80)*number + 12.5);
      
      return num.toFixed(2)
    }
    if(number<1000){
      let num = 2/5+ (1/3)*(1/ranking)*((3/1000)*number + 20);
      return num.toFixed(2)
    }
    if(number<100000){
      let num = 1 + (1/3)*(1/ranking)*((6/10000)*number + 40);
      return num.toFixed(2)
    }
  }

  module.exports = {
    send_rankings_and_get_trendings_comics,
    get_drawings_trendings,
    get_writings_trendings,
    get_trendings_for_tomorrow
  }