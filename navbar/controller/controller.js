const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Pool = require('pg').Pool;
const pool = new Pool({
    port: 5432,
    database: 'linkarts',
    user: 'adamdrira',
    password: 'E273adamZ9Qvps',
    host: 'localhost',
});

/*const pool = new Pool({
  port: 5432,
  database: 'linkarts',
  user: 'postgres',
  password: 'test',
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

module.exports = (router, list_of_navbar_researches,list_of_subscribings, list_of_users,list_of_ads,list_of_contents) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

    router.get('/get_most_researched_navbar/:category/:status', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let category = req.params.category;
        let status1 = req.params.status;
        let status2="clicked_after_research";
        



        var last_month = new Date();
        last_month.setDate(last_month.getDate() - 30);

        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND  (status=$2 OR status=$3 )GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_month,status1,status2], (error, results) => {
                if (error) {
                  
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND publication_category=$2 AND (status=$3 OR status=$4 )GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_month,category,status1,status2], (error, results) => {
                if (error) {
                  
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        
       
     });


     router.post('/get_history_recommendations', function (req, res) {
        if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
        }
        else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
            return res.status(401).json({msg: "error"});
        }
        }
        let categories=["Comic","Drawing","Writing"];
        let status="clicked_after_research"
        let status2="clicked"
        let id_user = get_current_user(req.cookies.currentUser);
        let list_of_histories=[];
        let list_of_comics=[];
        let list_of_drawings=[];
        let list_of_writings=[];
        let compteur=0;
        for(let i=0;i<categories.length;i++){
            pool.query('SELECT  publication_category,format,target_id,max("createdAt")  FROM list_of_navbar_researches WHERE publication_category=$1 AND id_user=$3   AND ( status=$2 OR  status=$4) GROUP BY publication_category,format,target_id ORDER BY max("createdAt") DESC LIMIT 60', [categories[i],status,id_user,status2], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));

                    if(result && result.length>0){
                        if(i==0){
                            get_comics(result)
                        }
                        else if(i==1){
                            get_drawings(result)
                        }
                        else{
                            get_writings(result)
                        }
                    }
                    else{
                        compteur++;
                        if(compteur==3){
                            res.status(200).send(list_of_histories);
                        }
                    }
                   
                    
                }
            })
        }
        

        function remove_null_elements(list){
            let len=list.length;
            for(let i=0;i<len;i++){
              if(!list[len-i-1]){
                list.splice(len-i-1,1);
              }
            }
        }

        function get_comics(list_of_comics_found){
            let compteur_before_done=0;
            for( let j=0;j<list_of_comics_found.length;j++){

                if(list_of_comics_found[j].format=="one-shot"){
                    pool.query('SELECT * FROM liste_bd_one_shot WHERE bd_id=$1 and status=$2', [list_of_comics_found[j].target_id,"public"], (error, results2) => {
                      if (error ) {
                        list_of_comics[j]=null;
                      }
                      else {
                        result2 = JSON.parse(JSON.stringify(results2.rows));
                        if(!result2[0]){
                            list_of_comics[j]=null;
                        }
                        else{
                            list_of_comics[j]=result2[0];
                        }
                        compteur_before_done++;
                        if(compteur_before_done==list_of_comics_found.length){
                          remove_null_elements(list_of_comics)
                          list_of_histories[0]=list_of_comics
                          compteur++;
                          if(compteur==3){
                              res.status(200).send(list_of_histories);
                          }
                        }
                      }
                    })
                }
                else{
                  pool.query('SELECT * FROM liste_bd_serie WHERE bd_id=$1 and status=$2', [list_of_comics_found[j].target_id,"public"], (error, results2) => {
                    if (error ) {
                        list_of_comics[j]=null;
                    }
                    else {
                      result2 = JSON.parse(JSON.stringify(results2.rows));
                      if(!result2[0]){
                        list_of_comics[j]=null;
                      }
                      else{
                        list_of_comics[j]=result2[0];
                      }
                   
                      compteur_before_done++;
                      if(compteur_before_done==list_of_comics_found.length){
                        remove_null_elements(list_of_comics)
                        list_of_histories[0]=list_of_comics
                        compteur++;
                        if(compteur==3){
                            res.status(200).send(list_of_histories);
                        }
                      }
                    }
                  })
                }
              }
        }
        
        function get_drawings(list_of_drawings_found){
            let compteur_before_done=0;
            for( let j=0;j<list_of_drawings_found.length;j++){

                if(list_of_drawings_found[j].format=="one-shot"){
                    pool.query('SELECT * FROM liste_drawings_one_page WHERE drawing_id=$1 and status=$2', [list_of_drawings_found[j].target_id,"public"], (error, results2) => {
                      if (error ) {
                        list_of_drawings[j]=null;
                      }
                      else {
                        result2 = JSON.parse(JSON.stringify(results2.rows));
                        if(!result2[0]){
                            list_of_drawings[j]=null;
                        }
                        else{
                            list_of_drawings[j]=result2[0];
                        }
                        compteur_before_done++;
                        if(compteur_before_done==list_of_drawings_found.length){
                          remove_null_elements(list_of_drawings)
                          list_of_histories[1]=list_of_drawings
                          compteur++;
                          if(compteur==3){
                              res.status(200).send(list_of_histories);
                          }
                        }
                      }
                    })
                }
                else{
                  pool.query('SELECT * FROM liste_drawings_artbook WHERE drawing_id=$1 and status=$2', [list_of_drawings_found[j].target_id,"public"], (error, results2) => {
                    if (error ) {
                        list_of_drawings[j]=null;
                    }
                    else {
                      result2 = JSON.parse(JSON.stringify(results2.rows));
                      if(!result2[0]){
                        list_of_drawings[j]=null;
                      }
                      else{
                        list_of_drawings[j]=result2[0];
                      }
                   
                      compteur_before_done++;
                      if(compteur_before_done==list_of_drawings_found.length){
                        remove_null_elements(list_of_drawings)
                        list_of_histories[1]=list_of_drawings
                        compteur++;
                        if(compteur==3){
                            res.status(200).send(list_of_histories);
                        }
                      }
                    }
                  })
                }
              }
        }

        function get_writings(list_of_writings_found){
            let compteur_before_done=0;
            for( let j=0;j<list_of_writings_found.length;j++){
                  pool.query('SELECT * FROM liste_writings WHERE writing_id=$1 and status=$2', [list_of_writings_found[j].target_id,"public"], (error, results2) => {
                    if (error ) {
                        list_of_writings[j]=null;
                    }
                    else {
                      result2 = JSON.parse(JSON.stringify(results2.rows));
                      if(!result2[0]){
                        list_of_writings[j]=null;
                      }
                      else{
                        list_of_writings[j]=result2[0];
                      }
                   
                      compteur_before_done++;
                      if(compteur_before_done==list_of_writings_found.length){
                        remove_null_elements(list_of_writings)
                        list_of_histories[2]=list_of_writings
                        compteur++;
                        if(compteur==3){
                            res.status(200).send(list_of_histories);
                        }
                      }
                    }
                  })
              }
        }
    });

    

    router.post('/check_if_contents_clicked', function (req, res) {
        
        if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
        }
        else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
            return res.status(401).json({msg: "error"});
        }
        }
        let id_user = get_current_user(req.cookies.currentUser);
        let list_of_comics=[];
        let list_of_drawings=[];
        let list_of_writings=[];

        if(id_user==80){
            return res.status(200).send([{list_of_comics:list_of_comics,list_of_drawings:list_of_drawings,list_of_writings:list_of_writings}])
        }

        let compteur=0;
        list_of_navbar_researches.findAll({
            where:{
                id_user:id_user,
                publication_category:"Comic",
                status:["clicked_after_research","clicked"]
            }
        }).then(comics=>{
            list_of_comics=comics;
            compteur++;
            if(compteur==3){
                res.status(200).send([{list_of_comics:list_of_comics,list_of_drawings:list_of_drawings,list_of_writings:list_of_writings}])
            }
        })

        list_of_navbar_researches.findAll({
            where:{
                id_user:id_user,
                publication_category:"Writing",
                status:["clicked_after_research","clicked"]
            }
        }).then(writings=>{
            list_of_writings=writings;
            compteur++;
            if(compteur==3){
                res.status(200).send([{list_of_comics:list_of_comics,list_of_drawings:list_of_drawings,list_of_writings:list_of_writings}])
            }
        })

        list_of_navbar_researches.findAll({
            where:{
                id_user:id_user,
                publication_category:"Drawing",
                status:["clicked_after_research","clicked"]
            }
        }).then(drawings=>{
            list_of_drawings=drawings;
            compteur++;
            if(compteur==3){
                res.status(200).send([{list_of_comics:list_of_comics,list_of_drawings:list_of_drawings,list_of_writings:list_of_writings}])
            }
        })
    });
    

    router.post('/get_last_researched_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let category = req.body.category;
        let status="clicked_after_research"
        let id_user = get_current_user(req.cookies.currentUser);
        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,max("createdAt")  FROM list_of_navbar_researches WHERE status=$1 AND id_user=$2 GROUP BY publication_category,format,target_id ORDER BY max("createdAt") DESC LIMIT 10', [status,id_user], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else if(category=="Account" ||  category=="Ad" || category=="Comic" || category=="Drawing" || category=="Writing" ){
            pool.query('SELECT  publication_category,format,target_id,max("createdAt")  FROM list_of_navbar_researches WHERE publication_category=$1 AND status=$2 AND id_user=$3 GROUP BY publication_category,format,target_id ORDER BY max("createdAt") DESC LIMIT 10', [category,status,id_user], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

        
       
     });
  
  
     
    router.post('/get_specific_propositions_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.body.category;
        let text = (req.body.text).toLowerCase()
        let status="clicked";
        if(category=="All"){
            pool.query(" (SELECT publication_category,format,target_id, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  status=$1 AND id_user=$2 AND (Lower(research_string) LIKE '%' || $3 || '%' OR Lower(research_string1) LIKE '%' || $3 || '%') GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT 10)", [status,id_user,text], (error, results) => {
                if (error) {
                   
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else if(category=="Account" ||  category=="Ad" || category=="Comic" || category=="Drawing" || category=="Writing" ){
            pool.query(" (SELECT publication_category,format,target_id, COUNT(*) occurrences FROM list_of_navbar_researches WHERE   publication_category=$1 AND status=$2 AND id_user=$3 AND (Lower(research_string) LIKE '%' || $4 || '%' OR Lower(research_string1) LIKE '%' || $4 || '%') GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT 10)", [category,status,id_user,text], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });



    
    router.post('/get_global_propositions_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.body.category;
        let limit = parseInt(req.body.limit);
        let text=(req.body.text).toLowerCase()
        let status="clicked";

        if(category=="All"){
            pool.query("SELECT table1.publication_category,table1.format,table1.target_id, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  status=$1 AND id_user=$2 AND (Lower(research_string) LIKE '%' || $4 || '%'OR Lower(research_string1) LIKE '%' || $4 || '%' )   GROUP BY publication_category,format,target_id ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id  WHERE  table2.publication_category is null AND table1.status=$1  AND table1.id_user!=$2 AND (Lower(table1.research_string) LIKE '%' || $4 || '%'  OR Lower(table1.research_string1) LIKE '%' || $4 || '%' )  GROUP BY table1.publication_category,table1.format,table1.target_id ORDER BY count(*) DESC LIMIT $3", [status,id_user,limit,text], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else if(category=="Account" ||  category=="Ad" || category=="Comic" || category=="Drawing" || category=="Writing" ){
            pool.query("SELECT table1.publication_category,table1.format,table1.target_id, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND id_user=$3 AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%' )   GROUP BY publication_category,format,target_id ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id  WHERE  table2.publication_category is null AND table1.publication_category=$1 AND table1.status=$2  AND table1.id_user!=$3 AND  (Lower(table1.research_string) LIKE '%' || $5 || '%' OR Lower(table1.research_string1) LIKE '%' || $5 || '%' ) GROUP BY table1.publication_category,table1.format,table1.target_id ORDER BY count(*) DESC LIMIT $4", [category,status,id_user,limit,text], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });


    router.post('/get_global_tags_propositions_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let category = req.body.category;
        let limit = parseInt(req.body.limit);
        let text=(req.body.text).toLowerCase()
        let status="clicked";


        var last_month = new Date();
        last_month.setDate(last_month.getDate() -30);
        if(category=="All"){
            pool.query("SELECT publication_category,format,target_id, COUNT(*) occurrences FROM list_of_navbar_researches WHERE"  + '"createdAt" ::date >= $1' + "AND status=$2 AND publication_category!=$3 AND publication_category!=$4 AND (Lower(firsttag) LIKE '%' || $6 || '%' OR Lower(secondtag) LIKE '%' || $6 || '%'  OR Lower(thirdtag) LIKE '%' || $6 || '%' ) GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT $5", [last_month,status,'Account','Ad',limit,text], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else if(category=="Account" ||  category=="Ad" || category=="Comic" || category=="Drawing" || category=="Writing" ){
            pool.query("SELECT publication_category,format,target_id, COUNT(*) occurrences FROM list_of_navbar_researches WHERE"+  '"createdAt" ::date >= $1' + "AND status=$2 AND publication_category=$3 AND (Lower(firsttag) LIKE '%' || $5 || '%' OR Lower(secondtag) LIKE '%' || $5 || '%' OR Lower(thirdtag) LIKE '%' || $5 || '%') GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT $4", [last_month,status,category,limit,text], (error, results) => {
                if (error) {
                
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });



    //after research

    router.post('/get_number_of_clicked',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category=req.body.publication_category;
        let target_id=req.body.target_id;
        let format=req.body.format;
        const Op = Sequelize.Op;
        list_of_navbar_researches.findAll({
            where:{
                status:"clicked",
                target_id:target_id,
                id_user:{[Op.ne]: id_user},
                publication_category:publication_category,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(ads=>{
            res.status(200).send([{number:ads.length}])
        })

    })

    router.post('/get_number_of_results_for_categories', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let text=(req.body.text).toLowerCase();
        pool.query("SELECT publication_category,max(occurences),count(*) number  from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE '%' || $2 || '%' OR Lower(research_string1) LIKE '%' || $2 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t2 GROUP BY publication_category ORDER BY count(*) DESC,max(occurences) DESC", [status,text], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                if(Object.keys(result).length>0){
                    pool.query("SELECT publication_category,style, firsttag, secondtag, thirdtag,max(occurences),count(*) number  from (SELECT  publication_category,format,target_id,style, firsttag, secondtag, thirdtag,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE '%' || $2 || '%'  OR Lower(research_string1) LIKE '%' || $2 || '%' )  GROUP BY publication_category,style, firsttag, secondtag, thirdtag,format,target_id  ORDER BY count(*) DESC) as t2 GROUP BY publication_category,style, firsttag, secondtag, thirdtag ORDER BY count(*) DESC,max(occurences) DESC ", [status,text], (error, results2) => {
                        if (error) {
                            
                    res.status(500).send([{error:error}]);
                        }
                        else{
                            
                            let result2 = JSON.parse(JSON.stringify(results2.rows));
                            res.status(200).send([{result:result,result2:result2}]);
                        }
                    })
                }
                else{
                    res.status(200).send([{result:null}]);
                }
                
            }
        })
      
    });

    router.post('get_styles_and_tags', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let text=(req.body.text).toLowerCase();
        pool.query("SELECT publication_category, style, firsttag, secondtag, thirdtag, max(occurences) ,count(*) number  from (SELECT  publication_category, format, target_id, style, firsttag, secondtag, thirdtag, research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE '%' || $2 || '%'  OR Lower(research_string1) LIKE '%' || $2 || '%' )  GROUP BY publication_category,format,target_id, style, firsttag, secondtag, thirdtag  ORDER BY count(*) DESC) as t2 GROUP BY publication_category, style, firsttag, secondtag, thirdtag ORDER BY count(*) DESC,max(occurences) DESC ", [status,text], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.post('/get_number_of_results_by_category', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let category =req.body.category;
        let text=(req.body.text).toLowerCase();
       
            pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (Lower(research_string) LIKE '%' || $3 || '%'  OR Lower(research_string1) LIKE '%' || $3 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,text], (error, results) => {
                if (error) {
                    
                        res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })

       
      
    });

    router.post('/get_number_of_results_by_category1', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }

         let status="clicked";
        let first_filter = (req.body.first_filter=== "Poésie") ? "Poetry": (req.body.first_filter === "Scénario") ? "Scenario" : (req.body.first_filter === "Roman illustré") ? "Illustrated novel" : req.body.first_filter;
        let category =req.body.category;
        let text=(req.body.text).toLowerCase();
        pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 AND (Lower(research_string) LIKE '%' || $4 || '%' OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,first_filter,text], (error, results) => {
            if (error) {
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.post('/get_number_of_results_by_category2', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let second_filter =req.body.second_filter;
        let category =req.body.category;
        let text=(req.body.text).toLowerCase();
        let type_of_target=req.body.type_of_target;
        if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3) AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE ''%' || $4 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND (Lower(research_string) LIKE '%' || $3 || '%'  OR Lower(research_string1) LIKE '%' || $3 || '%' )  GROUP BY publication_category,format,target_id ) as t1", [category,status,text], (error, results) => {
                    if (error) {
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND (Lower(research_string) LIKE '%' || $3 || '%'  OR Lower(research_string1) LIKE '%' || $3 || '%' )  GROUP BY publication_category,format,target_id ) as t1", [category,status,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND (Lower(research_string) LIKE '%' || $3 || '%' ' OR Lower(research_string1) LIKE '%' || $3 || '%' )  GROUP BY publication_category,format,target_id) as t1", [category,status,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND (Lower(research_string) LIKE '%' || $3 || '%'  OR Lower(research_string1) LIKE '%' || $3 || '%' )  GROUP BY publication_category,format,target_id) as t1", [category,status,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
                
        }
        else{
            pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,text], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

        
      
    });

    router.post('/get_number_of_results_by_category3', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let first_filter = (req.body.first_filter=== "Poésie") ? "Poetry": (req.body.first_filter === "Scénario") ? "Scenario" : (req.body.first_filter === "Roman illustré") ? "Illustrated novel" : req.body.first_filter;
        let second_filter =req.body.second_filter;
        let category =req.body.category;
        let text=(req.body.text).toLowerCase();
        let type_of_target=req.body.type_of_target;
        if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND style=$4 AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$3 ) AND style=$4 AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND style=$3 AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id) as t1 ", [category,status,first_filter,text], (error, results) => {
                    if (error) {
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$3  AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id ) as t1", [category,status,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$3  AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id) as t1", [category,status,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT count(*) number_of_results from ( SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$3  AND (Lower(research_string) LIKE '%' || $4 || '%'  OR Lower(research_string1) LIKE '%' || $4 || '%' )  GROUP BY publication_category,format,target_id) as t1", [category,status,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
                
        }
        else{
            pool.query("SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4 AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1", [category,status,second_filter,first_filter,text], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

       
      
    });



    router.post('/get_propositions_after_research_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let limit = parseInt(req.body.limit);
        let offset = parseInt(req.body.offset);
        let category = req.body.category;
        let text=(req.body.text).toLowerCase();

        pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,text], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.post('/get_propositions_after_research_navbar1', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let limit = parseInt(req.body.limit);
        let offset = parseInt(req.body.offset);
        let category = req.body.category;
        let first_filter = (req.body.first_filter=== "Poésie") ? "Poetry": (req.body.first_filter === "Scénario") ? "Scenario" : (req.body.first_filter === "Roman illustré") ? "Illustrated novel" : req.body.first_filter;
        let text=(req.body.text).toLowerCase();
        pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,first_filter,text], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.post('/get_propositions_after_research_navbar2', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let limit = parseInt(req.body.limit);
        let offset = parseInt(req.body.offset);
        let category = req.body.category;
        let second_filter = req.body.second_filter;
        let text=(req.body.text).toLowerCase();
        let type_of_target=req.body.type_of_target;

        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND (Lower(research_string) LIKE '%' || $5 || '%'  OR Lower(research_string1) LIKE '%' || $5 || '%')  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND (Lower(research_string) LIKE '%' || $5 || '%' OR Lower(research_string1) LIKE ''%' || $5 || '%')  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND (Lower(research_string) LIKE '%' || $5 || '%' OR Lower(research_string1) LIKE '%' || $5 || '%')  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND (Lower(research_string) LIKE '%' || $5 || '%' OR Lower(research_string1) LIKE '%' || $5 || '%')  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5) AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
           
        }
        else{
            pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,text], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

       
      
    });

    router.post('/get_propositions_after_research_navbar3', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let limit = parseInt(req.body.limit);
        let offset = parseInt(req.body.offset);
        let category = req.body.category;
        let first_filter = (req.body.first_filter=== "Poésie") ? "Poetry": (req.body.first_filter === "Scénario") ? "Scenario" : (req.body.first_filter === "Roman illustré") ? "Illustrated novel" : req.body.first_filter;
        let second_filter = req.body.second_filter;
        let text=(req.body.text).toLowerCase();
        let type_of_target=req.body.type_of_target;
        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$5 AND (Lower(research_string) LIKE '%' || $6 || '%'  OR Lower(research_string1) LIKE '%' || $6 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND style=$6 AND (Lower(research_string) LIKE '%' || $7 || '%'  OR Lower(research_string1) LIKE '%' || $7 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$5) AND style=$6 AND (Lower(research_string) LIKE '%' || $7 || '%'  OR Lower(research_string1) LIKE '%' || $7 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,first_filter,text], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else{
            pool.query("SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6 AND (Lower(research_string) LIKE '%' || $7 || '%'  OR Lower(research_string1) LIKE '%' || $7 || '%' )  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4", [category,status,limit,offset,second_filter,first_filter,text], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

        
      
    });



    
    // research by style and tage

    router.get('/get_number_of_results_by_category_sg/:category/:first_filter', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let category =req.params.category;

        

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND  style=$3  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category_sg1/:category/:first_filter/:second_filter/:type_of_target', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let type_of_target=req.params.type_of_target;
        

        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_comics AND number_of_comics>=number_of_drawings AND number_of_comics>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$3  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND style=$4  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$3) AND style=$4  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else{
            pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        
      
    });

    router.get('/get_propositions_after_research_navbar_sg/:category/:first_filter/:limit/:offset', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;


        pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
            if (error) {
                
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.get('/get_propositions_after_research_navbar_sg1/:category/:first_filter/:second_filter/:limit/:offset/:type_of_target', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter = req.params.second_filter;
        let type_of_target=req.params.type_of_target;
        
        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_writings AND number_of_comics>=number_of_drawings AND number_of_comics>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$5  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND style=$6  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND firsttag=$5  AND style=$6  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            
        }
        else{
            pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6  GROUP BY publication_category,format,target_id  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                if (error) {
                    
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        
      
    });

   
    //add,delete check
    router.post('/add_main_research_to_history', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let research_string = req.body.research_string;
        let research_string1=req.body.research_string1;
        let status = req.body.status;
        let number_of_ads = req.body.number_of_ads;
        let number_of_comics = req.body.number_of_comics;
        let user_status = req.body.user_status;
        
        let number_of_drawings = req.body.number_of_drawings;
        let number_of_writings = req.body.number_of_writings;
        let style = req.body.style;
       
        let firsttag = req.body.firsttag;
        let secondtag = req.body.secondtag;
        let thirdtag = req.body.thirdtag;
        if(status=="clicked" && target_id==id_user && publication_category=="Account"){
            list_of_navbar_researches.findOne({
                where:{
                    id_user:id_user,
                    publication_category:publication_category,
                    format:format,
                    target_id:target_id,
                    research_string:research_string,
                    status:status,
                    }
                }).catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(result=>{
                    if(result){
                        res.status(200).send([result])
                    }
                    else{
                        list_of_navbar_researches.create({
                            "user_status":user_status,
                            "id_user":id_user,
                            "publication_category":publication_category,
                            "format":format,
                            "target_id":target_id,
                            "research_string":research_string,
                            "research_string1":research_string1,
                            "status":status,
                            "number_of_comics":number_of_comics,
                            "number_of_drawings":number_of_drawings,
                            "number_of_writings":number_of_writings,
                            "number_of_ads":number_of_ads,
                            "style":style,
                            "firsttag":firsttag,
                            "secondtag":secondtag,
                            "thirdtag":thirdtag,
                        }).catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(result1=>{
                            res.status(200).send([result1])
                        })
                    }
                   
                } )
        }
        else{
            list_of_navbar_researches.findAll({
                where:{
                    id_user:id_user,
                    publication_category:publication_category,
                    format:format,
                    target_id:target_id,
                    research_string:research_string,
                    status:status,
                },
                order: [
                    ['createdAt', 'DESC']
                  ],
                }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(result=>{
                if(result && result[0]){
                    let now_in_seconds= Math.trunc( new Date().getTime()/1000);
                    let time =(result[0].createdAt).toString();
                    let uploaded_date_in_second = new Date(time).getTime()/1000;
                    if(status!="clicked"){
                        list_of_navbar_researches.create({
                            "user_status":user_status,
                            "id_user":id_user,
                            "publication_category":publication_category,
                            "format":format,
                            "target_id":target_id,
                            "research_string":research_string,
                            "status":status,
                            "number_of_comics":number_of_comics,
                            "number_of_drawings":number_of_drawings,
                            "number_of_writings":number_of_writings,
                            "number_of_ads":number_of_ads,
                            "style":style,
                            "firsttag":firsttag,
                            "secondtag":secondtag,
                            "thirdtag":thirdtag,
                        }).catch(err => {
                            	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(result=>{
                            res.status(200).send([result])
                        } )
                    }
                    else if((now_in_seconds - uploaded_date_in_second)>3600){
                        if(firsttag=='Romantique' || firsttag=='Shojo' || firsttag=='Yuri' || firsttag=='Yaoi' || firsttag=='Josei' 
                            || secondtag=='Romantique' || secondtag=='Shojo' || secondtag=='Yuri' || secondtag=='Yaoi' || secondtag=='Josei' 
                            || thirdtag=='Romantique' || thirdtag=='Shojo' || thirdtag=='Yuri' || thirdtag=='Yaoi' || thirdtag=='Josei'){
                            if(getRandomInt(5)==0){
                                list_of_navbar_researches.create({
                                    "user_status":user_status,
                                    "id_user":id_user,
                                    "publication_category":publication_category,
                                    "format":format,
                                    "target_id":target_id,
                                    "research_string":research_string,
                                    "research_string1":research_string1,
                                    "status":status,
                                    "number_of_comics":number_of_comics,
                                    "number_of_drawings":number_of_drawings,
                                    "number_of_writings":number_of_writings,
                                    "number_of_ads":number_of_ads,
                                    "style":style,
                                    "firsttag":firsttag,
                                    "secondtag":secondtag,
                                    "thirdtag":thirdtag,
                                }).catch(err => {
                                        	
                                        res.status(500).json({msg: "error", details: err});		
                                    }).then(result1=>{
                                        if(publication_category=="Account"){
                                            list_of_navbar_researches.update({
                                                "number_of_comics":number_of_comics,
                                                "number_of_drawings":number_of_drawings,
                                                "number_of_writings":number_of_writings,
                                                "number_of_ads":number_of_ads,
                                            },{
                                                where:{
                                                    publication_category:publication_category,
                                                    format:format,
                                                    target_id:target_id,
                                                    status:status,
                                                },
                                            }).catch(err => {
                                                	
                                                res.status(500).json({msg: "error", details: err});		
                                            }).then(result2=>{
                                                res.status(200).send([result2])
                                            })
                                        }
                                        else{
                                            res.status(200).send([result1])
                                        }
                                        
                                } )
                            }
                            else{
                                if(publication_category=="Account"){
                                    list_of_navbar_researches.update({
                                        "number_of_comics":number_of_comics,
                                        "number_of_drawings":number_of_drawings,
                                        "number_of_writings":number_of_writings,
                                        "number_of_ads":number_of_ads,
                                    },{
                                        where:{
                                            publication_category:publication_category,
                                            format:format,
                                            target_id:target_id,
                                            status:status,
                                        },
                                    }).catch(err => {
                                            res.status(500).json({msg: "error", details: err});		
                                        }).then(result2=>{
                                            res.status(200).send([result2])
                                        })
                                }
                                else{
                                    res.status(200).send([result])
                                }
                                
                            }
                             
                        }
                        else if(firsttag=='Caricatural' || firsttag=='Religion' 
                            || secondtag=='Caricatural' || secondtag=='Religion' 
                            || thirdtag=='Caricatural' || thirdtag=='Religion' ){
                            if(getRandomInt(20)==0){
                                list_of_navbar_researches.create({
                                    "user_status":user_status,
                                    "id_user":id_user,
                                    "publication_category":publication_category,
                                    "format":format,
                                    "target_id":target_id,
                                    "research_string":research_string,
                                    "research_string1":research_string1,
                                    "status":status,
                                    "number_of_comics":number_of_comics,
                                    "number_of_drawings":number_of_drawings,
                                    "number_of_writings":number_of_writings,
                                    "number_of_ads":number_of_ads,
                                    "style":style,
                                    "firsttag":firsttag,
                                    "secondtag":secondtag,
                                    "thirdtag":thirdtag,
                                }).catch(err => {
                                        	
                                        res.status(500).json({msg: "error", details: err});		
                                }).then(result1=>{
                                    if(publication_category=="Account"){
                                        list_of_navbar_researches.update({
                                            "number_of_comics":number_of_comics,
                                            "number_of_drawings":number_of_drawings,
                                            "number_of_writings":number_of_writings,
                                            "number_of_ads":number_of_ads,
                                        },{
                                            where:{
                                                publication_category:publication_category,
                                                format:format,
                                                target_id:target_id,
                                                status:status,
                                            },
                                        }).catch(err => {
                                            res.status(500).json({msg: "error", details: err});		
                                        }).then(result2=>{
                                            res.status(200).send([result2])
                                        })
                                    }
                                    else{
                                        res.status(200).send([result1])
                                    }
                                    
                                } )
                            }
                            else{
                                if(publication_category=="Account"){
                                    list_of_navbar_researches.update({
                                        "number_of_comics":number_of_comics,
                                        "number_of_drawings":number_of_drawings,
                                        "number_of_writings":number_of_writings,
                                        "number_of_ads":number_of_ads,
                                    },{
                                        where:{
                                            publication_category:publication_category,
                                            format:format,
                                            target_id:target_id,
                                            status:status,
                                        },
                                    }).catch(err => {
                                        res.status(500).json({msg: "error", details: err});		
                                    }).then(result2=>{
                                        res.status(200).send([result2])
                                    })
                                }
                                else{
                                    res.status(200).send([result])
                                }
                                
                            }
                            
                        }
                        else{
                            list_of_navbar_researches.create({
                                "user_status":user_status,
                                "id_user":id_user,
                                "publication_category":publication_category,
                                "format":format,
                                "target_id":target_id,
                                "research_string":research_string,
                                "research_string1":research_string1,
                                "status":status,
                                "number_of_comics":number_of_comics,
                                "number_of_drawings":number_of_drawings,
                                "number_of_writings":number_of_writings,
                                "number_of_ads":number_of_ads,
                                "style":style,
                                "firsttag":firsttag,
                                "secondtag":secondtag,
                                "thirdtag":thirdtag,
                            }).catch(err => {
                                	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(result1=>{
                                if(publication_category=="Account"){
                                    list_of_navbar_researches.update({
                                        "number_of_comics":number_of_comics,
                                        "number_of_drawings":number_of_drawings,
                                        "number_of_writings":number_of_writings,
                                        "number_of_ads":number_of_ads,
                                    },{
                                        where:{
                                            publication_category:publication_category,
                                            format:format,
                                            target_id:target_id,
                                            status:status,
                                        },
                                    }).catch(err => {
                                        res.status(500).json({msg: "error", details: err});		
                                    }).then(result2=>{
                                        res.status(200).send([result2])
                                    })
                                }
                                else{
                                    res.status(200).send([result1])
                                }
                                
                            } )
                        }
                        
                    }
                    else{
                        res.status(200).send([{"value":false}])
                    }
                }
                else{
                    list_of_navbar_researches.create({
                        "user_status":user_status,
                        "id_user":id_user,
                        "publication_category":publication_category,
                        "format":format,
                        "target_id":target_id,
                        "research_string":research_string,
                        "research_string1":research_string1,
                        "status":status,
                        "number_of_comics":number_of_comics,
                        "number_of_drawings":number_of_drawings,
                        "number_of_writings":number_of_writings,
                        "number_of_ads":number_of_ads,
                        "style":style,
                        "firsttag":firsttag,
                        "secondtag":secondtag,
                        "thirdtag":thirdtag,
                    }).catch(err => {
                        	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(result=>{
                        if(publication_category=="Account"){
                            list_of_navbar_researches.update({
                                "number_of_comics":number_of_comics,
                                "number_of_drawings":number_of_drawings,
                                "number_of_writings":number_of_writings,
                                "number_of_ads":number_of_ads,
                            },{
                                where:{
                                    publication_category:publication_category,
                                    format:format,
                                    target_id:target_id,
                                    status:status,
                                },
                            }).catch(err => {
                                res.status(500).json({msg: "error", details: err});		
                            }).then(result2=>{
                                res.status(200).send([result])
                            })
                        }
                        else{
                            res.status(200).send([result])
                        }
                        
                    } )
                }
                
            })
           
        }
        
    })

    

    router.post('/delete_research_from_navbar', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let target_id = req.body.target_id;

        list_of_navbar_researches.update({
            "status":"deleted"
            },{
                where:{
                    publication_category:publication_category,
                    format:format,
                    target_id:target_id,
                }
            }
        ).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
            res.status(200).send({deleted:"deleted"})
        })
    })

    router.post('/check_if_research_exists', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let research_string = req.body.research_string;
        let status = req.body.status;
        list_of_navbar_researches.findOne({
            where:{
                id_user:id_user,
                publication_category:publication_category,
                format:format,
                target_id:target_id,
                research_string:research_string,
                status:status,
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            if(result){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
            
        } )
        
    })

    

    router.post('/delete_click_after_ressearch_from_history', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.body.category;
        let format = req.body.format;
        let target_id = req.body.target_id;
        list_of_navbar_researches.destroy({
            where:{
                id_user:id_user,
                publication_category:category,
                format:format,
                target_id:target_id,
                status:"clicked_after_research",
            }
        }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            res.status(200).send([{"delete":"ok"}])
        } )
    });

    router.delete('/delete_publication_from_research/:publication_category/:format/:target_id', function (req, res) {

      if( ! req.headers['authorization'] ) {
        return res.status(401).json({msg: "error"});
      }
      else {
        let val=req.headers['authorization'].replace(/^Bearer\s/, '')
        let user= get_current_user(val)
        if(!user){
          return res.status(401).json({msg: "error"});
        }
      }
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category=req.params.publication_category;
        let format=req.params.format;
        let target_id=parseInt(req.params.target_id);
        list_of_navbar_researches.destroy({
            where:{
                publication_category:publication_category,
                format:format,
                target_id:target_id,
                status:["clicked","clicked_after_research"],
            }
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            let category=publication_category.toLowerCase();
            list_of_contents.update({
                "status":"deleted"
            },{
                where:{
                    publication_category:category,
                    format:format,
                    publication_id:target_id,
                }
            }).catch(err => {
                	
                res.status(500).json({msg: "error", details: err});		
            }).then(result=>{
                res.status(200).send([{"delete":"ok"}])
            } )
        } )
    })


 

    router.post('/get_number_of_clicked_on_ads',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let list_of_ads_ids=req.body.list_of_ads_ids;
        let id_user=req.body.id_user;
        let number_of_views=0;
        let compt=0;
        const Op = Sequelize.Op;
        for(let i=0;i<list_of_ads_ids.length;i++){
            list_of_navbar_researches.findAll({
                where:{
                    status:"clicked",
                    id_user:{[Op.ne]: id_user},
                    target_id:list_of_ads_ids[i],
                    publication_category:'Ad',
                },
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],
                    'id_user',
                    'target_id'
                ],
                }).catch(err => {
                    	
                    res.status(500).json({msg: "error", details: err});		
                }).then(clicks=>{
                number_of_views+=clicks.length;
                compt++;
                if(compt==list_of_ads_ids.length){
                    res.status(200).send([{number_of_views:number_of_views}])
                }
            })
        }
            

    })

    router.post('/get_number_of_viewers_by_ad',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let id_user=req.body.id_user;
        let target_id=req.body.target_id;
        let date_format=req.body.date_format;
        const Op = Sequelize.Op;
 
        if(date_format==0){
            let today=new Date();
            let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<8;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:target_id,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Ad',
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_days++;
                    if(compteur_of_days==8){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                      
                    
                    
                })
                
            }
        
        }

        if(date_format==1){
            let today=new Date();
            let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<30;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:target_id,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Ad',
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_days++;
                    if(compteur_of_days==30){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                      
                    
                    
                })
                
            }
        
        }
     
        if(date_format==2){
            let list_of_views=[]
            let compteur_of_months=0;
            for(let i=0;i<53;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:target_id,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Ad',
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_months++;
                    if(compteur_of_months==53){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                })
                
            }
        
        }

        if(date_format==3){
            var date1 = new Date('08/01/2019');
            var date2 = new Date();
            var difference = date2.getTime() - date1.getTime();
            var days = Math.ceil(difference / (1000 * 3600 * 24));
            var weeks = Math.ceil(days/7) + 1;
            let list_of_views=[]
            let compteur_of_years=0;
            for(let i=0;i<weeks;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:target_id,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Ad',
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_years++;
                    if(compteur_of_years==weeks){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                    
                })
                
            }
        }

    })

    router.post('/get_number_of_viewers_by_profile',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let id_user=req.body.id_user;
        let date_format=req.body.date_format;
        const Op = Sequelize.Op;
        if(date_format==0){
            let today=new Date();
            list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<8;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Account',
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_days++;
                    if(compteur_of_days==8){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                      
                    
                    
                })
                
            }
        
        }

        if(date_format==1){
            let today=new Date();
           let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<30;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Account',
                        [Op.and]:[{createdAt: {[Op.lte]: day_i}},{createdAt: {[Op.gte]: day_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_days++;
                    if(compteur_of_days==30){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                      
                    
                    
                })
                
            }
        
        }
     
        if(date_format==2){
           let list_of_views=[]
            let compteur_of_months=0;
            for(let i=0;i<53;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Account',
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_months++;
                    if(compteur_of_months==53){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                })
                
            }
        
        }

        if(date_format==3){
            var date1 = new Date('08/01/2019');
            var date2 = new Date();
            var difference = date2.getTime() - date1.getTime();
            var days = Math.ceil(difference / (1000 * 3600 * 24));
            var weeks = Math.ceil(days/7) + 1;
           let list_of_views=[]
            let compteur_of_years=0;
            for(let i=0;i<weeks;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        id_user:{[Op.ne]: id_user},
                        publication_category:'Account',
                        [Op.and]:[{createdAt: {[Op.lte]: week_i}},{createdAt: {[Op.gte]: week_i_1}}],
                    },
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(viewers=>{
                    list_of_views[i]=viewers.length;
                    compteur_of_years++;
                    if(compteur_of_years==weeks){
                        res.status(200).send([{list_of_views:list_of_views}])
                    }
                    
                })
                
            }
        
        }

        
            

    })



    
    router.post('/get_last_100_viewers',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let id_user=req.body.id_user;
        const Op = Sequelize.Op;
        let list_of_ids=[id_user]
        let compteur=0;
        let list_of_viewers=[];
        list_of_navbar_researches.findAll({
            where:{
                status:"clicked",
                target_id:id_user,
                id_user:{[Op.notIn]: list_of_ids},
                publication_category:'Account',
            },
            limit:1,
            order: [['createdAt', 'DESC']]
                
                ,
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            if(result.length>0){
                list_of_ids.push(result[0].id_user);
                list_of_users.findOne({
                    where:{
                        id:result[0].id_user,
                    }
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                    if(user){
                        list_of_viewers.push(user);
                    }
                    compteur++;
                    research();
                })
            }
            else{
                res.status(200).send([{list_of_viewers:list_of_viewers}])
            }
           

        })

        function research(){
            if(compteur==100){
                res.status(200).send([{list_of_viewers:list_of_viewers}])
            }
            else{
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        id_user:{[Op.notIn]: list_of_ids},
                        publication_category:'Account',
                    },
                    limit:1,
                    order: [['createdAt', 'DESC']],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
                    if(result.length>0){
                        list_of_ids.push(result[0].id_user);
                        list_of_users.findOne({
                            where:{
                                id:result[0].id_user,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            if(user){
                                list_of_viewers.push(user);
                            }
                            compteur++;
                            research();
                        })
                    }
                    else{
                        res.status(200).send([{list_of_viewers:list_of_viewers}])
                    }
                   
        
                })
            }
        }
        
       
    })



    router.post('/get_last_100_account_viewers',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
          }
        let id_user=req.body.id_user;
        const Op = Sequelize.Op;
        let list_of_ids=[id_user]
        let compteur=0;
        let list_of_viewers=[];
        list_of_navbar_researches.findAll({
            where:{
                status:"clicked",
                user_status:"account",
                target_id:id_user,
                id_user:{[Op.notIn]: list_of_ids},
                publication_category:'Account',
            },
            limit:1,
            order: [['createdAt', 'DESC']]
                
                ,
        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            if(result.length>0){
                list_of_ids.push(result[0].id_user);
                list_of_users.findOne({
                    where:{
                        id:result[0].id_user,
                    }
                }).catch(err => {
				
                    res.status(500).json({msg: "error", details: err});		
                }).then(user=>{
                    if(user){
                        list_of_viewers.push(user);
                    }
                    compteur++;
                    research();
                })
            }
            else{
                res.status(200).send([{list_of_viewers:list_of_viewers}])
            }
           

        })

        function research(){
            if(compteur==100){
                res.status(200).send([{list_of_viewers:list_of_viewers}])
            }
            else{
                list_of_navbar_researches.findAll({
                    where:{
                        status:"clicked",
                        target_id:id_user,
                        user_status:"account",
                        id_user:{[Op.notIn]: list_of_ids},
                        publication_category:'Account',
                    },
                    limit:1,
                    order: [['createdAt', 'DESC']],
                }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
                    if(result.length>0){
                        list_of_ids.push(result[0].id_user);
                        list_of_users.findOne({
                            where:{
                                id:result[0].id_user,
                            }
                        }).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
                            if(user){
                                list_of_viewers.push(user);
                            }
                            compteur++;
                            research();
                        })
                    }
                    else{
                        res.status(200).send([{list_of_viewers:list_of_viewers}])
                    }
                   
        
                })
            }
        }
        
       
    })








    router.get('/get_top_artists/:category',function(req,res){
        if( ! req.headers['authorization'] ) {
            return res.status(401).json({msg: "error"});
          }
          else {
            let val=req.headers['authorization'].replace(/^Bearer\s/, '')
            let user= get_current_user(val)
            if(!user){
              return res.status(401).json({msg: "error"});
            }
        }

        
        let category=req.params.category;
        let text_to_search="'%artist%'";
        let status="clicked";
        let list_of_artists=[];
        let compt=0;

        var last_week = new Date();
        last_week.setDate(last_week.getDate() - 30);
        if(category=="comic"){
            pool.query('SELECT publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND "createdAt" ::date >= $3 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND (Lower(style) LIKE ' + text_to_search +' OR Lower(style) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT 5 ', ["Account",status,last_week], (error, results) => {
                if (error) {
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    if(result && result.length>0){
                        for(let i=0;i<result.length;i++){
                            list_of_users.findOne({
                                where:{
                                    id:result[i].target_id,
                                }
                            }).catch(err => {
                            
                                res.status(500).json({msg: "error", details: err});		
                            }).then(user=>{
                                if(user){
                                    list_of_artists.push(user);
                                }
                                compt++;
                                if(compt==result.length){
                                    end_function();
                                }
                               
                            })
                        }
                    }
                    else{
                        res.status(200).send([list_of_artists]);
                    }
                    
                }
            })
        }
        else if(category=="drawing"){
            pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND "createdAt" ::date >= $3 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND (Lower(style) LIKE ' + text_to_search +' OR Lower(style) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT 5', ["Account",status,last_week], (error, results) => {
                if (error) {
                    
                res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    if(result&& result.length>0){
                        for(let i=0;i<result.length;i++){
                            list_of_users.findOne({
                                where:{
                                    id:result[i].target_id,
                                }
                            }).catch(err => {
                            
                                res.status(500).json({msg: "error", details: err});		
                            }).then(user=>{
                                if(user){
                                    list_of_artists.push(user);
                                }
                                compt++;
                                if(compt==result.length){
                                    end_function();
                                }
                            })
                        }
                    }
                    else{
                        res.status(200).send([list_of_artists]);
                    }
                }
            })
        }
        else if(category=="writing"){
            pool.query('  SELECT  publication_category,format,target_id,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND "createdAt" ::date >= $3 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND (Lower(style) LIKE ' + text_to_search +' OR Lower(style) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id ORDER BY count(*) DESC LIMIT 5', ["Account",status,last_week], (error, results) => {
                if (error) {
                    
                res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    if(result && result.length>0){
                        for(let i=0;i<result.length;i++){
                            list_of_users.findOne({
                                where:{
                                    id:result[i].target_id,
                                }
                            }).catch(err => {
                            
                                res.status(500).json({msg: "error", details: err});		
                            }).then(user=>{
                                if(user){
                                    list_of_artists.push(user);
                                }
                                compt++;
                                if(compt==result.length){
                                    end_function();
                                }
                            })
                        }
                    }
                    else{
                        res.status(200).send([list_of_artists]);
                    }
                }
            })
        }

        function end_function(){
            res.status(200).send([list_of_artists]);
        }
           
    })



    router.post('/update_type_of_account', function (req, res) {

        if( ! req.headers['authorization'] ) {
          return res.status(401).json({msg: "error"});
        }
        else {
          let val=req.headers['authorization'].replace(/^Bearer\s/, '')
          let user= get_current_user(val)
          if(!user){
            return res.status(401).json({msg: "error"});
          }
        }
          let id_user = get_current_user(req.cookies.currentUser);
          let type_of_account=req.body.type_of_account;
          list_of_navbar_researches.update({
              "style":type_of_account,
          },
            {
              where:{
                  publication_category:'Account',
                  target_id:id_user,
              }
          }).catch(err => {
                  
              res.status(500).json({msg: "error", details: err});		
          }).then(result=>{
              if(result){
                res.status(200).send([{"update":"ok"}])
              }
                 
          } )
      })

    
}