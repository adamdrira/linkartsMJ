const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const multer = require('multer');
const fs = require('fs');
var path = require('path');




module.exports = (router, trendings_comics,trendings_drawings,trendings_writings,trendings_contents) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    
    router.post('/check_if_user_has_trendings', function (req, res) {
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
 

    

    

    

    router.post('/get_date_of_trendings', function (req, res) {
        var today = new Date();
        console.log("get_date_of_trendings")
  
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth()+1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
      
        let date = yyyy.toString() + '-' +  mm  + '-' + dd;
        res.status(200).send([{date:date}])
    })
   
    

}