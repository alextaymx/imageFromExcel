const fastXMLparser = require("fast-xml-parser");
const {ab2str} = require("./ab2str")
module.exports.sheetContainImage = (sheetXml) => {
    const sheetXMLObj = fastXMLparser.parse(ab2str(sheetXml), {
      ignoreAttributes: false,
    });
    return "drawing" in sheetXMLObj["worksheet"];
};