export type CapabilityLocale = "en" | "pl" | "es";

type CapabilityCopy = {
  eyebrow: string;
  title: string;
  body: string;
  groups: Array<{ icon: string; title: string; body: string; items: string[] }>;
  optionalLabel: string;
  flexibilityEyebrow: string;
  flexibilityTitle: string;
  flexibilityBody: string;
  flexibilityPoints: Array<{ title: string; body: string }>;
  flexibilityCta: string;
  flexibilityNote: string;
  extrasEyebrow: string;
  extrasTitle: string;
  extrasBody: string;
  extras: Array<{ title: string; body: string }>;
  nfcEyebrow: string;
  nfcTitle: string;
  nfcBody: string;
  nfcPoints: string[];
  architectureEyebrow: string;
  architectureTitle: string;
  architectureBody: string;
  architecturePoints: Array<{ title: string; body: string }>;
  legalNote: string;
  legalSource: string;
};

const capabilityCopy: Record<CapabilityLocale, CapabilityCopy> = {
  en: {
    eyebrow: "THE COMPLETE TIMZY ECOSYSTEM",
    title: "A simple booking journey in front. Control, sales and loyalty behind it.",
    body: "Choose the modules that solve today's priorities and expand the app as your business grows. We activate optional elements only when they fit your operating model.",
    groups: [
      { icon: "24", title: "Bookings and daily operations", body: "Give clients a clear self-service journey and your team one current schedule.", items: ["Online booking 24/7", "Services, duration and availability", "Employee calendars, working hours and days off", "Services assigned to selected staff", "Up to 3 employees included at no extra charge", "Post-visit notes and complete client history", "Visit and activity reports"] },
      { icon: "♡", title: "Clients and loyalty", body: "Stay useful after the first booking and create reasons to return.", items: ["Booking confirmations and reminders", "Push news, promotions and updates", "Client profiles and visit history", "Vouchers and welcome offers", "Configurable loyalty rewards", "English, Polish and Spanish support"] },
      { icon: "＋", title: "Shop and payments", body: "Add products and payments to the same branded experience when your model needs them.", items: ["Product catalogue and categories", "Cart, checkout and order history", "Full payment or a deposit when booking", "No Timzy commission on booking payments", "Stock and order status management", "Pickup or delivery options", "Stripe online payments", "Administrative refunds and payment reports"] },
      { icon: "T", title: "Your app and your brand", body: "Timzy provides the technology while your business remains visible at every step.", items: ["Separate iOS and Android app", "Publication under your brand", "Logo, colours, icons and content", "Template or full visual personalisation", "Client, employee and administrator roles", "A separate data environment for each client"] },
    ],
    optionalLabel: "Timzy does not add a commission to bookings or booking payments. Standard Stripe processing fees and fees for other third-party services may still apply.",
    flexibilityEyebrow: "BUILT TO ADAPT",
    flexibilityTitle: "Need a function outside the standard modules? We can design and build it.",
    flexibilityBody: "Timzy is modular, not a closed box. We first understand the workflow and business value, then define a safe extension that fits the rest of your system.",
    flexibilityPoints: [
      { title: "Dedicated modules", body: "Industry-specific journeys, rules, roles, reports and administrative tools." },
      { title: "Integrations and automation", body: "Selected external systems, access control, notifications, payments and data flows." },
      { title: "Multiple locations and teams", body: "Configuration around branches, permissions, specialists and operational differences." },
      { title: "A clear development scope", body: "You receive a feasibility review, defined scope and separate estimate before development begins." },
    ],
    flexibilityCta: "Discuss my custom function",
    flexibilityNote: "Custom development is estimated separately after a feasibility, security and business-value review.",
    extrasEyebrow: "MORE THAN SOFTWARE",
    extrasTitle: "One partner for the app, complete website, online store and brand materials.",
    extrasBody: "These services are prepared individually and can be added to the Timzy implementation.",
    extras: [
      { title: "Complete website or online store", body: "Not only a single landing page. We can create a multi-page website with services, forms, news, SEO foundations and ecommerce, depending on scope." },
      { title: "Branding and design", body: "Logo, colours, icons, app graphics and a consistent visual system." },
      { title: "QR and NFC materials", body: "Stands, cards and posters that take clients directly to the app or booking flow." },
      { title: "Marketing support", body: "Social media support, print materials and launch communication." },
      { title: "Partner screen", body: "An optional launch screen for a sponsor, partner or campaign." },
      { title: "Dedicated features and integrations", body: "When your process needs more than standard modules, we can scope custom functions, automation and integrations separately." },
    ],
    nfcEyebrow: "FROM THE PHYSICAL LOCATION TO A BOOKING",
    nfcTitle: "One tap can take a client straight to your app or booking journey.",
    nfcBody: "We can prepare branded NFC and QR stands, cards, stickers and posters for reception desks, treatment rooms, clubhouses, events or printed materials.",
    nfcPoints: ["Direct access to your app or booking link", "Design consistent with your brand", "Formats adapted to the place and customer journey"],
    architectureEyebrow: "A DIFFERENT DATA MODEL",
    architectureTitle: "A separate client environment instead of one central marketplace database.",
    architectureBody: "Each branded Timzy app points to its own data project. Timzy does not operate a shared seller catalogue where competing businesses and their bookings are combined.",
    architecturePoints: [
      { title: "No central seller catalogue", body: "Your offer is not displayed beside competitors in a shared search marketplace." },
      { title: "No central reservation history", body: "Client records and bookings remain inside the separate environment configured for your app." },
      { title: "Your customer relationship", body: "Your business remains the data controller and owns the direct relationship with its clients." },
    ],
    legalNote: "This describes Timzy's technical architecture. It is not a blanket legal exemption: each business remains responsible for its own tax and reporting obligations, and any DAC7 classification depends on the actual contractual and operating model.",
    legalSource: "Read the Polish Ministry of Finance guidance on DAC7",
  },
  pl: {
    eyebrow: "PEŁNY EKOSYSTEM TIMZY",
    title: "Prosta rezerwacja z przodu. Kontrola, sprzedaż i lojalność na zapleczu.",
    body: "Wybierasz moduły, które rozwiązują dzisiejsze potrzeby, a aplikacja rośnie razem z firmą. Elementy opcjonalne włączamy tylko wtedy, gdy pasują do Twojego modelu pracy.",
    groups: [
      { icon: "24", title: "Rezerwacje i codzienna organizacja", body: "Klient sam przechodzi przez prosty proces, a zespół pracuje na jednym aktualnym grafiku.", items: ["Rezerwacje online 24/7", "Usługi, czas trwania i dostępność", "Grafiki pracowników, godziny pracy i dni wolne", "Przypisywanie usług do pracowników", "Do 3 pracowników bez dodatkowej opłaty", "Notatki po wizycie i pełna historia klienta", "Raporty wizyt i aktywności"] },
      { icon: "♡", title: "Klienci i lojalność", body: "Pozostań blisko klienta po pierwszej rezerwacji i daj mu powód do powrotu.", items: ["Potwierdzenia i przypomnienia o rezerwacji", "Powiadomienia PUSH o nowościach i promocjach", "Profile klientów i historia wizyt", "Vouchery i oferty powitalne", "Konfigurowalne nagrody lojalnościowe", "Obsługa języka polskiego, angielskiego i hiszpańskiego"] },
      { icon: "＋", title: "Sklep i płatności", body: "Jeśli Twój model tego potrzebuje, dodaj produkty i płatności do tego samego doświadczenia.", items: ["Katalog produktów i kategorie", "Koszyk, checkout i historia zamówień", "Płatność całości lub części kwoty przy rezerwacji", "Brak prowizji Timzy od płatności za rezerwację", "Kontrola zapasu i statusów zamówień", "Odbiór osobisty lub dostawa", "Płatności online Stripe", "Zwroty i raporty płatności dla administratora"] },
      { icon: "T", title: "Twoja aplikacja i marka", body: "Timzy dostarcza technologię, a Twoja firma pozostaje widoczna na każdym ekranie.", items: ["Osobna aplikacja na iOS i Android", "Publikacja pod marką klienta", "Logo, kolory, ikony i własne treści", "Szablon lub pełna personalizacja wizualna", "Role klienta, pracownika i administratora", "Osobne środowisko danych dla każdego klienta"] },
    ],
    optionalLabel: "Timzy nie dolicza prowizji do rezerwacji ani płatności za rezerwację. Nadal mogą obowiązywać standardowe opłaty operatora Stripe oraz innych usług zewnętrznych.",
    flexibilityEyebrow: "SYSTEM, KTÓRY DOPASOWUJE SIĘ DO FIRMY",
    flexibilityTitle: "Potrzebujesz funkcji, której nie ma na liście? Możemy ją zaprojektować i dorobić.",
    flexibilityBody: "Timzy jest systemem modułowym, a nie zamkniętym pudełkiem. Najpierw poznajemy proces i wartość biznesową, a następnie definiujemy bezpieczne rozszerzenie dopasowane do całego rozwiązania.",
    flexibilityPoints: [
      { title: "Dedykowane moduły", body: "Indywidualne ścieżki branżowe, zasady, role, raporty i narzędzia administratora." },
      { title: "Integracje i automatyzacje", body: "Wybrane systemy zewnętrzne, kontrola dostępu, powiadomienia, płatności i przepływy danych." },
      { title: "Wiele lokalizacji i zespołów", body: "Konfiguracja pod oddziały, uprawnienia, specjalistów oraz różne sposoby pracy." },
      { title: "Jasny zakres rozwoju", body: "Przed rozpoczęciem otrzymujesz analizę wykonalności, opis zakresu i osobną wycenę." },
    ],
    flexibilityCta: "Omów moją funkcję",
    flexibilityNote: "Funkcje dedykowane wyceniamy osobno po analizie wykonalności, bezpieczeństwa i wartości biznesowej.",
    extrasEyebrow: "WIĘCEJ NIŻ OPROGRAMOWANIE",
    extrasTitle: "Jeden partner dla aplikacji, kompletnej strony WWW, sklepu i materiałów marki.",
    extrasBody: "Poniższe usługi przygotowujemy indywidualnie i możemy dołączyć do wdrożenia Timzy.",
    extras: [
      { title: "Kompletna strona WWW lub sklep internetowy", body: "Nie tylko pojedynczy landing page. Możemy przygotować wielostronicowy serwis z ofertą, stronami usług, formularzami, aktualnościami, podstawami SEO i sklepem, zależnie od zakresu." },
      { title: "Branding i projekt graficzny", body: "Logo, kolorystyka, ikony, grafiki aplikacji i spójny system wizualny." },
      { title: "Materiały QR i NFC", body: "Standy, wizytówki i plakaty prowadzące bezpośrednio do aplikacji lub rezerwacji." },
      { title: "Wsparcie marketingowe", body: "Prowadzenie social media, materiały drukowane i komunikacja startowa." },
      { title: "Ekran partnera", body: "Opcjonalny ekran startowy dla sponsora, partnera biznesowego lub kampanii." },
      { title: "Dedykowane funkcje i integracje", body: "Jeżeli Twój proces wymaga czegoś więcej niż standardowe moduły, możemy osobno zaprojektować i wycenić funkcje, automatyzacje oraz integracje." },
    ],
    nfcEyebrow: "Z FIZYCZNEGO MIEJSCA PROSTO DO REZERWACJI",
    nfcTitle: "Jedno zbliżenie telefonu może otworzyć aplikację lub proces rezerwacji.",
    nfcBody: "Możemy przygotować standy, karty, naklejki i plakaty NFC lub QR pod Twoją marką. Sprawdzą się w recepcji, gabinecie, klubie, podczas wydarzeń oraz na materiałach drukowanych.",
    nfcPoints: ["Bezpośrednie przejście do aplikacji lub rezerwacji", "Projekt spójny z identyfikacją Twojej marki", "Format dopasowany do miejsca i ścieżki klienta"],
    architectureEyebrow: "INNY MODEL DANYCH",
    architectureTitle: "Osobne środowisko klienta zamiast jednej centralnej bazy marketplace'u.",
    architectureBody: "Każda aplikacja Timzy wskazuje własny projekt danych. Timzy nie prowadzi wspólnego katalogu sprzedawców, w którym łączone są oferty konkurencyjnych firm i ich rezerwacje.",
    architecturePoints: [
      { title: "Brak centralnego katalogu sprzedawców", body: "Twoja oferta nie jest wyświetlana obok konkurencji we wspólnej wyszukiwarce marketplace'u." },
      { title: "Brak wspólnej historii rezerwacji", body: "Rezerwacje i kartoteki klientów pozostają w osobnym środowisku skonfigurowanym dla Twojej aplikacji." },
      { title: "Twoja relacja z klientem", body: "Twoja firma pozostaje administratorem danych i prowadzi bezpośrednią relację ze swoimi klientami." },
    ],
    legalNote: "Ten opis dotyczy architektury technicznej Timzy. Nie stanowi automatycznej gwarancji zwolnienia prawnego: każda firma odpowiada za własne obowiązki podatkowe i sprawozdawcze, a ewentualna kwalifikacja w ramach DAC7 zależy od rzeczywistego modelu działania i zawartych umów.",
    legalSource: "Sprawdź oficjalne informacje Ministerstwa Finansów o DAC7",
  },
  es: {
    eyebrow: "EL ECOSISTEMA TIMZY COMPLETO",
    title: "Una reserva sencilla por delante. Control, ventas y fidelización por detrás.",
    body: "Elige los módulos que resuelven las prioridades actuales y amplía la app con tu negocio. Activamos los elementos opcionales solo cuando encajan con tu forma de trabajar.",
    groups: [
      { icon: "24", title: "Reservas y trabajo diario", body: "El cliente reserva por sí mismo y el equipo trabaja con una agenda actualizada.", items: ["Reservas online 24/7", "Servicios, duración y disponibilidad", "Agendas, horarios y días libres del equipo", "Servicios asignados a empleados", "Hasta 3 empleados sin coste adicional", "Notas después de la visita e historial completo", "Informes de visitas y actividad"] },
      { icon: "♡", title: "Clientes y fidelización", body: "Sigue siendo útil tras la primera reserva y crea motivos para volver.", items: ["Confirmaciones y recordatorios", "Avisos PUSH de noticias y promociones", "Perfiles e historial de clientes", "Vales y ofertas de bienvenida", "Recompensas de fidelidad configurables", "Soporte en español, inglés y polaco"] },
      { icon: "＋", title: "Tienda y pagos", body: "Añade productos y pagos a la misma experiencia cuando tu modelo lo necesite.", items: ["Catálogo y categorías", "Carrito, checkout e historial de pedidos", "Pago completo o parcial al reservar", "Sin comisión Timzy sobre el pago de la reserva", "Control de stock y estados", "Recogida o entrega", "Pagos online con Stripe", "Reembolsos e informes para administración"] },
      { icon: "T", title: "Tu app y tu marca", body: "Timzy aporta la tecnología y tu negocio sigue visible en cada paso.", items: ["App separada para iOS y Android", "Publicación con tu marca", "Logo, colores, iconos y contenido", "Plantilla o personalización visual completa", "Roles de cliente, empleado y administrador", "Entorno de datos separado para cada cliente"] },
    ],
    optionalLabel: "Timzy no añade comisión a las reservas ni a sus pagos. Pueden aplicarse las tarifas estándar de procesamiento de Stripe y de otros servicios externos.",
    flexibilityEyebrow: "CREADA PARA ADAPTARSE",
    flexibilityTitle: "¿Necesitas una función fuera de los módulos estándar? Podemos diseñarla y desarrollarla.",
    flexibilityBody: "Timzy es modular, no una caja cerrada. Primero entendemos el proceso y el valor de negocio; después definimos una ampliación segura que encaje con todo el sistema.",
    flexibilityPoints: [
      { title: "Módulos dedicados", body: "Recorridos sectoriales, reglas, roles, informes y herramientas administrativas." },
      { title: "Integraciones y automatización", body: "Sistemas externos seleccionados, accesos, avisos, pagos y flujos de datos." },
      { title: "Múltiples sedes y equipos", body: "Configuración para sucursales, permisos, especialistas y distintas formas de trabajar." },
      { title: "Alcance de desarrollo claro", body: "Recibes un análisis de viabilidad, alcance definido y presupuesto separado antes de empezar." },
    ],
    flexibilityCta: "Hablar de mi función",
    flexibilityNote: "El desarrollo a medida se presupuesta por separado tras revisar viabilidad, seguridad y valor de negocio.",
    extrasEyebrow: "MÁS QUE SOFTWARE",
    extrasTitle: "Un socio para la app, la web completa, la tienda online y los materiales de marca.",
    extrasBody: "Estos servicios se preparan de forma individual y pueden añadirse a la implantación de Timzy.",
    extras: [
      { title: "Web completa o tienda online", body: "No solo una landing. Podemos crear una web multipágina con servicios, formularios, noticias, bases SEO y ecommerce, según el alcance." },
      { title: "Branding y diseño", body: "Logo, colores, iconos, gráficos y un sistema visual coherente." },
      { title: "Materiales QR y NFC", body: "Expositores, tarjetas y carteles con acceso directo a la app o reserva." },
      { title: "Apoyo de marketing", body: "Redes sociales, materiales impresos y comunicación de lanzamiento." },
      { title: "Pantalla de colaborador", body: "Pantalla inicial opcional para patrocinador, colaborador o campaña." },
      { title: "Funciones e integraciones dedicadas", body: "Si tu proceso necesita más que los módulos estándar, podemos diseñar y presupuestar funciones, automatizaciones e integraciones." },
    ],
    nfcEyebrow: "DEL ESPACIO FÍSICO DIRECTO A LA RESERVA",
    nfcTitle: "Un toque puede abrir tu app o el proceso de reserva.",
    nfcBody: "Podemos preparar expositores, tarjetas, pegatinas y carteles NFC o QR con tu marca para recepción, consultas, clubes, eventos y materiales impresos.",
    nfcPoints: ["Acceso directo a la app o reserva", "Diseño coherente con tu marca", "Formato adaptado al espacio y recorrido"],
    architectureEyebrow: "UN MODELO DE DATOS DIFERENTE",
    architectureTitle: "Un entorno separado por cliente, no una base central de marketplace.",
    architectureBody: "Cada app Timzy apunta a su propio proyecto de datos. Timzy no opera un catálogo compartido que combine negocios competidores y sus reservas.",
    architecturePoints: [
      { title: "Sin catálogo central de vendedores", body: "Tu oferta no aparece junto a competidores en un buscador compartido." },
      { title: "Sin historial central de reservas", body: "Reservas y fichas permanecen en el entorno separado de tu app." },
      { title: "Tu relación con el cliente", body: "Tu negocio sigue siendo el responsable de los datos y mantiene la relación directa." },
    ],
    legalNote: "Esta descripción se refiere a la arquitectura técnica de Timzy. No constituye una exención legal general: cada negocio sigue siendo responsable de sus obligaciones fiscales y de información, y cualquier clasificación DAC7 depende del modelo contractual y operativo real.",
    legalSource: "Consulta la información oficial del Ministerio de Finanzas de Polonia sobre DAC7",
  },
};

export function ProductCapabilities({ locale, includeArchitecture = true, includeExtras = true }: { locale: CapabilityLocale; includeArchitecture?: boolean; includeExtras?: boolean }) {
  const copy = capabilityCopy[locale];
  return <>
    <section className="capability-catalog" id="capabilities"><div className="section-intro section-intro--wide"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.body}</p></div><div className="capability-grid">{copy.groups.map((group) => <article key={group.title}><span className="capability-icon">{group.icon}</span><h3>{group.title}</h3><p>{group.body}</p><ul>{group.items.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul></article>)}</div><p className="capability-note">{copy.optionalLabel}</p></section>

    <section className="custom-development"><div className="custom-development-copy"><p className="eyebrow">{copy.flexibilityEyebrow}</p><h2>{copy.flexibilityTitle}</h2><p>{copy.flexibilityBody}</p><a className="button" href="#kontakt">{copy.flexibilityCta}<span>→</span></a><small>{copy.flexibilityNote}</small></div><div className="custom-development-grid">{copy.flexibilityPoints.map((point, index) => <article key={point.title}><span>0{index + 1}</span><h3>{point.title}</h3><p>{point.body}</p></article>)}</div></section>

    {includeExtras ? <><section className="implementation-extras"><div className="implementation-heading"><p className="eyebrow">{copy.extrasEyebrow}</p><h2>{copy.extrasTitle}</h2><p>{copy.extrasBody}</p></div><div className="extras-grid">{copy.extras.map((extra, index) => <article key={extra.title}><span>0{index + 1}</span><h3>{extra.title}</h3><p>{extra.body}</p></article>)}</div></section><section className="nfc-showcase" id="nfc"><div className="nfc-showcase-copy"><p className="eyebrow">{copy.nfcEyebrow}</p><h2>{copy.nfcTitle}</h2><p>{copy.nfcBody}</p><ul>{copy.nfcPoints.map(point => <li key={point}><span>✓</span>{point}</li>)}</ul><a className="button" href="#kontakt">{locale === "pl" ? "Zapytaj o materiały NFC / QR" : locale === "es" ? "Consultar materiales NFC / QR" : "Ask about NFC / QR materials"}<span aria-hidden="true">→</span></a></div><figure><img src="/assets/nfc-material-timzy-brochure.png" alt={locale === "pl" ? "Oryginalne standy NFC, kod QR i karty Timzy z broszury produktowej" : locale === "es" ? "Expositores NFC, código QR y tarjetas Timzy del folleto del producto" : "Original Timzy NFC stands, QR code and cards from the product brochure"} width="1700" height="1050" loading="lazy" /><figcaption>{locale === "pl" ? "Stand NFC, stand QR i karta Timzy przedstawione w oficjalnej broszurze produktowej." : locale === "es" ? "Expositor NFC, expositor QR y tarjeta Timzy del folleto oficial del producto." : "Timzy NFC stand, QR stand and card shown in the official product brochure."}</figcaption></figure></section></> : null}

    {includeArchitecture ? <section className="data-architecture"><div className="data-architecture-copy"><p className="eyebrow">{copy.architectureEyebrow}</p><h2>{copy.architectureTitle}</h2><p>{copy.architectureBody}</p><small>{copy.legalNote}<a href="https://podatki.gov.pl/podatkowa-wspolpraca-miedzynarodowa/dpi-digital-platform-information" target="_blank" rel="noreferrer">{copy.legalSource} →</a></small></div><div className="data-architecture-grid">{copy.architecturePoints.map((point, index) => <article key={point.title}><span>0{index + 1}</span><h3>{point.title}</h3><p>{point.body}</p></article>)}</div></section> : null}
  </>;
}
