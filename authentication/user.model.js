

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
		primary_description_extended:{type: Sequelize.STRING(1000)},
		job:{type: Sequelize.STRING},
		training:{type: Sequelize.STRING}, 
		birthday:{type: Sequelize.STRING}, 
		number_of_comics: {type: Sequelize.INTEGER},
		number_of_drawings: {type: Sequelize.INTEGER},
		number_of_writings: {type: Sequelize.INTEGER}, // à supprimer
		number_of_ads: {type: Sequelize.INTEGER},
		likesnumber: {type: Sequelize.INTEGER}, // à supprimer
		lovesnumber: {type: Sequelize.INTEGER},// à supprimer
		subscribers_number: {type: Sequelize.INTEGER},
		subscribings_number: {type: Sequelize.INTEGER},
		subscribers:Sequelize.ARRAY(Sequelize.INTEGER),
		subscribings:Sequelize.ARRAY(Sequelize.INTEGER),
		status:{type: Sequelize.STRING}
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});

	const User_links = sequelize.define('users_links', {
		id_user: {type: Sequelize.INTEGER},
		link_title: {type: Sequelize.STRING},
		link: {type: Sequelize.STRING},
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});

	return {User,User_links};
}