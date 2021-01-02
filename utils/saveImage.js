const FileType = require("file-type");
const fs = require("fs");
const {deleteFile} = require("./deleteFiles");

module.exports.saveImage = (myFile, sortedImageName, sheetNum, sheetName) => {
    const toBeDeleted = [];
    Object.keys(myFile).forEach(async (elem, idx) => {
        const currentFile = elem.split("/").pop().split("."); //name: 'xl/media/image1.jpeg'
        const currentFileType = currentFile.pop();
        if (["jpeg", "jpg", "png"].includes(currentFileType)) {
            // console.log(myFile.files[elem]);
            const arrayBuffer = myFile[elem]["_data"].getContent();
            const buffer = Buffer.from(arrayBuffer);
            const fileType = await FileType.fromBuffer(buffer); //png or jpeg
            if (fileType.ext) {
                const currentFileName = currentFile.pop().replace("image", "");
                if (sortedImageName.includes(currentFileName)) {
                    const orderedFileName = sortedImageName.indexOf(currentFileName) + 1;
                    const outputFileName = `./outputImages/${sheetNum}_${sheetName}_image_${orderedFileName}.${fileType.ext}`;
                    if (!fs.existsSync("outputImages")) {
                        fs.mkdirSync("outputImages");
                    }
                    fs.createWriteStream(outputFileName).write(buffer);
                    toBeDeleted.push(outputFileName);
                }
            } else {
                console.log(
                "File type could not be reliably determined! The binary data may be malformed! No file saved!"
                );
            }
        }
    });
    // deleteFile(toBeDeleted);
};