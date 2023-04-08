onmessage = function (e) {
  const rows = e.data.rows;
  const nameColumn = e.data.nameColumn;
  let index;
  let dataResult = "";
  const array1 = rows.filter((row, i) => {
    postMessage({ progress: i / (rows.length * 3) }); // Envía el progreso al hilo principal
    const includeColumn = row.includes(nameColumn);
    if (includeColumn) {
      index = row.indexOf(nameColumn);
    }
    return row.length && !includeColumn;
  });
  const array2 = array1.filter((row, i) => {
    postMessage({
      progress: (rows.length + i) / (rows.length + array1.length * 2),
    }); // Envía el progreso al hilo principal
    const undefined = typeof index === "number" && index > -1 && row[index];
    if (undefined) {
      dataResult += (i > 0 ? "\n" : "") + (i + 1) + ". " + row[index];
    }
    return undefined;
  });
  const array3 = array2.map((row, i) => {
    postMessage({
      progress:
        (rows.length + array1.length + i) /
        (rows.length + array1.length + array2.length),
    }); // Envía el progreso al hilo principal

    return [row[index]];
  });
  postMessage({ progress: 1, result: array3, dataResult }); // Envía el resultado al hilo principal
};
