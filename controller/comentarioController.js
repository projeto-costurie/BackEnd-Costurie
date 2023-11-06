/*****************************************************************************
 * Objetivo: Controller feita para gerenciamento de dados que chegam do banco de dados
 * Data: 30/08/2023
 * Autor: André
 * Versão: 1.0
 *****************************************************************************/

//Import do arquivo de configuração das variáveis, constantes e funções globais
var message = require('./modulo/config.js')

//Import models
var comentarioModel = require('../model/comentariosModel.js')

const insertComentario = async (dadosBody) => {

    if (dadosBody.id_usuario == '' || dadosBody.id_usuario == undefined || isNaN(dadosBody.id_usuario) ||
        dadosBody.id_publicacao == '' || dadosBody.id_publicacao == undefined || isNaN(dadosBody.id_publicacao)
    ) {
        return message.ERROR_INVALID_ID
    } else if(dadosBody.mensagem == '' || dadosBody.mensagem == undefined || !isNaN(dadosBody.mensagem) || dadosBody.mensagem > 255 ){
        return message.ERROR_REQUIRED_FIELDS
    } else {
        
        let dadosInserirComentario = await comentarioModel.insertComentarioModel(dadosBody)

        if (dadosInserirComentario) {
            let inserirComentarioJson = {}

            let comentario = await comentarioModel.selectLastIdComentarioModel()

            inserirComentarioJson.comentario = comentario[0]
            inserirComentarioJson.message = message.SUCCESS_CREATED_ITEM.message
            inserirComentarioJson.status = message.SUCCESS_CREATED_ITEM.status

            return inserirComentarioJson
        } else {
            return message
        }
    }
}

const selectComentariosByIdPublicacao = async (id_publicacao) => {

    if (id_publicacao == '' || id_publicacao == undefined || isNaN(id_publicacao)) {
        return message.ERROR_INVALID_ID
    } else {
        
        let dadosComentarios = await comentarioModel.selectComentariosByIdPublicacaoModel(id_publicacao)

        if (dadosComentarios) {
            let dadosComentariosJson = {}

            dadosComentariosJson.comentarios = dadosComentarios
            dadosComentariosJson.message = message.SUCCES_REQUEST.message
            dadosComentariosJson.status = message.SUCCES_REQUEST.status

            return dadosComentariosJson
        } else {
            return message.ERROR_ITEM_NOT_FOUND
        }
    }
}

const selectAllComentarios = async () => {

    let dadosComentarios = await comentarioModel.selectAllComentariosModel()

    if (dadosComentarios) {
        let dadosComentariosJson = {}

        dadosComentariosJson.comentarios = dadosComentarios
        dadosComentariosJson.message = message.SUCCES_REQUEST.message
        dadosComentariosJson.status = message.SUCCES_REQUEST.status

        return dadosComentariosJson
    } else {
        return message.ERROR_ITEM_NOT_FOUND
    }
}

module.exports = {
    insertComentario,
    selectComentariosByIdPublicacao,
    selectAllComentarios
}