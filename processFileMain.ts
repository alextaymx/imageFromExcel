import * as FileType from "file-type";
import * as XLSX from "xlsx";
import { coreImage } from "./utils/coreImage";
import { WorkBook } from "xlsx";
import { coreTable } from "./utils/coreTable";
const libre = require("libreoffice-convert");

const coreProcess = async (
  fileBuffer: Buffer,
  supplierName: string,
  randNum: number
) => {
  const workBook = XLSX.read(fileBuffer, {
    type: "buffer",
    bookFiles: true,
    cellDates: true,
    cellHTML: true,
  });
  const extractedData = await coreTable(workBook, supplierName);
  console.log(extractedData);
  const extractedImage = coreImage(workBook);
  const mergedResult = extractedData.map((data, idx) => ({
    ...data,
    ...extractedImage[idx],
  }));
  console.log("merged", mergedResult);
  console.timeEnd(`execution code ${randNum}`);
};

export const processFileMain = async (fileBuffer: Buffer) => {
  const randNum: number = Math.floor(Math.random() * 1000) + 1; //console.time requires unique id
  console.time(`execution code ${randNum}`);
  const fileType = await FileType.fromBuffer(fileBuffer);
  if (!fileType) return;

  const supplierName = "Daniel & Co";

  if (fileType.ext.toLowerCase() === "cfb") {
    console.time(`converted by libreoffice code ${randNum}`);
    libre.convert(
      fileBuffer,
      "xlsx",
      undefined,
      async (err: any, done: any) => {
        console.timeEnd(`converted by libreoffice code ${randNum}`);
        if (err) {
          console.log(`Error converting file: ${err}`);
        } else {
          // "done" is the xlsx file which can be save or transfer in another stream
          // fs.writeFileSync(path.join(__dirname, "generated.xlsx"), done);
          coreProcess(done, supplierName, randNum);
        }
      }
    );
  } else if (fileType.ext.toLowerCase() === "xlsx") {
    coreProcess(fileBuffer, supplierName, randNum);
  } // else if pdf formats....
};
