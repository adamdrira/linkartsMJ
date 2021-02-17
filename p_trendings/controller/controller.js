const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');





module.exports = (router, trendings_comics,trendings_drawings,trendings_writings,trendings_contents) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    
    router.post('/check_if_user_has_trendings', function (req, res) {
console.log("checking current: " + req.headers['authorization'] );
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
        const Op = Sequelize.Op;
        const  id_user = req.body.id_user;
        trendings_contents.findAll({
            where:{
                id_user:id_user,
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(tren=>{
            if(tren.length>0){
                    trendings_contents.findAll({
                        where:{
                            id_user:id_user,
                            publication_category:"comic",
                        }
                        ,order: [
                            ['createdAt', 'DESC']
                        ]
                    }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(comics=>{
                        let list_of_comics=comics
                        trendings_contents.findAll({
                            where:{
                                id_user:id_user,
                                publication_category:"drawing",
                            }
                            ,order: [
                                ['createdAt', 'DESC']
                            ]
                        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(drawings=>{
                            let list_of_drawings=drawings
                            trendings_contents.findAll({
                                where:{
                                    id_user:id_user,
                                    publication_category:"writing",
                                }
                                ,order: [
                                    ['createdAt', 'DESC']
                                ]
                            }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(writings=>{
                                let list_of_writings=writings
                                res.status(200).send([{found:true,list_of_writings:list_of_writings,list_of_drawings:list_of_drawings,list_of_comics:list_of_comics}])
                                        
                            })
                                    
                        })
                                
                    })
                      
            }
            else{
                res.status(200).send([{found:false}])
            }
        })
    })

    router.post('/get_all_trendings_by_user', function (req, res) {
console.log("checking current: " + req.headers['authorization'] );
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
        console.log("get_all_trendings_by_user")
        
        const Op = Sequelize.Op;
        const  date_format = req.body.date_format;
        const  id_user = req.body.id_user;
        var list_of_contents=[];
        var list_of_comics=[];
        var list_of_drawings=[];
        var list_of_writings=[];
        console.log(date_format)
        let date=new Date();
    
        if(date_format==0){
            date.setDate(date.getDate() - 8);
        }
        if(date_format==1){
            date.setDate(date.getDate() - 30);
        }
        else if(date_format==2){
            date.setDate(date.getDate() - 365);
        }
        
        if(date_format==4){
            trendings_contents.findAll({
                where:{
                    id_user:id_user,
                }
                ,order: [
                    ['createdAt', 'DESC']
                ],
                limit:6,
            }).catch(err => {
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(trendings=>{
                list_of_contents=trendings;
                trendings_contents.findAll({
                    where:{
                        publication_category:"comic",
                        id_user:id_user,
                    }
                    ,order: [
                        ['createdAt', 'DESC']
                    ],
                    limit:6,
                }).catch(err => {
                    console.log(err);	
                    res.status(500).json({msg: "error", details: err});		
                }).then(trendings_com=>{
                    list_of_comics=trendings_com;
                    trendings_contents.findAll({
                        where:{
                            publication_category:"drawing",
                            id_user:id_user,
                        }
                        ,order: [
                            ['createdAt', 'DESC']
                        ],
                        limit:6,
                    }).catch(err => {
                        console.log(err);	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(trendings_draw=>{
                        list_of_drawings=trendings_draw;
                        trendings_contents.findAll({
                            where:{
                                publication_category:"writing",
                                id_user:id_user,
                            }
                            ,order: [
                                ['createdAt', 'DESC']
                            ],
                            limit:6,
                        }).catch(err => {
                            console.log(err);	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(trendings_wri=>{
                            list_of_writings=trendings_wri;
                            res.status(200).send([{list_of_contents:list_of_contents,list_of_comics:list_of_comics,list_of_writings:list_of_writings,list_of_drawings:list_of_drawings}])
                        })
                    })
                })
            })
        }
        else{
            trendings_contents.findAll({
                where:{
                    createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                    id_user:id_user,
                }
                ,order: [
                    ['createdAt', 'DESC']
                ]
            }).catch(err => {
                console.log(err);	
                res.status(500).json({msg: "error", details: err});		
            }).then(trendings=>{
                let list_of_contents=trendings
                
                trendings_contents.findAll({
                    where:{
                        createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                        id_user:id_user,
                        publication_category:"comic",
                    }
                    ,order: [
                        ['createdAt', 'DESC']
                    ]
                }).catch(err => {
                    console.log(err);	
                    res.status(500).json({msg: "error", details: err});		
                }).then(comics=>{
                    let list_of_comics=comics
                    trendings_contents.findAll({
                        where:{
                            createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                            id_user:id_user,
                            publication_category:"drawing",
                        }
                        ,order: [
                            ['createdAt', 'DESC']
                        ]
                    }).catch(err => {
                        console.log(err);	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(drawings=>{
                        let list_of_drawings=drawings
                        trendings_contents.findAll({
                            where:{
                                createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                                id_user:id_user,
                                publication_category:"writing",
                            }
                            ,order: [
                                ['createdAt', 'DESC']
                            ]
                        }).catch(err => {
                            console.log(err);	
                            res.status(500).json({msg: "error", details: err});		
                        }).then(writings=>{
                            let list_of_writings=writings
                            res.status(200).send([{list_of_contents:list_of_contents,list_of_writings:list_of_writings,list_of_drawings:list_of_drawings,list_of_comics:list_of_comics}])
                                    
                        })
                                
                    })
                            
                })
                        
            })
        }

        



        
    });
 

    

    router.post('/get_total_trendings_gains_by_user', function (req, res) {
console.log("checking current: " + req.headers['authorization'] );
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
        console.log("get_total_trendings_gains_by_user")
        
        let current_user = get_current_user(req.cookies.currentUser);
        let total_gains=0;
        trendings_contents.findAll({
            where:{
                id_user:current_user,
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(trendings=>{

            if(trendings.length>0){
                for( let i=0;i<trendings.length;i++){
                    total_gains+= Number(trendings[i].remuneration);
                        
                }
            }
            res.status(200).json([{total:total_gains}]);	
        })
        
    });

    router.post('/get_total_trendings_gains_by_users_group', function (req, res) {
console.log("checking current: " + req.headers['authorization'] );
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
        console.log("get_total_trendings_gains_by_users_group")
        
        let current_user = get_current_user(req.cookies.currentUser);
        let list_of_ids=req.body.list_of_ids
        let total_gains=0;
        trendings_contents.findAll({
            where:{
                id_user:list_of_ids,
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(trendings=>{

            if(trendings.length>0){
                for( let i=0;i<trendings.length;i++){
                    let gain = Number(trendings[i].remuneration);
                    let share=Number(trendings[i].shares[0][current_user])/100;
                    total_gains+=gain*share;   
                }
            }
            res.status(200).json([{total:total_gains,trendings:trendings}]);	
        })
        
    });
    

    

    router.post('/get_date_of_trendings', function (req, res) {
console.log("checking current: " + req.headers['authorization'] );
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
        var today = new Date();
  
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth()+1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
      
        let date = yyyy.toString() + '-' +  mm  + '-' + dd;
        res.status(200).send([{date:date}])
    })
   
    

}