


module.exports = function(app) {

    // Cors
    const cors = require('cors');
    const corsOptions = {
        origin: ['http://localhost:4200'],
        optionsSuccessStatus: 200
      };
      app.use(cors(corsOptions));


    const users = require('./user.controller.js');
 
    // Create a new user
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
    app.get('/api/userid_and_cookies', users.getCurrentUser_and_cookies);
    
    //pseudo and email check
    app.post('/api/users/check_pseudo', users.check_pseudo);
    app.post('/api/users/check_email', users.check_email);
    app.post('/api/users/check_email_checked',users.check_email_checked)
    app.post('/api/users/check_email_and_password',users.check_email_and_password)

    
    app.post('/api/users/create_visitor', users.create_visitor);
    
    // 
    app.post('/api/users/checkToken', users.checkToken);
 
    // 
    app.post('/api/users/checkMail', users.checkMail);


    //for test
    app.post('/api/users/encrypt_data', users.encrypt_data);
    app.post('/api/users/check_invited_user', users.check_invited_user);

}

