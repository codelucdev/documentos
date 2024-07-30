document.addEventListener('DOMContentLoaded', function() {
    // Buscar o número de controle automaticamente ao carregar a página
    fetch('https://script.google.com/macros/s/AKfycbzv6K6mV1o9cViyhf6o3nlXSIQRJO3c4V0kX6y1iU3CQA6H6FX6drURzt6edjJcCHZmXQ/exec?action=getNumeroControle')
        .then(response => response.json())
        .then(data => {
            if (data && data.numero_controle) {
                document.getElementById('numero_controle').value = data.numero_controle;
            } else {
                document.getElementById('error-message').textContent = 'Erro ao obter o número de controle.';
            }
        })
        .catch(error => {
            document.getElementById('error-message').textContent = 'Erro ao obter o número de controle.';
        });

    document.getElementById('gerarPDF').addEventListener('click', function() {
        var numeroControle = document.getElementById('numero_controle').value.toUpperCase();
        var endereco = document.getElementById('endereco').value.toUpperCase();
        var numero = document.getElementById('numero').value.toUpperCase();
        var comunidade = document.getElementById('comunidade').value.toUpperCase();
        var proprietario = document.getElementById('proprietario').value.toUpperCase();
        var documento = document.getElementById('documento').value.toUpperCase();
        var cpfCnpjLabel = (documento === 'CPF') ? 'CPF do proprietário:' : 'CNPJ do proprietário:';
        var cpfCnpj = document.getElementById('cpf_cnpj').value.toUpperCase();
        var data = document.getElementById('data').value;

        // Verificar se todos os campos estão preenchidos
        if (!numeroControle || !endereco || !numero || !comunidade || !proprietario || !cpfCnpj || !data) {
            document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        // Limpar mensagem de erro
        document.getElementById('error-message').textContent = '';

        // Formatar a data para o formato brasileiro (dd/mm/yyyy)
        var dataFormatada = formatarDataBR(data);

        // Nome do arquivo
        var nomeArquivo = 'REQUERIMENTO_NUMERO_' + proprietario.replace(/\s+/g, '_') + '_NUMERO-CONTROLE_' + numeroControle + '.pdf';

        // Gerar o PDF com os dados do formulário
        var conteudoPDF = `
        <img src="img/logo prefeitura.png" alt="Logo Prefeitura" style="width: 80px; height: 80px; display: block; margin:0 auto; margin-top:40px;">           
        <p style="margin:125px; margin-top:40px; margin-bottom: 100px; text-align:center;"><strong>PREFEITURA MUNICIPAL DE SÃO JOÃO DA PONTE
            ESTADO DE MINAS GERAIS</strong>
        </p>
        
        <div class="container">
            <h1 style="text-align: center; font-size: 28px; margin-bottom: 120px;">DECLARAÇÃO DE NÚMERO</h1>
            <p style="text-align:justify; margin:50px; margin-bottom:0;">
                <strong>A PREFEITURA DE SÃO JOÃO DA PONTE</strong>
                , entidade de direito público, vinculada ao Estado de Minas Gerais,
                inscrita no CNPJ sob o número <strong>16.928.483/0001-29</strong>
                e sediada NA PRAÇA OLÍMPIO CAMPOS, N° 128, CENTRO, SÃO JOÃO DA PONTE,
                vem, por meio deste  fornecer o número <strong>${numero}</strong> sob o endereço localizado na <strong>
                 ${endereco}, BAIRRO ${comunidade}</strong>, neste município, sob responsabilidade de
                <strong>${proprietario}</strong>, ${cpfCnpjLabel} <strong>${cpfCnpj}</strong>,
                PERIMETRO URBANO, NESTA CIDADE DE SÃO JOÃO DA PONTE – MG.
            <p><br>
        
            <strong style="margin-left:50px">Número de Controle: ${numeroControle}-2</strong><br>
            <strong style="margin-left:50px">São João da Ponte / MG, ${dataFormatada}</strong>
        </div>

        <br><br>
        <div class="assinatura" style="text-align: center; margin-top:60px;" >
            <p>________________________________________</p>
            <strong style="text-align:center;">CARLOS DANIEL PEREIRA DE BRITO</strong><br><br>
            <strong style="text-align:center;">FISCAL DE OBRAS</strong>
        </div>
        `;

        // Gerar o PDF com ajustes de qualidade
        html2pdf().from(conteudoPDF).set({
            filename: nomeArquivo,
            pagebreak: { mode: 'avoid-all' },
            html2canvas: { scale: 2 }, // Aumenta a escala da captura de tela
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', output: 3 } // Ajusta a qualidade do PDF
        }).save().then(() => {
            // Dados a serem enviados para o Google Apps Script
            var dados = new FormData();
            dados.append('data', dataFormatada);
            dados.append('numero_controle', numeroControle);
            dados.append('endereco', endereco);
            dados.append('numero', numero);
            dados.append('comunidade', comunidade);
            dados.append('proprietario', proprietario);
            dados.append('documento', documento);
            dados.append('cpf_cnpj', cpfCnpj);

            fetch('https://script.google.com/macros/s/AKfycbzv6K6mV1o9cViyhf6o3nlXSIQRJO3c4V0kX6y1iU3CQA6H6FX6drURzt6edjJcCHZmXQ/exec', {
                method: 'POST',
                body: dados
            }).then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Erro ao enviar os dados.');
                }
            }).then(data => {
                console.log(data); // Exibe a resposta do Google Apps Script
                alert('Dados enviados e PDF gerado com sucesso!');
                window.location.reload(); // Recarrega a página para atualizar o número de controle
            }).catch(error => {
                document.getElementById('error-message').textContent = 'Erro ao enviar os dados.';
            });
        });
    });

    // Lógica para mostrar o campo CPF ou CNPJ com base na escolha do usuário
    document.getElementById('documento').addEventListener('change', function() {
        var documentoSelecionado = this.value;
        var cpfCnpjLabel = (documentoSelecionado === 'CPF') ? 'CPF do Proprietário:' : 'CNPJ do Proprietário:';
        document.getElementById('label-cpf').textContent = cpfCnpjLabel;
        document.getElementById('cpf_cnpj').setAttribute('placeholder', `Informe o ${documentoSelecionado.toUpperCase()}`);
    });
});

// Função para formatar a data para o formato brasileiro (dd/mm/yyyy)
function formatarDataBR(data) {
    var partes = data.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}
