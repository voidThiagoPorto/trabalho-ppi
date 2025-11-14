const { Planta, Curtida, Usuario } = require("../model/default");
const formidable = require("formidable")
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const Sequelize = require("sequelize");

const FILE_TYPE_ERROR = 1;

const PUBLIC_FOLDER = path.join(__dirname, "../public/")
//
async function saveFile(file, type) {
    if (type === "txt" && file.mimetype !== "text/plain") {
        throw FILE_TYPE_ERROR;
    }
    if (type === "imagem" && !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
        throw FILE_TYPE_ERROR;
    }

    const oldPath = file.filepath;
    const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
    const ext = path.extname(file.originalFilename);
    const folder = path.join(PUBLIC_FOLDER, type);

    const newPath = path.join(folder, `${hash}${ext}`);
    fs.rename(oldPath, newPath, (err) => {
        if (err) throw err;
    });
    return `${hash}${ext}`;
}
//
async function handleGuia(file, field) {
    const folder = path.join(PUBLIC_FOLDER, "txt");

    if (file && file.size > 0) {
        return await saveFile(file, "txt");
    }

    const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
    const newPath = path.join(folder, `${hash}.txt`);
    fs.writeFile(newPath, field, (err) => {
        if (err) throw err;
    });
    return `${hash}.txt`;
}
//
async function index(req, res, next) {
    // const plantas = await Planta.findAll({ 
    //     include: [{
    //         model: Curtida, 
    //     }],
    //     raw: true
    //  })

    const plantas = await Planta.findAll({
        attributes: {
            include: [
                [Sequelize.fn("COUNT", Sequelize.col("Usuarios.id")), "likes"],
            ]
        },
        include: [
            {
                model: Usuario,
                attributes: ["id"],
                through: { attributes: [] }
            }
        ],
        group: ["Planta.id", "Usuarios.id"],
        raw: true
    });



    res.send(plantas)
    // res.render("planta/index", { plantas: plantas });
}
//
async function create(req, res, next) {
    res.render("planta/criar");
}
//
async function store(req, res, next) {
    const form = formidable.formidable({ allowEmptyFiles: true, minFileSize: 0 });
    form.parse(req, async (err, fields, files) => {
        if (err) { next(err); throw err; }
        try {
            var guia = await handleGuia(files.guiaArquivo[0], fields["guiaTexto"][0]);
            var foto = await saveFile(files.foto[0], "imagem")
        } catch (err) {
            if (err === FILE_TYPE_ERROR) {
                return res.redirect("/planta/criar?erro=1");
            }
            console.error("erro salvando:", err);
            next(err);
        }

        Planta.create({
            nomeCientifico: fields["nomeCientifico"][0],
            nomeComum: fields["nomeComum"][0],
            guia: guia,
            foto: foto,
            usuarioId: req.user.id,
        })
        res.redirect("/planta");
        return;
    });
}
async function edit(req, res, next) {
    const postId = req.params.id
    const post = await Planta.findOne({ where: { id: postId }, raw: true });
    if (post.usuarioId !== req.user.id) {
        res.redirect("/planta");
        return;
    }
    fs.readFile("public/txt/" + post.guia, "utf-8", (err, data) => {
        if (err) throw err;
        res.render("planta/criar", { edit: true, post: post, guia: data });
        return;
    })
}
async function update(req, res, next) {

    const form = formidable.formidable({ allowEmptyFiles: true, minFileSize: 0 });
    form.parse(req, async (err, fields, files) => {
        const oldInfo = await Planta.findOne({ where: { id: fields["postId"][0] } })
        if (req.user.id !== oldInfo.usuarioId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        txtPath = path.join(__dirname, "../public/txt", oldInfo.guia)
        let newGuiaPath = oldInfo.guia;
        fs.unlink(txtPath, (err) => {
            if (err) throw err;
        });
        try {
            newGuiaPath = await handleGuia(files.guiaArquivo[0], fields["guiaTexto"][0]);
        } catch (err) {
            if (err === FILE_TYPE_ERROR) {
                return res.redirect("/planta/edit/" + fields["postId"][0] + "?erro=1");
            }
            console.error("erro salvando:", err);
            next(err);
            return;
        }
        var photoPath = path.join(__dirname, "../public/imagem", oldInfo.foto)
        if (files.foto && files.foto[0] && files.foto[0].size > 0) {
            try {
                fs.unlink(photoPath, (err) => {
                    if (err) throw err;
                });
                photoPath = await saveFile(files.foto[0], "imagem");
            } catch (err) {
                if (err === FILE_TYPE_ERROR) {
                    return res.redirect("/planta/edit/" + fields["postId"][0] + "?erro=1");
                }
                console.error("erro salvando:", err);
                next(err);
                return;
            }
        }
        await Planta.update(
            {
                nomeCientifico: fields["nomeCientifico"][0],
                nomeComum: fields["nomeComum"][0],
                guia: newGuiaPath,
                foto: photoPath,
            },
            {
                where: {
                    id: fields["postId"][0]
                },
            })
        res.redirect("/planta")
    })
}
async function remove(req, res, next) {
    const postId = req.params.id;
    const post = await Planta.findOne({ where: { id: postId } });

    if (post.usuarioId !== req.user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const txtPath = path.join(__dirname + "/../public/txt/" + post.guia);
    const imagePath = path.join(__dirname + "/../public/imagem/" + post.foto);
    fs.unlink(txtPath, (err) => {
        if (err) throw err;
    });
    fs.unlink(imagePath, (err) => {
        if (err) throw err;
    });
    await post.destroy();
    res.redirect("/planta")
}

module.exports = {
    create,
    index,
    store,
    update,
    edit,
    remove,
}