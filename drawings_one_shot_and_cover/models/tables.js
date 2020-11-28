const user = require('../../authentication/user.model');

exports.Drawings_Onepage_Tables = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var drawings = sequelize.define('liste_drawings_one_page', {
        drawing_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        authorid: DataTypes.INTEGER,
        drawing_name:DataTypes.STRING,
        title: DataTypes.STRING,
        category: DataTypes.STRING,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        likesnumber: DataTypes.INTEGER,
        lovesnumber: DataTypes.INTEGER,
        viewnumber: DataTypes.INTEGER,
        commentarynumbers:DataTypes.INTEGER,
        highlight: DataTypes.STRING(2000),
        average_lecture_time:DataTypes.INTEGER,
        name_coverpage: DataTypes.STRING,
        thumbnail_color:DataTypes.STRING,
        status: DataTypes.STRING,
        monetization: DataTypes.STRING,
        trending_rank:DataTypes.INTEGER,
        height:DataTypes.STRING,
        list_of_reporters:DataTypes.ARRAY(DataTypes.INTEGER),
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )
  






User.hasMany(drawings, {
  foreignKey: 'authorid',
  as: 'drawings',  
  onDelete: 'CASCADE',
});

drawings.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {drawings};
}

