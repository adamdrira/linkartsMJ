const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const list_of_subscribings = tables.list_of_subscribings(sequelize, Sequelize).subscribings;
const list_of_contents = tables.list_of_subscribings(sequelize, Sequelize).contents;
const list_of_archives = tables.list_of_subscribings(sequelize, Sequelize).archives;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for likes and loves!`);
});


module.exports = {
  list_of_subscribings,
  list_of_contents,
  list_of_archives,
  sequelize
}

