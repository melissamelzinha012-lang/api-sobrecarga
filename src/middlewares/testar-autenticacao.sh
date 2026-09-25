#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
COOKIE_JAR="/tmp/ponte-auth-cookies.txt"
RESPOSTA="/tmp/ponte-auth-resposta.txt"

NOME="Usuário de Teste"
EMAIL="teste.$(date +%s )@email.com"
SENHA="SenhaSegura123"

rm -f "$COOKIE_JAR"
rm -f "$RESPOSTA"

mostrar_resultado() {
  local nome="$1"
  local status="$2"

  echo
  echo "========================================"
  echo "$nome"
  echo "Status HTTP: $status"
  echo "Resposta:"
  cat "$RESPOSTA"
  echo
}

fazer_requisicao() {
  local metodo="$1"
  local rota="$2"
  local corpo="$3"

  curl \
    --silent \
    --show-error \
    --request "$metodo" \
    --url "$BASE_URL$rota" \
    --header "Content-Type: application/json" \
    --cookie "$COOKIE_JAR" \
    --cookie-jar "$COOKIE_JAR" \
    --data "$corpo" \
    --output "$RESPOSTA" \
    --write-out "%{http_code}"
}

echo "Iniciando testes de autenticação..."
echo "URL da aplicação: $BASE_URL"
echo "E-mail usado no teste: $EMAIL"

# --------------------------------------------------
# TESTE 1 — Cadastro
# --------------------------------------------------

STATUS=$(fazer_requisicao "POST" "/cadastro" "{
  \"nome\": \"$NOME\",
  \"email\": \"$EMAIL\",
  \"senha\": \"$SENHA\",
  \"confirmarSenha\": \"$SENHA\"
}" )

mostrar_resultado "TESTE 1 — Cadastro de novo usuário" "$STATUS"

if [ "$STATUS" != "201" ]; then
  echo "ERRO: o cadastro deveria retornar HTTP 201."
  exit 1
fi

# --------------------------------------------------
# TESTE 2 — Cadastro duplicado
# --------------------------------------------------

STATUS=$(fazer_requisicao "POST" "/cadastro" "{
  \"nome\": \"$NOME\",
  \"email\": \"$EMAIL\",
  \"senha\": \"$SENHA\",
  \"confirmarSenha\": \"$SENHA\"
}")

mostrar_resultado "TESTE 2 — Cadastro do mesmo usuário novamente" "$STATUS"

if [ "$STATUS" != "400" ]; then
  echo "ERRO: cadastro duplicado deveria retornar HTTP 400."
  exit 1
fi

# --------------------------------------------------
# TESTE 3 — Login com senha errada
# --------------------------------------------------

STATUS=$(fazer_requisicao "POST" "/login" "{
  \"email\": \"$EMAIL\",
  \"senha\": \"SenhaErrada999\"
}")

mostrar_resultado "TESTE 3 — Login com senha errada" "$STATUS"

if [ "$STATUS" != "401" ]; then
  echo "ERRO: senha incorreta deveria retornar HTTP 401."
  exit 1
fi

# --------------------------------------------------
# TESTE 4 — Login correto
# --------------------------------------------------

STATUS=$(fazer_requisicao "POST" "/login" "{
  \"email\": \"$EMAIL\",
  \"senha\": \"$SENHA\"
}")

mostrar_resultado "TESTE 4 — Login com dados corretos" "$STATUS"

if [ "$STATUS" != "200" ]; then
  echo "ERRO: login correto deveria retornar HTTP 200."
  exit 1
fi

# --------------------------------------------------
# TESTE 5 — Acesso à rota protegida
# --------------------------------------------------

STATUS=$(curl \
  --silent \
  --show-error \
  --request GET \
  --url "$BASE_URL/perfil" \
  --cookie "$COOKIE_JAR" \
  --output "$RESPOSTA" \
  --write-out "%{http_code}" )

mostrar_resultado "TESTE 5 — Acesso à rota protegida com login" "$STATUS"

if [ "$STATUS" != "200" ]; then
  echo "ERRO: usuário autenticado deveria acessar a rota protegida."
  exit 1
fi

# --------------------------------------------------
# TESTE 6 — Logout
# --------------------------------------------------

STATUS=$(fazer_requisicao "POST" "/logout" "{}")

mostrar_resultado "TESTE 6 — Logout" "$STATUS"

if [ "$STATUS" != "200" ]; then
  echo "ERRO: logout deveria retornar HTTP 200."
  exit 1
fi

# --------------------------------------------------
# TESTE 7 — Acesso protegido depois do logout
# --------------------------------------------------

STATUS=$(curl \
  --silent \
  --show-error \
  --request GET \
  --url "$BASE_URL/perfil" \
  --cookie "$COOKIE_JAR" \
  --output "$RESPOSTA" \
  --write-out "%{http_code}" )

mostrar_resultado "TESTE 7 — Acesso protegido depois do logout" "$STATUS"

if [ "$STATUS" != "401" ]; then
  echo "ERRO: usuário deslogado deveria receber HTTP 401."
  exit 1
fi

echo
echo "========================================"
echo "TODOS OS TESTES PASSARAM COM SUCESSO."
echo "========================================"
