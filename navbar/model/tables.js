const user = require('../../authentication/user.model');

exports.list_of_researches = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;
  

var list_of_navbar_researches= sequelize.define('list_of_navbar_researches', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  publication_category: DataTypes.STRING,
  format: DataTypes.STRING,
  target_id: DataTypes.INTEGER,
  research_string:DataTypes.STRING,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)



User.hasMany(list_of_navbar_researches, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

list_of_navbar_researches.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});


 return {list_of_navbar_researches};
}

