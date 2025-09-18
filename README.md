# Log Analyzer Dashboard

Um sistema web moderno e interativo para análise e visualização de arquivos de log, desenvolvido com Flask, Chart.js e TailwindCSS.

## 🚀 Funcionalidades

### ✨ Funcionalidades Básicas
- **Upload de Arquivos**: Interface drag-and-drop para upload de arquivos `.log` e `.txt`
- **Análise Inteligente**: Processamento automático de logs com extração de timestamps e níveis
- **Visualizações Interativas**: Gráficos de pizza e linha para análise visual dos dados
- **Estatísticas Detalhadas**: Contadores de erros, avisos, informações e total de linhas
- **Design Responsivo**: Interface moderna e adaptável para desktop e mobile
- **Tema Escuro**: Layout tecnológico com efeitos visuais atraentes

### 🔍 Funcionalidades Avançadas
- **Classificação Automática de Problemas**: Detecção inteligente de problemas comuns em logs
- **Sugestões de Solução**: Recomendações automáticas baseadas em padrões detectados
- **Sistema de Notificações**: Feedback visual para ações do usuário

## 📊 Recursos de Análise

### Tipos de Log Suportados
- **ERROR/FATAL/CRITICAL**: Erros críticos do sistema
- **WARNING/WARN**: Avisos e alertas
- **INFO/INFORMATION**: Informações gerais
- **DEBUG/TRACE**: Logs de depuração

### Padrões de Timestamp Reconhecidos
- `2024-01-15 08:30:15` (ISO format)
- `15/01/2024 08:30:15` (DD/MM/YYYY)
- `2024-01-15T08:30:15` (ISO datetime)
- `Jan 15 08:30:15` (Unix format)

### Métricas Calculadas
- Total de linhas processadas
- Distribuição por nível de log
- Evolução temporal dos logs
- Tempo médio entre logs
- Estatísticas de performance

### 🔍 Problemas Detectados Automaticamente
- **Database**: Timeouts de conexão, falhas de query, problemas de pool
- **Performance**: Alto uso de memória, vazamentos, cache miss
- **Infraestrutura**: Espaço em disco, backups, operações de sistema
- **Security**: Certificados SSL, autenticação, varreduras de segurança
- **Network**: Timeouts de API, problemas de conectividade
- **Application**: Inicialização, operações de email, monitoramento
- **Uncategorized**: Logs que não se enquadram em categorias conhecidas

### 📊 Novos Recursos de Visualização
- **Tabela Completa**: Todos os logs processados em formato tabular
- **Paginação Inteligente**: Navegação por páginas (10, 25, 50, 100 logs por página)
- **Gráfico por Categoria**: Distribuição dos logs por tipo de problema
- **Gráfico por Severidade**: Classificação por nível de criticidade
- **Análise 100%**: Nenhum log é descartado - todos são exibidos
- **Performance Otimizada**: Carregamento rápido mesmo com milhares de logs

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.8+**
- **Flask 2.3.3**: Framework web
- **Pandas 2.1.1**: Processamento de dados
- **Regex**: Análise de padrões em logs

### Frontend
- **HTML5**: Estrutura semântica
- **TailwindCSS**: Framework CSS utilitário
- **Chart.js**: Biblioteca de gráficos interativos
- **JavaScript ES6+**: Lógica de frontend
- **Font Awesome**: Ícones

## 📁 Estrutura do Projeto

```
log-analyzer-dashboard/
├── backend/
│   └── app.py                 # Aplicação Flask principal
├── templates/
│   └── index.html            # Template HTML principal
├── static/
│   ├── css/                  # Estilos CSS personalizados
│   ├── js/
│   │   └── dashboard.js      # JavaScript do dashboard
│   └── images/               # Imagens e assets
├── sample_logs/
│   └── application.log       # Arquivo de exemplo para testes
├── requirements.txt          # Dependências Python
└── README.md                # Documentação do projeto
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos de Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd C:\Users\lucas\log-analyzer-dashboard
   ```

2. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute a aplicação**
   ```bash
   cd backend
   python app.py
   ```

4. **Acesse o dashboard**
   Abra seu navegador e acesse: `http://localhost:5000`

### Execução com Virtual Environment (Recomendado)

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual (Windows)
venv\Scripts\activate

# Ativar ambiente virtual (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar aplicação
cd backend
python app.py
```

## 📖 Como Usar

### 1. Upload de Arquivo
- Arraste e solte um arquivo `.log` ou `.txt` na área de upload
- Ou clique em "Selecionar Arquivo" para escolher um arquivo
- O sistema suporta arquivos de até 16MB

### 2. Análise Automática
- O sistema processa automaticamente o arquivo
- Extrai timestamps, níveis de log e mensagens
- Calcula estatísticas e métricas

### 3. Visualização dos Resultados
- **Cards de Estatísticas**: Total de linhas, erros, avisos e informações
- **Gráfico de Pizza**: Distribuição proporcional por nível de log
- **Gráfico de Linha**: Evolução temporal dos logs
- **Design Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🎨 Características do Design

### Tema Visual
- **Paleta Escura**: Fundo escuro com acentos coloridos
- **Efeitos Luminosos**: Bordas e sombras com glow effects
- **Cores Temáticas**:
  - 🔴 Vermelho: Erros (ERROR)
  - 🟡 Amarelo: Avisos (WARNING)
  - 🔵 Azul: Informações (INFO)
  - 🟢 Verde: Debug (DEBUG)

### Responsividade
- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Adaptação automática para telas médias
- **Mobile**: Interface otimizada para dispositivos móveis

### Interatividade
- **Drag & Drop**: Upload intuitivo de arquivos
- **Animações**: Transições suaves e efeitos visuais
- **Feedback Visual**: Indicadores de progresso e status

## 📝 Exemplo de Arquivo de Log

O projeto inclui um arquivo de exemplo (`sample_logs/application.log`) com logs simulados para testes:

```
2024-01-15 08:30:15 INFO Application started successfully
2024-01-15 08:31:22 INFO User login attempt: user@example.com
2024-01-15 08:32:15 WARNING High memory usage detected: 85%
2024-01-15 08:33:12 ERROR Database connection timeout
...
```

## 🔧 Configurações Avançadas

### Personalização de Padrões
Você pode modificar os padrões de regex no arquivo `backend/app.py` para suportar formatos específicos de log:

```python
# Adicionar novos padrões de timestamp
timestamp_patterns = [
    r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',
    # Adicione seus padrões aqui
]

# Adicionar novos níveis de log
level_patterns = [
    r'\b(ERROR|FATAL|CRITICAL)\b',
    # Adicione seus níveis aqui
]
```

### Limites de Upload
Para alterar o tamanho máximo de arquivo, modifique em `app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB
```

## 🐛 Solução de Problemas

### Erro de Dependências
```bash
# Atualizar pip
python -m pip install --upgrade pip

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### Erro de Porta em Uso
```bash
# Alterar porta no app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Problemas de Encoding
O sistema usa `utf-8` com fallback para `errors='ignore'` para lidar com caracteres especiais.

## 📈 Próximas Funcionalidades

- [ ] Suporte a múltiplos formatos de log
- [ ] Filtros avançados por data e nível
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Dashboard em tempo real
- [ ] Integração com sistemas de monitoramento
- [ ] API REST para integração externa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido por um estudante de engenharia de software, focado em sistemas escaláveis e código de alta qualidade.

---

**Log Analyzer Dashboard** - Transformando dados de log em insights visuais! 📊✨
