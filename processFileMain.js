const FileType = require("file-type");
const { core } = require("./utils/core");
const libre = require("libreoffice-convert");
const XLSX = require("xlsx");

module.exports.processFileMain = async (fileBuffer) => {
  const randNum = Math.floor(Math.random() * 1000) + 1; //console.time requires unique id
  console.time(`execution code ${randNum}`);
  const fileType = await FileType.fromBuffer(fileBuffer);

  if (fileType.ext.toLowerCase() === "cfb") {
    console.time(`converted by libreoffice code ${randNum}`);
    libre.convert(fileBuffer, "xlsx", undefined, (err, done) => {
      console.timeEnd(`converted by libreoffice code ${randNum}`);
      if (err) {
        console.log(`Error converting file: ${err}`);
      } else {
        // "done" is the xlsx file which can be save or transfer in another stream
        // fs.writeFileSync(path.join(__dirname, "generated.xlsx"), done);
        const workBook = XLSX.read(done, { type: "buffer", bookFiles: true });
        core(workBook);
        console.timeEnd(`execution code ${randNum}`);
      }
    });
  } else if (fileType.ext.toLowerCase() === "xlsx") {
    const workBook = XLSX.read(fileBuffer, {
      type: "buffer",
      bookFiles: true,
    });
    core(workBook);
    console.timeEnd(`execution code ${randNum}`);
  } // else if pdf formats....
};
