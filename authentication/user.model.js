

module.exports = (sequelize, Sequelize) => {

	const User = sequelize.define('users', {
		//account_type: {type: Sequelize.INTEGER}, à ajouter
		email: {type: Sequelize.STRING},
		nickname: {type: Sequelize.STRING},
		firstname: {type: Sequelize.STRING},
		lastname: {type: Sequelize.STRING},
		gender: {type: Sequelize.CHAR}, 
		location: {type: Sequelize.STRING},
		password: {type: Sequelize.STRING},
		profile_pic_file_name : {type: Sequelize.STRING},
		cover_pic_file_name :{type: Sequelize.STRING},
		primary_description:{type: Sequelize.STRING},
		job:{type: Sequelize.STRING},// optionel
		training:{type: Sequelize.STRING}, // optionel
		bds_oneshot_number: {type: Sequelize.INTEGER},
		bds_series_number: {type: Sequelize.INTEGER},
		drawings_onepage_number: {type: Sequelize.INTEGER},
		drawings_artbook_number: {type: Sequelize.INTEGER},
		writings_onepage_number: {type: Sequelize.INTEGER}, // à supprimer
		//writings_number: {type: Sequelize.INTEGER}, à ajouter
		writings_novel_number: {type: Sequelize.INTEGER},  // à supprimer
		//ads_number: {type: Sequelize.INTEGER}, à ajouter
		likesnumber: {type: Sequelize.INTEGER}, // à supprimer
		lovesnumber: {type: Sequelize.INTEGER},// à supprimer
		subscribers_number: {type: Sequelize.INTEGER},
		subscribtions_number: {type: Sequelize.INTEGER},
		
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});

	return User;
}