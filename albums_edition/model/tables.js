const user = require('../../authentication/user.model');

exports.list_of_albums = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var albums = sequelize.define('list_of_albums', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        album_name:DataTypes.STRING,
        thumbnail_cover_drawing:DataTypes.INTEGER,
        album_category:DataTypes.STRING,
        album_content:DataTypes.JSON,
        status:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

 

  

User.hasMany(albums, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

albums.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

 return {albums};
}

