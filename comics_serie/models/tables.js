const user = require('../../authentication/user.model');

exports.Bd_serie_Tables = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var bd = sequelize.define('liste_bd_serie', {
        bd_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        authorid: DataTypes.INTEGER,
        title: DataTypes.STRING,
        category: DataTypes.STRING,
        chaptersnumber: DataTypes.INTEGER,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        pagesnumber: DataTypes.INTEGER,
        likesnumber: DataTypes.INTEGER,
        lovesnumber: DataTypes.INTEGER,
        viewnumber: DataTypes.INTEGER,
        commentarynumbers:DataTypes.INTEGER,
        highlight: DataTypes.STRING(2000),
        tools: DataTypes.STRING,
        softwares: DataTypes.STRING,
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

    var chapters = sequelize.define('chapters_bd_serie', {
      chapter_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bd_id: DataTypes.INTEGER,
      author_id:DataTypes.INTEGER,
      title:DataTypes.STRING,
      pagesnumber: DataTypes.INTEGER,
      chapter_number: DataTypes.INTEGER,
      average_lecture_time:DataTypes.INTEGER,
      status: DataTypes.STRING,
      viewnumber: DataTypes.INTEGER,
      pagesnumber: DataTypes.INTEGER,
      likesnumber: DataTypes.INTEGER,
      lovesnumber: DataTypes.INTEGER,
      commentarynumbers:DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

    var pages = sequelize.define('pages_chapter_bd_serie', {
      page_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bd_id:DataTypes.INTEGER,
      chapter_number:DataTypes.STRING,
      chapter_id: DataTypes.INTEGER,
      author_id:DataTypes.INTEGER,
      file_name: DataTypes.STRING,
      page_number: DataTypes.INTEGER,
      average_lecture_time:DataTypes.INTEGER,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

 

bd.hasMany(chapters, {
  foreignKey: 'bd_id',
  as: 'bdpages',  // on récupère les pages d'une instance de bd avec un getter : getPages()  
  onDelete: 'CASCADE',
});

chapters.belongsTo(bd, {
  foreignKey: 'bd_id',
  as: 'bd',
  onDelete: 'CASCADE',
})

chapters.hasMany(pages, {
  foreignKey: 'chapter_id',
  as: 'bdchapters',  // on récupère les pages d'une instance de bd avec un getter : getPages()  
  onDelete: 'CASCADE',
});

pages.belongsTo(chapters, {
  foreignKey: 'chapter_id',
  as: 'chapter',
  onDelete: 'CASCADE',
})



User.hasMany(bd, {
  foreignKey: 'authorid',
  as: 'bds',  
  onDelete: 'CASCADE',
});

bd.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {bd, pages, chapters};
}

