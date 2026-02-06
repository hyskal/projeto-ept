# Curva Glicêmica (TOTG) — Ferramenta Educacional

Ferramenta PHP para visualização e análise de curvas glicêmicas, baseada no Teste Oral de Tolerância à Glicose (TOTG) conforme critérios laboratoriais brasileiros.

## Requisitos

- Apache com PHP 7+ (sem extensões extras)
- Acesso à internet para Chart.js via CDN

## Instalação

Copie os arquivos para o diretório do Apache e acesse via navegador:

```
cp -r projeto-ept/ /var/www/html/curva-glicemica/
```

## Estrutura

```
├── index.php        # Página principal
├── css/style.css    # Estilos (tema escuro)
├── js/curva.js      # Lógica do gráfico e análise
└── .htaccess        # Cache, gzip e segurança
```

## Funcionalidades

- **Presets clínicos**: normal, pré-diabético, DM2, diabetes gestacional, hipoglicemia reativa, bifásico
- **Entrada manual**: 6 tempos de coleta (0, 30, 60, 90, 120, 180 min)
- **Gráfico interativo**: Chart.js com linhas de referência e pontos coloridos por classificação
- **Análise automática**: classificação por ponto, AUC, delta glicêmico, avaliação de retorno ao basal
- **Contextos**: adulto (ADA/SBD) e gestante (IADPSG/OMS)

## Referências

- Diretriz da Sociedade Brasileira de Diabetes (SBD) — 2025
- ADA Standards of Care — 2026
- Critérios IADPSG/OMS para diabetes gestacional

> **Aviso:** Finalidade exclusivamente educacional. Não substitui avaliação médica.
