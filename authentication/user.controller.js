const db = require('./db.config.js');
const User = db.users;
const User_links = db.user_links;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
const { ok } = require('assert');
list_of_invited_mails=["adam.drira","mokhtar.meghaichi"]
list_of_invited_passwords=["Adam_@d@m_4d4m_1996","Mokhtar_m°kht@r_m0kht4r_1996"]
const chat_seq = require('../chat/model/sequelize');
const albums_seq = require('../albums_edition/model/sequelize');

// Post a User
exports.create = (req, res) => {
	// Save to PostgreSQL database
	var passwordhash;

	bcrypt.hash(req.body.password,10,function(err,hash){
		passwordhash = hash;
		User.create({
			"email": req.body.email,
			"nickname": req.body.nickname,
			"firstname": req.body.firstname, 
			"lastname": req.body.lastname,
			"gender": req.body.gender,
			"location": req.body.location,
			"password": passwordhash,
			"links":req.body.links,
			"primary_description":req.body.primary_description,
			"primary_description_extended":req.body.primary_description_extended,
			"training":req.body.training,
			"job":req.body.job,
			"birthday":req.body.birthday,
			"number_of_comics": 0,
			"number_of_drawings": 0,
			"number_of_writings": 0,
			"number_of_ads": 0,
			"likesnumber": 0,
			"lovesnumber": 0,
			"subscribers_number": 0,
			"subscribings_number": 1,
			"subscribers":[],
			"subscribings":[1],
			"profile_pic_file_name":"default_profile_picture.png",
			"cover_pic_file_name":"default_cover_picture.png",
			"status":"account",
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error registering the user", details: err});		
		}).then( r=>{
			
			
			albums_seq.list_of_albums.create({
				"id_user": r.id,
				"album_name":"one-shot",
				"album_category":"comics",
				"status":"standard"
			})
			.then(()=>{albums_seq.list_of_albums.create({
					"id_user": r.id,
					"album_name":"serie",
					"album_category":"comics",
					"status":"standard"
			})})
			.then(()=>{albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"artbook",
						"album_category":"drawings",
						"status":"standard"
			})})
			.then(()=>{albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"one-shot",
						"album_category":"drawings",
						"status":"standard"
			})})
			.then(()=>{albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"all",
						"album_category":"writings",
						"status":"standard"
			})})
			.then(()=>{
				let now= new Date();
				chat_seq.list_of_chat_friends.create({
					"id_user":r.id,
					"id_receiver":1,
					"date":now,
				})
			})
			.then(()=>{
				chat_seq.list_of_messages.create({
					"id_user_name":"Linkarts",
					"id_receiver": r.id,
					"id_user":1,
					"message":"Bienvenue sur Linkarts",
					"is_from_server":false,
					"attachment_name":null,
					"size":null,
					"is_a_response":false,
					"id_message_responding":null,
					"message_responding_to":null,
					"id_chat_section":1,
					"is_an_attachment":false,
					"attachment_type":null,
					"is_a_group_chat":false,
					"status":'received',
				  })
			})
			.then(()=>{
				res.status(200).json([{msg: "creation ok",id_user:r.id}])
			})
		})
	});
	

};


// Post a User
exports.add_link = (req, res) => {
	// Save to PostgreSQL database
	var passwordhash;

	bcrypt.hash(req.body.password,10,function(err,hash){
		passwordhash = hash;
		User_links.create({
			"id_user": req.body.id_user,
			"link_title": req.body.link_title,
			"link": req.body.link, 
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error registering the user", details: err});		
		}).then(res.status(200).json([{msg: "creation ok"}])
				
			
		);
	});
	

};

exports.check_pseudo=(req,res)=>{
	console.log("check_pseudo")
	let pseudo = (req.body.pseudo).toLowerCase();
	const Op = Sequelize.Op;
	User.findAll({
		where:{
			nickname:pseudo,
		}
	}).then(pseudos=>{
		console.log(pseudos)
		if(pseudos.length==0){
			res.status(200).send([{msg: "ok"}]);		
		}
		else{
			res.status(200).send([{msg: "found"}]);	
		}
	})
}



exports.create_visitor = (req, res) => {
		console.log("creation visitor");
		User.create({
			"nickname":"visitor",
			"status":"visitor",
		}).catch(err => {
			console.log(err);	
			res.status(200).json({msg: "error registering the visitor", details: err});		
		}).then(user=>{
			const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
			return res.status(200).json( { token:token } );
		})
};

exports.login = async (req, res) => {
	const Op = Sequelize.Op;
	const user = await User.findOne( {
		 where: { 
			[Op.or]:[{nickname: req.body.mail_or_username},{email:req.body.mail_or_username}],
			} 
		});
	const passwordCorrect = (user === null) ? false : await bcrypt.compare( String(req.body.password), String(user.password)  );

	if( !user || !passwordCorrect ) {
		return res.status(200).json({msg: "error"});
	}
	else{
		const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
		return res.status(200).json( { token:token } );
	}

	
	
};

exports.encrypt_data= async(req,res)=>{
	console.log("encrypt_data")
	var passwordCorrect =false;
	var mailCorrect =false;
	
	for(let i=0;i<list_of_invited_mails.length;i++){
		console.log(list_of_invited_mails[i])
		console.log(list_of_invited_passwords[i])
		if( bcrypt.compare( String(req.body.mail), String(list_of_invited_mails[i])) && bcrypt.compare( String(req.body.password), String(list_of_invited_passwords[i])))
		mailCorrect= true;
		passwordCorrect = true;
	}

	if(!passwordCorrect || !mailCorrect) {
		return res.status(200).json({msg: "error"});
	}
	else{
		const token = jwt.sign( {mail: req.body.mail, password: req.body.password}, SECRET_TOKEN, {expiresIn: 360  } );
		return res.status(200).json( { token:token } );
	}

}

exports.check_invited_user =async(req,res)=>{
	console.log("check_invited_user");
	jwt.verify(req.cookies.inviteduser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			console.log("error check_invited_user");
		}
		else{
			console.log(list_of_invited_mails);
			console.log(list_of_invited_passwords)
			console.log(decoded)
			let invited_user_found=false;
			for(let i=0;i<list_of_invited_mails.length;i++){
				if(decoded.mail==list_of_invited_mails[i] && decoded.password==list_of_invited_passwords[i]){
					invited_user_found=true;
				}
			}
			if (!invited_user_found) {
				console.log("token unknown")
				res.status(200).send([{"msg": "TOKEN_UNKNOWN"}]);
			}

			else if (decoded.exp < new Date().getTime()/1000) {
				console.log("token refresh")
				const refreshed_token = jwt.sign( {mail: decoded.mail, password: decoded.password}, SECRET_TOKEN, {expiresIn: 60*15  });
				return res.status(200).json( { msg: "TOKEN_REFRESH", token: refreshed_token} );
			}
			else {
				console.log("token ok")
				return res.status(200).json( { msg: "TOKEN_OK"} );
		}
		}
		
	});
	
}

// to have current user's identifications
exports.getCurrentUser = async (req, res) => {
	let value = req.cookies;

	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			const user = await User.findOne( { where: { id : decoded.id} } )
			.then(user=>{res.send([user]);})
		}
		
		
	
	});
 
 };

 

//request : token.
exports.checkToken = async (req, res) => {

	/*console.log("checking : " + req.headers['authorization'] );

	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}
	
	req.headers['authorization'].replace(/^Bearer\s/, '')*/
	console.log("req.cookies.currentUser")
	console.log(req.cookies.currentUser)
	/*if( !req.cookies.currentUser) {

		console.log("creation visitor 139");
		
	}*/
	jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			console.log("error but ok");
			User.create({
				"nickname":"visitor",
				"status":"visitor",
			}).catch(err => {
				console.log(err);	
				res.status(500).json({msg: "error registering the visitor", details: err});		
			}).then(user=>{
				const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30  } );
				return res.status(200).json( { "token":token,"status":"visitor" } );
			})
		}
		else{
			console.log("else");
			const user = await User.findOne( { where: { id : decoded.id} } );
			if (user === null) {
				console.log("token unknown")
				res.status(200).send([{"msg": "TOKEN_UNKNOWN"}]);
			}
	
			else if (err) {
				console.log(req.headers);
				return res.status(401).json({msg: "TOKEN_ERROR"});
			}
			else if (decoded.exp < new Date().getTime()/1000) {
				console.log(req.headers);
				const refreshed_token = jwt.sign( {nickname: decoded.nickname, id: decoded.id}, SECRET_TOKEN, {expiresIn: 60*15 /*expires in 15 minutes*/ });
				return res.status(200).json( { msg: "TOKEN_REFRESH", token: refreshed_token,"status": user.status} );
			}
			else if (!err) {
				console.log("token ok");
				return res.status(200).json( { msg: "TOKEN_OK","status": user.status } );
		}
		}
		
	});
	
	

};


exports.checkMail = (req, res) => {

	console.log("checking : " + req.body.mail );
	
	User.findOne( { where: { email : req.body.mail} } ).then( user => {

		if( user == null ) {
			return res.json( {msg: "EMAIL_NOT_FOUND", email: req.body.mail} );
		}
		else {
			
			const token = jwt.sign( {email: user.dataValues.email}, user.dataValues.password, {expiresIn: 30 /*expires in 30 seconds*/ } );
			return res.json( {msg: "EMAIL_FOUND_TOKEN_SEND", token: token} );


		}
	});

	

};
