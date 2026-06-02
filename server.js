const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());
app.use(express.json());

// Configuração do MySQL - Conectando no suporte_db
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Coloque sua senha do MySQL aqui
    database: 'suporte_db'
});

// Conectar ao MySQL
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL! Banco: suporte_db');
});

// Rota para listar todos os chamados
app.get('/api/chamados', (req, res) => {
    const query = `
        SELECT c.*, 
               CASE 
                   WHEN c.tipo_cliente = 'empresa' THEN e.razao_social
                   WHEN c.tipo_cliente = 'pessoa' THEN p.nome
               END as cliente_nome,
               CASE 
                   WHEN c.tipo_cliente = 'empresa' THEN e.cnpj
                   WHEN c.tipo_cliente = 'pessoa' THEN p.cpf
               END as cliente_documento
        FROM chamados c
        LEFT JOIN clientes_empresa e ON c.empresa_id = e.id
        LEFT JOIN clientes_pessoa p ON c.pessoa_id = p.id
        ORDER BY c.criado_em DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar chamados:', err);
            res.status(500).json({ error: 'Erro ao buscar chamados', detalhes: err.message });
            return;
        }
        res.json(results);
    });
});

// Rota para listar clientes (empresas + pessoas)
app.get('/api/clientes', (req, res) => {
    const query = `
        SELECT id, 'empresa' as tipo, razao_social as nome, cnpj as documento, email, telefone 
        FROM clientes_empresa
        UNION
        SELECT id, 'pessoa' as tipo, nome, cpf as documento, email, telefone 
        FROM clientes_pessoa
        ORDER BY nome
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar clientes:', err);
            res.status(500).json({ error: 'Erro ao buscar clientes' });
            return;
        }
        res.json(results);
    });
});

// Criar novo chamado
app.post('/api/chamados', (req, res) => {
    const { tipo_cliente, clienteId, titulo, descricao, categoria = 'outro' } = req.body;
    
    let query, params;
    
    if (tipo_cliente === 'empresa') {
        query = 'INSERT INTO chamados (tipo_cliente, empresa_id, titulo, descricao, categoria) VALUES (?, ?, ?, ?, ?)';
        params = [tipo_cliente, clienteId, titulo, descricao, categoria];
    } else {
        query = 'INSERT INTO chamados (tipo_cliente, pessoa_id, titulo, descricao, categoria) VALUES (?, ?, ?, ?, ?)';
        params = [tipo_cliente, clienteId, titulo, descricao, categoria];
    }
    
    connection.query(query, params, (err, result) => {
        if (err) {
            console.error('Erro ao criar chamado:', err);
            res.status(500).json({ error: 'Erro ao criar chamado' });
            return;
        }
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Chamado criado com sucesso' 
        });
    });
});

// Atualizar status do chamado
app.put('/api/chamados/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const query = 'UPDATE chamados SET status = ?, atualizado_em = NOW() WHERE id = ?';
    
    connection.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar status:', err);
            res.status(500).json({ error: 'Erro ao atualizar status' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Chamado não encontrado' });
            return;
        }
        
        res.json({ id, status, message: 'Status atualizado' });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Conectado ao banco: suporte_db`);
});