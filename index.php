<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curva Glic&ecirc;mica &mdash; Ferramenta Educacional</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="container">
    <header>
        <h1>Curva Glic&ecirc;mica (TOTG)</h1>
        <p class="subtitle">Teste Oral de Toler&acirc;ncia &agrave; Glicose &mdash; Ferramenta Educacional</p>
    </header>

    <div class="grid">
        <!-- Painel de entrada -->
        <section class="card" id="painel-entrada">
            <h2>Dados da Curva</h2>
            <p class="muted">Insira os valores de glicemia (mg/dL) em cada tempo de coleta ap&oacute;s sobrecarga de 75g de glicose, ou selecione um preset.</p>

            <div class="form-group">
                <label for="preset">Presets de curvas:</label>
                <select id="preset" onchange="aplicarPreset()">
                    <option value="">-- Selecione um preset --</option>
                    <option value="normal">Normal</option>
                    <option value="pre_diabetico">Pr&eacute;-diab&eacute;tico (Toler&acirc;ncia Diminu&iacute;da)</option>
                    <option value="diabetico">Diab&eacute;tico (DM2)</option>
                    <option value="gestacional">Diabetes Gestacional</option>
                    <option value="hipoglicemia_reativa">Hipoglicemia Reativa</option>
                    <option value="bifasico">Normal Bif&aacute;sico</option>
                    <option value="custom">Valores Personalizados</option>
                </select>
            </div>

            <div class="input-grid">
                <?php
                $tempos = [
                    ['id' => 'g0',   'label' => 'Jejum (0 min)',  'placeholder' => 'mg/dL'],
                    ['id' => 'g30',  'label' => '30 min',         'placeholder' => 'mg/dL'],
                    ['id' => 'g60',  'label' => '60 min',         'placeholder' => 'mg/dL'],
                    ['id' => 'g90',  'label' => '90 min',         'placeholder' => 'mg/dL'],
                    ['id' => 'g120', 'label' => '120 min',        'placeholder' => 'mg/dL'],
                    ['id' => 'g180', 'label' => '180 min',        'placeholder' => 'mg/dL'],
                ];
                foreach ($tempos as $t) {
                    echo '<div class="input-item">';
                    echo '  <label for="' . $t['id'] . '">' . $t['label'] . '</label>';
                    echo '  <input type="number" id="' . $t['id'] . '" placeholder="' . $t['placeholder'] . '" min="0" max="600" step="1">';
                    echo '</div>';
                }
                ?>
            </div>

            <div class="form-group">
                <label for="contexto">Contexto cl&iacute;nico:</label>
                <select id="contexto" onchange="atualizarGrafico()">
                    <option value="adulto">Adulto (crit&eacute;rios ADA/SBD)</option>
                    <option value="gestante">Gestante (crit&eacute;rios IADPSG/OMS)</option>
                </select>
            </div>

            <button onclick="atualizarGrafico()" id="btn-gerar">Gerar Curva</button>
            <button onclick="limparCampos()" id="btn-limpar">Limpar</button>
        </section>

        <!-- Painel do gr&aacute;fico -->
        <section class="card" id="painel-grafico">
            <h2>Curva Glic&ecirc;mica</h2>
            <div class="chart-wrapper">
                <canvas id="curvaChart"></canvas>
            </div>
            <div id="diagnostico" class="diagnostico hidden"></div>
        </section>
    </div>

    <!-- Tabela de resultados -->
    <section class="card" id="painel-resultado">
        <h2>An&aacute;lise dos Resultados</h2>
        <div id="tabela-resultado">
            <p class="muted">Gere uma curva para visualizar a an&aacute;lise.</p>
        </div>
    </section>

    <!-- Refer&ecirc;ncia -->
    <div class="grid">
        <section class="card">
            <h2>Valores de Refer&ecirc;ncia &mdash; Adultos</h2>
            <p class="muted">Crit&eacute;rios ADA / SBD (Diretriz 2025)</p>
            <table>
                <thead>
                    <tr>
                        <th>Momento</th>
                        <th class="status-ok">Normal</th>
                        <th class="status-warn">Pr&eacute;-diabetes</th>
                        <th class="status-danger">Diabetes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jejum</td>
                        <td>&lt; 100 mg/dL</td>
                        <td>100&ndash;125 mg/dL</td>
                        <td>&ge; 126 mg/dL</td>
                    </tr>
                    <tr>
                        <td>60 min</td>
                        <td>&lt; 155 mg/dL</td>
                        <td>155&ndash;208 mg/dL</td>
                        <td>&ge; 209 mg/dL</td>
                    </tr>
                    <tr>
                        <td>120 min</td>
                        <td>&lt; 140 mg/dL</td>
                        <td>140&ndash;199 mg/dL</td>
                        <td>&ge; 200 mg/dL</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section class="card">
            <h2>Valores de Refer&ecirc;ncia &mdash; Gestantes</h2>
            <p class="muted">Crit&eacute;rios IADPSG / OMS / SBD (24&ndash;28 semanas)</p>
            <table>
                <thead>
                    <tr>
                        <th>Momento</th>
                        <th class="status-ok">Normal</th>
                        <th class="status-danger">Diabetes Gestacional</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jejum</td>
                        <td>&lt; 92 mg/dL</td>
                        <td>&ge; 92 mg/dL</td>
                    </tr>
                    <tr>
                        <td>60 min</td>
                        <td>&lt; 180 mg/dL</td>
                        <td>&ge; 180 mg/dL</td>
                    </tr>
                    <tr>
                        <td>120 min</td>
                        <td>&lt; 153 mg/dL</td>
                        <td>&ge; 153 mg/dL</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>

    <!-- Metodologia -->
    <section class="card">
        <details>
            <summary>Metodologia e Informa&ccedil;&otilde;es Educacionais</summary>
            <div class="details-content">
                <h3>Sobre o TOTG</h3>
                <p>O <strong>Teste Oral de Toler&acirc;ncia &agrave; Glicose (TOTG)</strong>, tamb&eacute;m chamado de TTGO ou curva glic&ecirc;mica, &eacute; considerado o padr&atilde;o-ouro para diagn&oacute;stico de diabetes mellitus e pr&eacute;-diabetes.</p>

                <h3>Protocolo</h3>
                <ul>
                    <li>Jejum de 8&ndash;12 horas antes do exame</li>
                    <li>Alimenta&ccedil;&atilde;o nos 3 dias anteriores com ingesta m&iacute;nima de 150g de carboidratos/dia</li>
                    <li>Coleta basal (jejum) seguida da ingest&atilde;o de 75g de glicose anidra dilu&iacute;da em 250&ndash;300mL de &aacute;gua</li>
                    <li>Coletas nos tempos: 0 (jejum), 30, 60, 90, 120 e 180 minutos</li>
                    <li>Paciente deve permanecer em repouso durante o exame</li>
                </ul>

                <h3>Padr&otilde;es das Curvas</h3>
                <div class="pattern-grid">
                    <div class="pattern-box">
                        <h4>Normal</h4>
                        <p>Pico glic&ecirc;mico em ~30 min, retorno ao basal em 120&ndash;180 min. Valores permanecem abaixo de 140 mg/dL ap&oacute;s 2 horas.</p>
                    </div>
                    <div class="pattern-box">
                        <h4>Pr&eacute;-diab&eacute;tico</h4>
                        <p>Pico atrasado (~60 min), retorno lento. Valores entre 140&ndash;199 mg/dL em 120 min indicam toler&acirc;ncia diminu&iacute;da &agrave; glicose (TDG).</p>
                    </div>
                    <div class="pattern-box">
                        <h4>Diab&eacute;tico (DM2)</h4>
                        <p>Pico elevado e tardio, queda muito lenta. Glicemia &ge; 200 mg/dL em 120 min confirma diabetes. Frequ&ecirc;ncia de pico &ge; 60 min.</p>
                    </div>
                    <div class="pattern-box">
                        <h4>Hipoglicemia Reativa</h4>
                        <p>Pico inicial exagerado seguido de queda acentuada abaixo de 55&ndash;60 mg/dL entre 120&ndash;300 min. Pode indicar hiperinsulinismo.</p>
                    </div>
                    <div class="pattern-box">
                        <h4>Diabetes Gestacional</h4>
                        <p>Crit&eacute;rios IADPSG: basta 1 valor alterado &mdash; jejum &ge; 92, 1h &ge; 180 ou 2h &ge; 153 mg/dL &mdash; para diagn&oacute;stico entre 24&ndash;28 semanas.</p>
                    </div>
                    <div class="pattern-box">
                        <h4>Normal Bif&aacute;sico</h4>
                        <p>Dois picos discretos (~30 e ~90 min). Associado a maior sensibilidade insul&iacute;nica. Vari&aacute;vel fisiol&oacute;gica normal.</p>
                    </div>
                </div>

                <h3>Novos Crit&eacute;rios (SBD/IDF 2025)</h3>
                <p>A Sociedade Brasileira de Diabetes (SBD) e a IDF recomendam que a <strong>glicemia de 1 hora &ge; 209 mg/dL</strong> durante o TOTG seja utilizada como crit&eacute;rio diagn&oacute;stico para DM, e que <strong>glicemia de 1 hora &ge; 155 mg/dL</strong> identifique indiv&iacute;duos com risco intermedi&aacute;rio (pr&eacute;-diabetes).</p>

                <h3>Refer&ecirc;ncias</h3>
                <ul class="refs">
                    <li>Diretriz da Sociedade Brasileira de Diabetes &mdash; Edi&ccedil;&atilde;o 2025</li>
                    <li>American Diabetes Association (ADA) &mdash; Standards of Care 2026</li>
                    <li>International Diabetes Federation (IDF) &mdash; Crit&eacute;rios Diagn&oacute;sticos</li>
                    <li>IADPSG / OMS &mdash; Diabetes Gestacional</li>
                    <li>Tietz &mdash; Valores de refer&ecirc;ncia para tempos intermedi&aacute;rios</li>
                </ul>

                <p class="muted" style="margin-top:12px"><strong>Aviso:</strong> Esta ferramenta tem finalidade exclusivamente educacional. A interpreta&ccedil;&atilde;o de exames laboratoriais deve ser feita por profissional m&eacute;dico qualificado.</p>
            </div>
        </details>
    </section>

    <footer>
        <p>Ferramenta educacional &mdash; N&atilde;o substitui avalia&ccedil;&atilde;o m&eacute;dica</p>
    </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="js/curva.js"></script>

</body>
</html>
