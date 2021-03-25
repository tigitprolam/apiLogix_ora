const configBanco = require('../configs/oracle_db.js')

const banco = require('../services/banco.js')

const sqlSubConsultas = `
WITH
`

const sqlContar = `
SELECT COUNT(1) as total_de_registros

`

const sqlSelect = 
`
    SELECT 
              s50.xml_sig
            , s54.xml_prot

`

const sqlFrom = 
`
FROM totvssped.sped050 s50

JOIN totvssped.sped054 s54   ON ( s54.id_ent = s50.id_ent AND s54.lote = s50.lote AND s54.nfe_id = s50.nfe_id )
                            AND cstat_sefr = '100'

`

const sqlWhere = `
    WHERE

    -- Empresa 66 MBSet (Filial SP)
    s50.id_ent = '000006'

    -- NF-e Autorizada
    AND s50.status = 6

    -- Sem status de cancelamento
    AND s50.statuscanc = 0

    -- Ambiente Producao
    AND s50.ambiente = 1

`

const sqlFetch = '\nFETCH NEXT :row_limit ROWS ONLY'

const sqlRownum = `\n
AND rownum <= :row_limit
`

// -- ------------------------------------------------------------------------------
// COMPATIBILIDADE ORACLE 11G, devido este não ter OFFSET; a partir do 12c existe esta funcionalidade
// TODO: Tão logo atualizar o Oracle, revisar para eliminar esta sub-consulta e usar OFFSET
const sqlSubConsultaNumerar = `
\n, numera_registros AS (
  SELECT ROWNUM AS linha
         , cp.*
    FROM consulta_principal cp 
)

`

const sqlOffSet = `\nSELECT *
                       FROM numera_registros
                      WHERE linha >= :proximo`

// -- ------------------------------------------------------------------------------

async function conta(contexto) {

  let sqlWhereCompl = ''

  const binds = {}

  // TODO: Realizar teste: o consumidor deste WS não deveria conseguir informar o parametro item sem informar o empresa
  //        isso é possível? pq se sim, preciso tratar uma resposta de volta (talvez no controller)
  //       ou eu terei problemas aqui
  if (contexto.chave_de_acesso) {
    binds.chave_de_acesso = contexto.chave_de_acesso

    sqlWhereCompl += `\n     -- Chave de acesso
                         AND s50.doc_chv = :chave_de_acesso
                     `

  }

  let declaracaoSQL = sqlContar + sqlFrom + sqlWhere + sqlWhereCompl

  // Indica para a funcao executaSQL que há um campo BLOB no comando SQL
  // Campos BLOB, por poder ser grande, sempre são transferidos usando buffer (stream do Node.js)
  const opcoes = {}
  opcoes.campoBLOB = true

  const result = await banco.executaSQL(declaracaoSQL, binds, opcoes)

  // Limpeza
  sqlWhereCompl = ''
  declaracaoSQL = ''

  return result.rows[0]
}

module.exports.conta = conta


// Consulta

async function consulta(contexto) {

  let declaracaoSQL = ''


  // Compatibilidade Oracle 11
  let consultaPrincipal = ''


  // Paginação
  const binds = {}

  if (contexto.proximo) {
    binds.proximo = contexto.proximo
  } else {
    binds.proximo = 1
  }

  // Filtros

  let sqlWhereCompl = ''

  if (contexto.chave_de_acesso) {
    binds.chave_de_acesso = contexto.chave_de_acesso

    sqlWhereCompl += `\n     -- Chave de acesso
                         AND s50.doc_chv = :chave_de_acesso
                     `

  }

  consultaPrincipal = sqlSelect + sqlFrom + sqlWhere + sqlWhereCompl


  // Monta a declaração SQL

  // Compatibilidade com Oracle 11
  if(configBanco.logixPool.ora_bd_version === 11) {
    declaracaoSQL += sqlSubConsultas + `\n consulta_principal as ( ${consultaPrincipal} )` + sqlSubConsultaNumerar + sqlOffSet
  } else {
    declaracaoSQL += consultaPrincipal
  }

  // Limite de registros na Página

  const limite = ( contexto.limite > 0 ) ? contexto.limite : 1

  binds.row_limit = limite

  if(configBanco.logixPool.ora_bd_version === 11) {
    // Compatibilidade com Oracle 11
    declaracaoSQL += sqlRownum
  } else {

    // A partir do Oracle 12, temos esta funcionalidade
    declaracaoSQL += sqlFetch
  }

  // Indica para a funcao executaSQL que há um campo BLOB no comando SQL
  // Campos BLOB, por poder ser grande, sempre são transferidos usando buffer (stream do Node.js)
  const opcoes = {}
  opcoes.campoBLOB = true
  const result = await banco.executaSQL(declaracaoSQL, binds, opcoes)

  // Limpeza
  sqlWhereCompl = ''
  consultaPrincipal = ''
  declaracaoSQL = ''

  return result.rows

}

module.exports.consulta = consulta