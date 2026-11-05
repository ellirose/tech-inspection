// Frequently asked questions (design document §8.9, the AEO hub). Seed data, edited under Contenido →
// Preguntas frecuentes. Each answer opens with a direct reply of about 40 to 60 words (§16.4) and states
// only facts published elsewhere on the site: no prices, dates or turnaround times. [CONFIRM with the client]
import type { L10n } from "@/i18n/config";
import type { MethodKey } from "./methods";
import { QAQC_SLUG } from "./modules";

export const faqCategories = ["general", "metodos", "certificaciones", "proceso", "plataforma", "comercial"] as const;
export type FaqCategory = (typeof faqCategories)[number];

export type Faq = {
  category: FaqCategory;
  question: L10n;
  answer: L10n;
  methods?: MethodKey[];
  services?: string[];
  /** Shown in the FAQ preview on the home page (4 to 6 questions). */
  home?: boolean;
};

export const faqs: Faq[] = [
  {
    category: "general",
    home: true,
    question: {
      es: "¿Qué son los ensayos no destructivos y para qué sirven?",
      pt: "O que são ensaios não destrutivos e para que servem?",
      en: "What is non-destructive testing and what is it for?",
    },
    answer: {
      es: "Los ensayos no destructivos (END o NDT) son técnicas que revelan grietas, poros, corrosión y otras discontinuidades sin dañar la pieza, que puede seguir en servicio. Sirven para decidir con datos si una herramienta, tubería o estructura es apta, evitar fallas en operación y documentar su estado frente a la norma aplicable.",
      pt: "Os ensaios não destrutivos (END ou NDT) são técnicas que revelam trincas, poros, corrosão e outras descontinuidades sem danificar a peça, que pode continuar em serviço. Servem para decidir com dados se uma ferramenta, tubulação ou estrutura está apta, evitar falhas em operação e documentar seu estado conforme a norma aplicável.",
      en: "Non-destructive testing (NDT) covers techniques that reveal cracks, porosity, corrosion and other discontinuities without damaging the part, which can stay in service. It lets you decide on evidence whether a tool, pipe or structure is fit for use, prevent failures in operation and document its condition against the applicable code.",
    },
  },
  {
    category: "metodos",
    home: true,
    methods: ["pt", "mt"],
    question: {
      es: "¿Qué diferencia hay entre líquidos penetrantes y partículas magnéticas?",
      pt: "Qual a diferença entre líquidos penetrantes e partículas magnéticas?",
      en: "What is the difference between liquid penetrant and magnetic particle testing?",
    },
    answer: {
      es: "Los líquidos penetrantes revelan imperfecciones abiertas a la superficie en materiales no porosos, metálicos o no. Las partículas magnéticas solo sirven en materiales ferromagnéticos, pero detectan discontinuidades en la superficie y también cerca de ella. En acero al carbono suele preferirse partículas magnéticas; en aluminio, acero inoxidable o no metálicos, penetrantes.",
      pt: "Os líquidos penetrantes revelam imperfeições abertas à superfície em materiais não porosos, metálicos ou não. As partículas magnéticas servem apenas para materiais ferromagnéticos, mas detectam descontinuidades na superfície e também próximas a ela. Em aço carbono costuma-se preferir partículas magnéticas; em alumínio, aço inoxidável ou não metálicos, penetrantes.",
      en: "Liquid penetrant reveals flaws open to the surface in non-porous materials, metallic or not. Magnetic particle testing works only on ferromagnetic materials, but finds discontinuities at the surface and just below it. On carbon steel magnetic particles are usually preferred; on aluminium, stainless steel or non-metals, penetrant.",
    },
  },
  {
    category: "metodos",
    home: true,
    methods: ["ut"],
    question: {
      es: "¿Cuándo se recomienda la inspección por ultrasonido?",
      pt: "Quando é recomendada a inspeção por ultrassom?",
      en: "When is ultrasonic testing recommended?",
    },
    answer: {
      es: "El ultrasonido se recomienda cuando hay que ver dentro del material: medir espesores de pared, evaluar corrosión o localizar discontinuidades internas en tuberías, conexiones, líneas de presión y tanques. Las ondas de alta frecuencia permiten estimar la posición, el tamaño y la orientación de cada indicación sin cortar ni desarmar la pieza.",
      pt: "O ultrassom é recomendado quando é preciso ver dentro do material: medir espessuras de parede, avaliar corrosão ou localizar descontinuidades internas em tubos, conexões, linhas de pressão e tanques. As ondas de alta frequência permitem estimar a posição, o tamanho e a orientação de cada indicação sem cortar nem desmontar a peça.",
      en: "Ultrasonic testing is recommended when you need to see inside the material: measuring wall thickness, assessing corrosion or locating internal discontinuities in pipe, connections, pressure lines and tanks. High-frequency waves give the position, size and orientation of each indication without cutting or dismantling the part.",
    },
  },
  {
    category: "metodos",
    methods: ["vt"],
    question: {
      es: "¿Qué incluye la inspección visual y dimensional?",
      pt: "O que inclui a inspeção visual e dimensional?",
      en: "What does visual and dimensional inspection include?",
    },
    answer: {
      es: "Es la primera verificación de toda pieza: revisamos a la vista y con instrumentos calibrados su estado general, desgaste, daños, roscas y conexiones, y medimos las dimensiones críticas para compararlas con las tolerancias del fabricante o de la norma. Sus resultados indican si se requieren otros ensayos, como ultrasonido o partículas magnéticas.",
      pt: "É a primeira verificação de toda peça: revisamos visualmente e com instrumentos calibrados seu estado geral, desgaste, danos, roscas e conexões, e medimos as dimensões críticas para compará-las com as tolerâncias do fabricante ou da norma. Seus resultados indicam se são necessários outros ensaios, como ultrassom ou partículas magnéticas.",
      en: "It is the first check on any part: we examine its general condition, wear, damage, threads and connections by eye and with calibrated instruments, and measure critical dimensions against the manufacturer's or the code's tolerances. The results show whether other tests, such as ultrasonic or magnetic particle testing, are needed.",
    },
  },
  {
    category: "certificaciones",
    home: true,
    question: {
      es: "¿Qué certificaciones tienen sus inspectores?",
      pt: "Quais certificações seus inspetores têm?",
      en: "What certifications do your inspectors hold?",
    },
    answer: {
      es: "Nuestros inspectores son Nivel II, calificados según la práctica recomendada ASNT SNT-TC-1A, y aplican los criterios de inspección y aceptación del estándar DS-1 a los componentes de perforación. Cada informe identifica al inspector responsable, para que usted sepa quién evaluó su equipo y con qué calificación.",
      pt: "Nossos inspetores são Nível II, qualificados conforme a prática recomendada ASNT SNT-TC-1A, e aplicam os critérios de inspeção e aceitação do padrão DS-1 aos componentes de perfuração. Cada relatório identifica o inspetor responsável, para que você saiba quem avaliou seu equipamento e com qual qualificação.",
      en: "Our inspectors are Level II, qualified to the ASNT SNT-TC-1A recommended practice, and apply the DS-1 inspection and acceptance criteria to drilling components. Each report names the responsible inspector, so you know who assessed your equipment and with what qualification.",
    },
  },
  {
    category: "certificaciones",
    question: {
      es: "¿Qué certificaciones tiene la empresa?",
      pt: "Quais certificações a empresa tem?",
      en: "What certifications does the company hold?",
    },
    answer: {
      es: "Tech-Inspection está certificada en ISO 9001 (gestión de calidad) e ISO 45001 (seguridad y salud en el trabajo) por el Consejo Colombiano de Seguridad desde 2018, cumple el Decreto 1072 de 2015 y, desde 2020, está avalada por el mismo Consejo bajo la guía RUC para contratistas. Puede consultar el detalle en nuestra página de certificaciones.",
      pt: "A Tech-Inspection é certificada ISO 9001 (gestão da qualidade) e ISO 45001 (saúde e segurança ocupacional) pelo Conselho Colombiano de Segurança desde 2018, cumpre o Decreto 1072 de 2015 e, desde 2020, é avalizada pelo mesmo Conselho sob o guia RUC para contratistas. Veja os detalhes em nossa página de certificações.",
      en: "Tech-Inspection has been certified to ISO 9001 (quality management) and ISO 45001 (occupational health and safety) by the Colombian Safety Council since 2018, complies with Decree 1072 of 2015 and, since 2020, has been endorsed by the same Council under the RUC guide for contractors. See the details on our certifications page.",
    },
  },
  {
    category: "proceso",
    home: true,
    question: {
      es: "¿Cómo recibo el informe de inspección?",
      pt: "Como recebo o relatório de inspeção?",
      en: "How do I receive the inspection report?",
    },
    answer: {
      es: "Cada inspección termina en un informe técnico con los resultados, la norma aplicada y el registro fotográfico. Además, nuestros clientes consultan sus informes, certificados y la trazabilidad de cada pieza en línea en TI-QMS, nuestra plataforma de gestión de calidad, con el usuario que les asignamos.",
      pt: "Cada inspeção termina em um relatório técnico com os resultados, a norma aplicada e o registro fotográfico. Além disso, nossos clientes consultam seus relatórios, certificados e a rastreabilidade de cada peça on-line no TI-QMS, nossa plataforma de gestão da qualidade, com o usuário que atribuímos.",
      en: "Every inspection ends in a technical report with the results, the code applied and a photo record. Our clients can also look up their reports, certificates and the traceability of each part online in TI-QMS, our quality management platform, with the account we set up for them.",
    },
  },
  {
    category: "proceso",
    question: {
      es: "¿Trabajan en campo o en sus instalaciones?",
      pt: "Vocês trabalham em campo ou em suas instalações?",
      en: "Do you work in the field or at your facility?",
    },
    answer: {
      es: "Las dos cosas. Inspeccionamos en nuestra base de la Vía Siberia (Autopista Medellín Km 3.4), a donde puede enviar sus herramientas, y también desplazamos inspectores y equipos a su locación o campo. Al pedir la cotización indique la ciudad o el campo y un asesor le confirma la cobertura.",
      pt: "As duas coisas. Inspecionamos em nossa base na Vía Siberia (Autopista Medellín Km 3.4), para onde você pode enviar suas ferramentas, e também deslocamos inspetores e equipamentos até sua locação ou campo. Ao pedir o orçamento, indique a cidade ou o campo e um consultor confirma a cobertura.",
      en: "Both. We inspect at our base on the Vía Siberia (Autopista Medellín Km 3.4), where you can send your tools, and we also send inspectors and equipment to your site or field. When you request a quote, give the city or field and an advisor will confirm coverage.",
    },
  },
  {
    category: "proceso",
    question: {
      es: "¿Cuánto tarda una inspección?",
      pt: "Quanto tempo leva uma inspeção?",
      en: "How long does an inspection take?",
    },
    answer: {
      es: "Depende del método, de la cantidad y el tipo de piezas y de si el trabajo se hace en nuestra base o en su locación. Por eso no damos un plazo general: cuéntenos qué necesita inspeccionar y para cuándo, y en la cotización un asesor le confirma la fecha de inicio y de entrega del informe.",
      pt: "Depende do método, da quantidade e do tipo de peças e de o trabalho ser feito em nossa base ou na sua locação. Por isso não damos um prazo geral: conte-nos o que precisa inspecionar e para quando, e no orçamento um consultor confirma a data de início e de entrega do relatório.",
      en: "It depends on the method, the number and type of parts, and whether the work is done at our base or at your site. That is why we don't quote a general timeframe: tell us what needs inspecting and by when, and an advisor will confirm the start date and report delivery in the quote.",
    },
  },
  {
    category: "plataforma",
    question: {
      es: "¿Qué es TI-QMS y cómo accedo?",
      pt: "O que é o TI-QMS e como acesso?",
      en: "What is TI-QMS and how do I sign in?",
    },
    answer: {
      es: "TI-QMS es nuestra plataforma de gestión de calidad: reúne en línea los informes, certificados y la trazabilidad de cada inspección. Clientes y colaboradores entran con el usuario que les asigna Tech-Inspection desde el botón de acceso del sitio. Si aún no tiene usuario, solicítelo a su asesor comercial.",
      pt: "O TI-QMS é nossa plataforma de gestão da qualidade: reúne on-line os relatórios, certificados e a rastreabilidade de cada inspeção. Clientes e colaboradores entram com o usuário atribuído pela Tech-Inspection pelo botão de acesso do site. Se ainda não tem usuário, solicite-o ao seu consultor comercial.",
      en: "TI-QMS is our quality management platform: it brings together the reports, certificates and traceability of every inspection online. Clients and staff sign in with the account Tech-Inspection gives them, from the access button on the site. If you don't have an account yet, ask your sales advisor.",
    },
  },
  {
    category: "comercial",
    question: {
      es: "¿Cómo solicito una cotización?",
      pt: "Como solicito um orçamento?",
      en: "How do I request a quote?",
    },
    answer: {
      es: "Complete el cotizador del sitio en unos pasos: qué necesita inspeccionar, cuántas piezas, dónde y con qué prioridad, y sus datos de contacto. También puede escribirnos por WhatsApp o al asistente del sitio. Un asesor revisa la solicitud y le responde en horario hábil con la propuesta.",
      pt: "Preencha o orçamento do site em poucos passos: o que precisa inspecionar, quantas peças, onde e com qual prioridade, e seus dados de contato. Também pode nos escrever pelo WhatsApp ou pelo assistente do site. Um consultor revisa a solicitação e responde em horário comercial com a proposta.",
      en: "Fill in the quote form on the site in a few steps: what needs inspecting, how many parts, where and how urgently, and your contact details. You can also message us on WhatsApp or through the site's assistant. An advisor reviews the request and replies with a proposal during business hours.",
    },
  },
  {
    category: "comercial",
    services: ["tuberia", "componentes-bha", "brocas"],
    question: {
      es: "¿Inspeccionan herramientas de perforación según DS-1?",
      pt: "Vocês inspecionam ferramentas de perfuração conforme o DS-1?",
      en: "Do you inspect drilling tools to DS-1?",
    },
    answer: {
      es: "Sí. Inspeccionamos tubería de perforación, componentes de BHA y brocas aplicando los criterios de inspección y aceptación del estándar DS-1, con inspectores Nivel II. Combinamos inspección visual y dimensional, partículas magnéticas y ultrasonido según el componente, y entregamos un reporte técnico con registro fotográfico.",
      pt: "Sim. Inspecionamos tubos de perfuração, componentes de BHA e brocas aplicando os critérios de inspeção e aceitação do padrão DS-1, com inspetores Nível II. Combinamos inspeção visual e dimensional, partículas magnéticas e ultrassom conforme o componente, e entregamos um relatório técnico com registro fotográfico.",
      en: "Yes. We inspect drill pipe, BHA components and bits to the DS-1 inspection and acceptance criteria, with Level II inspectors. We combine visual and dimensional inspection, magnetic particle and ultrasonic testing as each component requires, and deliver a technical report with a photo record.",
    },
  },
  {
    category: "comercial",
    services: [QAQC_SLUG],
    question: {
      es: "¿Qué es el aseguramiento de calidad QA/QC que ofrecen?",
      pt: "O que é a garantia da qualidade QA/QC que vocês oferecem?",
      en: "What is the QA/QC service you offer?",
    },
    answer: {
      es: "Es un servicio distinto a la inspección: acompañamos a compañías prestadoras de servicios en sus procesos internos de mantenimiento e inspección de herramientas de Oil & Gas. Asignamos un especialista por tipo de herramienta, alineamos el proceso con el suyo y entregamos reportes en tiempo real.",
      pt: "É um serviço diferente da inspeção: acompanhamos empresas prestadoras de serviços em seus processos internos de manutenção e inspeção de ferramentas de Oil & Gas. Designamos um especialista por tipo de ferramenta, alinhamos o processo com o seu e entregamos relatórios em tempo real.",
      en: "It is a separate service from inspection: we support service companies in their in-house maintenance and inspection processes for oil and gas tools. We assign a specialist per tool type, align the process with yours and deliver real-time reports.",
    },
  },
];
