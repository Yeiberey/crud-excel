const buttonGenerate = document.querySelector(".buttonGenerate");
console.log(buttonGenerate);

const datos = [
  ["Nombre", "Edad", "País"],
  ["Juan", 32, "México"],
  ["María", 28, "España"],
  ["Pedro", 40, "Argentina"],
];

// Crea un nuevo libro de Excel
const libro = XLSX.utils.book_new();

// Crea una nueva hoja de cálculo
const hoja = XLSX.utils.aoa_to_sheet(datos);

// Agrega la hoja de cálculo al libro
XLSX.utils.book_append_sheet(libro, hoja, "Datos");

// Descarga el archivo Excel
XLSX.writeFile(libro, "datos.xlsx");
