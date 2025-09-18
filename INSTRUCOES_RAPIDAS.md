# 🚀 Instruções Rápidas - Log Analyzer Dashboard

## ⚡ Inicialização Rápida

### Opção 1: Script de Inicialização (Recomendado)
```bash
python run.py
```

### Opção 2: Execução Manual
```bash
cd backend
python app.py
```

## 🌐 Acesso
- **URL Local**: http://localhost:5000
- **URL Rede**: http://192.168.15.10:5000 (acessível de outros dispositivos)

## 📁 Arquivos de Teste
- Use o arquivo `sample_logs/application.log` para testar a aplicação
- Contém 100+ linhas de log com diferentes níveis (INFO, WARNING, ERROR)

## 🎯 Como Usar
1. **Acesse** http://localhost:5000
2. **Arraste** o arquivo `sample_logs/application.log` para a área de upload
3. **Aguarde** a análise automática
4. **Visualize** os gráficos e estatísticas
5. **Navegue** pela tabela de logs usando a paginação

## 🛠️ Funcionalidades Testadas
- ✅ Upload de arquivos .log e .txt
- ✅ Análise de timestamps e níveis de log
- ✅ Gráfico de pizza (distribuição por nível)
- ✅ Gráfico de linha (evolução temporal)
- ✅ Gráfico por categoria (Database, Performance, Security, etc.)
- ✅ Gráfico por severidade (Critical, High, Medium, Low)
- ✅ Tabela completa com TODOS os logs processados
- ✅ Paginação inteligente (10, 25, 50, 100 logs por página)
- ✅ Navegação por páginas com controles intuitivos
- ✅ Cards de estatísticas
- ✅ Classificação automática de problemas
- ✅ Sugestões de solução
- ✅ Categoria "Uncategorized" para logs não classificados
- ✅ Design responsivo
- ✅ Tema escuro moderno

## 🔧 Solução de Problemas
- **Erro de porta**: Altere a porta no arquivo `backend/app.py`
- **Dependências**: Execute `pip install flask werkzeug`
- **Arquivo não encontrado**: Verifique se está na pasta correta

## 📊 Resultados Esperados
Com o arquivo de exemplo, você deve ver:
- **Total de Linhas**: ~100
- **Erros**: ~15
- **Avisos**: ~20
- **Informações**: ~65
- **Categorias Detectadas**: Database, Performance, Security, Application, Infraestrutura, Network
- **Logs Não Categorizados**: Alguns logs em "Uncategorized"
- **Tabela Completa**: Todos os 100+ logs exibidos com classificação

## 📄 Como Usar a Paginação

### **Controles de Paginação:**
- **Logs por página**: Selecione 10, 25, 50 ou 100 logs por página
- **Navegação**: Use os botões ← → para navegar entre páginas
- **Primeira/Última**: Botões ⏮ ⏭ para ir direto ao início/fim
- **Página específica**: Digite o número da página desejada

### **Informações Exibidas:**
- **Contador**: "Mostrando 1-25 de 100 logs"
- **Página atual**: "Página 1 de 4"
- **Botões inteligentes**: Desabilitados quando não aplicáveis

---
**Desenvolvido com ❤️ - Sistema completo e funcional!**
