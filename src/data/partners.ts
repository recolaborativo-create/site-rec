// Partner directory — 84 companies in the REC ecosystem.
// Display names and Instagram handles refined from the current recolaborativo.com.br/nossa-rede page.
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
  sector: PartnerSector
  reach: 1 | 2 | 3 | 4 | 5
  logo: string
  related?: string[]
  /** Up to ~5 lines (~280 chars). Empty/undefined renders "descrição em breve". */
  description?: string
}

export const partners: Partner[] = [
  { id: 'adegas-vinas', name: 'Adega Viñas', instagram: '@adega_vinas', sector: 'gastronomia', reach: 3, logo: '/partners/banners-site-adegas-vinas-200x120.png' },
  { id: 'amor-e-consciencia', name: 'Amor e Consciência', instagram: '@amor.e.consciencia', sector: 'saude', reach: 3, logo: '/partners/banners-site-amor-e-consciencia-200x120.png' },
  { id: 'bela-clean', name: 'Bella Clean', instagram: '@bellaclean1', sector: 'servicos', reach: 3, logo: '/partners/banners-site-bela-clean-200x120.png' },
  { id: 'criativus-novo', name: 'Criativus Studio de Ideias', instagram: '@criativusdesignoficial', sector: 'marketing', reach: 3, logo: '/partners/banners-site-criativus-novo-200x120.png' },
  { id: 'desafio', name: 'Desafio Cada Dia Melhor', instagram: '@desafiocadadiamelhor', sector: 'saude', reach: 3, logo: '/partners/banners-site-desafio-200x120.png' },
  { id: 'domicio', name: 'Domício Redes de Proteção', sector: 'servicos', reach: 3, logo: '/partners/banners-site-domicio-200x120.png' },
  { id: 'gavion', name: 'Gavion Contabilidade', instagram: '@gavioncontabilidade', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site-gavion-200x120.png' },
  { id: 'kumon', name: 'Kumon Canoas', instagram: '@kumoncanoas', sector: 'educacao', reach: 3, logo: '/partners/banners-site-KUMON-200x120.png' },
  { id: 'leuck', name: 'Leuck', sector: 'servicos', reach: 3, logo: '/partners/banners-site-LEUCK-200x120.png' },
  { id: 'lumbieri', name: 'Lumbieri Empório da Carne', instagram: '@lumbieriemporiodacarne', sector: 'gastronomia', reach: 4, logo: '/partners/banners-site-lumbieri-200x120.png' },
  { id: 'midia-na-mesa', name: 'Mídia na Mesa', instagram: '@midianamesa', sector: 'marketing', reach: 3, logo: '/partners/banners-site-midia-na-mesa-200x120.png' },
  { id: 'mistyura', name: 'Farmácia Mistura', instagram: '@mistura_farmacia', sector: 'saude', reach: 3, logo: '/partners/banners-site-mistyura-200x120.png' },
  { id: 'nova-era', name: 'Nova Era Brindes', instagram: '@novaerabrindes', sector: 'servicos', reach: 3, logo: '/partners/banners-site-nova-era-200x120.png' },
  { id: 'posseg', name: 'Posseg', instagram: '@gabrielerech', sector: 'servicos', reach: 3, logo: '/partners/banners-site-posseg-200x120.png' },
  { id: 'regiane', name: 'Dra. Regiane Pereira', instagram: '@dra.regianepereira', sector: 'saude', reach: 3, logo: '/partners/banners-site-regiane-200x120.png' },
  { id: 'sos-canos-info', name: 'Sos Canoas Informática', instagram: '@soscanoas', sector: 'tech', reach: 3, logo: '/partners/banners-site-sos-canos-info-200x120.png' },
  { id: 'tenax', name: 'Tenax Marcas', instagram: '@tenaxmarcas', sector: 'marketing', reach: 3, logo: '/partners/banners-site-tenax-200x120.png' },
  { id: 'toca-do-pao', name: 'Toca do Pão', instagram: '@toca.do.pao', sector: 'gastronomia', reach: 3, logo: '/partners/banners-site-toca-do-pao-200x120.png' },

  { id: '360', name: 'Gestum 360 - Taviane Alves', instagram: '@tavianealvescontadora', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-360-200x120.png' },
  { id: 'alinesantosnutri', name: 'Aline Santos Nutricionista', instagram: '@aline_santos_nutricionista', sector: 'saude', reach: 3, logo: '/partners/banners-site1-ALINESANTOSNUTRI-200x120.png' },
  { id: 'andressa', name: 'Andressa Bonato Contadora', instagram: '@andressaboneto.contadora', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-andressa-200x120.png' },
  { id: 'baby-200x119png', name: 'Baby Plays', instagram: '@babyplays.brinquedos', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-baby-200x119.png' },
  { id: 'cibele', name: 'Cibele Reis Finanças', instagram: '@cibelejreis.financas', sector: 'contabilidade', reach: 3, logo: '/partners/banners-site1-cibele-200x120.png' },
  { id: 'ciclojoel', name: 'Ciclo Joel', instagram: '@ciclojel', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-ciclojoel-200x120.png' },
  { id: 'consertos-express', name: 'Consertos Express', instagram: '@consertos.express', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-consertos-express-200x120.png' },
  { id: 'cressol', name: 'Cresol Gerações', instagram: '@cresolgeracoes', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-cressol-200x120.png' },
  { id: 'doce-amargo', name: 'Doce Amargo', instagram: '@doceamargo.at', sector: 'gastronomia', reach: 3, logo: '/partners/banners-site1-doce-amargo-200x120.png' },
  { id: 'doterra', name: 'doTERRA - Pritha', instagram: '@pritha_doterra', sector: 'saude', reach: 3, logo: '/partners/banners-site1-doterra-200x120.png' },
  { id: 'flores-patricia-consorcios', name: 'Patrícia Consórcios', instagram: '@patricia.consorcios', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-flores-patricia-consorcios-200x120.png' },
  { id: 'fly', name: 'Fly Estratégias Digitais', instagram: '@flyestrategiasdigitais', sector: 'marketing', reach: 4, logo: '/partners/banners-site1-fly-200x120.png' },
  { id: 'foco-personalizados', name: 'Foco Personalizados', instagram: '@foco_personalizados', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-foco-personalizados-200x120.png' },
  { id: 'guria', name: 'Ótica Guria Bonita', instagram: '@guriabonita.optica', sector: 'beleza', reach: 4, logo: '/partners/banners-site1-guria-200x120.png' },
  { id: 'mef-psico', name: 'M & F Clínica de Psicologia', instagram: '@mfpsicologia.rs', sector: 'saude', reach: 3, logo: '/partners/banners-site1-mef-psico-200x120.png' },
  { id: 'memoraveis', name: 'Memoráveis Workshop', instagram: '@memoraveis.workshop', sector: 'eventos', reach: 3, logo: '/partners/banners-site1-memoraveis-200x120.png' },
  { id: 'mistura', name: 'Mistura Gastronomia e Eventos', instagram: '@misturagastronomiaeventos', sector: 'eventos', reach: 4, logo: '/partners/banners-site1-mistura-200x120.png' },
  { id: 'ms', name: 'M&S Consultoria', instagram: '@insta_msconsultoria', sector: 'consultoria', reach: 3, logo: '/partners/banners-site1-ms-200x120.png' },
  { id: 'seibras', name: 'Seibras Estágios', instagram: '@seibrasestagios', sector: 'educacao', reach: 3, logo: '/partners/banners-site1-seibras-200x120.png' },
  { id: 'zannata', name: 'Zanatta Seguros', instagram: '@zanattaseguros', sector: 'servicos', reach: 3, logo: '/partners/banners-site1-zannata-200x120.png' },

  { id: 'gui-imoveis', name: 'O Guia Imóveis', instagram: '@oguiaimoveis', sector: 'imoveis', reach: 3, logo: '/partners/banners-sitegui-imoveis-200x120.png' },

  { id: 'abm', name: 'ABM Sublimados', instagram: '@abmsublimados', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-ABM-200x120.png' },
  { id: 'advogado', name: 'Schaff & Zambonin Advocacia', instagram: '@jpschaff.adv', sector: 'advocacia', reach: 3, logo: '/partners/LOGOS-SITE-advogado-200x120.png' },
  { id: 'andres', name: 'Assessoria Andres', instagram: '@assessoria.andres', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-ANDRES-200x120.png' },
  { id: 'atitude', name: 'Atitude Transportes', instagram: '@attitudetransportes', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-atitude-200x120.png' },
  { id: 'ativa', name: 'Ativa Medicina', instagram: '@ativa.medicina', sector: 'saude', reach: 4, logo: '/partners/LOGOS-SITE-ATIVA-200x120.png' },
  { id: 'ballons', name: 'Balloons RS', instagram: '@balloons.rs', sector: 'eventos', reach: 4, logo: '/partners/LOGOS-SITE-ballons-v2-200x120.png' },
  { id: 'bendita', name: 'Bendita Planta Bio', instagram: '@benditaplantabio', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-BENDITA-200x120.png' },
  { id: 'cintia-mendes', name: 'Cíntia Mendes', instagram: '@cinttia.mendes', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-cintia-mendes-200x120.png' },
  { id: 'clinica-schaff', name: 'Clínica Schaff', instagram: '@clinicaschaff', sector: 'saude', reach: 4, logo: '/partners/LOGOS-SITE-CLINICA-SCHAFF-200x120.png' },
  { id: 'di-tour', name: 'Di Tour Viagens', instagram: '@ditour_viagens', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-di-tour-200x120.png' },
  { id: 'dm', name: "D' Mania Beauty", instagram: '@dmania.beauty', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-dm-200x120.png' },
  { id: 'essentis', name: 'Essentis Studio', instagram: '@essentis.studio', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-essentis-200x120.png' },
  { id: 'evelin', name: 'Evelyn Souza Correspondente', instagram: '@evelyncorrespondente', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-EVELIN-200x120.png' },
  { id: 'executiva-1', name: 'Executiva - Viagens, Eventos e Turismo', instagram: '@executivalocacoes', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-executiva-1-200x120.png' },
  { id: 'fire', name: 'Empower Fire', instagram: '@empower_fire', sector: 'saude', reach: 3, logo: '/partners/LOGOS-SITE-fire-200x120.png' },
  { id: 'flor-e-ser', name: 'Flor & Ser Bem Estar', instagram: '@floreserbemestar', sector: 'saude', reach: 3, logo: '/partners/LOGOS-SITE-flor-e-ser-200x120.png' },
  { id: 'fraga', name: 'Fraga & Santos Arquitetura', instagram: '@arq.veronicafraga', sector: 'arquitetura', reach: 3, logo: '/partners/LOGOS-SITE-fraga-200x120.png' },
  { id: 'iconstru', name: 'IConstru Engenharia', instagram: '@iconstruengenharia', sector: 'arquitetura', reach: 3, logo: '/partners/LOGOS-SITE-iconstru-200x120.png' },
  { id: 'inova', name: 'Studio Innova', instagram: '@studioinnovanh', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-inova-200x120.png' },
  { id: 'jaque', name: 'Jaque Neckel', instagram: '@jaqueneckel', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-jaque-200x120.png' },
  { id: 'juliana', name: 'Juliana Frame', instagram: '@juliainframe_', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-juliana-200x120.png' },
  { id: 'karam-adv', name: 'Karam Advocacia', instagram: '@karam.advocacia', sector: 'advocacia', reach: 3, logo: '/partners/LOGOS-SITE-karam-adv-200x120.png' },
  { id: 'la-rosa', name: "La Rosa's Floricultura", instagram: '@floriculturacanoaslarosas', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-la-rosa-200x120.png' },
  { id: 'lemali', name: 'Lemali Consultoria', instagram: '@lemaliconsultoria', sector: 'consultoria', reach: 3, logo: '/partners/LOGOS-SITE-lemali-200x120.png' },
  { id: 'liarche', name: 'Liarche Consultoria', instagram: '@liarchedh', sector: 'consultoria', reach: 3, logo: '/partners/LOGOS-SITE-LIARCHE-200x120.png' },
  { id: 'lidiane-avila', name: 'Lidiane Ávila Fotografia', instagram: '@lidianeavilafotografia', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-lidiane-avila-200x120.png' },
  { id: 'luna', name: 'Luna Lu Doceria', instagram: '@lunaludoceria', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-LUNA-200x120.png' },
  { id: 'nexx', name: 'Nexx BPO Financeiro', instagram: '@nexxbpofinanceiro', sector: 'contabilidade', reach: 3, logo: '/partners/LOGOS-SITE-nexx-200x120.png' },
  { id: 'noca', name: 'NOCA POA', instagram: '@nocapoa', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-noca-200x120.png' },
  { id: 'nucleo', name: 'Núcleo GRC', instagram: '@nucleogrc', sector: 'consultoria', reach: 3, logo: '/partners/LOGOS-SITE-NUCLEO-200x120.png' },
  { id: 'organizacao', name: 'Organização Plena', instagram: '@organizacao.plena', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-ORGANIZACAO-200x120.png' },
  { id: 'paola', name: 'Paola Mróz Marketing', instagram: '@paolamrozmkt', sector: 'marketing', reach: 3, logo: '/partners/LOGOS-SITE-PAOLA-200x120.png' },
  { id: 'pimenta', name: 'Pimenta de Cheiro', instagram: '@cheiro.pimentade', sector: 'gastronomia', reach: 3, logo: '/partners/LOGOS-SITE-pimenta-200x120.png' },
  { id: 'raupp', name: 'Raupp Consultoria Contábil', instagram: '@rauppcontabil', sector: 'contabilidade', reach: 3, logo: '/partners/LOGOS-SITE-raupp-200x120.png' },
  { id: 'rhf', name: 'RHF Talentos', instagram: '@rhfcanoas_mrondon', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-rhf-200x120.png' },
  { id: 'rocsana', name: 'Rocsana - Turismo Terapêutico', instagram: '@guiacomalma', sector: 'turismo', reach: 3, logo: '/partners/LOGOS-SITE-rocsana-200x120.png' },
  { id: 's2', name: 'S2 Assessoria Estudantil', instagram: '@s2_estudantil', sector: 'educacao', reach: 3, logo: '/partners/LOGOS-SITE-s2-200x120.png' },
  { id: 'sandra', name: 'Sandra Colleoni', instagram: '@sandra.colleoni', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-sandra-200x120.png' },
  { id: 'sheila', name: 'Estúdio Sheila Luz', instagram: '@estudiosheilaluz', sector: 'beleza', reach: 3, logo: '/partners/LOGOS-SITE-SHEILA-200x120.png' },
  { id: 'superfantastico', name: 'Superfantástico - Salão de Festas', instagram: '@superfantasticofestas', sector: 'eventos', reach: 3, logo: '/partners/LOGOS-SITE-superfantastico-200x120.png' },
  { id: 'suzana-nagel', name: 'Suzana Nagel', instagram: '@suzananagel.oficial', sector: 'servicos', reach: 3, logo: '/partners/LOGOS-SITE-suzana-nagel-200x120.png' },
  { id: 'vip-place', name: 'Vip Place Corporate', instagram: '@vipplacecorporate', sector: 'eventos', reach: 3, logo: '/partners/LOGOS-SITE-vip-place-200x120.png' },
  { id: 'zls', name: 'ZLS - Gestão e Finanças', instagram: '@zlsconsultoriaempresarial', sector: 'contabilidade', reach: 3, logo: '/partners/LOGOS-SITE-zls-200x120.png' },

  { id: 'preto-renatta-200x96png', name: 'Renatta Hoher Advocacia', instagram: '@renattahoheradv', sector: 'advocacia', reach: 3, logo: '/partners/preto-renatta-200x96.png' },
  { id: 'sem-titulo-1-200x81png', name: 'M M Apoio Empresarial', instagram: '@mmapoio', sector: 'servicos', reach: 3, logo: '/partners/Sem-titulo-1-200x81.png' },
]
