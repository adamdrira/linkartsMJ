const user = require('../../authentication/user.model');

exports.list_of_notifications = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var notifications = sequelize.define('list_of_notifications', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        id_user_name: DataTypes.STRING,
        id_receiver:DataTypes.INTEGER,
        type:DataTypes.STRING,
        publication_category: DataTypes.STRING,
        publication_name: DataTypes.STRING,
        format: DataTypes.STRING,
        publication_id: DataTypes.INTEGER,
        chapter_number: DataTypes.INTEGER,
        status:DataTypes.STRING,
        is_comment_answer:DataTypes.BOOLEAN,
        comment_id: DataTypes.INTEGER,
        information:DataTypes.STRING(2000),
        },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var notifications_spams = sequelize.define('list_of_notifications_spams', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_user: DataTypes.INTEGER,
      id_spam: DataTypes.STRING,
      type:DataTypes.INTEGER,
      is_a_group_chat:DataTypes.BOOLEAN,
      },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )



 

  

User.hasMany(notifications, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

notifications.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});


 return {notifications,notifications_spams};
}

