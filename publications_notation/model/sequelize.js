const Sequelize = require('sequelize');
const tables = require('./tables');


const sequelize = new Sequelize('linkarts', 'postgres', 'test', {
    host : 'localhost',
    dialect: 'postgres'
});

const List_of_likes = tables.table_profile_notation(sequelize, Sequelize).likes;
const List_of_loves = tables.table_profile_notation(sequelize, Sequelize).loves;
const List_of_views = tables.table_profile_notation(sequelize, Sequelize).views;
const List_of_comments = tables.table_profile_notation(sequelize, Sequelize).comments;
const List_of_comments_answers = tables.table_profile_notation(sequelize, Sequelize).comments_answers;
const List_of_comments_likes = tables.table_profile_notation(sequelize, Sequelize).comments_likes;
const List_of_comments_answers_likes = tables.table_profile_notation(sequelize, Sequelize).comments_answers_likes;


//Pass { force: true } as option if you want to force delete and recreate.
sequelize.sync() 
  .then(() => {
    console.log(`Database & tables created for likes and loves!`);
});


module.exports = {
  List_of_likes,
  List_of_loves,
  List_of_views,
  List_of_comments,
  List_of_comments_answers,
  List_of_comments_likes,
  List_of_comments_answers_likes,
  sequelize
}

