const { Planta } = require("../model/default");
const formidable = require("formidable")
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const FILE_TYPE_ERROR = 1;

const PUBLIC_FOLDER = path.join(__dirname, "../public/")
//
async function saveFile(file, type) {
    if (type === "txt" && file.mimetype !== "text/plain") {
        throw FILE_TYPE_ERROR;
    }
    if(type === "imagem" && !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)){
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
    return newPath;
}
//
async function index(req, res) {
    const plantas = await Planta.findAll({raw: true })
    // res.send(plantas)
    res.render("planta/index", {plantas: plantas});
}
//
async function create(req, res) {
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
    });
}

module.exports = {
    create,
    index,
    store
}