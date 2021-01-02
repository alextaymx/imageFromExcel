var express = require("express");
var app = express();
const { processFileMain } = require("./processFileMain");
const path = require("path");
const fs = require("fs");

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("App listening on port 3000!");
});

// const filename = "2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS";
const filename = "sample.xlsx";
const fileBuffer = fs.readFileSync(path.join(__dirname, filename));
processFileMain(fileBuffer);


processFileMain(
  fs.readFileSync(
    path.join(__dirname, "2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS")
  )
);

processFileMain(
  fs.readFileSync(
    path.join(
      __dirname,
      "2021-01_Tamagotchi_x_EVA_ver.2_Pre-order_(Mass_All)[1]-2.xls"
    )
  )
);
processFileMain(fs.readFileSync(path.join(__dirname, "bigSample.xlsx")));
processFileMain(
  fs.readFileSync(
    path.join(__dirname, "2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS")
  )
);
