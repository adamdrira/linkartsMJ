const user = require('../../authentication/user.model');

exports.list_of_ads = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes);

    var ads = sequelize.define('list_of_ads', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        title:DataTypes.STRING,
        description:DataTypes.STRING(1001),
        type_of_project:DataTypes.STRING,
        my_description:DataTypes.STRING,
        target_one:DataTypes.STRING,
        target_two:DataTypes.STRING,
        thumbnail_name:DataTypes.STRING,
        number_of_pictures: DataTypes.INTEGER,
        picture_name_one:DataTypes.STRING,
        picture_name_two:DataTypes.STRING,
        picture_name_three:DataTypes.STRING,
        picture_name_four:DataTypes.STRING,
        picture_name_five:DataTypes.STRING,
        number_of_attachments: DataTypes.INTEGER,
        attachment_name_one:DataTypes.STRING,
        attachment_name_two:DataTypes.STRING,
        attachment_name_three:DataTypes.STRING,
        attachment_name_four:DataTypes.STRING,
        attachment_name_five:DataTypes.STRING,
        status:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

 

  

User.hasMany(ads, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

ads.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

 return {ads};
}

