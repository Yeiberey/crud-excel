const buttonImport = document.getElementById("importFile");
const buttonClean = document.querySelector(".buttonClean");
const buttonGenerate = document.querySelector(".buttonGenerate");

let datos = [
  ["Nombre", "Edad", "País"],
  ["Juan", 32, "México"],
  ["María", 28, "España"],
  ["Pedro", 40, "Argentina"],
];

buttonClean.addEventListener("click", () => {
  buttonImport.value = "";
  buttonGenerate.style.display = "none";
});

buttonImport.addEventListener("change", handleFileUpload);
function handleFileUpload(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const nameColumn = "Nombre";
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const array = rows
        .filter((row) => row.length && row[0] !== nameColumn)
        .map((row) => [row[0]]);
      datos = [["Nombres"], ...array];
      console.log(array); // ["Juan", "María", "Pedro"]
    };
    reader.readAsArrayBuffer(file);
    buttonGenerate.style.display = "initial";
  } else {
    buttonGenerate.style.display = "none";
  }
}

buttonGenerate.addEventListener("click", () => {
  console.log(datos);
  // Crea un nuevo libro de Excel
  const libro = XLSX.utils.book_new();

  // Crea una nueva hoja de cálculo
  const hoja = XLSX.utils.aoa_to_sheet(datos);

  // Agrega la hoja de cálculo al libro
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");

  // Descarga el archivo Excel
  XLSX.writeFile(libro, "datos.xlsx");
});
