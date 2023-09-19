importScripts("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");
onmessage = async function (e) {
  const rows = e.data.rows;
  let dataResult = "";
  for (let index = 2; index < rows.length; index++) {
    const element = rows[index];
    let data = { parameters: [] };
    let codigo = "";
    let partes = [];
    element.map((value, i) => {
      if (i === 0) {
        codigo = value;
      } else if (i === 1) {
        let [batch, estate, crop] = value.split(",");
        batch = batch.replace(/^(Lote|L)\s*/i, "");
        batch = batch.trim().replace(/( +)/g, "");
        estate = estate.trim().match(/\.( +)(.+)/)[2];
        crop = crop.trim().match(/\b(\w+)\b/g);
        if (crop.length > 2) {
          crop.pop();
        }
        crop.shift();
        crop = crop.join("").trim().replace(/\./g, "");
        partes = batch.split("-");
        data = { ...data, batch, estate, crop };
      } else {
        data.parameters.push({
          name: rows[0][i],
          value,
          formula: rows[1][i],
        });
      }
    });
    data.date = e.data.dateUpload;
    data.category = e.data.category;
    // console.log("dataFila", data);
    if (partes.length > 0) {
      const promises = partes.map((p, i) => {
        if (p.length) {
          data.batch = p;
          if (i > 0) data.codigo = codigo + "-" + p;
          else data.codigo = codigo;
          return axios
            .post("/reports", data)
            .then((response) => {
              postMessage({
                progress: index / rows.length,
              }); // Envía el progreso al hilo principal
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
      await Promise.all(promises);
    }
  }
  dataResult = true;

  // const array1 = rows.filter((row, i) => {
  //   postMessage({ progress: i / (rows.length * 3) }); // Envía el progreso al hilo principal
  //   const includeColumn = row.includes(nameColumn);
  //   if (includeColumn) {
  //     index = row.indexOf(nameColumn);
  //   }
  //   return row.length && !includeColumn;
  // });
  // const array2 = array1.filter((row, i) => {
  //   postMessage({
  //     progress: (rows.length + i) / (rows.length + array1.length * 2),
  //   }); // Envía el progreso al hilo principal
  //   const undefined = typeof index === "number" && index > -1 && row[index];
  //   if (undefined) {
  //     dataResult += (i > 0 ? "\n" : "") + (i + 1) + ". " + row[index];
  //   }
  //   return undefined;
  // });
  // const array3 = array2.map((row, i) => {
  //   postMessage({
  //     progress:
  //       (rows.length + array1.length + i) /
  //       (rows.length + array1.length + array2.length),
  //   }); // Envía el progreso al hilo principal

  //   return [row[index]];
  // });
  postMessage({ progress: 1, dataResult }); // Envía el resultado al hilo principal
};
