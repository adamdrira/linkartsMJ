const user = require('../../authentication/user.model');

exports.table_profile_notation = (sequelize, DataTypes) => {
    const User = user(sequelize, DataTypes).User;

    var likes = sequelize.define('list_of_likes', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        author_id_who_likes: DataTypes.INTEGER,
        publication_category: DataTypes.STRING,
        format: DataTypes.STRING,
        style: DataTypes.STRING,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        publication_id: DataTypes.INTEGER,
        chapter_number: DataTypes.INTEGER,
        thirdtag: DataTypes.STRING,
        author_id_liked: DataTypes.INTEGER,
        monetization:DataTypes.STRING,
        status:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var loves = sequelize.define('list_of_loves', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        author_id_who_loves: DataTypes.INTEGER,
        publication_category: DataTypes.STRING,
        format: DataTypes.STRING,
        style: DataTypes.STRING,
        firsttag: DataTypes.STRING,
        secondtag: DataTypes.STRING,
        thirdtag: DataTypes.STRING,
        publication_id: DataTypes.INTEGER,
        chapter_number: DataTypes.INTEGER,
        author_id_loved: DataTypes.INTEGER,
        monetization:DataTypes.STRING,
        status:DataTypes.STRING,
      },
      {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )

    var views = sequelize.define('list_of_views', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      author_id_who_looks: DataTypes.INTEGER,
      publication_category: DataTypes.STRING,
      format: DataTypes.STRING,
      style: DataTypes.STRING,
      firsttag: DataTypes.STRING,
      secondtag: DataTypes.STRING,
      thirdtag: DataTypes.STRING,
      publication_id: DataTypes.INTEGER,
      chapter_number: DataTypes.INTEGER,
      view_time:DataTypes.INTEGER,
      author_id_viewed: DataTypes.INTEGER,
      monetization:DataTypes.STRING,
      status:DataTypes.STRING,
    },
    {
      freezeTableName: true // Model tableName will be the same as the model name
    }
  )

  var comments = sequelize.define('list_of_comments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    author_id_who_comments: DataTypes.INTEGER,
    publication_category: DataTypes.STRING,
    format: DataTypes.STRING,
    style: DataTypes.STRING,
    publication_id: DataTypes.INTEGER,
    chapter_number: DataTypes.INTEGER,
    number_of_likes:DataTypes.INTEGER,
    number_of_answers:DataTypes.INTEGER,
    commentary:DataTypes.STRING(1500),
    status:DataTypes.STRING,
  },
  {
    freezeTableName: true 
  }
)

var comments_likes = sequelize.define('list_of_comments_likes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id_who_likes: DataTypes.INTEGER,
  comment_id: DataTypes.INTEGER,
  status:DataTypes.STRING,
  publication_category: DataTypes.STRING,
  format: DataTypes.STRING,
  style: DataTypes.STRING,
  publication_id: DataTypes.INTEGER,
  chapter_number: DataTypes.INTEGER,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)

var comments_answers = sequelize.define('list_of_comments_answers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id_who_replies: DataTypes.INTEGER,
  number_of_likes:DataTypes.INTEGER,
  comment_id: DataTypes.INTEGER,
  commentary:DataTypes.STRING(1500),
  status:DataTypes.STRING,
},
{
  freezeTableName: true 
}
)

var comments_answers_likes = sequelize.define('list_of_comments_answers_likes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id_who_likes: DataTypes.INTEGER,
  comment_answer_id: DataTypes.INTEGER,
  status:DataTypes.STRING,
},
{
  freezeTableName: true // Model tableName will be the same as the model name
}
)


  
comments_answers.hasMany(comments_answers_likes, {
  foreignKey: 'comment_answer_id',
  as: 'likes',  
  onDelete: 'CASCADE',
  });
  
comments_answers_likes.belongsTo(comments_answers, {
foreignKey: 'comment_answer_id',
as: 'likes',  
onDelete: 'CASCADE',
})


comments.hasMany(comments_likes, {
  foreignKey: 'comment_id',
  as: 'likes',  
  onDelete: 'CASCADE',
  });
  
comments_likes.belongsTo(comments, {
foreignKey: 'comment_id',
as: 'likes',  
onDelete: 'CASCADE',
})

comments.hasMany(comments_answers, {
  foreignKey: 'comment_id',
  as: 'comments_answers',  
  onDelete: 'CASCADE',
  });
  
comments_answers.belongsTo(comments, {
foreignKey: 'comment_id',
as: 'comments_answers',  
onDelete: 'CASCADE',
});

User.hasMany(comments, {
  foreignKey: 'author_id_who_comments',
  as: 'comments',  
  onDelete: 'CASCADE',
  });
  
comments.belongsTo(User, {
foreignKey: 'author_id_who_comments',
as: 'comments',  
onDelete: 'CASCADE',
});

User.hasMany(loves, {
foreignKey: 'author_id_who_loved',
as: 'publication_loves',  
onDelete: 'CASCADE',
});

loves.belongsTo(User, {
foreignKey: 'author_id_who_loved',
as: 'author',  
onDelete: 'CASCADE',
});


User.hasMany(likes, {
  foreignKey: 'author_id_who_likes',
  as: 'publication_liked',  
  onDelete: 'CASCADE',
});

likes.belongsTo(User, {
  foreignKey: 'author_id_who_likes',
  as: 'author',  
  onDelete: 'CASCADE',
});

User.hasMany(views, {
  foreignKey: 'author_id_who_looks',
  as: 'publication_seen',  
  onDelete: 'CASCADE',
});

views.belongsTo(User, {
  foreignKey: 'author_id_who_looks',
  as: 'author',  
  onDelete: 'CASCADE',
});

 return {likes, loves, views, comments, comments_answers,comments_likes,comments_answers_likes};
}

