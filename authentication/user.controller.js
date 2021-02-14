const db = require('./db.config.js');
const User = db.users;

const User_passwords = db.user_passwords;
const User_cookies = db.users_cookies;
const User_links = db.user_links;
const users_mailing = db.users_mailing;
const users_information_privacy = db.users_information_privacy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
let list_of_invited_mails=["adam.drira","mokhtar.meghaichi","Samar_Kanoun","nacima.connaissance","invitation.invité"]
let list_of_invited_passwords=["Adam_@d@m_4d4m_1996","Mokhtar_m°kht@r_m0kht4r_1996","SaM4r_Sam0urti^","Nacim4_The_B3st","4nInV1t@tiion"]
const chat_seq = require('../chat/model/sequelize');
const List_of_subscribings = require('../p_subscribings_archives_contents/model/sequelize').list_of_subscribings;
const albums_seq = require('../albums_edition/model/sequelize');
const crypto = require('crypto');
var nodemailer = require('nodemailer');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdJBL1lwHzfr3';
var geoip = require('geoip-lite');
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
					"profile_pic_file_name":"default_profile_picture1.png",
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
				users_mailing.create({
					"id_user":r.id,
					"agreement":true,
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
						"profile_stats":"private",
						"comics_stats":"private",
						"drawings_stats":"private",
						"writings_stats":"private",
						"trendings_stats":"private",
						"ads_stats":"private",
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
					User.findAll({
						where:{
							status:"account",
						},
						order: [
							['id', 'ASC']
						],
						limit:1}
				   	).then(first_user=>{
						   if(first_user.length>0){
								let now= new Date();
								chat_seq.list_of_chat_friends.create({
									"id_user":r.id,
									"id_receiver":first_user[0].id,
									"is_a_group_chat":false,
									"date":now,
								}).catch(err => {
									console.log(err);	
									res.status(500).json({msg: "error", details: err});		
								}).then(()=>{
									chat_seq.list_of_messages.create({
										"id_user_name":"Linkarts",
										"id_receiver": r.id,
										"id_user":first_user[0].id,
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
											"id_user_subscribed_to":first_user[0].id,
										})
										).catch(err => {
											console.log(err);	
											res.status(500).json({msg: "error", details: err});		
										}).then(()=>{
											res.status(200).json([{msg: "creation ok",id_user:r.id}])
										})
								})
						   }
						   else{
							res.status(200).json([{msg: "creation ok",id_user:r.id}])
						   }
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
			let password_registration=generate_random_id(user_found.id);
			console.log(user_found.email)
			console.log(password_registration)
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
					"password":password,
					"password_registration":password_registration,
					"temp_pass":pass,
				})
				User_passwords.create({
					"id_user":user_found.id,
					"iv":password_hash.iv,
					"content":password_hash.content,
					
				})

				let mail_to_send='';
				let name = user_found.firstname + ' ' + user_found.lastname;
				if(user_found.gender=="Homme"){
				mail_to_send=`<p>Cher ${name},</p>`
				}
				else if(user_found.gender=="Femme"){
				mail_to_send=`<p>Chere ${name},</p>`
				}
				else if(user_found.gender=="Groupe"){
				mail_to_send=`<p>Chers membres du groupe ${name},</p>`
				}

				mail_to_send+=`<p>Votre nouveau mot de passe est le suivant : ${pass}.</p>`

				mail_to_send+=`<p><a href="http://localhost:4200/account/${user_found.nickname}/${user_found.id}/my_account/${password_registration}">Cliquer ici</a> pour le modifier.</p>`
				
				mail_to_send+=`<p>Très sincèrement, l'équipe de LinkArts.</p>`


				const transport = nodemailer.createTransport({
					host: "pro2.mail.ovh.net",
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: "services@linkarts.fr", // compte expéditeur
						pass: "Le-Site-De-Mokhtar-Le-Pdg" // mot de passe du compte expéditeur
					},
						tls:{
							ciphers:'SSLv3'
					}
					});
			
				var mailOptions = {
					from: 'Linkarts <services@linkarts.fr>', // sender address
					//to: user_found.email, // my mail
					to:"appaloosa-adam@hotmail.fr",
					//cc:"adam.drira@etu.emse.fr",
					subject: `Récupération du mot de passe`, // Subject line
					html:mail_to_send , // html body
					// attachments: params.attachments
				};
				transport.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.log('Error while sending mail: ' + error);
						res.status(200).send([{error:error}])
					} else {
						console.log('Message sent: %s', info.messageId);
						res.status(200).send([{sent:'Message sent ' + info.messageId}])
					}
					
		
				})

				
			})
			function generate_random_id(id){
				const iv = crypto.randomBytes(16);
				const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
				const encrypted = Buffer.concat([cipher.update(id.toString()), cipher.final()]);
				let string_1=encrypted.toString('hex');
				let string_2=iv.toString('hex');
				
				let string_3=Math.random().toString(36).slice(-8) 
				return string_1 + string_2 + string_3;
				
			}
			/*User_passwords.findAll({
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
					console.log(user_found.email)
					console.log(decrypted.toString())
					const transport = nodemailer.createTransport({
						host: "pro2.mail.ovh.net",
						port: 587,
						secure: false, // true for 465, false for other ports
						auth: {
						  user: "services@linkarts.fr", // compte expéditeur
						  pass: "Le-Site-De-Mokhtar-Le-Pdg" // mot de passe du compte expéditeur
						},
							tls:{
							  ciphers:'SSLv3'
						}
					});
				

					let mail_to_send='';
					let name = user_found.firstname + ' ' + user_found.lastname;
					if(user_found.gender=="Homme"){
					mail_to_send=`<p>Cher ${name},</p>`
					}
					else if(user_found.gender=="Femme"){
					mail_to_send=`<p>Chere ${name},</p>`
					}
					else if(user_found.gender=="Groupe"){
					mail_to_send=`<p>Chers membres du groupe ${name},</p>`
					}

					mail_to_send+=`<p>Votre mot de passe est le suivant : ${decrypted.toString()}. </p>`

					mail_to_send+=`<p><a href="https://linkarts.fr/account/${user_found.nickname}/${user_found.id}/my_account">Cliquer ici</a> pour le modifier.</p>`
					
					mail_to_send+=`<p>Très sincèrement, l'équipe de LinkArts.</p>`
						
					var mailOptions = {
						from: 'Linkarts <services@linkarts.fr>', // sender address
						to: user_found.email, // my mail
						//cc:"adam.drira@etu.emse.fr",
						subject: `Récupération du mot de passe`, // Subject line
						html: mail_to_send, // plain text body
						//html:  `<p><a href="http://localhost:4200/registration/${user.id}/${password}"> Cliquer ici pour confirmer son inscription </a></p>`, // html body
						// attachments: params.attachments
					};
					
					transport.sendMail(mailOptions, (error, info) => {
						if (error) {
							console.log('Error while sending mail: ' + error);
							res.status(200).send([{error:error}])
						} else {
							console.log('Message sent: %s', info.messageId);
							res.status(200).send([{sent:'Message sent ' + info.messageId}])
						}
						
			
					})
				}
				else{
					res.status(200).send([{error:"user not found"}])
				}
			})*/
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
	let user = req.body.user;
	let email = (user.email).toLowerCase();
	const Op = Sequelize.Op;
	

	if(user.gender=='Groupe'){
		User.findAll({
			where:{
				status:"account",
				gender:'Groupe',
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
					res.status(200).send([{msg: "found", type:"groupe"}]);	
				}
			})
	}
	else{
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
				res.status(200).send([{msg: "found", type:"user"}]);	
			}
		})
	}
	
	
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
			//vérifier que le mdp n'est pas un ancier mdp et informer l'utilisateur
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
		if(user.gender=="Groupe" && user.type_of_account.includes("Artiste")){
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
					return res.status(200).json( { token:token,user:user } );
				}
				else{
					return res.status(200).json({msg: "error_group"});	
				}
			}
			
		}
		else{
			//console.log(user.list_of_ips)
			console.log("ip")
			//var geo = geoip.lookup(ip);
			//console.log(geo)
			
			let now = new Date();
			let connexion_time = now.toString();
			db.users_connexions.create({
				"id_user":user.id,
				"connexion_time":connexion_time,
			})

			db.users_ips.findOne({where:{
				id_user:user.id
			}}).then(user_ips=>{
				/*if(user_ips){
					if(user_ips.list_of_ips.indexOf(ip)<0){
						// send email with geo
						let list_of_ips =user_ips.list_of_ips;
						let list_of_latitudes =user_ips.list_of_latitudes;
						let list_of_longitudes =user_ips.list_of_longitudes;
						let list_of_areas =user_ips.list_of_areas;
						let list_of_countries =user_ips.list_of_countries;
						let list_of_regions =user_ips.list_of_regions;

						let lat=Number(list_of_latitudes[list_of_latitudes.length-1])
						let long =Number(list_of_longitudes[list_of_longitudes.length-1])
					
						
						let distance =calcCrow(geo.ll[0],geo.ll[1],lat,long);
	
						
						list_of_ips.push(ip);
						list_of_latitudes.push(geo.ll[0]);
						list_of_longitudes.push(geo.ll[1]);
						list_of_areas.push(geo.area);
						list_of_countries.push(geo.country);
						list_of_regions.push(geo.region);
						
						
						user_ips.update({
							"list_of_ips":list_of_ips,
							"list_of_latitudes":list_of_latitudes,
							"list_of_longitudes":list_of_longitudes,
							"list_of_areas":list_of_areas,
							"list_of_countries":list_of_countries,
							"list_of_regions":list_of_regions,
						});

						if(distance>100){
							const transport = nodemailer.createTransport({
								host: "pro2.mail.ovh.net",
								port: 587,
								secure: false, // true for 465, false for other ports
								auth: {
								  user: "services@linkarts.fr", // compte expéditeur
								  pass: "Le-Site-De-Mokhtar-Le-Pdg" // mot de passe du compte expéditeur
								},
									tls:{
									  ciphers:'SSLv3'
								}
							  });
						
							var mailOptions = {
								from: 'Linkarts <services@linkarts.fr>', // sender address
								to: user.email, // my mail
								//to:"appaloosa-adam@hotmail.fr",
								subject: `Fraude potentielle !`, // Subject line
								//text: decrypted.toString(), // plain text body
								html:  `<p >Attention une connexion à votre compte a été réalisée à un endroit inhabituel.</p>
									<ul>
										<li>pays : ${geo.country}</li>
										<li>région : ${geo.region}</li>
										<li>latitude : ${geo.ll[0]}</li>
										<li>longitude: ${geo.ll[1]}</li>
										<li>fuseau horaire : ${geo.timezone}</li>
									</ul>
								<p> Si vous n'êtes pas le responsable de cette connexion nous vous conseillons de tenter de changer votre mot de passe imédiatement.</p> 
									<ul>
										<li><a href="https://www.linkarts.fr/account/${user.nickname}/${user.id}/my_account"> Cliquer ici</a> pour changer mon mot de passe. </li>
					
									</ul> 
								<p> Si le mot de passe a été modifié par l'individu malveillant nous vous conseillons de demander à récupérer le nouveau mot de passe et puis de le changer soigneusement. </p>
									<ul>
										<li><a href="https://www.linkarts.fr/login"> Cliquer ici</a> pour me connecter et renseigner un mot de passe oublié.</li>
					
									</ul>
								<p>Si le problème ne se règle pas vous pouvez toujours nous écrire dans la messagerie et nous tâcherons de régler votre problème dans les plus brefs délais. </p>
									<ul>
										<li><a href="https://www.linkarts.fr/chat"> Cliquer ici</a> pour regoindre la messagerie</li>
						
									</ul>
								<p>Si vous êtes le responsable de ce changement il n'y a pas de crainte à avoir. </p>
								<p>Très sincèrement, l'équipe de LinkArts.</p>`, // html body
							
							};
							
							transport.sendMail(mailOptions, (error, info) => {
								if (error) {
									console.log('Error while sending mail: ' + error);
									const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30  } );
									return res.status(200).json( { token:token,user:user } );
								} else {
									console.log('Message sent: %s', info.messageId);
									const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 } );
									return res.status(200).json( { token:token,user:user } );
								}
								
					
							})
						}
						else{
							const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30  } );
							return res.status(200).json( { token:token,user:user } );
						}
						
						
					}
					else{
						const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 } );
						return res.status(200).json( { token:token,user:user } );
					}
				}*/
				//else{
					db.users_ips.create({
						"id_user":user.id,
					});
					const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
					return res.status(200).json( { token:token,user:user } );
				//}
			})
			
			function calcCrow(lat1, lon1, lat2, lon2) {
				var R = 6371; // km
				var dLat = toRad(lat2-lat1);
				var dLon = toRad(lon2-lon1);
				var lat1 = toRad(lat1);
				var lat2 = toRad(lat2);

				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
				
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
				var d = R * c;
				return d;
			}

			// Converts numeric degrees to radians
			function toRad(Value) 
			{
				return Value * Math.PI / 180;
			}
		}
		
	}

	
	
};

exports.logout = (req,res) =>{
	let value = req.cookies;
	console.log("deconnexion")
	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			console.log(decoded.id)
			db.users_connexions.findAll({
				where: {
				  id_user:decoded.id,
				},
				order: [
				  ['createdAt', 'DESC']
				],
				limit:1,
			  }).then(user1=>{
				
				if(user1.length>0){
				  let now = new Date();
				  let deconnexion_time = now.toString();
				  user1[0].update({
					"deconnexion_time":deconnexion_time,
				  })
				}
				return res.status(200).json( { deconnexion:"ok" } );
			  })
		}
	})

	
}

exports.check_email_and_password = async (req, res) => {
	const Op = Sequelize.Op;
	const user = await User.findOne( {
		 where: { 
			[Op.or]:[{status:"account"},{status:"suspended"}],
			email:{[Op.iLike]: req.body.email},
			} 
		});
	const passwordCorrect = (user === null) ? false : await bcrypt.compare( String(req.body.password), String(user.password)  );

	if( !user || !passwordCorrect ) {
		if(user && !passwordCorrect){
			return res.status(200).json({ok: "ok_to_signup",email:"just_email_match"});
		}
		else {
			return res.status(200).json({ok: "ok_to_signup"});
		}
		
	}
	else{
		return res.status(200).json({found: "not_ok_to_signup",user:user});
	}

	
	
};

exports.check_email_checked = async (req, res) => {
	const Op = Sequelize.Op;
	var user = await User.findOne( {
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
		console.log(user.gender=='Groupe')
		console.log(user.type_of_account.includes('Artiste'))
		if(user.email_checked){
			return res.status(200).json({user: user});
		}
		else if (user.gender=='Groupe' && user.type_of_account.includes('Artiste')){
			console.log( "in else if")
			user.email_checked=true;
			return res.status(200).json({user: user});
		}
		else{
			return res.status(200).json({error: "error"});
		}
		
	}

	
	
};


//for invited users
exports.encrypt_data= async(req,res)=>{
	console.log("encrypt_data")
	var passwordCorrect =false;
	var mailCorrect =false;
	
	for(let i=0;i<list_of_invited_mails.length;i++){
		if( String(req.body.mail)==list_of_invited_mails[i] && String(req.body.password)==list_of_invited_passwords[i]){

			mailCorrect= true;
			passwordCorrect = true;
		}
	
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
			User.findOne( { 
				where: { id : decoded.id} 
			} )
			.catch(err => {
				console.log(err);	
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
				res.send([user]);
			})
		}
	
	});
 
 };

 
 exports.getCurrentUser_and_cookies = async (req, res) => {
	let value = req.cookies;

	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			User.findOne( { 
				where: { id : decoded.id} 
			} )
			.catch(err => {
				console.log(err);	
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
				User_cookies.findOne({
					where:{
						id_user:decoded.id
					}
				}).catch(err => {
					console.log(err);	
					res.status(500).json({msg: "error", details: err});		
				}).then(cookies=>{
					res.send([{user:[user],cookies:cookies}]);
				})
				
			})
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
