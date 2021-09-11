const user = require('../../authentication/user.model');

exports.list_of_messages = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;
    var list_of_messages = sequelize.define('list_of_chat_messages', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_user: DataTypes.INTEGER,
      id_user_name:DataTypes.STRING,
      id_receiver: DataTypes.INTEGER,
      is_a_group_chat:DataTypes.BOOLEAN,
      message:DataTypes.STRING(3000),
      is_a_response:DataTypes.BOOLEAN,
      is_an_attachment:DataTypes.BOOLEAN,
      is_from_server:DataTypes.BOOLEAN,
      server_message:DataTypes.STRING,
      id_message_responding:DataTypes.INTEGER,
      message_responding_to:DataTypes.STRING(3000),
      attachment_name:DataTypes.STRING,
      attachment_type:DataTypes.STRING,
      size:DataTypes.STRING,
      status:DataTypes.STRING,
      list_of_users_who_saw:DataTypes.ARRAY(DataTypes.INTEGER),
      list_of_users_in_the_group:DataTypes.ARRAY(DataTypes.INTEGER),
      id_chat_section:DataTypes.INTEGER,
      emoji_reaction_user:DataTypes.STRING,
      emoji_reaction_receiver:DataTypes.STRING,
      list_of_names_added:DataTypes.ARRAY(DataTypes.STRING),
      id_folder:DataTypes.INTEGER,
      chat_friend_id:DataTypes.INTEGER,
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
    is_a_group_chat: DataTypes.BOOLEAN,
    chat_profile_pic_name:DataTypes.STRING,
    profile_pic_origin:DataTypes.STRING,
    date:DataTypes.DATE,
    status:DataTypes.STRING,
  },
  {
    freezeTableName: true // Model tableName will be the same as the model name
  }
)


var list_of_chat_contracts= sequelize.define('list_of_chat_contracts', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_receiver: DataTypes.INTEGER,
  is_a_group_chat: DataTypes.BOOLEAN,
  list_of_signing_members:DataTypes.ARRAY(DataTypes.INTEGER),
  contract_name:DataTypes.STRING,
  status:DataTypes.STRING,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)

var list_of_chat_groups = sequelize.define('list_of_chat_groups', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  name: DataTypes.STRING,
  list_of_receivers_ids: DataTypes.ARRAY(DataTypes.INTEGER),
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)

var list_of_chat_groups_reactions = sequelize.define('list_of_chat_groups_reactions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_group_chat: DataTypes.INTEGER,
  id_message:DataTypes.INTEGER,
  emoji_reaction:DataTypes.STRING,
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
  is_a_group_chat: DataTypes.BOOLEAN,
  date:DataTypes.DATE,
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
  is_a_group_chat: DataTypes.BOOLEAN,
  chat_section_name:DataTypes.STRING,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)


var list_of_chat_emails= sequelize.define('list_of_chat_emails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_receiver:DataTypes.INTEGER,
  status: DataTypes.STRING,
  },
  {
    freezeTableName: true // Model tableName will be the same as the model name
  }
)
  
var list_of_chat_folders = sequelize.define('list_of_chat_folders', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: DataTypes.INTEGER,
  id_chat_friend: DataTypes.INTEGER,
  title:DataTypes.STRING,
  number_of_files:DataTypes.INTEGER,
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


 return {list_of_messages,
  list_of_chat_friends,
  list_of_chat_groups,
  list_of_chat_groups_reactions,
  list_of_chat_spams,
  list_of_chat_search,
  list_of_chat_emails,
  list_of_chat_sections,
  list_of_chat_folders,
  list_of_chat_contracts
};
}

