

module.exports = (sequelize, Sequelize) => {

	const User = sequelize.define('users', {
		email: {
		type: Sequelize.STRING
		},
		nickname: {
		type: Sequelize.STRING
		},
		firstname: {
		type: Sequelize.STRING
		},
		lastname: {
		type: Sequelize.STRING
		},
		gender: {
		type: Sequelize.CHAR
		},
		location: {
		type: Sequelize.STRING
		},
		password: {
		type: Sequelize.STRING
		},
		profile_pic_file_name : {type: Sequelize.STRING},
		cover_pic_file_name :{type: Sequelize.STRING},
		primary_description:{type: Sequelize.STRING},
		job:{type: Sequelize.STRING},
		training:{type: Sequelize.STRING},
		bds_oneshot_number: {type: Sequelize.INTEGER},
		bds_series_number: {type: Sequelize.INTEGER},
		drawings_onepage_number: {type: Sequelize.INTEGER},
		drawings_artbook_number: {type: Sequelize.INTEGER},
		writings_onepage_number: {type: Sequelize.INTEGER},
		writings_novel_number: {type: Sequelize.INTEGER},
		likesnumber: {type: Sequelize.INTEGER},
		lovesnumber: {type: Sequelize.INTEGER},
		subscribers_number: {type: Sequelize.INTEGER},
		subscribtions_number: {type: Sequelize.INTEGER},
		
	},
	{
		freezeTableName: true, // Model tableName will be the same as the model name,
		//timestamps: false,
	});

	return User;
}