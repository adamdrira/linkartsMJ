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
    })
  })





const get_comics_recommendations_by_author = (request, response) => {


  const id_user = request.body.id_user;
  const publication_id = request.body.publication_id;
  const format = request.body.format;
  var list_to_send=[];

 

  pool.query('SELECT * FROM list_of_contents  WHERE id_user=$1 AND status=$5 AND  publication_category=$2 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND format=$3 AND publication_id=$4) ORDER BY "updatedAt" DESC limit 6', [id_user,"comics",format,publication_id,"ok"], (error, results) => {
    if (error) {
      throw error
    }
    else{
        result = JSON.parse(JSON.stringify(results.rows));
        if(result.length>0){
            let j=0;
            for (let i=0; i< result.length;i++){  
                if (result[i].format=="one-shot"){
                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                    pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid=$1 AND bd_id=$2', [id_user,result[i].publication_id], (error, results2) => {
                    if (error) {
                        throw error
                    }
                    else{
                        result2 = JSON.parse(JSON.stringify(results2.rows));
                        list_to_send.push(result2);
                        j++;
                        if(j==result.length){
                            response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                    }
                });
                }
                if (result[i].format=="serie"){
                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                        pool.query('SELECT * FROM liste_bd_serie WHERE authorid=$1 AND bd_id=$2', [id_user,result[i].publication_id], (error, results2) => {
                        if (error) {
                            throw error
                        }
                        else{
                            result2 = JSON.parse(JSON.stringify(results2.rows));
                            list_to_send.push(result2);
                            j++;
                            if(j==result.length){
                                response.status(200).send([{"list_to_send":list_to_send}]);
                            }
                        }
                    });
                }
            }
        }
        else {
            response.status(200).send([{"list_to_send":list_to_send}]);
        }
    }
    })

}

const get_drawings_recommendations_by_author = (request, response) => {


    const id_user = request.body.id_user;
    const publication_id = request.body.publication_id;
    const format = request.body.format;
    var list_to_send=[];
  
   
  
    pool.query('SELECT * FROM list_of_contents WHERE id_user=$1 AND publication_category=$2 AND status=$5 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND format=$3 AND publication_id=$4) ORDER BY "updatedAt" DESC limit 6', [id_user,"drawing",format,publication_id,"ok"], (error, results) => {
      if (error) {
        throw error
      }
      else{
          result = JSON.parse(JSON.stringify(results.rows));
          if(result.length>0){
            let j=0;
            for (let i=0; i< result.length;i++){  
                if (result[i].format=="one-shot"){
                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                    pool.query('SELECT * FROM liste_drawings_one_page  WHERE authorid=$1 AND drawing_id=$2', [id_user,result[i].publication_id], (error, results2) => {
                    if (error) {
                        throw error
                    }
                    else{
                        result2 = JSON.parse(JSON.stringify(results2.rows));
                        list_to_send.push(result2);
                        j++;
                        if(j==result.length){
                            response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                    }
                });
                }
                if (result[i].format=="artbook"){
                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                        pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid=$1 AND drawing_id=$2', [id_user,result[i].publication_id], (error, results2) => {
                        if (error) {
                            throw error
                        }
                        else{
                            result2 = JSON.parse(JSON.stringify(results2.rows));
                            list_to_send.push(result2);
                            j++
                            if(j==result.length){
                                response.status(200).send([{"list_to_send":list_to_send}]);
                            }
                        }
                    });
                }
                }
            }
            else {
                response.status(200).send([{"list_to_send":list_to_send}]);
            }
      }
      })
  
  }


  const get_writings_recommendations_by_author = (request, response) => {


    const id_user = request.body.id_user;
    const publication_id = request.body.publication_id;
    const format = request.body.format;
    var list_to_send=[];
  
   
  
    pool.query('SELECT * FROM list_of_contents WHERE id_user=$1 AND publication_category=$2 AND status=$5 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND format=$3 AND publication_id=$4) ORDER BY "updatedAt" DESC limit 6', [id_user,"writing",format,publication_id,"ok"], (error, results) => {
      if (error) {
        throw error
      }
      else{
          result = JSON.parse(JSON.stringify(results.rows));
          if (result.length>0){
              let j=0;
            for (let i=0; i< result.length;i++){ 
                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                    pool.query('SELECT * FROM liste_writings WHERE authorid=$1 AND writing_id=$2', [id_user,result[i].publication_id], (error, results2) => {
                    if (error) {
                        throw error
                    }
                    else{
                        result2 = JSON.parse(JSON.stringify(results2.rows));
                        list_to_send.push(result2);
                        j++;
                        if(j==result.length){
                            response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                    }
                });
                }
            }
            else {
                response.status(200).send([{"list_to_send":list_to_send}]);
            }
      }
      })
  
  }


  const get_recommendations_by_tag = (request, response) => {

    var last_week = new Date();
    last_week.setDate(last_week.getDate() - 40);
    const limit=6;
    const limit2=6;
    var user=0;
    jwt.verify(request.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    const id_user = request.body.id_user;
    const publication_category = request.body.publication_category;
    const publication_id = request.body.publication_id;
    const format = request.body.format;
    const style = request.body.style;
    const firsttag=request.body.firsttag;
    var list_to_send=[];
    console.log("frmt");
    console.log(format);
    pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND style=$2 AND format=$7 AND firsttag=$3  AND "createdAt" ::date >= $4 AND view_time IS NOT NULL AND (publication_category,format,publication_id) NOT IN (SELECT publication_category,format,publication_id FROM list_of_contents WHERE publication_category=$6 AND format=$7 AND publication_id=$8)) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit $5', [user,style,firsttag,last_week,limit,publication_category,format,publication_id], (error, results) => {
      if (error) {
        throw error
      }
      else{
          var result = JSON.parse(JSON.stringify(results.rows));
          
            pool.query('SELECT * FROM (SELECT DISTINCT publication_category,format, style, publication_id  FROM  list_of_views WHERE author_id_who_looks != $1 AND style=$2 AND format=$7 AND firsttag!=$3 AND (secondtag=$3 OR thirdtag=$3) AND "createdAt" ::date >= $4 AND view_time IS NOT NULL AND (publication_category,format,publication_id) NOT IN (SELECT publication_category,format,publication_id FROM list_of_contents WHERE publication_category=$6 AND format=$7 AND publication_id=$8)) as t GROUP BY t.publication_category,t.format, t.style, t.publication_id ORDER BY Count(*) limit $5', [user,style,firsttag,last_week,limit2,publication_category,format,publication_id], (error, results1) => {
                if (error) {
                  throw error
                }
                else{
                    result1 = JSON.parse(JSON.stringify(results1.rows));
                    result= result.concat(result1);
                    console.log("rslt")
                    console.log(result);
                    console.log(format);
                    if(result.length>0){
                        let j=0;
                        if (publication_category=="comics"){ 
                            for (let i=0; i< result.length;i++){
                                if (result[i].format=="one-shot"){
                                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                    pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid NOT IN ($1,$3) AND bd_id=$2', [user,result[i].publication_id,id_user], (error, results2) => {
                                    if (error) {
                                        throw error
                                    }
                                    else{
                                        result2 = JSON.parse(JSON.stringify(results2.rows));
                                        if(result2.length>0){
                                            list_to_send.push(result2);
                                        }
                                        j++
                                        if(j==result.length){
                                            response.status(200).send([{"list_to_send":list_to_send}]);
                                        }
                                    }
                                });
                                }
                                if (result[i].format=="serie"){
                                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                        pool.query('SELECT * FROM liste_bd_serie WHERE authorid NOT IN ($1,$3) AND bd_id=$2', [user,result[i].publication_id,id_user], (error, results2) => {
                                        if (error) {
                                            throw error
                                        }
                                        else{
                                            result2 = JSON.parse(JSON.stringify(results2.rows));
                                            if(result2.length>0){
                                                list_to_send.push(result2);
                                            }
                                            j++
                                            if(j==result.length){
                                                response.status(200).send([{"list_to_send":list_to_send}]);
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        else if(publication_category=="drawing"){
                            for (let i=0; i< result.length;i++){ 
                                if (result[i].format=="one-shot"){
                                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                        pool.query('SELECT * FROM liste_drawings_one_page  WHERE authorid NOT IN ($1,$3) AND drawing_id=$2', [user,result[i].publication_id,id_user], (error, results2) => {
                                        if (error) {
                                            throw error
                                        }
                                        else{
                                            result2 = JSON.parse(JSON.stringify(results2.rows));
                                            if(result2.length>0){
                                                list_to_send.push(result2);
                                            }
                                            j++
                                            if(j==result.length){
                                                response.status(200).send([{"list_to_send":list_to_send}]);
                                            }
                                        }
                                    });
                                    }
                                    if (result[i].format=="artbook"){
                                        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                            pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid NOT IN ($1,$3) AND drawing_id=$2', [user,result[i].publication_id,id_user], (error, results2) => {
                                            if (error) {
                                                throw error
                                            }
                                            else{
                                                result2 = JSON.parse(JSON.stringify(results2.rows));
                                                if(result2.length>0){
                                                    list_to_send.push(result2);
                                                }
                                                j++
                                                if(j==result.length){
                                                    console.log(list_to_send);
                                                    response.status(200).send([{"list_to_send":list_to_send}]);
                                                }
                                            }
                                        });
                                    }
                                }
                        }
                        else if (publication_category=="writing"){
                            for (let i=0; i< result.length;i++){
                                pool.query('SELECT * FROM liste_writings WHERE authorid NOT IN ($1,$3) AND writing_id!=$2', [user,result[i].publication_id,id_user], (error, results2) => {
                                    if (error) {
                                        throw error
                                    }
                                    else{
                                        result2 = JSON.parse(JSON.stringify(results2.rows));
                                        if(result2.length>0){
                                            list_to_send.push(result2);
                                        }
                                        j++
                                        if(j==result.length){
                                            response.status(200).send([{"list_to_send":list_to_send}]);
                                        }
                                }});
                            }
                        }
                    }
                    else {
                        if (publication_category=="comics"){ 
                                if (format=="one-shot"){
                                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                    pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid NOT IN ($1,$2) AND category=$4 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) ORDER BY "createdAt" DESC limit 6', [user,id_user,firsttag,style], (error, results2) => {
                                    if (error) {
                                        throw error
                                    }
                                    else{
                                        result2 = JSON.parse(JSON.stringify(results2.rows));
                                        if(result2.length>0){
                                            list_to_send.push(result2);
                                        }
                                        response.status(200).send([{"list_to_send":list_to_send}]);
                                    }
                                });
                                }
                                if (format=="serie"){
                                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                        pool.query('SELECT * FROM liste_bd_serie WHERE authorid NOT IN ($1,$2) AND category=$4 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) ORDER BY "createdAt" DESC limit 6', [user,id_user,firsttag,style], (error, results2) => {
                                        if (error) {
                                            throw error
                                        }
                                        else{
                                            result2 = JSON.parse(JSON.stringify(results2.rows));
                                            if(result2.length>0){
                                                list_to_send.push(result2);
                                            }
                                            response.status(200).send([{"list_to_send":list_to_send}]);
                                            
                                        }
                                    });
                                }
                        }
                        else if(publication_category=="drawing"){
                                if (format=="one-shot"){
                                    // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                        pool.query('SELECT * FROM liste_drawings_one_page  WHERE authorid NOT IN ($1,$2) AND category=$4 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) ORDER BY "createdAt" DESC limit 6', [user,id_user,firsttag,style], (error, results2) => {
                                        if (error) {
                                            throw error
                                        }
                                        else{
                                            result2 = JSON.parse(JSON.stringify(results2.rows));
                                            if(result2.length>0){
                                                list_to_send.push(result2);
                                            }
                                            response.status(200).send([{"list_to_send":list_to_send}]);
                                        }
                                    });
                                    }
                                    if (format=="artbook"){
                                        // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                                            pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid NOT IN ($1,$2) AND category=$4 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) ORDER BY "createdAt" DESC limit 6', [user,id_user,firsttag,style], (error, results2) => {
                                            if (error) {
                                                throw error
                                            }
                                            else{
                                                result2 = JSON.parse(JSON.stringify(results2.rows));
                                                if(result2.length>0){
                                                    list_to_send.push(result2);
                                                }
                                                response.status(200).send([{"list_to_send":list_to_send}]);
                                                
                                            }
                                        });
                                    }
                        }
                        else if (publication_category=="writing"){
                                pool.query('SELECT * FROM liste_writings WHERE authorid NOT IN ($1,$2) AND category=$4 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) ORDER BY "createdAt" DESC limit 6', [user,id_user,firsttag,style], (error, results2) => {
                                    if (error) {
                                        throw error
                                    }
                                    else{
                                        result2 = JSON.parse(JSON.stringify(results2.rows));
                                        if(result2.length>0){
                                            list_to_send.push(result2);
                                        }
                                        response.status(200).send([{"list_to_send":list_to_send}]);
                                        
                                }});
                        }
                    }
                }});
          
          
      }
      })
  
  }
  
  


  




module.exports = {
    get_comics_recommendations_by_author,
    get_drawings_recommendations_by_author,
    get_writings_recommendations_by_author,
    get_recommendations_by_tag

}