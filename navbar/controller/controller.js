const multer = require('multer');
const Sequelize = require('sequelize');
const fs = require('fs');
var glob = require("glob")
var path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Pool = require('pg').Pool;
const pool = new Pool({
    port: 5432,
    database: 'linkarts',
    user: 'postgres',
    password: 'test',
    host: 'localhost',
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
        let category = req.params.category;
        let status1 = req.params.status;
        let status2="clicked_after_research";
        



        var last_month = new Date();
        last_month.setDate(last_month.getDate() - 30);

        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND  (status=$2 OR status=$3 )GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_month,status1,status2], (error, results) => {
                if (error) {
                  console.log(error)
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
                  console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        
       
     });

    

    router.get('/get_last_researched_navbar/:category', function (req, res) {
        let category = req.params.category;
        let status="clicked_after_research"
        let id_user = get_current_user(req.cookies.currentUser);
        //console.log("get_last_researched_navbar")
        //console.log(id_user)


        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,research_string,max("createdAt")  FROM list_of_navbar_researches WHERE status=$1 AND id_user=$2 GROUP BY publication_category,format,target_id,research_string ORDER BY max("createdAt") DESC LIMIT 10', [status,id_user], (error, results) => {
                if (error) {
                  console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query('SELECT  publication_category,format,target_id,research_string,max("createdAt")  FROM list_of_navbar_researches WHERE publication_category=$1 AND status=$2 AND id_user=$3 GROUP BY publication_category,format,target_id,research_string ORDER BY max("createdAt") DESC LIMIT 10', [category,status,id_user], (error, results) => {
                if (error) {
                  console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

        
       
     });
  
  
     
    router.get('/get_specific_propositions_navbar/:category/:text', function (req, res) {
       
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.params.category;
        let text = (req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        let status="clicked";
        console.log(category)
        console.log(text_to_search)
        
        if(category=="All"){
            pool.query(' (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  status=$1 AND id_user=$2 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +') GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10)', [status,id_user], (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query(' (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE   publication_category=$1 AND status=$2 AND id_user=$3 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +') GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10)', [category,status,id_user], (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });



    
    router.get('/get_global_propositions_navbar/:category/:text/:limit', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.params.category;
        let limit = parseInt(req.params.limit);
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        let status="clicked";




        if(category=="All"){
            pool.query(' SELECT table1.publication_category,table1.format,table1.target_id,table1.research_string, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  status=$1 AND id_user=$2 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')   GROUP BY publication_category,format,target_id,research_string ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id AND table1.research_string=table2.research_string WHERE  table2.publication_category is null AND table1.status=$1  AND table1.id_user!=$2 AND Lower(table1.research_string) LIKE ' + text_to_search +'  GROUP BY table1.publication_category,table1.format,table1.target_id,table1.research_string ORDER BY count(*) DESC LIMIT $3', [status,id_user,limit], (error, results) => {
                if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query(' SELECT table1.publication_category,table1.format,table1.target_id,table1.research_string, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND id_user=$3 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')   GROUP BY publication_category,format,target_id,research_string ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id AND table1.research_string=table2.research_string WHERE  table2.publication_category is null AND table1.publication_category=$1 AND table1.status=$2  AND table1.id_user!=$3 AND Lower(table1.research_string) LIKE ' + text_to_search +'  GROUP BY table1.publication_category,table1.format,table1.target_id,table1.research_string ORDER BY count(*) DESC LIMIT $4', [category,status,id_user,limit], (error, results) => {
                if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });


    router.get('/get_global_tags_propositions_navbar/:category/:text/:limit', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.params.category;
        let limit = req.params.limit;
        let text=(req.params.text).toLowerCase()
        let text_to_search= "'%"+ text + "%'";
        let status="clicked";


        var last_month = new Date();
        last_month.setDate(last_month.getDate() -30);

        if(category=="All"){
            pool.query('SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND status=$2 AND publication_category!=$3 AND publication_category!=$4 AND (Lower(firsttag) LIKE ' + text_to_search +' OR Lower(secondtag) LIKE ' + text_to_search +' OR Lower(thirdtag) LIKE ' + text_to_search +') GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT $5', [last_month,status,'Account','Ad',limit], (error, results) => {
                if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query(' SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND status=$2 AND publication_category=$3 AND (Lower(firsttag) LIKE ' + text_to_search +' OR Lower(secondtag) LIKE ' + text_to_search +' OR Lower(thirdtag) LIKE ' + text_to_search +') GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT $4', [last_month,status,category,limit], (error, results) => {
                if (error) {
                console.log(error)
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
                format:format,
            }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(ads=>{
            res.status(200).send([{number:ads.length}])
        })

    })

    router.get('/get_number_of_results_for_categories/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";

       
        console.log("get_number_of_results_for_categories")
        pool.query(' SELECT publication_category,max(occurences),count(*) number  from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t2 GROUP BY publication_category ORDER BY count(*) DESC,max(occurences) DESC ', [status], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                if(Object.keys(result).length>0){
                    pool.query(' SELECT publication_category,style, firsttag, secondtag, thirdtag,max(occurences),count(*) number  from (SELECT  publication_category,format,target_id,research_string,style, firsttag, secondtag, thirdtag,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,style, firsttag, secondtag, thirdtag,format,target_id,research_string  ORDER BY count(*) DESC) as t2 GROUP BY publication_category,style, firsttag, secondtag, thirdtag ORDER BY count(*) DESC,max(occurences) DESC ', [status], (error, results2) => {
                        if (error) {
                            console.log(error)
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

    router.get('get_styles_and_tags/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        console.log("get_styles_and_tags")
        console.log("get_styles_and_tags")
        console.log("get_styles_and_tags")
        pool.query(' SELECT publication_category, style, firsttag, secondtag, thirdtag, max(occurences) ,count(*) number  from (SELECT  publication_category, format, target_id, style, firsttag, secondtag, thirdtag, research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string, style, firsttag, secondtag, thirdtag  ORDER BY count(*) DESC) as t2 GROUP BY publication_category, style, firsttag, secondtag, thirdtag ORDER BY count(*) DESC,max(occurences) DESC ', [status], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category/:category/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category1/:category/:text/:first_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        console.log("get_number_of_results_by_category1")
        console.log(first_filter)

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category2/:category/:text/:second_filter/:type_of_target', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        console.log("get_number_of_results_by_category2")
        console.log(category)
        let type_of_target=req.params.type_of_target;
        if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter], (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

        
      
    });

    router.get('/get_number_of_results_by_category3/:category/:text/:first_filter/:second_filter/:type_of_target', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        console.log("get_number_of_results_by_category3")
        console.log(category)
        console.log(first_filter)

        let type_of_target=req.params.type_of_target;
        if(category=="Ad"){
            if(type_of_target=="Cible"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND style=$4 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$3 ) AND style=$4 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

       
      
    });



    router.get('/get_propositions_after_research_navbar/:category/:text/:limit/:offset', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";

        

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_propositions_after_research_navbar1/:category/:text/:limit/:offset/:first_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";

        console.log("get_propositions_after_research_navbar1")
        console.log(first_filter)
        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.get('/get_propositions_after_research_navbar2/:category/:text/:limit/:offset/:second_filter/:type_of_target', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let second_filter = req.params.second_filter;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        let type_of_target=req.params.type_of_target;

        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
                    if (error) {
                        console.log(error)
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
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter], (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send([{error:error}]);
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }

       
      
    });

    router.get('/get_propositions_after_research_navbar3/:category/:text/:limit/:offset/:first_filter/:second_filter/:type_of_target', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter = req.params.second_filter;
        let text=(req.params.text).toLowerCase();
        let text_to_search= "'%"+ text + "%'";
        let type_of_target=req.params.type_of_target;

        console.log("get_propositions_after_research_navbar3")
        console.log(first_filter)

        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_drawings AND number_of_comics>=number_of_writings AND number_of_comics>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$5 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$5 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND style=$6 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$5) AND style=$6 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6 AND (Lower(research_string) LIKE ' + text_to_search +' OR Lower(research_string1) LIKE ' + text_to_search +')  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                if (error) {
                    console.log(error)
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
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let category =req.params.category;

        

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND  style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category_sg1/:category/:first_filter/:second_filter/:type_of_target', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let type_of_target=req.params.type_of_target;
        

        if(category=="Account"){
            if(second_filter=="Bandes dessinées"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_comics AND number_of_comics>=number_of_drawings AND number_of_comics>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$3 OR thirdtag=$3) AND style=$4  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firttag=$3) AND style=$4  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
                if (error) {
                    console.log(error)
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
        let id_user = get_current_user(req.cookies.currentUser);
        let status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;


        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
            if (error) {
                console.log(error)
                    res.status(500).send([{error:error}]);
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.get('/get_propositions_after_research_navbar_sg1/:category/:first_filter/:second_filter/:limit/:offset/:type_of_target', function (req, res) {
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
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_comics>=number_of_writings AND number_of_comics>=number_of_drawings AND number_of_comics>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Dessins"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_drawings>=number_of_comics AND number_of_drawings>=number_of_writings AND number_of_drawings>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else if(second_filter=="Ecrits"){
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_writings>=number_of_comics AND number_of_writings>=number_of_drawings AND number_of_writings>=number_of_ads) AND style=$5  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (number_of_ads>=number_of_comics AND number_of_ads>=number_of_drawings AND number_of_ads>=number_of_writings) AND style=$5  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (secondtag=$5 OR thirdtag=$5) AND style=$6  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
                    res.status(500).send([{error:error}]);
                    }
                    else{
                        
                        let result = JSON.parse(JSON.stringify(results.rows));
                        res.status(200).send([result]);
                    }
                })
            }
            else{
                pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND firsttag=$5  AND style=$6  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                    if (error) {
                        console.log(error)
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
            pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
                if (error) {
                    console.log(error)
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
        
        console.log("add_main_research_to_history");


        if(status=="clicked" && target_id==id_user && publication_category=="Account"){
            //console.log("user connecting to its account")
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
                        //console.log(err);	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(result=>{
                    //console.log("result found")
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
                            //console.log(err);	
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
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(result=>{
                if(result && result[0]){
                    console.log(" result found")
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
                            //console.log(err);	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(result=>{
                            //console.log("send let result 1")
                            res.status(200).send([result])
                        } )
                    }
                    else if((now_in_seconds - uploaded_date_in_second)>3600){
                        console.log("ready to add")
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
                                        //console.log(err);	
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
                                                //console.log(err);	
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
                                        //console.log(err);	
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
                            console.log("in else add");
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
                                console.log(err);	
                                res.status(500).json({msg: "error", details: err});		
                            }).then(result1=>{
                                console.log("put res1")
                                if(publication_category=="Account"){
                                    console.log("in res 1")
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
                        //console.log("send let result 3")
                        res.status(200).send([{"value":false}])
                    }
                }
                else{
                    console.log( "in last else navbar")
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
                        //console.log(err);	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(result=>{
                        //console.log("send let result 4")
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(m=>{
            res.status(200).send({deleted:"deleted"})
        })
    })

    router.post('/check_if_research_exists', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let research_string = req.body.research_string;
        let status = req.body.status;
        console.log("check_if_research_exists")
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
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
        //console.log("result check_if_research_exists ");
            console.log(result)
            if(result){
                res.status(200).send([{"value":true}])
            }
            else{
                res.status(200).send([{"value":false}])
            }
            
        } )
        
    })

    

    router.delete('/delete_click_after_ressearch_from_history/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let text = (req.params.text).toLowerCase();
        list_of_navbar_researches.destroy({
            where:{
                id_user:id_user,
                research_string:text,
                status:"clicked_after_research",
            }
        }).catch(err => {
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            res.status(200).send([{"delete":"ok"}])
        } )
    });

    router.delete('/delete_publication_from_research/:publication_category/:format/:target_id', function (req, res) {
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            let category=delete_publication_from_research.toLowerCase();
            list_of_contents.update({
                "status":"deleted"
            },{
                where:{
                    publication_category:category,
                    format:format,
                    publication_id:target_id,
                }
            }).catch(err => {
                //console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(result=>{
                res.status(200).send([{"delete":"ok"}])
            } )
        } )
    })


 

    router.post('/get_number_of_clicked_on_ads',function(req,res){
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
                    [Sequelize.fn('DISTINCT', Sequelize.col('id_user'),Sequelize.col('target_id')), 'users'],'id_user','target_id'],
            }).catch(err => {
			//console.log(err);	
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
        //console.log("get_number_of_viewers_by_ad")
        let id_user=req.body.id_user;
        let target_id=req.body.target_id;
        let date_format=req.body.date_format;
        const Op = Sequelize.Op;
 
        if(date_format==0){
            let today=new Date();
            //console.log("day_compteur ")
            let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<8;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                //console.log(day_i)
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
			//console.log(err);	
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
            //console.log("day_compteur ")
            let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<30;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                //console.log(day_i)
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
			//console.log(err);	
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
            //console.log("week_compteur last year ")
            let list_of_views=[]
            let compteur_of_months=0;
            for(let i=0;i<53;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                //console.log(week_i)
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
			//console.log(err);	
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
            //console.log("depuis toujours")
            var date1 = new Date('08/01/2019');
            var date2 = new Date();
            var difference = date2.getTime() - date1.getTime();
            var days = Math.ceil(difference / (1000 * 3600 * 24));
            var weeks = Math.ceil(days/7) + 1;
            //console.log(weeks)
            //let today=new Date();
            //let years_compteur = today.getFullYear() - 2019;
            let list_of_views=[]
            let compteur_of_years=0;
            for(let i=0;i<weeks;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                //console.log(week_i)
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
			//console.log(err);	
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
        //console.log("get_number_of_viewers_by_profile")
        let id_user=req.body.id_user;
        let date_format=req.body.date_format;
        const Op = Sequelize.Op;
 
        if(date_format==0){
            let today=new Date();
            //console.log("day_compteur ")
            list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<8;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                //console.log(day_i)
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
			//console.log(err);	
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
            //console.log("day_compteur ")
           let list_of_views=[]
            let compteur_of_days=0;
            for(let i=0;i<30;i++){
                let day_i=new Date();
                day_i.setDate(day_i.getDate() - i);
                let day_i_1=new Date();
                day_i_1.setDate(today.getDate() - (i+1));
                //console.log(day_i)
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
			//console.log(err);	
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
            //console.log("week_compteur last year ")
           let list_of_views=[]
            let compteur_of_months=0;
            for(let i=0;i<53;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                //console.log(week_i)
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
			//console.log(err);	
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
            //console.log("depuis toujours")
            var date1 = new Date('08/01/2019');
            var date2 = new Date();
            var difference = date2.getTime() - date1.getTime();
            var days = Math.ceil(difference / (1000 * 3600 * 24));
            var weeks = Math.ceil(days/7) + 1;
            //console.log(weeks)
            //let today=new Date();
            //let years_compteur = today.getFullYear() - 2019;
           let list_of_views=[]
            let compteur_of_years=0;
            for(let i=0;i<weeks;i++){
                let week_i=new Date();
                week_i.setDate(week_i.getDate() - 7*i);
                let week_i_1=new Date();
                week_i_1.setDate(week_i_1.getDate() - 7*(i+1));
                //console.log(week_i)
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
			//console.log(err);	
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
        //console.log("get_last_100_viewers")
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            if(result.length>0){
                list_of_ids.push(result[0].id_user);
                list_of_users.findOne({
                    where:{
                        id:result[0].id_user,
                    }
                }).catch(err => {
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
                    if(result.length>0){
                        list_of_ids.push(result[0].id_user);
                        list_of_users.findOne({
                            where:{
                                id:result[0].id_user,
                            }
                        }).catch(err => {
			//console.log(err);	
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
        //console.log("get_last_100_account_viewers")
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
            if(result.length>0){
                //console.log(result.length)
                list_of_ids.push(result[0].id_user);
                list_of_users.findOne({
                    where:{
                        id:result[0].id_user,
                    }
                }).catch(err => {
			//console.log(err);	
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
			//console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(result=>{
                    if(result.length>0){
                        list_of_ids.push(result[0].id_user);
                        list_of_users.findOne({
                            where:{
                                id:result[0].id_user,
                            }
                        }).catch(err => {
			//console.log(err);	
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
}