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
    _before_before_yesterday.setDate(_before_before_yesterday.getDate() - 15);

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

          pool.query(' SELECT * FROM list_of_views WHERE "createdAt" ::date  <= $1 AND "createdAt" ::date >= $2 AND view_time is not null AND monetization=$3 ', [today>
            if (error) {

            }
            else{
              let json_view = JSON.parse(JSON.stringify(results.rows));
              fastcsv.write(json_view, { headers: true })
              .pipe(ws)
              .on('error', function(e){
              })
              .on("finish", function() {
                pool.query(' SELECT * FROM list_of_likes WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2  AND monetization=$3 ', [today,_before_before_yest>
                    if (error) {
                    }
                    else{

                    let json_likes = JSON.parse(JSON.stringify(results.rows));
                    fastcsv.write(json_likes, { headers: true })
                    .pipe(ws1)
                      .on('error', function(e){
                      })
                      .on("finish", function() {

                        pool.query(' SELECT * FROM list_of_loves WHERE "createdAt" ::date <= $1 AND "createdAt" ::date >= $2   AND monetization=$3', [today,_before_bef>
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
                                //const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Lo>
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

