const path = require('path');
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
console.log('NODE_CONFIG_DIR', process.env.NODE_CONFIG_DIR);
const config = require('config');
module.exports = config;
