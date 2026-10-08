#!/usr/bin/env python3
"""Gera as páginas de SEO local (uma por cidade) + sitemap.xml.

Uso:  python3 tools/build-city-pages.py
Saída: <slug>/index.html para cada cidade, sitemap.xml atualizado.

Regras de conteúdo (importante para o Google não tratar como páginas-clone):
- cada cidade tem texto de contexto, bairros, FAQ e meta description PRÓPRIOS;
- a Kav é 100% online e NÃO tem endereço: nunca afirmar presença física nas cidades.
"""
import html, json, os, datetime

SITE = 'https://agenciakav.com.br'
WA = '5511966405634'
TODAY = datetime.date.today().isoformat()

CITIES = [
    dict(
        slug='santana-de-parnaiba', name='Santana de Parnaíba',
        bairros=['Alphaville', 'Fazendinha', 'Centro Histórico'],
        lead='A Kav ajuda pequenos e médios negócios de Santana de Parnaíba a conseguir mais clientes com anúncios no Google e no Instagram, atendimento rápido no WhatsApp e acompanhamento de cada real investido. Tudo 100% online, falando direto com o sócio.',
        contexto=[
            'Santana de Parnaíba reúne públicos bem diferentes: moradores de condomínios em Alphaville, famílias de bairros como a Fazendinha e o movimento cultural e turístico do Centro Histórico. Isso muda tudo no marketing: quem procura um restaurante no Centro Histórico não é o mesmo cliente de quem contrata um serviço para casa em Alphaville.',
            'Por isso a gente começa pelo básico que costuma ficar de fora: quem compra de você, onde essa pessoa está e por que ela escolhe o seu negócio, ou o do vizinho. Só depois disso o anúncio é montado e segmentado por região.',
        ],
        servicos=[
            ('Anúncios por região', 'Campanhas no Google e no Instagram segmentadas por bairro, como Alphaville, Fazendinha e o Centro Histórico, para o seu dinheiro chegar a quem pode comprar.'),
            ('WhatsApp que não deixa cliente esperando', 'Atendimento que responde em segundos, de dia ou de madrugada, e passa para a sua equipe fechar a venda.'),
            ('Conteúdo que combina com a cidade', 'Instagram e conteúdo pensados para quem mora e trabalha em Santana de Parnaíba, sem postar por postar.'),
            ('Relatório que você entende', 'Quanto você investiu, quantos clientes chegaram e quanto vendeu. Sem número bonito que não vira venda.'),
        ],
        faq=[
            ('A Kav atende negócios de Santana de Parnaíba?', 'Sim. Atendemos empresas de Santana de Parnaíba, de Alphaville à Fazendinha e ao Centro Histórico, de forma 100% online: reuniões por videochamada e acompanhamento direto pelo WhatsApp.'),
            ('Vocês têm escritório em Santana de Parnaíba?', 'Não. A Kav é uma agência 100% online. Isso evita deslocamento e custo, e o acompanhamento é o mesmo: relatórios simples e contato direto com o sócio.'),
            ('Funciona para quem vende para moradores de condomínios e de Alphaville?', 'Funciona, e é um dos públicos em que a segmentação por região mais ajuda. A gente monta anúncios e conversas no WhatsApp pensando no perfil de quem mora ali, e mede o que realmente virou venda.'),
            ('Em quanto tempo aparecem os primeiros resultados?', 'Anúncios no Google e no Instagram podem gerar os primeiros contatos já nas primeiras semanas. O que faz o resultado crescer mês a mês é o ajuste fino com base nos números.'),
        ],
    ),
    dict(
        slug='cajamar', name='Cajamar',
        bairros=['Polvilho', 'Jordanésia', 'Centro'],
        lead='A Kav ajuda pequenos e médios negócios de Cajamar a vender mais com anúncios no Google e no Instagram, WhatsApp que responde rápido e relatórios simples de resultado. Atendimento 100% online, direto com o sócio, sem enrolação.',
        contexto=[
            'Cajamar combina comércio de bairro, como no Polvilho e na Jordanésia, com um polo logístico e industrial que movimenta muita gente todos os dias. Para o pequeno negócio local, isso significa dois tipos de cliente: o morador que compra perto de casa e quem passa pela cidade a trabalho.',
            'Os dois podem ser alcançados com anúncios bem segmentados e um WhatsApp que responde na hora. A gente descobre qual desses públicos compra mais de você e coloca o investimento onde ele dá retorno.',
        ],
        servicos=[
            ('Anúncios para o seu bairro', 'Campanhas no Google e no Instagram para quem está perto do seu negócio, no Polvilho, na Jordanésia, no Centro e arredores.'),
            ('Resposta rápida no WhatsApp', 'Quem chama de manhã, à noite ou no fim de semana é atendido em segundos, e a conversa chega pronta para a sua equipe fechar.'),
            ('Ser lembrado na região', 'Presença no Instagram e no Google para o cliente de Cajamar lembrar de você na hora de comprar.'),
            ('Acompanhamento de cada real', 'Você vê quanto gastou, quantos contatos vieram e quanto vendeu, em linguagem simples.'),
        ],
        faq=[
            ('A Kav atende negócios de Cajamar?', 'Sim. Atendemos empresas de Cajamar, incluindo Polvilho, Jordanésia e Centro, de forma 100% online, com videochamada e WhatsApp.'),
            ('Vocês atendem comércio e serviços do Polvilho e da Jordanésia?', 'Atendemos. Para negócios de bairro, o foco é aparecer para quem mora por perto, responder rápido no WhatsApp e medir quanto cada anúncio traz de cliente.'),
            ('A Kav tem escritório em Cajamar?', 'Não. A agência é 100% online, o que permite atender Cajamar sem deslocamento e com acompanhamento diário dos seus números.'),
            ('Quanto tempo leva para ver resultado?', 'Os primeiros contatos costumam aparecer nas primeiras semanas de anúncio. Com ajustes semanais baseados em dados, o resultado fica mais consistente a cada mês.'),
        ],
    ),
    dict(
        slug='barueri', name='Barueri',
        bairros=['Alphaville', 'Tamboré', 'Centro'],
        lead='A Kav ajuda negócios de Barueri a atrair mais clientes com anúncios no Google e no Instagram, atendimento no WhatsApp e acompanhamento de cada real investido. Marketing de vendas 100% online, falando direto com o sócio.',
        contexto=[
            'Barueri é um dos principais polos empresariais da região, com o movimento de Alphaville, do Tamboré e do Centro. Para o negócio local, a disputa pela atenção do cliente é grande: quem aparece primeiro no Google e responde mais rápido no WhatsApp leva a venda.',
            'A gente trabalha para o seu negócio ser encontrado por quem está procurando, na hora certa, e atendido sem demora. Cada real investido é acompanhado para você saber o que realmente deu resultado.',
        ],
        servicos=[
            ('Aparecer na hora da busca', 'Anúncios no Google para quem já está procurando o que você vende em Barueri, em Alphaville, no Tamboré e no Centro.'),
            ('Instagram que traz cliente', 'Anúncios e conteúdo no Instagram para o público certo da sua região, sem depender só de indicação.'),
            ('Atendimento sem demora', 'WhatsApp que responde em segundos e passa a conversa pronta para a sua equipe.'),
            ('Números na mesa', 'Relatório simples com investimento, contatos e vendas, para você decidir com dados e não com palpite.'),
        ],
        faq=[
            ('A Kav atende negócios de Barueri?', 'Sim. Atendemos empresas de Barueri, de Alphaville ao Tamboré e ao Centro, de forma 100% online.'),
            ('Vocês também atendem empresas que vendem para outras empresas (B2B)?', 'Atendemos. Para quem vende para outras empresas, o foco é gerar contatos qualificados pelo Google e pelo WhatsApp e acompanhar quantos viram reunião e venda.'),
            ('A Kav tem escritório em Barueri ou em Alphaville?', 'Não. A Kav é 100% online. Você fala direto com o sócio por videochamada e WhatsApp, sem deslocamento.'),
            ('Em quanto tempo vejo os primeiros resultados?', 'Os primeiros contatos podem aparecer nas primeiras semanas de anúncio. O resultado cresce com ajustes semanais feitos a partir dos seus números.'),
        ],
    ),
    dict(
        slug='osasco', name='Osasco',
        bairros=['Centro', 'Presidente Altino', 'Km 18'],
        lead='A Kav ajuda pequenos e médios negócios de Osasco a vender mais com anúncios no Google e no Instagram, WhatsApp que responde rápido e resultado acompanhado de perto. Atendimento 100% online, direto com o sócio.',
        contexto=[
            'Osasco tem um comércio muito forte, com grande movimento no Centro e em regiões como Presidente Altino e Km 18. A concorrência é intensa, e anúncio sem estratégia vira só gasto.',
            'Nosso trabalho é fazer o seu negócio se destacar no meio dessa concorrência: encontrar o cliente que realmente compra de você, falar com ele no canal certo e atender rápido no WhatsApp. Tudo medido, para o dinheiro não ir embora.',
        ],
        servicos=[
            ('Destaque no meio da concorrência', 'Anúncios no Google e no Instagram para quem busca o que você vende em Osasco, no Centro, em Presidente Altino, no Km 18 e região.'),
            ('Mais clientes sem aumentar o gasto às cegas', 'A gente revisa seus anúncios atuais, corta o que não funciona e coloca o investimento no que traz cliente.'),
            ('WhatsApp rápido', 'Respostas em segundos, de dia ou de madrugada, para ninguém desistir de comprar por falta de retorno.'),
            ('Relatório em linguagem de dono', 'Quanto gastou, quantos clientes chegaram e quanto vendeu, sem termos complicados.'),
        ],
        faq=[
            ('A Kav atende negócios de Osasco?', 'Sim. Atendemos empresas de Osasco, do Centro a Presidente Altino e ao Km 18, de forma 100% online.'),
            ('Funciona para comércio de rua e lojas do Centro?', 'Funciona. Para comércio de rua, o foco é aparecer para quem está por perto ou pesquisando, e transformar o interesse em mensagem no WhatsApp e visita à loja.'),
            ('A Kav tem escritório em Osasco?', 'Não. A agência é 100% online, com videochamada e WhatsApp, o que permite atender Osasco sem deslocamento e com acompanhamento diário.'),
            ('Quanto tempo leva para ver resultado?', 'Os primeiros contatos podem surgir nas primeiras semanas. O ajuste constante dos anúncios, com base nos números, faz o resultado crescer ao longo dos meses.'),
        ],
    ),
    dict(
        slug='carapicuiba', name='Carapicuíba',
        bairros=['Centro', 'Vila Dirce', 'Ayrosa'],
        lead='A Kav ajuda negócios de Carapicuíba a vender mais com anúncios no Google e no Instagram, atendimento rápido no WhatsApp e acompanhamento de cada real investido. Marketing 100% online, direto com o sócio.',
        contexto=[
            'Carapicuíba tem comércio de bairro forte e muita gente que compra perto de casa, no Centro, na Vila Dirce, no Ayrosa e em outras regiões. Para o pequeno negócio, a grande vantagem é a proximidade com o cliente.',
            'Com anúncios segmentados por região e um WhatsApp que responde rápido, dá para ser a primeira escolha do bairro. A gente cuida do marketing e acompanha os números, para você saber quanto cada anúncio trouxe de venda.',
        ],
        servicos=[
            ('Anúncios para quem mora perto', 'Campanhas no Google e no Instagram para o público do seu bairro em Carapicuíba, no Centro, na Vila Dirce, no Ayrosa e arredores.'),
            ('Ser a primeira escolha do bairro', 'Presença no Google e no Instagram para o cliente achar e lembrar do seu negócio.'),
            ('Atendimento que fecha venda', 'WhatsApp que responde em segundos e entrega a conversa pronta para a sua equipe.'),
            ('Transparência total', 'Você acompanha investimento, contatos e vendas em relatórios simples.'),
        ],
        faq=[
            ('A Kav atende negócios de Carapicuíba?', 'Sim. Atendemos empresas de Carapicuíba, incluindo Centro, Vila Dirce e Ayrosa, de forma 100% online.'),
            ('Funciona para negócios de bairro?', 'Funciona muito bem. Negócios de bairro se beneficiam de anúncios segmentados por região e de um atendimento rápido no WhatsApp, que é onde o cliente costuma fechar.'),
            ('A Kav tem escritório em Carapicuíba?', 'Não. A Kav é 100% online. Atendemos por videochamada e WhatsApp, sem deslocamento e sem custo extra por isso.'),
            ('Em quanto tempo vejo resultado?', 'Os primeiros contatos costumam aparecer nas primeiras semanas de anúncio, e o resultado fica mais forte conforme ajustamos com base nos seus números.'),
        ],
    ),
]


def esc(s):
    return html.escape(s, quote=True)


def wa(city):
    from urllib.parse import quote
    return f'https://wa.me/{WA}?text=' + quote(f'Oi! Vim pelo site da Kav e tenho um negócio em {city}. Quero conversar sobre vender mais.')


def jsonld(city, others):
    url = f"{SITE}/{city['slug']}/"
    graph = [
        {
            '@type': 'MarketingAgency',
            '@id': f'{SITE}/#agency',
            'name': 'Kav',
            'url': f'{SITE}/',
            'telephone': '+5511966405634',
            'image': f'{SITE}/assets/img/og-kav.jpg',
            'description': 'Agência de marketing 100% online para pequenos e médios negócios: anúncios no Google e no Instagram, atendimento no WhatsApp e resultados acompanhados.',
            'areaServed': [{'@type': 'City', 'name': c['name'], 'containedInPlace': {'@type': 'AdministrativeArea', 'name': 'São Paulo'}} for c in CITIES],
            'founder': {'@type': 'Person', 'name': 'Kesley Sampaio', 'jobTitle': 'Sócio e Estrategista de Performance'},
            'sameAs': ['https://instagram.com/kav.mkt'],
        },
        {
            '@type': 'WebPage', '@id': url, 'url': url, 'name': f"Marketing para negócios em {city['name']} | Kav",
            'about': {'@type': 'City', 'name': city['name']}, 'isPartOf': {'@id': f'{SITE}/#website'},
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': f'{SITE}/'},
                {'@type': 'ListItem', 'position': 2, 'name': city['name'], 'item': url},
            ],
        },
        {
            '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in city['faq']],
        },
    ]
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2)


def page(city):
    n = city['name']
    url = f"{SITE}/{city['slug']}/"
    title = f'Marketing para Negócios em {n} | Kav'
    desc = f'Agência de marketing online para negócios de {n}: anúncios no Google e Instagram, WhatsApp que responde rápido e resultado acompanhado. Análise gratuita.'
    others = [c for c in CITIES if c['slug'] != city['slug']]
    chips = ''.join(f'<li>{esc(b)}</li>' for b in city['bairros'])
    cards = ''.join(f'<article class="cp-card"><h3>{esc(t)}</h3><p>{esc(d)}</p></article>' for t, d in city['servicos'])
    ctx = ''.join(f'<p>{esc(p)}</p>' for p in city['contexto'])
    faq = ''.join(f'<details class="cp-faq"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in city['faq'])
    other_links = ''.join(f'<a href="/{c["slug"]}/">{esc(c["name"])}</a>' for c in others)
    footer_cities = ''.join(f'<li><a href="/{c["slug"]}/">{esc(c["name"])}</a></li>' for c in CITIES)
    fonts = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap'
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Kav">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="{SITE}/assets/img/og-kav.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="twitter:image" content="{SITE}/assets/img/og-kav.jpg">
  <script type="application/ld+json">
{jsonld(city, others)}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="{fonts}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="{fonts}"></noscript>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/city.css">
  <link rel="stylesheet" href="/css/extras.css">
</head>
<body class="city-page">
  <header class="cp-header">
    <div class="container cp-header-inner">
      <a href="/" class="cp-logo" aria-label="Kav, página inicial"><img src="/assets/img/kav-logo-intro.png" alt="Kav" width="700" height="343"></a>
      <nav class="cp-nav" aria-label="Navegação">
        <a href="/#como-funciona">Como funciona</a>
        <a href="/#resultados">Resultados</a>
        <a href="/blog/">Blog</a>
        <a href="/#analise">Contato</a>
      </nav>
      <a href="{wa(n)}" class="btn btn-whatsapp-primary cp-wa" target="_blank" rel="noopener noreferrer"><span>Falar no WhatsApp</span></a>
    </div>
  </header>

  <main>
    <section class="cp-hero">
      <div class="container">
        <nav class="cp-breadcrumb" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">›</span><span>{esc(n)}</span></nav>
        <span class="cp-tag">Agência de marketing 100% online</span>
        <h1>Marketing para pequenos e médios negócios em <span class="hl">{esc(n)}</span></h1>
        <p class="cp-lead">{esc(city['lead'])}</p>
        <div class="cp-actions">
          <a href="{wa(n)}" class="btn btn-whatsapp-primary" target="_blank" rel="noopener noreferrer"><span>Falar no WhatsApp</span></a>
          <a href="/#analise" class="btn btn-secondary"><span>Pedir análise gratuita</span></a>
        </div>
        <ul class="cp-trust">
          <li>Atendimento direto com o sócio</li>
          <li>Resultado acompanhado, real a real</li>
          <li>100% online, sem deslocamento</li>
        </ul>
      </div>
    </section>

    <section class="cp-section">
      <div class="container cp-split">
        <div>
          <h2>Por que negócios de {esc(n)} precisam de marketing que vende</h2>
          {ctx}
        </div>
        <aside class="cp-areas" aria-label="Regiões atendidas em {esc(n)}">
          <h3>Regiões de {esc(n)} que atendemos</h3>
          <ul>{chips}<li>e arredores</li></ul>
          <p class="cp-note">A Kav não tem escritório físico: toda a estratégia, as reuniões e o acompanhamento acontecem online, e o seu atendimento é o mesmo estando em qualquer bairro.</p>
        </aside>
      </div>
    </section>

    <section class="cp-section cp-alt">
      <div class="container">
        <h2>O que a Kav faz pelo seu negócio em {esc(n)}</h2>
        <div class="cp-grid">{cards}</div>
      </div>
    </section>

    <section class="cp-section">
      <div class="container">
        <h2>Resultados reais com pequenos negócios</h2>
        <div class="cp-grid cp-grid-2">
          <article class="cp-card cp-case"><span class="cp-kpi">2 → 6,5</span><h3>Almeida Cestas</h3><p>No iFood, o retorno de cada real investido passou de 2 para 6,5 e a taxa de conversão triplicou.</p></article>
          <article class="cp-card cp-case"><span class="cp-kpi">+7 mil</span><h3>PontoCar</h3><p>Mais de 7 mil contatos qualificados no WhatsApp e o dobro de faturamento com o novo canal de vendas.</p></article>
        </div>
        <p class="cp-more"><a href="/#resultados">Ver os cases completos →</a></p>
      </div>
    </section>

    <section class="cp-section cp-alt">
      <div class="container cp-faqwrap">
        <h2>Perguntas frequentes sobre marketing em {esc(n)}</h2>
        {faq}
      </div>
    </section>

    <section class="cp-section cp-cta">
      <div class="container">
        <h2>Vamos levar o seu negócio de {esc(n)} ao topo?</h2>
        <p>Análise gratuita do seu negócio, sem compromisso. A gente olha o seu caso e responde com sugestões práticas, sem papo de vendedor.</p>
        <div class="cp-actions cp-center">
          <a href="{wa(n)}" class="btn btn-whatsapp-primary" target="_blank" rel="noopener noreferrer"><span>Falar no WhatsApp</span></a>
          <a href="/#analise" class="btn btn-secondary"><span>Pedir análise gratuita</span></a>
        </div>
        <p class="cp-others">Também atendemos: {other_links}</p>
      </div>
    </section>
  </main>

  <footer class="site-footer cp-footer">
    <div class="container cp-footer-inner">
      <div>
        <a href="/" class="cp-logo" aria-label="Kav"><img src="/assets/img/kav-logo-intro.png" alt="Kav" width="700" height="343"></a>
        <p>Marketing para pequenos e médios negócios. Agência 100% online, atendendo Santana de Parnaíba, Cajamar, Barueri, Osasco e Carapicuíba.</p>
        <p><a href="https://wa.me/{WA}" target="_blank" rel="noopener noreferrer">WhatsApp: (11) 96640-5634</a><br>contato@agenciakav.com.br</p>
        <p><a href="/politica-de-privacidade/">Política de privacidade</a> · <a href="/blog/">Blog</a> · <a href="#" data-cookie-manage>Gerenciar cookies</a></p>
      </div>
      <div class="footer-links"><h4>Cidades atendidas</h4><ul>{footer_cities}</ul></div>
    </div>
    <div class="container footer-bottom"><p>&copy; 2026 Kav - Marketing para pequenos e médios negócios. Todos os direitos reservados.</p></div>
  </footer>
  <script src="/js/site-extras.js" defer></script>
</body>
</html>
'''


def sitemap():
    urls = [(f'{SITE}/', '1.0')] + [(f"{SITE}/{c['slug']}/", '0.8') for c in CITIES]
    body = ''.join(f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{p}</priority>\n  </url>\n' for u, p in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n'


if __name__ == '__main__':
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for c in CITIES:
        d = os.path.join(root, c['slug'])
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page(c))
    open(os.path.join(root, 'sitemap.xml'), 'w', encoding='utf-8').write(sitemap())
    print('geradas:', ', '.join(c['slug'] for c in CITIES))
