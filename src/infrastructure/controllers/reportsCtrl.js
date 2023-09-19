const { Sequelize } = require("sequelize");
const {
  Report,
  Category,
  Estate,
  Batch,
  Crop,
  Parameter,
  conn,
  Op,
} = require("../../db.js");

const getDBReports = async ({
  date,
  allMonth,
  startDate,
  endDate,
  category = "Floors",
}) => {
  let startDateAllMonth;
  let endDateAllMonth;
  allMonth = allMonth === "true";
  if (date && allMonth) {
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();
    startDateAllMonth = new Date(year, month - 1, 1);
    endDateAllMonth = new Date(year, month, 0);
  }
  const reports = await Report.findAll({
    where: date
      ? allMonth
        ? {
            date: {
              [Op.between]: [
                new Date(startDateAllMonth),
                new Date(endDateAllMonth),
              ],
            },
          }
        : { date: new Date(date) }
      : startDate && endDate
      ? { date: { [Op.between]: [new Date(startDate), new Date(endDate)] } }
      : {},
    order: [
      // ["id", "asc"],
      // [Batch, "number", "asc"],
      // Se ordena primero por números (si es posible)
      // [
      //   Sequelize.literal(
      //     "(CASE WHEN Batch.number ~ E'^\\d+$' THEN CAST(Batch.number AS DECIMAL) END)"
      //   ),
      //   "ASC",
      // ],
      // Luego se ordena por las cadenas alfanuméricas
      // [Sequelize.literal("Batch.number"), "ASC"],
    ],
    include: [
      {
        model: Category,
        attributes: { exclude: ["id"] },
        where: { name: category },
      },
      {
        model: Estate,
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: Batch,
        attributes: { exclude: ["id", "estateId"] },
      },
      {
        model: Crop,
        attributes: { exclude: ["id", "estateId"] },
      },
      {
        model: Parameter,
        attributes: { exclude: ["id", "reportId"] },
      },
      // {
      //   model: Report,
      //   include: { model: Parameter, attributes: { exclude: ["id"] } },
      // },
    ],
    attributes: {
      exclude: [
        "id",
        "updatedAt",
        "categoryId",
        "estateId",
        "batchId",
        "cropId",
      ],
    },
  });
  reports.sort((a, b) => naturalCompare(a.batch.number, b.batch.number));
  return reports;
};

const dbCreateReport = async (body) => {
  const [category, createdCategory] = await Category.findOrCreate({
    where: { name: body.category },
    defaults: { name: body.category },
  });
  const [estate, createdEstate] = await Estate.findOrCreate({
    where: { name: body.estate },
    defaults: { name: body.estate },
  });
  const [batch, createdBatch] = await Batch.findOrCreate({
    where: { number: body.batch, estateId: estate.id },
    defaults: { number: body.batch, estateId: estate.id },
  });
  const [crop, createdCrop] = await Crop.findOrCreate({
    where: { name: body.crop },
    defaults: { name: body.crop },
  });
  const { codigo, date } = body;
  const [report, createdReport] = await Report.findOrCreate({
    where: { codigo },
    defaults: {
      codigo,
      date,
      categoryId: category.id,
      estateId: estate.id,
      batchId: batch.id,
      cropId: crop.id,
    },
  });
  if (createdReport) {
    const createdParameters = [];

    body.parameters.forEach((parameter) => {
      parameter.reportId = report.id;
      createdParameters.push(parameter);
    });
    await Parameter.bulkCreate(createdParameters);
  }

  return { ...report.dataValues, estate: estate.name };
};
const naturalCompare = (a, b) => {
  const ax = [];
  const bx = [];

  a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    ax.push([$1 || Infinity, $2 || ""]);
  });
  b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    bx.push([$1 || Infinity, $2 || ""]);
  });

  for (let i = 0; i < ax.length && i < bx.length; i++) {
    const anum = ax[i][0] !== Infinity;
    const bnum = bx[i][0] !== Infinity;

    if (anum && !bnum) return -1;
    if (!anum && bnum) return 1;
    if (anum && bnum) {
      if (ax[i][0] - bx[i][0] !== 0) return ax[i][0] - bx[i][0];
    } else {
      const cmp = ax[i][1].localeCompare(bx[i][1]);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
};
module.exports = {
  getDBReports,
  dbCreateReport,
};
