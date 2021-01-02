var express = require("express");
var app = express();
const {processFileMain} = require('./processFileMain');
const path = require("path");
const fs = require("fs");

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("App listening on port 3000!");
});



// processFileMain("2021-01_Tamagotchi_x_EVA_ver.2_Pre-order_(Mass_All)[1]-2.xls");
// processFileMain("2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS");
// processFileMain("bigSample.xlsx")
const filename = "sample.xlsx";
// const filename = "2021-05_Tamashii_Web_SHF-Pre_Order_Mass_TS.XLS";
const fileBuffer = fs.readFileSync(path.join(__dirname, filename));
processFileMain(fileBuffer);
