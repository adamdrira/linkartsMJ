const user = require('../../authentication/user.model');

exports.list_of_messages = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes);
    var list_of_messages = sequelize.define('list_of_chat_messages', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_user: DataTypes.INTEGER,
      id_receiver: DataTypes.INTEGER,
      message:DataTypes.STRING(3000),
      is_a_response:DataTypes.BOOLEAN,
      is_an_attachment:DataTypes.BOOLEAN,
      is_from_server:DataTypes.BOOLEAN,
      server_message:DataTypes.STRING,
      id_message_responding:DataTypes.INTEGER,
      message_responding_to:DataTypes.STRING(3000),
      like:DataTypes.BOOLEAN,
      attachment_name:DataTypes.STRING,
      attachment_type:DataTypes.STRING,
      size:DataTypes.STRING,
      status:DataTypes.STRING,
      id_chat_section:DataTypes.INTEGER,
      emoji_reaction_user:DataTypes.STRING,
      emoji_reaction_receiver:DataTypes.STRING,
      id_group_chat:DataTypes.INTEGER,
      
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

  var list_of_chat_friends = sequelize.define('list_of_chat_friends', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: DataTypes.INTEGER,
    id_receiver: DataTypes.INTEGER,
    date:DataTypes.DATE,
  },
  {
    freezeTableName: true // Model tableName will be the same as the model name
  }
)

var list_of_chat_spams= sequelize.define('list_of_chat_spams', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_receiver: DataTypes.INTEGER,
  date:DataTypes.DATE,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)


var list_of_chat_search= sequelize.define('list_of_chat_search', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_receiver: DataTypes.INTEGER,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)


var list_of_chat_sections = sequelize.define('list_of_chat_sections', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_chat_section:DataTypes.INTEGER,
  id_user: DataTypes.INTEGER,
  id_receiver: DataTypes.INTEGER,
  chat_section_name:DataTypes.STRING,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)

  

User.hasMany(list_of_messages, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});

list_of_messages.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'users',  
  onDelete: 'CASCADE',
});


 return {list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_chat_search,list_of_chat_sections};
}

