// tentativas de pegar somente 6 colunas pra nao precisar apagar os ; ou excluir as ultimas colunas, 
//pra turma da noite sumiu o no dos professores na ultima aula
let csvFiles = [];  // Aqui armazenamos os CSVs gerados.

function processFile() {
  const fileInput = document.getElementById('excelFile');
  const numRowsInput = document.getElementById('numRows');
  const ignoreLineInput = document.getElementById('ignoreLine');
  const statusDiv = document.getElementById('status');
  
  if (!fileInput.files.length) {
    alert("Por favor, selecione um arquivo Excel.");
    return;
  }

  const file = fileInput.files[0];
  const numRows = parseInt(numRowsInput.value) || 0;
  const ignoreLine = parseInt(ignoreLineInput.value) || 0;

  if (numRows <= 0) {
    alert("Por favor, insira um número válido de linhas.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });

    // Limpar CSVs anteriores
    csvFiles = [];

    // Para cada aba, gera um CSV com o número de linhas especificado
    workbook.SheetNames.forEach(function(sheetName) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // const limitedData = jsonData.slice(0, numRows);
      // Limita o número de linhas e colunas (6 primeiras colunas)
      const limitedData = jsonData
      .slice(0, numRows)
      .map(row => row.slice(0, 6)); // aqui pegamos só as 6 primeiras colunas
      const csvData = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(limitedData), { FS: ";" });
      csvFiles.push({ sheetName, csvData });
    });

    combineCSVFilesAndRemoveLine(ignoreLine);
    statusDiv.innerHTML = 'Conversão e combinação concluídas com sucesso!';
  };

  reader.onerror = function(error) {
    alert("Erro ao ler o arquivo: " + error);
  };

  reader.readAsBinaryString(file);
}

function combineCSVFilesAndRemoveLine(ignoreLine) {
  let combinedData = [];

  csvFiles.forEach(file => {
    const rows = file.csvData.split('\n');
    rows.forEach((row, index) => {
      if (index !== ignoreLine - 1 && row.trim() !== "") {  // Remove linha vazia
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
