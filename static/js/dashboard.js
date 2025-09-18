/**
 * Log Analyzer Dashboard - Frontend JavaScript
 * Sistema de análise e visualização de logs
 */

class LogAnalyzerDashboard {
    constructor() {
        this.pieChart = null;
        this.lineChart = null;
        this.categoryChart = null;
        this.severityChart = null;
        this.allLogs = [];
        this.currentPage = 1;
        this.logsPerPage = 25;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Upload area events
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const selectFileBtn = document.getElementById('select-file-btn');

        // Click to select file
        selectFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Pagination event listeners
        this.initializePaginationListeners();
    }

    initializePaginationListeners() {
        // Logs per page selector
        const logsPerPageSelect = document.getElementById('logs-per-page');
        if (logsPerPageSelect) {
            logsPerPageSelect.addEventListener('change', (e) => {
                this.logsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.updateLogsTable();
            });
        }

        // Pagination buttons
        const firstPageBtn = document.getElementById('first-page');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const lastPageBtn = document.getElementById('last-page');
        const currentPageInput = document.getElementById('current-page-input');

        if (firstPageBtn) {
            firstPageBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.updateLogsTable();
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateLogsTable();
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.allLogs.length / this.logsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updateLogsTable();
                }
            });
        }

        if (lastPageBtn) {
            lastPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.allLogs.length / this.logsPerPage);
                this.currentPage = totalPages;
                this.updateLogsTable();
            });
        }

        if (currentPageInput) {
            currentPageInput.addEventListener('change', (e) => {
                const page = parseInt(e.target.value);
                const totalPages = Math.ceil(this.allLogs.length / this.logsPerPage);
                if (page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.updateLogsTable();
                } else {
                    e.target.value = this.currentPage;
                }
            });
        }
    }

    handleFile(file) {
        // Validate file type
        const allowedTypes = ['text/plain', 'application/octet-stream'];
        const allowedExtensions = ['.log', '.txt'];
        
        const isValidType = allowedTypes.includes(file.type) || 
                           allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!isValidType) {
            this.showError('Tipo de arquivo não permitido. Use apenas arquivos .log ou .txt');
            return;
        }

        // Validate file size (16MB max)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            this.showError('Arquivo muito grande. Tamanho máximo permitido: 16MB');
            return;
        }

        // Show file info
        this.showFileInfo(file);

        // Upload and analyze
        this.uploadAndAnalyze(file);
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.classList.remove('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadAndAnalyze(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Show progress
        this.showProgress();

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result);
                this.hideError();
            } else {
                this.showError(result.error || 'Erro desconhecido na análise');
            }
        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        } finally {
            this.hideProgress();
        }
    }

    showProgress() {
        const uploadContent = document.getElementById('upload-content');
        const uploadProgress = document.getElementById('upload-progress');

        uploadContent.classList.add('hidden');
        uploadProgress.classList.remove('hidden');
    }

    hideProgress() {
        const uploadContent = document.getElementById('upload-content');
        const uploadProgress = document.getElementById('upload-progress');

        uploadContent.classList.remove('hidden');
        uploadProgress.classList.add('hidden');
    }

    displayResults(data) {
        // Update statistics cards
        this.updateStatisticsCards(data.statistics);

        // Create charts
        this.createPieChart(data.charts.pie_chart);
        this.createLineChart(data.charts.line_chart);
        this.createCategoryChart(data.charts.category_chart);
        this.createSeverityChart(data.charts.severity_chart);

        // Store all logs and display with pagination
        this.allLogs = data.all_logs || [];
        this.currentPage = 1;
        this.updateLogsTable();

        // Display problems and suggestions
        this.displayProblems(data.all_logs || []);
        this.displaySuggestions(data.suggestions || []);

        // Store data for filtering and export
        this.currentData = data;

        // Show results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    updateStatisticsCards(stats) {
        document.getElementById('total-lines').textContent = stats.total_lines.toLocaleString();
        document.getElementById('error-count').textContent = stats.error_count.toLocaleString();
        document.getElementById('warning-count').textContent = stats.warning_count.toLocaleString();
        document.getElementById('info-count').textContent = stats.info_count.toLocaleString();
    }

    createPieChart(data) {
        const ctx = document.getElementById('pie-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.pieChart) {
            this.pieChart.destroy();
        }

        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderColor: '#1e293b',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    createLineChart(data) {
        const ctx = document.getElementById('line-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.lineChart) {
            this.lineChart.destroy();
        }

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Logs por Hora',
                    data: data.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#334155',
                        borderWidth: 1,
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 45
                        }
                    },
                    y: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth' });
    }

    hideError() {
        const errorMessage = document.getElementById('error-message');
        errorMessage.classList.add('hidden');
    }

    displayProblems(logs) {
        const problemsList = document.getElementById('problems-list');
        
        // Filtrar apenas problemas de alta severidade para exibição
        const highSeverityLogs = logs.filter(log => 
            log.severity === 'critical' || log.severity === 'high'
        );
        
        if (highSeverityLogs.length === 0) {
            problemsList.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-check-circle text-4xl text-accent-green mb-4"></i>
                    <p>Nenhum problema crítico detectado!</p>
                    <p class="text-sm mt-2">Todos os ${logs.length} logs foram processados com sucesso.</p>
                </div>
            `;
            return;
        }

        problemsList.innerHTML = highSeverityLogs.map(log => {
            const severityIcons = {
                'critical': 'fas fa-exclamation-triangle',
                'high': 'fas fa-exclamation-circle',
                'medium': 'fas fa-exclamation',
                'low': 'fas fa-info-circle'
            };

            return `
                <div class="bg-gray-800 rounded-lg p-4 border-l-4 border-${this.getSeverityColor(log.severity)}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <i class="${severityIcons[log.severity]} text-${this.getSeverityColor(log.severity)} mr-2"></i>
                                <span class="text-sm font-medium text-${this.getSeverityColor(log.severity)} uppercase">
                                    ${log.severity}
                                </span>
                                <span class="ml-2 text-xs text-gray-400">${log.category}</span>
                            </div>
                            <p class="text-sm text-gray-300 mb-2">${log.message}</p>
                            <p class="text-xs text-gray-500">
                                <i class="fas fa-clock mr-1"></i>
                                ${log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : 'Timestamp não disponível'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    displaySuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestions-list');
        
        if (suggestions.length === 0) {
            suggestionsList.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-thumbs-up text-4xl text-accent-green mb-4"></i>
                    <p>Sistema funcionando perfeitamente!</p>
                </div>
            `;
            return;
        }

        suggestionsList.innerHTML = suggestions.map(suggestion => {
            const priorityColors = {
                'high': 'border-red-500',
                'medium': 'border-yellow-500',
                'low': 'border-blue-500'
            };

            return `
                <div class="bg-gray-800 rounded-lg p-4 border-l-4 ${priorityColors[suggestion.priority]}">
                    <h4 class="font-medium text-white mb-2">${suggestion.title}</h4>
                    <p class="text-sm text-gray-300 mb-3">${suggestion.description}</p>
                    <div class="space-y-1">
                        ${suggestion.actions.map(action => `
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-accent-blue text-xs mt-1 mr-2"></i>
                                <span class="text-xs text-gray-400">${action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    getSeverityColor(severity) {
        const colors = {
            'critical': 'red',
            'high': 'orange',
            'medium': 'yellow',
            'low': 'blue'
        };
        return colors[severity] || 'gray';
    }

    createCategoryChart(data) {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderColor: '#1e293b',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 10
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    createSeverityChart(data) {
        const ctx = document.getElementById('severity-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.severityChart) {
            this.severityChart.destroy();
        }

        this.severityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderColor: '#1e293b',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 10
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    updateLogsTable() {
        const tableBody = document.getElementById('logs-table-body');
        const logsInfo = document.getElementById('logs-info');
        const totalPages = document.getElementById('total-pages');
        const currentPageInput = document.getElementById('current-page-input');
        
        if (this.allLogs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-400">
                        <i class="fas fa-info-circle text-2xl mb-2"></i>
                        <p>Nenhum log encontrado</p>
                    </td>
                </tr>
            `;
            logsInfo.textContent = 'Nenhum log encontrado';
            totalPages.textContent = '1';
            currentPageInput.value = '1';
            this.updatePaginationButtons();
            return;
        }

        // Calculate pagination
        const totalPagesCount = Math.ceil(this.allLogs.length / this.logsPerPage);
        const startIndex = (this.currentPage - 1) * this.logsPerPage;
        const endIndex = Math.min(startIndex + this.logsPerPage, this.allLogs.length);
        const currentPageLogs = this.allLogs.slice(startIndex, endIndex);

        // Update info display
        logsInfo.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${this.allLogs.length} logs`;
        totalPages.textContent = totalPagesCount;
        currentPageInput.value = this.currentPage;

        // Update table content
        tableBody.innerHTML = currentPageLogs.map(log => {
            const timestamp = log.timestamp ? 
                new Date(log.timestamp).toLocaleString('pt-BR') : 
                'N/A';
            
            const levelColor = this.getLevelColor(log.level);
            const severityColor = this.getSeverityColor(log.severity);
            const categoryColor = this.getCategoryColor(log.category);

            return `
                <tr class="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                    <td class="py-3 px-4 text-gray-300">${timestamp}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium ${levelColor}">
                            ${log.level}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium bg-${severityColor}-900 text-${severityColor}-300">
                            ${log.severity.toUpperCase()}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium ${categoryColor}">
                            ${log.category}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-gray-300 text-sm">${log.message}</td>
                </tr>
            `;
        }).join('');

        // Update pagination buttons
        this.updatePaginationButtons();
    }

    updatePaginationButtons() {
        const totalPages = Math.ceil(this.allLogs.length / this.logsPerPage);
        const firstPageBtn = document.getElementById('first-page');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const lastPageBtn = document.getElementById('last-page');

        // Disable/enable buttons based on current page
        if (firstPageBtn) {
            firstPageBtn.disabled = this.currentPage === 1;
        }
        if (prevPageBtn) {
            prevPageBtn.disabled = this.currentPage === 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }
        if (lastPageBtn) {
            lastPageBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }
    }

    getLevelColor(level) {
        const colors = {
            'ERROR': 'bg-red-900 text-red-300',
            'WARNING': 'bg-yellow-900 text-yellow-300',
            'INFO': 'bg-blue-900 text-blue-300',
            'DEBUG': 'bg-green-900 text-green-300',
            'UNKNOWN': 'bg-gray-900 text-gray-300'
        };
        return colors[level] || colors['UNKNOWN'];
    }

    getCategoryColor(category) {
        const colors = {
            'Database': 'bg-red-900 text-red-300',
            'Performance': 'bg-orange-900 text-orange-300',
            'Infraestrutura': 'bg-purple-900 text-purple-300',
            'Security': 'bg-yellow-900 text-yellow-300',
            'Network': 'bg-cyan-900 text-cyan-300',
            'Application': 'bg-green-900 text-green-300',
            'Uncategorized': 'bg-gray-900 text-gray-300'
        };
        return colors[category] || colors['Uncategorized'];
    }


    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LogAnalyzerDashboard();
});

// Add some utility functions
window.LogAnalyzerUtils = {
    // Format timestamp for display
    formatTimestamp: (timestamp) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    },

    // Format duration in seconds to human readable
    formatDuration: (seconds) => {
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else if (seconds < 3600) {
            return `${(seconds / 60).toFixed(1)}min`;
        } else {
            return `${(seconds / 3600).toFixed(1)}h`;
        }
    },

    // Get log level color
    getLogLevelColor: (level) => {
        const colors = {
            'ERROR': '#ef4444',
            'WARNING': '#f59e0b',
            'INFO': '#3b82f6',
            'DEBUG': '#10b981',
            'UNKNOWN': '#6b7280'
        };
        return colors[level] || colors['UNKNOWN'];
    }
};
