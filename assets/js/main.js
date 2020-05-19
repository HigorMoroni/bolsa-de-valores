const dom = {
    busca: {
        input: document.querySelector('#inputBusca'),
        botao: document.querySelector('#btnBusca'),
    },
    resultado: document.querySelector('.resultado')
}

dom.busca.botao.addEventListener('click', () => {
    if (dom.busca.input.value.length<1) {
        dom.resultado.innerHTML = 'Digite um valor para buscar'
        return
    }
    dom.resultado.innerHTML = 'Carregando...'
    axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${dom.busca.input.value}&apikey=2444ZZAG983EHYDM`)
    .then(resposta => {
        resultados = resposta.data.bestMatches
        if (resultados.length < 1) {
            dom.resultado.innerHTML = 'Nenhum resultado encontrado'
            dom.busca.input.value = ''
            dom.busca.input.focus()
            return
        }
        dom.resultado.innerHTML = '<thead><tr><th>Simbolo</th><th>Nome</th><th>Região</th><th>Moeda</th></tr></thead>'
        let tbody = document.createElement('tbody')
        tbody.id = 'tabelaResultado'
        resultados.forEach(valor => {
            const symbol = valor['1. symbol'], nome = valor['2. name'], moeda = valor['8. currency']
            const regiao = valor['4. region'] == 'Brazil/Sao Paolo' ? 'Brasil' : valor['4. region']
            tbody.innerHTML += `<tr><td><strong onclick="encontraAcao('${symbol}', '${nome}', '${moeda}')">${symbol.split('.').shift()}</strong></td><td>${nome}</td><td>${regiao}</td><td>${moeda}</td></tr>`
        });
        dom.busca.input.value = ''
        dom.resultado.appendChild(tbody)
    })
    .catch(erro => console.warn(erro))
})

function encontraAcao(valor, nome, moeda) {
    dom.resultado.innerHTML = 'Carregando...'
    console.log(valor)
    axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${valor}&apikey=2444ZZAG983EHYDM`)
    .then(resposta => {
        console.log(resposta)
        const dados = resposta.data
        if (dados.hasOwnProperty("Error Message")) {
            if (dados['Error Message'] == 'Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for GLOBAL_QUOTE.') {
                alert('Instabilidade no servidor, tente novamente mais tarde ou tente consultar ativos de outros países.')
                dom.resultado.innerHTML = ''
            } else dom.resultado.innerHTML = dados['Error Message']
            return
        } else if (dados.hasOwnProperty("Note")) {
            if (dados['Note'] == 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.') {
                alert('Esse sistema infelizmente só aceita 5 requisições por minuto, aguarde 1 minuto e tente novamente.')
                dom.resultado.innerHTML = ''
            } else dom.resultado.innerHTML = dados['Note']
            return
        } else if (dados.hasOwnProperty("Global Quote")) {
            const cotacao = resposta.data['Global Quote']
            const data = new Date()
            let ultimaTransacao = cotacao['07. latest trading day'].split('-')
            dom.resultado.innerHTML = `<tr><td colspan="2"><h1>${nome}</h1></td></tr>`
            dom.resultado.innerHTML += `<tr><td>Consulta em</td><td>${data.getDate()}/${data.getDay()+1}/${data.getFullYear()}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Cotação Atual</td><td><strong>${Number(cotacao['05. price']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></strong></tr>`
            dom.resultado.innerHTML += `<tr><td>Simbolo</td><td>${cotacao['01. symbol'].split('.').shift()}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Abertura</td><td>${Number(cotacao['02. open']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Maior Cotação</td><td>${Number(cotacao['03. high']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Menor Cotação</td><td>${Number(cotacao['04. low']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Volume</td><td>${cotacao['06. volume']}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Ultima Transação</td><td>${ultimaTransacao[2]}/${ultimaTransacao[1]}/${ultimaTransacao[0]}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Fechamento Anterior</td><td>${Number(cotacao['08. previous close']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Variação</td><td>${Number(cotacao['09. change']).toLocaleString('pt-BR', { style: 'currency', currency: moeda })}</td></tr>`
            dom.resultado.innerHTML += `<tr><td>Porcentagem de Variação</td><td>${cotacao['10. change percent']}</td></tr>`
        }
        
    })
    .catch(erro => console.warn(erro))
}