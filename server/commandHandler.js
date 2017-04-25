const helpCommand = require('./commands/help');

module.exports = function (commandArgs) {
  switch (commandArgs['_'][0])  {
    case 'help':  return helpCommand(commandArgs);  break;
  }
}
