// Text for the pages added at the end of stage 3 (FAQ, industries, certifications, clients and cases, quote,
// legal pages) and for the cookie banner. Kept apart from dictionaries.ts; same shape in every language.
import type { Locale } from "./config";

const es = {
  nav: {
    faq: "Preguntas frecuentes",
    industries: "Industrias",
    certifications: "Certificaciones",
    clients: "Clientes",
    quote: "Cotizar",
    privacy: "Política de privacidad",
    terms: "Términos de uso",
    cookies: "Configurar cookies",
    legal: "Legal",
    menu: {
      industries: "Perforación, producción, izaje y fabricación",
      certifications: "ISO 9001, ISO 45001 y personal certificado",
      clients: "Clientes que confían en nosotros y casos",
      faq: "Respuestas sobre métodos, informes y cotizaciones",
    },
  },
  faq: {
    title: "Preguntas frecuentes",
    lead: "Respuestas directas sobre ensayos no destructivos, nuestros métodos, certificaciones, informes y cómo cotizar.",
    eyebrow: "Preguntas frecuentes",
    sectionTitle: "Lo que más nos preguntan",
    seeAll: "Ver todas las preguntas",
    askTitle: "¿No encontró su pregunta?",
    askLead: "Escríbanos por WhatsApp o pida una cotización y un asesor le responde en horario hábil.",
    categories: {
      general: "General",
      metodos: "Métodos de ensayo",
      certificaciones: "Certificaciones",
      proceso: "Proceso e informes",
      plataforma: "Plataforma TI-QMS",
      comercial: "Comercial",
    },
  },
  industries: {
    title: "Industrias que atendemos",
    lead: "Inspección y control de calidad para las operaciones donde una falla cuesta más: perforación, producción, izaje y fabricación.",
    eyebrow: "Industrias",
    componentsTitle: "Qué inspeccionamos",
    servicesTitle: "Servicios para esta industria",
    methodsTitle: "Métodos que aplicamos",
    casesTitle: "Casos en esta industria",
    more: "Ver industria",
    others: "Otras industrias",
  },
  certifications: {
    title: "Certificaciones y calidad",
    lead: "Sistemas de gestión certificados y personal calificado: la base de cada informe que firmamos.",
    docsTitle: "Políticas y documentos del sistema de gestión",
    docsLead: "Consulte nuestras políticas, el alcance del sistema integrado de gestión y los informes de rendición de cuentas.",
    docsCta: "Ver documentos HSEQ",
  },
  clients: {
    title: "Clientes y casos de éxito",
    lead: "Empresas de perforación, servicios petroleros e industria que confían en nuestras inspecciones.",
    casesTitle: "Casos de éxito",
    casesLead: "Cómo resolvimos necesidades reales de inspección y control de calidad.",
    noCases: "Estamos documentando nuestros casos con autorización de cada cliente. Mientras tanto, conozca nuestros servicios o pida una referencia a su asesor.",
    challenge: "El reto",
    solution: "La solución",
    outcomes: "Resultados",
    client: "Cliente",
    sector: "Sector",
    read: "Leer el caso",
    allCases: "Todos los casos",
    servicesUsed: "Servicios",
  },
  quote: {
    title: "Solicitar cotización",
    lead: "Cuéntenos qué necesita inspeccionar en unos pasos. Un asesor revisa su solicitud y le responde en horario hábil.",
  },
  privacy: {
    title: "Política de privacidad",
    lead: "Cómo tratamos los datos personales que usted nos entrega en este sitio, de acuerdo con la Ley 1581 de 2012 y nuestra política de protección de datos (PL-09).",
    updated: "Última actualización",
    fullPolicy: "Política de protección de datos completa (PDF)",
    controller: "Responsable del tratamiento",
    contact: "Para ejercer sus derechos escriba a",
    sections: [
      {
        h: "Qué datos recogemos en este sitio",
        p: [
          "Solo los que usted nos da al pedir una cotización, escribirnos o usar el asistente: nombre, empresa, cargo, correo, teléfono, los detalles de su solicitud y los archivos que adjunte.",
          "Para limitar el abuso de los formularios guardamos una huella cifrada de su dirección IP durante unos minutos, nunca la dirección misma. Las estadísticas de visitas solo se recogen si usted las acepta en el aviso de cookies.",
        ],
      },
      {
        h: "Para qué los usamos",
        p: [
          "Para responder su solicitud, preparar y enviar cotizaciones, ejecutar los contratos de servicio, cumplir obligaciones legales y, con su consentimiento, entender cómo se usa el sitio para mejorarlo. No vendemos sus datos.",
        ],
      },
      {
        h: "Asistente virtual",
        p: [
          "Las respuestas del asistente las genera un servicio de inteligencia artificial (OpenAI) a partir de lo que usted escribe. Guardamos la conversación hasta 90 días para revisar la calidad de las respuestas. No escriba datos sensibles en el chat. Una solicitud de cotización solo se registra si usted la confirma y acepta el tratamiento de datos.",
        ],
      },
      {
        h: "Cookies",
        p: [
          "Usamos cookies necesarias para que el sitio funcione (su elección sobre cookies, la protección contra spam de Cloudflare Turnstile y la sesión del panel de administración). Las cookies de analítica (Google Analytics) solo se activan si usted las acepta, y puede cambiar su elección en cualquier momento con «Configurar cookies», al pie de cada página.",
        ],
      },
      {
        h: "Con quién los compartimos",
        p: [
          "Con proveedores que nos prestan servicios necesarios para el sitio, bajo sus propias condiciones de seguridad: alojamiento (DigitalOcean), envío de correos (Resend), protección contra spam (Cloudflare), el asistente (OpenAI) y, si la acepta, la analítica (Google). También con autoridades cuando una ley o una orden lo exija.",
        ],
      },
      {
        h: "Cuánto tiempo los conservamos",
        p: [
          "Las solicitudes y sus datos de contacto, mientras dure la relación comercial y lo exijan nuestras obligaciones legales. Las conversaciones del asistente, hasta 90 días después del último mensaje.",
        ],
      },
      {
        h: "Sus derechos",
        list: [
          "Conocer, actualizar y rectificar sus datos personales.",
          "Pedir prueba de la autorización que nos dio.",
          "Ser informado sobre el uso que hemos dado a sus datos.",
          "Presentar quejas ante la Superintendencia de Industria y Comercio.",
          "Revocar la autorización o pedir que suprimamos sus datos.",
          "Acceder gratis a sus datos personales.",
        ],
      },
      {
        h: "Datos sensibles y de menores",
        p: [
          "No está obligado a responder preguntas sobre datos sensibles. Los datos de menores de edad solo se tratan con autorización de sus padres o representantes legales, según el Decreto 1377 de 2013.",
        ],
      },
      {
        h: "Seguridad",
        p: [
          "Protegemos la información con medidas físicas, electrónicas y administrativas: conexión cifrada, acceso al panel con contraseña y doble factor, archivos privados y copias de seguridad diarias.",
        ],
      },
    ],
  },
  terms: {
    title: "Términos de uso",
    lead: "Condiciones para usar el sitio web de Tech-Inspection S.A.S.",
    updated: "Última actualización",
    sections: [
      { h: "Uso del sitio", p: ["Este sitio presenta los servicios de Tech-Inspection S.A.S. Al usarlo, usted acepta estos términos. Úselo de forma lícita y sin intentar afectar su funcionamiento o su seguridad."] },
      { h: "Información del sitio", p: ["El contenido es informativo y general. No es una cotización, un concepto técnico ni un informe de inspección: el alcance, los plazos y las condiciones de cada servicio se definen en la propuesta comercial y en el contrato. Las respuestas del asistente virtual son orientativas y las confirma un asesor."] },
      { h: "Propiedad intelectual", p: ["Textos, fotografías, logotipos, sellos y diseño pertenecen a Tech-Inspection S.A.S. o a sus titulares y no pueden reproducirse sin autorización. Los sellos de certificación se usan según los manuales de cada organismo certificador."] },
      { h: "Plataforma TI-QMS", p: ["El acceso a TI-QMS es personal. Usted es responsable de guardar sus credenciales y de avisarnos si sospecha un uso no autorizado."] },
      { h: "Enlaces a otros sitios", p: ["Los enlaces a sitios de terceros, como WhatsApp o Google Maps, se ofrecen por comodidad. No respondemos por su contenido ni por sus políticas."] },
      { h: "Responsabilidad", p: ["Procuramos que la información esté completa y actualizada, pero no garantizamos que el sitio esté libre de errores o interrupciones. No respondemos por decisiones tomadas solo con la información general del sitio."] },
      { h: "Ley aplicable y cambios", p: ["Estos términos se rigen por las leyes de Colombia. Podemos actualizarlos; la versión vigente es la publicada en esta página."] },
    ],
  },
  consent: {
    title: "Cookies",
    text: "Usamos cookies necesarias para que el sitio funcione y, si usted acepta, cookies de analítica para entender cómo se usa y mejorarlo.",
    accept: "Aceptar analítica",
    reject: "Solo necesarias",
    more: "Más información",
  },
};

export type Extra = typeof es;

const pt: Extra = {
  nav: {
    faq: "Perguntas frequentes",
    industries: "Indústrias",
    certifications: "Certificações",
    clients: "Clientes",
    quote: "Orçamento",
    privacy: "Política de privacidade",
    terms: "Termos de uso",
    cookies: "Configurar cookies",
    legal: "Legal",
    menu: {
      industries: "Perfuração, produção, içamento e fabricação",
      certifications: "ISO 9001, ISO 45001 e pessoal certificado",
      clients: "Clientes que confiam em nós e casos",
      faq: "Respostas sobre métodos, relatórios e orçamentos",
    },
  },
  faq: {
    title: "Perguntas frequentes",
    lead: "Respostas diretas sobre ensaios não destrutivos, nossos métodos, certificações, relatórios e como pedir um orçamento.",
    eyebrow: "Perguntas frequentes",
    sectionTitle: "O que mais nos perguntam",
    seeAll: "Ver todas as perguntas",
    askTitle: "Não encontrou sua pergunta?",
    askLead: "Escreva-nos pelo WhatsApp ou peça um orçamento e um consultor responde em horário comercial.",
    categories: {
      general: "Geral",
      metodos: "Métodos de ensaio",
      certificaciones: "Certificações",
      proceso: "Processo e relatórios",
      plataforma: "Plataforma TI-QMS",
      comercial: "Comercial",
    },
  },
  industries: {
    title: "Indústrias que atendemos",
    lead: "Inspeção e controle da qualidade para as operações onde uma falha custa mais: perfuração, produção, içamento e fabricação.",
    eyebrow: "Indústrias",
    componentsTitle: "O que inspecionamos",
    servicesTitle: "Serviços para esta indústria",
    methodsTitle: "Métodos que aplicamos",
    casesTitle: "Casos nesta indústria",
    more: "Ver indústria",
    others: "Outras indústrias",
  },
  certifications: {
    title: "Certificações e qualidade",
    lead: "Sistemas de gestão certificados e pessoal qualificado: a base de cada relatório que assinamos.",
    docsTitle: "Políticas e documentos do sistema de gestão",
    docsLead: "Consulte nossas políticas, o escopo do sistema integrado de gestão e os relatórios de prestação de contas.",
    docsCta: "Ver documentos HSEQ",
  },
  clients: {
    title: "Clientes e casos de sucesso",
    lead: "Empresas de perfuração, serviços petrolíferos e indústria que confiam em nossas inspeções.",
    casesTitle: "Casos de sucesso",
    casesLead: "Como resolvemos necessidades reais de inspeção e controle da qualidade.",
    noCases: "Estamos documentando nossos casos com a autorização de cada cliente. Enquanto isso, conheça nossos serviços ou peça uma referência ao seu consultor.",
    challenge: "O desafio",
    solution: "A solução",
    outcomes: "Resultados",
    client: "Cliente",
    sector: "Setor",
    read: "Ler o caso",
    allCases: "Todos os casos",
    servicesUsed: "Serviços",
  },
  quote: {
    title: "Solicitar orçamento",
    lead: "Conte-nos em poucos passos o que precisa inspecionar. Um consultor revisa sua solicitação e responde em horário comercial.",
  },
  privacy: {
    title: "Política de privacidade",
    lead: "Como tratamos os dados pessoais que você nos fornece neste site, de acordo com a Lei 1581 de 2012 da Colômbia e nossa política de proteção de dados (PL-09).",
    updated: "Última atualização",
    fullPolicy: "Política de proteção de dados completa (PDF, em espanhol)",
    controller: "Responsável pelo tratamento",
    contact: "Para exercer seus direitos, escreva para",
    sections: [
      {
        h: "Quais dados coletamos neste site",
        p: [
          "Apenas os que você nos fornece ao pedir um orçamento, nos escrever ou usar o assistente: nome, empresa, cargo, e-mail, telefone, os detalhes da sua solicitação e os arquivos que anexar.",
          "Para limitar o abuso dos formulários guardamos por alguns minutos uma impressão cifrada do seu endereço IP, nunca o endereço em si. As estatísticas de visitas só são coletadas se você as aceitar no aviso de cookies.",
        ],
      },
      { h: "Para que os usamos", p: ["Para responder à sua solicitação, preparar e enviar orçamentos, executar os contratos de serviço, cumprir obrigações legais e, com seu consentimento, entender como o site é usado para melhorá-lo. Não vendemos seus dados."] },
      {
        h: "Assistente virtual",
        p: [
          "As respostas do assistente são geradas por um serviço de inteligência artificial (OpenAI) a partir do que você escreve. Guardamos a conversa por até 90 dias para revisar a qualidade das respostas. Não escreva dados sensíveis no chat. Uma solicitação de orçamento só é registrada se você a confirmar e aceitar o tratamento de dados.",
        ],
      },
      {
        h: "Cookies",
        p: [
          "Usamos cookies necessários para o funcionamento do site (sua escolha sobre cookies, a proteção contra spam do Cloudflare Turnstile e a sessão do painel de administração). Os cookies de análise (Google Analytics) só são ativados se você os aceitar, e você pode mudar sua escolha a qualquer momento em «Configurar cookies», no rodapé de cada página.",
        ],
      },
      {
        h: "Com quem os compartilhamos",
        p: [
          "Com fornecedores que nos prestam serviços necessários para o site, sob suas próprias condições de segurança: hospedagem (DigitalOcean), envio de e-mails (Resend), proteção contra spam (Cloudflare), o assistente (OpenAI) e, se você aceitar, a análise (Google). Também com autoridades quando uma lei ou ordem o exigir.",
        ],
      },
      { h: "Por quanto tempo os guardamos", p: ["As solicitações e seus dados de contato, enquanto durar a relação comercial e o exigirem nossas obrigações legais. As conversas do assistente, por até 90 dias após a última mensagem."] },
      {
        h: "Seus direitos",
        list: [
          "Conhecer, atualizar e retificar seus dados pessoais.",
          "Pedir prova da autorização que nos deu.",
          "Ser informado sobre o uso que demos aos seus dados.",
          "Apresentar reclamações à Superintendencia de Industria y Comercio da Colômbia.",
          "Revogar a autorização ou pedir a exclusão dos seus dados.",
          "Acessar gratuitamente seus dados pessoais.",
        ],
      },
      { h: "Dados sensíveis e de menores", p: ["Você não é obrigado a responder perguntas sobre dados sensíveis. Os dados de menores de idade só são tratados com autorização dos pais ou representantes legais, conforme o Decreto 1377 de 2013."] },
      { h: "Segurança", p: ["Protegemos as informações com medidas físicas, eletrônicas e administrativas: conexão cifrada, acesso ao painel com senha e duplo fator, arquivos privados e cópias de segurança diárias."] },
    ],
  },
  terms: {
    title: "Termos de uso",
    lead: "Condições para usar o site da Tech-Inspection S.A.S.",
    updated: "Última atualização",
    sections: [
      { h: "Uso do site", p: ["Este site apresenta os serviços da Tech-Inspection S.A.S. Ao usá-lo, você aceita estes termos. Use-o de forma lícita e sem tentar afetar seu funcionamento ou sua segurança."] },
      { h: "Informações do site", p: ["O conteúdo é informativo e geral. Não é um orçamento, um parecer técnico nem um relatório de inspeção: o escopo, os prazos e as condições de cada serviço são definidos na proposta comercial e no contrato. As respostas do assistente virtual são orientativas e confirmadas por um consultor."] },
      { h: "Propriedade intelectual", p: ["Textos, fotografias, logotipos, selos e design pertencem à Tech-Inspection S.A.S. ou a seus titulares e não podem ser reproduzidos sem autorização. Os selos de certificação são usados conforme os manuais de cada organismo certificador."] },
      { h: "Plataforma TI-QMS", p: ["O acesso ao TI-QMS é pessoal. Você é responsável por guardar suas credenciais e por nos avisar se suspeitar de uso não autorizado."] },
      { h: "Links para outros sites", p: ["Os links para sites de terceiros, como WhatsApp ou Google Maps, são oferecidos por conveniência. Não respondemos por seu conteúdo nem por suas políticas."] },
      { h: "Responsabilidade", p: ["Procuramos manter as informações completas e atualizadas, mas não garantimos que o site esteja livre de erros ou interrupções. Não respondemos por decisões tomadas apenas com as informações gerais do site."] },
      { h: "Lei aplicável e alterações", p: ["Estes termos são regidos pelas leis da Colômbia. Podemos atualizá-los; a versão vigente é a publicada nesta página."] },
    ],
  },
  consent: {
    title: "Cookies",
    text: "Usamos cookies necessários para o funcionamento do site e, se você aceitar, cookies de análise para entender como ele é usado e melhorá-lo.",
    accept: "Aceitar análise",
    reject: "Apenas necessários",
    more: "Mais informações",
  },
};

const en: Extra = {
  nav: {
    faq: "FAQ",
    industries: "Industries",
    certifications: "Certifications",
    clients: "Clients",
    quote: "Get a quote",
    privacy: "Privacy policy",
    terms: "Terms of use",
    cookies: "Cookie settings",
    legal: "Legal",
    menu: {
      industries: "Drilling, production, lifting and fabrication",
      certifications: "ISO 9001, ISO 45001 and certified personnel",
      clients: "Clients who trust us, and case studies",
      faq: "Answers on methods, reports and quotes",
    },
  },
  faq: {
    title: "Frequently asked questions",
    lead: "Straight answers about non-destructive testing, our methods, certifications, reports and how to get a quote.",
    eyebrow: "FAQ",
    sectionTitle: "What people ask us most",
    seeAll: "See all questions",
    askTitle: "Didn't find your question?",
    askLead: "Message us on WhatsApp or request a quote and an advisor will reply during business hours.",
    categories: {
      general: "General",
      metodos: "Test methods",
      certificaciones: "Certifications",
      proceso: "Process and reports",
      plataforma: "TI-QMS platform",
      comercial: "Commercial",
    },
  },
  industries: {
    title: "Industries we serve",
    lead: "Inspection and quality control for operations where a failure costs the most: drilling, production, lifting and fabrication.",
    eyebrow: "Industries",
    componentsTitle: "What we inspect",
    servicesTitle: "Services for this industry",
    methodsTitle: "Methods we apply",
    casesTitle: "Cases in this industry",
    more: "See industry",
    others: "Other industries",
  },
  certifications: {
    title: "Certifications and quality",
    lead: "Certified management systems and qualified personnel: the basis of every report we sign.",
    docsTitle: "Management system policies and documents",
    docsLead: "See our policies, the scope of the integrated management system and the accountability reports.",
    docsCta: "See HSEQ documents",
  },
  clients: {
    title: "Clients and case studies",
    lead: "Drilling contractors, oilfield service companies and industry that trust our inspections.",
    casesTitle: "Case studies",
    casesLead: "How we solved real inspection and quality-control needs.",
    noCases: "We are documenting our cases with each client's permission. Meanwhile, explore our services or ask your advisor for a reference.",
    challenge: "The challenge",
    solution: "The solution",
    outcomes: "Results",
    client: "Client",
    sector: "Sector",
    read: "Read the case",
    allCases: "All cases",
    servicesUsed: "Services",
  },
  quote: {
    title: "Request a quote",
    lead: "Tell us in a few steps what needs inspecting. An advisor reviews your request and replies during business hours.",
  },
  privacy: {
    title: "Privacy policy",
    lead: "How we handle the personal data you give us on this site, under Colombia's Law 1581 of 2012 and our data protection policy (PL-09).",
    updated: "Last updated",
    fullPolicy: "Full data protection policy (PDF, in Spanish)",
    controller: "Data controller",
    contact: "To exercise your rights, write to",
    sections: [
      {
        h: "What data we collect on this site",
        p: [
          "Only what you give us when you request a quote, write to us or use the assistant: name, company, job title, email, phone, the details of your request and any files you attach.",
          "To limit form abuse we keep an encrypted fingerprint of your IP address for a few minutes, never the address itself. Visit statistics are collected only if you accept them in the cookie notice.",
        ],
      },
      { h: "What we use it for", p: ["To answer your request, prepare and send quotes, carry out service contracts, meet legal obligations and, with your consent, understand how the site is used so we can improve it. We do not sell your data."] },
      {
        h: "Virtual assistant",
        p: [
          "The assistant's replies are generated by an artificial intelligence service (OpenAI) from what you type. We keep the conversation for up to 90 days to review the quality of the replies. Please don't type sensitive data in the chat. A quote request is recorded only if you confirm it and accept the data processing terms.",
        ],
      },
      {
        h: "Cookies",
        p: [
          "We use cookies the site needs to work (your cookie choice, Cloudflare Turnstile spam protection and the admin panel session). Analytics cookies (Google Analytics) are set only if you accept them, and you can change your choice at any time with “Cookie settings” at the foot of every page.",
        ],
      },
      {
        h: "Who we share it with",
        p: [
          "With providers that supply services the site needs, under their own security terms: hosting (DigitalOcean), email delivery (Resend), spam protection (Cloudflare), the assistant (OpenAI) and, if you accept it, analytics (Google). Also with authorities when a law or an order requires it.",
        ],
      },
      { h: "How long we keep it", p: ["Requests and their contact details, for as long as the business relationship lasts and our legal obligations require. Assistant conversations, for up to 90 days after the last message."] },
      {
        h: "Your rights",
        list: [
          "To know, update and correct your personal data.",
          "To ask for proof of the consent you gave us.",
          "To be told how we have used your data.",
          "To file complaints with Colombia's Superintendence of Industry and Commerce.",
          "To withdraw your consent or ask us to delete your data.",
          "To access your personal data free of charge.",
        ],
      },
      { h: "Sensitive data and minors", p: ["You don't have to answer questions about sensitive data. Data about minors is processed only with the consent of their parents or legal guardians, under Decree 1377 of 2013."] },
      { h: "Security", p: ["We protect information with physical, electronic and administrative measures: encrypted connections, admin access with a password and two-factor authentication, private file storage and daily backups."] },
    ],
  },
  terms: {
    title: "Terms of use",
    lead: "Conditions for using the Tech-Inspection S.A.S. website.",
    updated: "Last updated",
    sections: [
      { h: "Use of the site", p: ["This site presents the services of Tech-Inspection S.A.S. By using it you accept these terms. Use it lawfully and don't try to disrupt how it works or its security."] },
      { h: "Information on the site", p: ["The content is general information. It is not a quote, a technical opinion or an inspection report: the scope, timing and conditions of each service are set in the commercial proposal and the contract. The virtual assistant's replies are guidance and are confirmed by an advisor."] },
      { h: "Intellectual property", p: ["Text, photographs, logos, seals and design belong to Tech-Inspection S.A.S. or their owners and may not be reproduced without permission. Certification seals are used according to each certification body's manual."] },
      { h: "TI-QMS platform", p: ["TI-QMS access is personal. You are responsible for keeping your credentials safe and for telling us if you suspect unauthorised use."] },
      { h: "Links to other sites", p: ["Links to third-party sites such as WhatsApp or Google Maps are provided for convenience. We are not responsible for their content or policies."] },
      { h: "Liability", p: ["We aim to keep the information complete and current, but we don't guarantee the site is free of errors or interruptions. We are not liable for decisions made on the site's general information alone."] },
      { h: "Governing law and changes", p: ["These terms are governed by the laws of Colombia. We may update them; the version in force is the one published on this page."] },
    ],
  },
  consent: {
    title: "Cookies",
    text: "We use cookies the site needs to work and, if you accept, analytics cookies to understand how it is used and improve it.",
    accept: "Accept analytics",
    reject: "Necessary only",
    more: "More information",
  },
};

const extras: Record<Locale, Extra> = { es, pt, en };
export const getExtra = (lang: Locale) => extras[lang];

/** Date the legal pages were last revised (shown on them). */
export const LEGAL_UPDATED = "2026-11-05";
