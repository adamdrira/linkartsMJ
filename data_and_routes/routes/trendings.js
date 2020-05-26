const category = require('../../comics_one_shot_and_cover/controllers/controller');
const fetch = require("node-fetch");
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
      console.log(result.rows)
    })
  })

  const send_rankings_and_get_trendings_comics = (request, response) => {

    var today = new Date();
    var _before_before_yesterday = new Date();
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 14);
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
  
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;

  fs.access( __dirname + `/python_files/bd_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
    if(err){
      
    // si les tendances n'ont pas déjà été chargé pour la journée on les charges

  let fastcsv = require("fast-csv");
  let Path1=`/csvfiles_for_python/view_rankings.csv`;
  let Path2=`/csvfiles_for_python/likes_rankings.csv`;
  let Path3=`/csvfiles_for_python/loves_rankings.csv`
  let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);
  let ws1 = fs.createWriteStream('./data_and_routes/routes' + Path2);
  let ws2= fs.createWriteStream('./data_and_routes/routes' + Path3);


  
  pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null ', [today,_before_before_yesterday], (error, results) => {
    if (error) {
      throw error
    }
    else{
      let json_view = JSON.parse(JSON.stringify(results.rows));
      console.log(json_view)
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
                        let data = {csv_likes_file:fs.createReadStream(__dirname + Path2),csv_loves_file:fs.createReadStream(__dirname + Path3),csv_view_file:fs.createReadStream(__dirname + Path1)};
                        Request.post('http://localhost:777/rankings', {formData: data, headers:{'date':date}},  (err, resp, body) => {
                            if (err) {
                            console.log('Error!');
                            }
                            else{
                              let files = [__dirname + Path1,__dirname + Path2,__dirname + Path3];
                              for (let i=0;i<files.length;i++){
                                fs.access(files[i], fs.F_OK, (err) => {
                                  if(err){
                                    console.log('suppression already done for first path'); 
                                    if(i==files.length -1){
                                      return response.status(200).send([{"data":"sent"}]); 
                                    } 
                                  }  
                                  else{
                                    fs.unlink(files[i],function (err) {
                                      if (err) {
                                        throw err;
                                      } 
                                      if(i==files.length -1){
                                        return response.status(200).send([{"data":"sent"}]); 
                                      } 
                                    });
                                    
                                  }     
                                })
                              }                             
                            }
                            })
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
      else{
        //on envoie les 3 json (d'abord les bd pour tester)
        let json =require(`./python_files/bd_rankings_for_trendings-${date}.json`);
        return response.status(200).send([{"bd_trendings":json}]); 
      }
    })

}


const get_drawings_trendings = (request, response) => {

  let date = request.params.date;
  fs.access( __dirname + `/python_files/drawings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
    if(err){
      console.log("bd trendings have do be sent first");
      }
      else{
        let json =require(`./python_files/drawings_rankings_for_trendings-${date}.json`);
        return response.status(200).send([{"drawings_trendings":json}]); 
      }
    })

}

const get_writings_trendings = (request, response) => {

  let date = request.params.date;
  console.log("recuperationnnnnnnnnnnnnn trendings");
  fs.access( __dirname + `/python_files/writings_rankings_for_trendings-${date}.json`, fs.F_OK, (err) => {
    if(err){
      console.log("bd trendings have do be sent first");
      }
      else{
        let json =require(`./python_files/writings_rankings_for_trendings-${date}.json`);
        return response.status(200).send([{"writings_trendings":json}]); 
      }
    })

}


  module.exports = {
    send_rankings_and_get_trendings_comics,
    get_drawings_trendings,
    get_writings_trendings
  }