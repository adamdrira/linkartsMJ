const user = require('../../authentication/user.model');

exports.list_of_ads = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var ads = sequelize.define('list_of_ads', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        title:DataTypes.STRING,
        description:DataTypes.STRING(2000),
        type_of_project:DataTypes.STRING,
        my_description:DataTypes.STRING,
        location:DataTypes.STRING,
        target_one:DataTypes.STRING,
        target_two:DataTypes.STRING,
        thumbnail_name:DataTypes.STRING,
        number_of_attachments: DataTypes.INTEGER,
        attachment_real_name_one:DataTypes.STRING,
        attachment_name_one:DataTypes.STRING,
        attachment_real_name_two:DataTypes.STRING,
        attachment_name_two:DataTypes.STRING,
        attachment_real_name_three:DataTypes.STRING,
        attachment_name_three:DataTypes.STRING,
        attachment_real_name_four:DataTypes.STRING,
        attachment_name_four:DataTypes.STRING,
        attachment_real_name_five:DataTypes.STRING,
        attachment_name_five:DataTypes.STRING,
        refreshment_number:DataTypes.INTEGER,
        number_of_responses:DataTypes.INTEGER,
        remuneration:DataTypes.BOOLEAN,
        price_value:DataTypes.STRING,
        status:DataTypes.STRING,
        date:DataTypes.DATE,
        commentariesnumber: DataTypes.INTEGER,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var ads_responses = sequelize.define('list_of_ads_responses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_ad:DataTypes.INTEGER,
      id_user: DataTypes.INTEGER,
      description:DataTypes.STRING(2000),
      number_of_attachments: DataTypes.INTEGER,
      attachment_real_name_one:DataTypes.STRING,
      attachment_name_one:DataTypes.STRING,
      attachment_real_name_two:DataTypes.STRING,
      attachment_name_two:DataTypes.STRING,
      attachment_real_name_three:DataTypes.STRING,
      attachment_name_three:DataTypes.STRING,
      attachment_real_name_four:DataTypes.STRING,
      attachment_name_four:DataTypes.STRING,
      attachment_real_name_five:DataTypes.STRING,
      attachment_name_five:DataTypes.STRING,
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

ads.hasMany(ads_responses, {
  foreignKey: 'id_ad',
  as: 'responses',  
  onDelete: 'CASCADE',
});

ads_responses.belongsTo(ads, {
  foreignKey: 'id_ad',
  as: 'responses',  
  onDelete: 'CASCADE',
});

 return {ads,ads_responses};
}

