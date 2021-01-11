import { WorkBook } from "xlsx";
import { fetchQuery } from "./fetchQuery";
import { getItemPosition } from "./getItemPosition";
import { processExtractedData } from "./processExtractedData";

const fetchExistingJancode = async () => {
  try {
    const { data } = await fetchQuery(`
                            query {
                                getDistinctRefJancode
                            }
                            `);
    if (data && data["getDistinctRefJancode"]) {
      const existingJanCode: string[] = data["getDistinctRefJancode"]!.filter(
        (jancode: string) => jancode.length >= 10 && jancode.length <= 13
      );
      console.log("janCode: ", existingJanCode);
      return existingJanCode;
    }
    return [];
  } catch (error) {
    console.log(error);
  }
};

export const coreTable = async (wb: WorkBook, supplierName: string) => {
  const worksheet = wb.Sheets[wb.SheetNames[0]];
  const existingJanCode: string[] = (await fetchExistingJancode()) ?? [];
  const itemPositionArr = getItemPosition(worksheet, existingJanCode);
  if (itemPositionArr !== undefined && itemPositionArr.length > 0) {
    const outputData = itemPositionArr.map((item) => {
      const data = processExtractedData(item, worksheet, supplierName);
      console.log("individual row", data);
      return data;
    });
    return outputData;
  }
  return [];
};
