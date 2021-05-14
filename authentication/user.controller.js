const db = require('./db.config.js');
const User = db.users;

const User_passwords = db.user_passwords;
const User_cookies = db.users_cookies;
const User_links = db.user_links;
const users_mailing = db.users_mailing;
const users_information_privacy = db.users_information_privacy;
const users_groups_managment = db.user_groups_managment; //att
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";
const Sequelize = require('sequelize');
let list_of_invited_mails=["adam.drira","mokhtar.meghaichi","Samar_Kanoun","nacima.connaissance","invitation"]
let list_of_invited_passwords=["Adam_@d@m_4d4m_1996","Mokhtar_m°kht@r_m0kht4r_1996","SaM4r_Sam0urti^","Nacim4_The_B3st","invitation"]
const chat_seq = require('../chat/model/sequelize');
const List_of_subscribings = require('../p_subscribings_archives_contents/model/sequelize').list_of_subscribings;
const albums_seq = require('../albums_edition/model/sequelize');
const crypto = require('crypto');
var nodemailer = require('nodemailer');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdJBL1lwHzfr3';
var geoip = require('geoip-lite');
const List_of_notifications= require('../notifications/model/sequelize').list_of_notifications;




// Post a User
exports.create = (req, res) => {
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

	if(req.body.gender=="Groupe" && req.body.type_of_account.includes("Artiste")){
		start_creation(0);
	}
	else{
		User.findOne({
			where:{
				[Op.or]:[{email:{[Op.iLike]: req.body.email}},{nickname:req.body.nickname}],
				
			}
		}).then(user=>{
			if(user){
				res.status(200).json([{error: "similar user found"}])
			}
			else{
				start_creation(1); //att
			}
		})
	
	}
	
	function start_creation(indice){
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
					res.status(500).json({msg: "error registering the user", details: err});		
				}).then( r=>{
					User_passwords.create({
						"id_user":r.id,
						"iv":password.iv,
						"content":password.content,
					})
					if(indice==0){
						let list_of_members_validations=[req.body.id_admin];
						User.update({
							"list_of_members_validations":list_of_members_validations
						},{
							where: {
							id:r.id,
							}
						});
						
						let id_group=r.id;
						let list_of_ids=req.body.list_of_members;
						let share =(100/list_of_ids.length).toFixed(2);
						for( let i=0;i<list_of_ids.length;i++){
							users_groups_managment.create({
								"id_group":id_group,
								"id_user":list_of_ids[i],
								"share":share,
								"status":(list_of_ids[i]==req.body.id_admin)?"validated":null,
							})
						}
					}
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
							
						res.status(500).json({msg: "error", details: err});		
					})
				).then(
					albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"one-shot",
						"album_category":"comics",
						"status":"standard"
					}).catch(err => {
							
						res.status(500).json({msg: "error", details: err});		
					})
				)
				.then(()=>{albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"serie",
						"album_category":"comics",
						"status":"standard"
					}).catch(err => {
							
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"artbook",
							"album_category":"drawings",
							"status":"standard"
					}).catch(err => {
							
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"one-shot",
							"album_category":"drawings",
							"status":"standard"
					}).catch(err => {
							
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{albums_seq.list_of_albums.create({
							"id_user": r.id,
							"album_name":"all",
							"album_category":"writings",
							"status":"standard"
					}).catch(err => {
							
						res.status(500).json({msg: "error", details: err});		
					})
				})
				.then(()=>{
					List_of_notifications.create({
						"type":"welcome",
						"id_user":1,
                        "id_receiver":r.id,
                        "status":"unchecked"
					}).catch(err => {
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
											
										res.status(500).json({msg: "error", details: err});		
									}).then(
										List_of_subscribings.create({
											"status":"public",
											"id_user":  r.id,
											"id_user_subscribed_to":first_user[0].id,
										})
										).catch(err => {
												
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
    var user
    jwt.verify(token, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{		
      user=decoded.id;
    });
    return user;
  };
  


//decrypt password
exports.decrypt_password = (req, res) => {
	
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
	let id_user= req.body.id;

	User_passwords.findAll({
		where: {
			id_user: id_user,
		},
		limit:1,
		order: [
			['createdAt', 'DESC']
		],
	}).catch(err => {
				
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
	let email=req.body.email;
	const Op = Sequelize.Op;
	User.findOne({
		where:{
			email:{[Op.iLike]: email},
		}
	}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user_found=>{
		if(user_found){
			let password_registration=generate_random_id(user_found.id);
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

				


				let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
				mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
					mail_to_send+=`
					<table style="width:100%;margin-bottom:20px">

						<tr id="tr2" >
							<td  align="center" style="background: rgb(2, 18, 54)">
								<p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
								<div style="height:1px;width:20px;background:white;"></div>
								<p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Récupération de mot de passe</p>
							</td>
						</tr>
					</table>`;

					let name = user_found.firstname + ' ' + user_found.lastname;
					if(!user_found.lastname || user_found.lastname==''){
						name=user_found.firstname
					  }
					let start=''
					if(user_found.gender=="Homme"){
					start=`Cher ${name},`
					}
					else if(user_found.gender=="Femme"){
					start=`Chère ${name},</p>`
					}
					else if(user_found.gender=="Groupe"){
					start=`Chers membres du groupe ${name},`
					}

					mail_to_send+=`
					<table style="width:100%;margin:25px auto;">
					<tr id="tr3">

						<td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
							<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
							<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Votre nouveau mot de de passe temporaire est le suivant : <b> ${pass}</b></p>
							<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Pour accéder à votre compte et réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous : </p>

							<div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
								<a href="https://www.linkarts.fr/account/${user_found.nickname}/${user_found.id}/my_account/${password_registration}" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
								Réinitialiser mon mot de passe
								</a>
							</div>

							<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                          <p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
							<img src="https://www.linkarts.fr/assets/img/logo_long_1.png"  height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
						</td>

					</tr>
					</table>`

					mail_to_send+=`
					<table style="width:100%;margin:25px auto;">
						<tr id="tr4">
							<td align="center">
								<p style="margin: 10px auto 0px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts © 2021</p>
								<p style="margin: 10px auto 5px auto;font-size: 13px;color: rgb(32,56,100);max-width: 350px;">LinkArts est un site dédié à la collaboration éditoriale et à la promotion des artistes et des éditeurs.</p>
							</td>

						</tr>
					</table>`

				mail_to_send+='</div>'
				mail_to_send+='</div>'

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
					to: user_found.email, // my mail
					//to:"appaloosa-adam@hotmail.fr",
					subject: `Récupération du mot de passe`, 
					html:mail_to_send, 
				};
				transport.sendMail(mailOptions, (error, info) => {
					if (error) {
						res.status(200).send([{error:error}])
					} else {
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
					
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
				if(user.length>0){
					const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(user[0].iv, 'hex'));
					const decrypted = Buffer.concat([decipher.update(Buffer.from(user[0].content, 'hex')), decipher.final()]);
					let pass = decrypted.toString()
					
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
	let id_user= req.body.id;
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
		User.update({
			"password":passwordhash},
			{where:{
				id:id_user,
			}
			
		}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
			User_passwords.create({
				"id_user":id_user,
				"iv":password_hash.iv,
				"content":password_hash.content,
			}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(pass=>{
				res.status(200).json([pass])
			})
		})
	})
};


//modify password
exports.edit_email = (req, res) => {
	
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
	let id_user= get_current_user(req.cookies.currentUser);
	User.update({
		"email":req.body.email},
		{where:{
			id:id_user,
		}
		
	}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(user=>{
			res.status(200).json([user])
		
	})
};
// Post a add_link
exports.add_link = (req, res) => {
	
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
		User_links.create({
			"id_user": req.body.id_user,
			"link_title": req.body.link_title,
			"link": req.body.link, 
		}).catch(err => {
				
			res.status(200).json({msg: "error registering the user", details: err});		
		}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(link=>{
			res.status(200).json([{msg: "creation ok"}])
		});
	

};


// Post a User
exports.remove_link = (req, res) => {
	
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

		User_links.destroy({
			where:{
				id_user: req.body.id_user,
				link_title: req.body.link_title,
				link: req.body.link, 
			}
		  },{truncate:false})
		  .catch(err => {
				
			res.status(200).json({msg: "error registering the user", details: err});		
		}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(
			res.status(200).json([{msg: "deletion ok"}])
		);
	

};



exports.check_pseudo=(req,res)=>{
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
	let pseudo = req.body.pseudo;
	const Op = Sequelize.Op;
	User.findAll({
		where:{
			status:"account",
			nickname:pseudo,
		}
	}).catch(err => {
				
			res.status(500).json({msg: "error", details: err});		
		}).then(pseudos=>{
		if(pseudos.length==0){
			res.status(200).send([{msg: "ok"}]);		
		}
		else{
			res.status(200).send([{msg: "found"}]);	
		}
	})
}


exports.check_email=(req,res)=>{
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
					
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
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
					
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
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
		User.create({
			"nickname":"visitor",
			"status":"visitor",
		}).catch(err => {
				
			res.status(200).json({msg: "error registering the visitor", details: err});		
		}).then(user=>{
			const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
			return res.status(200).json( { token:token } );
		})
};

exports.login = async (req, res) => {
	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}
	else {
			let val=req.headers['authorization'].replace(/^Bearer\s/, '');
			let user= get_current_user(val);
			if(!user){
					return res.status(401).json({msg: "error"});
			}
	}
	const Op = Sequelize.Op;
	let ip;
	/*if( req.rawHeaders && req.rawHeaders[1]){
			ip=req.rawHeaders[1]
	}*/

	const users = await User.findAll( {
		where: { 
		   [Op.or]:[{status:"account"},{status:"suspended"}],
		   email:{[Op.iLike]: req.body.mail_or_username},
		   } 
	   });

	let user;
	let indice_found=-1;
	if(users.length==0){
		return res.status(200).json({msg: "error"});
	}
	else{
		
		for (let i=0;i<users.length;i++){
			let user_found=users[i];
			let passwordCorrect = (user_found === null) ? false : await bcrypt.compare( String(req.body.password), String(user_found.password)  );
			if(passwordCorrect){
				indice_found=i;
				user=user_found;
			}
		}
	}
	if(indice_found<0){
		return res.status(200).json({msg: "error"});
	}
	else{
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
			var geo;
			
			if(ip && !ip.includes("linkarts")){
					geo = geoip.lookup(ip);
			}
			else{
					ip=null;
			}
			let now = new Date();
			let connexion_time = now.toString();
			db.users_connexions.create({
					"id_user":user.id,
					"connexion_time":connexion_time,
					"status":"usual",
					"nickname":user.nickname,
					"ip":ip?ip:null,
			})

			db.users_ips.findOne({where:{
					id_user:user.id
			}}).then(user_ips=>{
					if(user_ips){
							if(ip && user_ips.list_of_ips.indexOf(ip)<0){
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
									list_of_latitudes.push(geo.ll[0].toString());
									list_of_longitudes.push(geo.ll[1].toString());
									list_of_areas.push(geo.area.toString());
									list_of_countries.push(geo.country);
									list_of_regions.push(geo.region);
									db.users_ips.update({
											"list_of_ips":list_of_ips,
											"list_of_latitudes":list_of_latitudes,
											"list_of_longitudes":list_of_longitudes,
											"list_of_areas":list_of_areas,
											"list_of_countries":list_of_countries,
											"list_of_regions":list_of_regions,
									},{where:{
											id_user:user.id,
									}});

								
									if(distance>100){

										let mail_to_send='<div background-color: #f3f2ef;font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica Neue,sans-serif;">';
										mail_to_send+=`<div style="max-width:550px;margin: 20px auto 0px auto;background:white;border-radius:10px;padding-bottom: 5px;">`;
											mail_to_send+=`
											<table style="width:100%;margin-bottom:20px">


												<tr id="tr2" >
													<td  align="center" style="background: rgb(2, 18, 54)">
														<p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:16px;">LinkArts</p>
														<div style="height:1px;width:20px;background:white;"></div>
														<p style="color:white;font-weight:600;margin-top:10px;margin-bottom:14px;font-size:17px;">Fraude potentielle !</p>
													</td>
												</tr>
											</table>`;

											let name = user.firstname + ' ' + user.lastname;
											if(!user.lastname || user.lastname==''){
												name=user.firstname
											  }
											let start=''
											if(user.gender=="Homme"){
											start=`Cher ${name},`
											}
											else if(user.gender=="Femme"){
											start=`Chère ${name},</p>`
											}
											else if(user.gender=="Groupe"){
											start=`Chers membres du groupe ${name},`
											}

											mail_to_send+=`
											<table style="width:100%;margin:25px auto;">
											<tr id="tr3">

												<td align="center" style="border-radius: 6px 6px 12px 12px;padding: 20px 20px 26px 20px;background:rgb(240, 240, 240);border-top:3px solid rgb(225, 225, 225);">
													<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">${start}</p>
													<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Une connexion à votre compte a été réalisée à un endroit inhabituel.</p>`

													mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Voici les informations disponibles sur cette localisation : </p>
													<ul style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">pays : ${geo.country}</li>
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">région : ${geo.region}</li>
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">ville : ${geo.city}</li>
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">latitude : ${geo.ll[0]}</li>
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">longitude: ${geo.ll[1]}</li>
															<li style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 5px;">fuseau horaire : ${geo.timezone}</li>
													</ul>`

													mail_to_send+= `<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 5px;margin-bottom: 15px;">Nous vous conseillons dans un premier temps de vérifier que votre adresse IP publique n'est pas localisée à cet endroit inhabituel.</br></br> Si ce n'est pas le cas et que vous n'êtes pas le responsable de cette connexion, nous vous conseillons de tenter de changer votre mot de passe : </p>

													<div style="margin-top:50px;margin-bottom:35px;-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 5px;">
														<a href="https://www.linkarts.fr/account/${user.nickname}/my_account" style="color: white ;text-decoration: none;font-size: 16px;margin: 15px auto 15px auto;box-shadow:0px 0px 0px 2px rgb(32,56,100);-webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px;padding: 10px 20px 12px 20px;font-weight: 600;background: rgb(2, 18, 54)">
															Accèder à mon compte
														</a>
													</div>`
													  
													
								
											mail_to_send+=`
											<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 15px;">Si celà n'est pas possible, nous sommes dans le regret de vous inviter à crééer un nouveau compte et à nous répondre à cet e-mail pour avoir plus d'informations sur ce sujet.</br></br> Si par contre, vous êtes bien le responsable de cette connexion, il n'y a pas de crainte à avoir.</p>
											<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-top: 50px;margin-bottom: 0px;">Très sincèrement,</p>
                         					<p style="text-align: left;color: #6d6d6d;font-size: 14px;font-weight: 600;margin-bottom: 15px;margin-top: 0px;">L'équipe LinkArts</p>
													  <img src="https://www.linkarts.fr/assets/img/logo_long_1.png" height="40" style="height:40px;max-height: 40px;float: left;margin-left:2px" />
												  </td>
								
											  </tr>
											</table>`

											
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
												html:  mail_to_send, 

										};

										transport.sendMail(mailOptions, (error, info) => {
												if (error) {
														const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } )
														return res.status(200).json( { token:token,user:user } );
												} else {
														const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } )
														return res.status(200).json( { token:token,user:user } );
												}


										})
								}
								else{
										const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } )
										return res.status(200).json( { token:token,user:user } );
								}


						}
						else{
								const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } )
								return res.status(200).json( { token:token,user:user } );
						}
				}
				else{
					db.users_ips.create({
							"id_user":user.id,
							"list_of_ips":ip?[ip]:null,
							"list_of_latitudes":ip?[geo.ll[0]]:null,
							"list_of_longitudes":ip?[geo.ll[1]]:null,
							"list_of_areas":ip?[geo.area]:null,
							"list_of_countries":ip?[geo.country]:null,
							"list_of_regions":ip?[geo.region]:null,
					});
					const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
					return res.status(200).json( { token:token,user:user } );
				}
			})

			function calcCrow(lat1, lon1, lat2, lon2) {
					var R = 6371; 
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


exports.login_group_as_member = async (req, res) => {
	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}
	else {
			let val=req.headers['authorization'].replace(/^Bearer\s/, '');
			let user= get_current_user(val);
			if(!user){
					return res.status(401).json({msg: "error"});
			}
	}
	const Op = Sequelize.Op;
	const id_group= req.body.id_group;
	User.findOne( {
		where: { 
		   [Op.or]:[{status:"account"},{status:"suspended"}],
		   id:req.body.id_group,
		   } 
	}).catch(err => {
		res.status(500).json({msg: "error", details: err});		
	}).then(group=>{
		if(group){
			let list_of_members=group.list_of_members;
			if(list_of_members.indexOf(req.body.id_user)>=0){
				let now = new Date();
				let connexion_time = now.toString();
				db.users_connexions.create({
						"id_user":id_group,
						"connexion_time":connexion_time,
						"status":"switch_to_group",
						"nickname":group.nickname,
						"ip":null,
				})

				const token = jwt.sign( {nickname: group.nickname, id: group.id}, SECRET_TOKEN, {expiresIn: 30 } )
				return res.status(200).json( { token:token,user:group } );
			}
			else{
				res.status(200).json({msg: "error", details: "not allowed"});	
			}
		}
	})
};

exports.logout = (req,res) =>{
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
	let value = req.cookies;
	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			let now = new Date();
			let deconnexion_time = now.toString();
			db.users_connexions.update(
				{
				"deconnexion_time":deconnexion_time
			  },{
				where:{
				  id_user:decoded.id,
				  status:"usual",
				}
			  }).then(dec=>{
				return res.status(200).json( { deconnexion:"ok" } );
			})
		}
	})

	
}

exports.check_email_and_password = async (req, res) => {
	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}
	else {
			let val=req.headers['authorization'].replace(/^Bearer\s/, '');
			let user= get_current_user(val);
			if(!user){
					return res.status(401).json({msg: "error"});
			}
	}
	const Op = Sequelize.Op;
	const users = await User.findAll( {
		where: { 
			[Op.or]:[{status:"account"},{status:"suspended"}],
			email:{[Op.iLike]: req.body.email},
			} 
		});

	let user;
	let indice_found=-1;
	if(users.length==0){
		return res.status(200).json({ok: "ok_to_signup"});
	}
	else{
		for (let i=0;i<users.length;i++){
			let user_found=users[i];
			let passwordCorrect = (user_found === null) ? false : await bcrypt.compare( String(req.body.password), String(user_found.password)  );
			if(passwordCorrect){
				indice_found=i;
				user=user_found;
			}
		}
	}


	if( indice_found<0) {
		return res.status(200).json({ok: "ok_to_signup",email:"just_email_match"});
	}
	else{
		return res.status(200).json({found: "not_ok_to_signup",user:user});
	}

	
	
};

exports.check_email_checked = async (req, res) => {
	
	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}
	else {
			let val=req.headers['authorization'].replace(/^Bearer\s/, '');
			let user= get_current_user(val);
			if(!user){
					return res.status(401).json({msg: "error"});
			}
	}
	const Op = Sequelize.Op;
	const users = await User.findAll( {
		where: { 
			[Op.or]:[{status:"account"},{status:"suspended"}],
			email:{[Op.iLike]: req.body.mail_or_username},
			} 
		});

	let user;
	let indice_found=-1;
	if(users.length==0){
		return res.status(200).json({ok: "ok_to_signup"});
	}
	else{
		for (let i=0;i<users.length;i++){
			let user_found=users[i];
			let passwordCorrect = (user_found === null) ? false : await bcrypt.compare( String(req.body.password), String(user_found.password)  );
			if(passwordCorrect){
				indice_found=i;
				user=user_found;
			}
		}
	}


	let now_in_seconds = Math.trunc( new Date().getTime()/1000);
	function get_date(now,uploaded_date){
		let date = Math.trunc(new Date(uploaded_date + ' GMT').getTime()/1000);
		let s= now - date
		return (Math.trunc(s/604800))
	}



	if( indice_found<0) {
		return res.status(200).json({msg: "error"});
	}
	else{
		let s = get_date(now_in_seconds,user.createdAt);
		if(user.email_checked){
			return res.status(200).json({user: user});
		}
		else if (user.gender=='Groupe' && user.type_of_account.includes('Artiste')){
			user.email_checked=true;
			return res.status(200).json({user: user});
		}
		else if(s<1){
			return res.status(200).json({user: user,pass:true});
		}
		else {
			return res.status(200).json({error: "error"});
		}
		
	}

	
	
};


//for invited users
exports.encrypt_data= async(req,res)=>{
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
	jwt.verify(req.cookies.inviteduser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			res.status(200).send([{"msg": "TOKEN_UNKNOWN"}])
		}
		else{
			let invited_user_found=false;
			for(let i=0;i<list_of_invited_mails.length;i++){
				if(decoded.mail==list_of_invited_mails[i] && decoded.password==list_of_invited_passwords[i]){
					invited_user_found=true;
				}
			}
			if (!invited_user_found) {
				res.status(200).send([{"msg": "TOKEN_UNKNOWN"}]);
			}

			else if (decoded.exp < new Date().getTime()/1000) {
				const refreshed_token = jwt.sign( {mail: decoded.mail, password: decoded.password}, SECRET_TOKEN, {expiresIn: 60*15  });
				return res.status(200).json( { msg: "TOKEN_REFRESH", token: refreshed_token} );
			}
			else {
				return res.status(200).json( { msg: "TOKEN_OK"} );
		}
		}
		
	});
	
}

// to have current user's identifications
exports.getCurrentUser = async (req, res) => {
	let value='';
	if( !req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
		}
		else {
		value=req.headers['authorization'].replace(/^Bearer\s/, '');
		let user= get_current_user(value);
		if(!user){
			return res.status(401).json({msg: "error"});
		}
	};
	jwt.verify(value, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			User.findOne( { 
				where: { id : decoded.id} 
			} )
			.catch(err => {
					
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
				res.send([user]);
			})
		}
	
	});
 
 };

 
 exports.getCurrentUser_and_cookies = async (req, res) => {
	let value = req.cookies;

	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
		}
		else {
		let val=req.headers['authorization'].replace(/^Bearer\s/, '');
		let user= get_current_user(val);
		if(!user){
			return res.status(401).json({msg: "error"});
		}
	};
	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err){
			return res.status(200).json({msg: "error"});
		}
		else{
			User.findOne( { 
				where: { id : decoded.id} 
			} )
			.catch(err => {
					
				res.status(500).json({msg: "error", details: err});		
			}).then(user=>{
				User_cookies.findOne({
					where:{
						id_user:decoded.id
					}
				}).catch(err => {
						
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

	jwt.verify(req.cookies.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{
		if(err || (decoded && decoded.id==80)){
			User.create({
				"nickname":"visitor",
				"status":"visitor",
			}).catch(err => {
					
				res.status(500).json({msg: "error registering the visitor", details: err});		
			}).then(user=>{
				const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30  } );
				return res.status(200).json( { "token":token,"status":"visitor" } );
			})
		}
		else{
			const user = await User.findOne( { where: { id : decoded.id} } );
			if (user === null) {
				res.status(200).send([{"msg": "TOKEN_UNKNOWN"}]);
			}
	
			else if (err) {
				return res.status(401).json({msg: "TOKEN_ERROR"});
			}
			else if (decoded.exp < new Date().getTime()/1000) {
				const refreshed_token = jwt.sign( {nickname: decoded.nickname, id: decoded.id}, SECRET_TOKEN, {expiresIn: 60*15 });
				return res.status(200).json( { msg: "TOKEN_REFRESH", token: refreshed_token,"status": user.status} );
			}
			else if (!err) {
				return res.status(200).json( { msg: "TOKEN_OK","status": user.status } );
		}
		}
		
	});
	
	

};


