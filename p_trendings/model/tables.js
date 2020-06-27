

exports.table_profile_notation = (sequelize, DataTypes) => {

    var trendings_comics = sequelize.define('trendings_comics', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        trendings:DataTypes.JSON,
        date:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var trendings_drawings = sequelize.define('trendings_drawings', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      trendings:DataTypes.JSON,
      date:DataTypes.STRING,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

  var trendings_writings = sequelize.define('trendings_writings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trendings:DataTypes.JSON,
    date:DataTypes.STRING,
  },
  {
    freezeTableName: true // Model tableName will be the same as the model name
  }
)


 return {trendings_comics,trendings_drawings,trendings_writings};
}

