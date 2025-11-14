const database = require('../db');
const Curtida = database.models.curtida;

async function adicionar(req, res, next) {
    const userId = req.user.id;
    const postId = req.params.id;

    const thisCurtida = await Curtida.findOne({
        where: {
            usuarioId: userId,
            plantumId: postId
        }
    });

    if (!thisCurtida) {
        await Curtida.create({
            plantumId: postId,
            usuarioId: userId
        })
    }

    res.redirect("/planta");
}

async function remover(req, res, next) {
    const userId = req.user.id;
    const postId = req.params.id;

    const thisCurtida = await Curtida.findOne({
        where: {
            usuarioId: userId,
            plantumId: postId
        }
    });

    if (thisCurtida) {
        thisCurtida.destroy();
    }

    res.redirect("/planta");
}

module.exports = {
    adicionar,
    remover
}