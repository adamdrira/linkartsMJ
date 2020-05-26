const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const Drawings_one_page = tables.Drawings_Onepage_Tables(sequelize, Sequelize).drawings;
//const Timesets = tables.Drawings_Onepage_Tables(sequelize, Sequelize).timesets;

//const migration = require('../migration/migration').up(sequelize.getQueryInterface());
//const migrationdown = require('../migration/migration').down(sequelize.getQueryInterface());

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for BD One Shot!`)
});


module.exports = {
  Drawings_one_page,
  sequelize
}

