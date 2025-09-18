"""
Log Analyzer Dashboard - Backend Flask Application
Sistema para análise e visualização de arquivos de log
"""

import os
import re
import json
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

# Configurar caminhos relativos ao diretório do projeto
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates_dir = os.path.join(project_root, 'templates')
static_dir = os.path.join(project_root, 'static')

app = Flask(__name__, template_folder=templates_dir, static_folder=static_dir)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Criar pasta de uploads se não existir
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configurações de arquivos permitidos
ALLOWED_EXTENSIONS = {'log', 'txt'}

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_log_line(line):
    """
    Extrai informações de uma linha de log
    Retorna: dict com timestamp, level, message
    """
    # Padrões comuns de timestamp
    timestamp_patterns = [
        r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',  # 2023-12-01 10:30:45
        r'(\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2})',  # 01/12/2023 10:30:45
        r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})',  # 2023-12-01T10:30:45
        r'(\w{3} \d{2} \d{2}:\d{2}:\d{2})',        # Dec 01 10:30:45
    ]
    
    # Padrões de níveis de log
    level_patterns = [
        r'\b(ERROR|FATAL|CRITICAL)\b',
        r'\b(WARN|WARNING)\b',
        r'\b(INFO|INFORMATION)\b',
        r'\b(DEBUG|TRACE)\b'
    ]
    
    parsed = {
        'timestamp': None,
        'level': 'UNKNOWN',
        'message': line.strip()
    }
    
    # Tentar extrair timestamp
    for pattern in timestamp_patterns:
        match = re.search(pattern, line)
        if match:
            try:
                timestamp_str = match.group(1)
                # Tentar diferentes formatos de data
                for fmt in ['%Y-%m-%d %H:%M:%S', '%d/%m/%Y %H:%M:%S', 
                           '%Y-%m-%dT%H:%M:%S', '%b %d %H:%M:%S']:
                    try:
                        parsed['timestamp'] = datetime.strptime(timestamp_str, fmt)
                        break
                    except ValueError:
                        continue
                break
            except:
                continue
    
    # Tentar extrair nível de log
    for pattern in level_patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            level = match.group(1).upper()
            if level in ['FATAL', 'CRITICAL']:
                parsed['level'] = 'ERROR'
            elif level in ['WARN']:
                parsed['level'] = 'WARNING'
            elif level in ['INFORMATION']:
                parsed['level'] = 'INFO'
            elif level in ['TRACE']:
                parsed['level'] = 'DEBUG'
            else:
                parsed['level'] = level
            break
    
    return parsed

def classify_all_logs(logs):
    """
    Classifica TODOS os logs, incluindo os não categorizados
    """
    all_logs = []
    suggestions = []
    
    # Padrões de problemas comuns
    problem_patterns = {
        'database_connection': {
            'patterns': [r'database.*connection.*timeout', r'db.*connection.*failed', r'sql.*connection.*error', r'database.*connection.*restored'],
            'severity': 'high',
            'category': 'Database',
            'suggestion': 'Verificar conectividade do banco de dados, pool de conexões e configurações de timeout'
        },
        'memory_usage': {
            'patterns': [r'high.*memory.*usage', r'out.*of.*memory', r'memory.*leak', r'memory.*optimization', r'memory.*usage.*reduced'],
            'severity': 'high',
            'category': 'Performance',
            'suggestion': 'Otimizar uso de memória, verificar vazamentos e considerar aumento de RAM'
        },
        'disk_space': {
            'patterns': [r'disk.*space.*full', r'no.*space.*left', r'disk.*usage.*high', r'disk.*space.*usage'],
            'severity': 'critical',
            'category': 'Infraestrutura',
            'suggestion': 'Limpar arquivos temporários, implementar rotação de logs e monitorar espaço em disco'
        },
        'ssl_certificate': {
            'patterns': [r'ssl.*certificate.*expire', r'certificate.*expir', r'tls.*cert.*invalid', r'certificate.*renewal'],
            'severity': 'medium',
            'category': 'Security',
            'suggestion': 'Renovar certificado SSL/TLS antes da expiração'
        },
        'authentication': {
            'patterns': [r'authentication.*failed', r'login.*failed', r'auth.*error', r'user.*login', r'user.*logout', r'session.*created', r'session.*destroyed'],
            'severity': 'medium',
            'category': 'Security',
            'suggestion': 'Verificar credenciais, políticas de senha e tentativas de acesso suspeitas'
        },
        'network_timeout': {
            'patterns': [r'api.*timeout', r'request.*timeout', r'connection.*timeout', r'external.*api.*call.*failed', r'service.*unavailable'],
            'severity': 'medium',
            'category': 'Network',
            'suggestion': 'Verificar latência de rede, otimizar queries e ajustar timeouts'
        },
        'cache_performance': {
            'patterns': [r'cache.*miss', r'cache.*hit.*rate.*low', r'cache.*performance', r'cache.*warming', r'cache.*optimization'],
            'severity': 'low',
            'category': 'Performance',
            'suggestion': 'Otimizar estratégia de cache, ajustar TTL e implementar cache warming'
        },
        'application_startup': {
            'patterns': [r'application.*started', r'server.*listening', r'service.*initialized', r'system.*started'],
            'severity': 'low',
            'category': 'Application',
            'suggestion': 'Monitorar tempo de inicialização e dependências'
        },
        'backup_operations': {
            'patterns': [r'backup.*started', r'backup.*completed', r'database.*backup', r'backup.*process'],
            'severity': 'low',
            'category': 'Infraestrutura',
            'suggestion': 'Verificar rotinas de backup e espaço de armazenamento'
        },
        'email_operations': {
            'patterns': [r'email.*sent', r'email.*campaign', r'email.*verification', r'email.*bounce'],
            'severity': 'low',
            'category': 'Application',
            'suggestion': 'Monitorar deliverability e configurações de SMTP'
        },
        'security_scan': {
            'patterns': [r'security.*scan', r'vulnerabilities.*found', r'security.*alert', r'suspicious.*activity'],
            'severity': 'medium',
            'category': 'Security',
            'suggestion': 'Revisar alertas de segurança e implementar medidas preventivas'
        },
        'performance_monitoring': {
            'patterns': [r'performance.*metrics', r'slow.*query', r'response.*time', r'cpu.*usage', r'optimization.*recommended'],
            'severity': 'low',
            'category': 'Performance',
            'suggestion': 'Otimizar queries e monitorar métricas de performance'
        }
    }
    
    # Processar TODOS os logs
    for log in logs:
        message = log['message'].lower()
        classified = False
        
        # Tentar classificar o log
        for problem_type, config in problem_patterns.items():
            for pattern in config['patterns']:
                if re.search(pattern, message, re.IGNORECASE):
                    all_logs.append({
                        'timestamp': log['timestamp'],
                        'level': log['level'],
                        'severity': config['severity'],
                        'category': config['category'],
                        'message': log['message'],
                        'suggestion': config['suggestion'],
                        'type': problem_type
                    })
                    classified = True
                    break
            if classified:
                break
        
        # Se não foi classificado, adicionar como "Uncategorized"
        if not classified:
            # Determinar severidade baseada no nível do log
            severity_map = {
                'ERROR': 'high',
                'WARNING': 'medium', 
                'INFO': 'low',
                'DEBUG': 'low',
                'UNKNOWN': 'low'
            }
            
            all_logs.append({
                'timestamp': log['timestamp'],
                'level': log['level'],
                'severity': severity_map.get(log['level'], 'low'),
                'category': 'Uncategorized',
                'message': log['message'],
                'suggestion': 'Revisar manualmente',
                'type': 'uncategorized'
            })
    
    # Gerar sugestões baseadas nos problemas encontrados
    if all_logs:
        # Contar problemas por severidade
        critical_count = len([l for l in all_logs if l['severity'] == 'critical'])
        high_count = len([l for l in all_logs if l['severity'] == 'high'])
        medium_count = len([l for l in all_logs if l['severity'] == 'medium'])
        low_count = len([l for l in all_logs if l['severity'] == 'low'])
        
        if critical_count > 0 or high_count > 0:
            suggestions.append({
                'priority': 'high',
                'title': 'Problemas Críticos Detectados',
                'description': f'Encontrados {critical_count} problemas críticos e {high_count} de alta prioridade',
                'actions': ['Revisar logs de erro imediatamente', 'Verificar status dos serviços', 'Implementar monitoramento proativo']
            })
        
        # Sugestões por categoria
        categories = {}
        for log in all_logs:
            if log['category'] != 'Uncategorized':
                if log['category'] not in categories:
                    categories[log['category']] = []
                categories[log['category']].append(log)
        
        for category, logs in categories.items():
            if len(logs) > 0:
                suggestions.append({
                    'priority': 'medium',
                    'title': f'Otimizações para {category}',
                    'description': f'Encontrados {len(logs)} logs relacionados a {category}',
                    'actions': list(set([log['suggestion'] for log in logs if log['suggestion'] != 'Revisar manualmente']))[:3]
                })
        
        # Sugestão para logs não categorizados
        uncategorized_count = len([l for l in all_logs if l['category'] == 'Uncategorized'])
        if uncategorized_count > 0:
            suggestions.append({
                'priority': 'low',
                'title': 'Logs Não Categorizados',
                'description': f'Encontrados {uncategorized_count} logs que precisam de revisão manual',
                'actions': ['Revisar padrões de log não reconhecidos', 'Considerar adicionar novas regras de classificação']
            })
    
    return all_logs, suggestions

def analyze_log_file(file_path):
    """
    Analisa um arquivo de log e retorna estatísticas
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            lines = file.readlines()
        
        total_lines = len(lines)
        parsed_logs = []
        level_counts = Counter()
        hourly_distribution = defaultdict(int)
        
        for line in lines:
            if line.strip():  # Ignorar linhas vazias
                parsed = parse_log_line(line)
                parsed_logs.append(parsed)
                level_counts[parsed['level']] += 1
                
                # Distribuição por hora se timestamp disponível
                if parsed['timestamp']:
                    hour_key = parsed['timestamp'].strftime('%Y-%m-%d %H:00')
                    hourly_distribution[hour_key] += 1
        
        # Calcular estatísticas
        error_count = level_counts.get('ERROR', 0)
        warning_count = level_counts.get('WARNING', 0)
        info_count = level_counts.get('INFO', 0)
        debug_count = level_counts.get('DEBUG', 0)
        unknown_count = level_counts.get('UNKNOWN', 0)
        
        # Calcular tempo médio entre logs (se timestamps disponíveis)
        timestamps = [log['timestamp'] for log in parsed_logs if log['timestamp']]
        avg_time_between_logs = None
        if len(timestamps) > 1:
            timestamps.sort()
            time_diffs = [(timestamps[i+1] - timestamps[i]).total_seconds() 
                         for i in range(len(timestamps)-1)]
            avg_time_between_logs = sum(time_diffs) / len(time_diffs)
        
        # Preparar dados para gráficos
        pie_chart_data = {
            'labels': ['ERROR', 'WARNING', 'INFO', 'DEBUG', 'UNKNOWN'],
            'data': [error_count, warning_count, info_count, debug_count, unknown_count],
            'colors': ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280']
        }
        
        # Preparar dados para gráfico de linha (evolução temporal)
        line_chart_data = {
            'labels': sorted(hourly_distribution.keys()),
            'data': [hourly_distribution[label] for label in sorted(hourly_distribution.keys())]
        }
        
        # Classificar TODOS os logs
        all_logs, suggestions = classify_all_logs(parsed_logs)
        
        # Preparar dados para gráfico de pizza por categoria
        category_counts = {}
        for log in all_logs:
            category = log['category']
            category_counts[category] = category_counts.get(category, 0) + 1
        
        category_chart_data = {
            'labels': list(category_counts.keys()),
            'data': list(category_counts.values()),
            'colors': ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280']
        }
        
        # Preparar dados para gráfico de pizza por severidade
        severity_counts = {}
        for log in all_logs:
            severity = log['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        severity_chart_data = {
            'labels': list(severity_counts.keys()),
            'data': list(severity_counts.values()),
            'colors': ['#dc2626', '#ea580c', '#d97706', '#16a34a']  # critical, high, medium, low
        }
        
        # Estatísticas de problemas
        problem_stats = {
            'total_problems': len(all_logs),
            'critical_problems': len([p for p in all_logs if p['severity'] == 'critical']),
            'high_problems': len([p for p in all_logs if p['severity'] == 'high']),
            'medium_problems': len([p for p in all_logs if p['severity'] == 'medium']),
            'low_problems': len([p for p in all_logs if p['severity'] == 'low'])
        }
        
        return {
            'success': True,
            'statistics': {
                'total_lines': total_lines,
                'error_count': error_count,
                'warning_count': warning_count,
                'info_count': info_count,
                'debug_count': debug_count,
                'unknown_count': unknown_count,
                'avg_time_between_logs': avg_time_between_logs
            },
            'charts': {
                'pie_chart': pie_chart_data,
                'line_chart': line_chart_data,
                'category_chart': category_chart_data,
                'severity_chart': severity_chart_data
            },
            'all_logs': all_logs,
            'suggestions': suggestions,
            'problem_stats': problem_stats
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/')
def index():
    """Página principal do dashboard"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint para upload e análise de arquivo de log"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Analisar o arquivo
        analysis_result = analyze_log_file(file_path)
        
        # Remover arquivo após análise
        try:
            os.remove(file_path)
        except:
            pass
        
        return jsonify(analysis_result)
    
    return jsonify({'success': False, 'error': 'Tipo de arquivo não permitido'})


@app.route('/static/<path:filename>')
def static_files(filename):
    """Servir arquivos estáticos"""
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
