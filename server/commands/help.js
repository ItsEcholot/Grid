const helpFile = require('../resources/help.json');

module.exports = function (commandArgs) {
  let returnString = '';
  if(commandArgs['_'].length === 1) {
    returnString = `
      <b>No command as parameter provided... Displaying all available commands.</b>
      <ul>
    `;
    for (let key in helpFile) {
      returnString += `<li>${key}</li>`;
    }

    returnString += '</ul>';
    return returnString;
  }
}
