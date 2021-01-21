const env = require('./env.js');

// Connect to database
const Sequelize = require('sequelize');
/*const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});*/
const sequelize = new Sequelize('linkarts', 'adamdrira', 'E273adamZ9Qvps', {
  host : 'localhost',
  dialect: 'postgres'
});

sequelize.authenticate().then(() => {
  console.log('Connection established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

// Get users ou plutot création d'une ligne "user" vide dans la table "users"
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user.model.js')(sequelize, Sequelize).User;
db.user_links = require('./user.model.js')(sequelize, Sequelize).User_links;
db.user_blocked = require('./user.model.js')(sequelize, Sequelize).User_blocked;
db.reports = require('./user.model.js')(sequelize, Sequelize).reports;
db.user_passwords = require('./user.model.js')(sequelize, Sequelize).User_passwords;
db.users_mailing=require('./user.model.js')(sequelize, Sequelize).users_mailing;
db.user_groups_managment = require('./user.model.js')(sequelize, Sequelize).User_groups_managment;
db.users_information_privacy = require('./user.model.js')(sequelize, Sequelize).users_information_privacy;
db.users_strikes = require('./user.model.js')(sequelize, Sequelize).users_strikes;
db.users_cookies = require('./user.model.js')(sequelize, Sequelize).users_cookies;

module.exports = db;