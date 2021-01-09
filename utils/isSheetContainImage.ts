// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fastXMLpar... Remove this comment to see the full error message
const fastXMLparser = require("fast-xml-parser");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ab2str'.
const {ab2str} = require("./ab2str")
module.exports.sheetContainImage = (sheetXml: any) => {
    const sheetXMLObj = fastXMLparser.parse(ab2str(sheetXml), {
      ignoreAttributes: false,
    });
    return "drawing" in sheetXMLObj["worksheet"];
};