const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Pool = require('pg').Pool;

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


const get_comics_recommendations_by_author = (request, response) => {
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
  

  const id_user = request.body.id_user;
  const publication_id = request.body.publication_id;
  var list_to_send=[];

  pool.query('SELECT * FROM list_of_contents  WHERE id_user=$1 AND status=$4 AND  publication_category=$2 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND publication_id=$3) ORDER BY "createdAt" DESC limit 4', [id_user,"comic",publication_id,"ok"], (error, results) => {
    if (error) {
        response.status(500).send([{error:err}])
    }
    else{
        let result = JSON.parse(JSON.stringify(results.rows));
        if(result.length>0){
            let j=0;
            for (let i=0; i< result.length;i++){  
                if (result[i].format=="one-shot"){
                    pool.query('SELECT * FROM liste_bd_one_shot  WHERE authorid=$1 AND bd_id=$2 AND status=$3', [id_user,result[i].publication_id,"public"], (error, results2) => {
                    if (error) {
                        response.status(500).send([{error:err}])
                    }
                    else{
                        let result2 = JSON.parse(JSON.stringify(results2.rows));
                        list_to_send.push(result2);
                        j++;
                        if(j==result.length){
                            response.status(200).send([{"list_to_send":list_to_send}]);
                        }
                    }
                });
                }
                if (result[i].format=="serie"){
                  
                        pool.query('SELECT * FROM liste_bd_serie WHERE authorid=$1 AND bd_id=$2 AND status=$3', [id_user,result[i].publication_id,"public"], (error, results2) => {
                        if (error) {
                            response.status(500).send([{error:err}])
                        }
                        else{
                            let result2 = JSON.parse(JSON.stringify(results2.rows));
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
  
    const id_user = request.body.id_user;
    const publication_id = request.body.publication_id;
    var list_to_send=[];
  
   
  
    pool.query('SELECT * FROM list_of_contents WHERE id_user=$1 AND publication_category=$2 AND status=$4 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND publication_id=$3) ORDER BY "createdAt" DESC limit 4', [id_user,"drawing",publication_id,"ok"], (error, results) => {
      if (error) {
        response.status(500).send([{error:err}])
      }
      else{
          let result = JSON.parse(JSON.stringify(results.rows));
          if(result.length>0){
            let j=0;
            for (let i=0; i< result.length;i++){  
                if (result[i].format=="one-shot"){
                    pool.query('SELECT * FROM liste_drawings_one_page  WHERE authorid=$1 AND drawing_id=$2 AND status=$3', [id_user,result[i].publication_id ,"public"], (error, results2) => {
                        if (error) {
                            response.status(500).send([{error:err}])
                        }
                        else{
                            let result2 = JSON.parse(JSON.stringify(results2.rows));
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
                    pool.query('SELECT * FROM liste_drawings_artbook WHERE authorid=$1 AND drawing_id=$2 AND status=$3', [id_user,result[i].publication_id,"public"], (error, results2) => {
                        if (error) {
                            response.status(500).send([{error:err}])
                        }
                        else{
                            let result2 = JSON.parse(JSON.stringify(results2.rows));
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
  
    const id_user = request.body.id_user;
    const publication_id = request.body.publication_id;
    var list_to_send=[];
  
   
  
    pool.query('SELECT * FROM list_of_contents WHERE id_user=$1 AND publication_category=$2 AND status=$4 AND id NOT IN (SELECT id FROM list_of_contents WHERE publication_category=$2 AND publication_id=$3) ORDER BY "createdAt" DESC limit 4', [id_user,"writing",publication_id,"ok"], (error, results) => {
      if (error) {
        response.status(500).send([{error:err}])
      }
      else{
          let result = JSON.parse(JSON.stringify(results.rows));
          if (result.length>0){
              let j=0;
            for (let i=0; i< result.length;i++){ 
                // on récupère la liste des bd d'un artiste dont l'utilisateur a vue une des oeuvres, à l'exception des oeuvres qu'il a déjà vu
                    pool.query('SELECT * FROM liste_writings WHERE authorid=$1 AND writing_id=$2 AND status=$3', [id_user,result[i].publication_id ,"public"], (error, results2) => {
                    if (error) {
                        response.status(500).send([{error:err}])
                    }
                    else{
                        let result2 = JSON.parse(JSON.stringify(results2.rows));
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



    const get_artwork_recommendations_by_tag = (req, res) => {
        if( ! req.headers['authorization'] ) {
            return response.status(401).json({msg: "error"});
        }
        else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
                return response.status(401).json({msg: "error"});
            }
        }
        status="clicked";
        let limit = req.body.limit;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let category = req.body.category;
        let first_filter = (req.body.first_filter=== "Poésie") ? "Poetry": (req.body.first_filter === "Scénario") ? "Scenario" : (req.body.first_filter === "Roman illustré") ? "Illustrated novel" : req.body.first_filter;
        let second_filter = req.body.second_filter;

     
        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6  AND id not in (SELECT id from list_of_navbar_researches where publication_category=$1 and format=$4 and target_id=$7) GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 ', [category,status,limit,format,second_filter,first_filter,target_id], (error, results) => {
            if (error) {
                response.status(500).send([{error:err}])
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                
                if(result.length<6){
                    let new_limit=6-result.length;
                 
                    pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style!=$6  AND id not in (SELECT id from list_of_navbar_researches where publication_category=$1 and format=$4 and target_id=$7) GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 '  , [category,status,new_limit,format,second_filter,first_filter,target_id], (error, results2) => {
                        if (error) {
                            response.status(500).send([{error:err}])
                        }
                        else{
                            let result2 = JSON.parse(JSON.stringify(results2.rows));
       
                            if(result2.length>0){
                                result=result.concat(result2);
                            }
                            response.status(200).send([result]);
                            
                        }
                    })
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    response.status(200).send([result]);
                }
                
            }
        })
    
    };

  const get_recommendations_by_tag = (request, response) => {
   
  
  }
  
  


  




module.exports = {
    get_comics_recommendations_by_author,
    get_drawings_recommendations_by_author,
    get_writings_recommendations_by_author,
    get_artwork_recommendations_by_tag,
    get_recommendations_by_tag

}