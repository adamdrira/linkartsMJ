const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const list_of_notifications = tables.list_of_notifications(sequelize, Sequelize).notifications;
const list_of_notifications_spams = tables.list_of_notifications(sequelize, Sequelize).notifications_spams;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_notifications`);
});


module.exports = {
  list_of_notifications,
  list_of_notifications_spams,
  sequelize
}

