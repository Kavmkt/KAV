# Kav — Checklist de Conteúdo Pendente e Confirmações (v5.0)

Este documento centraliza os dados, imagens e confirmações que dependem exclusivamente de informações internas da agência para estarem 100% integrados ao site.

---

### 1. Número Oficial de WhatsApp
* **Local:** `js/main.js` (linha 16: `const WHATSAPP_NUMBER = '5511999999999';`)
* **O que fazer:** Substituir pelo número comercial da Kav com DDI (55) e DDD (ex.: `5511912345678`), sem traços ou parênteses.
* **Impacto:** Todas as chamadas primárias do site (*"Falar no WhatsApp"*, botões da calculadora, teste de IA e formulário) passam a direcionar imediatamente para o atendente correto.

---

### 2. Case Almeida Cestas
* **Local:** `index.html` (seção `#resultados`)
* **O que confirmar:** Se o dado de pedidos concluídos é exatamente `+716%` ou se há outro percentual/número absoluto documentado.
* **Imagem:** Inserir no slot demarcado um print real do cardápio no iFood ou foto autorizada da loja/cestas.

---

### 3. FAQ do Atendimento com IA no WhatsApp
* **Local:** `index.html` (seção `#atendimento`)
* **O que confirmar:**
  * *Uso do número atual:* Confirmar detalhes técnicos do processo que a Kav adota para ativação na API oficial.
  * *Modelo de preços:* Definir se prefere expor faixas de valores ou manter o direcionamento consultivo / sob medida.

---

### 4. Oferta de Teste de Atendimento
* **Local:** `index.html` (seção `#atendimento`)
* **O que confirmar:** Se o período de experimentação sem compromisso para novos clientes é de `7 dias` ou outro prazo comercial.

---

### 5. Seção "Quem está por trás"
* **Local:** `index.html` (seção `#quem-somos`)
* **O que fornecer:**
  * Nome completo do sócio/estrategista responsável (está sugerido *Kesley Sampaio*).
  * Foto de perfil profissional para substituir o avatar inicial `KAV`.
  * Breve descrição de atuação e bio resumida.

---

### 6. Imagem e Identidade do Case PontoCar
* **Local:** `index.html` (seção `#case-pontocar`)
* **O que fornecer:** Logotipo ou print de atendimento/agendamento no WhatsApp para o espaço reservado.

---

### 7. Redes Sociais e Contatos
* **Local:** `index.html` (rodapé)
* **O que confirmar:**
  * Link do LinkedIn institucional (caso exista página ativa).
  * O Instagram oficial já está vinculado a `@kav.mkt` (`https://instagram.com/kav.mkt`).
