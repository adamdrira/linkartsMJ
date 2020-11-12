

exports.table_profile_notation = (sequelize, DataTypes) => {


  var favorites = sequelize.define('favorites', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: DataTypes.INTEGER,
    rank:DataTypes.INTEGER,
    remuneration:DataTypes.STRING,
    date:DataTypes.STRING,
    type_of_account:DataTypes.STRING,
    shares:DataTypes.JSON,

    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )




 return {favorites};
}

