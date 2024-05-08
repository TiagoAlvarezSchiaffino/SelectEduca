// This module is used to replace with the default config JSON file generated by Sequelize CLI 
// in order to use environment variables, See Details in the link Below: 
// https://sequelize.org/docs/v6/other-topics/migrations/#configuration
module.exports = {
    development: {
      url: process.env.DATABASE_URI,
      dialect: 'postgresql'
    },
    production: {
      url: process.env.DATABASE_URI,
      dialect: 'postgresql'
    }
};