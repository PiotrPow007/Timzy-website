type Locale = "en" | "pl" | "es";

type Copy = {
  skip: string;
  nav: string[];
  navCta: string;
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroBody: string;
  heroCta: string;
  heroCta2: string;
  proof: string[];
  industriesEyebrow: string;
  industriesTitle: string;
  industriesBody: string;
  industries: Array<{ tag: string; title: string; body: string; points: string[] }>;
  whiteEyebrow: string;
  whiteTitle: string;
  whiteBody: string;
  whitePoints: Array<{ title: string; body: string }>;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresBody: string;
  features: Array<{ icon: string; title: string; body: string }>;
  processEyebrow: string;
  processTitle: string;
  process: Array<{ title: string; body: string }>;
  compareEyebrow: string;
  compareTitle: string;
  compareBody: string;
  compareLabels: string[];
  compareRows: Array<[string, string, string]>;
  offerEyebrow: string;
  offerTitle: string;
  offerBody: string;
  offerPoints: string[];
  offerCta: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalCta: string;
  finalAlt: string;
  footerLine: string;
};

export const landingCopy: Record<Locale, Copy> = {
  en: {
    skip: "Skip to content",
    nav: ["Why Timzy", "Industries", "How it works", "Compare"],
    navCta: "Book a free demo",
    eyebrow: "YOUR BRAND. YOUR CLIENTS. YOUR APP.",
    heroTitle: "Your own booking app.",
    heroAccent: "Under your brand.",
    heroBody:
      "Timzy turns your services, team and calendar into a branded mobile experience your clients can use 24/7. No marketplace. No competitors next to your offer.",
    heroCta: "See a demo for your industry",
    heroCta2: "Book a free presentation",
    proof: ["iOS & Android", "Your logo and colours", "Direct client relationship"],
    industriesEyebrow: "BUILT AROUND YOUR BUSINESS",
    industriesTitle: "One platform. A different experience for every industry.",
    industriesBody:
      "Your app is configured around the way you actually work, not around a generic marketplace template.",
    industries: [
      { tag: "BEAUTY & SPA", title: "More bookings, less phone time", body: "Let clients choose a service, specialist and available time without calling the front desk.", points: ["Treatments and staff", "Reminders and vouchers", "Product shop"] },
      { tag: "GOLF & SPORT", title: "Schedules that keep up with your club", body: "Manage training, games, events and coach availability in one branded experience.", points: ["Training and games", "Coach calendars", "News and events"] },
      { tag: "CAR CARE", title: "A smoother route from quote to visit", body: "Turn service selection, booking and customer updates into one clear mobile flow.", points: ["Service packages", "Live availability", "Automated updates"] },
      { tag: "OTHER SERVICES", title: "Configured for your workflow", body: "Clinics, consultants, schools, studios and local services can shape Timzy around their process.", points: ["Flexible services", "Team permissions", "Multi-language"] },
    ],
    whiteEyebrow: "TRUE WHITE-LABEL",
    whiteTitle: "Your clients never enter a marketplace. They enter your world.",
    whiteBody:
      "Timzy stays behind the technology while your brand stays in front. The app carries your identity from the first tap to the next visit.",
    whitePoints: [
      { title: "Your identity", body: "Your name, logo, colours and visual character throughout the app." },
      { title: "Your customer journey", body: "Your services, team, rules and content, arranged around how you sell." },
      { title: "Your relationship", body: "No competing businesses beside your offer and no marketplace distraction." },
    ],
    featuresEyebrow: "OUTCOMES, NOT A FEATURE LIST",
    featuresTitle: "Give your team time back and your clients a reason to return.",
    featuresBody: "Every module supports a practical business result, from filling the calendar to increasing repeat sales.",
    features: [
      { icon: "24", title: "Bookings while you work or sleep", body: "Clients choose a service, specialist and time on their own, 24/7." },
      { icon: "↗", title: "Fewer empty slots", body: "Automatic reminders and alerts about newly available dates help recover lost capacity." },
      { icon: "♡", title: "More repeat visits", body: "Vouchers, loyalty rewards and personalised offers keep your brand top of mind." },
      { icon: "＋", title: "Sell beyond the appointment", body: "Offer products, bundles, pickup or delivery through the built-in shop." },
      { icon: "◎", title: "One live view for the team", body: "Schedules, clients, services and booking history stay organised in one system." },
      { icon: "∿", title: "Decisions based on real activity", body: "Reports reveal popular services, booking patterns and the work behind your revenue." },
    ],
    processEyebrow: "FROM LOGO TO LAUNCH",
    processTitle: "A branded app without starting an IT project.",
    process: [
      { title: "Tell us how you work", body: "We map your services, team, locations and priorities." },
      { title: "Share your brand", body: "Send your logo, colours and content. We configure the experience." },
      { title: "Review your app", body: "You test the booking flow and approve the final details." },
      { title: "Launch and grow", body: "We support publication, onboarding and the next stage of your app." },
    ],
    compareEyebrow: "CHOOSE THE RIGHT MODEL",
    compareTitle: "A booking marketplace or an app that builds your brand?",
    compareBody: "Both can accept appointments. Only one keeps the entire customer experience focused on your business.",
    compareLabels: ["What matters", "Typical marketplace", "Your Timzy app"],
    compareRows: [
      ["Brand on the home screen", "Marketplace brand", "Your brand"],
      ["Competitors next to your offer", "Often visible", "Never"],
      ["Look and customer journey", "Standardised", "Configured for you"],
      ["Direct client relationship", "Platform-led", "Business-led"],
      ["Shop, loyalty and content", "Platform dependent", "Part of your ecosystem"],
    ],
    offerEyebrow: "A PROPOSAL THAT FITS",
    offerTitle: "Pay for the setup your business actually needs.",
    offerBody:
      "The right scope depends on your team, locations and modules. We prepare a clear proposal after a short demo, instead of forcing every business into the same package.",
    offerPoints: ["No oversized custom software project", "Modules matched to your workflow", "Support during setup and launch"],
    offerCta: "Get a tailored proposal",
    finalEyebrow: "READY TO SEE YOUR BRAND IN THE APP?",
    finalTitle: "Your calendar can fill itself. Your brand should get the credit.",
    finalBody: "Book a free Timzy presentation and see a version shaped around your industry.",
    finalCta: "Book my free demo",
    finalAlt: "or email hello@timzy.app",
    footerLine: "Branded booking apps for service businesses.",
  },
  pl: {
    skip: "Przejdź do treści",
    nav: ["Dlaczego Timzy", "Branże", "Jak to działa", "Porównanie"],
    navCta: "Umów bezpłatne demo",
    eyebrow: "TWOJA MARKA. TWOI KLIENCI. TWOJA APLIKACJA.",
    heroTitle: "Własna aplikacja do rezerwacji.",
    heroAccent: "Pod Twoją marką.",
    heroBody:
      "Timzy zamienia Twoje usługi, zespół i kalendarz w aplikację mobilną dostępną dla klientów przez całą dobę. Bez marketplace’u i konkurencji obok Twojej oferty.",
    heroCta: "Zobacz demo dla swojej branży",
    heroCta2: "Umów bezpłatną prezentację",
    proof: ["iOS i Android", "Twoje logo i kolory", "Bezpośrednia relacja z klientem"],
    industriesEyebrow: "DOPASOWANE DO TWOJEGO BIZNESU",
    industriesTitle: "Jedna platforma. Inne doświadczenie dla każdej branży.",
    industriesBody: "Aplikacja powstaje wokół Twojego sposobu pracy, a nie szablonu ogólnego marketplace’u.",
    industries: [
      { tag: "BEAUTY & SPA", title: "Więcej rezerwacji, mniej telefonów", body: "Klient sam wybiera usługę, specjalistę i dostępny termin bez angażowania recepcji.", points: ["Zabiegi i pracownicy", "Przypomnienia i vouchery", "Sklep z produktami"] },
      { tag: "GOLF I SPORT", title: "Grafik, który nadąża za klubem", body: "Zarządzaj treningami, grami, wydarzeniami i dostępnością trenerów w jednej aplikacji.", points: ["Treningi i gry", "Kalendarze trenerów", "Aktualności i wydarzenia"] },
      { tag: "AUTO DETAILING", title: "Prosta droga od usługi do wizyty", body: "Połącz wybór pakietu, rezerwację i informacje dla klienta w jeden czytelny proces.", points: ["Pakiety usług", "Dostępne terminy", "Automatyczne aktualizacje"] },
      { tag: "INNE USŁUGI", title: "Konfiguracja pod Twój proces", body: "Gabinety, doradcy, szkoły, studia i lokalne usługi dopasują Timzy do swojej pracy.", points: ["Elastyczne usługi", "Role w zespole", "Wiele języków"] },
    ],
    whiteEyebrow: "PRAWDZIWY WHITE-LABEL",
    whiteTitle: "Klient nie wchodzi do marketplace’u. Wchodzi do świata Twojej marki.",
    whiteBody: "Timzy pozostaje technologią w tle, a Twoja marka jest na pierwszym planie od pierwszego kliknięcia po kolejną wizytę.",
    whitePoints: [
      { title: "Twoja identyfikacja", body: "Nazwa, logo, kolory i charakter wizualny w całej aplikacji." },
      { title: "Twoja ścieżka klienta", body: "Usługi, pracownicy, zasady i treści ułożone wokół sposobu, w jaki sprzedajesz." },
      { title: "Twoja relacja", body: "Bez konkurencyjnych firm obok oferty i bez rozpraszania marketplace’em." },
    ],
    featuresEyebrow: "REZULTATY ZAMIAST LISTY FUNKCJI",
    featuresTitle: "Odzyskaj czas zespołu i daj klientom powód, żeby wracali.",
    featuresBody: "Każdy moduł wspiera konkretny wynik: od pełniejszego kalendarza po większą sprzedaż powracającym klientom.",
    features: [
      { icon: "24", title: "Rezerwacje, gdy pracujesz albo śpisz", body: "Klient sam wybiera usługę, specjalistę i termin przez całą dobę." },
      { icon: "↗", title: "Mniej pustych terminów", body: "Automatyczne przypomnienia i alerty o zwolnionych terminach pomagają odzyskać obłożenie." },
      { icon: "♡", title: "Więcej powrotów", body: "Vouchery, program lojalnościowy i spersonalizowane oferty wzmacniają Twoją markę." },
      { icon: "＋", title: "Sprzedaż także poza wizytą", body: "Oferuj produkty, zestawy, odbiór osobisty lub dostawę we wbudowanym sklepie." },
      { icon: "◎", title: "Jeden aktualny widok dla zespołu", body: "Grafiki, klienci, usługi i historia wizyt są uporządkowane w jednym systemie." },
      { icon: "∿", title: "Decyzje oparte na danych", body: "Raporty pokazują popularne usługi, wzorce rezerwacji i realną pracę stojącą za przychodem." },
    ],
    processEyebrow: "OD LOGO DO PUBLIKACJI",
    processTitle: "Własna aplikacja bez uruchamiania projektu IT.",
    process: [
      { title: "Poznajemy Twój sposób pracy", body: "Ustalamy usługi, zespół, lokalizacje i priorytety." },
      { title: "Przekazujesz swoją markę", body: "Wysyłasz logo, kolory i treści. My konfigurujemy doświadczenie." },
      { title: "Sprawdzasz aplikację", body: "Testujesz proces rezerwacji i zatwierdzasz szczegóły." },
      { title: "Publikujesz i rozwijasz", body: "Wspieramy publikację, wdrożenie zespołu i dalszy rozwój aplikacji." },
    ],
    compareEyebrow: "WYBIERZ WŁAŚCIWY MODEL",
    compareTitle: "Marketplace rezerwacyjny czy aplikacja, która buduje Twoją markę?",
    compareBody: "Oba rozwiązania przyjmują wizyty. Tylko jedno skupia całe doświadczenie klienta na Twojej firmie.",
    compareLabels: ["Co ma znaczenie", "Typowy marketplace", "Twoja aplikacja Timzy"],
    compareRows: [
      ["Marka na ekranie głównym", "Marka platformy", "Twoja marka"],
      ["Konkurencja obok oferty", "Często widoczna", "Nigdy"],
      ["Wygląd i ścieżka klienta", "Ustandaryzowane", "Dopasowane do Ciebie"],
      ["Bezpośrednia relacja", "Prowadzona przez platformę", "Prowadzona przez firmę"],
      ["Sklep, lojalność i treści", "Zależne od platformy", "Część Twojego ekosystemu"],
    ],
    offerEyebrow: "OFERTA DOPASOWANA DO FIRMY",
    offerTitle: "Płacisz za rozwiązanie, którego naprawdę potrzebujesz.",
    offerBody: "Zakres zależy od zespołu, lokalizacji i wybranych modułów. Po krótkim demo przygotowujemy czytelną propozycję zamiast wciskać każdą firmę w ten sam pakiet.",
    offerPoints: ["Bez kosztownego projektu od zera", "Moduły dobrane do procesu", "Wsparcie podczas wdrożenia i publikacji"],
    offerCta: "Otrzymaj dopasowaną ofertę",
    finalEyebrow: "CHCESZ ZOBACZYĆ SWOJĄ MARKĘ W APLIKACJI?",
    finalTitle: "Kalendarz może zapełniać się sam. Rozpoznawalność powinna pracować na Ciebie.",
    finalBody: "Umów bezpłatną prezentację Timzy i zobacz wersję dopasowaną do swojej branży.",
    finalCta: "Umawiam bezpłatne demo",
    finalAlt: "lub napisz na hello@timzy.app",
    footerLine: "Aplikacje rezerwacyjne pod marką firm usługowych.",
  },
  es: {
    skip: "Ir al contenido",
    nav: ["Por qué Timzy", "Sectores", "Cómo funciona", "Comparar"],
    navCta: "Reservar demo gratis",
    eyebrow: "TU MARCA. TUS CLIENTES. TU APP.",
    heroTitle: "Tu propia app de reservas.",
    heroAccent: "Con tu marca.",
    heroBody: "Timzy convierte tus servicios, equipo y agenda en una experiencia móvil disponible 24/7. Sin marketplace ni competidores junto a tu oferta.",
    heroCta: "Ver una demo para mi sector",
    heroCta2: "Reservar presentación gratuita",
    proof: ["iOS y Android", "Tu logo y tus colores", "Relación directa con el cliente"],
    industriesEyebrow: "CREADA PARA TU NEGOCIO",
    industriesTitle: "Una plataforma. Una experiencia distinta para cada sector.",
    industriesBody: "Tu app se configura según tu forma real de trabajar, no según una plantilla genérica de marketplace.",
    industries: [
      { tag: "BEAUTY & SPA", title: "Más reservas, menos llamadas", body: "El cliente elige servicio, especialista y hora disponible sin llamar a recepción.", points: ["Tratamientos y equipo", "Recordatorios y vales", "Tienda de productos"] },
      { tag: "GOLF Y DEPORTE", title: "Una agenda al ritmo de tu club", body: "Gestiona entrenamientos, partidos, eventos y disponibilidad de entrenadores en tu propia app.", points: ["Entrenamientos y juegos", "Agenda de entrenadores", "Noticias y eventos"] },
      { tag: "CUIDADO DEL COCHE", title: "Del servicio a la cita sin fricción", body: "Une selección de servicios, reserva y avisos al cliente en un proceso claro.", points: ["Paquetes de servicios", "Disponibilidad en vivo", "Avisos automáticos"] },
      { tag: "OTROS SERVICIOS", title: "Configurada para tu proceso", body: "Clínicas, asesores, escuelas, estudios y negocios locales adaptan Timzy a su trabajo.", points: ["Servicios flexibles", "Permisos de equipo", "Varios idiomas"] },
    ],
    whiteEyebrow: "WHITE-LABEL DE VERDAD",
    whiteTitle: "Tu cliente no entra en un marketplace. Entra en el mundo de tu marca.",
    whiteBody: "Timzy mantiene la tecnología en segundo plano y tu marca en primer plano, desde el primer toque hasta la siguiente visita.",
    whitePoints: [
      { title: "Tu identidad", body: "Tu nombre, logo, colores y carácter visual en toda la app." },
      { title: "Tu recorrido", body: "Tus servicios, equipo, normas y contenido organizados según tu forma de vender." },
      { title: "Tu relación", body: "Sin negocios competidores junto a tu oferta y sin distracciones del marketplace." },
    ],
    featuresEyebrow: "RESULTADOS, NO UNA LISTA DE FUNCIONES",
    featuresTitle: "Devuelve tiempo a tu equipo y da a tus clientes un motivo para volver.",
    featuresBody: "Cada módulo apoya un resultado práctico: desde llenar la agenda hasta aumentar las ventas recurrentes.",
    features: [
      { icon: "24", title: "Reservas mientras trabajas o descansas", body: "El cliente elige servicio, especialista y hora por sí mismo, 24/7." },
      { icon: "↗", title: "Menos huecos vacíos", body: "Los recordatorios y avisos de nuevas horas disponibles ayudan a recuperar capacidad." },
      { icon: "♡", title: "Más visitas recurrentes", body: "Vales, fidelización y ofertas personalizadas mantienen tu marca presente." },
      { icon: "＋", title: "Vende más allá de la cita", body: "Ofrece productos, packs, recogida o envío desde la tienda integrada." },
      { icon: "◎", title: "Una vista en vivo para el equipo", body: "Agendas, clientes, servicios e historial se organizan en un único sistema." },
      { icon: "∿", title: "Decisiones basadas en actividad real", body: "Los informes muestran servicios populares, patrones de reserva y actividad comercial." },
    ],
    processEyebrow: "DEL LOGO AL LANZAMIENTO",
    processTitle: "Una app con tu marca sin iniciar un proyecto informático.",
    process: [
      { title: "Conocemos tu forma de trabajar", body: "Definimos servicios, equipo, ubicaciones y prioridades." },
      { title: "Compartes tu marca", body: "Envías logo, colores y contenido. Nosotros configuramos la experiencia." },
      { title: "Revisas tu app", body: "Pruebas las reservas y apruebas los últimos detalles." },
      { title: "Lanzas y creces", body: "Apoyamos la publicación, la puesta en marcha y la siguiente etapa." },
    ],
    compareEyebrow: "ELIGE EL MODELO ADECUADO",
    compareTitle: "¿Marketplace de reservas o una app que construye tu marca?",
    compareBody: "Ambos aceptan citas. Solo uno mantiene toda la experiencia centrada en tu negocio.",
    compareLabels: ["Lo que importa", "Marketplace típico", "Tu app Timzy"],
    compareRows: [
      ["Marca en la pantalla inicial", "La plataforma", "Tu marca"],
      ["Competidores junto a tu oferta", "A menudo", "Nunca"],
      ["Diseño y recorrido", "Estandarizado", "Configurado para ti"],
      ["Relación directa", "Dirigida por la plataforma", "Dirigida por tu negocio"],
      ["Tienda, fidelización y contenido", "Depende de la plataforma", "Parte de tu ecosistema"],
    ],
    offerEyebrow: "UNA PROPUESTA A TU MEDIDA",
    offerTitle: "Paga por la solución que tu negocio necesita.",
    offerBody: "El alcance depende de tu equipo, ubicaciones y módulos. Tras una breve demo preparamos una propuesta clara, sin obligar a todos los negocios a elegir el mismo paquete.",
    offerPoints: ["Sin un proyecto de software sobredimensionado", "Módulos adaptados a tu proceso", "Soporte durante configuración y lanzamiento"],
    offerCta: "Recibir una propuesta",
    finalEyebrow: "¿LISTO PARA VER TU MARCA EN LA APP?",
    finalTitle: "Tu agenda puede llenarse sola. El mérito debe ser de tu marca.",
    finalBody: "Reserva una presentación gratuita de Timzy y descubre una versión adaptada a tu sector.",
    finalCta: "Reservar mi demo gratis",
    finalAlt: "o escribe a hello@timzy.app",
    footerLine: "Apps de reservas con la marca de negocios de servicios.",
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? " brand-mark--compact" : ""}`} aria-label="Timzy">
      <span className="brand-symbol" aria-hidden="true">T</span>
      <span>imzy</span>
    </span>
  );
}

function StatusBar() {
  return <div className="phone-status"><span>9:41</span><span>● ◔ ▰</span></div>;
}

function BottomBar({ active = 0 }: { active?: number }) {
  const items = [["⌂", "Home"], ["□", "Reserve"], ["◇", "Shop"], ["♡", "Vouchers"]];
  return <div className="app-bottom">{items.map(([icon, label], index) => <span className={index === active ? "is-active" : ""} key={label}><b>{icon}</b><small>{label}</small></span>)}</div>;
}

function HomeScreen() {
  return <div className="app-screen app-home"><StatusBar /><div className="app-pad"><img src="/assets/timzy-logo.png" alt="Timzy SPA" className="app-logo" /><div className="beauty-collage"><img src="/assets/spa-hero.png" alt="" className="beauty-main" /><img src="/assets/spa-detail-3.png" alt="" className="beauty-card beauty-card--one" /><img src="/assets/spa-detail-4.png" alt="" className="beauty-card beauty-card--two" /></div><h3>Book an appointment<br />to our hair salon</h3><p>Quickly and conveniently!</p><button>Book your appointment</button></div><BottomBar /></div>;
}

function BookingScreen() {
  const services = [["SR", "Signature ritual", "€75"], ["FM", "Face massage", "€48"], ["HS", "Hair & styling", "€62"]];
  return <div className="app-screen app-booking"><StatusBar /><div className="app-header"><span>‹</span><b>Choose a treatment</b><span>○</span></div><div className="booking-copy"><p>Book your appointment</p>{services.map(([initials, name, price], index) => <div className="service-row" key={name}><span className={`service-thumb thumb-${index}`}>{initials}</span><span><b>{name}</b><small>45–60 min</small></span><strong>{price}</strong></div>)}<div className="mini-voucher"><span>♡</span><span><b>Use your welcome voucher</b><small>10% off your first booking</small></span></div></div><BottomBar active={1} /></div>;
}

function CalendarScreen() {
  return <div className="app-screen app-calendar"><StatusBar /><div className="app-header"><span>‹</span><b>Choose a date</b><span>○</span></div><div className="calendar-card"><small>JUNE 2026</small><div className="week"><span>15<small>MON</small></span><span>16<small>TUE</small></span><span className="selected">17<small>WED</small></span><span>18<small>THU</small></span><span>19<small>FRI</small></span></div></div><div className="calendar-body"><h4>Choose a specialist</h4><div className="staff"><span><i>AN</i><small>Anna</small></span><span><i>MK</i><small>Maya</small></span><span><i>SO</i><small>Sofia</small></span></div><h4>Available times</h4><div className="times">{["09:00", "09:30", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"].map((time, index) => <span className={index === 2 ? "selected" : ""} key={time}>{time}</span>)}</div><button>Continue</button></div></div>;
}

function AdminScreen() {
  return <div className="app-screen app-admin"><StatusBar /><div className="admin-top"><small>GOOD MORNING</small><h3>Your business, today</h3><div className="admin-stats"><span><b>12</b><small>appointments</small></span><span><b>3</b><small>open slots</small></span></div></div><div className="admin-list"><div className="list-heading"><b>Next appointments</b><small>View calendar</small></div>{[["09:00", "Olivia Martin", "Signature ritual"], ["10:30", "Amelia Jones", "Hair & styling"], ["12:00", "Mia Wilson", "Face massage"]].map(([time, name, service], index) => <div className="appointment" key={time}><time>{time}</time><i className={`avatar avatar-${index}`}>{name.split(" ").map(v => v[0]).join("")}</i><span><b>{name}</b><small>{service}</small></span><em>›</em></div>)}<div className="slot-alert"><b>↗ A slot was recovered</b><small>A client accepted the 14:30 availability alert.</small></div></div></div>;
}

function Phone({ screen, className = "" }: { screen: "home" | "booking" | "calendar" | "admin"; className?: string }) {
  const screens = { home: <HomeScreen />, booking: <BookingScreen />, calendar: <CalendarScreen />, admin: <AdminScreen /> };
  return <div className={`phone ${className}`} aria-hidden="true"><div className="phone-frame"><div className="phone-island" />{screens[screen]}</div></div>;
}

function LanguageNav({ locale }: { locale: Locale }) {
  return <div className="languages" aria-label="Language"><a href="/" className={locale === "en" ? "is-active" : ""}>EN</a><a href="/pl/" className={locale === "pl" ? "is-active" : ""}>PL</a><a href="/es/" className={locale === "es" ? "is-active" : ""}>ES</a></div>;
}

const mailHref = "mailto:hello@timzy.app?subject=Free%20Timzy%20demo";

export function LandingPage({ copy, locale }: { copy: Copy; locale: Locale }) {
  return (
    <main id="top" lang={locale === "pl" ? "pl" : locale === "es" ? "es" : "en-GB"}>
      <a className="skip-link" href="#content">{copy.skip}</a>
      <header className="site-header"><a href={locale === "en" ? "/" : `/${locale}/`} className="logo-link"><BrandMark /></a><nav aria-label="Main navigation"><a href="#why">{copy.nav[0]}</a><a href="#industries">{copy.nav[1]}</a><a href="#process">{copy.nav[2]}</a><a href="#compare">{copy.nav[3]}</a></nav><div className="header-actions"><LanguageNav locale={locale} /><a href={mailHref} className="button button--small">{copy.navCta}</a></div></header>

      <section className="hero" id="content"><div className="hero-glow hero-glow--one" /><div className="hero-glow hero-glow--two" /><div className="hero-copy"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.heroTitle}<span>{copy.heroAccent}</span></h1><p className="hero-body">{copy.heroBody}</p><div className="hero-actions"><a className="button" href="#industries">{copy.heroCta}<span aria-hidden="true">↘</span></a><a className="text-link" href={mailHref}>{copy.heroCta2}<span aria-hidden="true">→</span></a></div><div className="proof-row">{copy.proof.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div></div><div className="hero-visual"><div className="visual-orbit visual-orbit--one" /><div className="visual-orbit visual-orbit--two" /><Phone screen="booking" className="phone--left" /><Phone screen="home" className="phone--centre" /><Phone screen="admin" className="phone--right" /><div className="floating-note"><span>↗</span><p><b>Available slot filled</b><small>Automatic push alert sent</small></p></div></div></section>

      <div className="signal-strip"><span>ONE APP</span><i /><span>BOOKINGS</span><i /><span>LOYALTY</span><i /><span>SALES</span><i /><span>CUSTOMER CARE</span></div>

      <section className="section industries" id="industries"><div className="section-intro"><p className="eyebrow">{copy.industriesEyebrow}</p><h2>{copy.industriesTitle}</h2><p>{copy.industriesBody}</p></div><div className="industry-grid">{copy.industries.map((industry, index) => <article className={`industry-card industry-card--${index}`} key={industry.tag}><div className="industry-visual"><div className="industry-art"><span>{index === 0 ? "✦" : index === 1 ? "●" : index === 2 ? "◇" : "＋"}</span></div><div className="industry-mini-screen"><small>{industry.tag}</small><b>{index === 0 ? "09:30" : index === 1 ? "18:00" : index === 2 ? "11:45" : "14:20"}</b><em>available</em></div></div><div className="industry-copy"><p className="card-tag">{industry.tag}</p><h3>{industry.title}</h3><p>{industry.body}</p><ul>{industry.points.map(point => <li key={point}>{point}</li>)}</ul></div></article>)}</div></section>

      <section className="white-label" id="why"><div className="white-copy"><p className="eyebrow">{copy.whiteEyebrow}</p><h2>{copy.whiteTitle}</h2><p>{copy.whiteBody}</p><div className="white-points">{copy.whitePoints.map((point, index) => <div key={point.title}><span>0{index + 1}</span><p><b>{point.title}</b><small>{point.body}</small></p></div>)}</div></div><div className="brand-stage"><div className="brand-chip brand-chip--one">YOUR LOGO</div><div className="brand-chip brand-chip--two">#7C58F7</div><div className="brand-chip brand-chip--three">YOUR APP</div><Phone screen="home" className="phone--brand" /><div className="brand-caption"><BrandMark compact /><span>Technology in the background.<br /><b>Your brand in the foreground.</b></span></div></div></section>

      <section className="section features"><div className="section-intro section-intro--wide"><p className="eyebrow">{copy.featuresEyebrow}</p><h2>{copy.featuresTitle}</h2><p>{copy.featuresBody}</p></div><div className="feature-grid">{copy.features.map((feature, index) => <article className={index === 1 ? "feature-card feature-card--highlight" : "feature-card"} key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</div></section>

      <section className="process" id="process"><div className="process-heading"><p className="eyebrow">{copy.processEyebrow}</p><h2>{copy.processTitle}</h2></div><div className="process-grid">{copy.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div className="process-line"><i /></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>

      <section className="section comparison" id="compare"><div className="section-intro"><p className="eyebrow">{copy.compareEyebrow}</p><h2>{copy.compareTitle}</h2><p>{copy.compareBody}</p></div><div className="comparison-table" role="table" aria-label={copy.compareTitle}><div className="comparison-head" role="row">{copy.compareLabels.map((label, index) => <span className={index === 2 ? "timzy-col" : ""} role="columnheader" key={label}>{index === 2 ? <BrandMark compact /> : label}</span>)}</div>{copy.compareRows.map(row => <div className="comparison-row" role="row" key={row[0]}><b role="cell">{row[0]}</b><span role="cell"><i>−</i>{row[1]}</span><span className="timzy-col" role="cell"><i>✓</i>{row[2]}</span></div>)}</div></section>

      <section className="offer"><div className="offer-copy"><p className="eyebrow">{copy.offerEyebrow}</p><h2>{copy.offerTitle}</h2><p>{copy.offerBody}</p><ul>{copy.offerPoints.map(point => <li key={point}><span>✓</span>{point}</li>)}</ul><a className="button button--light" href={mailHref}>{copy.offerCta}<span>→</span></a></div><div className="offer-visual"><Phone screen="calendar" className="phone--offer" /><div className="offer-card"><span>♡</span><p><b>Welcome voucher</b><small>10% off the first booking</small></p></div><div className="offer-card offer-card--bottom"><span>✓</span><p><b>Booking confirmed</b><small>Wednesday, 10:30</small></p></div></div></section>

      <section className="final-cta"><div className="final-ring final-ring--one" /><div className="final-ring final-ring--two" /><p className="eyebrow">{copy.finalEyebrow}</p><h2>{copy.finalTitle}</h2><p>{copy.finalBody}</p><a className="button" href={mailHref}>{copy.finalCta}<span>→</span></a><a className="final-email" href="mailto:hello@timzy.app">{copy.finalAlt}</a></section>

      <footer><div className="footer-brand"><BrandMark /><p>{copy.footerLine}</p></div><div className="footer-contact"><a href="mailto:hello@timzy.app">hello@timzy.app</a><a href="tel:+34600659705">+34 600 659 705</a><a href="tel:+48507702007">+48 507 702 007</a></div><div className="footer-links"><a href="https://timzy.app/privacy-policy/">Privacy Policy</a><a href="https://timzy.app/terms-conditions/">Terms</a><a href="https://timzy.app/faq/">FAQ</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Timzy</span><LanguageNav locale={locale} /><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
