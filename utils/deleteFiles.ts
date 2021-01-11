import * as path from "path";
import * as fs from "fs";

module.exports.deleteFile = (fileArr: any) => {
  // fs.rmdirSync("./outputImages", { recursive: true });
  console.log(fileArr);
  fileArr.forEach((file: any) =>
    fs.unlink(path.join(__dirname, file), (err: any) => {
      if (err) throw err;
    })
  );
  console.info("Deleted");
};
