
var {spawn} = require("child_process")
var fastcsv = require("fast-csv");
const fs = require("fs");
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
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";

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

  const get_trendings_for_tomorrow=(request,response) =>{
    if( ! request.headers['authorization'] ) {
      return response.status(401).json({msg: "error"});
    }
    else {
      let val=request.headers['authorization'].replace(/^Bearer\s/, '')
      let user= get_current_user(val)
      if(user!=1){
        return response.status(401).json({msg: "error"});
      }
    }
  
    var today = new Date();
    
    const Op = Sequelize.Op;
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 350);
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();

    let Path1=`/csvfiles_for_python/view_rankings_preview.csv`;
    let Path2=`/csvfiles_for_python/likes_rankings_preview.csv`;
    let Path3=`/csvfiles_for_python/loves_rankings_preview.csv`
    let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
    let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
    let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    let file = __dirname + Path1;
        
        pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
          if (error) {
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
                              //pour ubuntu
                              //const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/rankings_preview.py', date]);
                              const pythonProcess = spawn('python3',['/usr/local/lib/python3.8/dist-packages/rankings_preview.py', date]);
                              pythonProcess.stderr.pipe(process.stderr);
                              pythonProcess.stdout.on('data', (data) => {
                              });
                              pythonProcess.stdout.on("end", (data) => {
                                let files = [__dirname + Path1,__dirname + Path2,__dirname + Path3];
                                for (let i=0;i<files.length;i++){
                                  fs.access(files[i], fs.F_OK, (err) => {
                                    if(err){
                                      if(i==files.length -1){
                                        return response.status(200).send([{preview_done:"done"}]); 
                                        
                                      } 
                                    }  
                                    else{
                                      fs.unlink(files[i],function (err) {
                                        if (err) {
                                        } 
                                        if(i==files.length -1){
                                          return response.status(200).send([{preview_done:"done"}]); 
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

  const send_rankings_and_get_trendings_comics = (request, response) => {
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
    
    const Op = Sequelize.Op;
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 350);
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    
    trendings_seq.trendings_comics.findOne({
      where:{
        date:date
      }
    }).catch(err => {
				
      response.status(500).json({msg: "error", details: err});	
		}).then(result=>{
      if(result){
        response.status(200).send([{"comics_trendings":result.trendings}]);
      }
      else{
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
  
        var dd_yes= String(yesterday.getDate()).padStart(2, '0');
        var mm_yes = String(yesterday.getMonth()+1).padStart(2, '0'); 
        var yyyy_yes = yesterday.getFullYear();
        const date_yes = yyyy_yes.toString() + '-' +  mm_yes  + '-' + dd_yes;


        if(request.headers['authorization']){
          trendings_seq.trendings_comics.findOne({
            where:{
              date:date_yes
            }
          }).then(result=>{
            if(result){
               response.status(200).send([{"comics_trendings":result.trendings}]);
            }
            
            
          })
         
        }
        else{
          call_python()
        }
        
          
        

        function call_python(){
          let Path1=`/csvfiles_for_python/view_rankings.csv`;
          let Path2=`/csvfiles_for_python/likes_rankings.csv`;
          let Path3=`/csvfiles_for_python/loves_rankings.csv`
          let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
          let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
          let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);


          
          pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
            if (error) {
              
            }
            else{
              let json_view = JSON.parse(JSON.stringify(results.rows));
              fastcsv.write(json_view, { headers: true })
              .pipe(ws)
              .on('error', function(e){
              })
              .on("finish", function() {
                pool.query(' SELECT * FROM list_of_likes WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
                    if (error) {
                    }
                    else{

                    let json_likes = JSON.parse(JSON.stringify(results.rows));
                    fastcsv.write(json_likes, { headers: true })
                    .pipe(ws1)
                      .on('error', function(e){
                      })
                      .on("finish", function() {
                    
                        pool.query(' SELECT * FROM list_of_loves WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2   AND monetization=$3', [today,_before_before_yesterday,'true'], (error, results) => {
                            if (error) {
                              
                            }
                            else{
                            let json_loves = JSON.parse(JSON.stringify(results.rows));
                            fastcsv.write(json_loves, { headers: true })
                            .pipe(ws2)
                              .on('error', function(e){
                              })
                              .on("finish", function() {
                                console.log("after finish")
                                //pour ubuntu
                                const pythonProcess = spawn('python3',['/usr/local/lib/python3.8/dist-packages/rankings.py', date]);
                                //const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/rankings.py', date]);
                                pythonProcess.stderr.pipe(process.stderr);
                                pythonProcess.stdout.on('data', (data) => {
                                  console.log("python res")
                                  console.log(data.toString())
                                });
                                pythonProcess.stdout.on("end", (data) => {
                                  let files = [__dirname + Path1,__dirname + Path2,__dirname + Path3];
                                  for (let i=0;i<files.length;i++){
                                    fs.access(files[i], fs.F_OK, (err) => {
                                      if(err){
                                        if(i==files.length -1){
                                          let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`));

                                          trendings_seq.trendings_comics.create({
                                            "trendings":json,
                                            "date":date
                                          }).catch(err => {
                                          }).then(result=>{
                                            response.status(200).send({json: json});	
                                            add_comics_trendings(json,date);
                                          })
                                        } 
                                      }  
                                      else{
                                        fs.unlink(files[i],function (err) {
                                          if (err) {
                                          } 
                                          if(i==files.length -1){
                                            let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`));
                                            trendings_seq.trendings_comics.create({
                                              "trendings":json,
                                              "date":date
                                            }).catch(err => {
                                            }).then(result=>{
                                              response.status(200).send({json: json});
                                              add_comics_trendings(json,date);
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

        

      }
      
    })

}


const get_drawings_trendings = (request, response) => {

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
  

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); 
  let yyyy= today.getFullYear();
  let date = yyyy.toString() + '-' +  mm + '-' + dd;
  var set_money=true;
  if(Number(mm)<4){
    set_money=false;
  }
  trendings_seq.trendings_drawings.findOne({
    where:{
      date:date
    }
  }).catch(err => {
				console.log(err)
					
		}).then(result=>{
    if(result){
      response.status(200).send([{"drawings_trendings":result.trendings}]);
    }
    else{
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      var dd_yes= String(yesterday.getDate()).padStart(2, '0');
      var mm_yes = String(yesterday.getMonth()+1).padStart(2, '0'); 
      var yyyy_yes = yesterday.getFullYear();
      const date_yes = yyyy_yes.toString() + '-' +  mm_yes  + '-' + dd_yes;


      if(request.headers['authorization']){
        trendings_seq.trendings_drawings.findOne({
          where:{
            date:date_yes
          }
        }).catch(err => {
          response.status(500).json({msg: "error", details: err});	
        }).then(result=>{
          if(result){
            response.status(200).send([{"drawings_trendings":result.trendings}]);
          }
        })
      }
      else{
        call_python();
      }


      function call_python(){
        fs.access(__dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
          if(!err){
            let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`));
            trendings_seq.trendings_drawings.create({
              "trendings":json,
              "date":date
              }).then(result=>{
                if(result){
                  response.status(200).send([{type:"drawing",json:json,data:date}]);
                  add_drawings_trendings(json,date,set_money)
                }
            })
          }
        })
      }

     
     
    }
  })

  
  

}

const get_writings_trendings = (request, response) => {

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
  

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); 
  let yyyy= today.getFullYear();
  let date = yyyy.toString() + '-' +  mm + '-' + dd;

  var set_money=true;
  if(Number(mm)<3){
    set_money=false;
  }
  trendings_seq.trendings_writings.findOne({
    where:{
      date:date
    }
  }).catch(err => {
    response.status(500).json({msg: "error", details: err});	
					
		}).then(result=>{
    if(result){
      response.status(200).send([{"writings_trendings":result.trendings}]);

    }
    else{

      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      var dd_yes= String(yesterday.getDate()).padStart(2, '0');
      var mm_yes = String(yesterday.getMonth()+1).padStart(2, '0'); 
      var yyyy_yes = yesterday.getFullYear();
      const date_yes = yyyy_yes.toString() + '-' +  mm_yes  + '-' + dd_yes;


      if(request.headers['authorization']){
        trendings_seq.trendings_writings.findOne({
          where:{
            date:date_yes
          }
        }).catch(err => {
          response.status(500).json({msg: "error", details: err});	
        }).then(result=>{
          if(result){
            response.status(200).send([{"writings_trendings":result.trendings}]);
          }
        })
      }
      else{
        call_python()
      }

      function call_python(){
        fs.access(__dirname + `/python_files/writings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
          if(!err){
            let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`));
            trendings_seq.trendings_writings.create({
              "trendings":json,
              "date":date
              }).catch(err => {
              }).then(result=>{
                if(result){
                  response.status(200).send([{type:"writing",json:json,data:date}]);
                  add_writings_trendings(json,date,set_money)
                }
            })
          }
        })
      }

     

      
    }
  })


}


  function add_comics_trendings(json,date){
    var list_of_users_for_email=[];
    let list_of_comics=[];
    let obj=Object.keys(json.format).slice(0,40);
    let compt=0;


    let today = new Date();
    let mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var set_money=true;
    if(Number(mm)<3){
      set_money=false;
    }

    for(let i=0;i<obj.length;i++){
      if(json.format[i]=='serie'){
        comics_serie_seq.Liste_Bd_Serie.findOne({
          where:{
            bd_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
          response.status(500).json({msg: "error", details: err});	
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
            	
          }).then(user=>{
            let remuneration='0';
            /*if(set_money){
              remuneration= get_remuneration(user.subscribers.length,ranking);
            }
            else{
              remuneration='0'
            }*/
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
              	
            }).then(user=>{
            let remuneration='0';
            /*if(set_money){
              remuneration= get_remuneration(user.subscribers.length,ranking);
            }
            else{
              remuneration='0'
            }*/

           
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
          	
        }).then(members=>{
              
          if(members[0]){
            for(let j=0;j<members.length;j++){
              shares[members[j].id_user]=members[j].share;
            }
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
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user && user.email_authorization!="false"){
              const Op = Sequelize.Op;
              var byesterday = new Date();
              byesterday.setDate(byesterday.getDate() - 2);
              authentification.users_connexions.findOne({
                where:{
                  id_user:list_of_users[i],
                  createdAt: {[Op.gte]: byesterday}
                }
                
              }).then(r=>{

                if(!r){
                  send_email()
                }
              })

             function send_email(){
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
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Top Tendances !</p>
                          </td>
                      </tr>
                  </table>`;
      
                 
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                    <tr id="tr3">
      
                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Félicitation ${user.firstname} !</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">L'une de vos œuvres a atteint le top 15 des <b>Tendances</b> pour la catégorie <b>Bandes dessinées</b>.</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Cliquez sur le bouton ci-dessous pour accéder aux tendances et découvrir le classement de votre œuvre : </p>
      
                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://linkarts.fr/home/trendings/comics" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Accéder aux tendances
                                </a>
                            </div>
      
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3-18-01.svg"  height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
                        </td>
      
                    </tr>
                  </table>`
      
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                      <tr id="tr4">
                          <td align="center">
                              <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                              <p style="margin: 10px auto 5px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
                              <a style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;" href="https://www.linkarts.fr/account/${user.nickname}/my_account/email/management">Gérer mes e-mails.</a>
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
                  to:  user.email, // my mail
                  //to: "appaloosa-adam@hotmail.fr",
                  subject: `Top tendances !`, // Subject line
                  html: mail_to_send, // html body
              };
        
              /*transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log('Error while sending mail: ' + error);
                  }
              })*/

             }
              
            }
          })
        }
      }

    }
   
  }


  function add_drawings_trendings(json,date,set_money){
    let list_of_users_for_email=[]
    let list_of_drawings=[];
    let obj=Object.keys(json.format).slice(0,40);
    let compt=0;
    for(let i=0;i<obj.length;i++){
      if(json.format[i]=='artbook'){
        drawings_artbook_seq.Liste_Drawings_Artbook.findOne({
          where:{
            drawing_id:json.publication_id[i],
            status:"public",
          }
        }).catch(err => {
				
					
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
            	
            		
          }).then(user=>{
            let remuneration='0';
            /*if(set_money){
              remuneration= get_remuneration(user.subscribers.length,ranking);
            }
            else{
              remuneration='0'
            }*/
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
                "format":"one-shot"
              })
            }
            
          })
          
        }
        if(list_of_drawings[i] && list_of_drawings[i].pagesnumber>=0){
          let ranking=get_ranking(i);
          authentification.users.findOne({
            where:{
              id:list_of_drawings[i].authorid
            }
          }).catch(err => {
            	
            		
          }).then(user=>{
            let remuneration='0';
            /*if(set_money){
              remuneration= get_remuneration(user.subscribers.length,ranking);
            }
            else{
              remuneration='0'
            }*/
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
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user && user.email_authorization!="false"){
              const Op = Sequelize.Op;
              var byesterday = new Date();
              byesterday.setDate(byesterday.getDate() - 2);
              authentification.users_connexions.findOne({
                where:{
                  id_user:list_of_users[i],
                  createdAt: {[Op.gte]: byesterday}
                }
              }).then(r=>{
                if(!r){
                  send_email()
                }
              })

             function send_email(){

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
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Top Tendances !</p>
                          </td>
                      </tr>
                  </table>`;
      
                 
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                    <tr id="tr3">
      
                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Félicitation ${user.firstname} !</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">L'une de vos œuvres a atteint le top 15 des <b>Tendances</b> pour la catégorie <b>Dessins</b>.</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Cliquez sur le bouton ci-dessous pour accéder aux tendances et découvrir le classement de votre œuvre : </p>
      
                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://linkarts.fr/home/trendings/drawings" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Accéder aux tendances
                                </a>
                            </div>
      
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3-18-01.svg"  height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
                        </td>
      
                    </tr>
                  </table>`
      
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                      <tr id="tr4">
                          <td align="center">
                              <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                              <p style="margin: 10px auto 5px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
                              <a style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;" href="https://www.linkarts.fr/account/${user.nickname}/my_account/email/management">Gérer mes e-mails.</a>
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
                  to:  user.email, // my mail
                  //to: "appaloosa-adam@hotmail.fr",
                  subject: `Top tendances !`, // Subject line
                  html: mail_to_send, // html body
              };
        
              /*transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log('Error while sending mail: ' + error);
                  }
              })*/

             }

        
            }
          })
        }
      }
    }
   
  }
  


  function add_writings_trendings(json,date,set_money){
    let list_of_writings=[];
    let list_of_users_for_email=[]
    let obj=Object.keys(json.format).slice(0,40);
    let compt=0;
    for(let i=0;i<obj.length;i++){
      writings_seq.Liste_Writings.findOne({
        where:{
          writing_id:json.publication_id[i],
          status:"public",
        }
      }).catch(err => {
				
					
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
            	
            		
          }).then(user=>{ 
            let remuneration='0';
              /*if(set_money){
                remuneration= get_remuneration(user.subscribers.length,ranking);
              }
              else{
                remuneration='0'
              }*/
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
        for(let i=0;i<list_of_users.length;i++){
          authentification.users.findOne({
            where:{
              id:list_of_users[i]
            }
          }).then(user=>{
            if(user && user.email_authorization!="false"){
              const Op = Sequelize.Op;
              var byesterday = new Date();
              byesterday.setDate(byesterday.getDate() - 2);
              authentification.users_connexions.findOne({
                where:{
                  id_user:list_of_users[i],
                  createdAt: {[Op.gte]: byesterday}
                }
              }).then(r=>{
                if(!r){
                  send_email()
                }
              })

             function send_email(){

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
                              <p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Top Tendances !</p>
                          </td>
                      </tr>
                  </table>`;
      
                 
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                    <tr id="tr3">
      
                        <td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Félicitation ${user.firstname} !</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">L'une de vos œuvres a atteint le top 15 des <b>Tendances</b> pour la catégorie <b>Écrit</b>.</p>
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Cliquez sur le bouton ci-dessous pour accéder aux tendances et découvrir le classement de votre œuvre : </p>
      
                            <div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
                                <a href="https://linkarts.fr/home/trendings/writings" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
                                    Accéder aux tendances
                                </a>
                            </div>
      
                            <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
                            <img src="https://www.linkarts.fr/assets/img/svg/Logo-LA3-18-01.svg"   height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
                        </td>
      
                    </tr>
                  </table>`
      
                  mail_to_send+=`
                  <table style="width:100%;margin:25px auto;">
                      <tr id="tr4">
                          <td align="center">
                              <p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
                              <p style="margin: 10px auto 5px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
                              <a style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;" href="https://www.linkarts.fr/account/${user.nickname}/my_account/email/management">Gérer mes e-mails.</a>
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
                  to:  user.email, // my mail
                  //to: "appaloosa-adam@hotmail.fr",
                  subject: `Top tendances !`, // Subject line
                  html: mail_to_send, // html body
              };
        
              /*transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log('Error while sending mail: ' + error);
                  }
              })*/
        
             }
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

  module.exports = {
    send_rankings_and_get_trendings_comics,
    get_drawings_trendings,
    get_writings_trendings,
    get_trendings_for_tomorrow
  }