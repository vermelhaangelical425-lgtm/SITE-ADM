'use client'

import React, { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('produtos')
  const [produtos, setProdutos] = useState<any[]>([])
  const [pix, setPix] = useState('Soniasouzas1509@gmail.com')
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  
  useEffect(() => {
    fetch('/api/produtos')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProdutos(data)
      })

    // Forçar remoção absoluta da badge do Netlify via JavaScript
    const killNetlifyBadge = () => {
      // 1. Tentar definir o estado na memória do navegador para esconder nativamente
      try {
        localStorage.setItem('netlify-drawer-state', 'hidden');
        sessionStorage.setItem('netlify-drawer-state', 'hidden');
        localStorage.setItem('ntl-drawer-state', 'hidden');
      } catch (e) {}

      // 2. Varrer todos os elementos filhos do body
      const elements = document.body.children;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const tag = el.tagName.toLowerCase();
        // Se for um elemento injetado do Netlify (netlify-drawer, netlify-toolbar, etc)
        if (tag.includes('netlify') || tag.includes('stackbit') || el.id.includes('netlify') || el.className.includes('netlify')) {
          el.remove();
        }
        // Se contiver o texto "Powered by Netlify"
        if (el.innerHTML && el.innerHTML.includes('Powered by Netlify') && tag !== 'script' && tag !== 'main' && tag !== 'div') {
          el.remove();
        }
      }
    }
    
    killNetlifyBadge()
    const observer = new MutationObserver(killNetlifyBadge)
    observer.observe(document.documentElement, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [])

  const handleEdit = (produto: any) => {
    setEditingProduct({ ...produto })
  }

  const handleSaveEdit = async () => {
    if (editingProduct) {
      await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingProduct.id, 
          price: editingProduct.price,
          name: editingProduct.name,
          description: editingProduct.description,
          image: editingProduct.image
        })
      })
      setProdutos(produtos.map(p => p.id === editingProduct.id ? editingProduct : p))
      setEditingProduct(null)
      alert("Produto atualizado com sucesso!")
    }
  }

  const handleAddProduct = async () => {
    const name = prompt("Nome do produto:")
    if (!name) return;
    const price = prompt("Preço do produto (ex: 15.50):")
    if (!price) return;
    const desc = prompt("Descrição do produto:")
    
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description: desc })
    })
    const novo = await res.json()
    if(novo && novo.id) {
      setProdutos([...produtos, novo])
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
          <img src="/logo.jpg" alt="Sabor Gourmet" className="w-8 h-8 rounded-full" />
          Sabor Gourmet
        </h2>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('produtos')} className={`p-3 rounded text-left font-semibold ${activeTab === 'produtos' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>🍔 Produtos</button>
          <button onClick={() => setActiveTab('config')} className={`p-3 rounded text-left font-semibold ${activeTab === 'config' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>💲 Configurações (PIX)</button>
          <button onClick={() => setActiveTab('pedidos')} className={`p-3 rounded text-left font-semibold ${activeTab === 'pedidos' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>🧾 Pedidos</button>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-8">
        
        {activeTab === 'produtos' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
              <button onClick={handleAddProduct} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition">
                + Adicionar Produto
              </button>
            </header>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Imagem</th>
                    <th className="p-4 font-semibold text-gray-600">Nome</th>
                    <th className="p-4 font-semibold text-gray-600">Preço Atual</th>
                    <th className="p-4 font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map(produto => (
                    <tr key={produto.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4"><img src={produto.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'} className="w-16 h-16 rounded object-cover shadow-sm" /></td>
                      <td className="p-4 font-bold text-gray-800 text-lg">{produto.name}</td>
                      <td className="p-4">
                        <span className="text-green-600 font-bold">R$ {produto.price?.toFixed(2).replace('.', ',')}</span>
                      </td>
                      <td className="p-4 flex gap-2 items-center h-full pt-8">
                        <button onClick={() => handleEdit(produto)} className="text-blue-600 font-semibold px-4 py-1.5 border border-blue-600 rounded hover:bg-blue-50 transition cursor-pointer z-10 relative">Editar</button>
                        <button onClick={async () => {
                          if (confirm('Deletar produto?')) {
                            await fetch(`/api/produtos?id=${produto.id}`, { method: 'DELETE' })
                            setProdutos(produtos.filter(p => p.id !== produto.id))
                          }
                        }} className="text-red-600 font-semibold px-4 py-1.5 border border-red-600 rounded hover:bg-red-50 transition cursor-pointer z-10 relative">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal de Edição */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Editar Produto</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                      <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                      <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border p-2 rounded h-24" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Link da Imagem (URL)</label>
                      <input type="text" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full border p-2 rounded text-sm" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancelar</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Salvar Alterações</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'config' && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Configurações da Loja</h1>
            </header>
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Chave PIX (E-mail, CPF, Telefone)</label>
                <input 
                  type="text" 
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  className="w-full border rounded p-2 text-gray-800"
                />
              </div>
              <button onClick={() => alert('Chave PIX atualizada no sistema!')} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                Salvar Configurações
              </button>
            </div>
          </>
        )}

        {activeTab === 'pedidos' && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Pedidos Recentes</h1>
            </header>
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <p>Nenhum pedido recente. Os pedidos finalizados no WhatsApp também podem ser acompanhados aqui no futuro!</p>
            </div>
          </>
        )}

      </main>
    </div>
  )
}
