// Estoque App v5 — SPA simples com localStorage (GitHub Pages ready)
const KEY_PRODUCTS = 'estoque_products_v5';
const KEY_CLIENTS = 'estoque_clients_v5';
const KEY_MOVS = 'estoque_movements_v5';
const KEY_COUPONS = 'estoque_coupons_v5';

const load = (k, fallback) => { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; } catch(e){console.error(e); return fallback;} };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){console.error(e);} };

let products = load(KEY_PRODUCTS, null);
let clients = load(KEY_CLIENTS, null);
let movements = load(KEY_MOVS, null);
let coupons = load(KEY_COUPONS, null);

if(!products){
  products = [
    {id:'p1', name:'Caneta Esferográfica', desc:'Pacote com 10 unidades', price:4.50, qty:50},
    {id:'p2', name:'Caderno 100 folhas', desc:'Capa dura', price:15.90, qty:30},
    {id:'p3', name:'Mochila Escolar', desc:'Resistente, 20L', price:89.90, qty:12},
  ];
  save(KEY_PRODUCTS, products);
}
if(!clients){
  clients = [
    {id:'c1', name:'João Silva', phone:'(11) 99999-0000', email:'joao@mail.com', address:'Rua A, 123'},
    {id:'c2', name:'Maria Oliveira', phone:'(21) 98888-1111', email:'maria@mail.com', address:'Av B, 45'},
  ];
  save(KEY_CLIENTS, clients);
}
if(!movements){ movements = []; save(KEY_MOVS, movements); }
if(!coupons){ coupons = []; save(KEY_COUPONS, coupons); }

const main = document.getElementById('main');

function setActiveMenu(page){
  document.querySelectorAll('.menu li').forEach(li=> li.classList.toggle('active', li.dataset.page===page));
}
function fmtMoneyBR(value){
  return 'R$ ' + Number(value).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function escapeHtml(str){
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// Produtos
function renderProducts(){
  setActiveMenu('products');
  main.innerHTML = `
    <div class="header"><h2>Produtos</h2><div class="small">Gerencie preços e estoques</div></div>
    <div class="card">
      <h3 id="prod-form-title">Cadastro de produtos</h3>
      <form id="prod-form">
        <div class="form-row"><input class="input" id="p-name" placeholder="Nome" required></div>
        <div class="form-row"><textarea class="input" id="p-desc" placeholder="Descrição"></textarea></div>
        <div class="form-row">
          <input class="input" id="p-price" placeholder="Preço (ex: 49,90)" required>
          <input class="input" id="p-qty" placeholder="Estoque (ex: 10)" required>
        </div>
        <div><button class="btn" type="submit" id="p-submit">Adicionar</button> <button type="button" id="p-cancel" class="btn btn-danger" style="display:none">Cancelar edição</button></div>
      </form>
    </div>
    <div class="card">
      <h3>Lista de produtos</h3>
      <table class="table" id="products-table">
        <thead><tr><th>Nome</th><th>Descrição</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  const tbody = main.querySelector('#products-table tbody');
  function refreshTable(){
    tbody.innerHTML = '';
    if(products.length===0){
      tbody.innerHTML = '<tr><td colspan="5" class="small">Nenhum produto</td></tr>';
      return;
    }
    products.forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.desc||'')}</td><td>${fmtMoneyBR(p.price)}</td><td>${p.qty}</td>
        <td class="actions">
          <button data-id="${p.id}" class="btn edit">Editar</button>
          <button data-id="${p.id}" class="btn btn-danger del">Excluir</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }
  refreshTable();

  let editingId = null;
  const form = main.querySelector('#prod-form');
  const nameInput = main.querySelector('#p-name');
  const descInput = main.querySelector('#p-desc');
  const priceInput = main.querySelector('#p-price');
  const qtyInput = main.querySelector('#p-qty');
  const submitBtn = main.querySelector('#p-submit');
  const cancelBtn = main.querySelector('#p-cancel');
  const title = main.querySelector('#prod-form-title');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const priceStr = priceInput.value.replace(/\./g,'').replace(',', '.');
    const price = parseFloat(priceStr || 0);
    const qty = parseInt(qtyInput.value || 0);
    if(!name) return alert('Nome requerido');
    if(isNaN(price) || isNaN(qty)) return alert('Preço e estoque devem ser numéricos');
    if(editingId){
      products = products.map(p=> p.id===editingId? {...p, name, desc, price, qty}: p);
      editingId = null;
      submitBtn.textContent = 'Adicionar';
      cancelBtn.style.display = 'none';
      title.textContent = 'Cadastro de produtos';
    } else {
      const newP = { id: Date.now().toString(), name, desc, price, qty };
      products.unshift(newP);
    }
    save(KEY_PRODUCTS, products);
    refreshTable();
    form.reset();
  });

  tbody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const pid = btn.dataset.id;
    if(btn.classList.contains('edit')){
      const p = products.find(x=>x.id===pid);
      nameInput.value = p.name;
      descInput.value = p.desc;
      priceInput.value = String(p.price).replace('.',',');
      qtyInput.value = p.qty;
      editingId = pid;
      submitBtn.textContent = 'Atualizar';
      cancelBtn.style.display = 'inline-block';
      title.textContent = 'Editar produto';
      window.scrollTo({top:0, behavior:'smooth'});
    }
    if(btn.classList.contains('del')){
      if(!confirm('Remover produto?')) return;
      products = products.filter(x=>x.id!==pid);
      save(KEY_PRODUCTS, products);
      refreshTable();
    }
  });

  cancelBtn.addEventListener('click', ()=>{
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Adicionar';
    cancelBtn.style.display = 'none';
    title.textContent = 'Cadastro de produtos';
  });
}

// Clientes
function renderClients(){
  setActiveMenu('clients');
  main.innerHTML = `
    <div class="header"><h2>Clientes</h2><div class="small">Cadastro de clientes</div></div>
    <div class="card">
      <h3>Cadastro de clientes</h3>
      <form id="client-form">
        <div class="form-row"><input class="input" id="c-name" placeholder="Nome" required></div>
        <div class="form-row"><input class="input" id="c-phone" placeholder="Telefone"></div>
        <div class="form-row"><input class="input" id="c-email" placeholder="Email"></div>
        <div class="form-row"><input class="input" id="c-address" placeholder="Endereço"></div>
        <div><button class="btn" type="submit" id="c-submit">Adicionar</button> <button type="button" id="c-cancel" class="btn btn-danger" style="display:none">Cancelar edição</button></div>
      </form>
    </div>
    <div class="card">
      <h3>Lista de clientes</h3>
      <table class="table" id="clients-table">
        <thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Endereço</th><th>Ações</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  const tbody = main.querySelector('#clients-table tbody');
  function refresh(){
    tbody.innerHTML = '';
    if(clients.length===0){
      tbody.innerHTML = '<tr><td colspan="5" class="small">Nenhum cliente</td></tr>';
      return;
    }
    clients.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.phone||'')}</td><td>${escapeHtml(c.email||'')}</td><td>${escapeHtml(c.address||'')}</td>
        <td><button data-id="${c.id}" class="btn edit">Editar</button> <button data-id="${c.id}" class="btn btn-danger del">Excluir</button></td>`;
      tbody.appendChild(tr);
    });
  }
  refresh();

  let editingId = null;
  const form = main.querySelector('#client-form');
  const nameInput = main.querySelector('#c-name');
  const phoneInput = main.querySelector('#c-phone');
  const emailInput = main.querySelector('#c-email');
  const addressInput = main.querySelector('#c-address');
  const submitBtn = main.querySelector('#c-submit');
  const cancelBtn = main.querySelector('#c-cancel');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();
    if(!name) return alert('Nome necessário');
    if(editingId){
      clients = clients.map(c=> c.id===editingId? {...c, name, phone, email, address} : c);
      editingId = null;
      submitBtn.textContent = 'Adicionar';
      cancelBtn.style.display = 'none';
    } else {
      clients.unshift({id: Date.now().toString(), name, phone, email, address});
    }
    save(KEY_CLIENTS, clients);
    refresh();
    form.reset();
  });

  tbody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const cid = btn.dataset.id;
    if(btn.classList.contains('edit')){
      const c = clients.find(x=>x.id===cid);
      nameInput.value = c.name;
      phoneInput.value = c.phone;
      emailInput.value = c.email;
      addressInput.value = c.address;
      editingId = cid;
      submitBtn.textContent = 'Atualizar';
      cancelBtn.style.display = 'inline-block';
      window.scrollTo({top:0, behavior:'smooth'});
    }
    if(btn.classList.contains('del')){
      if(!confirm('Remover cliente?')) return;
      clients = clients.filter(x=>x.id!==cid);
      save(KEY_CLIENTS, clients);
      refresh();
    }
  });

  cancelBtn.addEventListener('click', ()=>{
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Adicionar';
    cancelBtn.style.display = 'none';
  });
}

// Movimentação
function renderMovements(){
  setActiveMenu('movements');
  main.innerHTML = `
    <div class="header"><h2>Movimentação</h2><div class="small">Entradas e saídas de estoque</div></div>
    <div class="card">
      <h3>Registrar entrada / saída</h3>
      <form id="mov-form">
        <div class="form-row">
          <select class="input" id="mov-product"><option value="">-- Selecionar produto --</option></select>
          <select class="input" id="mov-type"><option value="out">Saída (venda)</option><option value="in">Entrada (reposição)</option></select>
        </div>
        <div class="form-row">
          <input class="input" id="mov-qty" type="number" min="1" value="1">
          <input class="input" id="mov-note" placeholder="Observação">
        </div>
        <div><button class="btn" type="submit">Aplicar</button></div>
      </form>
    </div>

    <div class="card">
      <h3>Histórico de movimentações</h3>
      <table class="table" id="mov-table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Obs</th></tr></thead><tbody></tbody></table>
    </div>
  `;

  const prodSelect = main.querySelector('#mov-product');
  const typeEl = main.querySelector('#mov-type');
  const qtyEl = main.querySelector('#mov-qty');
  const noteEl = main.querySelector('#mov-note');
  const tableBody = main.querySelector('#mov-table tbody');

  function refreshProducts(){
    prodSelect.innerHTML = '<option value="">-- Selecionar produto --</option>';
    products.forEach(p=>{
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (Estoque: ${p.qty})`;
      prodSelect.appendChild(opt);
    });
  }
  function refreshMovs(){
    tableBody.innerHTML = '';
    if(movements.length===0){
      tableBody.innerHTML = '<tr><td colspan="5" class="small">Nenhuma movimentação</td></tr>';
      return;
    }
    movements.forEach(m=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(m.date).toLocaleString()}</td><td>${escapeHtml(m.productName)}</td><td>${m.type}</td><td>${m.qty}</td><td>${escapeHtml(m.note||'')}</td>`;
      tableBody.appendChild(tr);
    });
  }
  refreshProducts();
  refreshMovs();

  main.querySelector('#mov-form').addEventListener('submit', e=>{
    e.preventDefault();
    const pid = prodSelect.value;
    const type = typeEl.value;
    const qty = parseInt(qtyEl.value || 0);
    const note = noteEl.value.trim();
    if(!pid) return alert('Escolha um produto');
    const prod = products.find(p=>p.id===pid);
    if(!prod) return alert('Produto não encontrado');
    if(type==='out' && prod.qty < qty) return alert('Estoque insuficiente');
    products = products.map(p=> p.id===pid? {...p, qty: type==='out'? p.qty-qty : p.qty+qty } : p);
    save(KEY_PRODUCTS, products);
    const mv = { id: Date.now().toString(), productId: prod.id, productName: prod.name, type, qty, note, date: new Date().toISOString() };
    movements.unshift(mv);
    save(KEY_MOVS, movements);
    refreshProducts();
    refreshMovs();
    prodSelect.value='';
    qtyEl.value = 1;
    noteEl.value='';
  });
}

// Cupons
function renderCoupons(){
  setActiveMenu('coupons');
  main.innerHTML = `
    <div class="header"><h2>Gerar Cupom</h2><div class="small">Crie cupons e exporte em TXT</div></div>
    <div class="card">
      <h3>Gerar cupom</h3>
      <div class="form-row">
        <select class="input" id="cup-client"><option value="">-- Cliente (opcional) --</option></select>
        <input class="input" id="cup-discount" placeholder="Desconto (R$)">
      </div>
      <div class="form-row">
        <select class="input" id="cup-addprod"><option value="">-- Adicionar produto --</option></select>
      </div>
      <div class="card">
        <h4>Carrinho</h4>
        <table class="table" id="cart-table"><thead><tr><th>Produto</th><th>Preço</th><th>Qtd</th><th>Sub</th><th></th></tr></thead><tbody></tbody></table>
        <div style="margin-top:12px"><strong id="cart-total">Total: R$ 0,00</strong></div>
        <div style="margin-top:8px"><button class="btn" id="cup-create">Criar cupom</button></div>
      </div>
    </div>

    <div class="card">
      <h3>Cupons gerados</h3>
      <table class="table" id="coupons-table"><thead><tr><th>Data</th><th>Cliente</th><th>Total</th><th>Ações</th></tr></thead><tbody></tbody></table>
    </div>
  `;

  const clientSelect = main.querySelector('#cup-client');
  const addProdSelect = main.querySelector('#cup-addprod');
  const cartTableBody = main.querySelector('#cart-table tbody');
  const cartTotalEl = main.querySelector('#cart-total');
  const couponsTableBody = main.querySelector('#coupons-table tbody');
  const discountInput = main.querySelector('#cup-discount');

  let cart = [];

  function refreshClients(){ clientSelect.innerHTML = '<option value="">-- Cliente (opcional) --</option>'; clients.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; clientSelect.appendChild(o); }); }
  function refreshProducts(){ addProdSelect.innerHTML = '<option value="">-- Adicionar produto --</option>'; products.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=`${p.name}  ${fmtMoneyBR(p.price)}`; addProdSelect.appendChild(o); }); }
  function refreshCart(){
    cartTableBody.innerHTML='';
    if(cart.length===0){ cartTableBody.innerHTML = '<tr><td colspan="5" class="small">Carrinho vazio</td></tr>'; cartTotalEl.textContent = 'Total: R$ 0,00'; return; }
    let total = 0;
    cart.forEach(i=>{
      const tr = document.createElement('tr');
      const sub = Number(i.price * i.qty);
      total += sub;
      tr.innerHTML = `<td>${escapeHtml(i.name)}</td><td>${fmtMoneyBR(i.price)}</td><td><input class="input" type="number" min="1" value="${i.qty}" data-id="${i.id}" style="width:80px"></td><td>${fmtMoneyBR(sub)}</td><td><button class="btn btn-danger remove" data-id="${i.id}">Remover</button></td>`;
      cartTableBody.appendChild(tr);
    });
    const disc = parseFloat((discountInput.value || '0').toString().replace(/\./g,'').replace(',','.')) || 0;
    const final = total - disc;
    cartTotalEl.textContent = `Total: ${fmtMoneyBR(total)}  | Desconto: ${fmtMoneyBR(disc)}  | Final: ${fmtMoneyBR(final)}`;
  }

  function refreshCouponsTable(){
    couponsTableBody.innerHTML='';
    if(coupons.length===0){ couponsTableBody.innerHTML = '<tr><td colspan="4" class="small">Nenhum cupom</td></tr>'; return; }
    coupons.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(c.date).toLocaleString()}</td><td>${escapeHtml(c.client)}</td><td>${fmtMoneyBR(c.final)}</td><td><button class="btn export" data-id="${c.id}">Exportar TXT</button></td>`;
      couponsTableBody.appendChild(tr);
    });
  }

  refreshClients();
  refreshProducts();
  refreshCart();
  refreshCouponsTable();

  addProdSelect.addEventListener('change', ()=>{
    const v = addProdSelect.value;
    if(!v) return;
    const p = products.find(x=>x.id===v);
    if(!p) return;
    const existing = cart.find(c=>c.id===v);
    if(existing) existing.qty += 1; else cart.unshift({id:p.id, name:p.name, price:p.price, qty:1});
    refreshCart();
    addProdSelect.value='';
  });

  cartTableBody.addEventListener('input', e=>{
    const input = e.target.closest('input');
    if(!input) return;
    const cid = input.dataset.id;
    const val = parseInt(input.value || 0);
    if(val<=0) cart = cart.filter(x=>x.id!==cid); else cart = cart.map(x=> x.id===cid ? {...x, qty: val} : x);
    refreshCart();
  });

  cartTableBody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const cid = btn.dataset.id;
    if(btn.classList.contains('remove')){
      cart = cart.filter(x=>x.id!==cid);
      refreshCart();
    }
  });

  main.querySelector('#cup-create').addEventListener('click', ()=>{
    if(cart.length===0) return alert('Carrinho vazio');
    const client = clients.find(c=>c.id===clientSelect.value);
    const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const discount = parseFloat((discountInput.value || '0').toString().replace(/\./g,'').replace(',','.')) || 0;
    const final = total - discount;
    const coupon = { id: Date.now().toString(), date: new Date().toISOString(), client: client? client.name : 'Consumidor', items: cart, discount, total, final };
    coupons.unshift(coupon);
    save(KEY_COUPONS, coupons);
    cart = [];
    discountInput.value='0,00';
    refreshCart();
    refreshCouponsTable();
    alert('Cupom criado');
  });

  couponsTableBody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const cid = btn.dataset.id;
    if(btn.classList.contains('export')){
      const c = coupons.find(x=>x.id===cid);
      if(!c) return;
      const lines = [];
      lines.push('--- CUPOM ---');
      lines.push('ID: ' + c.id);
      lines.push('DATA: ' + new Date(c.date).toLocaleString());
      lines.push('CLIENTE: ' + c.client);
      lines.push('');
      c.items.forEach(i=> lines.push(`${i.name} x${i.qty}  ${fmtMoneyBR(i.price)}  = ${fmtMoneyBR(i.price*i.qty)}`));
      lines.push('');
      lines.push('TOTAL: ' + fmtMoneyBR(c.total));
      lines.push('DESCONTO: ' + fmtMoneyBR(c.discount));
      lines.push('FINAL: ' + fmtMoneyBR(c.final));
      const blob = new Blob([lines.join('\n')], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cupom_${c.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}

// Router
function go(page){
  if(page==='products') renderProducts();
  else if(page==='clients') renderClients();
  else if(page==='movements') renderMovements();
  else if(page==='coupons') renderCoupons();
  else renderProducts();
}
document.addEventListener('click', e=>{
  const li = e.target.closest('.menu li');
  if(!li) return;
  go(li.dataset.page);
});
window.addEventListener('DOMContentLoaded', ()=> go('products'));
