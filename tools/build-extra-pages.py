#!/usr/bin/env python3
"""Gera: /politica-de-privacidade/, /obrigado/, /blog/ e os artigos do blog; atualiza o sitemap.

Uso:  python3 tools/build-extra-pages.py   (rode DEPOIS de tools/build-city-pages.py,
que também escreve o sitemap; este script o reescreve com tudo junto).
Não inventar números/estatísticas nos artigos.
"""
import html, importlib.util, os, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('cities', os.path.join(ROOT, 'tools', 'build-city-pages.py'))
cities = importlib.util.module_from_spec(spec); spec.loader.exec_module(cities)
SITE, WA, CITIES, TODAY = cities.SITE, cities.WA, cities.CITIES, cities.TODAY
esc = html.escape
FONTS = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap'
WA_URL = f'https://wa.me/{WA}?text=Oi!%20Vim%20pelo%20site%20da%20Kav%20e%20quero%20conversar%20sobre%20o%20meu%20neg%C3%B3cio.'

ARTICLES = [
    dict(slug='quanto-custa-trafego-pago-para-pequeno-negocio',
         title='Quanto custa tráfego pago para pequeno negócio?',
         desc='O que entra no custo de anunciar no Google e no Instagram, como definir um orçamento inicial e como saber se o dinheiro está dando retorno.',
         body=[
             ('p', 'A pergunta mais comum de quem pensa em anunciar é "quanto eu preciso gastar?". A resposta honesta é que existem duas contas diferentes, e misturar as duas é o que faz muita gente achar que anúncio não funciona.'),
             ('h2', 'As duas partes do custo'),
             ('p', 'A primeira é o <strong>investimento em anúncio</strong>: o dinheiro que vai direto para o Google ou para a Meta (Instagram e Facebook). A segunda é o <strong>custo de gestão</strong>: quem monta as campanhas, acompanha os números e faz os ajustes, seja uma agência, um freelancer ou você mesmo. Desconfie de quem mistura as duas em um valor só e não mostra quanto de fato foi para o anúncio.'),
             ('h2', 'Como definir o orçamento inicial'),
             ('p', 'Em vez de começar por um valor "redondo", comece por três números do seu negócio: quanto vale um cliente novo para você (lucro, não faturamento), quantos contatos você consegue transformar em venda e quanto você aguenta testar durante 30 a 60 dias sem sufocar o caixa. Se um cliente rende R$ 300 de lucro e você fecha 1 a cada 5 contatos, cada contato vale cerca de R$ 60: esse é o teto do que faz sentido pagar por contato.'),
             ('h2', 'O que acompanhar para saber se está dando retorno'),
             ('ul', ['Custo por contato (mensagem no WhatsApp, ligação ou formulário).', 'Quantos desses contatos viraram venda, o que só você sabe e a agência precisa perguntar.', 'Custo para conquistar cada cliente comparado com o lucro que ele deixa.']),
             ('p', 'Cliques e curtidas não pagam conta. Se ninguém está medindo vendas, o relatório está incompleto.'),
             ('h2', 'Erros comuns que encarecem o anúncio'),
             ('ul', ['Anunciar para a cidade inteira sem segmentar por região ou por interesse.', 'Mandar o clique para uma página confusa ou para um Instagram sem botão de contato.', 'Demorar para responder no WhatsApp: o contato que custou caro esfria em minutos.']),
             ('p', 'Se você quer saber como isso se aplicaria ao seu caso, a análise é gratuita: a gente olha seu negócio e diz com franqueza se faz sentido anunciar agora.'),
         ]),
    dict(slug='como-vender-mais-pelo-whatsapp',
         title='Como vender mais pelo WhatsApp: 6 práticas simples',
         desc='Seis práticas para transformar o WhatsApp em canal de venda: resposta rápida, mensagem de abertura, catálogo, follow-up e medição.',
         body=[
             ('p', 'Para a maioria dos pequenos negócios, o WhatsApp é onde a venda realmente acontece. O anúncio ou o Instagram trazem o contato, mas é a conversa que fecha. Estas são práticas simples que fazem diferença sem exigir ferramenta cara.'),
             ('h2', '1. Responda rápido'),
             ('p', 'Quem chama no WhatsApp geralmente está chamando outros negócios ao mesmo tempo. Quanto mais tempo passa, menor a chance de fechar. Se você não consegue responder na hora, configure uma mensagem automática de boas-vindas e, melhor ainda, um atendimento que responda fora do horário.'),
             ('h2', '2. Tenha uma mensagem de abertura clara'),
             ('p', 'A primeira resposta deve dizer quem você é, confirmar o que a pessoa quer e fazer uma pergunta que avance a conversa: "Oi! Aqui é a [nome] da [negócio]. Você procura para quando?"'),
             ('h2', '3. Use o WhatsApp Business'),
             ('p', 'O aplicativo é gratuito e permite catálogo de produtos, respostas rápidas, etiquetas para organizar clientes e perfil comercial com horário e endereço.'),
             ('h2', '4. Organize os contatos por etapa'),
             ('p', 'Use etiquetas como "novo", "orçamento enviado" e "cliente". Assim você sabe com quem falar hoje e ninguém fica esquecido.'),
             ('h2', '5. Faça follow-up'),
             ('p', 'Muita venda se perde depois do orçamento. Uma mensagem educada um ou dois dias depois ("conseguiu avaliar? posso tirar alguma dúvida?") recupera conversas que pareciam mortas.'),
             ('h2', '6. Meça o que vira venda'),
             ('p', 'Anote quantos contatos chegam, de onde vieram e quantos viram venda. Sem isso, não dá para saber se o anúncio ou o Instagram está valendo a pena.'),
             ('p', 'A Kav também monta atendimento automático no WhatsApp que responde em segundos e passa a conversa pronta para a sua equipe. Se quiser ver como funcionaria no seu negócio, peça a análise gratuita.'),
         ]),
    dict(slug='google-ads-ou-instagram-ads-qual-escolher',
         title='Google Ads ou Instagram Ads: qual escolher para o seu negócio?',
         desc='Diferença entre anunciar no Google (quem já procura) e no Instagram (quem ainda não conhece), e como decidir por onde começar.',
         body=[
             ('p', 'Não existe um canal melhor que o outro: eles resolvem problemas diferentes. A escolha depende de como o seu cliente compra.'),
             ('h2', 'Google Ads: para quem já está procurando'),
             ('p', 'No Google, o anúncio aparece quando a pessoa digita o que precisa, como "dedetização em Barueri" ou "marmitaria perto de mim". A intenção de compra já existe, então costuma funcionar bem para serviços e produtos que as pessoas pesquisam quando têm a necessidade.'),
             ('h2', 'Instagram e Facebook Ads: para quem ainda não conhece você'),
             ('p', 'Na Meta, você mostra o negócio para pessoas com o perfil do seu cliente, mesmo que elas não estejam procurando agora. Funciona bem para produtos visuais, delivery, moda, estética, alimentação e tudo que desperta desejo ao ver.'),
             ('h2', 'Como decidir por onde começar'),
             ('ul', ['Seu cliente pesquisa antes de comprar? Comece pelo Google.', 'Seu produto vende pelo olhar? Comece pelo Instagram.', 'Tem orçamento para os dois? Use o Google para capturar quem procura e o Instagram para lembrar de quem já visitou.']),
             ('h2', 'O que é igual nos dois'),
             ('p', 'Nos dois canais o resultado depende do que acontece depois do clique: se há um botão claro de WhatsApp e se a resposta é rápida. Anúncio bom com atendimento lento desperdiça dinheiro.'),
             ('p', 'Na dúvida, a gente avalia o seu caso na análise gratuita e indica por onde começar.'),
         ]),
    dict(slug='marketing-digital-para-negocios-locais',
         title='Marketing digital para negócios locais: por onde começar',
         desc='Primeiros passos para um negócio de bairro ou de cidade pequena aparecer na internet e atrair clientes da própria região.',
         body=[
             ('p', 'Negócio local vende para quem está perto. Por isso, o marketing que funciona é o que coloca o seu nome na frente de quem mora ou trabalha na sua região na hora da decisão.'),
             ('h2', '1. Deixe claro onde você atende'),
             ('p', 'Seu Instagram, seu site e seus anúncios precisam dizer a cidade ou o bairro. Se você atende só online ou em determinadas cidades, diga isso logo no começo, para a pessoa certa se identificar.'),
             ('h2', '2. Tenha um canal de contato direto'),
             ('p', 'Um botão de WhatsApp visível no Instagram e no site vale mais que um perfil bonito sem contato.'),
             ('h2', '3. Anuncie para a sua região'),
             ('p', 'Tanto no Google quanto na Meta é possível limitar o anúncio a cidades e até bairros. Isso evita gastar com quem está longe demais para comprar.'),
             ('h2', '4. Mostre prova de que você entrega'),
             ('p', 'Depoimentos, fotos de trabalhos feitos e avaliações ajudam o cliente local a confiar. Peça para clientes satisfeitos avaliarem você.'),
             ('h2', '5. Acompanhe o que vira venda'),
             ('p', 'Anote de onde vem cada cliente e quanto você investiu para trazê-lo. Com isso você decide com número, não com palpite.'),
             ('p', 'A Kav atende pequenos e médios negócios de Santana de Parnaíba, Cajamar, Barueri, Osasco e Carapicuíba, de forma 100% online.'),
         ]),
    dict(slug='como-medir-resultado-do-marketing',
         title='Como medir o resultado do marketing no seu negócio',
         desc='Os poucos números que importam para saber se o marketing está dando retorno: custo por contato, taxa de venda e custo por cliente.',
         body=[
             ('p', 'Muita gente acompanha curtidas, alcance e seguidores e continua sem saber se o marketing compensa. Para decidir bem, bastam poucos números.'),
             ('h2', 'Os três números que importam'),
             ('ul', ['<strong>Custo por contato:</strong> quanto você gastou em anúncio dividido pelo número de contatos (mensagens, ligações, formulários).', '<strong>Taxa de venda:</strong> de cada 10 contatos, quantos viram cliente.', '<strong>Custo por cliente:</strong> quanto você gastou para conquistar cada cliente novo.']),
             ('h2', 'Como ligar o marketing à venda'),
             ('p', 'Pergunte a todo cliente novo como ele chegou até você e anote. Se atende pelo WhatsApp, use etiquetas por origem. Para sites e formulários, ferramentas como Google Tag Manager e Meta Pixel registram os contatos gerados por cada anúncio.'),
             ('h2', 'Compare com o lucro'),
             ('p', 'O custo por cliente só faz sentido comparado com o lucro que o cliente deixa. Se o cliente deixa R$ 200 de lucro e custa R$ 80 para ser conquistado, a conta fecha. Se custa R$ 250, é hora de ajustar.'),
             ('h2', 'Com que frequência olhar'),
             ('p', 'Semanalmente para ajustar anúncios e mensalmente para decidir investimento. A Kav entrega relatórios simples, em linguagem de dono, exatamente com esses números.'),
         ]),
]


def shell(title, desc, url, body, extra_head='', robots='index, follow, max-image-preview:large', breadcrumb=None):
    footer_cities = ''.join(f'<li><a href="/{c["slug"]}/">{esc(c["name"])}</a></li>' for c in CITIES)
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="robots" content="{robots}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Kav">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="{SITE}/assets/img/og-kav.jpg">
  <meta name="twitter:card" content="summary_large_image">
{extra_head}  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="{FONTS}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="{FONTS}"></noscript>
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
      <a href="{WA_URL}" class="btn btn-whatsapp-primary cp-wa" target="_blank" rel="noopener noreferrer"><span>Falar no WhatsApp</span></a>
    </div>
  </header>
  <main>
{body}
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


def render_body(items):
    out = []
    for kind, val in items:
        if kind == 'p':
            out.append(f'<p>{val}</p>')
        elif kind == 'h2':
            out.append(f'<h2>{esc(val)}</h2>')
        elif kind == 'ul':
            out.append('<ul>' + ''.join(f'<li>{v}</li>' for v in val) + '</ul>')
    return '\n'.join(out)


def write(path, content):
    d = os.path.join(ROOT, path)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(content)


def article_page(a):
    url = f"{SITE}/blog/{a['slug']}/"
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'BlogPosting', 'headline': a['title'], 'description': a['desc'], 'mainEntityOfPage': url,
         'datePublished': TODAY, 'dateModified': TODAY, 'inLanguage': 'pt-BR',
         'author': {'@type': 'Person', 'name': 'Kesley Sampaio'},
         'publisher': {'@type': 'Organization', 'name': 'Kav', 'url': SITE + '/'},
         'image': f'{SITE}/assets/img/og-kav.jpg'},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': SITE + '/blog/'},
            {'@type': 'ListItem', 'position': 3, 'name': a['title'], 'item': url}]}]}, ensure_ascii=False, indent=2)
    others = [x for x in ARTICLES if x['slug'] != a['slug']][:3]
    more = ''.join(f'<li><a href="/blog/{x["slug"]}/">{esc(x["title"])}</a></li>' for x in others)
    body = f'''    <article class="cp-section ex-article">
      <div class="container ex-narrow">
        <nav class="cp-breadcrumb" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">›</span><a href="/blog/">Blog</a></nav>
        <h1>{esc(a['title'])}</h1>
        <p class="ex-meta">Por Kesley Sampaio, sócio da Kav · {datetime.date.fromisoformat(TODAY).strftime('%d/%m/%Y')}</p>
        {render_body(a['body'])}
        <div class="ex-cta"><h2>Quer ver isso aplicado ao seu negócio?</h2><p>Análise gratuita, sem compromisso e sem papo de vendedor.</p>
          <a href="{WA_URL}" class="btn btn-whatsapp-primary" target="_blank" rel="noopener noreferrer"><span>Falar no WhatsApp</span></a>
          <a href="/#analise" class="btn btn-secondary"><span>Pedir análise gratuita</span></a></div>
        <h3 class="ex-more-title">Continue lendo</h3>
        <ul class="ex-more">{more}</ul>
      </div>
    </article>'''
    return shell(f"{a['title']} | Kav", a['desc'], url, body, extra_head=f'  <script type="application/ld+json">\n{ld}\n  </script>\n')


def blog_index():
    url = SITE + '/blog/'
    cards = ''.join(f'<a class="cp-card ex-post" href="/blog/{a["slug"]}/"><h2>{esc(a["title"])}</h2><p>{esc(a["desc"])}</p><span>Ler artigo →</span></a>' for a in ARTICLES)
    body = f'''    <section class="cp-hero"><div class="container ex-narrow-wide">
      <nav class="cp-breadcrumb" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">›</span><span>Blog</span></nav>
      <h1>Blog da Kav: marketing para quem quer vender mais</h1>
      <p class="cp-lead">Conteúdo direto, sem jargão, para pequenos e médios negócios que querem mais clientes.</p>
    </div></section>
    <section class="cp-section"><div class="container"><div class="cp-grid cp-grid-2">{cards}</div></div></section>'''
    return shell('Blog | Marketing para pequenos negócios | Kav',
                 'Artigos sobre tráfego pago, WhatsApp, Google Ads, Instagram e marketing local para pequenos e médios negócios.', url, body)


def privacy():
    url = SITE + '/politica-de-privacidade/'
    body = f'''    <article class="cp-section ex-article"><div class="container ex-narrow">
      <h1>Política de privacidade</h1>
      <p class="ex-meta">Última atualização: {datetime.date.fromisoformat(TODAY).strftime('%d/%m/%Y')}</p>
      <p>Esta política explica como a Kav (agenciakav.com.br) trata os dados pessoais de quem visita o site e entra em contato, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, a LGPD).</p>
      <h2>Quem é o controlador dos dados</h2>
      <p>Kav, agência de marketing 100% online. Contato: <a href="mailto:somoskav@gmail.com">somoskav@gmail.com</a> e WhatsApp (11) 96640-5634.</p>
      <h2>Quais dados coletamos</h2>
      <ul>
        <li><strong>Formulário de análise gratuita:</strong> nome, WhatsApp, e-mail (se informado), nome da empresa, tipo de negócio, faixa de faturamento e principal desafio.</li>
        <li><strong>Conversa pelo WhatsApp:</strong> as informações que você mesmo enviar.</li>
        <li><strong>Dados de navegação (somente se você aceitar os cookies de medição):</strong> páginas visitadas, origem do acesso e dispositivo, coletados por ferramentas como Google Tag Manager e Meta Pixel.</li>
      </ul>
      <h2>Para que usamos</h2>
      <ul>
        <li>Responder ao seu pedido de contato e fazer a análise do seu negócio.</li>
        <li>Medir quais campanhas geram contatos e melhorar o site e os anúncios.</li>
        <li>Cumprir obrigações legais, quando necessário.</li>
      </ul>
      <p>As bases legais são o seu consentimento (cookies de medição), a execução de procedimentos preliminares a um contrato (quando você pede uma análise) e o legítimo interesse (melhoria do site).</p>
      <h2>Cookies</h2>
      <p>Usamos apenas o armazenamento necessário para guardar a sua escolha sobre cookies. Os cookies de medição (Google e Meta) só são carregados se você clicar em "Aceitar". Você pode mudar de ideia a qualquer momento limpando os dados do site no navegador ou clicando em "Gerenciar cookies" no rodapé.</p>
      <h2>Com quem compartilhamos</h2>
      <p>Os dados do formulário são entregues por e-mail à Kav por meio do serviço FormSubmit. Ferramentas de medição (Google e Meta) recebem dados de navegação apenas com o seu consentimento. Não vendemos dados pessoais.</p>
      <h2>Por quanto tempo guardamos</h2>
      <p>Pelo tempo necessário para atender o seu pedido e manter o relacionamento comercial, ou até você pedir a exclusão.</p>
      <h2>Seus direitos</h2>
      <p>Você pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade, exclusão dos dados e revogação do consentimento. Escreva para <a href="mailto:somoskav@gmail.com">somoskav@gmail.com</a>.</p>
      <h2>Alterações</h2>
      <p>Podemos atualizar esta política. A data da última atualização fica sempre no topo desta página.</p>
    </div></article>'''
    return shell('Política de privacidade | Kav', 'Como a Kav trata dados pessoais, cookies e contatos feitos pelo site, conforme a LGPD.', url, body)


def thanks():
    url = SITE + '/obrigado/'
    body = f'''    <section class="cp-hero ex-thanks"><div class="container ex-narrow-wide">
      <span class="cp-tag">Pedido recebido</span>
      <h1>Obrigado! Já recebemos o seu pedido.</h1>
      <p class="cp-lead">Vamos analisar o seu negócio e chamar você no WhatsApp em breve. Se quiser adiantar a conversa, é só clicar abaixo.</p>
      <div class="cp-actions"><a href="{WA_URL}" class="btn btn-whatsapp-primary" target="_blank" rel="noopener noreferrer"><span>Falar agora no WhatsApp</span></a>
      <a href="/blog/" class="btn btn-secondary"><span>Ler o blog enquanto isso</span></a></div>
    </div></section>'''
    return shell('Obrigado | Kav', 'Recebemos o seu pedido de análise gratuita.', url, body, robots='noindex, follow')


if __name__ == '__main__':
    write('politica-de-privacidade', privacy())
    write('obrigado', thanks())
    write('blog', blog_index())
    for a in ARTICLES:
        write(f"blog/{a['slug']}", article_page(a))
    urls = [(f'{SITE}/', '1.0')] + [(f"{SITE}/{c['slug']}/", '0.8') for c in CITIES] + [(f'{SITE}/blog/', '0.7')] \
        + [(f"{SITE}/blog/{a['slug']}/", '0.6') for a in ARTICLES] + [(f'{SITE}/politica-de-privacidade/', '0.3')]
    body = ''.join(f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{p}</priority>\n  </url>\n' for u, p in urls)
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n')
    print('ok:', len(urls), 'urls no sitemap')
