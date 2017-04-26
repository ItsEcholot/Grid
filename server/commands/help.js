const helpFile = require('../resources/help.json');

module.exports = function (commandArgs) {
  let returnString = '';
  if(commandArgs['_'].length === 1) {
    returnString = `
      <b>No command as parameter provided... Listing all available commands.</b>
      <ul>
    `;
    for (let key in helpFile) {
      returnString += `<li>${key}</li>`;
    }

    returnString += `</ul>`;
    return returnString;
  }
  else  {
    let command = helpFile[commandArgs['_'][1]];
    if(command) {
      returnString = `
      <b>${commandArgs['_'][1]}</b>
      <br>
      &nbsp;${command.description}
      <br>
      &nbsp;Usage: ${command.usage}
    `;
    }
    else  {
      returnString = `
        Command <b>${commandArgs['_'][1]}</b> not found.
      `;
    }

    return returnString;
  }
}
