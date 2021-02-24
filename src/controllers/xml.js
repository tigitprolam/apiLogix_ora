const fs = require('fs')
const path = require('path')

const express = require('express')

const xml = require('../models/xml.js')

async function get(req, res, next) {

//let xml = ''
let arquivo = ''
let retorno = {}
const contexto = {}

contexto.chave_de_acesso = req.params.chave_de_acesso

  try {

      const resultado_conta = await xml.conta(contexto)

      if (resultado_conta.TOTAL_DE_REGISTROS == 1) {

        const resultado_registros = await xml.consulta(contexto)

        if (resultado_registros.length === 1) {
  
          arquivo = path.resolve(`.\\temp\\${contexto.chave_de_acesso}-nfe_vis.xml`)
  
          const montagem_xml = `<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">${resultado_registros[0].XML_SIG.toString()}${resultado_registros[0].XML_PROT.toString()}</nfeProc>`
  
          fs.writeFileSync(arquivo, montagem_xml.replace('\u0000','').replace('\u0000','')
          //+ resultado_registros[0].XML_SIG.toString() + resultado_registros[0].XML_PROT.toString()  + '</nfeProc>'
          )
  
          //const resultado_xml = `<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">${resultado_registros[0].XML_SIG.toString()}${resultado_registros[0].XML_PROT.toString()}</nfeProc>`
  
          //const outro_resultado = resultado_xml.replace('\u0000','').replace('\u0000','')
          //const terceiro_resultado = outro_resultado
  
          res.contentType('application/xml')
          res.status(200).sendFile(arquivo)
        }
        
      } else {
        res.contentType('application/xml')
        res.status(204).end()
        //.json({ mensagem: "Chave de acesso: Nao encontrada para a empresa de eCommerce; ou esta se encontra Nao autorizada pela SeFaz; ou está Cancelada"})
      }

      /*
      retorno = { pagina: contexto.pagina,
        total_de_paginas: Math.ceil( resultado_conta.TOTAL_DE_REGISTROS / contexto.limite, 10 ),
        limite: contexto.limite,
        total_de_registros: resultado_conta.TOTAL_DE_REGISTROS,
        dados: resultado_registros
      }
      */

      //res.status(200).json(xml)

    } catch (erro) {

      res.status(500).json(`{ mensagem: ${erro} }`)

    }

}

module.exports.get = get
