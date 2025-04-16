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

      // Debug: Verificar o conteúdo da primeira linha
      console.log('Primeira linha:', firstLine);

      if (firstLine.includes("mtec") && firstLine.includes("noite")) {
        numLines = 15;
        ignoreIndex = 10; // MTec + noite → ignora linha 7
        console.log("Condição MTec + Noite", ignoreIndex);
      } else if (firstLine.includes("mtec")) {
        numLines = 15;
        ignoreIndex = 8; // Apenas MTec → ignora linha 11
        console.log("Condição apenas MTec", ignoreIndex);
      } else {
        numLines = 11;
        ignoreIndex = 6; // Outros casos → ignora linha 7
        console.log("Condição sem MTec");
      }

      // Mostrar o conteúdo da linha que será ignorada
      const ignoredLine = jsonData[ignoreIndex];
      console.log("Linha ignorada:", ignoredLine);

      // Ignorar a linha conforme a condição definida
      const limitedData = jsonData.slice(0, numLines).filter((_, idx) => idx !== ignoreIndex);

      // Converter para CSV
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
