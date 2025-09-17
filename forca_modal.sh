<script>
// ========== CORRIGE BOTÕES DE COMPRA ==========
document.addEventListener("DOMContentLoaded", () => {
  // pega todos os botões que têm classe .btn e texto "Comprar"
  document.querySelectorAll("a.btn, button.btn").forEach(btn => {
    if (btn.textContent.trim().toLowerCase() === "comprar") {
      btn.addEventListener("click", e => {
        e.preventDefault();

        // pega dados do produto (ajuste se os nomes mudarem)
        const card = btn.closest(".product, .item, .produto, div");
        const nome = card?.querySelector(".name, h2, h3")?.innerText || "Produto";
        const preco = card?.querySelector(".price, .preco")?.innerText || "0,00";
        const img = card?.querySelector("img")?.getAttribute("src") || "sem-imagem.png";

        // redireciona para o modal com parâmetros
        window.location.href = `modal.html?nome=${encodeURIComponent(nome)}&preco=${encodeURIComponent(preco)}&img=${encodeURIComponent(img)}`;
      });
    }
  });

  // ========== CORRIGE FORMULÁRIO DE BUSCA ==========
  const formBusca = document.querySelector("form[action*='melumaquiagem.com.br']");
  if (formBusca) {
    formBusca.removeAttribute("action"); // tira a URL antiga
    formBusca.addEventListener("submit", e => {
      e.preventDefault();
      const termo = formBusca.querySelector("input[type='text'], input[name='q']")?.value || "";
      window.location.href = "buscar.html?q=" + encodeURIComponent(termo);
    });
  }
});
</script>

