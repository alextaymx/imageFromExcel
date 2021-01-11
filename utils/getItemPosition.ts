import * as XLSX from "xlsx";

export const getItemPosition = (
  worksheet: XLSX.WorkSheet,
  existingJanCode: string[]
) => {
  const ref = worksheet["!ref"];
  const range = XLSX.utils.decode_range(ref as string);
  const itemPosition = [];
  const targetedColName = ["barcode", "jancode"];
  let targetedColIndex = -1;
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cellRef]) continue;
      const cell = worksheet[cellRef];
      const vals = cell.v.toString();
      const checkVal = vals.replace(/[^0-9]/g, "");
      if (!existingJanCode.includes(checkVal)) {
        const trimmedLength = checkVal.length;
        const oriLength = vals.length;
        if (
          trimmedLength > 10 &&
          typeof cell.v !== "object" &&
          oriLength > 10 &&
          oriLength < 15
        )
          itemPosition.push(cellRef);
      }
      // if (existingJanCode.length > 0) {
      //   // let duplicate = false;
      //   // const duplicate = existingJanCode.includes(checkVal);
      //   // for (let jC of existingJanCode) {
      //   //   if (checkVal === jC) duplicate = true;
      //   // }
      //   if (!existingJanCode.includes(checkVal)) {
      //     const isBarcode = checkVal.length;
      //     const isLength = vals.length;
      //     if (
      //       isBarcode > 10 &&
      //       typeof cell.v !== "object" &&
      //       isLength > 10 &&
      //       isLength < 15
      //     )
      //       itemPosition.push(cellRef);
      //   }
      // } else {
      //   const isBarcode = checkVal.length;
      //   const isLength = vals.length;
      //   if (
      //     isBarcode > 10 &&
      //     typeof cell.v !== "object" &&
      //     isLength > 10 &&
      //     isLength < 15
      //   )
      //     itemPosition.push(cellRef);
      // }
      if (targetedColName.includes(vals.toLowerCase())) {
        targetedColIndex = C;
      }
      if (targetedColIndex !== -1 && targetedColIndex === C) {
        if (
          vals !== undefined &&
          !targetedColName.includes(vals.toLowerCase()) &&
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
