const express = require('express');
const router = express.Router();

const mysql = require("./mysql");

// RETORNA TODOS OS PEDIDOS
router.get("/", (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "SELECT pedidos.id_pedido, pedidos.quantidade, pedidos.id_produto, produtos.nome, produtos.preco FROM pedidos INNER JOIN produtos ON produtos.id_produto = pedidos.id_produto",
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                const response = {
                    pedidos: results.map(pedido => {
                        return {
                            id_pedido: pedido.id_pedido,
                            quantidade: pedido.quantidade,
                            produto: {
                                id_produto: pedido.id_produto,
                                nome: pedido.nome,
                                preco: pedido.preco
                            },
                            request: {
                                tipo: "GET",
                                descricao: "Retorna os detalhes de um pedido específico.",
                                url: "http://localhost:3000/pedidos/"+pedido.id_pedido
                            }
                        }
                    })
                }

                return res.status(200).send({ response: response });

            });

    });

});

// INSERE UM PEDIDOS
router.post("/", (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        // VERIFICA SE EXISTE O PRODUTO
        conn.query("SELECT * FROM produtos WHERE id_produto = ?", [req.body.id_produto], (error, results, fields) => {
            if (error) { return res.status(500).send({ error: error, response: null }); }
            if (results.length == 0) { return res.status(404).send({ msg: "Produto não encontrado!" }); }
        });

        conn.query("INSERT INTO pedidos (id_produto, quantidade) VALUES (?, ?)", [req.body.id_produto, req.body.quantidade], (error, results, fields) => {

            conn.release();

            if (error) { return res.status(500).send({ error: error, response: null }); }

            if (results.length == 0) { return res.status(404).send({ msg: "Pedido não encontrado!" }); }

            const response = {
                msg: "Pedido criado com sucesso!",
                error: false,
                pedido: {
                    id_pedido: results.insertId,
                    id_produto: req.body.id_produto,
                    quantidade: req.body.quantidade,
                    preco: req.body.preco,
                    request: {
                        tipo: "GET",
                        descricao: "Retorna todos os pedidos.",
                        url: "http://localhost:3000/pedidos"
                    }
                }
            }
            
            res.status(201).send({ response: response });

        });

    });

    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        
    });

});

// RETORNA UM PEDIDO ESPECÍFICO
router.get("/:id_pedido", (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        
        if (error) { return res.status(500).send({ error: error }); }

        conn.query(
            "SELECT * FROM pedidos WHERE id_pedido = ?",
            [req.params.id_pedido],
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                if (results.length == 0) { return res.status(404).send({ msg: "Pedido não encontrado!", error: 404 }); }

                const response = {
                        pedido: {
                        id_pedido: results[0].id_pedido,
                        id_produto: results[0].id_produto,
                        quantidade: results[0].quantidade,
                        request: {
                            tipo: "POST",
                            descricao: "Retorna um pedido.",
                            url: "http://localhost:3000/pedidos"
                        }
                    }
                }

                return res.status(200).send({ response: response });

            });

    });

});

// EXCLUI UM PRODUTO
router.delete("/", (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query("DELETE FROM pedidos WHERE id_pedido = ?", [req.body.id_pedido],
            (error, results, fields) => {

                if (error) { return res.status(500).send({ error: error }); }

                const response = {
                    msg: "Pedido excluído com sucesso!",
                    request: {
                        tipo: "POST",
                        descricao: "Exclui um pedido",
                        url: "http://localhost:3000/pedidos",
                        body: {
                            nome: "String",
                            quantidade: "Number"
                        }
                    }
                }

                return res.status(202).send({ response: response });

            });
    });

});

module.exports = router;