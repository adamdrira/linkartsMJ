const Sequelize = require('sequelize');
const tables = require('./tables');


/*const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});*/
const sequelize = new Sequelize('linkarts', 'adamdrira', 'E273adamZ9Qvps', {
  host : 'localhost',
  dialect: 'postgres'
});


const list_of_navbar_researches= tables.list_of_researches(sequelize, Sequelize).list_of_navbar_researches;


//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_navbar_researches!`);
});


module.exports = {
  list_of_navbar_researches,
  sequelize
}

