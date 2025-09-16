const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = __dirname;
const produtosDir = path.join(rootDir, "produtos");
const checkoutDir = path.join(rootDir, "checkout");

// garante pasta checkout
if (!fs.existsSync(checkoutDir)) fs.mkdirSync(checkoutDir);

// ==================== TEMPLATE CHECKOUT ====================
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
        <div><label>Nome</label><input type="text" id="nome"></div>
        <div><label>Email</label><input type="email" id="email"></div>
        <div><label>Telefone</label><input type="tel" id="tel"></div>
        <div><label>CPF</label><input type="text" id="cpf"></div>
      </div>

      <button class="btn" onclick="nextStep()">Próximo</button>
    </div>
  </div>

  <script>
    // Puxa carrinho
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
      alert("Aqui vai para a próxima etapa (endereço e depois pagamento).");
    }
  </script>
</body>
</html>`;

// ==================== GERA CHECKOUT PARA CADA PRODUTO ====================
fs.readdirSync(produtosDir).forEach(file => {
  if (!file.endsWith(".html")) return;

  const filePath = path.join(produtosDir, file);
  let html = fs.readFileSync(filePath, "utf8");

  // pega dados
  const nome = (html.match(/<h1.*?>(.*?)<\/h1>/i) || [,"Produto"])[1].trim();
  const preco = (html.match(/R\$ ?\d+,\d{2}/) || ["R$ 0,00"])[0];
  const img = (html.match(/<img[^>]+src="([^"]+)"/i) || [,"produto.png"])[1].split("/").pop();

  // cria checkout
  const base = path.basename(file, ".html");
  const checkoutFile = path.join(checkoutDir, `${base}-checkout.html`);
  let checkoutHtml = checkoutTemplate.replace("</script>", `
/* Produto injetado */
localStorage.setItem("carrinho", JSON.stringify([{ nome: "${nome}", preco: "${preco}", img: "${img}"}]));
</script>`);
  fs.writeFileSync(checkoutFile, checkoutHtml, "utf8");
  console.log("✔ Checkout atualizado:", checkoutFile);

  // coloca botão único
  const novoBotao = `<a class="btn" href="../checkout/${base}-checkout.html">Comprar</a>`;
  html = html.replace(/<a[^>]*>.*?Comprar.*?<\/a>/i, novoBotao);
  fs.writeFileSync(filePath, html, "utf8");
});

// ==================== CORRIGE INDEX ====================
const indexPath = path.join(rootDir, "index.html");
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, "utf8");

  fs.readdirSync(produtosDir).forEach(file => {
    if (!file.endsWith(".html")) return;
    const base = path.basename(file, ".html");
    const regex = new RegExp(`<a[^>]+href=["'][^"']*${base}[^"']*["'][^>]*>.*?Comprar.*?<\\/a>`, "i");
    const novo = `<a class="btn" href="checkout/${base}-checkout.html">Comprar</a>`;
    indexHtml = indexHtml.replace(regex, novo);
  });

  // adiciona modal global de carrinho + pesquisa (se não existir)
  if (!indexHtml.includes("id=\"cartModal\"")) {
    indexHtml += `
<!-- Modal Carrinho -->
<div id="cartModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);align-items:center;justify-content:center;">
  <div style="background:#fff;padding:20px;border-radius:12px;max-width:500px;width:90%">
    <h2>Produto adicionado!</h2>
    <button onclick="location.href='checkout/checkout.html'">Ir para Checkout</button>
    <button onclick="document.getElementById('cartModal').style.display='none'">Continuar comprando</button>
  </div>
</div>

<script>
function abrirCarrinho(){
  document.getElementById("cartModal").style.display="flex";
}
</script>`;
  }

  fs.writeFileSync(indexPath, indexHtml, "utf8");
  console.log("✔ Index atualizado");
}

// ==================== PUSH PRO GITHUB ====================
try {
  execSync("git add . && git commit -m 'Atualiza loja com checkout/carrinho' && git push origin main --force", {stdio:"inherit"});
  console.log("✔ Alterações enviadas pro GitHub com force");
} catch (err) {
  console.error("⚠ Erro ao enviar pro GitHub:", err.message);
}
