const category = require('../../comics_one_shot_and_cover/controllers/controller');
const fetch = require("node-fetch");
var {spawn} = require("child_process")
var path = require('path');
var {PythonShell} = require('python-shell');
const usercontroller = require('../../authentication/user.controller');
var Request = require('request');
const fs = require("fs");
const jwt = require('jsonwebtoken');
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





const get_view_table_by_user = (request, response) => {
  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 160);



  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });

  let fastcsv = require("fast-csv");
  let ws = fs.createWriteStream(`./data_and_routes/routes/csvfiles_for_python/classement_python-${user}.csv`);
  pool.query('SELECT DISTINCT author_id_who_looks,publication_category,format, style, publication_id FROM list_of_views  WHERE author_id_who_looks = $1 AND "createdAt" ::date <=$2 AND "createdAt" ::date >= $3 limit 300', [user,_today,last_week], (error, results) => {
    if (error) {
      throw error
    }
    let jsonData = JSON.parse(JSON.stringify(results.rows));
  
    let fast = fastcsv.write(jsonData, { headers: true });
    fast.pipe(ws)
    .on('error', function(e){
      console.log(e)
    })
    .on("finish", function() {
        console.log("csv successfully uploaded for python");
        if(jsonData.length>=1){
          console.log("calling python prog")
          //let formdata = {csvfile: fs.createReadStream(__dirname + '/csvfiles_for_python/classement_python.csv')};
         

          const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/list_of_views.py', user]);
          pythonProcess.stderr.pipe(process.stderr);
          pythonProcess.stdout.on('data', (data) => {
            console.log("python res")
            //console.log(data.toString())
          });
          pythonProcess.stdout.on("end", (data) => {
            console.log("end received data python: ");
            fs.access(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`, fs.F_OK, (err) => {
              if(err){
                console.log('suppression already done');
                return response.status(200).send([{"length":(jsonData.length).toString()}]); 
              }  
              else{
                fs.unlink(__dirname + `/csvfiles_for_python/classement_python-${user}.csv`,function (err) {
                  if (err) {
                    throw err;
                  } 
                  response.status(200).send([{"length":(jsonData.length).toString()}]); 
                });
                
              }
                
            })   
          });

          
        }
        else{
          let PATH = `./data_and_routes/routes/python_files/recommendations-${user}.json`;
          let PATH2 = `./data_and_routes/routes/python_files/recommendations_artpieces-${user}.json`;
          let array_to_convert_in_json={"bd":
                                          {"0":null,"1":null,"2":null},
                                        "drawing":
                                          {"0":null,"1":null,"2":null},
                                        "writing":
                                          {"0":null,"1":null,"2":null}         
                                        }

          fs.writeFile(PATH, JSON.stringify(array_to_convert_in_json), (err) => {
            if (err) throw err;
            fs.writeFile(PATH2, JSON.stringify(array_to_convert_in_json), (err) => {
              if (err) throw err;
              response.status(200).send([{"length":(jsonData.length).toString()}]); 
            })
          }) 
        }
      })
    })

} 

const get_first_recommendation_bd_os_for_user = (request, response) => {


  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();
 

  function get_it(){
    if(index_bd<0){
      list_bd_os=null;
    }
    else{
      list_bd_os= test.bd[index_bd];
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
    list_bd_os_to_compare=[];
  
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_bd_os.length;item++){  
        if (list_bd_os[item][1]=="one-shot"){
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid=(SELECT authorid FROM liste_bd_one_shot WHERE bd_id = $4) AND bd_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"bd","one-shot",list_bd_os[item][0]], (error, results) => {
            if (error) {
              throw error
            }
            else{
              result = JSON.parse(JSON.stringify(results.rows));
              check = list_bd_os_to_compare.includes(JSON.stringify(result));
              if (!check && item<5){
                list_bd_os_to_compare.push(JSON.stringify(result));
                list_bd_os_to_send.push(result);
              }
              k++;
              if(k === compt){
                complete_recommendation_bd(user,'Manga',"one-shot", (req)=>{
                  list_bd_os_to_send = list_bd_os_to_send.concat(req);
                  complete_recommendation_bd(user,'Comics',"one-shot", (req)=>{
                    list_bd_os_to_send = list_bd_os_to_send.concat(req);
                    complete_recommendation_bd(user,'Webtoon',"one-shot", (req)=>{
                      list_bd_os_to_send = list_bd_os_to_send.concat(req);           
                      complete_recommendation_bd(user,'BD',"one-shot", (req)=>{
                        list_bd_os_to_send = list_bd_os_to_send.concat(req);
                        response.status(200).json([{
                          "list_bd_os_to_send":list_bd_os_to_send}])
                      })    
                    });           
                  })          
                 });
              }          
            }
        });
        }
      }
    }
    else{
      complete_recommendation_bd(user,'Manga',"one-shot", (req)=>{
        list_bd_os_to_send = req;
        complete_recommendation_bd(user,'Comics',"one-shot", (req)=>{
          list_bd_os_to_send = list_bd_os_to_send.concat(req);
          complete_recommendation_bd(user,'Webtoon',"one-shot", (req)=>{
            list_bd_os_to_send = list_bd_os_to_send.concat(req);           
            complete_recommendation_bd(user,'BD',"one-shot", (req)=>{
              list_bd_os_to_send = list_bd_os_to_send.concat(req);
              response.status(200).json([{
                "list_bd_os_to_send":list_bd_os_to_send}])
            })    
          });           
        })          
       });
    }
  }
  
}

const get_first_recommendation_bd_serie_for_user = (request, response) => {
  const index_bd = request.body.index_bd;

  //on récupère la liste des oeuvres
  var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
  var test=JSON.parse(fs.readFileSync( __dirname + `/python_files/recommendations_artpieces-${user}.json`));
  get_it();

  function get_it(){
    if(index_bd<0){
      list_bd=null;
    }
    else{
      list_bd= test.bd[index_bd];
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
    list_bd_serie_to_compare=[];
  
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_bd.length;item++){  
         if (list_bd[item][1]=="serie"){
          pool.query('SELECT * FROM liste_bd_serie WHERE authorid=(SELECT authorid FROM liste_bd_serie WHERE bd_id = $4) AND bd_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"bd","serie",list_bd[item][0]], (error, results) => {
            if (error) {
              throw error
            }
            else{
              result = JSON.parse(JSON.stringify(results.rows));
              check = list_bd_serie_to_compare.includes(JSON.stringify(result));
              if (!check && item<5){
                list_bd_serie_to_compare.push(JSON.stringify(result));
                list_bd_serie_to_send.push(result);
              }
  
              k++;
              if(k == compt){
                complete_recommendation_bd(user,'Manga',"serie", (req)=>{
                  list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
                  complete_recommendation_bd(user,'Comics',"serie", (req)=>{
                  list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
                  complete_recommendation_bd(user,'Webtoon',"serie", (req)=>{
                    list_bd_serie_to_send = list_bd_serie_to_send.concat(req);           
                    complete_recommendation_bd(user,'BD',"serie", (req)=>{
                      list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
                       response.status(200).json([{
                         "list_bd_serie_to_send":list_bd_serie_to_send}])
                     })    
                   });           
                 })          
                });
             }
            }
        });
        }
      }
    }
    else{
      complete_recommendation_bd(user,'Manga',"serie", (req)=>{
        list_bd_serie_to_send = req;
        complete_recommendation_bd(user,'Comics',"serie", (req)=>{
        list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
        complete_recommendation_bd(user,'Webtoon',"serie", (req)=>{
          list_bd_serie_to_send = list_bd_serie_to_send.concat(req);           
          complete_recommendation_bd(user,'BD',"serie", (req)=>{
            list_bd_serie_to_send = list_bd_serie_to_send.concat(req);
             response.status(200).json([{
               "list_bd_serie_to_send":list_bd_serie_to_send}])
           })    
         });           
       })          
      });
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
          //list_drawing_artbook.splice(i, 1);
        }
      }
    }
  
    var list_artbook_to_send=[];
    list_artbook_to_compare=[];
  
    if (compt!=0){
      let k=0;
      for (let item=0; item< list_drawing_artbook.length;item++){  
        if (list_drawing_artbook[item][1]=="artbook"){
          pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid=(SELECT authorid FROM liste_drawings_artbook WHERE drawing_id = $4) AND drawing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"drawing","artbook",list_drawing_artbook[item][0]], (error, results) => {
            if (error) {
              throw error
            }
            else{
              result = JSON.parse(JSON.stringify(results.rows));
              check = list_artbook_to_compare.includes(JSON.stringify(result));
              if (!check  && item<5){
                list_artbook_to_compare.push(JSON.stringify(result));
                list_artbook_to_send.push(result);
              }
              k++;
              if(k == compt){
                complete_recommendation_drawing(user,'Traditionnel',"artbook", (req)=>{
                  list_artbook_to_send = list_artbook_to_send.concat(req); 
                      complete_recommendation_drawing(user,'Digital',"artbook", (req)=>{
                        list_artbook_to_send = list_artbook_to_send.concat(req); 
                        response.status(200).json([{
                          "list_artbook_to_send":list_artbook_to_send}])
                      })    
                    });           
                }
              
            }
        });
        }
      }
    }
    else{
      complete_recommendation_drawing(user,'Traditionnel',"artbook", (req)=>{
        list_artbook_to_send = req;        
            complete_recommendation_drawing(user,'Digital',"artbook", (req)=>{
              list_artbook_to_send = list_artbook_to_send.concat(req);
              response.status(200).json([{
                "list_artbook_to_send":list_artbook_to_send}])
            })    
       });  
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
    list_drawing_os_to_compare=[];
  
    if(compt!=0){
      let k=0 //compteur pour savoir si on en a fini avec le format
      for (let item=0; item< list_drawing_os.length;item++){  
        if (list_drawing_os[item][1]=="one-shot"){
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_drawings_one_page WHERE authorid=(SELECT authorid FROM liste_drawings_one_page WHERE drawing_id = $4) AND drawing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 AND format=$3) ORDER BY viewnumber DESC limit 1', [user,"drawing","one-shot",list_drawing_os[item][0]], (error, results) => {
            if (error) {
              throw error
            }
            else{
              result = JSON.parse(JSON.stringify(results.rows));
              check = list_drawing_os_to_compare.includes(JSON.stringify(result));
              if (!check && item<5){
                list_drawing_os_to_compare.push(JSON.stringify(result));
                list_drawing_os_to_send.push(result);
              }
              k++;
              if(k == compt){
                complete_recommendation_drawing(user,'Traditionnel',"one-shot", (req)=>{
                  list_drawing_os_to_send = list_drawing_os_to_send.concat(req);        
                      complete_recommendation_drawing(user,'Digital',"one-shot", (req)=>{
                        list_drawing_os_to_send = list_drawing_os_to_send.concat(req);
                        response.status(200).json([{
                          "list_drawing_os_to_send":list_drawing_os_to_send}])
                      })    
                    }); 
              }
              
            }
        });
        }
      }
    }
    else{
      complete_recommendation_drawing(user,'Traditionnel',"one-shot", (req)=>{
        list_drawing_os_to_send = req;         
            complete_recommendation_drawing(user,'Digital',"one-shot", (req)=>{
              list_drawing_os_to_send = list_drawing_os_to_send.concat(req);
              response.status(200).json([{
                "list_drawing_os_to_send":list_drawing_os_to_send}])
            })    
      }); 
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

  function get_it(){
    if(index_writing<0){
      list_writing=null;
    }
    else{
      list_writing= test.writing[index_writing];
    }
  
  
    var list_writings_to_send=[];
    list_writings_to_compare=[];
    if(list_writing!=null){
      let k=0;
      for (let item=0; item< list_writing.length;item++){  
        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
          pool.query('SELECT * FROM liste_writings WHERE authorid=(SELECT authorid FROM liste_writings WHERE writing_id = $3) AND writing_id NOT IN (SELECT DISTINCT publication_id FROM list_of_views WHERE author_id_who_looks = $1 AND publication_category =$2 ) ORDER BY viewnumber DESC limit 1', [user,"writing",list_writing[item][0]], (error, results) => {
            if (error) {
              throw error
            }
            else{
              result = JSON.parse(JSON.stringify(results.rows));
              check = list_writings_to_compare.includes(JSON.stringify(result));
              if (!check && item<5){
                list_writings_to_compare.push(JSON.stringify(result));
                list_writings_to_send.push(result);
              }
              k++;
              if(k == list_writing.length){
  
                complete_recommendation_writing(user,'Roman', (req)=>{
                  list_writings_to_send = list_writings_to_send.concat(req);        
                      complete_recommendation_writing(user,'Illustrated novel', (req)=>{
                        list_writings_to_send = list_writings_to_send.concat(req);
                        complete_recommendation_writing(user,'Article', (req)=>{
                          list_writings_to_send = list_writings_to_send.concat(req);
                          complete_recommendation_writing(user,'Poetry', (req)=>{
                            list_writings_to_send = list_writings_to_send.concat(req);
                            complete_recommendation_writing(user,'Scenario', (req)=>{
                              list_writings_to_send = list_writings_to_send.concat(req);
                                response.status(200).json([{
                                  "list_writings_to_send":list_writings_to_send}])
                            })
                          })
                        })
                      })    
                    });
              }          
            }
        });
        
      }
    }
    else{
      complete_recommendation_writing(user,'Roman', (req)=>{
        list_writings_to_send = req;         
        complete_recommendation_writing(user,'Illustrated novel', (req)=>{
          list_writings_to_send = list_writings_to_send.concat(req);
          complete_recommendation_writing(user,'Article', (req)=>{
            list_writings_to_send = list_writings_to_send.concat(req);
            complete_recommendation_writing(user,'Poetry', (req)=>{
              list_writings_to_send = list_writings_to_send.concat(req);
              complete_recommendation_writing(user,'Scenario', (req)=>{
                list_writings_to_send = list_writings_to_send.concat(req);
                  response.status(200).json([{
                    "list_writings_to_send":list_writings_to_send}])
              })
            })
          })
        })    
      });
    }
  }
  


} 


function complete_recommendation_bd(user,style,format,callback){


  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 160);


  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND style=$2 AND format=$5 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 5', [user,style,_today,last_week,format], (error, results1) => {
      if (error) {
        throw error
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(format=="one-shot" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id = $1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
              if (error) {
                throw error
              }
              {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }
                else if (result2.length==0){
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }
  
              }
            })
            
          }
         }
         else if(format=="serie" && result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
              if (error) {
                throw error
              }
              {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
 
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }
                else if (result2.length==0){
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }
  
              }
            })           
          }
         }
         else if (result1.length==0){
          callback([])
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
    last_week.setDate(last_week.getDate() - 40);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'bd'], (error, results1) => {
        if (error) {
          throw error
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(result1.length!=0){
            for (let item of result1){
              if(item.format=="one-shot"){
                  pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id = $1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                    if (error) {
                      throw error
                    }
                    {
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
                  pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
                    if (error) {
                      throw error
                    }
                    {
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


  function complete_recommendation_drawing(user,style,format,callback){

    var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 160);
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND style=$2 AND format=$5 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 5', [user,style,_today,last_week,format], (error, results1) => {
        if (error) {
          throw error
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(format=="one-shot" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_one_page WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                if (error) {
                  throw error
                }
                {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
   
                    if(i==result1.length){
                      callback(list_to_send);
                    }
                  }
                  else if (result2.length==0){
                    if(i==result1.length){
                      callback(list_to_send);
                    }
                  }
                }
              })
              
            }
           }
           else if(format=="artbook" && result1.length!=0){
            for (let item of result1){
              pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_drawings_artbook WHERE drawing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3)) ', [item.publication_id,user,'artbook'], (error, results2) => {
                if (error) {
                  throw error
                }
                {
                  result2 = JSON.parse(JSON.stringify(results2.rows));
                  i++;
                  if (result2.length!=0){
                    list_to_send.push(result2);
   
                    if(i==result1.length){
                      callback(list_to_send);
                    }
                  }
                  else if (result2.length==0){
                    if(i==result1.length){
                      callback(list_to_send);
                    }
                  }
                }
              })           
            }
           }
           else if (result1.length==0){
            callback([])
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
  last_week.setDate(last_week.getDate() - 160);


  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'drawing'], (error, results1) => {
      if (error) {
        throw error
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            if(item.format=="one-shot"){
                pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id = $1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                  if (error) {
                    throw error
                  }
                  {
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
                pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'serie'], (error, results2) => {
                  if (error) {
                    throw error
                  }
                  {
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

 function complete_recommendation_writing(user,style,callback){

  var _today = new Date();
  var last_week = new Date();
  last_week.setDate(last_week.getDate() - 160);

  let list_to_send=[];
 
  pool.query('SELECT * FROM (SELECT DISTINCT publication_category, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category, t.style, t.publication_id ORDER BY Count(*) limit 5', [user,style,_today,last_week], (error, results1) => {
      if (error) {
        throw error
      }
      else{
        const result1 = JSON.parse(JSON.stringify(results1.rows));
        let i=0;
        if(result1.length!=0){
          for (let item of result1){
            pool.query('SELECT * FROM liste_writings WHERE writing_id=$1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_writings WHERE writing_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2)) ', [item.publication_id,user], (error, results2) => {
              if (error) {
                throw error
              }
              {
                result2 = JSON.parse(JSON.stringify(results2.rows));
                i++;
                if (result2.length!=0){
                  list_to_send.push(result2);
 
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }
                else if (result2.length==0){
                  if(i==result1.length){
                    callback(list_to_send);
                  }
                }

              }
            })
            
          }
         }
         else if (result1.length==0){    
          callback([])
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
    last_week.setDate(last_week.getDate() - 160);
  
  
    let list_to_send=[];
   
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND publication_category=$5 AND style=$2 AND "createdAt" ::date <=$3 AND "createdAt" ::date >= $4 ) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit 20', [user,style,_today,last_week,'bd'], (error, results1) => {
        if (error) {
          throw error
        }
        else{
          const result1 = JSON.parse(JSON.stringify(results1.rows));
          let i=0;
          if(result1.length!=0){
            for (let item of result1){
                  pool.query('SELECT * FROM liste_writings WHERE writing_id = $1 AND authorid != $2 AND authorid NOT IN (SELECT authorid FROM liste_bd_one_shot WHERE bd_id IN (SELECT DISTINCT publication_id FROM list_of_views  WHERE author_id_who_looks = $2 AND format=$3))', [item.publication_id,user,'one-shot'], (error, results2) => {
                    if (error) {
                      throw error
                    }
                    {
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
  get_view_table_by_user,
  get_first_recommendation_bd_os_for_user,
  get_first_recommendation_bd_serie_for_user,
  get_first_recommendation_drawing_os_for_user,
  get_first_recommendation_drawing_artbook_for_user,
  get_first_recommendation_writings_for_user,
  see_more_recommendations_bd,
  see_more_recommendations_drawings,
  see_more_recommendations_writings,

}