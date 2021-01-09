const fastXMLparser = require("fast-xml-parser");
const {ab2str} = require("./ab2str")
module.exports.getImageMeta = (imageXML, imageRelXml) => {
    // xml to json
    const imageXMLObj = fastXMLparser.parse(ab2str(imageXML), {
      ignoreAttributes: false,
    });
    const imageRelXMLObj = fastXMLparser.parse(ab2str(imageRelXml), {
        ignoreAttributes: false,
      });
    // console.log(imageRelXMLObj);
    const relationship = Array.isArray(imageRelXMLObj['Relationships']['Relationship'])
        ?imageRelXMLObj['Relationships']['Relationship']
        :[imageRelXMLObj['Relationships']['Relationship']] ;
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
        const rId = element["xdr:pic"]['xdr:blipFill']['a:blip']['@_r:embed'];
        const imageFileNameNum = relationship.filter((rel)=>rel['@_Id'] === rId)[0]['@_Target'].split('/').pop().split(".")[0].replace('image','');
        return {
            imageName: element["xdr:pic"]["xdr:nvPicPr"]["xdr:cNvPr"]["@_name"], // problematic with mandarin name
            imageRef: imageFileNameNum,
            colFrom: element["xdr:from"]["xdr:col"],
            rowFrom: element["xdr:from"]["xdr:row"],
            colTo: element["xdr:to"]["xdr:col"],
            rowTo: element["xdr:to"]["xdr:row"],
        };
    });
    return imageMeta;
  };