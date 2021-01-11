import * as XLSX from "xlsx";
import moment from "moment";
export const processExtractedData = (
  skuAddress: string,
  worksheet: XLSX.WorkSheet,
  supplierSelected: string
) => {
  const ref = worksheet["!ref"];
  const range = XLSX.utils.decode_range(ref as string);
  let janCode = worksheet[skuAddress].v as string;
  let itemNum = "N/A";
  let desc = "N/A";
  let supply = 0;
  let retail = 0;
  let releaseDate = null;
  let orderDate = null;
  let pcsCtn = 0;
  let pcsInner = 0;
  let pckgType = "N/A";
  let pckgSize = [];
  let name = "N/A";
  let resale = false;
  let vers = null;
  let brand = "N/A";
  let moq = "N/A";
  let manufacturer = "N/A";
  let currency = "HKD";
  let currAddress;

  const colRow = XLSX.utils.decode_cell(skuAddress);
  const availableRow = colRow.r;

  for (let R = range.s.r; R < range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cellRef]) continue;
      const cell = worksheet[cellRef];
      if (cell.v !== undefined) {
        const vals = cell.v.toString();
        const item = vals.includes("Item No");
        const desC = vals.includes("Description");
        const supp = vals.includes("WPX");
        const ret = vals.includes("SRP");
        const ret2 = vals.includes("Rpx");
        const ret3 = vals.includes("RPX");
        const rdate = vals.includes("Available");
        const odate = vals.includes("End Date");
        const odate2 = vals.includes("Order Deadline");
        const pcsC = vals.includes("/Ctn");
        const pcsI = vals.includes("/Inner");
        const pckT = "Package";
        const pckS = vals.search("Size");
        const nameChinese = vals.includes("中文貨名");
        const nameEnglish = vals.includes("Name");
        const nameJapanese = vals.includes("日文貨名");
        const reSale = vals.includes("新");
        const reSale2 = vals.includes("Resale");
        const vs = vals.includes("Origin");
        const bd2 = vals.includes("Brand");
        const moQ = vals.includes("Minimum");
        const manu = vals.includes("Manufacturer");
        const addres = XLSX.utils.encode_cell({ c: C, r: availableRow });

        if (item === true) {
          if (worksheet[addres] !== undefined) {
            itemNum = worksheet[addres].v;
          }
        } else if (desC === true) {
          if (worksheet[addres] !== undefined) {
            desc = worksheet[addres].v;
          }
        } else if (supp === true) {
          const check = XLSX.utils.encode_cell({ c: C, r: R - 1 });
          if (worksheet[check] !== undefined && worksheet[check].v === "TS") {
            if (worksheet[addres] !== undefined) {
              const P = worksheet[addres].v;
              const sP = P.toString();
              const filter = sP.replace(/[a-zA-Z]/g, "");
              if (filter.length > 0) {
                supply = parseInt(filter);
              }
              currAddress = XLSX.utils.encode_cell({ c: C, r: R });
            }
          } else if (
            worksheet[check] !== undefined &&
            worksheet[check].v !== "TS"
          ) {
          } else {
            if (worksheet[addres] !== undefined) {
              const P = worksheet[addres].v;
              const sP = P.toString();
              const filter = sP.replace(/[a-zA-Z]/g, "");
              if (filter.length > 0) {
                supply = parseInt(filter);
              }
              currAddress = XLSX.utils.encode_cell({ c: C, r: R });
            }
          }
        } else if (ret === true || ret2 === true || ret3 === true) {
          if (worksheet[addres] !== undefined) {
            const P = worksheet[addres].v;
            const rP = P.toString();
            const filter = rP.replace(/[a-zA-Z]/g, "");
            if (filter.length > 0) {
              retail = parseInt(filter);
            }
          }
        } else if (rdate === true) {
          if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "object"
          ) {
            const date = worksheet[addres].v;
            const temDate = moment(new Date(date)).format("YYYY-MM-DD");
            if (temDate !== "Invalid date" && temDate !== undefined) {
              releaseDate = temDate;
            }
          } else if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "string"
          ) {
            const date = worksheet[addres].v;
            const temDate = moment(new Date(date)).format("YYYY-MM-DD");
            if (temDate !== "Invalid date" && temDate !== undefined) {
              releaseDate = temDate;
            }
          }
        } else if (odate === true || odate2 === true) {
          if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "object"
          ) {
            const date = worksheet[addres].v;
            const temDate = moment(new Date(date)).format("YYYY-MM-DD");

            if (temDate !== "Invalid date" && temDate !== undefined) {
              orderDate = temDate;
            }
          } else if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "string"
          ) {
            const date = worksheet[addres].v;
            const temDate = moment(new Date(date)).format("YYYY-MM-DD");

            if (temDate !== "Invalid date" && temDate !== undefined) {
              orderDate = temDate;
            }
          }
        } else if (pcsC === true) {
          if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "number"
          ) {
            pcsCtn = parseInt(worksheet[addres].v);
          }
        } else if (pcsI === true) {
          if (
            worksheet[addres] !== undefined &&
            typeof worksheet[addres].v === "number"
          ) {
            pcsInner = parseInt(worksheet[addres].v);
          }
        } else if (cell.v === pckT) {
          if (worksheet[addres] !== undefined) {
            pckgType = worksheet[addres].v;
          }
        } else if (pckS !== -1) {
          const check = XLSX.utils.encode_cell({ c: C + 1, r: R });
          const check2 = XLSX.utils.encode_cell({ c: C + 2, r: R });
          const addresH = XLSX.utils.encode_cell({ c: C + 1, r: availableRow });
          const addresW = XLSX.utils.encode_cell({ c: C + 2, r: availableRow });
          if (worksheet[addres] !== undefined) {
            pckgSize.push(worksheet[addres].v);
          } else {
            pckgSize.push("N/A");
          }
          if (
            worksheet[check] === undefined &&
            worksheet[addresH] !== undefined
          ) {
            pckgSize.push(worksheet[addresH].v);
          } else {
            pckgSize.push("N/A");
          }
          if (
            worksheet[check2] === undefined &&
            worksheet[addresW] !== undefined
          ) {
            pckgSize.push(worksheet[addresW].v);
          } else {
            pckgSize.push("N/A");
          }
        } else if (
          nameChinese === true ||
          nameEnglish === true ||
          nameJapanese
        ) {
          if (worksheet[addres] !== undefined) {
            name = worksheet[addres].v;
          }
        } else if (reSale === true || reSale2 === true) {
          if (worksheet[addres] !== undefined) {
            if (worksheet[addres].v === "N") {
              resale = false;
            } else {
              resale = true;
            }
          }
        } else if (vs === true) {
          if (worksheet[addres] !== undefined) {
            const versi = worksheet[addres].v;
            if (
              versi.toLowerCase() === "hk" ||
              versi.toLowerCase() === "hong kong" ||
              versi.toLowerCase() === "hongkong"
            ) {
              vers = "HongKong";
            } else if (
              versi.toLowerCase() === "cn" ||
              versi.toLowerCase() === "china"
            ) {
              vers = "China";
            } else if (
              versi.toLowerCase() === "jp" ||
              versi.toLowerCase() === "japan"
            ) {
              vers = "Japan";
            }
          }
        } else if (bd2 === true) {
          if (worksheet[addres] !== undefined) {
            brand = worksheet[addres].v;
          }
        } else if (moQ === true) {
          if (worksheet[addres] !== undefined) {
            moq = worksheet[addres].v;
          }
        } else if (manu === true) {
          if (worksheet[addres] !== undefined) {
            manufacturer = worksheet[addres].v;
          }
        }
      }
    }
  }

  if (currAddress !== undefined) {
    const check = worksheet[currAddress].v as string;
    const c1 = check.includes("HK");
    const c2 = check.includes("US");
    const c3 = check.includes("MYR");
    const c4 = check.includes("Yen");
    if (c1 === true) {
      currency = "HKD";
    } else if (c2 === true) {
      currency = "USD";
    } else if (c3 === true) {
      currency = "MYR";
    } else if (c4 === true) {
      currency = "JPY";
    }
  }

  if (pckgSize.length < 1) {
    pckgSize.push("N/A");
  }
  const pSize = pckgSize.join(" | ");

  let pO = false;
  if (releaseDate !== null) {
    const today = new Date();
    const dat = releaseDate as string;
    const rD = new Date(dat);
    if (rD > today) {
      pO = true;
    } else {
      pO = false;
    }
  }

  const Type = {
    Version: vers,
  };

  const Currency = {
    Currency: currency,
  };
  const preorder = pO;

  const SupplierForm = {
    nameOrId: supplierSelected,
    currency: Currency.Currency,
  };

  return {
    jancode: janCode.toString(),
    name: name.toString(),
    resale: resale,
    preorder: preorder,
    supplyPrice: supply,
    itemNo: itemNum,
    description: desc,
    brand: brand,
    retailPrice: retail,
    releaseDate: releaseDate,
    orderDeadline: orderDate,
    pcs_ct: pcsCtn,
    pcs_inner: pcsInner,
    packageType: pckgType,
    packageSize: pSize,
    moq: moq,
    manufacturer: manufacturer,
    version: Type.Version,
    supplier: SupplierForm,
  };
};
