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

const list_of_projects = tables.list_of_editor_projects(sequelize, Sequelize).list_of_projects;
const list_of_projects_responses = tables.list_of_editor_projects(sequelize, Sequelize).list_of_projects_responses;



//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for list_of_ads!`);
});


module.exports = {
  list_of_projects,
  list_of_projects_responses,
  sequelize
}

