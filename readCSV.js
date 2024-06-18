const fs = require("fs");
const csv = require("csv-parser");

//function to read csv file
const readCsvFile = async (filepath) => {
  // Data structures to store CSV data and headers
  let csvData = [];
  let csvHeaders = [];
  let count = 0;
  return new Promise((resolve, reect) => {
    // Read CSV file and process data
    fs.createReadStream(filepath)
      .pipe(csv({ separator: "," }))
      .on("headers", (headers) => {
        csvHeaders.push(headers);
      })
      .on("data", (row) => {
        // Merge columns agtv_1 to agtv_5 into one key 'agtv'
        const agtv = [];
        for (let i = 1; i <= 21; i++) {
          if (row[`agtv_${i}`]) {
            agtv.push(row[`agtv_${i}`]);
            delete row[`agtv_${i}`]; // Remove individual agtv columns
          }
        }
        row.agtv = agtv.join(""); // Merge into one string

        // Remove whitespaces from row values
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === "string") {
            row[key] = row[key].replace(/\s/g, "");
          }
        });

        // if (count < 1) {
          csvData.push(row);
        // }
        count++;
      })
      .on("end", () => {
        resolve({ csvHeaders: csvHeaders, csvData: csvData });
      });
  });
};

module.exports = { readCsvFile };
