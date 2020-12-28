var express = require("express");
var app = express();
app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.listen(3000, function () {
  console.log("App listening on port 3000!");
});

const path = require("path");
const libre = require("libreoffice-convert");
const XLSX = require("xlsx");
const fs = require("fs");
const FileType = require("file-type");
// var xlsx = require("node-xlsx");

// const ExcelJS = require("exceljs");

const processFile = async (filename) => {
  // const workbook = new ExcelJS.Workbook();
  // await workbook.xlsx.readFile(
  //   `C:\\Users\\user\\Documents\\GitHub\\ecom_excel\\sample.xlsx`
  // );

  // console.log(workbook._worksheets);
  console.log(filename.split(".").pop());
  if (filename.split(".").pop() === "xls") {
    const xlsFile = fs.readFileSync(path.join(__dirname, filename));
    await libre.convert(xlsFile, "xlsx", undefined, (err, done) => {
      // await macam not working here
      if (err) {
        console.log(`Error converting file: ${err}`);
      }
      // "done" is the xlsx file which can be save or transfer in another stream
      fs.writeFileSync(path.join(__dirname, "generated.xlsx"), done);
    });
  }

  const myFile = XLSX.readFile(path.join(__dirname, filename), {
    bookFiles: true,
  });

  Object.keys(myFile.files).forEach(async (elem, idx) => {
    const currentFile = elem.split("/").pop().split("."); //name: 'xl/media/image1.jpeg'
    const currentFileType = currentFile.pop();
    if (["jpeg", "jpg", "png"].includes(currentFileType)) {
      // console.log(myFile.files[elem]);
      const arrayBuffer = myFile.files[elem]["_data"].getContent();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = await FileType.fromBuffer(buffer); //png or jpeg
      if (fileType.ext) {
        const currentFileName = currentFile.pop();
        const outputFileName = `${currentFileName}.${fileType.ext}`;
        fs.createWriteStream(outputFileName).write(buffer);
      } else {
        console.log(
          "File type could not be reliably determined! The binary data may be malformed! No file saved!"
        );
      }
    }
  });
};

processFile("generated.xlsx");
