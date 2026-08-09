export type CustomerValueLocale = "en" | "pl" | "es";

type CustomerValueCopy = {
  ownershipEyebrow: string;
  ownershipTitle: string;
  ownershipLead: string;
  ownershipStatement: string;
  ownershipPoints: Array<{ title: string; body: string }>;
  ownershipPromise: string;
  ownershipLegal: string;
  audienceLabel: string;
  audiences: string[];
  templateEyebrow: string;
  templateTitle: string;
  templateBody: string;
  readyTitle: string;
  readyBody: string;
  readyPoints: string[];
  customTitle: string;
  customBody: string;
  customPoints: string[];
  templateCta: string;
  templateExamples: string;
  templateReadyLabel: string;
  templateVariantLine: string;
  templateLibraryNote: string;
  showcaseEyebrow: string;
  showcaseTitle: string;
  showcaseBody: string;
  screens: Array<{ src: string; label: string; body: string }>;
};

const customerValueCopy: Record<CustomerValueLocale, CustomerValueCopy> = {
  en: {
    ownershipEyebrow: "YOUR CLIENTS. YOUR RELATIONSHIP.",
    ownershipTitle: "Your clients remain your clients.",
    ownershipLead: "Unlike a classic booking marketplace, Timzy does not put many businesses in one catalogue where they compete for the same customer's attention.",
    ownershipStatement: "Timzy is a tool for your business, not an intermediary between you and your clients.",
    ownershipPoints: [
      { title: "Your branded app", body: "Your name, icon, colours and customer journey instead of a profile inside someone else's platform." },
      { title: "Your separate client environment", body: "Client records and booking history stay in the technical environment configured for your app." },
      { title: "Your direct relationship", body: "Clients book directly with your business, without competing offers placed beside yours." },
      { title: "Your Stripe configuration", body: "When the payment module is enabled, Stripe is configured for the selected business setup." },
      { title: "Your decisions", body: "You control the offer, communication, loyalty mechanics and how the app develops." },
    ],
    ownershipPromise: "We do not use your customer base to promote competing businesses or build a shared marketplace catalogue.",
    ownershipLegal: "For a client-branded implementation, your business remains the controller of its customer data. Timzy provides the technology under the agreed service and data-processing terms.",
    audienceLabel: "A particularly strong advantage for",
    audiences: ["Golf clubs", "Premium coaches", "SPA", "Clinics", "Premium beauty"],
    templateEyebrow: "YOUR STYLE, YOUR CHOICE",
    templateTitle: "Start from a proven template or commission a fully custom design.",
    templateBody: "The technology stays the same. What changes is the visual direction, modules and customer journey selected for your business.",
    readyTitle: "Ready-made template",
    readyBody: "Choose a proven Timzy direction and adapt it to your logo, colours, services, team and content.",
    readyPoints: ["Faster visual setup", "Proven mobile layouts", "Your logo, palette and content", "Selected modules and menu"],
    customTitle: "Custom design",
    customBody: "We create a distinct visual system around your brand, positioning and customer experience.",
    customPoints: ["Individual art direction", "Custom graphics and icons", "Unique home screen", "Extended design scope quoted separately"],
    templateCta: "See my brand in Timzy",
    templateExamples: "Choose from a library of ready-made app templates",
    templateReadyLabel: "READY TEMPLATE",
    templateVariantLine: "Your logo · colours · imagery · content",
    templateLibraryNote: "Below are selected examples. Each template can be adapted with a different palette, typography, photos and background graphics.",
    showcaseEyebrow: "THE ACTUAL PRODUCT",
    showcaseTitle: "Not a concept. This is the real Timzy client app.",
    showcaseBody: "From login and booking to the shop and vouchers, the client stays inside one consistent branded experience.",
    screens: [
      { src: "/assets/mockups/client-login.webp", label: "Login", body: "Account access and language selection" },
      { src: "/assets/mockups/client-home.webp", label: "Branded home", body: "Brand, message and primary action" },
      { src: "/assets/mockups/client-services.webp", label: "Services", body: "Clear service selection" },
      { src: "/assets/mockups/client-calendar.webp", label: "Booking", body: "Date, employee and time" },
      { src: "/assets/mockups/client-shop.webp", label: "Shop", body: "Products, categories and cart" },
      { src: "/assets/mockups/client-vouchers.webp", label: "Vouchers", body: "Offers that bring clients back" },
    ],
  },
  pl: {
    ownershipEyebrow: "TWOI KLIENCI. TWOJA RELACJA.",
    ownershipTitle: "Twoi klienci pozostają Twoimi klientami.",
    ownershipLead: "W przeciwieństwie do klasycznych platform rezerwacyjnych Timzy nie tworzy marketplace’u, w którym wiele firm konkuruje o uwagę tego samego klienta.",
    ownershipStatement: "Timzy jest narzędziem dla Twojej firmy, a nie pośrednikiem między Tobą a Twoimi klientami.",
    ownershipPoints: [
      { title: "Własna aplikacja pod Twoją marką", body: "Twoja nazwa, ikona, kolory i ścieżka klienta zamiast profilu we wspólnej platformie." },
      { title: "Odseparowane środowisko klientów", body: "Kartoteki klientów i historia rezerwacji pozostają w środowisku technicznym skonfigurowanym dla Twojej aplikacji." },
      { title: "Bezpośrednia relacja", body: "Klient rezerwuje bezpośrednio u Ciebie, bez konkurencyjnych ofert wyświetlanych obok." },
      { title: "Własna konfiguracja Stripe", body: "Po aktywacji modułu płatności Stripe jest konfigurowany dla wybranego modelu Twojej firmy." },
      { title: "Pełna kontrola biznesowa", body: "To Ty decydujesz o ofercie, komunikacji, lojalności i dalszym rozwoju aplikacji." },
    ],
    ownershipPromise: "Nie wykorzystujemy Twojej bazy klientów do promowania konkurencyjnych firm ani budowania wspólnego katalogu marketplace’u.",
    ownershipLegal: "We wdrożeniu pod marką klienta Twoja firma pozostaje administratorem danych swoich klientów. Timzy dostarcza technologię na zasadach określonych w umowie i dokumentacji przetwarzania danych.",
    audienceLabel: "Szczególnie mocna przewaga dla",
    audiences: ["Klubów golfowych", "Trenerów premium", "SPA", "Klinik", "Beauty premium"],
    templateEyebrow: "TWÓJ STYL, TWÓJ WYBÓR",
    templateTitle: "Wybierz sprawdzony szablon albo zamów projekt stworzony tylko dla Twojej marki.",
    templateBody: "Technologia pozostaje ta sama. Zmieniamy kierunek wizualny, moduły i ścieżkę klienta tak, aby pasowały do Twojego biznesu.",
    readyTitle: "Gotowy szablon",
    readyBody: "Wybierasz sprawdzony kierunek Timzy, a my dopasowujemy go do Twojego logo, kolorów, usług, zespołu i treści.",
    readyPoints: ["Szybsza konfiguracja wizualna", "Sprawdzone układy mobilne", "Twoje logo, kolory i treści", "Wybrane moduły i menu"],
    customTitle: "Projekt indywidualny",
    customBody: "Tworzymy odrębny system wizualny wokół charakteru marki, jej pozycjonowania i doświadczenia klienta.",
    customPoints: ["Indywidualny kierunek artystyczny", "Dedykowane grafiki i ikony", "Unikalny ekran główny", "Rozszerzony zakres wyceniany osobno"],
    templateCta: "Zobacz moją markę w Timzy",
    templateExamples: "Wybierz z biblioteki gotowych template’ów aplikacji",
    templateReadyLabel: "GOTOWY TEMPLATE",
    templateVariantLine: "Twoje logo · kolory · grafiki · treści",
    templateLibraryNote: "Poniżej pokazujemy wybrane przykłady. Każdy template może otrzymać inną paletę, typografię, zdjęcia i grafiki tła.",
    showcaseEyebrow: "PRAWDZIWY PRODUKT",
    showcaseTitle: "To nie jest koncepcja. Tak wygląda aktualna aplikacja Timzy.",
    showcaseBody: "Od logowania i rezerwacji po sklep oraz vouchery klient porusza się w jednym, spójnym doświadczeniu pod marką firmy.",
    screens: [
      { src: "/assets/mockups/client-login.webp", label: "Logowanie", body: "Dostęp do konta i wybór języka" },
      { src: "/assets/mockups/client-home.webp", label: "Ekran marki", body: "Marka, komunikat i główne CTA" },
      { src: "/assets/mockups/client-services.webp", label: "Usługi", body: "Czytelny wybór oferty" },
      { src: "/assets/mockups/client-calendar.webp", label: "Rezerwacja", body: "Data, pracownik i godzina" },
      { src: "/assets/mockups/client-shop.webp", label: "Sklep", body: "Produkty, kategorie i koszyk" },
      { src: "/assets/mockups/client-vouchers.webp", label: "Vouchery", body: "Oferty, które zachęcają do powrotu" },
    ],
  },
  es: {
    ownershipEyebrow: "TUS CLIENTES. TU RELACIÓN.",
    ownershipTitle: "Tus clientes siguen siendo tus clientes.",
    ownershipLead: "A diferencia de los marketplaces de reservas, Timzy no reúne muchos negocios en un catálogo donde compiten por la atención del mismo cliente.",
    ownershipStatement: "Timzy es una herramienta para tu negocio, no un intermediario entre tú y tus clientes.",
    ownershipPoints: [
      { title: "Tu app con tu marca", body: "Tu nombre, icono, colores y recorrido, no un perfil dentro de la plataforma de otra empresa." },
      { title: "Tu entorno de clientes separado", body: "Las fichas y el historial de reservas permanecen en el entorno técnico configurado para tu app." },
      { title: "Tu relación directa", body: "El cliente reserva directamente contigo, sin ofertas competidoras colocadas al lado." },
      { title: "Tu configuración de Stripe", body: "Al activar pagos, Stripe se configura para el modelo seleccionado de tu negocio." },
      { title: "Tus decisiones", body: "Controlas la oferta, la comunicación, la fidelización y la evolución de la app." },
    ],
    ownershipPromise: "No usamos tu base de clientes para promocionar negocios competidores ni para construir un catálogo de marketplace compartido.",
    ownershipLegal: "En una implantación con la marca del cliente, tu negocio sigue siendo responsable del tratamiento de los datos de sus clientes. Timzy aporta la tecnología conforme al contrato y a los términos de tratamiento de datos.",
    audienceLabel: "Una ventaja especialmente potente para",
    audiences: ["Clubes de golf", "Entrenadores premium", "SPA", "Clínicas", "Beauty premium"],
    templateEyebrow: "TU ESTILO, TU ELECCIÓN",
    templateTitle: "Empieza con una plantilla probada o encarga un diseño totalmente personalizado.",
    templateBody: "La tecnología es la misma. Cambian la dirección visual, los módulos y el recorrido elegidos para tu negocio.",
    readyTitle: "Plantilla preparada",
    readyBody: "Elige una dirección Timzy probada y la adaptamos a tu logo, colores, servicios, equipo y contenido.",
    readyPoints: ["Configuración visual más rápida", "Diseños móviles probados", "Tu logo, paleta y contenido", "Módulos y menú seleccionados"],
    customTitle: "Diseño a medida",
    customBody: "Creamos un sistema visual propio alrededor de tu marca, posicionamiento y experiencia de cliente.",
    customPoints: ["Dirección artística individual", "Gráficos e iconos propios", "Pantalla inicial única", "Alcance ampliado presupuestado aparte"],
    templateCta: "Ver mi marca en Timzy",
    templateExamples: "Elige entre una biblioteca de plantillas de app preparadas",
    templateReadyLabel: "PLANTILLA LISTA",
    templateVariantLine: "Tu logo · colores · imágenes · contenido",
    templateLibraryNote: "Mostramos algunos ejemplos. Cada plantilla puede adaptarse con otra paleta, tipografía, fotos y gráficos de fondo.",
    showcaseEyebrow: "EL PRODUCTO REAL",
    showcaseTitle: "No es un concepto. Esta es la app Timzy actual.",
    showcaseBody: "Desde el acceso y la reserva hasta la tienda y los vales, el cliente permanece en una experiencia coherente con tu marca.",
    screens: [
      { src: "/assets/mockups/client-login.webp", label: "Acceso", body: "Cuenta y selección de idioma" },
      { src: "/assets/mockups/client-home.webp", label: "Inicio de marca", body: "Marca, mensaje y acción principal" },
      { src: "/assets/mockups/client-services.webp", label: "Servicios", body: "Selección clara de la oferta" },
      { src: "/assets/mockups/client-calendar.webp", label: "Reserva", body: "Fecha, empleado y hora" },
      { src: "/assets/mockups/client-shop.webp", label: "Tienda", body: "Productos, categorías y carrito" },
      { src: "/assets/mockups/client-vouchers.webp", label: "Vales", body: "Ofertas para volver" },
    ],
  },
};

const readyTemplateVisuals = [
  { name: "Natural Sage", src: "/assets/templates/natural-sage.webp", colours: ["#5AA79B", "#F6E9DD", "#315E58"] },
  { name: "Noir Prestige", src: "/assets/templates/noir-prestige.webp", colours: ["#171313", "#C8966F", "#F3DEC0"] },
  { name: "Sunset Energy", src: "/assets/templates/sunset-energy.webp", colours: ["#FF9200", "#1A1010", "#F2D48A"] },
  { name: "Fuchsia Pop", src: "/assets/templates/fuchsia-pop.webp", colours: ["#E90083", "#FF95A8", "#4B163A"] },
];

export function CustomerOwnershipSection({ locale }: { locale: CustomerValueLocale }) {
  const copy = customerValueCopy[locale];
  return <section className="customer-ownership" id="clients">
    <div className="ownership-copy">
      <p className="eyebrow">{copy.ownershipEyebrow}</p>
      <h2>{copy.ownershipTitle}</h2>
      <p className="ownership-lead">{copy.ownershipLead}</p>
      <p className="ownership-statement"><span>✓</span>{copy.ownershipStatement}</p>
      <p className="ownership-promise">{copy.ownershipPromise}</p>
      <small>{copy.ownershipLegal}</small>
    </div>
    <div className="ownership-panel">
      <div className="ownership-points">{copy.ownershipPoints.map((point, index) => <article key={point.title}><span>0{index + 1}</span><div><h3>{point.title}</h3><p>{point.body}</p></div></article>)}</div>
      <div className="ownership-audiences"><b>{copy.audienceLabel}</b><div>{copy.audiences.map((audience) => <span key={audience}>{audience}</span>)}</div></div>
    </div>
  </section>;
}

export function TemplateChoiceSection({ locale, ctaHref }: { locale: CustomerValueLocale; ctaHref: string }) {
  const copy = customerValueCopy[locale];
  return <section className="template-choice" id="design">
    <div className="template-heading"><p className="eyebrow">{copy.templateEyebrow}</p><h2>{copy.templateTitle}</h2><p>{copy.templateBody}</p></div>
    <div className="template-options">
      <article className="template-option template-option--ready"><span>01</span><h3>{copy.readyTitle}</h3><p>{copy.readyBody}</p><ul>{copy.readyPoints.map((point) => <li key={point}><i>✓</i>{point}</li>)}</ul></article>
      <article className="template-option template-option--custom"><span>02</span><h3>{copy.customTitle}</h3><p>{copy.customBody}</p><ul>{copy.customPoints.map((point) => <li key={point}><i>✓</i>{point}</li>)}</ul></article>
    </div>
    <div className="template-gallery"><div className="template-gallery-heading"><p>{copy.templateExamples}</p><span>{copy.templateLibraryNote}</span></div><div className="ready-template-grid">{readyTemplateVisuals.map((visual) => <article className="ready-template-card" key={visual.name}><div className="ready-template-preview"><img src={visual.src} alt={`${visual.name} ready Timzy app template`} loading="lazy" /></div><div className="ready-template-meta"><div><span>{copy.templateReadyLabel}</span><b>{visual.name}</b><small>{copy.templateVariantLine}</small></div><div className="ready-template-colours">{visual.colours.map((colour) => <i key={colour} style={{ backgroundColor: colour }} />)}</div></div></article>)}</div></div>
    <a className="button" href={ctaHref} target="_blank" rel="noreferrer">{copy.templateCta}<span>→</span></a>
  </section>;
}

export function ActualProductShowcase({ locale }: { locale: CustomerValueLocale }) {
  const copy = customerValueCopy[locale];
  return <section className="actual-showcase" id="app-showcase">
    <div className="section-intro section-intro--wide"><p className="eyebrow">{copy.showcaseEyebrow}</p><h2>{copy.showcaseTitle}</h2><p>{copy.showcaseBody}</p></div>
    <div className="actual-screen-grid">{copy.screens.map((screen, index) => <figure className={index === 1 || index === 3 ? "actual-screen-card actual-screen-card--featured" : "actual-screen-card"} key={screen.src}><div className="showcase-phone"><img src={screen.src} alt={`${screen.label}: ${screen.body}`} loading="lazy" /></div><figcaption><b>{screen.label}</b><span>{screen.body}</span></figcaption></figure>)}</div>
  </section>;
}
