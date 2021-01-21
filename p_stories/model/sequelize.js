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

const list_of_stories = tables.list_of_stories(sequelize, Sequelize).stories;
const list_of_views = tables.list_of_stories(sequelize, Sequelize).views;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for likes and loves!`);
});


module.exports = {
    list_of_stories,
    list_of_views,
  sequelize
}

