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
const deleteFile = (fileArr) => {
  // fs.rmdirSync("./outputImages", { recursive: true });
  fileArr.forEach((file) =>
    fs.unlink(path.join(__dirname, file), (err) => {
      if (err) throw err;
    })
  );
  console.info("Deleted");
};
const sortCoordinates = (imageMeta) => {
  let assignedRow = 0;
  let currentUB = -1;
  let currentLB = -1;
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

const getImageMeta = (imageXML, imageCounter) => {
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
  const imageMeta = imageXMLObjFiltered.map((element, index) => {
    return {
      imageName: element["xdr:pic"]["xdr:nvPicPr"]["xdr:cNvPr"]["@_name"], // problematic with mandarin name
      imageRef: (imageCounter + index + 1).toString(),
      colFrom: element["xdr:from"]["xdr:col"],
      rowFrom: element["xdr:from"]["xdr:row"],
      colTo: element["xdr:to"]["xdr:col"],
      rowTo: element["xdr:to"]["xdr:row"],
    };
  });
  return imageMeta;
};

const saveImage = (myFile, sortedImageName, sheetNum, sheetName) => {
  console.log(sortedImageName, sheetName);
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
  setTimeout(() => deleteFile(toBeDeleted), 10000);
};

const sheetContainImage = (sheetXml) => {
  const sheetXMLObj = fastXMLparser.parse(ab2str(sheetXml), {
    ignoreAttributes: false,
  });
  return "drawing" in sheetXMLObj["worksheet"];
};

const core = (workBook) => {
  const myFile = workBook.files;
  let imageCounter = 0;
  let currentDrawingXml = 0;
  const pendingList = [];
  console.log(workBook.SheetNames);
  for (const [index, sheetName] of workBook.SheetNames.entries()) {
    const sheetXml = myFile[`xl/worksheets/sheet${index + 1}.xml`]["_data"];
    if (!sheetContainImage(sheetXml)) continue;
    const imageXML = myFile[`xl/drawings/drawing${currentDrawingXml + 1}.xml`][
      "_data"
    ].getContent();
    const barcodeCell = Object.keys(workBook.Sheets[sheetName]).find((cell) => {
      if (workBook.Sheets[sheetName][cell]["w"])
        return ["barcode"].includes(
          workBook.Sheets[sheetName][cell]["w"].toLowerCase()
        );
    });

    const minRow =
      barcodeCell === undefined
        ? -1
        : parseInt(barcodeCell.match(/\d/g).join(""));
    // xml to json
    const imageMeta = getImageMeta(imageXML, imageCounter);
    if (imageMeta.length === 0) return;
    const imagesBelowTable = imageMeta.filter(
      (element) => element.rowFrom > minRow
    );
    const sortedImageMeta = sortCoordinates(imagesBelowTable);
    const sortedImageName = sortedImageMeta.map((element) => element.imageRef);
    // saveImage(myFile, sortedImageName, index, sheetName);
    console.log(sortedImageName, index, sheetName);
    pendingList.push({
      index: index,
      sheetName: sheetName,
      sortedImageName: sortedImageName,
    });
    imageCounter += sortedImageName.length;
    currentDrawingXml++;
  }
  const targetedSheet = workBook.SheetNames.findIndex((element) =>
    ["images", "image", "photo"].includes(element.toLowerCase())
  );
  console.log(pendingList, targetedSheet);
  if (
    targetedSheet > -1 &&
    pendingList[targetedSheet] !== undefined &&
    pendingList[targetedSheet].sortedImageName.length > 0
  ) {
    saveImage(
      myFile,
      pendingList[targetedSheet].sortedImageName,
      pendingList[targetedSheet].index,
      pendingList[targetedSheet].sheetName
    );
  } else if (
    pendingList.length > 1 &&
    pendingList[1].sortedImageName.length > 0
  ) {
    saveImage(
      myFile,
      pendingList[1].sortedImageName,
      pendingList[1].index,
      pendingList[1].sheetName
    );
  } else if (pendingList[0].sortedImageName.length > 0) {
    saveImage(
      myFile,
      pendingList[0].sortedImageName,
      pendingList[0].index,
      pendingList[0].sheetName
    );
  }
};

const processFile = async (fileBuffer) => {
  // const workbook = new ExcelJS.Workbook();
  // await workbook.xlsx.readFile(
  //   `C:\\Users\\user\\Documents\\GitHub\\ecom_excel\\sample.xlsx`
  // );

  // console.log(workbook._worksheets);
  console.time("execution");
  const fileType = await FileType.fromBuffer(fileBuffer);

  console.log(fileType);
  if (fileType.ext.toLowerCase() === "cfb") {
    console.time("conversion using libreoffice");
    // const xlsFile = fs.readFileSync(path.join(__dirname, filename));
    await libre.convert(fileBuffer, "xlsx", undefined, (err, done) => {
      // await macam not working here
      if (err) {
        console.log(`Error converting file: ${err}`);
      }
      console.timeEnd("conversion using libreoffice");
      // "done" is the xlsx file which can be save or transfer in another stream
      // fs.writeFileSync(path.join(__dirname, "generated.xlsx"), done);
      const workBook = XLSX.read(done, { type: "buffer", bookFiles: true });
      core(workBook);
      console.timeEnd("execution");
    });
  } else if (fileType.ext.toLowerCase() === "xlsx") {
    const workBook = XLSX.read(fileBuffer, {
      type: "buffer",
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
  } // else if pdf formats....
};

// processFile("2021-01_Tamagotchi_x_EVA_ver.2_Pre-order_(Mass_All)[1]-2.xls");
// processFile("2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS");
// processFile("bigSample.xlsx")
const filename = "sample.xlsx";
// const filename = "2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS";
const fileBuffer = fs.readFileSync(path.join(__dirname, filename));
processFile(fileBuffer);
