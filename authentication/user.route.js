

module.exports = function(app) {
    const users = require('./user.controller.js');
 
    // Create a new user
    /*cette fonction précise ce qu'il se passe lorqu'on fait un post avec l'url indiqué.
    la fonction users.create (c'est un focntion implicite) est appelé et créée une ligne
     "user" dans la table "username" mais il faut entrer un user après l'url, voir "user.service"*/
    app.post('/api/users/signup', users.create);
    app.post('/api/users/add_link', users.add_link);
    app.post('/api/users/remove_link', users.remove_link);

    // 
    app.post('/api/users/login', users.login);
    app.post('/api/users/reset_password', users.reset_password);
    
    app.post('/api/users/decrypt_password', users.decrypt_password);
    app.post('/api/users/edit_password', users.edit_password);
    app.post('/api/users/edit_email', users.edit_email);
    
    //getuserID
    app.get('/api/userid', users.getCurrentUser);
    //pseudo and email check
    app.post('/api/users/check_pseudo', users.check_pseudo);
    app.post('/api/users/check_email', users.check_email);

    app.post('/api/users/create_visitor', users.create_visitor);
    
    // 
    app.post('/api/users/checkToken', users.checkToken);
 
    // 
    app.post('/api/users/checkMail', users.checkMail);


    //for test
    app.post('/api/users/encrypt_data', users.encrypt_data);
    app.post('/api/users/check_invited_user', users.check_invited_user);

}

