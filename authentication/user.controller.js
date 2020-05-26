const db = require('./db.config.js');
const User = db.users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_TOKEN = "(çà(_ueçe'zpuer$^r^$('^$ùepzçufopzuçro'ç";




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
			"bds_oneshot_number": 0,
			"bds_series_number": 0,
			"drawings_onepage_number": 0,
			"drawings_artbook_number": 0,
			"writings_onepage_number": 0,
			"writings_novel_number": 0,
			"likesnumber": 0,
			"lovesnumber": 0,
			"subscribers_number": 0,
			"subscribtions_number": 0,
		}).catch(err => {
			console.log(err);	
			res.status(500).json({msg: "error registering the user", details: err});		
		}).then( r=>{
			const albums_seq = require('../albums_edition/model/sequelize');
			albums_seq.list_of_albums.create({
				"id_user": r.id,
				"album_name":"one-shot",
				"album_category":"comics",
				"status":"standard"
			}).then(
				albums_seq.list_of_albums.create({
					"id_user": r.id,
					"album_name":"serie",
					"album_category":"comics",
					"status":"standard"
				}).then(
					albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"artbook",
						"album_category":"drawings",
						"status":"standard"
					}).then(albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"one-shot",
						"album_category":"drawings",
						"status":"standard"
					}).then(albums_seq.list_of_albums.create({
						"id_user": r.id,
						"album_name":"all",
						"album_category":"writings",
						"status":"standard"
					}).then(res.status(200).json({msg: "creation ok"}))))
				)
			)			
			}
		)
		
		;
	});
	

};

exports.login = async (req, res) => {
	
	const user = await User.findOne( { where: { nickname : req.body.nickname} } );
	const passwordCorrect = (user === null) ? false : await bcrypt.compare( String(req.body.password), String(user.password)  );

	if( !user || !passwordCorrect ) {
		return res.status(401).json({msg: "error"});
	}


	
	const token = jwt.sign( {nickname: user.nickname, id: user.id}, SECRET_TOKEN, {expiresIn: 30 /*expires in 30 seconds*/ } );
	return res.status(200).json( { token:token } );
};

// to have current user's identifications
exports.getCurrentUser = async (req, res) => {
	let value = req.cookies;

	jwt.verify(value.currentUser, SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{

		const user = await User.findOne( { where: { id : decoded.id} } )
		.then(user=>{res.send([user]);})
		
	
	});
 
 };

 

//request : token.
exports.checkToken = async (req, res) => {

	console.log("checking : " + req.headers['authorization'] );

	if( ! req.headers['authorization'] ) {
		return res.status(401).json({msg: "error"});
	}

	jwt.verify(req.headers['authorization'].replace(/^Bearer\s/, ''), SECRET_TOKEN, {ignoreExpiration:true}, async (err, decoded)=>{

		const user = await User.findOne( { where: { id : decoded.id} } );
		if (user === null) {
			res.status(401).send([{"msg": "TOKEN_UNKNOWN"}]);
		}

		else if (err) {
			console.log(req.headers);
			return res.status(401).json({msg: "TOKEN_ERROR"});
		}
		else if (decoded.exp < new Date().getTime()/1000) {
			console.log(req.headers);
			const refreshed_token = jwt.sign( {nickname: decoded.nickname, id: decoded.id}, SECRET_TOKEN, {expiresIn: 60*15 /*expires in 15 minutes*/ });
			return res.status(200).json( { msg: "TOKEN_REFRESH", token: refreshed_token } );
		}
		else if (!err) {
			console.log(req.headers);
			return res.status(200).json( { msg: "TOKEN_OK" } );
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



