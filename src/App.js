import React, { useState, useEffect } from 'react';

function App() {
    const [chamados, setChamados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ 
        tipo_cliente: '', 
        clienteId: '', 
        titulo: '', 
        descricao: '',
        categoria: 'outro'
    });
    const [tipoUsuario, setTipoUsuario] = useState('cliente');

    // Carregar chamados
    const carregarChamados = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/chamados');
            const data = await response.json();
            setChamados(data);
        } catch (error) {
            console.error('Erro ao carregar chamados:', error);
        }
    };

    // Carregar clientes
    const carregarClientes = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/clientes');
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    };

    useEffect(() => {
        carregarChamados();
        carregarClientes();
    }, []);

    // Criar novo chamado
    const criarChamado = async (e) => {
        e.preventDefault();
        
        // Validar se tipo_cliente está preenchido
        if (!form.tipo_cliente) {
            alert('Selecione o tipo de cliente (Empresa ou Pessoa)');
            return;
        }
        
        if (!form.clienteId) {
            alert('Selecione um cliente');
            return;
        }
        
        const dadosChamado = {
            tipo_cliente: form.tipo_cliente,
            clienteId: parseInt(form.clienteId),
            titulo: form.titulo,
            descricao: form.descricao,
            categoria: form.categoria
        };
        
        console.log('Enviando chamado:', dadosChamado);
        
        try {
            const response = await fetch('http://localhost:3001/api/chamados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosChamado)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar chamado');
            }
            
            alert('Chamado criado com sucesso!');
            setForm({ 
                tipo_cliente: '', 
                clienteId: '', 
                titulo: '', 
                descricao: '',
                categoria: 'outro'
            });
            carregarChamados();
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            alert('Erro ao criar chamado: ' + error.message);
        }
    };

    // Atualizar status
    const atualizarStatus = async (id, novoStatus) => {
        try {
            await fetch(`http://localhost:3001/api/chamados/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            carregarChamados();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status');
        }
    };

    const getStatusColor = (status) => {
        const cores = {
            'aberto': '#ff9800',
            'em_andamento': '#2196f3',
            'resolvido': '#4caf50',
            'fechado': '#9e9e9e'
        };
        return cores[status] || '#000';
    };

    // Filtrar clientes pelo tipo selecionado
    const clientesFiltrados = clientes.filter(cliente => 
        !form.tipo_cliente || cliente.tipo === form.tipo_cliente
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Sistema de Suporte</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setTipoUsuario('admin')} 
                    style={{ 
                        marginRight: '10px', 
                        padding: '10px', 
                        background: tipoUsuario === 'admin' ? '#007bff' : '#ccc',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Admin
                </button>
                <button 
                    onClick={() => setTipoUsuario('cliente')} 
                    style={{ 
                        padding: '10px', 
                        background: tipoUsuario === 'cliente' ? '#007bff' : '#ccc',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Cliente
                </button>
            </div>

            {/* Formulário de novo chamado */}
            <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '5px' }}>
                <h2>Novo Chamado</h2>
                <form onSubmit={criarChamado}>
                    <select 
                        value={form.tipo_cliente} 
                        onChange={(e) => {
                            setForm({...form, tipo_cliente: e.target.value, clienteId: ''});
                        }}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Selecione o tipo de cliente</option>
                        <option value="empresa">Empresa</option>
                        <option value="pessoa">Pessoa Física</option>
                    </select>
                    
                    <select 
                        value={form.clienteId} 
                        onChange={(e) => setForm({...form, clienteId: e.target.value})}
                        required
                        disabled={!form.tipo_cliente}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Selecione o cliente</option>
                        {clientesFiltrados.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome} - {cliente.documento}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        value={form.categoria} 
                        onChange={(e) => setForm({...form, categoria: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="tecnico">Técnico</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="comercial">Comercial</option>
                        <option value="outro">Outro</option>
                    </select>
                    
                    <input
                        type="text"
                        placeholder="Título"
                        value={form.titulo}
                        onChange={(e) => setForm({...form, titulo: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    
                    <textarea
                        placeholder="Descrição"
                        value={form.descricao}
                        onChange={(e) => setForm({...form, descricao: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }}
                    />
                    
                    <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Abrir Chamado
                    </button>
                </form>
            </div>

            {/* Lista de chamados */}
            <div>
                <h2>Chamados</h2>
                {chamados.length === 0 ? (
                    <p>Nenhum chamado encontrado.</p>
                ) : (
                    chamados.map(chamado => (
                        <div key={chamado.id} style={{ 
                            border: '1px solid #ddd', 
                            marginBottom: '10px', 
                            padding: '15px', 
                            borderRadius: '5px',
                            background: '#f9f9f9'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{chamado.titulo}</h3>
                                <span style={{ 
                                    background: getStatusColor(chamado.status), 
                                    color: 'white', 
                                    padding: '5px 10px', 
                                    borderRadius: '3px',
                                    fontSize: '12px'
                                }}>
                                    {chamado.status}
                                </span>
                            </div>
                            
                            <p><strong>Cliente:</strong> {chamado.cliente_nome} ({chamado.tipo_cliente === 'empresa' ? 'Empresa' : 'PF'})</p>
                            <p><strong>Categoria:</strong> {chamado.categoria}</p>
                            <p>{chamado.descricao}</p>
                            <small><strong>Aberto em:</strong> {new Date(chamado.criado_em).toLocaleString()}</small>
                            
                            {tipoUsuario === 'admin' && (
                                <div style={{ marginTop: '10px' }}>
                                    <select 
                                        value={chamado.status}
                                        onChange={(e) => atualizarStatus(chamado.id, e.target.value)}
                                        style={{ padding: '5px', marginLeft: '10px' }}
                                    >
                                        <option value="aberto">Aberto</option>
                                        <option value="em_andamento">Em Andamento</option>
                                        <option value="resolvido">Resolvido</option>
                                        <option value="fechado">Fechado</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;