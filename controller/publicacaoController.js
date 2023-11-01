/*****************************************************************************
 * Objetivo: Controller feita para gerenciamento de dados que chegam do banco de dados
 * Data: 30/08/2023
 * Autor: André
 * Versão: 1.0
 *****************************************************************************/

//Import do arquivo de configuração das variáveis, constantes e funções globais
var message = require('./modulo/config.js')

//Import models
const publicacaoModel = require('../model/publicacaoModel.js')
const tagPublicacaoModel = require('../model/tagPublicacaoModel.js')
const tagModel = require('../model/tagModel.js')
const anexosModel = require('../model/anexosModel.js')
const usuarioModel = require('../model/usuarioModel.js')

const insertPublicacao = async (dadosBody) => {

    // console.log(dadosBody)

    if (dadosBody.id_usuario == '' || dadosBody.id_usuario == undefined || isNaN(dadosBody.id_usuario) ||
        dadosBody.titulo == '' || dadosBody.titulo == undefined || !isNaN(dadosBody.titulo) || dadosBody.titulo.length > 45 ||
        dadosBody.descricao == '' || dadosBody.descricao == undefined || !isNaN(dadosBody.descricao)
    ) {
        return message.ERROR_REQUIRED_FIELDS
    } else if (dadosBody.tags.length == 0) {
        return message.ERROR_TAGS_WERE_NOT_FORWARDED
    } else if (dadosBody.anexos.length == 0) {
        return message.ERROR_ATTACHMENT_WERE_NOT_FORWARDED
    } else {
        // console.log(dadosBody.tags.length);

        let dadosInsertPublicacao = await publicacaoModel.inserirPublicacaoModel(dadosBody)

        let dadosTagsInseridas = await insertTagsPublicacao(dadosBody.tags)

        // console.log(dadosBody.anexos);

        let lastPublicacao = await publicacaoModel.selectLastIdPublicacaoModel()

        // console.log(lastPublicacao);

        let dadosAnexosInseridos = await insertAnexosPublicacao(dadosBody.anexos, lastPublicacao[0].id)

        if (dadosInsertPublicacao) {
            let novaPublicacao = await publicacaoModel.selectLastIdPublicacaoModel()

            let dadosPublicacaoJson = {}

            dadosPublicacaoJson.nova_publicacao = novaPublicacao
            dadosPublicacaoJson.tags_inseridas = dadosTagsInseridas
            dadosPublicacaoJson.anexos_inseridas = dadosAnexosInseridos
            dadosPublicacaoJson.message = message.SUCCESS_CREATED_ITEM.message
            dadosPublicacaoJson.status = message.SUCCESS_CREATED_ITEM.status

            // console.log(dadosPublicacaoJson);

            return dadosPublicacaoJson
        } else {
            return message.ERROR_NOT_POSSIBLE_INSERT_PUBLICATION
        }
    }
}

const insertTagsPublicacao = async (tags) => {
    let tagsArray = []

    // console.log(tags);

    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i]

        let dadosPublicacao = await publicacaoModel.selectLastIdPublicacaoModel()

        // console.log(dadosPublicacao);

        await tagPublicacaoModel.insertTagPublicacaoModel(tag.id_tag, dadosPublicacao[0].id)

        let tagPublicacaoAtualizada = await tagPublicacaoModel.selectLastId()

        let tagAtualizada = await tagModel.selectTagByIdModel(tagPublicacaoAtualizada[0].id_tag)

        tagsArray.push(tagAtualizada[0])
    }

    // console.log(tagsArray);

    return tagsArray
}

const insertAnexosPublicacao = async (anexos, id_publicacao) => {
    let anexosArray = []

    for (let i = 0; i < anexos.length; i++) {
        let anexo = anexos[i]

        await anexosModel.insertAnexoModel(anexo.conteudo, id_publicacao)

        let anexoAtualizado = await anexosModel.selectLastIdAnexoModel()

        anexosArray.push(anexoAtualizado[0])
    }

    // console.log(anexosArray);

    return anexosArray
}

const selectAllPublications = async () => {

    let dadosPublicacaoComAnexoArray = []

    let dadosPublicacao = await publicacaoModel.selectAllPublicationsModel()

    // console.log(dadosPublicacao);

    let cincoPrimeirasPublicacoes = await dadosPublicacao.slice(0,5)

    // console.log(cincoPrimeirasPublicacoes);

    for (let i = 0; i < cincoPrimeirasPublicacoes.length; i++) {
        let publicacao = cincoPrimeirasPublicacoes[i]

        let dadosAnexos = await anexosModel.selectAnexosByIdModel(publicacao.id)

        publicacao.anexos = dadosAnexos

        dadosPublicacaoComAnexoArray.push(publicacao)
    }

    if (dadosPublicacao) {
        let dadosPublicacaoJson = {}

        dadosPublicacaoJson.publicacoes = dadosPublicacaoComAnexoArray
        dadosPublicacaoJson.status = message.SUCCES_REQUEST.status
        dadosPublicacaoJson.message = message.SUCCES_REQUEST.message

        return dadosPublicacaoJson
    } else {
        return message.ERROR_INTERNAL_SERVER
    }
}

const selectTags = async (tags) => {
    let arrayTags = []

    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i]

        let tagSelecionada = await tagModel.selectTagByIdModel(tag.id_tag)

        arrayTags.push(tagSelecionada[0])
    }

    return arrayTags
}

const selectPublicacaoById = async (id_publicacao) => {

    let publicacao_existente = await publicacaoModel.selectPublicacaoByIdModel(id_publicacao)

    if (publicacao_existente == false) {
        return message.ERROR_PUBLICATION_ID_NOT_FOUND
    } else if (id_publicacao == '' || id_publicacao == undefined || isNaN(id_publicacao)) {
        return message.ERROR_INVALID_ID
    } else {

        let dadosPublicacao = await publicacaoModel.selectPublicacaoByIdModel(id_publicacao)

        // console.log(dadosPublicacao);

        let usuario = await usuarioModel.selectUserByIdModel(dadosPublicacao[0].id_usuario)

        let anexos = await anexosModel.selectAnexosByIdModel(dadosPublicacao[0].id)

        let tags = await tagPublicacaoModel.selectAllTagsByIdPublicacaoModel(dadosPublicacao[0].id)

        let tagSelecionada = await selectTags(tags)

        delete dadosPublicacao[0].id_usuario

        dadosPublicacao[0].usuario = usuario[0]

        dadosPublicacao[0].anexos = anexos

        dadosPublicacao[0].tags = tagSelecionada

        if (dadosPublicacao) {
            let dadosPublicacaoJson = {}

            dadosPublicacaoJson.publicacao = dadosPublicacao[0]
            dadosPublicacaoJson.status = message.SUCCES_REQUEST.status
            dadosPublicacaoJson.message = message.SUCCES_REQUEST.message

            return dadosPublicacaoJson
        } else {
            return message.ERROR_INTERNAL_SERVER
        }
    }
}

const updatePublicacao = async (dadosBody) => {

    if (dadosBody.id_publicacao == '' || dadosBody.id_publicacao == undefined || isNaN(dadosBody.id_publicacao) ||
        dadosBody.id_usuario == '' || dadosBody.id_usuario == undefined || isNaN(dadosBody.id_usuario) ||
        dadosBody.titulo == '' || dadosBody.titulo == undefined || !isNaN(dadosBody.titulo) || dadosBody.titulo.length > 45 ||
        dadosBody.descricao == '' || dadosBody.descricao == undefined || !isNaN(dadosBody.descricao) || dadosBody.descricao.length > 500
    ) {
        return message.ERROR_MISTAKE_IN_THE_FILDS
    } else if (dadosBody.tags.length == 0) {
        return message.ERROR_TAGS_WERE_NOT_FORWARDED
    } else if (dadosBody.anexo.length == 0) {
        return message.ERROR_ATTACHMENT_WERE_NOT_FORWARDED
    } else {

        let dadosUpdatePublicacao = await publicacaoModel.updatePublicacaoModel(dadosBody)

        let dadosUpdateTagsPublicacao = await updateTagsPublicacao(dadosBody.tags, dadosBody.id_publicacao)

        let dadosUpdateAnexoPublicacao = await updateAnexosPublicacao(dadosBody.anexos, dadosBody.id_publicacao)

        if (dadosUpdatePublicacao) {
            let dadosUpdatePublicacaoJson = {}

            let novaPublicacao = await publicacaoModel.selectPublicacaoByIdModel(dadosBody.id_publicacao)

            dadosUpdatePublicacaoJson.publicacao_atualizada = novaPublicacao[0]
            dadosUpdatePublicacaoJson.tags_atualizadas = dadosUpdateTagsPublicacao
            dadosUpdatePublicacaoJson.anexos_atualizados = dadosUpdateAnexoPublicacao
            dadosUpdatePublicacaoJson.message = message.SUCCESS_UPDATED_ITEM.message
            dadosUpdatePublicacaoJson.status = message.SUCCESS_UPDATED_ITEM.status

            return dadosUpdatePublicacaoJson
        } else {
            return message.ERROR_INTERNAL_SERVER
        }
    }
}

const updateTagsPublicacao = async (tags, id_publicacao) => {
    let tagsArray = []

    await tagPublicacaoModel.deleteAllTagsByIdPublicacao(id_publicacao)

    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i]

        await tagPublicacaoModel.insertTagPublicacaoModel(tag.id_tag, id_publicacao)

        let tagPublicacaoAtualizada = await tagPublicacaoModel.selectLastId()

        let tagAtualizada = await tagModel.selectTagByIdModel(tagPublicacaoAtualizada[0].id_tag)

        tagsArray.push(tagAtualizada[0])
    }

    return tagsArray

}

const updateAnexosPublicacao = async (anexos, id_publicacao) => {
    let anexosArray = []

    await anexosModel.deleteAllAnexosByIdPublicacao(id_publicacao)

    for (let i = 0; i < anexos.length; i++) {
        let anexo = anexos[i]

        // console.log(anexo);

        await anexosModel.insertAnexoModel(anexo.conteudo, id_publicacao)

        let anexoAtualizado = await anexosModel.selectLastIdAnexoModel()

        anexosArray.push(anexoAtualizado[0])
    }

    return anexosArray
}

const deletePublicacao = async (id_publicacao) => {

    if (id_publicacao == '' || id_publicacao == undefined || id_publicacao == null || isNaN(id_publicacao)) {
        return message.ERROR_INVALID_ID
    } else {

        let publicacaoDeletada = await publicacaoModel.selectPublicacaoByIdModel(id_publicacao)

        let dadosPublicacaoDeletada = await publicacaoModel.deletePublicacaoModel(id_publicacao)

        if (dadosPublicacaoDeletada) {

            let dadosPublicacaoJson = {}

            dadosPublicacaoJson.publicacao_deletada = publicacaoDeletada
            dadosPublicacaoJson.message = message.SUCCESS_DELETED_ITEM.message
            dadosPublicacaoJson.status = message.SUCCESS_DELETED_ITEM.status

            return dadosPublicacaoJson
        } else {
            return message.ERROR_DELETED_ITEM
        }
    }
}

const curtirPublicacao = async (id_publicacao) => {

    if (id_publicacao == '' || id_publicacao == undefined || isNaN(id_publicacao)) {
        return message.ERROR_INVALID_ID
    } else {
        let publicacao = await selectPublicacaoById(id_publicacao)

        // console.log(publicacao);

        let insertCurtidaPublicacao = await publicacaoModel.insertCurtidaPublicacaoModel(id_publicacao)

        if (insertCurtidaPublicacao) {
            
            let insertCurtidaTag = await publicacaoModel.insertCurtidaTagModel()

        } else {
            return message.ERROR_NOT_POSSIBLE_INSERT_LIKE
        }
    }
}

module.exports = {
    insertPublicacao,
    selectAllPublications,
    selectPublicacaoById,
    updatePublicacao,
    deletePublicacao,
    curtirPublicacao
}