const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var glob = require("glob")
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




module.exports = (router, list_of_navbar_researches,list_of_subscribings, list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    router.get('/get_most_researched_main_propositions', function (req, res) {
        /*let id_user = get_current_user(req.cookies.currentUser);
        const Op = Sequelize.Op;
        var list_of_history=[];
        var list_of_users_to_send=[];
        var list_of_publications=[]
        list_of_navbar_researches.findAndCountAll({
            attributes: ['publication_category','format','target_id','research_string'],
        }).then(result=>{
            console.log(result);
            res.status(200).send([result])
        })*/
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

        var last_week = new Date();
        last_week.setDate(last_week.getDate() - 7);

        pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_week], (error, results) => {
            if (error) {
              throw error
            }
            else{
                result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
       
     });
  
  
     
     router.get('/get_searching_propositions/:text', function (req, res) {
      let id_user = get_current_user(req.cookies.currentUser);
      let text = req.params.text;
      const Op = Sequelize.Op;
      var list_of_related_users=[];
      var list_of_history=[];
      var list_of_other_users=[];
  
     
  
     
      
    });


    
    router.post('/add_main_research_to_history', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category = req.body.text;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let research_string = req.body.research_string;

        list_of_navbar_researches.create({
            "id_user":id_user,
            "publication_category":publication_category,
            "format":format,
            "target_id":target_id,
            "research_string":research_string,
        }).then(result=>{
            res.status(200).send([result])
        } )
    })
    
}