import * as FileType from "file-type";
import * as fs from "fs";
const { deleteFile } = require("./deleteFiles");

export const saveImage = (
  myFile: any,
  sortedImageName: any,
  sheetNum: any,
  sheetName: any
) => {
  const toBeDeleted: any = [];
  const imageBuffer: { fileName: string; data: Buffer }[] = [];
  Object.keys(myFile).forEach((elem, idx) => {
    const currentFile = elem.split("/").pop()!.split("."); //name: 'xl/media/image1.jpeg'
    const currentFileType = currentFile.pop()!;
    if (["jpeg", "jpg", "png"].includes(currentFileType.toLowerCase())) {
      // console.log(myFile.files[elem]);
      const arrayBuffer = myFile[elem]["_data"].getContent();
      const buffer = Buffer.from(arrayBuffer);
      const currentFileName = currentFile.pop()!.replace("image", "");
      if (sortedImageName.includes(currentFileName)) {
        const orderedFileName = sortedImageName.indexOf(currentFileName) + 1;
        const outputFileName = `../outputImages/${sheetNum}_${sheetName}_image_${orderedFileName}.${currentFileType}`;
        // if (!fs.existsSync("outputImages")) {
        //   fs.mkdirSync("outputImages");
        // }
        imageBuffer.push({ fileName: outputFileName, data: buffer });
        // fs.createWriteStream(outputFileName).write(buffer);
        toBeDeleted.push(outputFileName);
      }
      // const fileType = await FileType.fromBuffer(buffer); //png or jpeg
      // console.log(fileType, !fileType);
      // if (!fileType) return;
      // if (fileType.ext) {
      //   const currentFileName = currentFile.pop()!.replace("image", "");
      //   if (sortedImageName.includes(currentFileName)) {
      //     const orderedFileName = sortedImageName.indexOf(currentFileName) + 1;
      //     const outputFileName = `./outputImages/${sheetNum}_${sheetName}_image_${orderedFileName}.${fileType.ext}`;
      //     if (!fs.existsSync("outputImages")) {
      //       fs.mkdirSync("outputImages");
      //     }
      //     imageBuffer.push({ fileName: outputFileName, data: buffer });
      //     fs.createWriteStream(outputFileName).write(buffer);
      //     toBeDeleted.push(outputFileName);
      //   }
      // } else {
      //   console.log(
      //     "File type could not be reliably determined! The binary data may be malformed! No file saved!"
      //   );
      // }
    }
  });

  // deleteFile(toBeDeleted);
  return imageBuffer;
};
