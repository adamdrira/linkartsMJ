const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const multer = require('multer');
const fs = require('fs');
var path = require('path');




module.exports = (router, favorites) => {

    function get_current_user(token){
        var user = 0
        jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
            user=decoded.id;
        });
        return user;
    };


    
    router.post('/get_all_favorites_by_user', function (req, res) {
        console.log("get_all_favorites_by_user")
        
        const Op = Sequelize.Op;
        const  date_format = req.body.date_format;
        const  id_user = req.body.id_user;
        console.log(date_format)
        let date=new Date();
    
        if(date_format==0){
            date.setDate(date.getDate() - 30);
        }
        
        favorites.findAll({
            where:{
                createdAt: (date_format<1)?{[Op.gte]: date}:{[Op.lte]: date},
                id_user:id_user,
            }
            ,order: [
                ['createdAt', 'DESC']
            ]
        }).then(favorites=>{
            res.status(200).send([{list_of_favorites:favorites}])
                        
                    
        })
        
    });
 
    

}