const fs = require('fs');
const path = require('path');

// Function to create and write to a file
function writeFile(fileName, content) {
  const filePath = path.join(__dirname, fileName); // Get the full path to the file
  
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log('File has been written successfully!');
  });
}

module.exports = { writeFile };