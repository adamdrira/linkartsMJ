

module.exports = (sequelize, Sequelize) => {

	const User = sequelize.define('users', {
		//account_type: {type: Sequelize.INTEGER}, à ajouter
		type_of_account:{type: Sequelize.STRING},
		type_of_account_checked:{type: Sequelize.BOOLEAN},
		certified_account:{type: Sequelize.BOOLEAN},
		email: {type: Sequelize.STRING},
		email_about: {type: Sequelize.STRING},
		email_checked:{type: Sequelize.BOOLEAN},
		nickname: {type: Sequelize.STRING},
		firstname: {type: Sequelize.STRING},
		lastname: {type: Sequelize.STRING},
		gender: {type: Sequelize.STRING}, 
		location: {type: Sequelize.STRING},
		password: {type: Sequelize.STRING},
		profile_pic_file_name : {type: Sequelize.STRING},
		cover_pic_file_name :{type: Sequelize.STRING},
		primary_description:{type: Sequelize.STRING},
		primary_description_extended:{type: Sequelize.STRING(1000)},
		job:{type: Sequelize.STRING},
		training:{type: Sequelize.STRING}, 
		birthday:{type: Sequelize.STRING}, 
		id_admin:  {type: Sequelize.INTEGER},
		siret:{type:Sequelize.BIGINT},
		list_of_members:Sequelize.ARRAY(Sequelize.INTEGER),
		list_of_members_validations:Sequelize.ARRAY(Sequelize.INTEGER),
		number_of_comics: {type: Sequelize.INTEGER},
		number_of_drawings: {type: Sequelize.INTEGER},
		number_of_writings: {type: Sequelize.INTEGER}, // à supprimer
		number_of_ads: {type: Sequelize.INTEGER},
		number_of_likes: {type: Sequelize.INTEGER}, // à supprimer
		number_of_loves: {type: Sequelize.INTEGER},// à supprimer
		number_of_comments: {type: Sequelize.INTEGER},// à supprimer
		number_of_views: {type: Sequelize.INTEGER},// à supprimer
		subscribers_number: {type: Sequelize.INTEGER},
		subscribings_number: {type: Sequelize.INTEGER},
		subscribers:Sequelize.ARRAY(Sequelize.INTEGER),
		subscribings:Sequelize.ARRAY(Sequelize.INTEGER),
		status:{type: Sequelize.STRING},
		password_registration:{type: Sequelize.STRING},
		reason:{type: Sequelize.STRING},
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});


	const users_information_privacy = sequelize.define('users_information_privacy', {
		id_user:{type: Sequelize.INTEGER},
		primary_description_extended:{type: Sequelize.STRING},
		type_of_profile:{type: Sequelize.STRING},
		email_about: {type: Sequelize.STRING},
		birthday:{type: Sequelize.STRING}, 
		job:{type: Sequelize.STRING},
		training:{type: Sequelize.STRING},
		trendings_stats:{type: Sequelize.STRING},
		ads_stats:{type: Sequelize.STRING},
		comics_stats: {type: Sequelize.STRING},
		drawings_stats:{type: Sequelize.STRING}, 
		writings_stats:{type: Sequelize.STRING},
		profile_stats:{type: Sequelize.STRING},

	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});

	const users_mailing = sequelize.define('users_mailing', {
		id_user:{type: Sequelize.INTEGER},
		agreement:{type: Sequelize.BOOLEAN},
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});


	const users_strikes = sequelize.define('users_strikes', {
		id_user:{type: Sequelize.INTEGER},
		number_of_strikes:{type: Sequelize.INTEGER},
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});


	const users_cookies = sequelize.define('users_cookies', {
		id_user:{type: Sequelize.INTEGER},
		agreement:{type: Sequelize.BOOLEAN},
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

	const User_passwords = sequelize.define('users_passwords', {
		id_user: {type: Sequelize.INTEGER},
		iv: {type: Sequelize.STRING},
		content: {type: Sequelize.STRING},
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

	const User_groups_managment = sequelize.define('users_groups_managment', {
		//account_type: {type: Sequelize.INTEGER}, à ajouter
		id_group:{type: Sequelize.INTEGER},
		id_user:{type: Sequelize.INTEGER},
		share:{type: Sequelize.STRING},
		status:{type: Sequelize.STRING}
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});


	return {User,User_links,User_blocked,reports,users_information_privacy,User_passwords,User_groups_managment,users_mailing,users_strikes,users_cookies};
}