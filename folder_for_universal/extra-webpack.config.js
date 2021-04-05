console.log('custom webpack config');
module.exports = {
    externals: {
        pg:'pg', 
        sqlite3:'sqlite3', 
        tedious:'tedious', 
        'pg-hstore':'pg-hstore',
        'pg-native':'pg-native',
        express: 'express',
        bcrypt:'bcrypt',
        sequelize:'sequelize',
    },
};