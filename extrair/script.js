let csvFiles = [];

function processFile() {
  const fileInput = document.getElementById('excelFile');
  const statusDiv = document.getElementById('status');

  if (!fileInput.files.length) {
    alert("Por favor, selecione um arquivo Excel.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });

    csvFiles = [];

    workbook.SheetNames.forEach(function(sheetName) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) return;

      const firstLine = (jsonData[0][0] || "").toString().toLowerCase();

      let numLines = 11;
      let ignoreIndex = 6; // padrão: ignorar linha 7

      if (firstLine.includes("mtec")) {
        numLines = 15;
        ignoreIndex = 10; // ignorar linha 11
      } else if (firstLine.includes("noite")) {
        numLines = 15;
        ignoreIndex = 6; // ignorar linha 7
      }

      const limitedData = jsonData.slice(0, numLines).filter((_, idx) => idx !== ignoreIndex);

      const csvData = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(limitedData), { FS: ";" });
      csvFiles.push({ sheetName, csvData });
    });

    combineCSVFiles();
    statusDiv.innerHTML = 'Conversão e combinação concluídas com sucesso!';
  };

  reader.onerror = function(error) {
    alert("Erro ao ler o arquivo: " + error);
  };

  reader.readAsBinaryString(file);
}

function combineCSVFiles() {
  let combinedData = [];

  csvFiles.forEach(file => {
    const rows = file.csvData.split('\n');
    rows.forEach(row => {
      if (row.trim() !== "") {
        combinedData.push(row);
      }
    });
  });

  const combinedCsvData = combinedData.join('\n');
  saveCSV(combinedCsvData, 'combined_output.csv');
}

function saveCSV(csvData, fileName) {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
