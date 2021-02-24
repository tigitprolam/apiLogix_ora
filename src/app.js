const servidorWeb = require('./services/servidor-web.js')
const configBanco = require('./configs/oracle_db.js')
const banco = require('./services/banco.js')

const defaultThreadPoolSize = 10

// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE = configBanco.logixPool.poolMax + defaultThreadPoolSize

async function inicia() {
    console.log('Iniciando aplicação...')

    try {
        console.log('Inicializando módulo: Banco de dados...')

        await banco.inicializa()
    } catch (err) {
        console.error(err)

        process.exit(1)
    }

    try { 
        console.log('Inicializando módulo: Servidor Web...')

        await servidorWeb.inicializa()
    } catch (err) {
        console.error(err)
        
        process.exit(1)
    }
}

inicia()

async function finaliza(e) {
    let err = e

    console.log('Finalizando aplicação...')

    try {
        console.log('Encerrando módulo: Servidor Web...')

        await servidorWeb.encerra()
    } catch (e) {
        console.log('Erro ao encerrar Servidor Web', e)

        err = err || e
    }

    try {
        console.log('Encerrando módulo: Banco de dados...')

        await banco.encerra()
    } catch (err) {
        console.log('Erro encontrado', e)

        err = err || e
    }

    console.log('Saindo do processo')

    if (err) {
        process.exit(1)
    } else {
        process.exit(0)
    }
}

process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM')

    finaliza()
})

process.on('SIGINT', () => {
    console.log('Recebido SIGINT')

    finaliza()
})

process.on('uncaughtException', err => {
    console.log('Exceção não capturada')
    console.error(err)

    finaliza(err)
})