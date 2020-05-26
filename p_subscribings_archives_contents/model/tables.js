const user = require('../../authentication/user.model');

exports.list_of_subscribings = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes);

    var subscribings = sequelize.define('list_of_subscribings', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        id_user_subscribed_to:DataTypes.INTEGER,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var contents = sequelize.define('list_of_contents', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_user: DataTypes.INTEGER,
      publication_category: DataTypes.STRING,
      format: DataTypes.STRING,
      publication_id: DataTypes.INTEGER,
      chapter_number: DataTypes.INTEGER,
      status:DataTypes.STRING,
      emphasize:DataTypes.STRING,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
    )

    var archives = sequelize.define('list_of_archives', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_archiver: DataTypes.INTEGER,
      publication_category: DataTypes.STRING,
      format: DataTypes.STRING,
      publication_id: DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }

  )

 

  

User.hasMany(subscribings, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

subscribings.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

User.hasMany(contents, {
  foreignKey: 'id_user',
  as: 'contents',  
  onDelete: 'CASCADE',
});

contents.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'contents',  
  onDelete: 'CASCADE',
});

archives.hasMany(contents, {
  foreignKey: 'id_user',
  as: 'archives',  
  onDelete: 'CASCADE',
});

contents.belongsTo(archives, {
  foreignKey: 'id_user',
  as: 'archives',  
  onDelete: 'CASCADE',
});


 return {subscribings, contents,archives};
}

