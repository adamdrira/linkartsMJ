const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const list_of_albums = tables.list_of_albums(sequelize, Sequelize).albums;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for likes and loves!`);
});


module.exports = {
list_of_albums,
  sequelize
}

