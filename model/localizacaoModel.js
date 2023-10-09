/*****************************************************************************
 * Objetivo: Model para a captacão de dados do banco de dados e envio para as controllers
 * Data: 30/08/2023
 * Autor: André
 * Versão: 1.0
 *****************************************************************************/

//Import da biblioteca do prisma client
var { PrismaClient } = require('@prisma/client')

var prisma = new PrismaClient()

const selectAllStatesModel = async () => {
    let sql = `select tbl_localizacao.id, tbl_localizacao.estado from tbl_localizacao`

    let response = await prisma.$queryRawUnsafe(sql)


    if (response.length > 0) {
        return response
    } else {
        return false
    }
}

const insertLocalizacaoModel = async (dadosLocalizacao) => {
    let sql = `CALL sp_insert_localizacao_usuario(
        ${dadosLocalizacao.id_usuario},  -- Substitua pelo ID do usuário desejado
        '${dadosLocalizacao.bairro}',  -- Substitua pelo nome do bairro desejado
        '${dadosLocalizacao.cidade}',  -- Substitua pelo nome da cidade desejada
        '${dadosLocalizacao.estado}'   -- Substitua pelo nome do estado desejado
    );`


    let resultStatus = await prisma.$executeRawUnsafe(sql)

    if (resultStatus) {
        return true
    } else {
        return false
    }
}

const selectLastId = async () => {
    let sql = `select * from tbl_localizacao order by id desc limit 1;`

    let response = await prisma.$queryRawUnsafe(sql)


    if (response.length > 0) {
        return response
    } else {
        return false
    }
}

const selectAllLocationsModel = async () => {
    let sql = `
    select tbl_localizacao.id as id_localizacao, 
    tbl_localizacao.cidade, 
    tbl_localizacao.estado, tbl_localizacao.bairro,
    tbl_usuario.id as id_usuario,
    tbl_usuario.nome_de_usuario,
        from tbl_localizacao
            inner join tbl_usuario
                tbl_usuario.id_localizacao = tbl_localizacao.id`

    let response = await prisma.$queryRawUnsafe(sql)

    if (response.length > 0) {
        return response
    } else {
        return false
    }
}

module.exports = {
    selectAllStatesModel,
    insertLocalizacaoModel,
    selectLastId,
    selectAllLocationsModel
}