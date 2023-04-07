onmessage = function (e) {
  const rows = e.data.rows;
  const nameColumn = e.data.nameColumn;
  let index;
  let dataResult = "";
  const array = rows
    .filter((row, i) => {
      postMessage({ progress: i / (rows.length - row.length) }); // Envía el progreso al hilo principal
      const includeColumn = row.includes(nameColumn);
      if (includeColumn) {
        index = row.indexOf(nameColumn);
      }
      return row.length && !includeColumn;
    })
    .filter((row, i) => {
      postMessage({ progress: i / (rows.length - row.length) }); // Envía el progreso al hilo principal
      dataResult += (i > 0 ? "\n" : "") + row[index];
      return typeof index === "number" && index > -1 && row[index];
    })
    .map((row, i) => {
      postMessage({ progress: i / (rows.length - row.length) }); // Envía el progreso al hilo principal

      return [row[index]];
    });
  postMessage({ result: array, dataResult }); // Envía el resultado al hilo principal
};
