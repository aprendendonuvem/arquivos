let intervaloAtualizacao = null;

function toggleAtualizacaoAutomatica() {
    const checkbox = document.getElementById("auto-update");

    if (checkbox.checked) {
        // Inicia a atualização automática a cada 1 minuto (60.000 ms)
        intervaloAtualizacao = setInterval(atualizarHorario, 60000);
        atualizarHorario(); // Executa uma vez imediatamente
    } else {
        // Para a atualização automática
        clearInterval(intervaloAtualizacao);
        location.reload(); // Executa uma vez imediatamente
    }
}

function atualizarHorario() {
    const horarios = [
        "7h10 - 8h00", "8h00 - 8h50", "8h50 - 9h40", "10h00 - 10h50", "10h50 - 11h40", "11h40 - 12h30",
        "13h00 - 13h50", "13h50 - 14h40", "14h40 - 15h30", "15h50 - 16h40", "16h40 - 17h30", "17h30 - 18h20",
        "17h40 - 18h30", "18h30 - 19h20", "19h20 - 20h10", "20h10 - 21h00", "21h10 - 22h00", "22h00 - 22h50",
        "18:50 - 20:42", "21:00 - 22:52"
    ];

    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    const horarioFormatado = horaAtual.toString().padStart(2, '0') + "h" + minutoAtual.toString().padStart(2, '0');

    function converterParaMinutos(horario) {
        const [inicio, fim] = horario.split(" - ");
        const [h1, m1] = inicio.split(/h|:/).map(Number);
        const [h2, m2] = fim.split(/h|:/).map(Number);
        return [(h1 * 60 + m1), (h2 * 60 + m2)];
    }

    let horarioSelecionado = horarios.find(horario => {
        const [inicio, fim] = converterParaMinutos(horario);
        const minutosAtuais = horaAtual * 60 + minutoAtual;
        return minutosAtuais >= inicio && minutosAtuais <= fim;
    });

    if (horarioSelecionado) {
        document.getElementById("horario-selecionado").value = horarioSelecionado;
        document.getElementById("periodo-selecionado").value = "todos";
        gerarTabelas();
    }
}
    let dadosSalasManha = [];
    let dadosSalasTarde = [];
    let dadosSalasNoite = [];
    let dadosSalasNoiteTecnico = [];

    async function baixarArquivo(url, periodo) {
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        const csv = await resposta.text();
        processarCSV(csv, periodo);
    } catch (erro) {
        console.error(`Erro ao baixar ${url}:`, erro);
    }
}

        // Função para processar cada arquivo CSV
        function processarCSV(csv, periodo) {
            const linhas = csv.split('\n').map(linha => linha.trim()).filter(linha => linha);
            let salaAtual = null;

            // Define a quantidade de linhas por sala conforme o período
            const linhasPorSala = (periodo === 'noiteTecnico') ? 10 : 14;

            for (let i = 0; i < linhas.length; i += linhasPorSala) {
                salaAtual = {
                    nome: linhas[i].split(';')[0],
                    horarios: []
                };

                const diasSemana = linhas[i + 1].split(';');

                // Determina o início correto das disciplinas e professores com base no período
                const inicioLinhas = 2;
                const fimLinhas = (periodo === 'noiteTecnico') ? 10 : 14;

                for (let j = inicioLinhas; j < fimLinhas; j += 2) {
                    if (!linhas[i + j] || !linhas[i + j + 1]) continue;

                    const disciplinas = linhas[i + j].split(';');
                    const professores = linhas[i + j + 1].split(';');
                    const horario = disciplinas.pop(); // Último valor da linha é o horário

                    diasSemana.slice(0, 5).forEach((dia, index) => {
                        salaAtual.horarios.push({
                            periodo,
                            dia,
                            disciplina: disciplinas[index],
                            professor: professores[index],
                            horario
                        });
                    });
                }

                // Adiciona à lista do período correspondente
                if (periodo === 'manha') dadosSalasManha.push(salaAtual);
                if (periodo === 'tarde') dadosSalasTarde.push(salaAtual);
                if (periodo === 'noite') dadosSalasNoite.push(salaAtual);
                if (periodo === 'noiteTecnico') dadosSalasNoiteTecnico.push(salaAtual);
            }
            gerarTabelas();
        }


        
        function capitalizeWords(str) {
            return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        }


        // Função para gerar as tabelas filtradas
        function gerarTabelas() {
            const diaSelecionado = document.getElementById('dia-semana').value;
            const horarioSelecionado = document.getElementById('horario-selecionado').value;
            const periodoSelecionado = document.getElementById('periodo-selecionado').value;
            const container = document.getElementById('salas-container');
            container.innerHTML = ''; // Limpa antes de renderizar novamente

            // Estrutura para armazenar os períodos e organizar a exibição
            const periodos = {
                manha: { nome: "", dados: dadosSalasManha },
                tarde: { nome: "", dados: dadosSalasTarde },
                noite: { nome: "", dados: dadosSalasNoite },
                noiteTecnico: { nome: "", dados: dadosSalasNoiteTecnico }
            };

            // Função para criar uma seção para cada período
            function criarSecao(periodo, nome) {
                const dados = periodos[periodo].dados;
                if (!dados.length) return;

                // Criar um título para o período
                const titulo = document.createElement('h2');
                titulo.textContent = nome;
                titulo.style.color = "#ffcc00";
                container.appendChild(titulo);

                // Criar uma div para organizar as salas desse período
                const divPeriodo = document.createElement('div');
                divPeriodo.classList.add('periodo');

                const divSalas = document.createElement('div');
                divSalas.classList.add('salas');

                // Filtrar os dados das salas e gerar as tabelas
                dados.forEach(sala => {
                    const horariosFiltrados = sala.horarios.filter(horario =>
                        horario.dia === diaSelecionado &&
                        (horarioSelecionado === "" || horario.horario === horarioSelecionado)
                    );

                    if (horariosFiltrados.length > 0) {
                        const divSala = document.createElement('div');
                        divSala.classList.add('sala');
                        divSala.innerHTML = `<h3>${sala.nome}</h3>`;

                        const tabela = document.createElement('table');
                        tabela.innerHTML = `
                            <tr>
                                <th>Disciplina</th>
                                <th>Professor</th>
                                <th>Horário</th>
                            </tr>
                        `;

                        horariosFiltrados.forEach(horario => {
                            tabela.innerHTML += `
                                <tr>
                                    <td>${horario.disciplina || '---'}</td>
                                    <td>${horario.professor || '---'}</td>
                                    <td>${horario.horario}</td>
                                </tr>
                            `;
                        });

                        divSala.appendChild(tabela);
                        divSalas.appendChild(divSala);
                    }
                });
                
                const h2 = document.createElement("h2");
                h2.style.color = "#ffcc00";
                h2.textContent = capitalizeWords(periodo); // Define o texto do título (capitalizeWords("período da manhã"));
                if (h2.textContent == "NoiteTecnico"){ h2.textContent == "Noite Técnico"}
                h2.classList.add('periodo')

                divPeriodo.appendChild(h2);
                divPeriodo.appendChild(divSalas);
                container.appendChild(divPeriodo);
            }

            // Se um período específico foi escolhido, exibe apenas ele
            if (periodoSelecionado !== "todos") {
                criarSecao(periodoSelecionado, periodos[periodoSelecionado].nome);
            } else {
                // Se "Todos os períodos" foi selecionado, exibe todos separadamente
                Object.keys(periodos).forEach(periodo => criarSecao(periodo, periodos[periodo].nome));
            }
        }
        window.onload = function() {
            const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
            const selectElement = document.getElementById("dia-semana");

            const hoje = new Date();
            const diaDaSemana = hoje.getDay(); // 0: Domingo, 1: Segunda, ..., 6: Sábado

            // Ajuste o índice do dia da semana
            const diaSelecionado = diasDaSemana[diaDaSemana - 1]; // Para ajustar a correspondência

            // Definir o valor selecionado com base no dia da semana
            if (diasDaSemana.includes(diaSelecionado)) {
                selectElement.value = diaSelecionado;
            }
        };