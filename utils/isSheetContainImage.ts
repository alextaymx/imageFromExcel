import { ab2str } from "./ab2str";
import * as fastXMLparser from "fast-xml-parser";

export const sheetContainImage = (sheetXml: any) => {
  const sheetXMLObj = fastXMLparser.parse(ab2str(sheetXml), {
    ignoreAttributes: false,
  });
  return "drawing" in sheetXMLObj["worksheet"];
};
