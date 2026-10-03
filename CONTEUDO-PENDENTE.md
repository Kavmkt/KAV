# Kav + HyperKav — Checklist de Conteúdo Pendente e Comprovações

Este documento registra todos os elementos de credibilidade, métricas, selos e prazos que foram neutralizados ou ajustados no site para cumprir rigorosamente as políticas de conformidade, verdade publicitária e integridade (sem dados fictícios).

Para recolocar qualquer um destes itens com destaque no site, basta fornecer as informações e comprovações correspondentes listadas abaixo.

---

## 1. Métricas de Impacto e Resultados Quantitativos
* **O que foi ajustado:**
  * Removidos os números `+340% ROAS médio`, `R$ 24M+ faturamento gerado` e `98.2% taxa de retenção`.
  * Substituídos temporariamente por pilares qualitativos de valor: *Decisões pautadas em dados reais*, *Foco em lucro e margem*, *Mapeamento estratégico de mercado* e *Atendimento consultivo*.
* **O que é necessário para recolocar:**
  * Enviar o volume consolidado real gerado pela agência (ex.: volume real de verba administrada ou faturamento atribuído com fonte/período, ex: *2024–2026 via Looker Studio/Google Analytics*).
  * Enviar métricas reais médias com respectivo disclaimer metodológico de cálculo.

---

## 2. Selos e Parcerias de Plataformas
* **O que foi ajustado:**
  * Removidos os selos `Google Partner Premier` e `Meta Business Partner` do rodapé.
  * Substituídos por `Especialistas em Google Ads` e `Especialistas em Meta Ads`.
* **O que é necessário para recolocar:**
  * Para o selo **Google Partner** ou **Google Partner Premier**: confirmação do status ativo no programa Google Partners (necessita de conta de administrador Google Ads com gastos e certificações vigentes).
  * Para o selo **Meta Business Partner**: confirmação do credenciamento da agência no diretório oficial da Meta.

---

## 3. Depoimentos de Clientes (Prova Social)
* **O que foi ajustado:**
  * Removidos os depoimentos com nomes fictícios (*Marcos Silveira / TechParts*, *Camila Lima / BioSaúde*, *Rodrigo Ferreira / Alpha Soluções*) e avaliação genérica de 5 estrelas.
  * Substituído por um bloco transparente informando que os estudos de caso documentados e autorizados serão publicados em breve.
* **O que é necessário para recolocar:**
  * Para cada depoimento:
    * Nome completo do cliente/gestor.
    * Cargo e Nome da Empresa.
    * Foto ou logotipo da empresa (opcional).
    * Citação real do cliente com autorização expressa para uso em marketing.
    * Link ou menção ao projeto/resultado alcançado.

---

## 4. Prazos de Atendimento e Mensagens de Urgência
* **O que foi ajustado:**
  * Faixa do topo: Removido `Vagas abertas para diagnóstico de escala para PMEs neste trimestre` e substituído por `Diagnóstico estratégico para pequenas e médias empresas`.
  * Mensagem de sucesso do formulário: Removido `em até 2 horas úteis` e substituído pelo padrão `Entraremos em contato em breve`.
* **O que é necessário para recolocar:**
  * Definir o SLA operacional real de resposta da equipe comercial (ex.: *em até 1 dia útil*, *em até 4 horas*, etc.).
  * Confirmar se há política de vagas limitadas ou lotes trimestrais antes de utilizar gatilhos de urgência.

---

## 5. Canais de Contato e Integração do Formulário
* **O que foi ajustado:**
  * O formulário formata os dados e gera um link estruturado para conversa direta via WhatsApp (`https://wa.me/...`).
  * Número padrão configurado provisoriamente: `5511999999999`.
* **O que é necessário para recolocar:**
  * **Número de WhatsApp Comercial:** Enviar o número DDD + Telefone oficial da Kav para redirecionamento imediato.
  * **E-mail de Notificação:** Definir se os leads devem ser enviados para um e-mail específico (ex.: via Web3Forms ou Formspree gratuito para sites estáticos no GitHub Pages) além do WhatsApp.
  * **Links Sociais:** Enviar as URLs reais do Instagram e LinkedIn da Kav.

---

## 6. Arquivo de Vídeo Original para Otimização (ffmpeg)
* **O que é necessário:**
  * Para gerar as versões de alta performance (`hero-desktop.mp4` e `hero-mobile.mp4`) com o átomo `moov` no início (`+faststart`) e GOP curto (`-g 8`), o arquivo original precisa ser reencodado ou baixado.
  * Assim que anexar o arquivo no chat ou adicioná-lo ao Google Drive, executaremos a pipeline completa de compressão e extração de frames WebP.
