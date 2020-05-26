const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const list_comics_one_shot = tables.comics_one_shot_table(sequelize, Sequelize).comics;
const list_pages_comics_one_shot = tables.comics_one_shot_table(sequelize, Sequelize).pages;

//const migration = require('../migration/migration').up(sequelize.getQueryInterface());
//const migrationdown = require('../migration/migration').down(sequelize.getQueryInterface());

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for BD One Shot!`)
});


module.exports = {
  list_comics_one_shot,
  list_pages_comics_one_shot,
  sequelize
}

