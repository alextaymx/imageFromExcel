// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'FileType'.
const FileType = require("file-type");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
const { deleteFile } = require("./deleteFiles");

module.exports.saveImage = (myFile: any, sortedImageName: any, sheetNum: any, sheetName: any) => {
  const toBeDeleted: any = [];
  Object.keys(myFile).forEach(async (elem, idx) => {
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    const currentFile = elem.split("/").pop().split("."); //name: 'xl/media/image1.jpeg'
    const currentFileType = currentFile.pop();
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    if (["jpeg", "jpg", "png"].includes(currentFileType.toLowerCase())) {
      // console.log(myFile.files[elem]);
      const arrayBuffer = myFile[elem]["_data"].getContent();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = await FileType.fromBuffer(buffer); //png or jpeg
      if (fileType.ext) {
        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
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
  deleteFile(toBeDeleted);
};
