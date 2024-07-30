document.addEventListener('DOMContentLoaded', () => {
    const script_do_google = 'https://script.google.com/macros/s/AKfycbyG-x--OwzI32xRSlSlRIJGOAlsPyY0y2sEWowwF48FlUwnHhHLUDGJxENUGRT8c5pBtw/exec';
    const dados_do_formulario = document.forms['formulario-contato'];

    async function fetchAlvaraNumber() {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyG-x--OwzI32xRSlSlRIJGOAlsPyY0y2sEWowwF48FlUwnHhHLUDGJxENUGRT8c5pBtw/exec?action=getAlvaraNumber');
            const data = await response.json();
            if (data.success) {
                document.getElementById('numero_alvara').textContent = data.numero_alvara;
                return data.numero_alvara;
            } else {
                alert('Erro ao buscar o número do alvará.');
            }
        } catch (error) {
            console.error('Erro ao buscar o número do alvará:', error);
        }
    }

    dados_do_formulario.addEventListener('submit', async function(e) {
        e.preventDefault();

        const numeroAlvara = document.getElementById('numero_alvara').textContent;
        if (!numeroAlvara) {
            alert('Erro ao obter o número do alvará. Tente novamente.');
            return;
        }

        const formData = new FormData(dados_do_formulario);
        formData.append('numero_alvara', numeroAlvara);

        const dataObject = {};
        formData.forEach((value, key) => {
            dataObject[key] = value;
        });

        // Save data to localStorage
        for (const [key, value] of Object.entries(dataObject)) {
            localStorage.setItem(key, value);
        }

        const urlEncodedData = new URLSearchParams(dataObject).toString();

        fetch(script_do_google, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Resposta do servidor:', data);
            alert('Dados enviados com sucesso');
            dados_do_formulario.reset();
            window.location.href = 'recebe.html'; // Redirect to the receipt page
        })
        .catch(error => {
            console.error('Erro no envio dos dados!', error);
            alert('Ocorreu um erro ao enviar os dados. Verifique o console para mais detalhes.');
        });
    });

    setDateToday();

    function setDateToday() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateString = `${year}-${month}-${day}`;
        document.getElementById('datedocumento').value = dateString;
    }
});
