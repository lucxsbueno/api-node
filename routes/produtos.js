const login = require("../middleware/login");
const express = require('express');
const router = express.Router();

const mysql = require("./mysql");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/");
    },
    filename: function (req, file, callback) {
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        callback(null, data + file.originalname );
    }
});

const filter = (req, file, callback) => {
    const archive = "image/";
    const mimeTypes = [archive+"jpg", archive+"png", archive+"jpeg"];
    mimeTypes.forEach(type => {
        if(file.mimetype == type){
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
};

const upload = multer({ 
    storage: storage,
    limits: {
        // 5mb
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filter
});

// RETORNA TODOS OS PRODUTOS
router.get("/", (req, res, next) => {

    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "SELECT * FROM produtos",
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                const response = {
                    quantidade: results.length,
                    produtos: results.map(prod => {
                        return {
                            id_produto: prod.id_produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem_produto: "http:/localhost:3000/"+prod.produto_imagem,
                            request: {
                                tipo: "GET",
                                descricao: "Retorna todos os produtos.",
                                url: "http://localhost:3000/produtos/"+prod.id_produto
                            }
                        }
                    })
                }

                return res.status(200).send({ response: response });

            });

    });

});

// INSERE UM PRODUTO
router.post("/", login.obrigatorio, upload.single("produto_imagem"), (req, res, next) => {

    console.log(req.file);

    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "INSERT INTO produtos (nome, preco, produto_imagem) VALUES (?, ?, ?)",
            [ req.body.nome, req.body.preco, req.file.path ],
            (err, results, fields) => {

                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null 
                    });
                }

                const response = {
                    msg: "Produto criado com sucesso!",
                    error: false,
                    produto: {
                        id_produto: results.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        image_produto: "http:/localhost:3000/"+req.file.path,
                        request: {
                            tipo: "POST",
                            descricao: "Insere um produto.",
                            url: "http://localhost:3000/produtos"
                        }
                    }
                }
                
                res.status(201).send({
                    response: response
                });

        });
    });

});

// RETORNA UM PRODUTO ESPECÍFICO
router.get("/:id_produto", (req, res, next) => {

    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "SELECT * FROM produtos WHERE id_produto = ?",
            [req.params.id_produto],
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                if (results.length == 0) { return res.status(404).send({ msg: "Não foi encontradp produto com este id." }); }

                const response = {
                        produto: {
                        id_produto: results[0].id_produto,
                        nome: results[0].nome,
                        preco: results[0].preco,
                        request: {
                            tipo: "POST",
                            descricao: "Retorna um produto.",
                            url: "http://localhost:3000/produtos"
                        }
                    }
                }

                return res.status(202).send({ response: response });

            });

    });

});

// ALTERA UM PRODUTO
router.patch("/", login.obrigatorio, (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "UPDATE produtos SET nome = ?, preco = ? WHERE id_produto = ?",
            [req.body.nome, req.body.preco, req.body.id_produto],
            (err, results, fields) => {

                conn.release();

                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null 
                    });
                }
                
                const response = {
                    msg: "Produto atualizado com sucesso!",
                    error: false,
                    produto: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: "POST",
                            descricao: "Insere um produto.",
                            url: "http://localhost:3000/produtos/" + req.body.id_produto
                        }
                    }
                }
                
                res.status(202).send({
                    response: response
                });

        });
    });


});

// EXCLUI UM PRODUTO
router.delete("/", login.obrigatorio, (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query("DELETE FROM produtos WHERE id_produto = ?", [req.body.id_produto],
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                const response = {
                    msg: "Produto excluído com sucesso!",
                    request: {
                        tipo: "POST",
                        descricao: "Exclui um produto.",
                        url: "http://localhost:3000/produtos",
                        body: {
                            nome: "String",
                            preco: "Number"
                        }
                    }
                }

                return res.status(202).send({ response: response });

            });
    });
});

module.exports = router;