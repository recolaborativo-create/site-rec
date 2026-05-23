// Partner directory — 84 companies in the REC ecosystem.
// Display names and Instagram handles refined from the current somosrecoficial.com.br/nossa-rede page.
// Sectors are best-guess; refine as Henrique provides metadata.

export type PartnerSector =
  | 'beleza'
  | 'saude'
  | 'educacao'
  | 'gastronomia'
  | 'contabilidade'
  | 'advocacia'
  | 'marketing'
  | 'tech'
  | 'consultoria'
  | 'arquitetura'
  | 'eventos'
  | 'moda'
  | 'imoveis'
  | 'turismo'
  | 'servicos'
  | 'outro'

export interface Partner {
  id: string
  name: string
  instagram?: string
  /** WhatsApp em formato internacional sem +, ex: '5551984838828' */
  whatsapp?: string
  /** Telefone fixo (BR), só dígitos, ex: '5132225555' */
  phone?: string
  sector: PartnerSector
  reach: 1 | 2 | 3 | 4 | 5
  logo: string
  related?: string[]
  /** Up to ~200 chars. Empty/undefined renders "descrição em breve". */
  description?: string
  /** Cidade da empresa. Ex: 'Porto Alegre, RS'. */
  city?: string
  /** Query alternativa pro Google Places quando o nome puro não resolve. */
  googleSearchOverride?: string
  /** Se true: empresa não tem ficha no Google Maps — esconde toda seção de avaliações no modal. */
  hideGoogle?: boolean
  /** Nota média do Google Maps (0-5). */
  googleRating?: number
  /** Quantidade de avaliações no Google Maps. */
  googleReviewsCount?: number
  /** URL do listing no Google Maps. */
  googleMapsUrl?: string
  /** Até 2 reviews destacadas (snippet curto), exibidas no modal. */
  googleReviews?: Array<{ author: string; rating: number; text: string }>
  /** Endereço completo da empresa (geralmente vindo do Google). */
  address?: string
  /** Site oficial da empresa. */
  website?: string
}

/** Versão serializada/client-side do Partner — usada nos script blocks dos componentes de filtro. */
export type PartnerLite = {
  id: string; name: string; logo: string; sector: string; sectorLabel?: string;
  instagram?: string; whatsapp?: string; phone?: string; description?: string; city?: string;
  address?: string; website?: string; hideGoogle?: boolean;
  googleRating?: number; googleReviewsCount?: number; googleMapsUrl?: string;
  googleReviews?: Array<{ author: string; rating: number; text: string }>;
}

export const partners: Partner[] = [
  { id: 'adegas-vinas', name: 'Adega Viñas', instagram: '@adega_vinas', phone: '5551996048685', sector: 'gastronomia', reach: 3, logo: '/partners/banners-site-adegas-vinas-200x120.png', description: 'Adega com curadoria de vinhos selecionados e experiências autênticas pra quem aprecia rótulos de qualidade.', googleSearchOverride: 'Adega Vinas Canoas' , whatsapp: '5551999198737', website: 'https://www.adegavinas.com.br/', city: 'Canoas, RS'},
  { id: 'bela-clean', name: 'Bella Clean', instagram: '@bellaclean1', sector: 'servicos', reach: 3, logo: '/partners/banners-site-bela-clean-200x120.png', description: 'Higienização e impermeabilização de estofados, tapetes e veículos. Limpeza profunda, resultado visível.' , whatsapp: '5551984972050'},
  { id: 'desafio', name: 'Desafio Cada Dia Melhor', instagram: '@desafiocadadiamelhor', sector: 'saude', reach: 3, logo: '/partners/banners-site-desafio-200x120.png', description: 'Programa de transformação com foco em saúde, emagrecimento e bem-estar. Desafio diário pra evoluir junto.' , hideGoogle: true, whatsapp: '5551984632545', website: 'https://desafiocadadiamelhor.com.br/', city: 'Canoas, RS'},
  { id: 'domicio', name: 'Domício Redes de Proteção', sector: 'servicos', reach: 3, logo: '/partners/banners-site-domicio-200x120.png', description: 'Redes de proteção pra janelas, sacadas, escadas e quadras. Segurança discreta que combina com qualquer ambiente.' , instagram: '@domicioredesdeprotecao', whatsapp: '5551998722299'},
  { id: 'gavion', name: 'Gavion Contabilidade', instagram: '@gavioncontabilidade', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site-gavion-200x120.png', description: 'Contabilidade ágil pra pequenas e médias empresas, com foco em estratégia tributária e crescimento estruturado.' , whatsapp: '5551996161377'},
  { id: 'kumon', name: 'Kumon Canoas', instagram: '@kumoncanoas', sector: 'educacao', reach: 3, logo: '/partners/banners-site-KUMON-200x120.png', description: 'Método Kumon de matemática e português, desenvolvendo autonomia, raciocínio e disciplina em crianças e jovens.' , whatsapp: '5551999515254'},
  { id: 'leuck', name: 'Leuck', sector: 'servicos', reach: 3, logo: '/partners/banners-site-LEUCK-200x120.png', description: 'Serviços especializados com atendimento personalizado e resultados confiáveis pra empresas e profissionais.' , instagram: '@leuckihp', whatsapp: '5551985856887'},
  { id: 'midia-na-mesa', name: 'Mídia na Mesa', instagram: '@midianamesa', sector: 'marketing', reach: 3, logo: '/partners/banners-site-midia-na-mesa-200x120.png', description: 'Plataforma de mídia sustentável especializada em food service. Anúncios em saco de pão que chegam direto na mesa.', hideGoogle: true , whatsapp: '5551984632545', website: 'https://midianamesa.com.br/', city: 'Canoas, RS'},
  { id: 'mistyura', name: 'Farmácia Mistura', instagram: '@mistura_farmacia', sector: 'saude', reach: 3, logo: '/partners/banners-site-mistyura-200x120.png', description: 'Farmácia de manipulação com formulação personalizada, saúde, beleza e bem-estar feitos pra você.' , whatsapp: '5551997243422'},
  { id: 'nova-era', name: 'Nova Era Brindes', instagram: '@novaerabrindes', sector: 'servicos', reach: 3, logo: '/partners/banners-site-nova-era-200x120.png', description: 'Brindes corporativos e materiais promocionais criativos pra fortalecer a presença e o relacionamento da sua marca.' , phone: '555132415262', whatsapp: '5551992548687'},
  { id: 'regiane', name: 'Dra. Regiane Pereira', instagram: '@dra.regianepereira', sector: 'saude', reach: 3, logo: '/partners/banners-site-regiane-200x120.png', description: 'Atendimento médico humanizado, com foco em prevenção, saúde integral e qualidade de vida da mulher.' , whatsapp: '5551995216688'},
  { id: 'sos-canos-info', name: 'Sos Canoas Informática', instagram: '@soscanoas', sector: 'tech', reach: 3, logo: '/partners/banners-site-sos-canos-info-200x120.png', description: 'Assistência técnica, manutenção e venda de equipamentos de informática. Tecnologia que resolve.' , whatsapp: '5551991281613'},
  { id: 'tenax', name: 'Tenax Marcas', instagram: '@tenaxmarcas', sector: 'marketing', reach: 3, logo: '/partners/banners-site-tenax-200x120.png', description: 'Branding e gestão de marca, estratégia de posicionamento pra empresas que querem ser lembradas.' , whatsapp: '5551984488949'},

  { id: '360', name: 'Gestum 360º Assessoria Contábil', instagram: '@tavianealvescontadora', phone: '5551983333774', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-360-200x120.png', description: 'Contabilidade consultiva 360° com Taviane Alves. Da abertura ao crescimento do seu negócio com estratégia e atendimento próximo.', googleSearchOverride: 'Gestum 360 Assessoria Contabil Canoas' , whatsapp: '555137858814'},
  { id: 'andressa', name: 'Andressa Boneto Contabilidade Digital', instagram: '@andressaboneto.contadora', phone: '5551994544093', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-andressa-200x120.png', description: 'Contadora dedicada à saúde fiscal de empresas e profissionais. Atendimento próximo, claro e estratégico.', googleSearchOverride: 'Andressa Boneto Contabilidade Canoas RS' , whatsapp: '5551994544093', city: 'Canoas, RS'},
  { id: 'baby-200x119png', name: 'Baby Plays', instagram: '@babyplays.brinquedos', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-baby-200x119.png', description: 'Brinquedos pedagógicos e itens infantis selecionados pra estimular desenvolvimento e brincadeira consciente.' , whatsapp: '5551981177297'},
  { id: 'cibele', name: 'Cibele Reis Finanças', instagram: '@cibelejreis.financas', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-cibele-200x120.png', description: 'Educação financeira e organização das finanças pessoais e empresariais com a Cibele Reis.' , whatsapp: '5551996166696', hideGoogle: true, website: 'https://cjrfinancas.com/', city: 'Tramandaí, RS'},
  { id: 'ciclojoel', name: 'Ciclo Joel', instagram: '@ciclojel', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-ciclojoel-200x120.png', description: 'Bicicletas, peças e manutenção. Tudo pra quem ama pedalar, com atendimento técnico de confiança.' , whatsapp: '5551981376599'},
  { id: 'cressol', name: 'Cresol Gerações', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-cressol-200x120.png', description: 'Cooperativa de crédito Cresol, soluções financeiras com cara de gente e propósito de gerar valor local.' , whatsapp: '5555984426261', instagram: '@cresolriograndedosul', website: 'https://cresol.com.br/', city: 'Canoas, RS'},
  { id: 'doce-amargo', name: 'Doce Amargo', instagram: '@doceamargo.at', sector: 'gastronomia', reach: 3, logo: '/partners/banners-site1-doce-amargo-200x120.png', description: 'Confeitaria autoral com criações únicas em sabor e apresentação. Doces que contam histórias.' , hideGoogle: true, city: 'Esteio, RS'},
  { id: 'doterra', name: 'doTERRA - Pritha', instagram: '@pritha_doterra', sector: 'saude', reach: 3, logo: '/partners/banners-site1-doterra-200x120.png', description: 'Óleos essenciais doTERRA com a consultora Pritha, bem-estar natural pra rotina, família e ambiente.' , hideGoogle: true, website: 'https://www.doterra.com/BR/pt_BR', city: 'Esteio, RS'},
  { id: 'flores-patricia-consorcios', name: 'Patrícia Consórcios', instagram: '@patricia.consorcios', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-flores-patricia-consorcios-200x120.png', description: 'Consórcio de imóveis, veículos e serviços com planejamento certo pra realizar seus objetivos.' , hideGoogle: true, whatsapp: '5551984315550', city: 'Porto Alegre, RS'},
  { id: 'fly', name: 'Fly Estratégias Digitais', instagram: '@flyestrategiasdigitais', sector: 'marketing', reach: 4, logo: '/partners/banners-site1-fly-200x120.png', description: 'Estratégias digitais que viram resultado: gestão de tráfego, conteúdo e posicionamento de marca.' , hideGoogle: true, whatsapp: '5551984632545', city: 'Canoas, RS'},
  { id: 'foco-personalizados', name: 'Foco Personalizados', instagram: '@foco_personalizados', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-foco-personalizados-200x120.png', description: 'Personalização criativa, canecas, camisetas, brindes corporativos e tudo que sua marca pede.' , whatsapp: '5551993003116', website: 'https://shopee.com.br/foco_personalizadoss'},
  { id: 'mef-psico', name: 'M & F Clínica de Psicologia', instagram: '@mfpsicologia.rs', sector: 'saude', reach: 3, logo: '/partners/banners-site1-mef-psico-200x120.png', description: 'Clínica de psicologia com atendimento individual, casal e família. Apoio profissional, ético e acolhedor.' , whatsapp: '5551983142209', website: 'https://beacons.ai/mfpsicologia'},
  { id: 'memoraveis', name: 'Memoráveis Workshop', instagram: '@memoraveis.workshop', sector: 'eventos', reach: 3, logo: '/partners/banners-site1-memoraveis-200x120.png', description: 'Workshops e eventos imersivos pra empresas que valorizam experiência, conexão e aprendizado real.' , hideGoogle: true, website: 'https://materiais.somosklik.com.br/memoraveis-marco', city: 'Canoas, RS'},
  { id: 'mistura', name: 'Mistura Gastronomia', instagram: '@misturagastronomia', phone: '5551998877749', sector: 'eventos', reach: 4, logo: '/partners/banners-site1-mistura-200x120.png', description: 'Gastronomia e organização de eventos sob medida. Buffet, espaço e atendimento que marcam memória do começo ao fim.', googleSearchOverride: 'Mistura Gastronomia Eventos Canoas' , whatsapp: '5551998877749', city: 'Canoas, RS'},
  { id: 'seibras', name: 'Seibras Estágios', instagram: '@seibrasestagios', sector: 'educacao', reach: 3, logo: '/partners/banners-site1-seibras-200x120.png', description: 'Agente de integração de estágios, conexão entre estudantes e empresas com toda a base legal cuidada.' , phone: '555132280744', whatsapp: '5551992876656'},
  { id: 'zannata', name: 'Zanatta Seguros', instagram: '@zanattaseguros', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-zannata-200x120.png', description: 'Corretora de seguros completa, auto, vida, residencial e empresarial. Proteção sob medida pra cada cliente.' , whatsapp: '555189112809'},

  { id: 'gui-imoveis', name: 'O Guia Imóveis', instagram: '@oguiaimoveis', phone: '5551992074072', sector: 'imoveis', reach: 3, logo: '/partners/banners-sitegui-imoveis-200x120.png', description: 'Mídia em Canoas com curadoria de imóveis pra você comprar, vender ou alugar com segurança e atendimento próximo.', googleSearchOverride: 'O Guia Imóveis Canoas Centro' , whatsapp: '5551992074072', city: 'Canoas, RS'},

  { id: 'abm', name: 'ABM Sublimados', instagram: '@abmsublimados', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-ABM-200x120.png', description: 'Sublimação e personalização de produtos com agilidade e qualidade. Brindes, uniformes e presentes feitos pra surpreender.' , whatsapp: '555199331695'},
  { id: 'advogado', name: 'Schaff & Zambonin Advocacia', instagram: '@jpschaff.adv', phone: '5551985243145', sector: 'advocacia', reach: 3, logo: '/partners/LOGOS-SITE-advogado-200x120.png', description: 'Advocacia e consultoria jurídica empresarial, contratos e família. Soluções claras, estratégicas e focadas em resultado.', googleSearchOverride: 'Schaff Zambonin Advocacia Canoas RS' , whatsapp: '5551985243145', website: 'https://schaffezamboninadv.online/', city: 'Canoas, RS'},
  { id: 'atitude', name: 'Atitude Transportes', instagram: '@attitudetransportes', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-atitude-200x120.png', description: 'Transporte executivo e fretamento corporativo, pontualidade, conforto e atendimento sob medida.' , whatsapp: '5511947997623', city: 'Canoas, RS'},
  { id: 'ativa', name: 'Ativa Medicina', instagram: '@ativa.medicina', sector: 'saude', reach: 4, logo: '/partners/LOGOS-SITE-ATIVA-200x120.png', description: 'Clínica de medicina integrativa com foco em prevenção, saúde da mulher e qualidade de vida.' , phone: '555132262177', whatsapp: '5551992118421'},
  { id: 'bendita', name: 'Bendita Planta Bio', instagram: '@benditaplantabio', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-BENDITA-200x120.png', description: 'Biocosméticos artesanais à base de plantas. Beleza natural, ética e com propósito ambiental.' , hideGoogle: true, whatsapp: '5551996975410', website: 'https://benditaplanta.com.br/', city: 'Porto Alegre, RS'},
  { id: 'cintia-mendes', name: 'Cíntia Mendes', instagram: '@cinttia.mendes', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-cintia-mendes-200x120.png', description: 'Consultoria personalizada, atendimento próximo e soluções pensadas pra sua realidade.' , whatsapp: '5551984117504'},
  { id: 'clinica-schaff', name: 'Clínica Schaff', instagram: '@clinicaschaff', sector: 'saude', reach: 4, logo: '/partners/LOGOS-SITE-CLINICA-SCHAFF-200x120.png', description: 'Clínica multidisciplinar com atendimento integrado em estética avançada, bem-estar e harmonia facial.' , whatsapp: '5551983000125'},
  { id: 'di-tour', name: 'Di Tour Viagens', instagram: '@ditour_viagens', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-di-tour-200x120.png', description: 'Viagens nacionais e internacionais com roteiros únicos, atendimento humano e tudo planejado pra você.' , whatsapp: '5551994818694'},
  { id: 'executiva-1', name: 'Executiva - Viagens, Eventos e Turismo', instagram: '@executivalocacoes', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-executiva-1-200x120.png', description: 'Viagens, eventos corporativos e turismo executivo, organização completa do começo ao fim.' , whatsapp: '5551996235568'},
  { id: 'fire', name: 'Empower Fire', instagram: '@empower_fire', sector: 'saude', reach: 3, logo: '/partners/LOGOS-SITE-fire-200x120.png', description: 'Treino funcional e empoderamento físico, Empower Fire transforma corpo e mente em movimento.' , hideGoogle: true, whatsapp: '5551982894024', city: 'Canoas, RS'},
  { id: 'flor-e-ser', name: 'Flor & Ser Bem Estar', instagram: '@floreserbemestar', sector: 'saude', reach: 3, logo: '/partners/LOGOS-SITE-flor-e-ser-200x120.png', description: 'Espaço de bem-estar e terapias integrativas. Cuidado completo pra equilíbrio físico, mental e emocional.' , whatsapp: '5551980817460', website: 'https://bio.site/floreserbemestar'},
  { id: 'fraga', name: 'Fraga & Santos Arquitetura', instagram: '@arq.veronicafraga', sector: 'arquitetura', reach: 3, logo: '/partners/LOGOS-SITE-fraga-200x120.png', description: 'Arquitetura residencial e comercial assinada por Verônica Fraga, projetos com identidade e função.' , whatsapp: '5551981821905'},
  { id: 'iconstru', name: 'IConstru Engenharia', instagram: '@iconstruengenharia', sector: 'arquitetura', reach: 3, logo: '/partners/LOGOS-SITE-iconstru-200x120.png', description: 'Engenharia e gerenciamento de obras, construção e reforma com qualidade técnica e prazo cumprido.' , whatsapp: '5551992579008'},
  { id: 'inova', name: 'Studio Innova', instagram: '@studioinnovanh', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-inova-200x120.png', description: 'Studio Innova, estética avançada, beleza integral e tratamentos que valorizam sua melhor versão.' , whatsapp: '5551998727485', website: 'https://linktr.ee/studioinnovanh'},
  { id: 'jaque', name: 'Jaque Neckel', instagram: '@jaqueneckel', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-jaque-200x120.png', description: 'Criadora de conteúdo e facilitadora de experiências contemporâneas. UGC, Sound Healing e comunicação que conecta.', hideGoogle: true , whatsapp: '5551999532722', city: 'Porto Alegre, RS'},
  { id: 'karam-adv', name: 'Karam Advocacia', instagram: '@karam.advocacia', sector: 'advocacia', reach: 3, logo: '/partners/LOGOS-SITE-karam-adv-200x120.png', description: 'Advocacia preventiva e estratégica em direito civil, empresarial e família, apoio jurídico pra tranquilidade.' , whatsapp: '5551982128328'},
  { id: 'la-rosa', name: "La Rosa's Floricultura", instagram: '@floriculturacanoaslarosas', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-la-rosa-200x120.png', description: 'Floricultura e arranjos pra todas as ocasiões, flores frescas, presentes e decoração com afeto.' , hideGoogle: true, whatsapp: '5551991579017', website: 'https://larosasfloricultura.com.br/', city: 'Canoas, RS'},
  { id: 'liarche', name: 'Liarche Consultoria', instagram: '@liarchedh', sector: 'consultoria', reach: 3, logo: '/partners/LOGOS-SITE-LIARCHE-200x120.png', description: 'Consultoria em desenvolvimento humano e gestão de pessoas, times mais fortes começam aqui.' , hideGoogle: true, whatsapp: '5551980638065', city: 'Porto Alegre, RS'},
  { id: 'lidiane-avila', name: 'Lidiane Ávila Fotografia', instagram: '@lidianeavilafotografia', phone: '5551997943109', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-lidiane-avila-200x120.png', description: 'Especialista em contar a história de mulheres reais através da fotografia. Ensaios femininos, gestantes e marca pessoal.', googleSearchOverride: 'Lidiane Ávila Fotografia Canoas' , hideGoogle: true, whatsapp: '5551997943109', city: 'Estância Velha, RS'},
  { id: 'luna', name: 'Luna Lu Doceria', instagram: '@lunaludoceria', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-LUNA-200x120.png', description: 'Doceria autoral Luna Lu, bolos, sobremesas e doces especiais pra adoçar momentos.' , hideGoogle: true, whatsapp: '5551995852545', website: 'https://www.zenlink.com.br/site/13t08', city: 'Cachoeirinha, RS'},
  { id: 'nexx', name: 'Nexx BPO Financeiro', instagram: '@nexxbpofinanceiro', sector: 'contabilidade', reach: 3, logo: '/partners/LOGOS-SITE-nexx-200x120.png', description: 'BPO financeiro completo, com terceirização da gestão financeira pra empresas focarem no que realmente importa pra crescer.', googleSearchOverride: 'Nexx BPO Financeiro Canoas RS' , hideGoogle: true, whatsapp: '5553999474734', city: 'Porto Alegre, RS'},
  { id: 'nucleo', name: 'Núcleo GRC', instagram: '@nucleogrc', sector: 'consultoria', reach: 3, logo: '/partners/LOGOS-SITE-NUCLEO-200x120.png', description: 'Consultoria em governança, riscos e compliance, pra empresas que querem crescer com solidez.' , hideGoogle: true, whatsapp: '5551984459781', website: 'https://www.nucleogrc.com.br/', city: 'Porto Alegre, RS'},
  { id: 'organizacao', name: 'Organização Plena', instagram: '@organizacao.plena', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-ORGANIZACAO-200x120.png', description: 'Organização profissional de ambientes, casa, escritório e rotinas mais funcionais e leves.' , hideGoogle: true, whatsapp: '5551993526121', city: 'Porto Alegre, RS'},
  { id: 'paola', name: 'Paola Mróz Social Media & Designer', instagram: '@paolamrozmkt', phone: '5551991486165', sector: 'marketing', reach: 3, logo: '/partners/LOGOS-SITE-PAOLA-200x120.png', description: 'Social Media e Designer Visual. Consultoria em marketing, gestão de marca e posicionamento digital com identidade.', googleSearchOverride: 'Paola Mroz Social Media Porto Alegre' , whatsapp: '5551991486165', city: 'Canoas, RS'},
  { id: 'pimenta', name: 'Pimenta de Cheiro', instagram: '@cheiro.pimentade', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-pimenta-200x120.png', description: 'Tempero, sabor e história, produtos artesanais com cara de casa, feitos pra realçar a sua mesa.' , whatsapp: '5551991523293', website: 'https://pimentavariedades.com/', city: 'Esteio, RS'},
  { id: 'raupp', name: 'Raupp Consultoria Contábil', instagram: '@rauppcontabil', sector: 'contabilidade', reach: 3, logo: '/partners/LOGOS-SITE-raupp-200x120.png', description: 'Consultoria contábil estratégica pra empresários que querem clareza nos números e crescimento estruturado.' , whatsapp: '5551981916216'},
  { id: 'rhf', name: 'RHF Talentos', instagram: '@rhfcanoas_mrondon', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-rhf-200x120.png', description: 'Maior rede de franquias de RH do Brasil. Recrutamento, seleção, gestão de estagiários e plano de cargos pra empresas.', googleSearchOverride: 'RHF Talentos Canoas Av Getúlio Vargas' , hideGoogle: true, whatsapp: '555192876656', city: 'Canoas, RS'},
  { id: 'rocsana', name: 'Rocsana - Turismo Terapêutico', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-rocsana-200x120.png', description: 'Turismo terapêutico, viagens com propósito de bem-estar, autoconhecimento e conexão verdadeira.' , instagram: '@rocsanatrautmann', whatsapp: '5551992964585', hideGoogle: true, city: 'Canela, RS'},
  { id: 's2', name: 'S2 Assessoria Estudantil Internacional', instagram: '@s2_estudantil', phone: '551195316709', sector: 'educacao', reach: 3, logo: '/partners/LOGOS-SITE-s2-200x120.png', description: 'Consultoria educacional pra brasileiros que querem estudar Medicina na Argentina. Matrícula, moradia e adaptação cuidadas.', googleSearchOverride: 'S2 Assessoria Estudantil Internacional Ltda Rosario Argentina' , whatsapp: '5511953167093', city: 'Novo Hamburgo, RS'},
  { id: 'sandra', name: 'Sandra Colleoni', instagram: '@sandra.colleoni', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-sandra-200x120.png', description: 'Atendimento sob medida com Sandra Colleoni, soluções pensadas pra cada cliente, com cuidado e atenção.' , whatsapp: '5551995593015'},
  { id: 'sheila', name: 'Estúdio Sheila Luz', instagram: '@estudiosheilaluz', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-SHEILA-200x120.png', description: 'Estúdio de beleza assinado por Sheila Luz, micropigmentação, design e cuidados que valorizam você.' , whatsapp: '5551993555397'},
  { id: 'superfantastico', name: 'Superfantástico - Salão de Festas', instagram: '@superfantasticofestas', sector: 'eventos', reach: 3, logo: '/partners/LOGOS-SITE-superfantastico-200x120.png', description: 'Salão de festas Superfantástico, espaço completo pra aniversários, casamentos e celebrações marcantes.' , whatsapp: '5551993555397'},

  { id: 'preto-renatta-200x96png', name: 'Renatta Hoher Advocacia', instagram: '@renattahoheradv', sector: 'advocacia', reach: 3, logo: '/partners/preto-renatta-200x96.png', description: 'Renatta Hoher Advocacia, direito criminal com atuação estratégica, técnica e defesa firme.' , whatsapp: '5551999125707'},

  // === Empresas adicionadas em mai/2026 ===
  {
    id: 'iz-english',
    name: 'IZ English Escola de Inglês',
    instagram: '@iz.englishschool',
    whatsapp: '555199123141',
    phone: '555191331414',
    sector: 'educacao',
    reach: 3,
    logo: '/partners/LOGOS-SITE-iz-english-200x120.png',
    description: 'Inglês definitivo pra sua carreira. Aulas online com estrutura de escola séria pra adultos, método validado e agenda nivelando.',
    city: 'Porto Alegre, RS',
    googleSearchOverride: 'IZ English Porto Alegre',
    website: 'https://izenglish.com.br/',
  },
  {
    id: 'doutora-contratos',
    name: 'Doutora Contratos',
    instagram: '@doutoracontratos',
    sector: 'advocacia',
    reach: 3,
    logo: '/partners/LOGOS-SITE-doutora-contratos-200x120.jpg',
    description: 'Inovação na forma de oferecer serviços jurídicos: contratos vendidos como produto profissional, personalizado, visualmente moderno e com excelente custo-benefício.',
    hideGoogle: true,
    whatsapp: '5551980505002',
    city: 'Cachoeirinha',
  },
  {
    id: 'vanessa-mendes',
    name: 'Vanessa Mendes — Centro de Desenvolvimento Emocional',
    instagram: '@clinicavanessamendespsicologia',
    whatsapp: '5551994842333',
    sector: 'saude',
    reach: 3,
    logo: '/partners/LOGOS-SITE-vanessa-mendes-200x120.png',
    description: 'Centro de psicologia e desenvolvimento emocional para crianças, adolescentes, adultos e casais. Atendimento clínico, avaliações e psicoterapia.',
    city: 'Porto Alegre, RS',
  },
  {
    id: 'rossana-machado',
    name: 'Rossana Machado — Mediação Parental',
    sector: 'consultoria',
    reach: 3,
    logo: '/partners/LOGOS-SITE-rossana-machado-200x120.png',
    description: 'Mediação parental, apoio para famílias em processos de separação ou conflitos, focando no bem-estar dos filhos e na construção de acordos saudáveis.',
    hideGoogle: true,
    instagram: '@girassolmedparental',
    whatsapp: '5551982405108',
    website: 'https://girassolmediacaoparental.com.br/',
    city: 'Canoas',
  },
  {
    id: 'appe-go',
    name: 'appê.go Governança Imobiliária',
    instagram: '@imobiliaria_appe.go',
    whatsapp: '5551984838828',
    sector: 'imoveis',
    reach: 3,
    logo: '/partners/LOGOS-SITE-appe-go-200x120.png',
    description: 'Imobiliária especializada em Canoas e região. Compra, venda, locação e governança imobiliária com dedicação constante na negociação do seu imóvel.',
    city: 'Canoas, RS',
  },
  {
    id: 'ana-paula-moller',
    name: 'Ana Paula Möller — Terapias Orientais',
    sector: 'saude',
    reach: 3,
    logo: '/partners/LOGOS-SITE-ana-paula-moller-200x120.png',
    description: 'Terapias orientais focadas em equilíbrio energético, bem-estar físico e emocional. Atendimento personalizado com técnicas integrativas.',
    instagram: '@anapaula.moller',
    whatsapp: '5551999961901',
    website: 'https://calendly.com/anapaulamoller/agenda',
    city: 'Canoas, RS',
  },
  {
    id: 'carobdamiani',
    name: 'Carolina Braga Damiani — Perita Contábil',
    instagram: '@carobdamiani',
    sector: 'contabilidade',
    reach: 3,
    logo: '/partners/LOGOS-SITE-carobdamiani-200x120.png',
    description: 'Perícia Contábil. Atuação em cálculos judiciais e extrajudiciais, liquidação de sentença nas áreas Trabalhista, Financeira, Bancária e Pasep.',
    whatsapp: '5551999121709',
    hideGoogle: true,
    city: 'Porto Alegre',
  },
  {
    id: 'arkos',
    name: 'Arkos Corretora de Seguros',
    sector: 'servicos',
    reach: 3,
    logo: '/partners/LOGOS-SITE-arkos-200x120.png',
    description: 'Corretora de seguros com atendimento personalizado. Soluções para seguros de vida, automóvel, residencial, empresarial e mais.',
    instagram: '@arkoscorretoradeseguros',
    whatsapp: '5551999121709',
    hideGoogle: true,
    city: 'Canoas',
  },
  {
    id: 'renata-llopes',
    name: 'Renata Llopes — Terapeuta Integrativa',
    sector: 'saude',
    reach: 3,
    logo: '/partners/LOGOS-SITE-renata-llopes-200x120.png',
    description: 'Terapeuta integrativa, abordagens holísticas para equilíbrio emocional, autoconhecimento e bem-estar.',
    instagram: '@renatallopesmentora',
    whatsapp: '5551996822302',
    hideGoogle: true,
    city: 'Canoas',
  },
  {
    id: 'julia-inframe',
    name: 'Júlia InFrame — Foto & Vídeo',
    instagram: '@juliainframe_',
    whatsapp: '5551986525645',
    sector: 'eventos',
    reach: 3,
    logo: '/partners/LOGOS-SITE-julia-inframe-200x120.png',
    description: 'Cobertura completa de eventos com fotografia e vídeo integrados. Foco na espontaneidade — abraços reais, sorrisos sinceros e a atmosfera verdadeira de cada celebração.',
    hideGoogle: true,
    website: 'https://juliainframe.myportfolio.com/servicos',
    city: 'Gravataí',
  },
  {
    id: 'priscila-terapeuta',
    name: 'Priscila — Terapeuta Integrativa & Mentora Espiritual',
    instagram: '@priscilaterapeutaholistica',
    whatsapp: '5551982221203',
    sector: 'saude',
    reach: 3,
    logo: '/partners/LOGOS-SITE-priscila-terapeuta-200x120.png',
    description: 'Terapeuta integrativa e mentora espiritual. Cursos, consultorias e acompanhamento para quem busca equilíbrio, autoconhecimento e expansão de consciência.',
    hideGoogle: true,
    city: 'Canoas',
  },
  {
    id: 'mschock',
    name: 'MS Chock',
    instagram: '@mschockoficial',
    whatsapp: '5551992242748',
    sector: 'gastronomia',
    reach: 3,
    logo: '/partners/LOGOS-SITE-mschock-200x120.png',
    description: 'Chocolates e confeitaria artesanal com criatividade e sabor. Presentes, kits corporativos e doces especiais feitos com dedicação e muito amor.',
    hideGoogle: true,
    city: 'Canoas',
  },
  {
    id: 'santameson',
    name: 'Santameson Consultoria',
    instagram: '@santameson.consult',
    whatsapp: '5551982374877',
    phone: '5551982374877',
    sector: 'consultoria',
    reach: 3,
    logo: '/partners/LOGOS-SITE-santameson-200x120.png',
    description: 'Consultoria em licitações pra pequenos e médios empresários. Apoio também na implantação do setor de licitação dentro de empresas.',
    website: 'https://www.santameson.com.br/',
    hideGoogle: true,
  },
]
