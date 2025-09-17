#!/bin/bash
# Caminho da pasta com o site
PASTA="melu_site"

# Corrige todos os arquivos HTML da pasta (recursivamente)
find "$PASTA" -type f -name "*.html" | while read -r FILE; do
  echo "🔧 Corrigindo $FILE"

  # Corrige botões de comprar -> modal.html
  sed -i "s|<a class=\"btn\"[^>]*onclick=\"adicionarCarrinho('\([^']*\)','\([^']*\)','\([^']*\)')\"[^>]*>Comprar</a>|<a class=\"btn\" href=\"modal.html?nome=\1&preco=\2&img=\3\">Comprar</a>|g" "$FILE"

  # Remove buscas externas
  sed -i "s|https://www.melumaquiagem.com.br/||g" "$FILE"
  sed -i "s|http://www.melumaquiagem.com.br/||g" "$FILE"

  # Adiciona campo de pesquisa (só no index)
  if [[ "$FILE" == *"index.html" ]]; then
    if ! grep -q "id=\"searchInput\"" "$FILE"; then
      sed -i '/<header>/a \
<div style="text-align:center;margin:20px;">\n\
  <input type="text" id="searchInput" placeholder="🔍 Buscar produtos..." onkeyup="pesquisarProduto()" style="padding:10px;width:80%;max-width:400px;border:1px solid #ddd;border-radius:8px;">\n\
</div>' "$FILE"
    fi
  fi

  # Insere script de busca local antes de </body>
  if ! grep -q "function pesquisarProduto" "$FILE"; then
    sed -i '/<\/body>/i \
<script>\n\
function pesquisarProduto(){\n\
  const termo = document.getElementById("searchInput").value.toLowerCase();\n\
  document.querySelectorAll(".produto").forEach(el=>{\n\
    const nome = el.innerText.toLowerCase();\n\
    el.style.display = nome.includes(termo) ? "" : "none";\n\
  });\n\
}\n\
</script>' "$FILE"
  fi
done

echo "✔ Botões corrigidos + Pesquisa adicionada no index.html"

# Envia alterações pro GitHub com --force
cd "$PASTA" || exit
git add .
git commit -m "Corrige botões de compra para modal.html e adiciona busca local no index"
git push origin main --force

echo "🚀 Alterações enviadas pro GitHub com sucesso!"
