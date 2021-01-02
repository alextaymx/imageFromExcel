const fs = require("fs");
const path = require("path");


module.exports.deleteFile = (fileArr) => {
    // fs.rmdirSync("./outputImages", { recursive: true });
    fileArr.forEach((file) =>
        fs.unlink(path.join(__dirname, file), (err) => {
        if (err) throw err;
        })
    );
    console.info("Deleted");
};