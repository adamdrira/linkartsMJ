const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});
/*const sequelize = new Sequelize('linkarts', 'adamdrira', 'E273adamZ9Qvps', {
  host : 'localhost',
  dialect: 'postgres'
});*/

const list_of_ads = tables.list_of_ads(sequelize, Sequelize).ads;
const list_of_ads_responses = tables.list_of_ads(sequelize, Sequelize).ads_responses;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_ads!`);
});


module.exports = {
  list_of_ads,
  list_of_ads_responses,
  sequelize
}

