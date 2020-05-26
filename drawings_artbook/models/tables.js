const user = require('../../authentication/user.model');

exports.Drawings_Artbook_Tables = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes);

    var drawings = sequelize.define('liste_drawings_artbook', {
        drawing_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        authorid: DataTypes.INTEGER,
        title: DataTypes.STRING,
        category: DataTypes.STRING,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        pagesnumber: DataTypes.INTEGER,
        likesnumber: DataTypes.INTEGER,
        lovesnumber: DataTypes.INTEGER,
        viewnumber: DataTypes.INTEGER,
        commentarynumbers:DataTypes.INTEGER,
        highlight: DataTypes.STRING(500),
        average_lecture_time:DataTypes.INTEGER,
        name_coverpage: DataTypes.STRING,
        thumbnail_color:DataTypes.STRING,
        status: DataTypes.STRING,
        monetization: DataTypes.STRING,

      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var pages = sequelize.define('pages_drawings_artbook', {
      page_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      drawing_id: DataTypes.INTEGER,
      author_id:DataTypes.INTEGER,
      file_name: DataTypes.STRING,
      page_number: DataTypes.INTEGER,
      average_lecture_time:DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

  


drawings.hasMany(pages, {
  foreignKey: 'drawing_id',
  as: 'drawingpages',  // on récupère les pages d'une instance de bd avec un getter : getPages()  
  onDelete: 'CASCADE',
});

pages.belongsTo(drawings, {
  foreignKey: 'drawing_id',
  as: 'artbook',
  onDelete: 'CASCADE',
})

User.hasMany(drawings, {
  foreignKey: 'authorid',
  as: 'artbooks',  
  onDelete: 'CASCADE',
});

drawings.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {drawings, pages};
}
