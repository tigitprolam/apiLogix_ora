

//TODO: em vez de sempre apresentar que o servidor está escutando em localhost,
//       apresentar em quais IPs ele está disponível
//      Porque eu poderia estar, por exemplo, dentro de uma VM ou Docker

const http = require('http')
const fs = require('fs')
const path = require('path')

const cors = require('cors')
const morgan = require('morgan')
const express = require('express')

const configServidorWeb = require('../configs/servidor-web.js')

const roteador = require('../services/roteador.js')
// Vamos colocar este import aqui apenas para testarmos a conexao com o banco
//  mas ele poderá ser apagado depois
const banco = require('../services/banco.js')

let httpServer

function inicializa() {
    return new Promise( (resolve, reject) => {
        const app = express()

        app.use(cors())

        httpServer = http.createServer(app)

        app.use(morgan('combined'))

        app.use('/api', roteador)

        // Vamos colocar este import aqui apenas para testarmos a conexao com o banco
        //  mas ele poderá ser apagado depois

        app.get('/', async (req, res) => {
            const resultado = await banco.executaSQL('select user, systimestamp from dual')
            const user = resultado.rows[0].USER
            const date = resultado.rows[0].SYSTIMESTAMP

            res.end(`DB user: ${user}\nDate: ${date}`)
        })
/*
        app.get('/', (req,res) => {
            res.end('Hello World!')
        })
*/
        httpServer.listen(configServidorWeb.porta)
            .on('listening', () => {
                console.log(`Servidor Web escutando em localhost:${configServidorWeb.porta}`)
            })
            .on('error', err => {
                reject(err)
            })
    })
}

module.exports.inicializa = inicializa

function encerra() {
    return new Promise( (resolve, reject) => {
        httpServer.close( (err) => {
            if (err) {
                reject(err)
                return
            }

            resolve()
        })
    })
}

module.exports.encerra = encerra
