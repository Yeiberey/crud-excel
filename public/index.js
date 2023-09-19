const dateUpload = document.getElementById("dateUpload");
const importFile = document.getElementById("importFile");
// importFile.disabled = true;
const buttonUpload = document.querySelector(".buttonUpload");
const buttonClean = document.querySelector(".buttonClean");
const dataResult = document.getElementById("dataResult");
const buttonGenerate = document.querySelector(".buttonGenerate");
const labelProgress = document.getElementById("labelProgress");
const progressBar = document.querySelector(".progress-bar");
const workerReadExcel = new Worker("./readExcel.js");
const workerSearchDB = new Worker("./searchDB.js");

let datos = [];
const buttonFloors = document.querySelector(".buttonFloors");
const buttonOthers = document.querySelector(".buttonOthers");
let category = buttonFloors.name;
buttonFloors.addEventListener("click", handleCategory);
buttonOthers.addEventListener("click", handleCategory);

function handleCategory(e) {
  clean();
  category = e.target.name;
  if (category === "Floors") {
    buttonFloors.style.background = "#addaa7";
    buttonFloors.style.borderBottom = "2px solid #218f13";
  } else {
    buttonFloors.style.background = "none";
    buttonFloors.style.borderBottom = "none";
  }
  if (category === "Others") {
    buttonOthers.style.background = "#addaa7";
    buttonOthers.style.borderBottom = "2px solid #218f13";
  } else {
    buttonOthers.style.background = "none";
    buttonOthers.style.borderBottom = "none";
  }
}

const clean = () => {
  importFile.value = "";
  // buttonGenerate.style.display = "none";
  dataResult.innerText = "";

  labelProgress.innerText = `0%`;
  progressBar.style.width = `0%`;
  progressBar.style.background = "#4caf50";
};
buttonClean.addEventListener("click", clean);
importFile.addEventListener("click", clean);

let file;
importFile.addEventListener("change", handleFileUpload);
function handleFileUpload(e) {
  file = e.target.files[0];
}
buttonUpload.addEventListener("click", handleUpload);
function handleUpload(e) {
  clean();
  if (file && dateUpload.value) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // console.log(e.target.result);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      workerReadExcel.postMessage({
        rows,
        category,
        dateUpload: dateUpload.value.replace(/-/g, "/"),
      });
      dataResult.innerText = "Cargando...";
      workerReadExcel.onmessage = function (e) {
        if (e.data.progress !== undefined) {
          // Actualiza la barra de progreso si se ha enviado
          labelProgress.innerText = `${Math.round(e.data.progress * 100)}%`;
          progressBar.style.width = `${Math.round(e.data.progress * 100)}%`;
        }
        if (e.data.dataResult !== undefined) {
          // Usa el resultado si se ha enviado
          if (e.data.dataResult) {
            dataResult.innerText = "finish cool!";
          } else {
            // manejar el error
            progressBar.style.background = "red";
            dataResult.innerText = "Column not found";
          }
        }
      };
      workerReadExcel.onerror = function (e) {
        // Maneja cualquier error del workerReadExcel
        dataResult.innerText = e.message;
        // buttonGenerate.style.display = "none";
      };
    };
    reader.readAsArrayBuffer(file);
  } else {
    // buttonGenerate.style.display = "none";
    dataResult.innerText = "";
  }
}

buttonGenerate.addEventListener("click", async () => {
  if (datos.length) {
    data = [
      [null, null, null, null],
      ["Código", "Lote", "Hacienda", "Cultivo"],
    ];
    let array = datos.map((row, index) => {
      return [
        row.codigo,
        row.batch.number,
        row.estate.name,
        row.crop.name,
        ...row.parameters.map((parameter, i) => {
          if (index === 0) {
            data[0][i + 4] = parameter.name;
            data[1][i + 4] = parameter.formula;
          }
          return parameter.value.replace(".", ",");
        }),
      ];
    });
    data = [...data, ...array];

    // Crea un nuevo libro de Excel
    const libro = XLSX.utils.book_new();

    // Crea una nueva hoja de cálculo
    const hoja = XLSX.utils.aoa_to_sheet(data);

    // Agrega la hoja de cálculo al libro
    XLSX.utils.book_append_sheet(libro, hoja, "Datos");

    // Descarga el archivo Excel
    XLSX.writeFile(libro, "datos.xlsx");
  }
  // // Crear un nuevo libro de trabajo
  // const workbook = XLSX.utils.book_new();

  // // Crear una hoja de cálculo en el libro de trabajo
  // const data = [
  //   ["Year", "Sales"],
  //   ["2015", 1000],
  //   ["2016", 1500],
  //   ["2017", 2000],
  //   ["2018", 2500],
  // ];
  // const sheet = XLSX.utils.aoa_to_sheet(data);

  // // Crear un objeto de gráfico
  // const chart = {
  //   type: "bar",
  //   options: {
  //     title: {
  //       text: "Sales by Year",
  //     },
  //   },
  //   data: {
  //     labels: XLSX.utils
  //       .sheet_to_json(sheet, { header: 1 })
  //       .slice(1)
  //       .map((e) => e[0]),
  //     datasets: [
  //       {
  //         label: "Sales",
  //         data: XLSX.utils
  //           .sheet_to_json(sheet, { header: 1 })
  //           .slice(1)
  //           .map((row) => row[1]),
  //         backgroundColor: "rgba(129, 152, 48, 0.2)",
  //         borderColor: "rgba(129, 152, 48, 1)",
  //         borderWidth: 1,
  //       },
  //     ],
  //   },
  // };

  // console.log(XLSX.utils, [[chart]]);

  // // Crear una hoja de cálculo para la tabla de datos
  // const tableSheet = XLSX.utils.json_to_sheet(data);

  // // Agregar la hoja de cálculo al libro de trabajo
  // XLSX.utils.book_append_sheet(workbook, tableSheet, "Sales");

  // // Crear una hoja de cálculo para el gráfico
  // const chartSheet = XLSX.utils.aoa_to_sheet([[]]);
  // new Chart(document.getElementById("myChart").getContext("2d"), chart);
  // // Agregar el gráfico a la hoja de cálculo del gráfico
  // XLSX.utils.sheet_add_aoa(chartSheet, [[chart]], { origin: "A1" });

  // // Agregar la hoja de cálculo del gráfico al libro de trabajo
  // XLSX.utils.book_append_sheet(workbook, chartSheet, "Chart");

  // // Escribir el libro de trabajo en un archivo
  // XLSX.writeFile(workbook, "sales.xlsx");
});

const option = document.getElementById("option");
const dateContainer = document.getElementById("date-container");
const date = document.getElementById("date");
const rangeContainer = document.getElementById("range-container");
const startDate = document.getElementById("date-start");
const endDate = document.getElementById("date-end");
const searchDB = document.querySelector(".searchDB");
const checkAllMonth = document.querySelector(".checkAllMonth");

option.addEventListener("change", function () {
  if (option.value === "date") {
    dateContainer.style.display = "flex";
    rangeContainer.style.display = "none";
  } else if (option.value === "range") {
    dateContainer.style.display = "none";
    rangeContainer.style.display = "flex";
  }
});

searchDB.addEventListener("click", function (e) {
  e.preventDefault();
  clean();
  if (option.value === "date" ? date.value : startDate.value && endDate.value) {
    if (option.value === "date" && date.value) {
      workerSearchDB.postMessage({
        date: date.value.replace(/-/g, "/"),
        allMonth: checkAllMonth.checked,
        category,
      });
    } else if (option.value === "range" && startDate.value && endDate.value) {
      workerSearchDB.postMessage({
        startDate: startDate.value.replace(/-/g, "/"),
        endDate: endDate.value.replace(/-/g, "/"),
        category,
      });
    }
    dataResult.innerText = "Cargando...";
    workerSearchDB.onmessage = function (e) {
      if (e.data.progress !== undefined) {
        // Actualiza la barra de progreso si se ha enviado
        labelProgress.innerText = `${Math.round(e.data.progress * 100)}%`;
        progressBar.style.width = `${Math.round(e.data.progress * 100)}%`;
      }
      if (e.data.dataResult !== undefined) {
        // Usa el resultado si se ha enviado
        if (e.data.dataResult.length) {
          datos = e.data.result;
          dataResult.innerText = e.data.dataResult;
          // console.log(datos.map((r) => r.batch.number));
          grafico(datos);
        } else {
          // manejar el error
          progressBar.style.background = "red";
          dataResult.innerText = "Not found";
        }
      }
    };
  } else {
  }

  workerReadExcel.onerror = function (e) {
    // Maneja cualquier error del workerReadExcel
    dataResult.innerText = e.message;
    // buttonGenerate.style.display = "none";
  };
});

function grafico(datos) {
  const config = {
    type: "bar",
    data: {
      labels: datos.map((d) => {
        return "Lote " + d.batch.number + "\n" + d.crop.name;
      }),
      datasets: [
        {
          label: "AcidezExtrac-KCl",
          data: datos.map((d) => {
            return d.parameters[0].value;
          }),
          backgroundColor: "rgba(255, 70, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "B-FosCa",
          data: datos.map((d) => {
            return d.parameters[1].value;
          }),
          backgroundColor: "rgba(129, 152, 48, 0.2)",
          borderColor: "rgba(129, 152, 48, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  // Obtener el canvas y dibujar el gráfico
  const ctx = document.getElementById("myChart").getContext("2d");
  return new Chart(ctx, config);
}
