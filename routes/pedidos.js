const express = require('express');
const router = express.Router();

// RETORNA TODOS OS PEDIDOS
router.get("/", (req, res, next) => {
    res.status(200).send({
        msg: "Retorna os pedidos."
    });
});

// INSERE UM PEDIDOS
router.post("/", (req, res, next) => {
    res.status(201).send({
        msg: "O pedido foi criado."
    });
});

// RETORNA UM PEDIDO ESPECÍFICO
router.get("/:id_pedido", (req, res, next) => {
    const id = req.params.id_produto
    res.status(200).send({
        msg: "Detalhes do pedido.",
        id_pedido: id
    });
});

// EXCLUI UM PRODUTO
router.delete("/", (req, res, next) => {
    res.status(201).send({
        msg: "Pedido excluído."
    });
});

module.exports = router;