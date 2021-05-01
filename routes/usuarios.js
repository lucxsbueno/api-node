const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");

const mysql = require("./mysql");

const jwt = require("jsonwebtoken");

router.post("/cadastro", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query("SELECT * FROM usuarios WHERE email = ?", [req.body.email], (error, results) => {
            
            if (error) { return res.status(500).send({ error: error }); }
            
            if (results.length > 0) {
                res.status(409).send({ msg: "Usuário já cadastrado!" });
            } else {
                bcrypt.hash( req.body.senha, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { res.status(500).send({ error: errBcrypt }) }
                    conn.query("INSERT INTO usuarios (email, senha) VALUES (?, ?)", [ req.body.email, hash ], (error, results) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }); }
        
                        const response = {
                            msg: "Sua conta foi criada com sucesso!",
                            usuario: {
                                id_usuario: results.insertId,
                                email: req.body.email
                            }
                        }
        
                        return res.status(201).send({ response: response })
                    });
                });
            }

        });
    });
});

router.post("/login", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query("SELECT * FROM usuarios WHERE email = ?", [ req.body.email ], (error, results) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }); }
            if (results.length < 1) {
                return res.status(401).send({ msg: "Falha na autenticação!" });
            }
            bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
                if (error) {
                    return res.status(401).send({ msg: "Falha na autenticação!" });
                }
                if (result) {
                    let token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email,

                    }, process.env.JWT_TOKEN, { 
                        expiresIn: "1h"
                     });
                    return res.status(200).send({
                        msg: "Autenticado com sucesso!",
                        token: token
                    });
                }
                return res.status(401).send({ msg: "Falha na autenticação!" });
            });
        });
    });
});

module.exports = router;