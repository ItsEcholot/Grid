const motd = require('../resources/motd.json');

module.exports = function () {
  let returnString = '';
  for(let line in motd.messages)  {
    if(line > 0)
      returnString += `<br>`;
    returnString += motd.messages[line];
  }

  return returnString;
};
