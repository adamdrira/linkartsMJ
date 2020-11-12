const user = require('../../authentication/user.model');

exports.Writings_Tables = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var writing = sequelize.define('liste_writings', {
        writing_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        authorid: DataTypes.INTEGER,
        title: DataTypes.STRING,
        category: DataTypes.STRING,
        format: DataTypes.STRING,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        likesnumber: DataTypes.INTEGER,
        lovesnumber: DataTypes.INTEGER,
        viewnumber: DataTypes.INTEGER,
        commentarynumbers:DataTypes.INTEGER,
        highlight: DataTypes.STRING(500),
        average_lecture_time:DataTypes.INTEGER,
        file_name: DataTypes.STRING,
        status: DataTypes.STRING,
        name_coverpage:DataTypes.STRING,
        monetization:DataTypes.STRING,
        total_pages:DataTypes.INTEGER,
        trending_rank:DataTypes.INTEGER,
        list_of_reporters:DataTypes.ARRAY(DataTypes.INTEGER),
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

  






User.hasMany(writing, {
  foreignKey: 'authorid',
  as: 'bds',  
  onDelete: 'CASCADE',
});

writing.belongsTo(User, {
  foreignKey: 'authorid',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {writing};
}

