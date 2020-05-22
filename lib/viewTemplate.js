const fs = require('fs');

const TEMPLATES_FOLDER = `${__dirname}/../templates`;

const loadTemplate = function (templateFileName, propertyBag) {
  const path = `${TEMPLATES_FOLDER}/${templateFileName}`;
  const content = fs.readFileSync(path, 'utf8');

  const replaceKeyWithValue = (content, key) => {
    const pattern = new RegExp(`__${key}__`, 'g');
    return content.replace(pattern, propertyBag[key]);
  };

  const keys = Object.keys(propertyBag);

  return keys.reduce(replaceKeyWithValue, content);
};

module.exports = { loadTemplate };
