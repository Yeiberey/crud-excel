const inputColumn = document.getElementById("inputColumn");
const buttonImport = document.getElementById("importFile");
// buttonImport.disabled = true;
const buttonClean = document.querySelector(".buttonClean");
const dataResult = document.getElementById("dataResult");
const buttonGenerate = document.querySelector(".buttonGenerate");
const labelProgress = document.getElementById("labelProgress");
const progressBar = document.querySelector(".progress-bar");

const worker = new Worker("./readExcel.js");

let datos = [
  ["Nombre", "Edad", "País"],
  ["Juan", 32, "México"],
  ["María", 28, "España"],
  ["Pedro", 40, "Argentina"],
];

const clean = () => {
  buttonImport.value = "";
  buttonGenerate.style.display = "none";
  dataResult.innerText = "";

  labelProgress.innerText = `0%`;
  progressBar.style.width = `0%`;
};
inputColumn.addEventListener("input", (e) => {
  buttonImport.disabled = !e.target.value.length;
});
buttonClean.addEventListener("click", clean);
buttonImport.addEventListener("click", clean);

buttonImport.addEventListener("change", handleFileUpload);
function handleFileUpload(e) {
  labelProgress.innerText = `0%`;
  progressBar.style.width = `0%`;
  progressBar.style.background = "#4caf50";
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const nameColumn = inputColumn.value.toString();
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      worker.postMessage({ rows, nameColumn });
      dataResult.innerText = "Cargando...";
      worker.onmessage = function (e) {
        if (e.data.progress !== undefined) {
          // Actualiza la barra de progreso si se ha enviado
          labelProgress.innerText = `${Math.round(e.data.progress * 100)}%`;
          progressBar.style.width = `${Math.round(e.data.progress * 100)}%`;
        }
        if (e.data.result !== undefined) {
          // Usa el resultado si se ha enviado
          if (e.data.result.length) {
            datos = [[nameColumn], ...e.data.result];
            dataResult.innerText = e.data.dataResult;
            buttonGenerate.style.display = "initial";
          } else {
            // manejar el error
            progressBar.style.background = "red";
            dataResult.innerText = "Column not found";
            buttonGenerate.style.display = "none";
          }
        }
      };
      worker.onerror = function (e) {
        // Maneja cualquier error del worker
        dataResult.innerText = e.message;
        buttonGenerate.style.display = "none";
      };
    };
    reader.readAsArrayBuffer(file);
  } else {
    buttonGenerate.style.display = "none";
    dataResult.innerText = "";
  }
}

buttonGenerate.addEventListener("click", () => {
  // Crea un nuevo libro de Excel
  const libro = XLSX.utils.book_new();

  // Crea una nueva hoja de cálculo
  const hoja = XLSX.utils.aoa_to_sheet(datos);

  // Agrega la hoja de cálculo al libro
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");

  // Descarga el archivo Excel
  XLSX.writeFile(libro, "datos.xlsx");
});
