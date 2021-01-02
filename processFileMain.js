const FileType = require("file-type");
const {core} = require("./utils/core");
const libre = require("libreoffice-convert");
const XLSX = require("xlsx");

module.exports.processFileMain = async (fileBuffer) => {
    console.time("execution");
    const fileType = await FileType.fromBuffer(fileBuffer);
  
    if (fileType.ext.toLowerCase() === "cfb") {
      console.time("conversion using libreoffice");
      libre.convert(fileBuffer, "xlsx", undefined, (err, done) => {
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
      console.timeEnd("execution");
    } // else if pdf formats....
  };