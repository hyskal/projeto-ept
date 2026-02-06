/* ===========================================
   Curva Glicêmica - Lógica do gráfico e presets
   =========================================== */

// Tempos de coleta em minutos
var TEMPOS = [0, 30, 60, 90, 120, 180];
var LABELS = ['Jejum (0)', '30 min', '60 min', '90 min', '120 min', '180 min'];

// Presets baseados em literatura clínica (valores típicos em mg/dL)
var PRESETS = {
    normal: {
        nome: 'Normal',
        valores: [85, 130, 118, 100, 92, 82],
        desc: 'Pico em ~30 min, retorno ao basal em 120-180 min. Todos os valores dentro da faixa de normalidade.'
    },
    pre_diabetico: {
        nome: 'Pré-diabético (Tolerância Diminuída)',
        valores: [112, 168, 188, 172, 158, 128],
        desc: 'Jejum limítrofe (100-125), pico atrasado (~60 min), retorno lento. Glicemia de 120 min entre 140-199 mg/dL.'
    },
    diabetico: {
        nome: 'Diabético (DM2)',
        valores: [138, 205, 262, 245, 224, 188],
        desc: 'Jejum elevado (≥126), pico alto e tardio, queda muito lenta. Glicemia de 120 min ≥ 200 mg/dL.'
    },
    gestacional: {
        nome: 'Diabetes Gestacional',
        valores: [95, 172, 188, 168, 158, 122],
        desc: 'Critérios IADPSG: basta 1 valor alterado — jejum ≥92, 1h ≥180 ou 2h ≥153 mg/dL — para diagnóstico.'
    },
    hipoglicemia_reativa: {
        nome: 'Hipoglicemia Reativa',
        valores: [82, 172, 142, 92, 62, 48],
        desc: 'Pico exagerado seguido de queda abrupta. Glicemia <55-60 mg/dL em 120-180 min sugere hiperinsulinismo reativo.'
    },
    bifasico: {
        nome: 'Normal Bifásico',
        valores: [88, 142, 118, 128, 105, 84],
        desc: 'Dois picos discretos (~30 e ~90 min). Variante fisiológica normal, associada a boa sensibilidade insulínica.'
    }
};

// Faixas de referência para adultos (ADA/SBD)
var REF_ADULTO = {
    0:   { normal: 100, pre: 126 },
    60:  { normal: 155, pre: 209 },
    120: { normal: 140, pre: 200 }
};

// Faixas de referência para gestantes (IADPSG/OMS)
var REF_GESTANTE = {
    0:   { normal: 92,  pre: 126 },
    60:  { normal: 180, pre: 200 },
    120: { normal: 153, pre: 200 }
};

// Limiar de hipoglicemia
var HIPO_LIMIAR = 60;

var curvaChart = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarGrafico();
});

function inicializarGrafico() {
    var ctx = document.getElementById('curvaChart').getContext('2d');

    curvaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: LABELS,
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.6,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#9aa6c3',
                        font: { size: 11, family: 'system-ui' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 12
                    }
                },
                tooltip: {
                    backgroundColor: '#141821',
                    titleColor: '#6cf',
                    bodyColor: '#e8eefc',
                    borderColor: '#20283a',
                    borderWidth: 1,
                    titleFont: { weight: 'bold', size: 12 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(ctx) {
                            return ctx.dataset.label + ': ' + ctx.parsed.y + ' mg/dL';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#9aa6c3', font: { size: 11 } },
                    title: {
                        display: true,
                        text: 'Tempo após sobrecarga (75g glicose)',
                        color: '#9aa6c3',
                        font: { size: 11 }
                    }
                },
                y: {
                    min: 30,
                    max: 320,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#9aa6c3', font: { size: 11 }, stepSize: 20 },
                    title: {
                        display: true,
                        text: 'Glicemia (mg/dL)',
                        color: '#9aa6c3',
                        font: { size: 11 }
                    }
                }
            }
        }
    });

    // Mostrar curva normal por padrão
    document.getElementById('preset').value = 'normal';
    aplicarPreset();
}

function aplicarPreset() {
    var sel = document.getElementById('preset').value;
    if (!sel || sel === 'custom') {
        if (sel === 'custom') limparInputs();
        return;
    }

    var p = PRESETS[sel];
    if (!p) return;

    var ids = ['g0', 'g30', 'g60', 'g90', 'g120', 'g180'];
    for (var i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).value = p.valores[i];
    }

    atualizarGrafico();
}

function obterValores() {
    var ids = ['g0', 'g30', 'g60', 'g90', 'g120', 'g180'];
    var valores = [];
    for (var i = 0; i < ids.length; i++) {
        var v = parseFloat(document.getElementById(ids[i]).value);
        if (isNaN(v) || v < 0) return null;
        valores.push(v);
    }
    return valores;
}

function atualizarGrafico() {
    var valores = obterValores();
    if (!valores) {
        mostrarDiagnostico('Preencha todos os campos com valores válidos.', 'info');
        return;
    }

    var contexto = document.getElementById('contexto').value;
    var ref = contexto === 'gestante' ? REF_GESTANTE : REF_ADULTO;

    // Calcular Y max dinâmico
    var maxVal = Math.max.apply(null, valores);
    var yMax = Math.max(280, Math.ceil((maxVal + 30) / 20) * 20);

    // Datasets
    var datasets = [];

    // Faixas de referência como linhas horizontais
    datasets.push(criarLinhaRef('Limite Normal (120 min)', ref[120].normal, '#2ecc71'));
    if (contexto === 'adulto') {
        datasets.push(criarLinhaRef('Limite Diabetes (120 min)', ref[120].pre, '#ff4d4d'));
    } else {
        datasets.push(criarLinhaRef('Limite DMG (120 min)', ref[120].normal, '#ff4d4d'));
    }
    datasets.push(criarLinhaRef('Hipoglicemia', HIPO_LIMIAR, '#a28cff'));

    // Curva do paciente
    datasets.push({
        label: 'Curva Glicêmica',
        data: valores,
        borderColor: '#6cf',
        backgroundColor: 'rgba(102, 204, 255, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: valores.map(function(v, i) {
            return corPonto(v, TEMPOS[i], ref);
        }),
        pointBorderColor: valores.map(function(v, i) {
            return corPonto(v, TEMPOS[i], ref);
        }),
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3,
        order: 0
    });

    curvaChart.data.datasets = datasets;
    curvaChart.options.scales.y.max = yMax;
    curvaChart.update();

    // Análise
    analisar(valores, ref, contexto);
}

function criarLinhaRef(label, valor, cor) {
    var data = [];
    for (var i = 0; i < LABELS.length; i++) data.push(valor);
    return {
        label: label,
        data: data,
        borderColor: cor,
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 1
    };
}

function corPonto(valor, tempo, ref) {
    if (valor < HIPO_LIMIAR) return '#a28cff'; // hipoglicemia
    var limites = ref[tempo];
    if (!limites) return '#6cf'; // sem referência para este tempo
    if (valor < limites.normal) return '#2ecc71';
    if (valor < limites.pre) return '#f1c40f';
    return '#ff4d4d';
}

function classificar(valor, tempo, ref) {
    if (valor < HIPO_LIMIAR) return { classe: 'hipo', texto: 'Hipoglicemia', css: 'val-hipo' };
    var limites = ref[tempo];
    if (!limites) return { classe: 'sem_ref', texto: '—', css: '' };
    if (valor < limites.normal) return { classe: 'normal', texto: 'Normal', css: 'val-normal' };
    if (valor < limites.pre) return { classe: 'alterado', texto: 'Alterado', css: 'val-alerta' };
    return { classe: 'critico', texto: 'Elevado', css: 'val-critico' };
}

function analisar(valores, ref, contexto) {
    var temposRef = [0, 60, 120]; // tempos com referência definida
    var resultados = [];
    var picoIdx = 0;
    var picoVal = 0;
    var temHipo = false;
    var temAlterado = false;
    var temCritico = false;

    for (var i = 0; i < valores.length; i++) {
        if (valores[i] > picoVal) { picoVal = valores[i]; picoIdx = i; }
        if (valores[i] < HIPO_LIMIAR) temHipo = true;

        var c = classificar(valores[i], TEMPOS[i], ref);
        if (c.classe === 'alterado') temAlterado = true;
        if (c.classe === 'critico') temCritico = true;
        resultados.push({ tempo: TEMPOS[i], label: LABELS[i], valor: valores[i], class: c });
    }

    // Tabela de resultados
    var html = '<table>';
    html += '<thead><tr><th>Tempo</th><th>Valor (mg/dL)</th><th>Classificação</th></tr></thead>';
    html += '<tbody>';
    for (var j = 0; j < resultados.length; j++) {
        var r = resultados[j];
        html += '<tr>';
        html += '<td>' + r.label + '</td>';
        html += '<td class="' + r.class.css + '">' + r.valor + '</td>';
        html += '<td class="' + r.class.css + '">' + r.class.texto + '</td>';
        html += '</tr>';
    }
    html += '</tbody></table>';

    // Informações adicionais
    html += '<div style="margin-top:10px; font-size:12px; color:#9aa6c3;">';
    html += '<p><strong>Pico glicêmico:</strong> ' + picoVal + ' mg/dL em ' + TEMPOS[picoIdx] + ' min';
    if (picoIdx > 1) {
        html += ' <span style="color:#f1c40f">(pico atrasado — pode indicar resistência insulínica)</span>';
    }
    html += '</p>';

    // AUC simplificada (trapézios)
    var auc = 0;
    for (var k = 0; k < valores.length - 1; k++) {
        var dt = TEMPOS[k + 1] - TEMPOS[k];
        auc += (valores[k] + valores[k + 1]) / 2 * dt;
    }
    html += '<p><strong>Área sob a curva (AUC):</strong> ' + Math.round(auc) + ' mg·min/dL</p>';

    // Delta glicêmico
    var delta = picoVal - valores[0];
    html += '<p><strong>Delta glicêmico (pico − jejum):</strong> ' + Math.round(delta) + ' mg/dL</p>';

    // Retorno ao basal
    var retorno = Math.abs(valores[5] - valores[0]);
    if (retorno <= 15) {
        html += '<p><strong>Retorno ao basal:</strong> <span style="color:#2ecc71">Adequado</span> (diferença de ' + retorno + ' mg/dL)</p>';
    } else {
        html += '<p><strong>Retorno ao basal:</strong> <span style="color:#f1c40f">Incompleto</span> (diferença de ' + retorno + ' mg/dL)</p>';
    }

    html += '</div>';
    document.getElementById('tabela-resultado').innerHTML = html;

    // Diagnóstico resumido
    if (temCritico) {
        if (contexto === 'gestante') {
            mostrarDiagnostico('Valores compatíveis com DIABETES GESTACIONAL segundo critérios IADPSG/OMS. Encaminhamento obstétrico recomendado.', 'critico');
        } else {
            mostrarDiagnostico('Valores compatíveis com DIABETES MELLITUS segundo critérios ADA/SBD. Necessária confirmação com segunda amostra.', 'critico');
        }
    } else if (temHipo) {
        mostrarDiagnostico('Detectada HIPOGLICEMIA REATIVA (glicemia < 60 mg/dL). Pode indicar hiperinsulinismo ou resposta exagerada à sobrecarga.', 'alerta');
    } else if (temAlterado) {
        if (contexto === 'gestante') {
            mostrarDiagnostico('Pelo menos 1 valor alterado — compatível com DIABETES GESTACIONAL (critérios IADPSG). Confirmação clínica necessária.', 'alerta');
        } else {
            mostrarDiagnostico('Valores compatíveis com PRÉ-DIABETES (tolerância diminuída à glicose). Mudanças no estilo de vida recomendadas.', 'alerta');
        }
    } else {
        mostrarDiagnostico('Todos os valores dentro da faixa de NORMALIDADE. Curva glicêmica sem alterações.', 'normal');
    }
}

function mostrarDiagnostico(texto, tipo) {
    var el = document.getElementById('diagnostico');
    el.className = 'diagnostico status-' + tipo;
    el.textContent = texto;
    el.classList.remove('hidden');
}

function limparInputs() {
    var ids = ['g0', 'g30', 'g60', 'g90', 'g120', 'g180'];
    for (var i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).value = '';
    }
}

function limparCampos() {
    limparInputs();
    document.getElementById('preset').value = '';
    document.getElementById('diagnostico').classList.add('hidden');
    document.getElementById('tabela-resultado').innerHTML = '<p class="muted">Gere uma curva para visualizar a análise.</p>';

    if (curvaChart) {
        curvaChart.data.datasets = [];
        curvaChart.update();
    }
}
