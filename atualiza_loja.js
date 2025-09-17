const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = __dirname;
const produtosDir = path.join(rootDir, "produtos");
const checkoutDir = path.join(rootDir, "checkout");

// garante pasta checkout
if (!fs.existsSync(checkoutDir)) fs.mkdirSync(checkoutDir);

/* ===============================
   TEMPLATE DO CHECKOUT
================================= */
const checkoutTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Checkout</title>
  <style>
    :root {
      --bg:#f7f7fa;
      --card:#fff;
      --accent:#ff4d87;
      --accent-dark:#e04378;
      --muted:#666;
      --shadow:0 6px 24px rgba(0,0,0,0.08);
      --radius:14px;
      font-family:"Inter","Segoe UI",Arial,sans-serif;
    }
    body {margin:0;background:var(--bg);}
    .wrap{max-width:960px;margin:40px auto;padding:0 16px;}
    header{margin-bottom:20px}
    header a{text-decoration:none;font-weight:bold;font-size:18px;color:var(--accent);}
    .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px;}
    .steps{display:flex;gap:10px;margin-bottom:20px;}
    .step{flex:1;text-align:center;padding:12px;border-radius:10px;background:#f2f2f2;color:#777;font-weight:600;}
    .step.active{background:var(--accent);color:#fff;}
    h1{font-size:22px;margin:0 0 14px;}
    .product-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
    .product-row img{width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #ddd;}
    .price{font-weight:700;font-size:16px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px;}
    label{font-size:13px;color:#333;font-weight:600;display:block;margin-bottom:6px;}
    input{width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;font-size:15px;box-sizing:border-box;}
    .btn{margin-top:20px;background:var(--accent);color:#fff;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;transition:0.2s;}
    .btn:hover{background:var(--accent-dark);}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a href="index.html">← Voltar para Loja</a>
    </header>

    <div class="card">
      <div class="steps">
        <div class="step active">1. Dados</div>
        <div class="step">2. Endereço</div>
        <div class="step">3. Pagamento</div>
      </div>

      <h1>Resumo do Pedido</h1>
      <div id="resumo"></div>

      <h1>Seus Dados</h1>
      <div class="grid">
        <div>
          <label>Nome</label>
          <input type="text" id="nome">
        </div>
        <div>
          <label>Email</label>
          <input type="email" id="email">
        </div>
        <div>
          <label>Telefone</label>
          <input type="tel" id="tel">
        </div>
        <div>
          <label>CPF</label>
          <input type="text" id="cpf">
        </div>
      </div>

      <button class="btn" onclick="nextStep()">Próximo</button>
    </div>
  </div>

  <script>
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const resumo = document.getElementById("resumo");

    if(carrinho.length === 0){
      resumo.innerHTML = "<p>Carrinho vazio.</p>";
    } else {
      carrinho.forEach(prod => {
        resumo.innerHTML += \`
          <div class="product-row">
            <img src="img/\${prod.img}" alt="">
            <div>
              <div>\${prod.nome}</div>
              <div class="price">\${prod.preco}</div>
            </div>
          </div>
        \`;
      });
    }

    function nextStep(){
      alert("Aqui vai para a próxima etapa (endereço/pagamento).");
    }
  </script>
</body>
</html>`;

/* ===============================
   TEMPLATE DO CARRINHO
================================= */
const carrinhoTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Carrinho</title>
  <style>
    body{font-family:"Inter",Arial,sans-serif;margin:0;background:#f7f7fa;}
    .wrap{max-width:960px;margin:40px auto;padding:0 16px;}
    header{margin-bottom:20px}
    header a{text-decoration:none;font-weight:bold;font-size:18px;color:#ff4d87;}
    h1{margin-bottom:20px}
    .item{display:flex;align-items:center;gap:12px;background:#fff;padding:12px;margin-bottom:12px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);}
    .item img{width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #ddd;}
    .price{font-weight:700}
    .btn{background:#ff4d87;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;margin-top:14px;}
    .btn:hover{background:#e04378;}
  </style>
</head>
<body>
  <div class="wrap">
    <header><a href="index.html">← Continuar Comprando</a></header>
    <h1>Seu Carrinho</h1>
    <div id="lista"></div>
    <button class="btn" onclick="irCheckout()">Finalizar Compra</button>
  </div>
  <script>
    function render(){
      let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
      const lista = document.getElementById("lista");
      if(carrinho.length === 0){
        lista.innerHTML = "<p>Carrinho vazio.</p>";
        return;
      }
      lista.innerHTML = "";
      carrinho.forEach((prod,idx)=>{
        lista.innerHTML += \`
          <div class="item">
            <img src="img/\${prod.img}">
            <div style="flex:1">
              <div>\${prod.nome}</div>
              <div class="price">\${prod.preco}</div>
            </div>
            <button onclick="remover(\${idx})">Remover</button>
          </div>
        \`;
      });
    }
    function remover(i){
      let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
      carrinho.splice(i,1);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      render();
    }
    function irCheckout(){
      window.location.href = "checkout/checkout.html";
    }
    render();
  </script>
</body>
</html>`;

// salva carrinho.html
fs.writeFileSync(path.join(rootDir,"carrinho.html"), carrinhoTemplate,"utf8");
console.log("✔ carrinho.html gerado");

/* ===============================
   GERA CHECKOUTS DOS PRODUTOS
================================= */
fs.readdirSync(produtosDir).forEach(file=>{
  if(!file.endsWith(".html")) return;
  const filePath = path.join(produtosDir,file);
  const html = fs.readFileSync(filePath,"utf8");

  const nome = (html.match(/<h1.*?>(.*?)<\/h1>/i) || [, "Produto"])[1].trim();
  const preco = (html.match(/R\$ ?\d+,\d{2}/) || ["R$ 0,00"])[0];
  const img = (html.match(/<img[^>]+src="([^"]+)"/i) || [, "produto.png"])[1].split("/").pop();

  const base = path.basename(file,".html");
  const checkoutFile = path.join(checkoutDir,`${base}-checkout.html`);
  let checkoutHtml = checkoutTemplate.replace("</script>",`
/* Produto injetado */
localStorage.setItem("carrinho", JSON.stringify([{nome:"${nome}", preco:"${preco}", img:"${img}"}]));
</script>`);
  fs.writeFileSync(checkoutFile,checkoutHtml,"utf8");
  console.log("✔ Checkout criado:",checkoutFile);

  // coloca botões corretos no produto
  const novoBotao = `
    <a class="btn" href="../checkout/${base}-checkout.html">Comprar Agora</a>
    <button class="btn" onclick='adicionarCarrinho({nome:"${nome}", preco:"${preco}", img:"${img}"})'>Adicionar ao Carrinho</button>
  `;
  const atualizado = html.replace(/<a[^>]*>.*?Comprar.*?<\/a>/i,novoBotao);
  fs.writeFileSync(filePath,atualizado,"utf8");
});

/* ===============================
   ATUALIZA INDEX.HTML
================================= */
const indexPath = path.join(rootDir,"index.html");
if(fs.existsSync(indexPath)){
  let indexHtml = fs.readFileSync(indexPath,"utf8");

  // remove scripts duplicados antigos
  indexHtml = indexHtml.replace(/<script id="loja-script">[\\s\\S]*?<\/script>/g,"");

  // adiciona funções globais
  const lojaScript = `
<script id="loja-script">
function adicionarCarrinho(prod){
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(prod);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert("Produto adicionado ao carrinho!");
}
function pesquisarProduto(){
  const termo = document.getElementById("searchInput").value.toLowerCase();
  const itens = document.querySelectorAll(".produto");
  itens.forEach(el=>{
    const nome = el.innerText.toLowerCase();
    el.style.display = nome.includes(termo) ? "" : "none";
  });
}
</script>`;
  if(!indexHtml.includes("id=\"loja-script\"")){
    indexHtml = indexHtml.replace("</body>", lojaScript + "\n</body>");
  }

  fs.writeFileSync(indexPath,indexHtml,"utf8");
  console.log("✔ index.html atualizado");
}

/* ===============================
   PUSH GITHUB FORCE
================================= */
try{
  execSync("git add . && git commit -m 'Atualiza loja com checkout + carrinho' && git push origin main --force",{stdio:"inherit"});
  console.log("✔ Alterações enviadas pro GitHub com force");
}catch(err){
  console.error("⚠ Erro ao enviar pro GitHub:",err.message);
}
