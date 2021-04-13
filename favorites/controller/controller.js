const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');



module.exports = (router, favorites,users) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    
    router.post('/get_all_favorites_by_user', function (req, res) {
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
        const  date_format = req.body.date_format;
        const  id_user = req.body.id_user;
        let date=new Date();
    
        if(date_format==0){
            date.setDate(date.getDate() - 7);
        }
        else if(date_format==1){
            date.setDate(date.getDate() - 30);
        }
        else if(date_format==2){
            date.setDate(date.getDate() - 365);
        }
        users.findOne({
            where:{
                id:id_user,
            }
        }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
            if(user && user.status=="account"){
                if(user.gender=="Groupe"){
                    favorites.findAll({
                        where:{
                            createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                            id_user:id_user,
                            shares:{[Op.not]: null}
                        }
                        ,order: [
                            ['createdAt', 'DESC']
                        ]
                    }).catch(err => {	
                        res.status(500).json({msg: "error", details: err});		
                    }).then(favorites=>{
                        res.status(200).send([{list_of_favorites:favorites}])
                                    
                                
                    })
                }
                else{
                    favorites.findAll({
                        where:{
                            createdAt: (date_format<3)?{[Op.gte]: date}:{[Op.lte]: date},
                            id_user:id_user,
                        }
                        ,order: [
                            ['createdAt', 'DESC']
                        ]
                    }).catch(err => {
                        res.status(500).json({msg: "error", details: err});		
                    }).then(favorites=>{
                        res.status(200).send([{list_of_favorites:favorites}])
                                    
                                
                    })
                }
            }
            else{
                res.status(200).send([{list_of_favorites:[]}])
            }
        })
       
        
    });
 

    router.post('/get_total_favorites_gains_by_user', function (req, res) {
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
        
        let current_user = get_current_user(req.cookies.currentUser);
        let total_gains=0;
        favorites.findAll({
            where:{
                id_user:current_user,
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).catch(err => {
			res.status(500).json({msg: "error", details: err});		
		}).then(favorites=>{

            if(favorites.length>0){
                for( let i=0;i<favorites.length;i++){
                    total_gains+= Number(favorites[i].remuneration);
                        
                }
            }
            res.status(200).json([{total:total_gains}]);	
        })
        
    });

    router.post('/get_total_favorites_gains_by_users_group', function (req, res) {
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
        let current_user = get_current_user(req.cookies.currentUser);
        let list_of_ids=req.body.list_of_ids
        let total_gains=0;
        favorites.findAll({
            where:{
                id_user:list_of_ids,
                shares:{[Op.not]: null}
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).catch(err => {	
			res.status(500).json({msg: "error", details: err});		
		}).then(favorites=>{

            if(favorites.length>0){
                for( let i=0;i<favorites.length;i++){
                    let gain = Number(favorites[i].remuneration);
                    let share=Number(favorites[i].shares[0][current_user])/100;
                    total_gains+=gain*share;   
                }
            }
            res.status(200).json([{total:total_gains,favorites:favorites}]);	
        })
        
    });
    
 
    

}