const express = require('express');
const router = express.Router();

// RETORNA TODOS OS PRODUTOS
router.get("/", (req, res, next) => {
    res.status(200).send({
        msg: "Retorna todos os produtos."
    });
});

// INSERE UM PRODUTO
router.post("/", (req, res, next) => {
    res.status(201).send({
        msg: "Insere um produto."
    });
});

// RETORNA UM PRODUTO ESPECÍFICO
router.get("/:id_produto", (req, res, next) => {
    const id = req.params.id_produto
    res.status(200).send({
        msg: "O id passado é: "+id+"."
    });
});

// ALTERA UM PRODUTO
router.patch("/", (req, res, next) => {
    res.status(201).send({
        msg: "Produto alterado."
    });
});

// EXCLUI UM PRODUTO
router.delete("/", (req, res, next) => {
    res.status(201).send({
        msg: "Produto excluído."
    });
});

module.exports = router;