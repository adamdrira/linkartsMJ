const db = require('./db.config.js');
const User = db.users;
const User_passwords = db.user_passwords;
const User_links = db.user_links;
const users_mailing = db.users_mailing;
const users_information_privacy = db.users_information_privacy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
let list_of_invited_mails=["adam.drira","mokhtar.meghaichi"]
let list_of_invited_passwords=["Adam_@d@m_4d4m_1996","Mokhtar_m°kht@r_m0kht4r_1996"]
const chat_seq = require('../chat/model/sequelize');
const List_of_subscribings = require('../p_subscribings_archives_contents/model/sequelize').list_of_subscribings;
const albums_seq = require('../albums_edition/model/sequelize');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdJBL1lwHzfr3';


// Post a User
exports.create = (req, res) => {
	// Save to PostgreSQL database
	const Op = Sequelize.Op;

	User.findOne({
		where:{
			[Op.or]:[{email:{[Op.iLike]: req.body.email}},{nickname:req.body.nickname}],
			
		}
	}).then(user=>{
		if(user){
			res.status(200).json([{error: "similar user found"}])
		}
		else{
			start_creation();
		}
	})

	function start_creation(){
		var passwordhash;

		bcrypt.hash(req.body.password,10,function(err,hash){
			passwordhash = hash;
			const iv = crypto.randomBytes(16);
			const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
			const encrypted = Buffer.concat([cipher.update(req.body.password), cipher.final()]);
			const password = {
				iv: iv.toString('hex'),
				content: encrypted.toString('hex')
			}
			console.log("encrypted pass");
			console.log(password)
			if(req.body.id_admin){
				User.create({
					"id_admin":req.body.id_admin,
					"list_of_members":req.body.list_of_members,
					"type_of_account":req.body.type_of_account,
					"siret":req.body.siret,
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
					"number_of_likes": 0,
					"number_of_loves": 0,
					"number_of_views": 0,
					"number_of_comments": 0,
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
					User_passwords.create({
						"id_user":r.id,
						"iv":password.iv,
						"content":password.content,
					})
					after_creation(r)
				})
			}
			else{
				User.create({
					"email": req.body.email,
					"nickname": req.body.nickname,
					"siret":req.body.siret,
					"firstname": req.body.firstname, 
					"lastname": req.body.lastname,
					"gender": req.body.gender,
					"location": req.body.location,
					"password": passwordhash,
					"links":req.body.links,
					"type_of_account":req.body.type_of_account,
					"primary_description":req.body.primary_description,
					"primary_description_extended":req.body.primary_description_extended,
					"training":req.body.training,
					"job":req.body.job,
					"birthday":req.body.birthday,
					"number_of_comics": 0,
					"number_of_drawings": 0,
					"number_of_writings": 0,
					"number_of_ads": 0,
					"number_of_likes": 0,
					"number_of_loves": 0,
					"number_of_views": 0,
					"number_of_comments": 0,
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
					User_passwords.create({
						"id_user":r.id,
						"iv":password.iv,
						"content":password.content,
					})
					after_creation(r)
				})
			}
			
	
			function after_creation(r){
				let special_visitor_type=''
				console.log(r.type_of_account)
				if(r.type_of_account=="Artistes" || r.type_of_account=="Artiste" || r.type_of_account=="Artistes professionnels" || r.type_of_account=="Artiste professionnel" 
				|| r.type_of_account=="Artiste professionnelle" ){
				  special_visitor_type="Maison d'édition"
				}
				else if(r.type_of_account=="Maison d'édition" || r.type_of_account=="Editrice" || r.type_of_account=="Editeur"  ){
				  special_visitor_type="Artiste"
				}
				else if(r.type_of_account=="Professionnels non artistes" || r.type_of_account=="Professionnelle non artiste" || r.type_of_account=="Professionnel non artiste"  ){
				  special_visitor_type="Professionnel"
				}
				console.log(special_visitor_type)
				users_mailing.create({
					"id_user":r.id,
					"special_visitor_type":special_visitor_type,
					"trending_mail":true,
					"ads_answers":true,
					"special_visitor":true,
					"group_creation":true,
					"group_shares":true,
				}).catch(err => {
					console.log(err);	
					res.status(500).json({msg: "error", details: err});		
				}).then(
					users_information_privacy.create({
						"id_user": r.id,
						"type_of_profile":"public",
						"email_about": "public",
						"primary_description_extended":"public",
						"birthday":"public",
						"job":"public",
						"training":"public",
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				).then(
					albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"one-shot",
						"album_category":"comics",
						"status":"standard"
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				)
				.then(()=>{albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"serie",
						"album_category":"comics",
						"status":"standard"
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"artbook",
							"album_category":"drawings",
							"status":"standard"
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"one-shot",
							"album_category":"drawings",
							"status":"standard"
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"all",
							"album_category":"writings",
							"status":"standard"
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{
					let now= new Date();
					chat_seq.list_of_chat_friends.create({
						"id_user":r.id,
						"id_receiver":1,
						"is_a_group_chat":false,
						"date":now,
					}).catch(err => {
						console.log(err);	
						res.status(500).json({msg: "error", details: err});		
					}).then(()=>{
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
						  }).catch(err => {
							console.log(err);	
							res.status(500).json({msg: "error", details: err});		
						}).then(
							  List_of_subscribings.create({
								"status":"public",
								"id_user":  r.id,
								"id_user_subscribed_to":1,
							  })
							).catch(err => {
								console.log(err);	
								res.status(500).json({msg: "error", details: err});		
							}).then(()=>{
								res.status(200).json([{msg: "creation ok",id_user:r.id}])
							})
					})
				})
			}
		});
	}
	
	

};

function get_current_user(token){
    var user = 0
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  


//decrypt password
exports.decrypt_password = (req, res) => {
	console.log("decrypt_password")
	let id_user= get_current_user(req.cookies.currentUser)

	User_passwords.findAll({
		where: {
			id_user: id_user,
		},
		limit:1,
		order: [
			['createdAt', 'DESC']
		],
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
		
		if(user.length>0){
			const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(user[0].iv, 'hex'));
			const decrypted = Buffer.concat([decipher.update(Buffer.from(user[0].content, 'hex')), decipher.final()]);
			res.status(200).json([{password: decrypted.toString()}])
		}
		else{
			res.status(200).json([{password: null}])
		}
	})
};




// reset_password
exports.reset_password = (req, res) => {
	console.log("reset_password")
	let email=req.body.email;

	User.findOne({
		where:{
			email:email,
		}
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user_found=>{
		if(user_found){
			User_passwords.findAll({
				where: {
					id_user: user_found.id,
				},
				limit:1,
				order: [
					['createdAt', 'DESC']
				],
			}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
				if(user.length>0){
					const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(user[0].iv, 'hex'));
					const decrypted = Buffer.concat([decipher.update(Buffer.from(user[0].content, 'hex')), decipher.final()]);
					res.status(200).json([{password: decrypted.toString()}])
				}
				else{
					var pass= Math.random().toString(36).slice(-8) + "@8=(AM" + Math.random().toString(36).slice(-8) + "@$=)G";
					var password;
					bcrypt.hash(pass,10,function(err,hash){
						password = hash;
						const iv = crypto.randomBytes(16);
						const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
						const encrypted = Buffer.concat([cipher.update(pass), cipher.final()]);
						const password_hash = {
							iv: iv.toString('hex'),
							content: encrypted.toString('hex')
						}
						console.log("encrypted pass");
						console.log(password_hash)
						user_found.update({
							password:password,
						})
						User_passwords.create({
							"id_user":user_found.id,
							"iv":password_hash.iv,
							"content":password_hash.content,
						})
						res.status(200).send([{pass:pass}])
					})
				}
			})
		}
		else{
			res.status(200).send([{error:"user_not_found"}])
		}
	})

	
};


//modify password
exports.edit_password = (req, res) => {
	console.log("modify_password")
	let id_user= get_current_user(req.cookies.currentUser)
	var passwordhash;

	bcrypt.hash(req.body.password,10,function(err,hash){
		passwordhash = hash;
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
		const encrypted = Buffer.concat([cipher.update(req.body.password), cipher.final()]);
		const password_hash = {
			iv: iv.toString('hex'),
			content: encrypted.toString('hex')
		}
		console.log("encrypted pass");
		console.log(password_hash)
		User.update({
			"password":passwordhash},
			{where:{
				id:id_user,
			}
			
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
			User_passwords.create({
				"id_user":id_user,
				"iv":password_hash.iv,
				"content":password_hash.content,
			}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(pass=>{
				res.status(200).json([pass])
			})
		})
	})
};


//modify password
exports.edit_email = (req, res) => {
	console.log("edit_email")
	let id_user= get_current_user(req.cookies.currentUser);
	User.update({
		"email":req.boy.email},
		{where:{
			id:id_user,
		}
		
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
			res.status(200).json([user])
		
	})
};
// Post a add_link
exports.add_link = (req, res) => {
	// Save to PostgreSQL database
		console.log("add_link")
		User_links.create({
			"id_user": req.body.id_user,
			"link_title": req.body.link_title,
			"link": req.body.link, 
		}).catch(err => {
			console.log(err);	
			res.status(200).json({msg: "error registering the user", details: err});		
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(link=>{
			console.log(link)
			res.status(200).json([{msg: "creation ok"}])
		});
	

};


// Post a User
exports.remove_link = (req, res) => {
	// Save to PostgreSQL database
		console.log("remove_link")

		User_links.destroy({
			where:{
				id_user: req.body.id_user,
				link_title: req.body.link_title,
				link: req.body.link, 
			}
		  },{truncate:false})
		  .catch(err => {
			console.log(err);	
			res.status(200).json({msg: "error registering the user", details: err});		
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(
			res.status(200).json([{msg: "deletion ok"}])
		);
	

};




exports.get_password = (req, res) => {
	// Save to PostgreSQL database
	id=req.body.id;
	User.findOne({
		where:{
			id:id
		}
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
		if(user){

		}
		else{
			res.status(200).send([{nothing:"nothing"}])
		}
	})
	

};

exports.check_pseudo=(req,res)=>{
	console.log("check_pseudo")
	let pseudo = req.body.pseudo;
	const Op = Sequelize.Op;
	User.findAll({
		where:{
			status:"account",
			nickname:pseudo,
		}
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
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


exports.check_email=(req,res)=>{
	console.log("check_email")
	let email = (req.body.email).toLowerCase();
	const Op = Sequelize.Op;
	
	
	User.findAll({
		where:{
			status:"account",
			email:{[Op.iLike]: email},
		}
	}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
		console.log(user.email)
		if(user.length==0){
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
			[Op.or]:[{status:"account"},{status:"suspended"}],
			email:{[Op.iLike]: req.body.mail_or_username},
			} 
		});
	const passwordCorrect = (user === null) ? false : await bcrypt.compare( String(req.body.password), String(user.password)  );

	if( !user || !passwordCorrect ) {
		
		if(user){
			const Op = Sequelize.Op;
			var last_year = new Date();
        	last_year.setDate(last_year.getDate() - 365);
			User_passwords.findAll( {
				where: { 
					id_user:user.id,
					createdAt: {[Op.gte]: last_year}
				} ,
				order: [
					['createdAt', 'DESC']
				],
				}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(pass=>{
					if(pass.length>0){
						let exist=false;
						for(let i=0;i<pass.length;i++){
							let decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(pass[i].iv, 'hex'));
							let decrypted = Buffer.concat([decipher.update(Buffer.from(pass[i].content, 'hex')), decipher.final()]);
							console.log("")
							if(decrypted.toString()==req.body.password){
								exist=true
							}
						}
						if(exist){
							return res.status(200).json({msg: "error_old_value"});
						}
						else{
							return res.status(200).json({msg: "error"});
						}
						
					}
					else{
						return res.status(200).json({msg: "error"});
					}
				})
		}
		else{
			
			return res.status(200).json({msg: "error"});
		}
		
		
	}
	else{
		console.log("check login")
		console.log(user.gender)
		console.log(user.list_of_members_validations)
		console.log(user.list_of_members)
		if(user.gender=="Groupe"){
			if(!user.list_of_members_validations){
				return res.status(200).json({msg: "error_group"});
			}
			else{
				let similar=true;
				for(let i=0;i<user.list_of_members_validations.lenght;i++){
					if(user.list_of_members.indexOf(user.list_of_members_validations[i])<0){
						similar=false;	
					}
				}
				if(similar){
					const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
					return res.status(200).json( { token:token } );
				}
				else{
					return res.status(200).json({msg: "error_group"});	
				}
			}
			
		}
		else{
			const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
			return res.status(200).json( { token:token } );
		}
		
	}

	
	
};


//for invited users
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
			.catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{res.send([user]);})
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
	
	User.findOne( { where: { email : req.body.mail} } ).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error", details: err});		
		}).then( user => {

		if( user == null ) {
			return res.json( {msg: "EMAIL_NOT_FOUND", email: req.body.mail} );
		}
		else {
			
			const token = jwt.sign( {email: user.dataValues.email}, user.dataValues.password, {expiresIn: 30 /*expires in 30 seconds*/ } );
			return res.json( {msg: "EMAIL_FOUND_TOKEN_SEND", token: token} );


		}
	});

	

};
