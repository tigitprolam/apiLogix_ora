const express = require('express')
const roteador = new express.Router()

const xml = require('../controllers/xml.js')

roteador.route('/xml/:chave_de_acesso?')
    .get(xml.get)

module.exports = roteador
