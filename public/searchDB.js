importScripts("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");
onmessage = async function (e) {
  let startDate = e.data.startDate;
  let endDate = e.data.endDate;
  let date = e.data.date;
  let allMonth = e.data.allMonth;
  let category = e.data.category;
  let dataResult = "";
  if (date) {
    await axios
      .get(`/reports?date=${date}&allMonth=${allMonth}&category=${category}`)
      .then(({ data }) => {
        data.map((row, index) => {
          postMessage({
            progress: index / data.length,
          }); // Envía el progreso al hilo principal
          dataResult +=
            (index > 0 ? "\n" : "") +
            (index + 1) +
            ". " +
            row.estate.name +
            ", " +
            row.crop.name;
        });
        postMessage({ progress: 1, result: data, dataResult });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    await axios
      .get(
        `/reports?startDate=${startDate}&endDate=${endDate}&category=${category}`
      )
      .then(({ data }) => {
        data.map((row, index) => {
          postMessage({
            progress: index / data.length,
          }); // Envía el progreso al hilo principal
          dataResult +=
            (index > 0 ? "\n" : "") +
            (index + 1) +
            ". " +
            row.estate.name +
            ", " +
            row.crop.name;
        });
        postMessage({ progress: 1, result: data, dataResult });
      })
      .catch((error) => {});
  }
};
