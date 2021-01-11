import { getImageMeta } from "./getImageMeta";
import { sheetContainImage } from "./isSheetContainImage";
import { saveImage } from "./saveImage";
import { sortCoordinates } from "./sortCoordinates";

// const { sortCoordinates } = require("./sortCoordinates");
// const { saveImage } = require("./saveImage");
// const { getImageMeta } = require("./getImageMeta");
// const { sheetContainImage } = require("./isSheetContainImage");

export const coreImage = (workBook: any) => {
  const myFile = workBook.files;
  let currentDrawingXml = 0;
  const pendingList = [];

  for (let [index, sheetName] of workBook.SheetNames.entries()) {
    const sheetXml = myFile[`xl/worksheets/sheet${index + 1}.xml`]["_data"];
    if (!sheetContainImage(sheetXml)) continue;
    const imageXML = myFile[`xl/drawings/drawing${currentDrawingXml + 1}.xml`][
      "_data"
    ].getContent();
    const imageRelXml = myFile[
      `xl/drawings/_rels/drawing${currentDrawingXml + 1}.xml.rels`
    ]["_data"].getContent();
    const barcodeCell = Object.keys(workBook.Sheets[sheetName]).find((cell) => {
      if (workBook.Sheets[sheetName][cell]["w"])
        return ["barcode"].includes(
          workBook.Sheets[sheetName][cell]["w"].toLowerCase()
        );
    });
    const minRow =
      barcodeCell === undefined || barcodeCell === null
        ? -1
        : parseInt(barcodeCell!.match(/\d/g)!.join(""));
    // xml to json
    const imageMeta = getImageMeta(imageXML, imageRelXml);
    if (imageMeta.length === 0) return [];
    const imagesBelowTable = imageMeta.filter(
      (element: any) => element.rowFrom > minRow
    );
    const sortedImageMeta = sortCoordinates(imagesBelowTable);

    if (!sortedImageMeta) return [];
    const sortedImageName = sortedImageMeta.map(
      (element: any) => element.imageRef
    );
    // saveImage(myFile, sortedImageName, index, sheetName);
    pendingList.push({
      index: index,
      sheetName: sheetName,
      sortedImageName: sortedImageName,
    });
    currentDrawingXml++;
  }
  let targetedSheet = workBook.SheetNames.findIndex((element: any) =>
    ["images", "image", "photo"].includes(element.toLowerCase())
  );
  if (
    pendingList[targetedSheet] !== undefined &&
    pendingList[targetedSheet].sortedImageName.length > 0
  ) {
    targetedSheet = targetedSheet;
  } else if (
    pendingList.length > 1 &&
    pendingList[1].sortedImageName.length > 0
  ) {
    targetedSheet = 1;
  } else if (pendingList[0] && pendingList[0].sortedImageName.length > 0) {
    targetedSheet = 0;
  }
  if (targetedSheet > -1)
    return saveImage(
      myFile,
      pendingList[targetedSheet].sortedImageName,
      pendingList[targetedSheet].index,
      pendingList[targetedSheet].sheetName
    );
  else return [];
};
