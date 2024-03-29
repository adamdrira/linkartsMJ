const user = require('../../authentication/user.model');

exports.list_of_stories = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var stories = sequelize.define('list_of_stories', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        file_name: DataTypes.STRING,
        views_number: DataTypes.INTEGER,
        status:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var views = sequelize.define('list_of_stories_views', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      authorid: DataTypes.INTEGER,
      id_user_who_looks: DataTypes.INTEGER,
      id_story: DataTypes.INTEGER,
      status:DataTypes.STRING,
      view:DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
    )

 

  

User.hasMany(stories, {
  foreignKey: 'id_user',
  as: 'stories',  
  onDelete: 'CASCADE',
});

stories.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'stories',  
  onDelete: 'CASCADE',
});

User.hasMany(views, {
  foreignKey: 'authorid',
  as: 'users',  
  onDelete: 'CASCADE',
});

views.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'users',  
  onDelete: 'CASCADE',
});

stories.hasMany(views, {
  foreignKey: 'id_story',
  as: 'stories_views',  
  onDelete: 'CASCADE',
});

views.belongsTo(stories, {
  foreignKey: 'id_story',
  as: 'stories_views',  
  onDelete: 'CASCADE',
});


 return {stories, views};
}

