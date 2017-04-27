const helpCommand = require('./commands/help');
const motdCommand = require('./commands/motd');

module.exports = function (commandArgs, socket, user) {
  switch (commandArgs['_'][0])  {
    case 'help':  return helpCommand(commandArgs);                                                                break;
    case 'motd':  return motdCommand();                                                                           break;
    default:      return 'Unknown command';                                                                       break;
  }
};
