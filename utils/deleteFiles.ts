// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

module.exports.deleteFile = (fileArr: any) => {
  // fs.rmdirSync("./outputImages", { recursive: true });
  fileArr.forEach((file: any) => fs.unlink(path.join(__dirname, file), (err: any) => {
    if (err) throw err;
  })
  );
  console.info("Deleted");
};
