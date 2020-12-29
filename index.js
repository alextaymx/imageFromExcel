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
var fastXMLparser = require("fast-xml-parser");

// var xlsx = require("node-xlsx");

// const ExcelJS = require("exceljs");
const ab2str = (buf) => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};

const sortCoordinates = (imageMeta) => {
  let assignedRow = 0;
  let currentUB = 0;
  let currentLB = 0;
  const sortedImageMeta = imageMeta.sort((a, b) => {
    return a.rowFrom - b.rowFrom;
  });
  for (let element of sortedImageMeta) {
    if (element.rowFrom > currentUB || element.rowFrom < currentLB) {
      assignedRow += 1;
      midpoint = (element.rowTo - element.rowFrom) / 2;
      currentUB = element.rowFrom + midpoint;
      currentLB = element.rowFrom - midpoint;
    }
    element.rowGiven = assignedRow;
  }
  sortedImageMeta.sort((a, b) => {
    return a.rowGiven - b.rowGiven || a.colFrom - b.colFrom;
  });

  return sortedImageMeta;
};

const getImageMeta = (imageXML,imageCounter) => {
  // xml to json
  const imageXMLObj = fastXMLparser.parse(ab2str(imageXML), {
    ignoreAttributes: false,
  });
  // console.log(Buffer.from(imageXML).toString())
  // console.log(imageXMLObj["xdr:wsDr"]["xdr:twoCellAnchor"])
  const imageXMLObjFiltered = Array.isArray(
    imageXMLObj["xdr:wsDr"]["xdr:twoCellAnchor"]
  )
    ? imageXMLObj["xdr:wsDr"]["xdr:twoCellAnchor"].filter(
        (element) => element["xdr:pic"]
      )
    : imageXMLObj["xdr:wsDr"]["xdr:twoCellAnchor"]["xdr:pic"]
    ? [imageXMLObj["xdr:wsDr"]["xdr:twoCellAnchor"]]
    : [];
  if (imageXMLObjFiltered.length === 0) return null;
  const imageMeta = imageXMLObjFiltered.map((element,index) => {
    return {
      imageName: element["xdr:pic"]["xdr:nvPicPr"]["xdr:cNvPr"]["@_name"], // problematic with mandarin name
      imageRef: (imageCounter+index+1).toString(),
      colFrom: element["xdr:from"]["xdr:col"],
      rowFrom: element["xdr:from"]["xdr:row"],
      colTo: element["xdr:to"]["xdr:col"],
      rowTo: element["xdr:to"]["xdr:row"],
    };
  });
  return imageMeta;
};

const saveImage = (myFile, sortedImageName,sheetNum) => {
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
        if(sortedImageName.includes(currentFileName)){
          const orderedFileName = sortedImageName.indexOf(currentFileName) + 1;
          const outputFileName = `image_${sheetNum}_${orderedFileName}.${fileType.ext}`;
          fs.createWriteStream(outputFileName).write(buffer);
        }
      } else {
        console.log(
          "File type could not be reliably determined! The binary data may be malformed! No file saved!"
        );
      }
    }
  });
};

const core = (workBook) =>{
  const myFile = workBook.files;
  let imageCounter = 0;
  console.log(workBook.SheetNames)
  for(const [index,sheetName] of workBook.SheetNames.entries()){
    if(!myFile[`xl/drawings/drawing${index+1}.xml`]) continue;
    const imageXML = myFile[`xl/drawings/drawing${index+1}.xml`]["_data"].getContent();
    // xml to json
    const imageMeta = getImageMeta(imageXML,imageCounter);
    if (imageMeta.length === 0) return;
    const sortedImageMeta = sortCoordinates(imageMeta);
    const sortedImageName = sortedImageMeta.map(
      (element) => element.imageRef
    );
    saveImage(myFile,sortedImageName,index);
    imageCounter += sortedImageName.length
  }
  
}

const processFile = async (filename) => {
  // const workbook = new ExcelJS.Workbook();
  // await workbook.xlsx.readFile(
  //   `C:\\Users\\user\\Documents\\GitHub\\ecom_excel\\sample.xlsx`
  // );

  // console.log(workbook._worksheets);
  console.log(filename.split(".").pop());
  console.time("execution");
  if (filename.split(".").pop().toLowerCase() === "xls") {
    const xlsFile = fs.readFileSync(path.join(__dirname, filename));
    await libre.convert(xlsFile, "xlsx", undefined, (err, done) => {
      // await macam not working here
      if (err) {
        console.log(`Error converting file: ${err}`);
      }
      // "done" is the xlsx file which can be save or transfer in another stream
      fs.writeFileSync(path.join(__dirname, "generated.xlsx"), done);
      const workBook = XLSX.readFile(path.join(__dirname, "generated.xlsx"), {
        bookFiles: true,
      });
      
      core(workBook);
      console.timeEnd("execution");
    });
  } else {
    const workBook = XLSX.readFile(path.join(__dirname, filename), {
      bookFiles: true,
    });
    core(workBook);
    // const imageXML = myFile["xl/drawings/drawing1.xml"]["_data"].getContent();
    // // xml to json
    // const imageMeta = getImageMeta(imageXML);
    // const sortedImageMeta = sortCoordinates(imageMeta);
    // const sortedImageName = sortedImageMeta.map((element) => element.imageRef);
    // saveImage(myFile, sortedImageName);
    console.timeEnd("execution");
  }
};

processFile("2021-4月Add13,_5月Add4_Candy_Toy_offer_pre-order_All_TS.xlsx");
