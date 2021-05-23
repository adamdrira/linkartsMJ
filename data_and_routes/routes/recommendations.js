const comics_one_shot = require('../../comics_one_shot_and_cover/models/sequelize');
const comics_serie = require('../../comics_serie/models/sequelize');
const drawings_artbook = require('../../drawings_artbook/models/sequelize');
const drawings_one_shot = require('../../drawings_one_shot_and_cover/models/sequelize');
const writings = require('../../writings/models/sequelize');
var {spawn} = require("child_process")
const fs = require("fs");
const jwt = require('jsonwebtoken');
var fastcsv = require("fast-csv");
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Pool = require('pg').Pool;

const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'postgres',
  password: 'test',
  host: 'localhost',
});

/*const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'adamdrira',
  password: 'E273adamZ9Qvps',
  host: 'localhost',
});*/

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


const generate_recommendations = (request, response) => {
  
  let user;
  if( ! request.headers['authorization'] ) {
    return response.status(401).json({msg: "error"});
  }
  else {
    let val=request.headers['authorization'].replace(/^Bearer\s/, '')
    user= get_current_user(val)
    if(!user){
      return response.status(401).json({msg: "error"});
    }
  }
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 350);

  
  pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1  AND "createdAt" ::date <=$2 AND "createdAt" ::date >= $3 limit 100', [user,_today,last_week], (error, results) => {
    if (error) {
      
      return response.status(500).send([{"error":error}]);
    }
    let jsonData = JSON.parse(JSON.stringify(results.rows));
    let fast = fastcsv.write(jsonData, { headers: true });
    let ws = fs.createWriteStream(`./data_and_routes/routes/csvfiles_for_python/classement_python-${user}.csv`);
    fast.pipe(ws)
    .on('error', function(e){
    })
    .on("finish", function() {
        if(jsonData.length>=1 && user!=80){
          
          //pour ubuntu
          //const pythonProcess = spawn('python3',['/usr/local/lib/python3.8/dist-packages/list_of_views.py', user]);
          const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/list_of_views.py', user]);
          pythonProcess.stderr.pipe(process.stderr);
          pythonProcess.stdout.on('data', (data) => {
           // console.log("python res")
            //console.log(data.toString())
          });
          pythonProcess.stdout.on("end", (data) => {
            fs.access(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`, fs.F_OK, (err) => {
              if(err){
              }  
              else{
                fs.unlink(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`,function (err) {
                  if (err) {
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

            response.status(200).send([{styles_recommendation:styles_recommendation,sorted_list_category:sorted_list_category}])
           
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

          if(user==80){
            fs.access(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`, fs.F_OK, (err) => {
              if(err){
              }  
              else{
                fs.unlink(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`,function (err) {
                  if (err) {
                  } 
                });
              } 
            })

            fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
              if(err){
                do_all()
              }  
              else{
                do_all_end()
              } 
            })
          }
          else{
            do_all()
          }

          
         
          function do_all(){
            fs.writeFile(PATH, JSON.stringify(array_to_convert_in_json), (err) => {
              if (err){
              } 
              fs.writeFile(PATH2, JSON.stringify(array_to_convert_in_json), (err) => {
                if (err){
                  response.status(500).send([{error:err}])
                } 
                else{
                  do_all_end()
                }
              })
            }) 
          }

          function do_all_end(){

            get_all_comics_recommendations(user,(list_of_comics)=>{
              response.status(200).json([list_of_comics])
            })
          }
          
        }
      })
    })

} 

const get_first_recommendation_bd_os_for_user = (request, response) => {
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

  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
  jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  var list_bd_os;
  var test;
  fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
    if(err){
      test={"comic":
        {"0":null,"1":null,"2":null},
      "drawing":
        {"0":null,"1":null,"2":null},
      "writing":
        {"0":null,"1":null,"2":null} 
      };
      get_it();
    }  
    else{
      test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
      get_it();
    }
  })

 
  
  function get_it(){
    if(index_bd<0){
      list_bd_os=null;
    }
    else if(test.comic){
      list_bd_os= test.comic[index_bd];
    }
    var compt = 0;
   
    if (list_bd_os){
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

  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
  jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  });
  var list_bd;
  var test;
  fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
    if(err){
      test={"comic":
        {"0":null,"1":null,"2":null},
      "drawing":
        {"0":null,"1":null,"2":null},
      "writing":
        {"0":null,"1":null,"2":null} 
      };
      get_it();
    }  
    else{
      test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
      get_it();
    }
  })

  function get_it(){
    if(index_bd<0){
      list_bd=null;
    }
    else if(test.comic){
      list_bd= test.comic[index_bd];
    }
    var compt = 0;
  
    if (list_bd){
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

                    complete_recommendation_bd(list_of_bd_serie_already_seen, response,user,'Manga',"serie", (req)=>{
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

  const index_drawing =request.body.index_drawing;
  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

    fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
      if(err){
        test={"comic":
          {"0":null,"1":null,"2":null},
        "drawing":
          {"0":null,"1":null,"2":null},
        "writing":
          {"0":null,"1":null,"2":null} 
        }
        get_it();
      }  
      else{
        test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
        get_it();
      }
    })
 

  var list_drawing_artbook
  function get_it(){
    if(index_drawing<0){
      list_drawing_artbook=null;
    }
    else if(test.drawing){
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

  const index_drawing =request.body.index_drawing;
  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
      if(err){
        test={"comic":
          {"0":null,"1":null,"2":null},
        "drawing":
          {"0":null,"1":null,"2":null},
        "writing":
          {"0":null,"1":null,"2":null} 
        }
        get_it();
      }  
      else{
        test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
        get_it();
      }
    })
  var list_drawing_os;
  function get_it(){
    if(index_drawing<0){
      list_drawing_os=null;
    }
    else if(test.drawing){
      list_drawing_os= test.drawing[index_drawing];
    }
    
    var compt = 0;
  
    if (list_drawing_os){
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

  const index_writing =request.body.index_writing;


  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    fs.access(__dirname + `/python_files/recommendations_artpieces-${user}.json`, fs.F_OK, (err) => {
      if(err){
        test={"comic":
          {"0":null,"1":null,"2":null},
        "drawing":
          {"0":null,"1":null,"2":null},
        "writing":
          {"0":null,"1":null,"2":null} 
        };
        get_it();
      }  
      else{
        test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
        get_it();
      }
    })
 
  var list_writing;
  function get_it(){
    if(index_writing<0){
      list_writing=null;
    }
    else if(test.writing){
      list_writing= test.writing[index_writing];
    }
  
  
    var list_writings_to_send=[];
    var list_writings_to_compare=[];
    var compteur_writing=0;
    let styles_with_contents_already_seen=[];
    
    var list_of_writings_already_seen=[]
    let number_of_contents_by_category=[0,0,0,0,0] // Article,Roman,Illustrated novel,Poetry,Scenario
    if(list_writing){
      let k=0;
      for (let item=0; item< list_writing.length;item++){ 
        list_of_writings_already_seen.push(list_writing[item][0]) 
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_writings WHERE authorid=(SELECT authorid FROM liste_writings WHERE writing_id = $3) AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$1) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$1) AND writing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 ) ORDER BY viewnumber DESC limit 1', [user,"writing",list_writing[item][0]], (error, results) => {
            if (error) {
              
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
  last_week.setDate(last_week.getDate() - 350);
  let list_to_send=[];
 
  pool.query('SELECT publication_category,format, style, publication_id, count(*) occurences FROM (SELECT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1  AND view_time is not null AND style=$2 AND format=$3  AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,format,last_week], (error, results1) => {
      if (error) {
        
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(format=="one-shot" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3 AND publication_category=$4))', [item.publication_id,user,'one-shot','comic'], (error, results2) => {
              if (error) {
                
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
                }
                if(i==result1.length){
                  let initial_length=list_to_send.length;
                  if(list_to_send.length<10){
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
                        if(bd.length>0){
                          for(let j=0;j<bd.length;j++){
                            list_to_send.push([bd[j]]);
                          }
                          if(initial_length>=6){
                            callback([list_to_send,true]);
                          }
                          else{
                            callback([list_to_send,false]);
                          }
                          
                        }
                        else{
                          callback([list_to_send,false]);
                        }
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                  }
                  else{
                    callback([list_to_send,false]);
                  }
                  
                }
  
              }
            })
            
          }
        }
        else if(format=="serie" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_serie WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3 AND publication_category=$4))', [item.publication_id,user,'serie','comic'], (error, results2) => {
              if (error) {
                
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
                }
                if(i==result1.length){
                  let initial_length=list_to_send.length;
                  if(list_to_send.length<10){
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
                        if(bd.length>0){
                          for(let j=0;j<bd.length;j++){
                            list_to_send.push([bd[j]]);
                          }
                          if(initial_length>=6){
                            callback([list_to_send,true]);
                          }
                          else{
                            callback([list_to_send,false]);
                          }
                        }
                        else{
                          callback([list_to_send,false]);
                        }
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                  }
                  else{
                    callback([list_to_send,false]);
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
  
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    })
    let style = request.body.style;
    
    var _today = new Date();
    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 350);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$4 AND style=$2 AND "createdAt" ::date >= $3 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,last_week,'comic'], (error, results1) => {
        if (error) {
          
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
    last_week.setDate(last_week.getDate() - 350);
  
    let list_to_send=[];
   
    pool.query('SELECT publication_category,format, style, publication_id, count(*) occurences FROM (SELECT  publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND style=$2 AND format=$4 AND "createdAt" ::date >= $3 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,last_week,format], (error, results1) => {
        if (error) {
          
          response.status(500).send([{"error":error}]);
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          //AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2)

          if(format=="one-shot" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_one_page WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3 AND publication_category=$4))', [item.publication_id,user,'one-shot','drawing'], (error, results2) => {
                if (error) {
                  
                  response.status(500).send([{"error":error}]);
                }
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
                  }
                  if(i==result1.length){
                    let initial_length=list_to_send.length;
                    if(list_to_send.length<10){
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
                          if(bd.length>0){
                            for(let j=0;j<bd.length;j++){
                              list_to_send.push([bd[j]]);
                            }
                            if(initial_length>=6){
                              callback([list_to_send,true]);
                            }
                            else{
                              callback([list_to_send,false]);
                            }
                          }
                          else{
                            callback([list_to_send,false]);
                          }
                        })
                      }
                      else{
                        callback([list_to_send,false]);
                      }
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                    
                  }
                }
              })
              
            }
           }
           else if(format=="artbook" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_artbook WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3 )) ', [item.publication_id,user,'artbook'], (error, results2) => {
                if (error) {
                  
                  response.status(500).send([{"error":error}]);
                }
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
                  }
                  if(i==result1.length){
                    let initial_length=list_to_send.length;
                    if(list_to_send.length<10){
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
                          if(bd.length>0){
                            for(let j=0;j<bd.length;j++){
                              list_to_send.push([bd[j]]);
                            }
                            if(initial_length>=6){
                              callback([list_to_send,true]);
                            }
                            else{
                              callback([list_to_send,false]);
                            }
                          }
                          else{
                            callback([list_to_send,false]);
                          }
                        })
                      }
                      else{
                        callback([list_to_send,false]);
                      }
                    }
                    else{
                      callback([list_to_send,false]);
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

  var user=0;
  jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
    user=decoded.id;
  })
  let style = request.body.style;
  
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 350);


  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT  publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$4 AND style=$2 AND  "createdAt" ::date >= $3 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,last_week,'drawing'], (error, results1) => {
      if (error) {
        
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            if(item.format=="one-shot"){
                pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_one_page WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                  if (error) {
                    
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
                pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_artbook WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'artbook'], (error, results2) => {
                  if (error) {
                    
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
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 350);
  let list_to_send=[];
 
  pool.query('SELECT publication_category, style, publication_id, count(*) occurences FROM (SELECT  publication_category, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND style=$2 AND "createdAt" ::date >= $3 ) as t GROUP BY t.publication_category, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,last_week], (error, results1) => {
      if (error) {
        
        response.status(500).send([{"error":error}]);
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_writings WHERE writing_id=$1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_writings WHERE writing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND publication_category=$3))', [item.publication_id,user,'writing'], (error, results2) => {
              if (error) {
                
                response.status(500).send([{"error":error}]);
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
                }
                if(i==result1.length){
                  let initial_length=list_to_send.length;
                  if(list_to_send.length<10){
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
                        if(bd.length>0){
                          for(let j=0;j<bd.length;j++){
                            list_to_send.push([bd[j]]);
                          }
                          if(initial_length>=6){
                            callback([list_to_send,true]);
                          }
                          else{
                            callback([list_to_send,false]);
                          }
                        }
                        else{
                          callback([list_to_send,false]);
                        }
                      })
                    }
                    else{
                      callback([list_to_send,false]);
                    }
                  }
                  else{
                    callback([list_to_send,false]);
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
    last_week.setDate(last_week.getDate() - 350);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT  publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND view_time is not null AND publication_category=$4 AND style=$2 AND "createdAt" ::date >= $3 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) DESC limit 20', [user,style,last_week,'writing'], (error, results1) => {
        if (error) {
          
          response.status(500).send([{"error":error}]);
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(result1.length!=0){
            for (let item of result1){
                  pool.query('SELECT * FROM liste_writings WHERE writing_id = $1 AND authorid NOT IN (SELECT id_user_blocked as authorid FROM users_blocked WHERE id_user=$2) AND authorid NOT IN (SELECT id_receiver as authorid from reports where id_user=$2) AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_writings WHERE writing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND publication_category=$3))', [item.publication_id,user,'writing'], (error, results2) => {
                    if (error) {
                      
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












  
  /***************************************** NEW RECOMMENDATIONS  ***********************************/
  /***************************************** NEW RECOMMENDATIONS  ***********************************/
  /***************************************** NEW RECOMMENDATIONS  ***********************************/







  /***************************************** COMICS RECOMMENDATIONS  ***********************************/
  /***************************************** COMICS RECOMMENDATIONS  ***********************************/
  /***************************************** COMICS RECOMMENDATIONS  ***********************************/



  const get_recommendations_comics = (request, response) => {
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    get_all_comics_recommendations(user,(list_of_comics)=>{
      response.status(200).json([list_of_comics])
    })
  }

  function get_all_comics_recommendations(user,callback){
    let recommendations_done=[];
    let recommendations=[];
    let last_recommendations=[[],[],[],[]];

    let styles=["Manga","BD","Comics","Webtoon"]
    for( let i=0;i<styles.length;i++){
      let views_found=false;
      let styles_found=false;
      let result_styles=[];
      let result_views=[];
      pool.query('SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC limit 50', ["Comic","clicked",styles[i]], (error, results) => {
        styles_found=true;
        
        if (error) {
          console.log({err:error})
          result_styles = [];
        }
        else{
          result_styles = JSON.parse(JSON.stringify(results.rows));
        }

       
        if(views_found && styles_found){
          after_first_check(i)
        }
        
      })

      if(user!=80){
        pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1  AND publication_category=$2 and style=$3 limit 100', [user,"comic",styles[i]], (error, results) => {
          views_found=true;
         
          if (error) {
            result_views = [];
          }
          else{
            views_found=true;
            result_views = JSON.parse(JSON.stringify(results.rows));
          }

         
          if(views_found && styles_found){
            after_first_check(i)
          }
          
        })
      }
      else{
        views_found=true;
        if(views_found && styles_found){
          after_first_check(i)
        }
      }
     
     

      function after_first_check(indice){
        let not_seen=[];
        let seen=[];
        for (let i=0; i<result_styles.length;i++){
          let index = result_views.findIndex(x =>  x.publication_category == result_styles[i].publication_category && x.format == result_styles[i].format && x.publication_id===result_styles[i].publication_id);

          if(index>=0){
            seen.push(result_styles[i])
          }
          else{
            not_seen.push(result_styles[i])
          }
        }

        recommendations[indice]=not_seen.concat(seen)
      
        let compteur_before_done=0;
       
        for( let j=0;j<recommendations[indice].length;j++){

          if(recommendations[indice][j].format=="one-shot"){
              pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id=$1 and status=$2', [recommendations[indice][j].target_id,"public"], (error, results2) => {
                if (error ) {
                  
                  last_recommendations[indice][j]=null;
                }
                
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  if(!result2[0]){
                    last_recommendations[indice][j]=null;
                  }
                  else{
                    last_recommendations[indice][j]=result2[0];
                  }
                 
                  compteur_before_done++;
                  if(compteur_before_done==recommendations[indice].length){
                    remove_null_elements(last_recommendations[indice])
                    recommendations_done[indice]=true;
                    let compt=0;
                    for(let j=0;j<4;j++){
                      if(recommendations_done[j]){
                        compt++
                      }
                    }
                    if(compt==4){
                      callback(last_recommendations)
                    }
                  }
                }
              })
          }
          else{
            pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 and status=$2', [recommendations[indice][j].target_id,"public"], (error, results2) => {
              if (error ) {
                
                last_recommendations[indice][j]=null;
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                if(!result2[0]){
                  last_recommendations[indice][j]=null;
                }
                else{
                  last_recommendations[indice][j]=result2[0];
                }
             
                compteur_before_done++;
                if(compteur_before_done==recommendations[indice].length){
                  remove_null_elements(last_recommendations[indice])
                  recommendations_done[indice]=true;
                  let compt=0;
                  for(let j=0;j<4;j++){
                    if(recommendations_done[j]){
                      compt++
                    }
                  }
                  if(compt==4){
                    callback(last_recommendations)
                  }
                }
              }
            })
          }
        }
      
      }
    }
    
  }


  /***************************************** DRAWINGS RECOMMENDATIONS  ***********************************/
  /***************************************** DRAWINGS RECOMMENDATIONS  ***********************************/
  /***************************************** DRAWINGS RECOMMENDATIONS  ***********************************/


  const get_recommendations_drawings = (request, response) => {
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    get_all_drawings_recommendations(user,(list_of_drawings)=>{
      response.status(200).json([list_of_drawings])
    })
  }

  function get_all_drawings_recommendations(user,callback){
    let recommendations_done=[];
    let recommendations=[];
    let last_recommendations=[[],[]];

    let styles=["Traditionnel","Digital"]
    for( let i=0;i<styles.length;i++){
      let views_found=false;
      let styles_found=false;
      let result_styles=[];
      let result_views=[];
      pool.query('SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC limit 50', ["Drawing","clicked",styles[i]], (error, results) => {
        styles_found=true;
        
        if (error) {
          console.log({err:error})
          result_styles = [];
        }
        else{
          result_styles = JSON.parse(JSON.stringify(results.rows));
        }

       
        if(views_found && styles_found){
          after_first_check(i)
        }
        
      })

      if(user!=80){
        pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1  AND publication_category=$2 and style=$3 limit 200', [user,"drawing",styles[i]], (error, results) => {
          views_found=true;
         
          if (error) {
            result_views = [];
          }
          else{
            views_found=true;
            result_views = JSON.parse(JSON.stringify(results.rows));
          }

         
          if(views_found && styles_found){
            after_first_check(i)
          }
          
        })
      }
      else{
        views_found=true;
        if(views_found && styles_found){
          after_first_check(i)
        }
      }
     
     

      function after_first_check(indice){
        let not_seen=[];
        let seen=[];
        for (let i=0; i<result_styles.length;i++){
          let index = result_views.findIndex(x =>  x.publication_category == result_styles[i].publication_category &&  x.format == result_styles[i].format && x.publication_id===result_styles[i].publication_id);

          if(index>=0){
            seen.push(result_styles[i])
          }
          else{
            not_seen.push(result_styles[i])
          }
        }

        recommendations[indice]=not_seen.concat(seen)
      
        let compteur_before_done=0;
       
        for( let j=0;j<recommendations[indice].length;j++){

          if(recommendations[indice][j].format=="one-shot"){
              pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id=$1 and status=$2', [recommendations[indice][j].target_id,"public"], (error, results2) => {
                if (error ) {
                  
                  last_recommendations[indice][j]=null;
                }
                
                else {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  if(!result2[0]){
                    last_recommendations[indice][j]=null;
                  }
                  else{
                    last_recommendations[indice][j]=result2[0];
                  }
                 
                  compteur_before_done++;
                  if(compteur_before_done==recommendations[indice].length){
                    remove_null_elements(last_recommendations[indice])
                    recommendations_done[indice]=true;
                    let compt=0;
                    for(let j=0;j<2;j++){
                      if(recommendations_done[j]){
                        compt++
                      }
                    }
                    if(compt==2){
                      callback(last_recommendations)
                    }
                  }
                }
              })
          }
          else{
            pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 and status=$2', [recommendations[indice][j].target_id,"public"], (error, results2) => {
              if (error ) {
                
                last_recommendations[indice][j]=null;
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                if(!result2[0]){
                  last_recommendations[indice][j]=null;
                }
                else{
                  last_recommendations[indice][j]=result2[0];
                }
             
                compteur_before_done++;
                if(compteur_before_done==recommendations[indice].length){
                  remove_null_elements(last_recommendations[indice])
                  recommendations_done[indice]=true;
                  let compt=0;
                  for(let j=0;j<2;j++){
                    if(recommendations_done[j]){
                      compt++
                    }
                  }
                  if(compt==2){
                    callback(last_recommendations)
                  }
                }
              }
            })
          }
        }
      
      }
    }
    
  }



  /***************************************** WRITINGS RECOMMENDATIONS  ***********************************/
  /***************************************** WRITINGS RECOMMENDATIONS  ***********************************/
  /***************************************** WRITINGS RECOMMENDATIONS  ***********************************/



  const get_recommendations_writings = (request, response) => {
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    get_all_writings_recommendations(user,(list_of_writings)=>{
      response.status(200).json([list_of_writings])
    })
  }

  function get_all_writings_recommendations(user,callback){
    let recommendations_done=[];
    let recommendations=[];
    let last_recommendations=[[],[],[],[]];

    let styles=["Roman","Scenario","Article","Poetry"]
    for( let i=0;i<styles.length;i++){
      let views_found=false;
      let styles_found=false;
      let result_styles=[];
      let result_views=[];
      pool.query('SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC limit 50', ["Writing","clicked",styles[i]], (error, results) => {
        styles_found=true;
        
        if (error) {
          result_styles = [];
        }
        else{
          result_styles = JSON.parse(JSON.stringify(results.rows));
        }

       
        if(views_found && styles_found){
          after_first_check(i)
        }
        
      })

      if(user!=80){
        pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1  AND publication_category=$2 and style=$3 limit 200', [user,"writing",styles[i]], (error, results) => {
          views_found=true;
         
          if (error) {
            result_views = [];
          }
          else{
            views_found=true;
            result_views = JSON.parse(JSON.stringify(results.rows));
          }

         
          if(views_found && styles_found){
            after_first_check(i)
          }
          
        })
      }
      else{
        views_found=true;
        if(views_found && styles_found){
          after_first_check(i)
        }
      }
     
     

      function after_first_check(indice){
        let not_seen=[];
        let seen=[];
        for (let i=0; i<result_styles.length;i++){
          let index = result_views.findIndex(x => x.publication_category == result_styles[i].publication_category && x.publication_id===result_styles[i].publication_id);

          if(index>=0){
            seen.push(result_styles[i])
          }
          else{
            not_seen.push(result_styles[i])
          }
        }

        recommendations[indice]=not_seen.concat(seen)
      
        let compteur_before_done=0;
       
        for( let j=0;j<recommendations[indice].length;j++){

            pool.query('SELECT * FROM liste_writings WHERE writing_id=$1 and status=$2', [recommendations[indice][j].target_id,"public"], (error, results2) => {
              if (error ) {
                
                last_recommendations[indice][j]=null;
              }
              else {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                if(!result2[0]){
                  last_recommendations[indice][j]=null;
                }
                else{
                  last_recommendations[indice][j]=result2[0];
                }
             
                compteur_before_done++;
                if(compteur_before_done==recommendations[indice].length){
                  remove_null_elements(last_recommendations[indice])
                  recommendations_done[indice]=true;
                  let compt=0;
                  for(let j=0;j<4;j++){
                    if(recommendations_done[j]){
                      compt++
                    }
                  }
                  if(compt==4){
                    callback(last_recommendations)
                  }
                }
              }
            })
        }
      
      }
    }
    
  }

  function remove_null_elements(list){
    let len=list.length;
    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
      }
    }
  }


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
  get_recommendations_comics,
  get_recommendations_writings,
  get_recommendations_drawings,

}