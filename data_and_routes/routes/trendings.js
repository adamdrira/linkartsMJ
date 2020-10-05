const category = require('../../comics_one_shot_and_cover/controllers/controller');
const fetch = require("node-fetch");
var {spawn} = require("child_process")
const usercontroller = require('../../authentication/user.controller');
var Request = require('request');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const trendings_seq= require('../../p_trendings/model/sequelize');
const Sequelize = require('sequelize');
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
    var today = new Date();
    
    let fastcsv = require("fast-csv");
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
        throw error
      }
      else{
        let json_view = JSON.parse(JSON.stringify(results.rows));
        fastcsv.write(json_view, { headers: true })
        .pipe(ws)
        .on('error', function(e){
          console.log(e)
        })
        .on("finish", function() {
          pool.query(' SELECT * FROM list_of_likes WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  ', [today,_before_before_yesterday], (error, results) => {
              if (error) {
                throw error
              }
              else{

              let json_likes = JSON.parse(JSON.stringify(results.rows));
              fastcsv.write(json_likes, { headers: true })
              .pipe(ws1)
                .on('error', function(e){
                  console.log(e)
                })
                .on("finish", function() {
              
                  pool.query(' SELECT * FROM list_of_loves WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  ', [today,_before_before_yesterday], (error, results) => {
                      if (error) {
                        throw error
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
      })

  }

  const send_rankings_and_get_trendings_comics = (request, response) => {

    var today = new Date();
    
    const Op = Sequelize.Op;
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 90);
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    
    trendings_seq.trendings_comics.findOne({
      where:{
        date:date
      }
    }).then(result=>{
      if(result){
        console.log("trendings exist");
        /*fs.access(__dirname + `/python_files/comics_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
          if(err){
            console.log('suppression already done');
            response.status(200).send([{"comics_trendings":result.trendings}]);
          }  
          else{
            fs.unlink(__dirname + `/python_files/comics_rankings_for_trendings-${date}.json`,function (err) {
              if (err) {
                throw err;
              } 
              else{
                response.status(200).send([{"comics_trendings":result.trendings}]);
              }
            });  
            
          }
          
        })*/
        response.status(200).send([{"comics_trendings":result.trendings}]);
      }
      else{
        // si les tendances n'ont pas déjà été chargé pour la journée on les charges

        let fastcsv = require("fast-csv");
        let Path1=`/csvfiles_for_python/view_rankings.csv`;
        let Path2=`/csvfiles_for_python/likes_rankings.csv`;
        let Path3=`/csvfiles_for_python/loves_rankings.csv`
        let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
        let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
        let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);


        
        pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null AND monetization=$3 ', [today,_before_before_yesterday,'true'], (error, results) => {
          if (error) {
            throw error
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
                    throw error
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
                            throw error
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
                                        }).then(result=>{
                                            return response.status(200).send([{comics_trendings:json}]); 
                                        })
                                      } 
                                    }  
                                    else{
                                      fs.unlink(files[i],function (err) {
                                        if (err) {
                                          throw err;
                                        } 
                                        if(i==files.length -1){
                                          let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/comics_rankings_for_trendings-${date}.json`));
                                          trendings_seq.trendings_comics.create({
                                            "trendings":json,
                                            "date":date
                                          }).then(result=>{
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

  let date = request.params.date;

  trendings_seq.trendings_drawings.findOne({
    where:{
      date:date
    }
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
      }).then(result=>{
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
            }).then(result=>{
                return response.status(200).send([{"drawings_trendings":json}]); 
            })
           
          }
        })*/
    }
  })

  
  

}

const get_writings_trendings = (request, response) => {

  let date = request.params.date;

  trendings_seq.trendings_writings.findOne({
    where:{
      date:date
    }
  }).then(result=>{
    if(result){
      response.status(200).send([{"writings_trendings":result.trendings}]);
      console.log("it exists");
      /*fs.access(__dirname + `/python_files/writings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
        if(err){
          console.log('suppression already done');
          response.status(200).send([{"writings_trendings":result.trendings}]);
        }  
        else{
          fs.unlink(__dirname + `/python_files/writings_rankings_for_trendings-${date}.json`,function (err) {
            if (err) {
              throw err;
            } 
            else{
              response.status(200).send([{"writings_trendings":result.trendings}]);
            }
          });  
          
        }
        
      })*/
    }
    else{
      let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`));
      trendings_seq.trendings_writings.create({
        "trendings":json,
        "date":date
      }).then(result=>{
          return response.status(200).send([{"writings_trendings":json}]); 
      })

      /*fs.access( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
        if(err){
          console.log("drawings trednings prob");
          }
          else{
            let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`));
            trendings_seq.trendings_drawings.create({
              "trendings":json,
              "date":date
            }).then(result=>{
                return response.status(200).send([{"writings_trendings":json}]); 
            })
          }
        })*/
    }
  })


}


  module.exports = {
    send_rankings_and_get_trendings_comics,
    get_drawings_trendings,
    get_writings_trendings,
    get_trendings_for_tomorrow
  }