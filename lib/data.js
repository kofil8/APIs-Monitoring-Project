// dependences
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for writing
    fs.open(`${lib.baseDir + dir}/${file} .json`, 'wx', (err, fileDecriptor) => {
        if (!err && fileDecriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDecriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDecriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback(`Error: ${err3}`);
                        }
                    });
                } else {
                    callback(`Error: ${err2}`);
                }
            });
        } else {
            callback(`Error: Could not create a new file, it may already exists ${err}`);
        }
    });
};

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file} .json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// Update data inside a file
lib.update = (dir, file, Data, callback) => {
    // open file for writing
    fs.open(`${lib.baseDir + dir}/${file} .json`, 'r+', (err, fileDecriptor) => {
        if (!err && fileDecriptor) {
            // convert data to string
            const stringData = JSON.stringify(Data);

            // truncate the file
            fs.ftruncate(fileDecriptor, (err2) => {
                if (!err2) {
                    // write to file and close it
                    fs.writeFile(fileDecriptor, stringData, (err3) => {
                        if (!err3) {
                            fs.close(fileDecriptor, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback(`Error: ${err4}`);
                                }
                            });
                        } else {
                            callback(`Error: ${err3}`);
                        }
                    });
                } else {
                    callback(`Error: ${err2}`);
                }
            });
        } else {
            callback(`Error: Could not open the file ${err}`);
        }
    });
};

// delete a file
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.baseDir + dir}/${file} .json`, (err) => {
        callback(err);
    });
};

module.exports = lib;
