#!/usr/bin/env python3
"""
Log Analyzer Dashboard - Script de Inicialização
Execute este arquivo para iniciar o servidor Flask
"""

import os
import sys

# Adicionar o diretório backend ao path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Importar e executar a aplicação
from app import app

if __name__ == '__main__':
    print("🚀 Iniciando Log Analyzer Dashboard...")
    print("📊 Acesse: http://localhost:5000")
    print("🛑 Pressione Ctrl+C para parar o servidor")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
