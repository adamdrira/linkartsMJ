

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

	const User_blocked = sequelize.define('users_blocked', {
		id_user: {type: Sequelize.INTEGER},
		id_user_blocked: {type: Sequelize.INTEGER},
		date:{type: Sequelize.DATE},
		},
		{
			freezeTableName: true, // Model tableName will be the same as the model name,
			//timestamps: false,
	});

	const reports = sequelize.define('reports', {
		id_user: {type: Sequelize.INTEGER},
		id_receiver: {type: Sequelize.INTEGER},
		type_of_report: {type: Sequelize.STRING},
		publication_category: {type: Sequelize.STRING},
		publication_id: {type: Sequelize.INTEGER},
		format: {type: Sequelize.STRING},
		message: {type: Sequelize.STRING(2000)},
		chapter_number: {type: Sequelize.INTEGER},
        attachment_name_one:{type: Sequelize.STRING},
        attachment_name_two:{type: Sequelize.STRING},
        attachment_name_three:{type: Sequelize.STRING},
        attachment_name_four:{type: Sequelize.STRING},
        attachment_name_five:{type: Sequelize.STRING},
		},
		{
			freezeTableName: true, // Model tableName will be the same as the model name,
			//timestamps: false,
	});


	return {User,User_links,User_blocked,reports};
}