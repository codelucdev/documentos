document.addEventListener('DOMContentLoaded', function() {
    // Puxar e exibir o próximo número de controle ao carregar a página
    fetch('https://script.google.com/macros/s/AKfycbxzxhU8F2q04Mx9uoUgo80OI8IpuYKEq3syOubN9yJ-yp4adTYDqBc1lcKIDPWnvQlM/exec?action=getNumeroControle')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('numero_controle').value = data.numero_controle;
            } else {
                console.error('Erro ao obter o número de controle.');
            }
        })
        .catch(error => console.error('Erro ao obter o número de controle:', error));

    document.getElementById('gerarPDF').addEventListener('click', function() {
        var numeroControle = document.getElementById('numero_controle').value.toUpperCase();
        var endereco = document.getElementById('endereco').value.toUpperCase();
        var numero = document.getElementById('numero').value.toUpperCase();
        var comunidade = document.getElementById('comunidade').value.toUpperCase();
        var proprietario = document.getElementById('proprietario').value.toUpperCase();
        var documento = document.getElementById('documento').value.toUpperCase();
        var cpfCnpjLabel = (documento === 'CPF') ? 'CPF do proprietário:' : 'CNPJ do proprietário:';
        var cpfCnpj = document.getElementById('cpf_cnpj').value.toUpperCase();
        var area = document.getElementById('area').value.toUpperCase();
        var unidade = document.getElementById('unidade').value.toUpperCase();
        var responsavel = document.getElementById('responsavel').value;
        var data = formatDate(document.getElementById('data').value);

        // Verificar se todos os campos estão preenchidos
        if (!numeroControle || !endereco || !numero || !comunidade || !proprietario || !cpfCnpj || !area || !unidade || !data) {
            document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        // Limpar mensagem de erro
        document.getElementById('error-message').textContent = '';

        var nomeArquivo = 'REQUERIMENTO_COPASA_URBANO_' + proprietario.replace(/\s+/g, '_') + '_NUMERO-CONTROLE_' + numeroControle + '.pdf';

        // Gerar o PDF com os dados do formulário
        var conteudoPDF = `
            <img src="img/logo prefeitura.png" alt="Logo Prefeitura" style="width: 80px; height: 80px; display: block; margin:0 auto; margin-top:40px;">
            <strong><p style="margin:125px; margin-top:40px; margin-bottom:0; text-align:center;">PREFEITURA MUNICIPAL DE SÃO JOÃO DA PONTE
                ESTADO DE MINAS GERAIS</p>
            </strong>

            <div class="container">
                <h1 style="color: black; text-align: center; text-decoration:underline; font-size:25px; margin: 120px; ">DECLARAÇÃO DE NÃO IMPEDIMENTO</h1>
                <p style="text-align:justify; margin:50px; margin-bottom:0;"><strong>A PREFEITURA DE SÃO JOÃO DA PONTE</strong>, entidade de direito público, vinculada ao Estado de Minas Gerais, inscrita no CNPJ sob o número <strong>16.928.483/0001-29</strong> e sediada NA PRAÇA OLÍMPIO CAMPOS, N° 128, CENTRO, SÃO JOÃO DA PONTE, vem, por meio deste, informar a <strong>COPASA</strong> sobre o endereço do imóvel localizado na <strong> ${endereco}</strong>, número <strong>${numero}, BAIRRO ${comunidade}</strong>, neste município, sob responsabilidade de <strong>${proprietario}</strong>,${cpfCnpjLabel} <strong>${cpfCnpj}</strong>, e declaramos para o devido fim que o imóvel não tem impedimentos para ligação de ÁGUA E ESGOTO.</p><br><br>
                <strong style="margin-left:50px;">Número de Controle: ${numeroControle}-2</strong><br>
                <strong style="margin-left:50px">Área do Terreno: ${area} ${unidade}</strong><br>
                <strong style="margin-left:50px">São João da Ponte / MG, ${data}</strong><br>
            </div>

            <br><br>
            <div class="assinatura" style="text-align: center; margin-top:60px;" >
                <p>________________________________________</p>
                <strong style="text-align:center;">${responsavel}</strong><br><br>
                <strong style="text-align:center;">
                    ${ responsavel === 'CARLOS DANIEL PEREIRA DE BRITO' ? 'FISCAL DE OBRAS' : (responsavel === 'ALISSON GUSMÃO CORDEIRO' ? 'CHEFE DO DEPARTAMENTO DE OBRAS' : 'SECRETÁRIO DE INFRAESTRUTURA')}
                </strong>
            </div>
            <br><br>
        `;

        // Gerar o PDF com ajustes de qualidade
        html2pdf().from(conteudoPDF).set({
            filename: nomeArquivo,
            pagebreak: { mode: 'avoid-all' },
            html2canvas: { scale: 2 }, // Aumenta a escala da captura de tela
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', output: 3 } // Ajusta a qualidade do PDF
        }).save();

        // Enviar dados ao Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbxzxhU8F2q04Mx9uoUgo80OI8IpuYKEq3syOubN9yJ-yp4adTYDqBc1lcKIDPWnvQlM/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                data: data,
                numero_controle: numeroControle,
                nome_proprietario: proprietario,
                documento: documento,
                cpf_cnpj: cpfCnpj,
                area: area,
                unidade: unidade,
                endereco: endereco,
                comunidade: comunidade,
                responsavel: responsavel
            })
        })
        .then(response => response.text())
        .then(result => {
            console.log('Dados enviados com sucesso:', result);

            // Atualizar o número de controle e limpar o formulário
            fetch('https://script.google.com/macros/s/AKfycbxzxhU8F2q04Mx9uoUgo80OI8IpuYKEq3syOubN9yJ-yp4adTYDqBc1lcKIDPWnvQlM/exec?action=getNumeroControle')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('numero_controle').value = data.numero_controle;
                    } else {
                        console.error('Erro ao obter o número de controle.');
                    }
                })
                .catch(error => console.error('Erro ao obter o número de controle:', error));

            // Limpar o formulário
            document.getElementById('formulario').reset();
        })
        .catch(error => console.error('Erro ao enviar dados:', error));
    });

    // Lógica para mostrar o campo CPF ou CNPJ com base na escolha do usuário
    document.getElementById('documento').addEventListener('change', function() {
        var documentoSelecionado = this.value;
        var cpfCnpjLabel = (documentoSelecionado === 'cpf') ? 'CPF do Proprietário:' : 'CNPJ do Proprietário:';
        document.getElementById('label-cpf').textContent = cpfCnpjLabel;
        document.getElementById('cpf_cnpj').setAttribute('placeholder', `Informe o ${documentoSelecionado.toUpperCase()}`);
    });

    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        var year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
});
