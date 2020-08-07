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



module.exports = (router, list_of_navbar_researches,list_of_subscribings, list_of_users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };

    router.get('/get_most_researched_navbar/:category/:status', function (req, res) {
        let category = req.params.category;
        let status1 = req.params.status;
        let status2="clicked_after_research";
        

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

        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND  (status=$2 OR status=$3 )GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_week,status1,status2], (error, results) => {
                if (error) {
                  throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query('SELECT  publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND publication_category=$2 AND (status=$3 OR status=$4 )GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_week,category,status1,status2], (error, results) => {
                if (error) {
                  throw error
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

        if(category=="All"){
            pool.query('SELECT  publication_category,format,target_id,research_string,max("createdAt")  FROM list_of_navbar_researches WHERE status=$1 GROUP BY publication_category,format,target_id,research_string ORDER BY max("createdAt") DESC LIMIT 10', [status], (error, results) => {
                if (error) {
                  throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query('SELECT  publication_category,format,target_id,research_string,max("createdAt")  FROM list_of_navbar_researches WHERE publication_category=$1 AND status=$2 GROUP BY publication_category,format,target_id,research_string ORDER BY max("createdAt") DESC LIMIT 10', [category,status], (error, results) => {
                if (error) {
                  throw error
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
        text_to_search= "'%"+ text + "%'";
        status="clicked";
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
        if(category=="All"){
            pool.query(' (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND status=$2 AND id_user=$3 AND Lower(research_string) LIKE ' + text_to_search +' GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10)', [last_week,status,id_user], (error, results) => {
                if (error) {
                throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query(' (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND publication_category=$2 AND status=$3 AND id_user=$4 AND Lower(research_string) LIKE ' + text_to_search +' GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10)', [last_week,category,status,id_user], (error, results) => {
                if (error) {
                throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });

    /*router.get('/get_main_searchbar_propositions/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let text = (req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";
        status="clicked";

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
        pool.query(' SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND status=$2 AND id_user=$3 AND research_string LIKE ' + text_to_search +' GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT 10', [last_week,status,id_user], (error, results) => {
            if (error) {
                throw error
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });*/

    
    router.get('/get_global_propositions_navbar/:category/:text/:limit', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.params.category;
        let limit = parseInt(req.params.limit);
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";
        status="clicked";
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

        var last_month = new Date();
        last_month.setDate(last_month.getDate() -30);

        if(category=="All"){
            pool.query(' SELECT table1.publication_category,table1.format,table1.target_id,table1.research_string, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  "createdAt"::date >= $1 AND status=$2 AND id_user=$3 AND Lower(research_string) LIKE ' + text_to_search +'   GROUP BY publication_category,format,target_id,research_string ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id AND table1.research_string=table2.research_string WHERE  table2.publication_category is null AND  table1."createdAt"::date >= $1 AND table1.status=$2  AND table1.id_user!=$3 AND Lower(table1.research_string) LIKE ' + text_to_search +'  GROUP BY table1.publication_category,table1.format,table1.target_id,table1.research_string ORDER BY count(*) DESC LIMIT $4', [last_month,status,id_user,limit], (error, results) => {
                if (error) {
                throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query(' SELECT table1.publication_category,table1.format,table1.target_id,table1.research_string, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE  publication_category=$2 AND "createdAt"::date >= $1 AND status=$3 AND id_user=$4 AND Lower(research_string) LIKE ' + text_to_search +'   GROUP BY publication_category,format,target_id,research_string ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id AND table1.research_string=table2.research_string WHERE  table2.publication_category is null AND  table1."createdAt"::date >= $1 AND table1.publication_category=$2 AND table1.status=$3  AND table1.id_user!=$4 AND Lower(table1.research_string) LIKE ' + text_to_search +'  GROUP BY table1.publication_category,table1.format,table1.target_id,table1.research_string ORDER BY count(*) DESC LIMIT $5', [last_month,category,status,id_user,limit], (error, results) => {
                if (error) {
                throw error
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
        text_to_search= "'%"+ text + "%'";
        status="clicked";
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

        var last_month = new Date();
        last_month.setDate(last_month.getDate() -30);

        if(category=="All"){
            pool.query('SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences FROM list_of_navbar_researches WHERE  "createdAt" ::date >= $1 AND status=$2 AND publication_category!=$3 AND publication_category!=$4 AND (Lower(firsttag) LIKE ' + text_to_search +' OR Lower(secondtag) LIKE ' + text_to_search +' OR Lower(thirdtag) LIKE ' + text_to_search +') GROUP BY publication_category,format,target_id,research_string ORDER BY count(*) DESC LIMIT $5', [last_month,status,'Artist','Ad',limit], (error, results) => {
                if (error) {
                throw error
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
                throw error
                }
                else{
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
       
      
    });

    /*router.get('/get_most_researched_main_propositions_gen/:text/:limit', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        var last_month = new Date();
        last_month.setDate(last_month.getDate() -30);
        pool.query('  SELECT table1.publication_category,table1.format,table1.target_id,table1.research_string, COUNT(*) occurrences FROM list_of_navbar_researches as table1 LEFT OUTER JOIN (SELECT publication_category,format,target_id,research_string, COUNT(*) occurrences  FROM list_of_navbar_researches WHERE "createdAt"::date >= $1 AND status=$2 AND id_user=$3 AND research_string LIKE ' + text_to_search +'   GROUP BY publication_category,format,target_id,research_string ) as table2 ON table1.format=table2.format  AND table1.target_id=table2.target_id AND table1.research_string=table2.research_string WHERE table2.publication_category is null AND  table1."createdAt"::date >= $1 AND table1.status=$2 AND table1.id_user!=$3 AND table1.research_string LIKE ' + text_to_search +'  GROUP BY table1.publication_category,table1.format,table1.target_id,table1.research_string ORDER BY count(*) DESC LIMIT $4', [last_month,status,id_user,limit], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });*/


    /*router.get('/get_main_searchbar_ideas/:category/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let category = req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        if(category=="All"){
            pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  research_string LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT 10', [], (error, results) => {
                if (error) {
                    throw error
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        else{
            pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND  research_string LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT 10', [category], (error, results) => {
                if (error) {
                    throw error
                }
                else{
                    
                    let result = JSON.parse(JSON.stringify(results.rows));
                    res.status(200).send([result]);
                }
            })
        }
        
      
    });*/

    //after research

    router.get('/get_number_of_results_for_categories/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query(' SELECT publication_category,max(occurences),count(*) number  from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  status=$1 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t2 GROUP BY publication_category ORDER BY count(*) DESC,max(occurences) DESC ', [status], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category/:category/:text', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category1/:category/:text/:first_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$3 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category2/:category/:text/:second_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category3/:category/:text/:first_filter/:second_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter =req.params.second_filter;
        let category =req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });



    router.get('/get_propositions_after_research_navbar/:category/:text/:limit/:offset', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_propositions_after_research_navbar1/:category/:text/:limit/:offset/:first_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.get('/get_propositions_after_research_navbar2/:category/:text/:limit/:offset/:second_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let second_filter = req.params.second_filter;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_propositions_after_research_navbar3/:category/:text/:limit/:offset/:first_filter/:second_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter = req.params.second_filter;
        let text=(req.params.text).toLowerCase();
        text_to_search= "'%"+ text + "%'";

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6 AND Lower(research_string) LIKE ' + text_to_search +'  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });



    
    // research by style and tage

    router.get('/get_number_of_results_by_category_sg/:category/:first_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let category =req.params.category;

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND  style=$3  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_number_of_results_by_category_sg1/:category/:first_filter/:second_filter', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter =req.params.second_filter;
        let category =req.params.category;

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

        pool.query(' SELECT count(*) number_of_results from (SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$3 OR secondtag=$3 OR thirdtag=$3) AND style=$4  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC) as t1', [category,status,second_filter,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

    router.get('/get_propositions_after_research_navbar_sg/:category/:first_filter/:limit/:offset', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND style=$5 GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });


    router.get('/get_propositions_after_research_navbar_sg1/:category/:first_filter/:second_filter/:limit/:offset', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        status="clicked";
        let limit = parseInt(req.params.limit);
        let offset = parseInt(req.params.offset);
        let category = req.params.category;
        let first_filter = (req.params.first_filter=== "Poésie") ? "Poetry": (req.params.first_filter === "Scénario") ? "Scenario" : (req.params.first_filter === "Roman illustré") ? "Illustrated novel" : req.params.first_filter;
        let second_filter = req.params.second_filter;

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

        pool.query('  SELECT  publication_category,format,target_id,research_string,count(*) occurences  FROM list_of_navbar_researches WHERE  publication_category=$1 AND status=$2 AND (firsttag=$5 OR secondtag=$5 OR thirdtag=$5) AND style=$6  GROUP BY publication_category,format,target_id,research_string  ORDER BY count(*) DESC LIMIT $3 OFFSET $4', [category,status,limit,offset,second_filter,first_filter], (error, results) => {
            if (error) {
                throw error
            }
            else{
                
                let result = JSON.parse(JSON.stringify(results.rows));
                res.status(200).send([result]);
            }
        })
      
    });

   
    //add,delete check
    router.post('/add_main_research_to_history', function (req, res) {
        let id_user = get_current_user(req.cookies.currentUser);
        let publication_category = req.body.publication_category;
        let format = req.body.format;
        let target_id = req.body.target_id;
        let research_string = req.body.research_string;
        let status = req.body.status;
        let number_of_comics = req.body.number_of_comics;
        
        let numbar_of_drawings = req.body.numbar_of_drawings;
        let number_of_writings = req.body.number_of_writings;
        let style = req.body.style;
        console.log("stylestyle");
        console.log(style)
        let firsttag = req.body.firsttag;
        let secondtag = req.body.secondtag;
        let thirdtag = req.body.thirdtag;

        if(status=="clicked" && target_id==id_user && publication_category=="Artist"){
            list_of_navbar_researches.findOne({
                where:{
                    id_user:id_user,
                    publication_category:publication_category,
                    format:format,
                    target_id:target_id,
                    research_string:research_string,
                    status:status,
                    }
                }).then(result=>{
                    if(result){
                        res.status(200).send([result])
                    }
                    else{
                        list_of_navbar_researches.create({
                            "id_user":id_user,
                            "publication_category":publication_category,
                            "format":format,
                            "target_id":target_id,
                            "research_string":research_string,
                            "status":status,
                            "number_of_comics":number_of_comics,
                            "numbar_of_drawings":numbar_of_drawings,
                            "number_of_writings":number_of_writings,
                            "style":style,
                            "firsttag":firsttag,
                            "secondtag":secondtag,
                            "thirdtag":thirdtag,
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
            }).then(result=>{
                if(result[0]){
                    let now_in_seconds= Math.trunc( new Date().getTime()/1000);
                    let time =(result[0].createdAt).toString();
                    let uploaded_date_in_second = new Date(time).getTime()/1000;
                    if(status!="clicked"){
                        list_of_navbar_researches.create({
                            "id_user":id_user,
                            "publication_category":publication_category,
                            "format":format,
                            "target_id":target_id,
                            "research_string":research_string,
                            "status":status,
                            "number_of_comics":number_of_comics,
                            "numbar_of_drawings":numbar_of_drawings,
                            "number_of_writings":number_of_writings,
                            "style":style,
                            "firsttag":firsttag,
                            "secondtag":secondtag,
                            "thirdtag":thirdtag,
                        }).then(result=>{
                            console.log("send let result 1")
                            res.status(200).send([result])
                        } )
                    }
                    else if((now_in_seconds - uploaded_date_in_second)>360){
                        list_of_navbar_researches.create({
                            "id_user":id_user,
                            "publication_category":publication_category,
                            "format":format,
                            "target_id":target_id,
                            "research_string":research_string,
                            "status":status,
                            "number_of_comics":number_of_comics,
                            "numbar_of_drawings":numbar_of_drawings,
                            "number_of_writings":number_of_writings,
                            "style":style,
                            "firsttag":firsttag,
                            "secondtag":secondtag,
                            "thirdtag":thirdtag,
                        }).then(result1=>{
                            for(let i=0;i<result.length;i++){
                                result[i].update({
                                    "id_user":id_user,
                                    "publication_category":publication_category,
                                    "format":format,
                                    "target_id":target_id,
                                    "research_string":research_string,
                                    "status":status,
                                    "number_of_comics":number_of_comics,
                                    "numbar_of_drawings":numbar_of_drawings,
                                    "number_of_writings":number_of_writings,
                                    "style":style,
                                    "firsttag":firsttag,
                                    "secondtag":secondtag,
                                    "thirdtag":thirdtag,
                                }).then(result2=>{
                                    if(i==result.length-1){
                                        console.log("send let result 2")
                                        res.status(200).send([result1])
                                    }
                                })
                            }
                           
                           
                        } )
                    }
                    else{
                        console.log("send let result 3")
                        res.status(200).send([{"value":false}])
                    }
                }
                else{
                    list_of_navbar_researches.create({
                        "id_user":id_user,
                        "publication_category":publication_category,
                        "format":format,
                        "target_id":target_id,
                        "research_string":research_string,
                        "status":status,
                        "number_of_comics":number_of_comics,
                        "numbar_of_drawings":numbar_of_drawings,
                        "number_of_writings":number_of_writings,
                        "style":style,
                        "firsttag":firsttag,
                        "secondtag":secondtag,
                        "thirdtag":thirdtag,
                    }).then(result=>{
                        console.log("send let result 4")
                        res.status(200).send([result])
                    } )
                }
                
            })
           
        }
        
    })

    router.post('/check_if_research_exists', function (req, res) {
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
        }).then(result=>{
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
                id_user:id_user,
                publication_category:publication_category,
                format:format,
                target_id:target_id,
                status:["clicked","clicked_after_research"],
            }
        }).then(result=>{
            res.status(200).send([{"delete":"ok"}])
        } )
    })
    
}