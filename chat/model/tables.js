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
      message:DataTypes.STRING,
      is_a_response:DataTypes.BOOLEAN,
      is_an_attachment:DataTypes.BOOLEAN,
      is_from_server:DataTypes.BOOLEAN,
      server_message:DataTypes.STRING,
      id_message_responding:DataTypes.INTEGER,
      like:DataTypes.BOOLEAN,
      attachment_name:DataTypes.STRING,
      attachment_type:DataTypes.STRING,
      status:DataTypes.STRING,
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


 return {list_of_messages,list_of_chat_friends,list_of_chat_spams,list_of_chat_search};
}

