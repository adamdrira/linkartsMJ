const comics_one_shot = require('../../comics_one_shot_and_cover/models/sequelize');
const comics_serie = require('../../comics_serie/models/sequelize');
const drawings_artbook = require('../../drawings_artbook/models/sequelize');
const drawings_one_shot = require('../../drawings_one_shot_and_cover/models/sequelize');
const writings = require('../../writings/models/sequelize');
const fetch = require("node-fetch");
var {spawn} = require("child_process")
var path = require('path');
var {PythonShell} = require('python-shell');
const usercontroller = require('../../authentication/user.controller');
var Request = require('request');
const fs = require("fs");
const jwt = require('jsonwebtoken');
var fastcsv = require("fast-csv");
const Sequelize = require('sequelize');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
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





const generate_recommendations = (request, response) => {
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 280);



  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

  

  pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1  AND "createdAt" ::date <=$2 AND "createdAt" ::date >= $3 limit 100', [user,_today,last_week], (error, results) => {
    if (error) {
      console.log(error)
      return response.status(500).send([{"error":error}]);
    }
    let jsonData = JSON.parse(JSON.stringify(results.rows));
    let fast = fastcsv.write(jsonData, { headers: true });
    let ws = fs.createWriteStream(`./data_and_routes/routes/csvfiles_for_python/classement_python-${user}.csv`);
    fast.pipe(ws)
    .on('error', function(e){
     // console.log(e)
    })
    .on("finish", function() {
        console.log("raady to load " + jsonData.length);
        if(jsonData.length>=1){
          

          const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/list_of_views.py', user]);
          pythonProcess.stderr.pipe(process.stderr);
          pythonProcess.stdout.on('data', (data) => {
           // console.log("python res")
            //console.log(data.toString())
          });
          pythonProcess.stdout.on("end", (data) => {
           // console.log("end received data python: ");
            fs.access(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`, fs.F_OK, (err) => {
              if(err){
                console.log(err)
              }  
              else{
                fs.unlink(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`,function (err) {
                  if (err) {
                    console.log(err)
                  } 
                });
              } 
            })
            var index_bd=-1;
            var index_writing=-1;
            var index_drawing=-1;
            let json = fs.readFileSync( __dirname + `/python_files/recommendations-${user}.json`);
            let styles_recommendation = JSON.parse(json);
            for (let step=0; step <Object.keys(styles_recommendation).length;step++){
              if(styles_recommendation.comic!= undefined){
                if (styles_recommendation.comic[step]!=null){
                  index_bd=step
                };
              }
              if(styles_recommendation.drawing!=undefined){
                if (styles_recommendation.drawing[step]!=null){
                  index_drawing=step
                };
              }
              
              if(styles_recommendation.writing!=undefined){
                if (styles_recommendation.writing[step]!=null){
                  index_writing=step
                };
              }
              
            }
            var sorted_list_category = {
              "comic": index_bd,
              "writing": index_writing,
              "drawing": index_drawing,
            }

            //let json2 = fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`); 
            //console.log("reading to send 1")
            //console.log(JSON.parse(json2))
            response.cookie("recommendations",[{styles_recommendation:styles_recommendation,sorted_list_category:sorted_list_category}]).send([{sorted_list_category:sorted_list_category,styles_recommendation:styles_recommendation}]);  
          });

          
        }
        else{
          let PATH = `./data_and_routes/routes/python_files/recommendations-${user}.json`;
          let PATH2 = `./data_and_routes/routes/python_files/recommendations_artpieces-${user}.json`;
          let array_to_convert_in_json={"comic":
                                          {"0":null,"1":null,"2":null},
                                        "drawing":
                                          {"0":null,"1":null,"2":null},
                                        "writing":
                                          {"0":null,"1":null,"2":null}         
                                        }


          fs.writeFile(PATH, JSON.stringify(array_to_convert_in_json), (err) => {
            if (err){
              console.log(err)
            } 
            fs.writeFile(PATH2, JSON.stringify(array_to_convert_in_json), (err) => {
              if (err){
                console.log(err)
                response.status(500).send([{error:err}])
              } 
              else{
                var list_bd_os_to_send=[];
                var list_bd_serie_to_send=[];
                let compteur_os=0;
                let compteur_serie=0;
                //os
                complete_recommendation_bd([],response,user,'Manga',"one-shot", (req)=>{
                  sort_os_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'Comics',"one-shot", (req)=>{
                  sort_os_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'BD',"one-shot", (req)=>{
                  sort_os_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'Webtoon',"one-shot", (req)=>{
                  sort_os_styles(req[0])
                })

                function sort_os_styles(req){
                  if(list_bd_os_to_send.length>0){
                    if(req.length>0){
                      list_bd_os_to_send = list_bd_os_to_send.concat(req);
                    }
                  }
                  else{
                    if(req.length>0){
                      list_bd_os_to_send = req;
                    }
                  }
                  compteur_os++
                  if(compteur_serie==4 && compteur_os==4){
                    response.status(200).json([{
                      "list_bd_os_to_send":list_bd_os_to_send,
                      "list_bd_serie_to_send":list_bd_serie_to_send
                    }])
                  }

                }

                //serie
                complete_recommendation_bd([],response,user,'Manga',"serie", (req)=>{
                  sort_serie_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'Comics',"serie", (req)=>{
                  sort_serie_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'BD',"serie", (req)=>{
                  sort_serie_styles(req[0])
                })
                complete_recommendation_bd([],response,user,'Webtoon',"serie", (req)=>{
                  sort_serie_styles(req[0])
                })

                

                function sort_serie_styles(req){
                  if(list_bd_serie_to_send.length>0){
                    if(req.length>0){
                      list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
                    }
                  }
                  else{
                    if(req.length>0){
                      list_bd_serie_to_send = req;
                    }
                  }
                  compteur_serie++
                  if(compteur_serie==4 && compteur_os==4){
                    response.status(200).json([{
                      "list_bd_os_to_send":list_bd_os_to_send,
                      "list_bd_serie_to_send":list_bd_serie_to_send
                    }])
                  }

                }

              }
              
              
            })
          }) 
        }
      })
    })

} 

const get_first_recommendation_bd_os_for_user = (request, response) => {
  console.log("get first recommendations bd")

  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();
 
 var list_bd_os
  function get_it(){
    if(index_bd<0){
      list_bd_os=null;
    }
    else{
      list_bd_os= test.comic[index_bd];
    }
    var compt = 0;
   
    if (list_bd_os!=null){
      for(let i = 0; i < list_bd_os.length; ++i){
        if(list_bd_os[i][1]=="one-shot"){
          compt=compt + 1;
        }
      }
    }
  
    var list_bd_os_to_send=[];
    var list_bd_os_to_compare=[];
    var list_of_bd_os_already_seen=[];
    var compteur_os=0;
    let number_of_contents_by_category=[0,0,0,0] // Manga,Comics,BD,Webtoon
    let styles_with_contents_already_seen=[];
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_bd_os.length;item++){  
        if (list_bd_os[item][1]=="one-shot"){
          list_of_bd_os_already_seen.push(list_bd_os[item][0])
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid=(SELECT authorid FROM liste_bd_one_shot WHERE bd_id = $4) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND bd_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"comic","one-shot",list_bd_os[item][0]], (error, results) => {
            if (error) {
              console.log(error)
              response.status(500).send([{"error":error}]);
            }
            else{
              let result = JSON.parse(JSON.stringify(results.rows));
              let check = list_bd_os_to_compare.includes(JSON.stringify(result));
              
              if (!check ){
                if(result[0]){
                  if(result[0].category=="Manga"){
                    number_of_contents_by_category[0]+=1;
                  }
                  if(result[0].category=="Comics"){
                    number_of_contents_by_category[1]+=1;
                  }
                  if(result[0].category=="BD"){
                    number_of_contents_by_category[2]+=1;
                  }
                  if(result[0].category=="Webtoon"){
                    number_of_contents_by_category[3]+=1;
                  }
                  list_bd_os_to_compare.push(JSON.stringify(result));
                  list_bd_os_to_send.push(result);
                }
              }
              k++;
              
              if(k == compt){

                  if(number_of_contents_by_category[0]<6){
                    complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Manga',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[0]=true;
                      }
                      sort_os_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[1]<6){
                    complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Comics',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[1]=true;
                      }
                      sort_os_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[2]<6){
                    complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'BD',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[2]=true;
                      }
                      sort_os_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[3]<6){
                    complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Webtoon',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[3]=true;
                      }
                      sort_os_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
                  
                  
                  function add_compteur(){
                    compteur_os++;
                    if(compteur_os==4 ){
                      response.status(200).json([{
                        "list_bd_os_to_send":list_bd_os_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
                  }
  
                  function sort_os_styles(req){
                    if(list_bd_os_to_send.length>0){
                      if(req.length>0){
                        list_bd_os_to_send = list_bd_os_to_send.concat(req);
                      }
                    }
                    else{
                      if(req.length>0){
                        list_bd_os_to_send = req;
                      }
                    }
                    compteur_os++;
                    if(compteur_os==4 ){
                      response.status(200).json([{
                        list_bd_os_to_send:list_bd_os_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
  
                  }
                
              }          
            }
        });
        }
      }
    }
    else{
      complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Manga',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[0]=true;
        }
        sort_os_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Comics',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[1]=true;
        }
        sort_os_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'BD',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[2]=true;
        }
        sort_os_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_os_already_seen,response,user,'Webtoon',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[3]=true;
        }
        sort_os_styles(req[0])
      })

      function sort_os_styles(req){
      
        if(list_bd_os_to_send.length>0){
          if(req.length>0){
            list_bd_os_to_send = list_bd_os_to_send.concat(req);
          }
        }
        else{
          if(req.length>0){
            list_bd_os_to_send = req;
          }
        }
        compteur_os++;
        if(compteur_os==4 ){
          response.status(200).json([{
            "list_bd_os_to_send":list_bd_os_to_send,
            number_of_contents_by_category:number_of_contents_by_category,
            styles_with_contents_already_seen:styles_with_contents_already_seen
          }])
        }

      }
    }
  }
  
}

const get_first_recommendation_bd_serie_for_user = (request, response) => {
  console.log("get first recommendations serie")
  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();

  var list_bd
  function get_it(){
    if(index_bd<0){
      list_bd=null;
    }
    else{
      list_bd= test.comic[index_bd];
    }
    var compt = 0;
  
    if (list_bd!=null){
      for(var i = 0; i < list_bd.length; ++i){
        if(list_bd[i][1]=="serie")
            //list_bd.splice(i, 1);
            compt= compt+1;
      }
    }
  
    var list_bd_serie_to_send=[];
    var list_bd_serie_to_compare=[];
    var list_of_bd_serie_already_seen=[];
    var compteur_serie=0;
    let styles_with_contents_already_seen=[];
    var number_of_contents_by_category=[0,0,0,0]
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_bd.length;item++){  
         if (list_bd[item][1]=="serie"){
          list_of_bd_serie_already_seen.push(list_bd[item][0])
          pool.query('SELECT * FROM liste_bd_serie WHERE authorid=(SELECT authorid FROM liste_bd_serie WHERE bd_id = $4) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND bd_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"comic","serie",list_bd[item][0]], (error, results) => {
            if (error) {
              console.log(error)
              response.status(500).send([{"error":error}]);
            }
            else{
              let result = JSON.parse(JSON.stringify(results.rows));
              let check = list_bd_serie_to_compare.includes(JSON.stringify(result));
              if (!check ){
                if(result[0]){
                  if(result[0].category=="Manga"){
                    number_of_contents_by_category[0]+=1;
                  }
                  if(result[0].category=="Comics"){
                    number_of_contents_by_category[1]+=1;
                  }
                  if(result[0].category=="BD"){
                    number_of_contents_by_category[2]+=1;
                  }
                  if(result[0].category=="Webtoon"){
                    number_of_contents_by_category[3]+=1;
                  }
                  list_bd_serie_to_compare.push(JSON.stringify(result));
                  list_bd_serie_to_send.push(result);
                }
               
              }
  
              k++;
              if(k == compt){

                  if(number_of_contents_by_category[0]<6){
                    complete_recommendation_bd(list_of_bd_serie_already_seen, response,user,'Manga',"serie", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[0]=true;
                      }
                      sort_serie_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[1]<6){
                    complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'Comics',"serie", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[1]=true;
                      }
                      sort_serie_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[2]<6){
                    complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'BD',"serie", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[2]=true;
                      }
                      sort_serie_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
  
                  if(number_of_contents_by_category[3]<6){
                    complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'Webtoon',"serie", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[3]=true;
                      }
                      sort_serie_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
                  
                  
                  function add_compteur(){
                    compteur_serie++;
                    if(compteur_serie==4 ){
                      response.status(200).json([{
                        "list_bd_serie_to_send":list_bd_serie_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
                  }

                  function sort_serie_styles(req){
                    
                    if(list_bd_serie_to_send.length>0){
                      if(req.length>0){
                        list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
                      }
                    }
                    else{
                      if(req.length>0){
                        list_bd_serie_to_send = req;
                      }
                    }
                    compteur_serie++;
                    if(compteur_serie==4 ){
                      response.status(200).json([{
                        "list_bd_serie_to_send":list_bd_serie_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
  
                  }
                
                
              }
            }
        });
        }
      }
    }
    else{
      complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'Manga',"serie", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[0]=true;
        }
        sort_serie_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'Comics',"serie", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[1]=true;
        }
        sort_serie_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'BD',"serie", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[2]=true;
        }
        sort_serie_styles(req[0])
      })
      complete_recommendation_bd(list_of_bd_serie_already_seen,response,user,'Webtoon',"serie", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[3]=true;
        }
        sort_serie_styles(req[0])
      })

      

      function sort_serie_styles(req){
       
        if(list_bd_serie_to_send.length>0){
          if(req.length>0){
            list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
          }
        }
        else{
          if(req.length>0){
            list_bd_serie_to_send = req;
          }
        }
        compteur_serie++;
        if(compteur_serie==4 ){
          response.status(200).json([{
            "list_bd_serie_to_send":list_bd_serie_to_send,
            number_of_contents_by_category:number_of_contents_by_category,
            styles_with_contents_already_seen:styles_with_contents_already_seen
          }])
        }

      }
    }
  }
  
}

const get_first_recommendation_drawing_artbook_for_user = (request, response) => {

  const index_drawing =request.body.index_drawing;
  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();

  var list_drawing_artbook
  function get_it(){
    if(index_drawing<0){
      list_drawing_artbook=null;
    }
    else{
      list_drawing_artbook= test.drawing[index_drawing];
    }
   
    var compt =0;
   
    if (list_drawing_artbook!=null){
      for(var i = 0; i < list_drawing_artbook.length; ++i){
        if(list_drawing_artbook[i][1]=="artbook"){
          compt=compt+1;
        }
      }
    }
  
    var list_artbook_to_send=[];
    var list_artbook_to_compare=[];
    var list_artbooks_already_seen=[];
    let number_of_contents_by_category=[0,0]  // Traditionnel Digital
    var compteur_artbook=0;
    let styles_with_contents_already_seen=[];
    
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_drawing_artbook.length;item++){  
        if (list_drawing_artbook[item][1]=="artbook"){
          list_artbooks_already_seen.push(list_drawing_artbook[item][0])
          pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid=(SELECT authorid FROM liste_drawings_artbook WHERE drawing_id = $4) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND drawing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"drawing","artbook",list_drawing_artbook[item][0]], (error, results) => {
            if (error) {
              console.log(error)
              response.status(500).send([{"error":error}]);
            }
            else{
              let result = JSON.parse(JSON.stringify(results.rows));
              let check = list_artbook_to_compare.includes(JSON.stringify(result));
              if (!check  ){
                if(result[0]){
                  if(result[0].category=="Traditionnel"){
                    number_of_contents_by_category[0]+=1;
                  }
                  if(result[0].category=="Digital"){
                    number_of_contents_by_category[1]+=1;
                  }
                  list_artbook_to_compare.push(JSON.stringify(result));
                  list_artbook_to_send.push(result);
                }
                
              }
              k++;
              if(k == compt){
                  if(number_of_contents_by_category[0]<20){
                    complete_recommendation_drawing(list_artbooks_already_seen,response,user,'Traditionnel',"artbook", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[0]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }


                  if(number_of_contents_by_category[1]<20){
                    complete_recommendation_drawing(list_artbooks_already_seen,response,user,'Digital',"artbook", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[1]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
                 
                  function add_compteur(){
                      compteur_artbook++
                      if(compteur_artbook==2 ){
                        response.status(200).json([{
                          "list_artbook_to_send":list_artbook_to_send,
                          number_of_contents_by_category:number_of_contents_by_category
                        }])
                      }
                  }
  
                  function sort_styles(req){
                    if(list_artbook_to_send.length>0){
                      if(req.length>0){
                        list_artbook_to_send = list_artbook_to_send.concat(req);
                      }
                    }
                    else{
                      if(req.length>0){
                        list_artbook_to_send = req;
                      }
                    }
                    compteur_artbook++
                    if(compteur_artbook==2 ){
                      response.status(200).json([{
                        "list_artbook_to_send":list_artbook_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
  
                  }  
                    
                 
              }
              
            }
        });
        }
      }
    }
    else{
      complete_recommendation_drawing(list_artbooks_already_seen,response,user,'Traditionnel',"artbook", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[0]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_drawing(list_artbooks_already_seen,response,user,'Digital',"artbook", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[1]=true;
        }
        sort_styles(req[0])
      })

      function sort_styles(req){
        if(list_artbook_to_send.length>0){
          if(req.length>0){
            list_artbook_to_send = list_artbook_to_send.concat(req);
          }
        }
        else{
          if(req.length>0){
            list_artbook_to_send = req;
          }
        }
        compteur_artbook++
        if(compteur_artbook==2 ){
          response.status(200).json([{
            "list_artbook_to_send":list_artbook_to_send,
            number_of_contents_by_category:number_of_contents_by_category,
            styles_with_contents_already_seen:styles_with_contents_already_seen
          }])
        }

      } 
    }
  }
  
}

const get_first_recommendation_drawing_os_for_user = (request, response) => {

  const index_drawing =request.body.index_drawing;
  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();
  var list_drawing_os
  function get_it(){
    if(index_drawing<0){
      list_drawing_os=null;
    }
    else{
      list_drawing_os= test.drawing[index_drawing];
    }
    
    var compt = 0;
  
    if (list_drawing_os!=null){
      for(var i = 0; i < list_drawing_os.length; ++i){
        if(list_drawing_os[i][1]=="one-shot")
        compt=compt+1;
      }
    }
  
    var list_drawing_os_to_send=[];
    var list_drawing_os_to_compare=[];
    let styles_with_contents_already_seen=[];
    
    var compteur_os=0;
    let number_of_contents_by_category=[0,0]  //Traditionnel, Digital
    var list_drawings_os_already_seen=[]
    if(compt!=0){
      let k=0 //compteur pour savoir si on en a fini avec le format
      for (let item=0; item< list_drawing_os.length;item++){  
        if (list_drawing_os[item][1]=="one-shot"){
          list_drawings_os_already_seen.push(list_drawing_os[item][0])
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_drawings_one_page WHERE authorid=(SELECT authorid FROM liste_drawings_one_page WHERE drawing_id = $4) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND drawing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"drawing","one-shot",list_drawing_os[item][0]], (error, results) => {
            if (error) {
              console.log(error)
              response.status(500).send([{"error":error}]);
            }
            else{
              let result = JSON.parse(JSON.stringify(results.rows));
              let check = list_drawing_os_to_compare.includes(JSON.stringify(result));
              if (!check ){
                if(result[0]){
                  if(result[0].category=="Traditionnel"){
                    number_of_contents_by_category[0]+=1;
                  }
                  if(result[0].category=="Digital"){
                    number_of_contents_by_category[1]+=1;
                  }
                  list_drawing_os_to_compare.push(JSON.stringify(result));
                  list_drawing_os_to_send.push(result);
                }
                
              }
              k++;
              if(k == compt){ 

                  if(number_of_contents_by_category[0]<12){
                    complete_recommendation_drawing(list_drawings_os_already_seen,response,user,'Traditionnel',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[0]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
                  
                  if(number_of_contents_by_category[1]<12){
                    complete_recommendation_drawing(list_drawings_os_already_seen,response,user,'Digital',"one-shot", (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[1]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }
                 
  
                  function add_compteur(){
                    compteur_artbook++
                    if(compteur_os==2 ){
                      response.status(200).json([{
                        "list_drawing_os_to_send":list_drawing_os_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
                  }


                  function sort_styles(req){
                    if(list_drawing_os_to_send.length>0){
                      if(req.length>0){
                        list_drawing_os_to_send = list_drawing_os_to_send.concat(req);
                      }
                    }
                    else{
                      if(req.length>0){
                        list_drawing_os_to_send = req;
                      }
                    }
                    compteur_os++;
                    if(compteur_os==2 ){
                      response.status(200).json([{
                        "list_drawing_os_to_send":list_drawing_os_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
  
                  } 
                
              }
              
            }
        });
        }
      }
    }
    else{
      complete_recommendation_drawing(list_drawings_os_already_seen,response,user,'Traditionnel',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[0]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_drawing(list_drawings_os_already_seen,response,user,'Digital',"one-shot", (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[1]=true;
        }
        sort_styles(req[0])
      })

      function sort_styles(req){
        if(list_drawing_os_to_send.length>0){
          if(req.length>0){
            list_drawing_os_to_send = list_drawing_os_to_send.concat(req);
          }
        }
        else{
          if(req.length>0){
            list_drawing_os_to_send = req;
          }
        }
        compteur_os++;
        if(compteur_os==2 ){
          response.status(200).json([{
            "list_drawing_os_to_send":list_drawing_os_to_send,
            number_of_contents_by_category:number_of_contents_by_category,
            styles_with_contents_already_seen:styles_with_contents_already_seen
          }])
        }

      }  
    }
  }
 

}

const get_first_recommendation_writings_for_user = (request, response) => {

  const index_writing =request.body.index_writing;


  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();
 
  var list_writing
  function get_it(){
    if(index_writing<0){
      list_writing=null;
    }
    else{
      list_writing= test.writing[index_writing];
    }
  
  
    var list_writings_to_send=[];
    var list_writings_to_compare=[];
    var compteur_writing=0;
    let styles_with_contents_already_seen=[];
    
    var list_of_writings_already_seen=[]
    let number_of_contents_by_category=[0,0,0,0,0] // Article,Roman,Illustrated novel,Poetry,Scenario
    if(list_writing!=null){
      let k=0;
      for (let item=0; item< list_writing.length;item++){ 
        list_of_writings_already_seen.push(list_writing[item][0]) 
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_writings WHERE authorid=(SELECT authorid FROM liste_writings WHERE writing_id = $3) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND writing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 ) ORDER BY viewnumber DESC limit 1', [user,"writing",list_writing[item][0]], (error, results) => {
            if (error) {
              console.log(error)
              response.status(500).send([{"error":error}]);
            }
            else{
              let result = JSON.parse(JSON.stringify(results.rows));
              let check = list_writings_to_compare.includes(JSON.stringify(result));
              if (!check ){
                if(result[0]){
                  if(result[0].category=="Article"){
                    number_of_contents_by_category[0]+=1;
                  }
                  if(result[0].category=="Roman"){
                    number_of_contents_by_category[1]+=1;
                  }
                  if(result[0].category=="Illustrated novel"){
                    number_of_contents_by_category[2]+=1;
                  }
                  if(result[0].category=="Poetry"){
                    number_of_contents_by_category[3]+=1;
                  }
                  if(result[0].category=="Scenario"){
                    number_of_contents_by_category[4]+=1;
                  }
                  list_writings_to_compare.push(JSON.stringify(result));
                  list_writings_to_send.push(result);
                }
                
              }
              k++;
              if(k == list_writing.length){
                  if(number_of_contents_by_category[0]<6){
                    complete_recommendation_writing(list_of_writings_already_seen,response,user,'Article', (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[0]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[1]<6){
                    complete_recommendation_writing(list_of_writings_already_seen,response,user,'Roman', (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[1]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[2]<6){
                    complete_recommendation_writing(list_of_writings_already_seen,response,user,'Illustrated novel', (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[2]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[3]<6){
                    complete_recommendation_writing(list_of_writings_already_seen,response,user,'Poetry', (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[3]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  if(number_of_contents_by_category[4]<6){
                    complete_recommendation_writing(list_of_writings_already_seen,response,user,'Scenario', (req)=>{
                      if(req[1]){
                        styles_with_contents_already_seen[4]=true;
                      }
                      sort_styles(req[0])
                    })
                  }
                  else{
                    add_compteur()
                  }

                  
  
                  function add_compteur(){
                    compteur_writing++;
                    if(compteur_writing==5 ){
                      response.status(200).json([{
                        "list_writings_to_send":list_writings_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
                  }

                  function sort_styles(req){
                    if(list_writings_to_send.length>0){
                      if(req.length>0){
                        list_writings_to_send = list_writings_to_send.concat(req);
                      }
                    }
                    else{
                      if(req.length>0){
                        list_writings_to_send = req;
                      }
                    }
                    compteur_writing++;
                    if(compteur_writing==5 ){
                      response.status(200).json([{
                        "list_writings_to_send":list_writings_to_send,
                        number_of_contents_by_category:number_of_contents_by_category,
                        styles_with_contents_already_seen:styles_with_contents_already_seen
                      }])
                    }
  
                  } 
              }          
            }
        });
        
      }
    }
    else{
      
      complete_recommendation_writing(list_of_writings_already_seen,response,user,'Article', (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[0]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_writing(list_of_writings_already_seen,response,user,'Roman', (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[1]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_writing(list_of_writings_already_seen,response,user,'Illustrated novel', (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[2]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_writing(list_of_writings_already_seen,response,user,'Poetry', (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[3]=true;
        }
        sort_styles(req[0])
      })
      complete_recommendation_writing(list_of_writings_already_seen,response,user,'Scenario', (req)=>{
        if(req[1]){
          styles_with_contents_already_seen[4]=true;
        }
        sort_styles(req[0])
      })

      function sort_styles(req){
        if(list_writings_to_send.length>0){
          if(req.length>0){
            list_writings_to_send = list_writings_to_send.concat(req);
          }
        }
        else{
          if(req.length>0){
            list_writings_to_send = req;
          }
        }
        compteur_writing++;
        if(compteur_writing==5 ){
          response.status(200).json([{
            "list_writings_to_send":list_writings_to_send,
            number_of_contents_by_category:number_of_contents_by_category,
            styles_with_contents_already_seen:styles_with_contents_already_seen
          }])
        }

      } 
    }
  }
  


} 


function complete_recommendation_bd(list_of_bd_already_seen,response,user,style,format,callback){

  
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 280);
  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1  AND view_time is not null AND style=$2 AND format=$5 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,format], (error, results1) => {
      if (error) {
        console.log(error)
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(format=="one-shot" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
              if (error) {
                console.log(error)
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
                  if(i==result1.length){
                    callback([list_to_send,false]);
                  }
                }
                else if (result2.length==0){
                  if(i==result1.length){
                    if(list_of_bd_already_seen.length>0){
                      comics_one_shot.list_comics_one_shot.findAll({
                        where:{
                          bd_id:list_of_bd_already_seen,
                          category:style,
                        },
                        order: [
                          ['createdAt', 'ASC']
                        ],
                        limit:6,
                      }).catch(err => {
                        response.status(500).send([{"error":error}]);	
                      }).then(bd=>{
                        list_to_send.push(bd);
                        callback([list_to_send,true]);
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                    
                   
                  }
                }
  
              }
            })
            
          }
        }
        else if(format=="serie" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_serie WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
              if (error) {
                console.log(error)
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);

                  if(i==result1.length){
                    callback([list_to_send,false]);
                  }
                }
                else if (result2.length==0){
                 
                  if(i==result1.length){
                    if(list_of_bd_already_seen.length>0){
                      comics_serie.Liste_Bd_Serie.findAll({
                        where:{
                          bd_id:list_of_bd_already_seen,
                          category:style,
                        },
                        order: [
                          ['createdAt', 'ASC']
                        ],
                        limit:6,
                      }).catch(err => {
                        response.status(500).send([{"error":error}]);	
                      }).then(bd=>{
                        list_to_send.push(bd);
                        callback([list_to_send,true]);
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                    
                  }
                }

              }
            })           
          }
        }
        else if (result1.length==0){
          callback([list_to_send,false]);
        }
       

      }
  });

  }

  const see_more_recommendations_bd = (request, response) => {
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    })
    let style = request.body.style;
    
    var _today = new Date();
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 280);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'comic'], (error, results1) => {
        if (error) {
          console.log(error)
          response.status(500).send([{"error":error}]);
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(result1.length!=0){
            for (let item of result1){
              if(item.format=="one-shot"){
                  pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id = $1 AND authorid != $2 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                    if (error) {
                      console.log(error)
                      response.status(500).send([{"error":error}]);
                    }
                    else {
                      result2 = JSON.parse(JSON.stringify(results2.rows));
                      i++;
                      if (result2.length!=0){
                        list_to_send.push(result2);
                        if(i==result1.length){
                          response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                      }
                      else{
                        if(i==result1.length){
                          response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                      }
        
                    }
                  })
              }
              else if(item.format=="serie" && result1.length!=0){
                pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_serie WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
                  if (error) {
                    console.log(error)
                    response.status(500).send([{"error":error}]);
                  }
                  else {
                    result2 = JSON.parse(JSON.stringify(results2.rows));
                    i++;
                    if (result2.length!=0){
                      list_to_send.push(result2);
    
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
                    else{
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
      
                  }
                })  
              }
            }
          }
         
  
        }
    });
  
    }


  function complete_recommendation_drawing(list_of_drawings_already_seen,response,user,style,format,callback){

    var _today = new Date();
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 280);
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND style=$2 AND format=$5 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,format], (error, results1) => {
        if (error) {
          console.log(error)
          response.status(500).send([{"error":error}]);
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          //AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2)

          if(format=="one-shot" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_one_page WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                if (error) {
                  console.log(error)
                  response.status(500).send([{"error":error}]);
                }
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
   
                    if(i==result1.length){
                      callback([list_to_send,false]);
                    }
                  }
                  else if (result2.length==0){
                    if(i==result1.length){
                      if(list_of_drawings_already_seen.length>0){
                        drawings_one_shot.Drawings_one_page.findAll({
                          where:{
                            drawing_id:list_of_drawings_already_seen,
                            category:style,
                          },
                          order: [
                            ['createdAt', 'ASC']
                          ],
                          limit:6,
                        }).catch(err => {
                          response.status(500).send([{"error":error}]);	
                        }).then(bd=>{
                          list_to_send.push(bd);
                          callback([list_to_send,true]);
                        })
                      }
                      else{
                        callback([list_to_send,false]);
                      }
                      
                    }
                  }
                }
              })
              
            }
           }
           else if(format=="artbook" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_artbook WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3)) ', [item.publication_id,user,'artbook'], (error, results2) => {
                if (error) {
                  console.log(error)
                  response.status(500).send([{"error":error}]);
                }
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
   
                    if(i==result1.length){
                      callback([list_to_send,false]);
                    }
                  }
                  else if (result2.length==0){
                    if(i==result1.length){
                      if(list_of_drawings_already_seen.length>0){
                        drawings_artbook.Liste_Drawings_Artbook.findAll({
                          where:{
                            drawing_id:list_of_drawings_already_seen,
                            category:style,
                          },
                          order: [
                            ['createdAt', 'ASC']
                          ],
                          limit:6,
                        }).catch(err => {
                          response.status(500).send([{"error":error}]);	
                        }).then(bd=>{
                          list_to_send.push(bd);
                          callback([list_to_send,true]);
                        })
                      }
                      else{
                        callback([list_to_send,false]);
                      }
                    }
                  }
                }
              })           
            }
           }
           else if (result1.length==0){
            callback([list_to_send,false]);
           }
         
  
        }
    });
 }

 const see_more_recommendations_drawings = (request, response) => {
  var user=0;
  jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  })
  let style = request.body.style;
  
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 280);


  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'drawing'], (error, results1) => {
      if (error) {
        console.log(error)
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            if(item.format=="one-shot"){
                pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_one_page WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                  if (error) {
                    console.log(error)
                      response.status(500).send([{"error":error}]);
                  }
                  else {
                    result2 = JSON.parse(JSON.stringify(results2.rows));
                    i++;
                    if (result2.length!=0){
                      list_to_send.push(result2);
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
                    else{
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
      
                  }
                })
            }
            else if(item.format=="artbook" && result1.length!=0){
                pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_artbook WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
                  if (error) {
                    console.log(error)
                    response.status(500).send([{"error":error}]);
                  }
                  else {
                    result2 = JSON.parse(JSON.stringify(results2.rows));
                    i++;
                    if (result2.length!=0){
                      list_to_send.push(result2);
    
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
                    else{
                      if(i==result1.length){
                        response.status(200).send([{"list_to_send":list_to_send}]);
                      }
                    }
      
                  }
                })  
            }
          }
        }
       

      }
  });

  }

 function complete_recommendation_writing(list_of_writings_already_seen,response,user,style,callback){
  console.log("complete_recommendation_writing")
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 280);
  console.log(style)
  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week], (error, results1) => {
      if (error) {
        console.log(error)
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_writings WHERE writing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_writings WHERE writing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2)) ', [item.publication_id,user], (error, results2) => {
              if (error) {
                console.log(error)
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
 
                  if(i==result1.length){
                    callback([list_to_send,false]);
                  }
                }
                else if (result2.length==0){
                  if(i==result1.length){
                    if(list_of_writings_already_seen.length>0){
                      writings.Liste_Writings.findAll({
                        where:{
                          writing_id:list_of_writings_already_seen,
                          category:style,
                        },
                        order: [
                          ['createdAt', 'ASC']
                        ],
                        limit:6,
                      }).catch(err => {
                        response.status(500).send([{"error":error}]);	
                      }).then(bd=>{
                        list_to_send.push(bd);
                        callback([list_to_send,true]);
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                  }
                }

              }
            })
            
          }
         }
         else if (result1.length==0){    
          callback([list_to_send,false]);
         }
       

      }
  });
  }

  const see_more_recommendations_writings = (request, response) => {
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    })
    let style = request.body.style;
    
    var _today = new Date();
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 280);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'comic'], (error, results1) => {
        if (error) {
          console.log(error)
          response.status(500).send([{"error":error}]);
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(result1.length!=0){
            for (let item of result1){
                  pool.query('SELECT * FROM liste_writings WHERE writing_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_writings WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                    if (error) {
                      console.log(error)
                      response.status(500).send([{"error":error}]);
                    }
                    else{
                      result2 = JSON.parse(JSON.stringify(results2.rows));
                      i++;
                      if (result2.length!=0){
                        list_to_send.push(result2);
                        if(i==result1.length){
                          response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                      }
                      else{
                        if(i==result1.length){
                          response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                      }
        
                    }
                  })
              
            }
          }
         
  
        }
    });
  
  };

  


  




module.exports = {
  generate_recommendations,
  get_first_recommendation_bd_os_for_user,
  get_first_recommendation_bd_serie_for_user,
  get_first_recommendation_drawing_os_for_user,
  get_first_recommendation_drawing_artbook_for_user,
  get_first_recommendation_writings_for_user,
  see_more_recommendations_bd,
  see_more_recommendations_drawings,
  see_more_recommendations_writings,

}