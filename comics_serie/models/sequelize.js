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

const Liste_Bd_Serie = tables.Bd_serie_Tables (sequelize, Sequelize).bd;
const Chapters_Bd_Serie = tables.Bd_serie_Tables (sequelize, Sequelize).chapters;
const Pages_Bd_Serie = tables.Bd_serie_Tables(sequelize, Sequelize).pages;

//const migration = require('../migration/migration').up(sequelize.getQueryInterface());
//const migrationdown = require('../migration/migration').down(sequelize.getQueryInterface());

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for BD Series!`)
});


module.exports = {
  Liste_Bd_Serie,
  Chapters_Bd_Serie,
  Pages_Bd_Serie,
  sequelize
}

