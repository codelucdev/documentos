document.addEventListener('DOMContentLoaded', function() {
    // Puxar e exibir o próximo número de controle ao carregar a página
    fetch('https://script.google.com/macros/s/AKfycbwIfDe6ngRRWapJS6x8tCXbLlXSzR1-zYggvSrCJ80dGmrNDT2ArLO8mKx1NTtNbumDEA/exec?action=getNumeroControle')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('numero_controle').value = data.numero_controle;
            } else {
                console.error('Erro ao obter o número de controle.');
            }
        })
        .catch(error => console.error('Erro ao obter o número de controle:', error));
});

document.getElementById('gerarPDF').addEventListener('click', function() {
    var responsavel = document.getElementById('responsavel').value;
    var documento = document.getElementById('documento').value;
    var cpf_cnpj = document.getElementById('cpf_cnpj').value.toUpperCase();
    var area = document.getElementById('area').value.toUpperCase();
    var unidade = document.getElementById('unidade').value;
    var localizacao = document.getElementById('localizacao').value.toUpperCase();
    var regiao = document.getElementById('regiao').value.toUpperCase();
    var data = formatarData(document.getElementById('data').value);
    var numero_controle = document.getElementById('numero_controle').value;
    var proprietario = document.getElementById('nome_proprietario').value.toUpperCase();

    if (!responsavel || !documento || !cpf_cnpj || !area || !unidade || !localizacao || !regiao || !data || !numero_controle) {
        document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    document.getElementById('error-message').textContent = '';

    var nomeArquivo = 'REQUERIMENTO_CEMIG_RURAL_' + proprietario.replace(/\s+/g, '_') + '_NUMERO-CONTROLE_' + numero_controle + '.pdf';

    var cargo;
    switch (responsavel) {
        case 'CARLOS DANIEL PEREIRA DE BRITO':
            cargo = 'FISCAL DE OBRAS';
            break;
        case 'ALISSON GUSMÃO CORDEIRO':
            cargo = 'CHEFE DO DEPARTAMENTO DE OBRAS';
            break;
        case 'LUIZ FILLIPE MARTINS DA SILVA':
            cargo = 'SECRETÁRIO DE INFRAESTRUTURA';
            break;
        default:
            break;
    }

    var conteudoPDF = `
    <div>
        <img src="img/logo prefeitura.png" alt="Logo Prefeitura" style="width: 80px; height: 80px; display: block; margin:0 auto; margin-top:40px;">           
        <strong><p style="margin:125px; margin-top:40px; margin-bottom:0; text-align:center;">PREFEITURA MUNICIPAL DE SÃO JOÃO DA PONTE
            ESTADO DE MINAS GERAIS</p>
        </strong>

        <div class="container">
            <h1 style="color: black; text-align: center; text-decoration:underline; font-size:25px; margin: 120px; ">DECLARAÇÃO DE NÃO IMPEDIMENTO RURAL</h1>
            <div class="pdf-content">
                <p style="text-align:justify; margin:50px;">A PREFEITURA DE SÃO JOÃO DA PONTE, sediada na PRAÇA OLÍMPIO CAMPOS, Nº 128, CENTRO, nesta cidade de SÃO JOÃO DA PONTE, ora representada pelo Sr. ${responsavel}, Declara que NÃO HÁ IMPEDIMENTOS PARA LIGAÇÃO de ENERGIA ELÉTRICA em uma ÁREA RURAL com área de aproximadamente ${area} ${unidade}, situado em um lugar denominado ${localizacao}, situada na região de ${regiao}, neste município, de responsabilidade de ${proprietario}, inscrito no ${documento.toUpperCase()}: ${cpf_cnpj.toUpperCase()}, SN, neste município de São João da Ponte - MG.</p>
                <p style="text-align:justify; margin-left:50px;">Número de Controle: ${numero_controle}-2</p>
                <p style="margin-left:50px">Área do Terreno: ${area}${unidade}</p>
                <p style="text-align:justify; margin-left:50px;">São João da Ponte – MG, ${data}.</p>
            </div>
            
            <div class="assinatura" style="text-align: center; margin-top:60px;">
            <p>___________________________________________</p><br>
            <strong style="text-align:center;">${responsavel}</strong><br><br>
            <strong style="text-align:center;">
                ${cargo}
            </strong>
        </div>
    </div>
    `;

    var opt = {
        filename: nomeArquivo,
        pagebreak: { mode: 'avoid-all' },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(conteudoPDF).set(opt).save();

    // Enviar dados ao Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbwIfDe6ngRRWapJS6x8tCXbLlXSzR1-zYggvSrCJ80dGmrNDT2ArLO8mKx1NTtNbumDEA/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            nome_proprietario: proprietario,
            documento: documento,
            cpf_cnpj: cpf_cnpj,
            area: area,
            unidade: unidade,
            localizacao: localizacao,
            regiao: regiao,
            data: data,
            numero_controle: numero_controle,
            responsavel: responsavel
        })
    })
    .then(response => response.text())
    .then(result => {
        console.log('Dados enviados com sucesso:', result);
        // Atualizar o número de controle após o envio dos dados
        fetch('https://script.google.com/macros/s/AKfycbwIfDe6ngRRWapJS6x8tCXbLlXSzR1-zYggvSrCJ80dGmrNDT2ArLO8mKx1NTtNbumDEA/exec?action=getNumeroControle')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('numero_controle').value = data.numero_controle;
                } else {
                    console.error('Erro ao obter o número de controle.');
                }
            })
            .catch(error => console.error('Erro ao obter o número de controle:', error));
    })
    .catch(error => console.error('Erro ao enviar dados:', error));
});

document.getElementById('documento').addEventListener('change', function() {
    var documentoSelecionado = this.value;
    var labelCPF = document.getElementById('label-cpf');
    var inputCPF = document.getElementById('cpf_cnpj');

    if (documentoSelecionado === 'cpf') {
        labelCPF.textContent = 'CPF DO PROPRIETÁRIO:';
        inputCPF.setAttribute('placeholder', 'Informe o CPF');
    } else if (documentoSelecionado === 'cnpj') {
        labelCPF.textContent = 'CNPJ DO PROPRIETÁRIO:';
        inputCPF.setAttribute('placeholder', 'Informe o CNPJ');
    }
});

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}
