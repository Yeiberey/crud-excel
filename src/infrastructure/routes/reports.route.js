const { Router } = require("express");
const { dbCreateReport, getDBReports } = require("../controllers/reportsCtrl");
const router = Router();
// const XLSXChart = require("xlsx-chart");

/**
 * http://localhost/suelos POST
 */
router.get("/", async (req, res) => {
  try {
    const report = await getDBReports(req.query);
    // var xlsxChart = new XLSXChart();
    // var opts = {
    //   file: "chart.xlsx",
    //   chart: "column",
    //   titles: ["Title 1", "Title 2", "Title 3"],
    //   fields: ["Field 1", "Field 2", "Field 3", "Field 4"],
    //   data: {
    //     "Title 1": {
    //       "Field 1": 5,
    //       "Field 2": 10,
    //       "Field 3": 15,
    //       "Field 4": 20,
    //     },
    //     "Title 2": {
    //       "Field 1": 10,
    //       "Field 2": 5,
    //       "Field 3": 20,
    //       "Field 4": 15,
    //     },
    //     "Title 3": {
    //       "Field 1": 20,
    //       "Field 2": 15,
    //       "Field 3": 10,
    //       "Field 4": 5,
    //     },
    //   },
    // };
    // xlsxChart.writeFile(opts, function (err) {
    //   console.log("File: ", opts.file);
    // });
    res.status(200).send(report);
  } catch ({ message }) {
    res.status(404).send(message);
  }
});
router.post("/", async (req, res) => {
  try {
    const createdReport = await dbCreateReport(req.body);
    res.status(200).json(createdReport);
  } catch ({ message }) {
    res.status(404).send(message);
  }
});

module.exports = { router };
