const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const Liste_Drawings_Artbook = tables.Drawings_Artbook_Tables(sequelize, Sequelize).drawings;
const Pages_Artbook = tables.Drawings_Artbook_Tables(sequelize, Sequelize).pages;

//const migration = require('../migration/migration').up(sequelize.getQueryInterface());
//const migrationdown = require('../migration/migration').down(sequelize.getQueryInterface());

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for BD One Shot!`)
});


module.exports = {
    Liste_Drawings_Artbook,
    Pages_Artbook,
  sequelize
}

