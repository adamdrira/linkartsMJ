const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});


const list_of_messages= tables.list_of_messages(sequelize, Sequelize).list_of_messages;
const list_of_chat_friends= tables.list_of_messages(sequelize, Sequelize).list_of_chat_friends;
const list_of_chat_spams= tables.list_of_messages(sequelize, Sequelize).list_of_chat_spams;

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_messages!`);
});


module.exports = {
  list_of_chat_friends,
  list_of_chat_spams,
  list_of_messages,
  sequelize
}

