const user = require('../../authentication/user.model');

exports.comics_one_shot_table = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var comics= sequelize.define('liste_bd_one_shot', {
        bd_id: {
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
        highlight: DataTypes.STRING(2000),
        average_lecture_time:DataTypes.INTEGER,
        name_coverpage: DataTypes.STRING,
        status: DataTypes.STRING,
        monetization:DataTypes.STRING,
        trending_rank:DataTypes.INTEGER,
        list_of_reporters:DataTypes.ARRAY(DataTypes.INTEGER),
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var pages = sequelize.define('pages_bd_one_shot', {
      page_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bd_id: DataTypes.INTEGER,
      author_id:DataTypes.INTEGER,
      file_name: DataTypes.STRING,
      page_number: DataTypes.INTEGER,
      average_lecture_time:DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

  


comics.hasMany(pages, {
  foreignKey: 'bd_id',
  as: 'bdpages',  // on récupère les pages d'une instance de bd avec un getter : getPages()  
  onDelete: 'CASCADE',
});

pages.belongsTo(comics, {
  foreignKey: 'bd_id',
  as: 'bd',
  onDelete: 'CASCADE',
})


User.hasMany(comics, {
  foreignKey: 'authorid',
  as: 'bds',  
  onDelete: 'CASCADE',
});

comics.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {comics, pages};
}

