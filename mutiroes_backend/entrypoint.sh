#!/bin/bash
set -e

echo "🚀 Iniciando backend..."

# Esperar pelo PostgreSQL
echo "⏳ Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "✅ PostgreSQL está pronto!"

# Executar migrações
echo "🔄 Executando migrações..."
python manage.py migrate --noinput

# Coletar arquivos estáticos
echo "📦 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput || true

# Popular dados de exemplo (apenas se não existirem)
echo "📊 Populando dados de exemplo..."
python populate_data.py || echo "⚠️  Dados já existem ou erro ao popular"

echo "✅ Inicialização concluída!"

# Iniciar servidor
exec "$@"
