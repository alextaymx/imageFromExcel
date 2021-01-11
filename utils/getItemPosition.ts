import * as XLSX from "xlsx";

export const getItemPosition = (
  worksheet: XLSX.WorkSheet,
  existingJanCode: string | any[]
) => {
  const ref = worksheet["!ref"];
  const range = XLSX.utils.decode_range(ref as string);
  const itemPosition = [];
  let codeAddress = null;
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cellRef]) continue;
      const cell = worksheet[cellRef];
      const vals = cell.v.toString();
      const checkVal = vals.replace(/[^0-9]/g, "");
      if (existingJanCode.length > 0) {
        let duplicate = false;
        for (let jC of existingJanCode) {
          if (checkVal === jC) duplicate = true;
        }
        if (duplicate === false) {
          const isBarcode = checkVal.length;
          const isLength = vals.length;
          if (
            isBarcode > 10 &&
            typeof cell.v !== "object" &&
            isLength > 10 &&
            isLength < 15
          )
            itemPosition.push(cellRef);
        }
      } else {
        const isBarcode = checkVal.length;
        const isLength = vals.length;
        if (
          isBarcode > 10 &&
          typeof cell.v !== "object" &&
          isLength > 10 &&
          isLength < 15
        )
          itemPosition.push(cellRef);
      }
      if (vals === "Barcode") {
        codeAddress = C;
      }
      if (codeAddress !== null && codeAddress === C) {
        if (
          vals !== undefined &&
          vals !== "Barcode" &&
          checkVal.length < 10 &&
          typeof cell.v !== "object"
        ) {
          itemPosition.push(cellRef);
        }
      }
    }
  }
  return itemPosition;
};
