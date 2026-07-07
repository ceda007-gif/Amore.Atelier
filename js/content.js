/* Amore Atelier — static content: UI strings (i18n) and editable defaults. */
window.AA_WA_BASE = 'https://wa.me/526243552989';

window.AA_I18N = {
  es: {
    navInicio: 'Inicio', navNosotros: 'Nosotros', navServicios: 'Servicios', navPortafolio: 'Portafolio', navContacto: 'Contacto',
    cotizar: 'Cotizar', heroCta1: 'Solicitar cotización', heroCta2: 'Ver portafolio', verTodo: 'Ver todo →',
    ctaWhatsapp: 'Escríbenos por WhatsApp', ebNosotros: 'Nosotros', ebServicios: 'Servicios', ebPortafolio: 'Portafolio', ebContacto: 'Contacto',
    waLabel: 'WhatsApp', fNombre: 'Nombre', fNombrePh: 'Tu nombre', fFecha: 'Fecha de la boda', fFechaPh: 'Ej. 14 de febrero, 2027',
    fServicio: 'Servicio de interés', fMensaje: 'Mensaje', fMensajePh: 'Cuéntanos tu idea…', fEnviar: 'Enviar por WhatsApp',
    lEstudio: 'Estudio', lCobertura: 'Cobertura', footNav: 'Navegación', footContacto: 'Contacto', footEditar: 'Editar sitio',
    copyright: '© 2026 Amore Atelier · Hecho con amor en Los Cabos',
    heroPh: 'Foto principal — un letrero de bienvenida', galPh: 'Foto de portafolio ',
    selectOpts: ['Letreros de bienvenida', 'Seating chart', 'Papelería de mesa', 'Señalética del evento', 'Todo lo anterior'],
    filters: { todos: 'Todos', letreros: 'Letreros', seating: 'Seating', papeleria: 'Papelería', senaletica: 'Señalética' },
    gtags: ['Bienvenida', 'Seating', 'Menú', 'Bienvenida', 'Señalética', 'Place cards', 'Seating', 'Bienvenida', 'Minuta'],
    tags: [['Acrílico', 'Espejo', 'Caligrafía', 'Gran formato'], ['Por mesa', 'Alfabético', 'Impreso', 'Montaje'], ['Menús', 'Minutas', 'Place cards', 'Números'], ['Direccionales', 'Programa', 'Bar', 'Detalles']],
    seoBrand: 'Amore Atelier',
    seoDesc: 'Piezas hechas a mano para que tu boda en Los Cabos se sienta tuya: letreros de bienvenida, seating charts y menús a medida, con entrega e instalación en tu venue. Cotiza por WhatsApp.',
    seoTitles: {
      inicio: 'Señalética y papelería para bodas en Los Cabos — letreros, seating charts y menús a medida',
      nosotros: 'Nosotros · Estudio de papelería de bodas en Los Cabos',
      servicios: 'Servicios: letreros, seating charts y papelería de boda · Los Cabos',
      portafolio: 'Portafolio de bodas en Los Cabos',
      contacto: 'Contacto y cotizaciones · Bodas en Los Cabos',
      admin: 'Panel de edición'
    },
    waPrefill: 'Hola Amore Atelier 👋 Me gustaría cotizar la papelería de mi boda.',
    formMsg: (f) => `Hola Amore Atelier 👋\n\nSoy ${f.nombre || '[nombre]'}.\nFecha de la boda: ${f.fecha || '[por definir]'}\nServicio: ${f.servicio}\n\n${f.mensaje || 'Me gustaría cotizar mi papelería.'}`
  },
  en: {
    navInicio: 'Home', navNosotros: 'About', navServicios: 'Services', navPortafolio: 'Portfolio', navContacto: 'Contact',
    cotizar: 'Get a quote', heroCta1: 'Request a quote', heroCta2: 'View portfolio', verTodo: 'View all →',
    ctaWhatsapp: 'Message us on WhatsApp', ebNosotros: 'About us', ebServicios: 'Services', ebPortafolio: 'Portfolio', ebContacto: 'Contact',
    waLabel: 'WhatsApp', fNombre: 'Name', fNombrePh: 'Your name', fFecha: 'Wedding date', fFechaPh: 'e.g. February 14, 2027',
    fServicio: 'Service of interest', fMensaje: 'Message', fMensajePh: 'Tell us your idea…', fEnviar: 'Send via WhatsApp',
    lEstudio: 'Studio', lCobertura: 'Coverage', footNav: 'Navigation', footContacto: 'Contact', footEditar: 'Edit site',
    copyright: '© 2026 Amore Atelier · Made with love in Los Cabos',
    heroPh: 'Main photo — a welcome sign', galPh: 'Portfolio photo ',
    selectOpts: ['Welcome signs', 'Seating chart', 'Table stationery', 'Event signage', 'All of the above'],
    filters: { todos: 'All', letreros: 'Signs', seating: 'Seating', papeleria: 'Stationery', senaletica: 'Signage' },
    gtags: ['Welcome', 'Seating', 'Menu', 'Welcome', 'Signage', 'Place cards', 'Seating', 'Welcome', 'Program'],
    tags: [['Acrylic', 'Mirror', 'Calligraphy', 'Large format'], ['By table', 'Alphabetical', 'Printed', 'Display'], ['Menus', 'Programs', 'Place cards', 'Numbers'], ['Directional', 'Program', 'Bar', 'Details']],
    seoBrand: 'Amore Atelier',
    seoDesc: 'Hand-crafted pieces that make your Los Cabos wedding feel like yours — custom welcome signs, seating charts and day-of stationery, delivered and installed at your venue. Get a quote on WhatsApp.',
    seoTitles: {
      inicio: 'Wedding Signage & Stationery in Los Cabos — Welcome Signs, Seating Charts & Menus',
      nosotros: 'About us · Wedding stationery studio in Los Cabos',
      servicios: 'Services: welcome signs, seating charts & stationery · Los Cabos',
      portafolio: 'Wedding portfolio in Los Cabos',
      contacto: 'Contact & quotes · Weddings in Los Cabos',
      admin: 'Edit panel'
    },
    waPrefill: 'Hi Amore Atelier 👋 I would like a quote for my wedding stationery.',
    formMsg: (f) => `Hi Amore Atelier 👋\n\nI'm ${f.nombre || '[name]'}.\nWedding date: ${f.fecha || '[TBD]'}\nService: ${f.servicio}\n\n${f.mensaje || "I'd like a quote for my stationery."}`
  }
};

window.AA_DEFAULTS = {
  es: {
    heroLoc: 'Los Cabos, B.C.S.', heroTitleA: 'El arte impreso', heroTitleB: "del 'Sí, acepto'",
    heroSub: 'Letreros de bienvenida, seating charts y papelería de mesa pintados y armados a mano en nuestro taller de Los Cabos — piezas hechas para bodas de destino que no se sienten genéricas.',
    manifesto: 'Cada boda tiene una voz. Nuestro trabajo es imprimirla a mano — en el papel, en la tinta y en cada detalle que reciben tus invitados.',
    servEyebrow: 'Lo que creamos', servTitle: 'Nuestros servicios', procEyebrow: 'Cómo trabajamos', procTitle: 'Un proceso sin prisas',
    quoteScript: 'con todo el corazón', quoteText: '"Amore Atelier convirtió una idea en la boda que soñábamos. Cada letrero, cada menú, perfecto."', quoteAuthor: 'Ana & Diego — Hotel El Ganzo, Los Cabos',
    plannersEyebrow: 'Wedding planners', plannersTitle: 'Tu aliado logístico para cada boda',
    plannersText: 'Trabajamos codo a codo con planners: mockup de aprobación antes de producir, tiempos de producción claros, y entrega e instalación directo en el venue el día del evento. Sin sorpresas de última hora.',
    plannersCta: 'Coordinemos tu próxima boda',
    aboutHeading: 'Sobre nosotros',
    aboutBody1: 'Amore Atelier nació de una pasión por el diseño, el amor y, por supuesto, las bodas. Nos encanta dar vida a las ideas de cada pareja, transformándolas en piezas pensadas con intención y significado que realzan su día especial.',
    aboutBody2: 'Nuestro trabajo se centra en crear armonía, equilibrio estético, coherencia y personalidad, cuidando que cada detalle se sienta refinado y bellamente conectado.',
    aboutBody3: 'Para nosotros es esencial que cada pareja se sienta escuchada, acompañada y segura de que su visión será cuidadosamente traducida en el día de su boda, con atención y cariño.',
    aboutHeading2: 'El equipo detrás',
    aboutFoundersLead: 'Detrás de este proyecto están', aboutFoundersNames: 'Dariana & Aldo', aboutFoundersRest: ', quienes trabajan mano a mano para crear propuestas visuales donde cada detalle refleja profesionalismo, sensibilidad y cariño genuino.',
    svcPageTitle: 'Todo lo impreso de tu boda', svcPageIntro: 'Diseño a medida, papeles seleccionados y acabados cuidados. Cada pieza se coordina para que tu evento se sienta de una sola pieza.', svcCtaTitle: '¿Empezamos tu papelería?',
    portTitle: 'Bodas que hemos vestido',
    contactTitle: 'Hablemos de tu boda', contactIntro: 'Cuéntanos tu fecha y lo que imaginas. Respondemos personalmente, sin plantillas.',
    estudioVal: 'Los Cabos, B.C.S.', coberturaVal: 'Toda Baja California Sur', formTitle: 'Solicita tu cotización',
    footerDesc: "El arte impreso del 'Sí, acepto'. Papelería y señalética de boda a medida, desde Los Cabos.",
    services: [
      { title: 'Letreros de bienvenida', short: 'La primera pieza que ven tus invitados al llegar.', long: 'Grandes formatos en acrílico, espejo, madera o papel, pintados y calibrados a mano en nuestro taller. El primer vistazo que anuncia el tono de tu celebración desde la entrada del venue.' },
      { title: 'Seating charts', short: 'Que cada invitado encuentre su lugar con estilo.', long: 'Planos de mesa claros y bellos: por mesa, alfabético o por familia, con instalación resuelta el día del evento para que no sea un pendiente tuyo.' },
      { title: 'Papelería de mesa', short: 'Menús, minutas y place cards coordinados.', long: 'Menús, minutas, place cards y números de mesa: tu day-of stationery coordinada en un mismo lenguaje visual, lista para tu venue.' },
      { title: 'Señalética del evento', short: 'Guía a tus invitados por cada momento.', long: 'Ceremonia, cóctel, cena y fiesta: señales, letreros direccionales y detalles instalados en sitio para que todo fluya sin una sola duda.' }
    ],
    steps: [
      { title: 'Conversamos', desc: 'Escuchamos tu historia, tu fecha y tu estética. Todo empieza con una charla sin compromiso.' },
      { title: 'Diseñamos', desc: 'Creamos propuestas a medida y ajustamos cada detalle contigo hasta que sea perfecto.' },
      { title: 'Imprimimos y entregamos', desc: 'Producción cuidada, materiales nobles y entrega puntual el día que más importa.' }
    ]
  },
  en: {
    heroLoc: 'Los Cabos, B.C.S.', heroTitleA: 'The printed art', heroTitleB: "of the 'I do'",
    heroSub: 'Hand-crafted welcome signs, seating charts and day-of stationery — bespoke pieces made in our Los Cabos studio for destination weddings that don’t feel off-the-shelf.',
    manifesto: 'Every wedding has a voice. Our job is to print it by hand — on the paper, in the ink, and in every detail your guests receive.',
    servEyebrow: 'What we create', servTitle: 'Our services', procEyebrow: 'How we work', procTitle: 'An unhurried process',
    quoteScript: 'with all our heart', quoteText: '"Amore Atelier turned an idea into the wedding we dreamed of. Every sign, every menu, perfect."', quoteAuthor: 'Ana & Diego — Hotel El Ganzo, Los Cabos',
    plannersEyebrow: 'Wedding Planners', plannersTitle: 'Your logistics partner for every wedding',
    plannersText: 'We work hand in hand with planners: an approval mockup before we print, clear production timelines, and on-site delivery and installation at your venue on the day. No last-minute surprises.',
    plannersCta: "Let's coordinate your next wedding",
    aboutHeading: 'About Us',
    aboutBody1: "Amore Atelier was born from a passion for design, love and, of course, weddings. We love bringing each couple's ideas to life, transforming them into thoughtfully designed pieces that enhance their special day with intention and meaning.",
    aboutBody2: 'Our work focuses on creating harmony, aesthetic balance, coherence and personality, ensuring every detail feels refined and beautifully connected.',
    aboutBody3: 'For us, it is essential that our couples feel heard, guided and confident that their vision will be carefully translated into their wedding day with attention and care.',
    aboutHeading2: 'About Us',
    aboutFoundersLead: 'Behind this project are', aboutFoundersNames: 'Dariana & Aldo', aboutFoundersRest: ', who work hand in hand to create visual proposals where every detail reflects professionalism, sensitivity and heartfelt care.',
    svcPageTitle: 'Everything printed for your wedding', svcPageIntro: 'Bespoke design, carefully selected papers and refined finishes. Every piece is coordinated so your event feels of one piece.', svcCtaTitle: 'Shall we begin your stationery?',
    portTitle: 'Weddings we have dressed',
    contactTitle: "Let's talk about your wedding", contactIntro: 'Tell us your date and what you imagine. We reply personally, no templates.',
    estudioVal: 'Los Cabos, B.C.S.', coberturaVal: 'All of Baja California Sur', formTitle: 'Request your quote',
    footerDesc: "The printed art of the 'I do'. Bespoke wedding stationery and signage, from Los Cabos.",
    services: [
      { title: 'Welcome signs', short: 'The first piece your guests see on arrival.', long: 'Large-format acrylic, mirror, wood or paper signs, hand-lettered and painted in our studio. Your custom welcome sign sets the tone the moment guests step into the venue.' },
      { title: 'Seating charts', short: 'So every guest finds their place in style.', long: 'Clear, beautiful seating charts: by table, alphabetical or by family — delivered and installed on-site so it’s one less thing on your day-of checklist.' },
      { title: 'Table stationery', short: 'Menus, place cards and details in harmony.', long: 'Menus, place cards, table numbers and vow books — your day-of stationery, coordinated in one visual language and ready for your destination wedding.' },
      { title: 'Event signage', short: 'Guide your guests through every moment.', long: 'Ceremony, cocktail hour, dinner and party: directional signs and details, installed on-site so every moment flows without a doubt.' }
    ],
    steps: [
      { title: 'We talk', desc: 'We listen to your story, your date and your aesthetic. It all starts with a no-obligation chat.' },
      { title: 'We design', desc: 'We create bespoke proposals and refine every detail with you until it is perfect.' },
      { title: 'We print & deliver', desc: 'Careful production, fine materials and punctual delivery on the day that matters most.' }
    ]
  }
};

/* Image slots: id -> { defaultSrc, fit } — defaultSrc ships as a real asset; omit for an empty placeholder. */
window.AA_IMAGE_SLOTS = {
  'aa-hero': { defaultSrc: 'assets/hero-portada.jpeg', fit: 'contain' },
  'aa-about1': { fit: 'cover' },
  'aa-about2': { fit: 'cover' },
  'aa-svc1': { defaultSrc: 'assets/svc-letreros.webp', fit: 'cover' },
  'aa-svc2': { fit: 'cover' },
  'aa-svc3': { defaultSrc: 'assets/svc-papeleria.webp', fit: 'cover' },
  'aa-svc4': { fit: 'cover' },
  'aa-g0': { fit: 'cover' }, 'aa-g1': { fit: 'cover' }, 'aa-g2': { fit: 'cover' },
  'aa-g3': { fit: 'cover' }, 'aa-g4': { fit: 'cover' }, 'aa-g5': { fit: 'cover' },
  'aa-g6': { fit: 'cover' }, 'aa-g7': { fit: 'cover' }, 'aa-g8': { fit: 'cover' }
};
