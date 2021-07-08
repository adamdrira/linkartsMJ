const user = require('../../authentication/user.model');

exports.list_of_editor_projects = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var list_of_projects = sequelize.define('list_of_projects', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user: DataTypes.INTEGER,
        user_name:DataTypes.STRING,
        user_nickname:DataTypes.STRING,
        user_verified:DataTypes.BOOLEAN,
        user_description:DataTypes.STRING,

        title:DataTypes.STRING,
        category:DataTypes.STRING,
        genres:DataTypes.ARRAY(DataTypes.STRING),

        target_id:DataTypes.INTEGER,
        editor_name:DataTypes.STRING,
        editor_nickname:DataTypes.STRING,
        formula:DataTypes.STRING,
        price:DataTypes.INTEGER,
        delay:DataTypes.INTEGER,
        delay_date:DataTypes.DATE,

        likes: DataTypes.INTEGER,
        loves: DataTypes.INTEGER,
        views: DataTypes.INTEGER,
        subscribers_number: DataTypes.INTEGER,
        number_of_visits: DataTypes.INTEGER,
        number_of_comics: DataTypes.INTEGER,
        number_of_drawings: DataTypes.INTEGER,
        number_of_writings: DataTypes.INTEGER,
        number_of_ads: DataTypes.INTEGER,
        number_of_artpieces: DataTypes.INTEGER,

        password_payement:DataTypes.STRING,
        payement_status:DataTypes.STRING,
        project_name:DataTypes.STRING,

        read:DataTypes.BOOLEAN,
        responded:DataTypes.BOOLEAN,

        
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var list_of_projects_responses = sequelize.define('list_of_projects_responses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_user: DataTypes.INTEGER,
      user_name:DataTypes.STRING,
      user_nickname:DataTypes.STRING,
      
      id_project: DataTypes.INTEGER,
      target_id:DataTypes.STRING,
      target_name:DataTypes.STRING,
      target_nickname:DataTypes.STRING,
      jugement:DataTypes.STRING,
      mark:DataTypes.STRING,
      price:DataTypes.INTEGER,
      formula:DataTypes.STRING,
      response_on_time:DataTypes.BOOLEAN,
      response:DataTypes.STRING,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

 

  

User.hasMany(list_of_projects, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

list_of_projects.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

list_of_projects.hasMany(list_of_projects_responses, {
  foreignKey: 'id_project',
  as: 'responses',  
  onDelete: 'CASCADE',
});

list_of_projects_responses.belongsTo(list_of_projects, {
  foreignKey: 'id_project',
  as: 'responses',  
  onDelete: 'CASCADE',
});

 return {list_of_projects,list_of_projects_responses};
}

