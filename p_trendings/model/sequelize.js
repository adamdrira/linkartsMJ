const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const trendings_comics = tables.table_profile_notation(sequelize, Sequelize).trendings_comics;
const trendings_drawings = tables.table_profile_notation(sequelize, Sequelize).trendings_drawings;
const trendings_writings = tables.table_profile_notation(sequelize, Sequelize).trendings_writings;
const trendings_contents = tables.table_profile_notation(sequelize, Sequelize).trendings_contents;

//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for likes and loves!`);
});


module.exports = {
  trendings_comics,
  trendings_drawings,
  trendings_writings,
  trendings_contents,
  sequelize
}

