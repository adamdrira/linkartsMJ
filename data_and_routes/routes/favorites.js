const category = require('../../comics_one_shot_and_cover/controllers/controller');
const fetch = require("node-fetch");
var {spawn} = require("child_process")
const usercontroller = require('../../authentication/user.controller');
var Request = require('request');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const authentification = require('../../authentication/db.config');
const trendings_seq= require('../../p_trendings/model/sequelize');
const favorites_seq= require('../../favorites/model/sequelize');
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


  const generate_or_get_favorites = (request, response) => {

    console.log("stat generating favorites")
    var today = new Date();
  
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()+1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    console.log(Number(dd))
    const date = yyyy.toString() + '-' +  mm  + '-' + dd;
    


    let fastcsv = require("fast-csv");
    let Path1=`/csvfiles_for_python/favorites_ranking-${date}.csv`;
    let ws = fs.createWriteStream('./data_and_routes/routes' + Path1);

    favorites_seq.favorites.findAll({
      where:{
        date: date
      },
      order: [
          ['rank', 'ASC']
        ],
    }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(resu=>{
      if(resu[0]){
        console.log("result favo ok")
        return response.status(200).send([{favorites:resu}]);
      }
      else{
        generate_favorites()
      }
    })

    function generate_favorites(){
      console.log("generate favorites")
      pool.query(' SELECT * FROM users WHERE type_of_account=$1 OR type_of_account=$2 OR type_of_account=$3 OR type_of_account=$4 OR type_of_account=$5 ORDER BY subscribings_number DESC',["Artiste","Artistes","Artiste professionnel","Artiste professionnelle","Artistes professionnels"], (error, results) => {
        if (error) {
          console.log(err)
          response.status(500).send([{error:err}])
        }
        else{
            let json_view = JSON.parse(JSON.stringify(results.rows));
            console.log("favorites ")
            fastcsv.write(json_view, { headers: true })
            .pipe(ws)
            .on('error', function(e){
                console.log(e)
            })
            .on("finish", function() {
                const pythonProcess = spawn('C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/python',['C:/Users/Utilisateur/AppData/Local/Programs/Python/Python38-32/Lib/site-packages/favorites.py', date]);
                //console.log(pythonProcess)
                pythonProcess.stderr.pipe(process.stderr);
                pythonProcess.stdout.on('data', (data) => {
                  console.log("python res")
                  console.log(data.toString())
                });
                pythonProcess.stdout.on("end", (data) => {
                  console.log("end received data python: ");
                  console.log(__dirname + `/python_files/favorites_ranking-${date}.json`)
                  let json = JSON.parse(fs.readFileSync( __dirname + `/python_files/favorites_ranking-${date}.json`))
                  console.log(json)
                  fs.access(__dirname + Path1, fs.F_OK, (err) => {
                    if(err){
                      console.log('suppression already done for first path'); 
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
      console.log("add_favorites")
      console.log(json)
      console.log(Object.keys(json.id).length)
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
          console.log(err);	
          res.status(500).json({msg: "error", details: err});		
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
        console.log("add_to_data")
        console.log(list_of_users.length)
        for(let i=0;i<list_of_users.length;i++){
          let ranking=get_ranking(i);
          list_of_rankings[i]=ranking;
          let remuneration= get_remuneration(list_of_users[i].subscribers.length,ranking);
          if(Number(dd)!=1){
            remuneration="0";
          }
          if(list_of_users[i].gender=='Groupe'){
            finalize_add_to_data(list_of_users[i],i,ranking,remuneration)
          }
          else{
            favorites_seq.favorites.create({
              "id_user": list_of_users[i].id,
              "date":date,
              "rank":ranking,
              "remuneration":remuneration,
              "type_of_account":list_of_users[i].type_of_account
            }).catch(err => {
              console.log(err);	
              res.status(500).json({msg: "error", details: err});		
            }).then(favorites=>{
              compteur_done++;
              if(compteur_done==list_of_users.length){
                
                return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                  
              }
            })
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
          if(number<1000){
            let num = 3*(1/2+ (1/3)*(1/ranking)*((1/80)*number + 12.5));
            
            return num.toFixed(2)
          }
          if(number<1000){
            let num = 3*(2/5+ (1/3)*(1/ranking)*((3/1000)*number + 20));
            return num.toFixed(2)
          }
          if(number<100000){
            let num = 3*(1 + (1/3)*(1/ranking)*((6/10000)*number + 40));
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
            console.log(err);	
            res.status(500).json({msg: "error", details: err});		
          }).then(members=>{
            
            if(members[0]){
              console.log("members_found")
              for(let j=0;j<members.length;j++){
                shares[members[j].id_user]=members[j].share;
              }
              console.log(shares)
              favorites_seq.favorites.create({
                "id_user": list_of_users[i].id,
                "date":date,
                "rank":ranking,
                "remuneration":remuneration,
                "type_of_account":list_of_users[i].type_of_account,
                "shares":[shares],
              }).catch(err => {
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
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
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
              }).then(favorites=>{
                compteur_done++;
                if(compteur_done==list_of_users.length){
                
                  return response.status(200).send([{list_of_users:list_of_users,list_of_rankings:list_of_rankings}]);
                    
                }
              })
            }
  
            
          })
        }
  
      }
     
    }
}




module.exports = {
  generate_or_get_favorites
  }