const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const list_of_ads = tables.list_of_ads(sequelize, Sequelize).ads;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_ads!`);
});


module.exports = {
  list_of_ads,
  sequelize
}

