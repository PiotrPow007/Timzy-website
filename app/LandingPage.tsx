import { ProductCapabilities } from "./ProductCapabilities";
import { ActualProductShowcase, CustomerOwnershipSection, TemplateChoiceSection } from "./CustomerValueSections";
import { ContactSection } from "./ContactSection";

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
  industries: Array<{ slug: "spa-beauty" | "sport" | "car-wash-detailing" | "other"; tag: string; title: string; body: string; points: string[] }>;
  industryLink: string;
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
    nav: ["Your clients", "Industries", "How it works", "Compare"],
    navCta: "Talk to us on WhatsApp",
    eyebrow: "YOUR BRAND. YOUR CLIENTS. YOUR APP.",
    heroTitle: "More bookings. Less admin.",
    heroAccent: "All under your brand.",
    heroBody:
      "Timzy gives clients one branded place to book, stay informed and return more often. Your team gets one live calendar instead of calls, messages and scattered tools.",
    heroCta: "Book a free demo",
    heroCta2: "Explore industries",
    proof: ["iOS & Android", "Your logo and colours", "Direct client relationship"],
    industriesEyebrow: "BUILT AROUND YOUR BUSINESS",
    industriesTitle: "One platform. A different experience for every industry.",
    industriesBody:
      "Your app is configured around the way you actually work, not around a generic marketplace template.",
    industries: [
      { slug: "spa-beauty", tag: "SPA & BEAUTY", title: "Turn a first visit into a loyal relationship", body: "Combine bookings, specialists, vouchers, products and client communication in one elegant branded app.", points: ["Treatments and specialist calendars", "Vouchers and loyalty", "Shop and promotions"] },
      { slug: "sport", tag: "SPORT", title: "One app for the whole club", body: "Bring clubs, coaches, golf, tennis and team activities into one branded mobile experience.", points: ["Training, games and bookings", "Tournaments and camps", "Member communication"] },
      { slug: "car-wash-detailing", tag: "CAR WASH & DETAILING", title: "Turn enquiries into booked visits", body: "Help clients choose a service package, see available dates and receive clear booking updates.", points: ["Service packages", "Live availability", "Automated reminders"] },
      { slug: "other", tag: "OTHER INDUSTRIES", title: "Timzy adapts to your service model", body: "Clinics, premium coaches, studios and specialist services can select the modules and journey they actually need.", points: ["Flexible service catalogue", "Roles and locations", "Individual configuration"] },
    ],
    industryLink: "See the solution",
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
      ["App in iOS and Android stores", "One shared marketplace app", "A separate app under your brand"],
      ["Look and customer journey", "Standardised", "Configured for you"],
      ["Direct client relationship", "Platform-led", "Business-led"],
      ["Commission on bookings", "May apply to promotional acquisition", "No Timzy commission per booking"],
      ["Payment when booking", "Depends on platform features and plan", "Full payment or deposit; 0% Timzy commission"],
      ["Reservation data environment", "Shared platform environment", "Separate client instance"],
      ["Shop, loyalty and content", "Platform dependent", "Part of your ecosystem"],
      ["Complete website, ecommerce, branding and QR/NFC", "Usually outside the platform", "Available in one implementation"],
    ],
    offerEyebrow: "A PROPOSAL THAT FITS",
    offerTitle: "Pay for the setup your business actually needs.",
    offerBody:
      "The right scope depends on your team, locations and modules. You receive a clear setup and subscription proposal with no Timzy commission on individual bookings.",
    offerPoints: ["Up to 3 employees at no extra charge", "0% Timzy commission on bookings and booking payments", "Full payment or a deposit when booking", "Post-visit notes and client history", "Support during setup and launch"],
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
    nav: ["Twoi klienci", "Branże", "Jak to działa", "Porównanie"],
    navCta: "Napisz na WhatsApp",
    eyebrow: "TWOJA MARKA. TWOI KLIENCI. TWOJA APLIKACJA.",
    heroTitle: "Więcej rezerwacji. Mniej obsługi.",
    heroAccent: "Wszystko pod Twoją marką.",
    heroBody:
      "Timzy daje klientom jedno miejsce do rezerwacji, kontaktu i powrotów. Twój zespół dostaje aktualny grafik zamiast telefonów, wiadomości i rozproszonych narzędzi.",
    heroCta: "Umów bezpłatne demo",
    heroCta2: "Zobacz branże",
    proof: ["iOS i Android", "Twoje logo i kolory", "Bezpośrednia relacja z klientem"],
    industriesEyebrow: "DOPASOWANE DO TWOJEGO BIZNESU",
    industriesTitle: "Jedna platforma. Inne doświadczenie dla każdej branży.",
    industriesBody: "Aplikacja powstaje wokół Twojego sposobu pracy, a nie szablonu ogólnego marketplace’u.",
    industries: [
      { slug: "spa-beauty", tag: "SPA I BEAUTY", title: "Zmieniaj pierwszą wizytę w lojalną relację", body: "Połącz rezerwacje, specjalistów, vouchery, produkty i komunikację w eleganckiej aplikacji pod swoją marką.", points: ["Zabiegi i kalendarze specjalistów", "Vouchery i lojalność", "Sklep i promocje"] },
      { slug: "sport", tag: "SPORT", title: "Całe życie klubu w jednej aplikacji", body: "Połącz kluby, trenerów, golf, tenis i sporty zespołowe w jednym mobilnym doświadczeniu pod marką organizacji.", points: ["Treningi, gry i rezerwacje", "Turnieje i obozy", "Komunikacja z członkami"] },
      { slug: "car-wash-detailing", tag: "MYJNIE I DETAILING", title: "Zmieniaj zapytania w umówione wizyty", body: "Klient wybiera pakiet, widzi wolne terminy i otrzymuje jasne informacje o rezerwacji.", points: ["Pakiety usług", "Dostępne terminy", "Automatyczne przypomnienia"] },
      { slug: "other", tag: "INNE BRANŻE", title: "Timzy dopasowuje się do Twojego modelu usług", body: "Kliniki, trenerzy premium, studia i specjalistyczne usługi wybierają moduły oraz ścieżkę klienta, których naprawdę potrzebują.", points: ["Elastyczny katalog usług", "Role i lokalizacje", "Konfiguracja indywidualna"] },
    ],
    industryLink: "Zobacz rozwiązanie",
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
      ["Aplikacja w sklepach iOS i Android", "Jedna wspólna aplikacja marketplace'u", "Osobna aplikacja pod Twoją marką"],
      ["Wygląd i ścieżka klienta", "Ustandaryzowane", "Dopasowane do Ciebie"],
      ["Bezpośrednia relacja", "Prowadzona przez platformę", "Prowadzona przez firmę"],
      ["Prowizja od rezerwacji", "Możliwa przy płatnym pozyskiwaniu klientów", "Brak prowizji Timzy od rezerwacji"],
      ["Płatność przy rezerwacji", "Zależna od funkcji i planu platformy", "Całość lub część kwoty; 0% prowizji Timzy"],
      ["Środowisko danych rezerwacji", "Wspólne środowisko platformy", "Osobna instancja klienta"],
      ["Sklep, lojalność i treści", "Zależne od platformy", "Część Twojego ekosystemu"],
      ["Kompletna strona WWW, sklep, branding i QR/NFC", "Zwykle poza platformą", "Dostępne w jednym wdrożeniu"],
    ],
    offerEyebrow: "OFERTA DOPASOWANA DO FIRMY",
    offerTitle: "Płacisz za rozwiązanie, którego naprawdę potrzebujesz.",
    offerBody: "Zakres zależy od zespołu, lokalizacji i wybranych modułów. Otrzymujesz czytelną ofertę wdrożenia i abonamentu, bez prowizji Timzy od pojedynczych rezerwacji.",
    offerPoints: ["Do 3 pracowników bez dodatkowej opłaty", "0% prowizji Timzy od rezerwacji i płatności", "Płatność całości lub części kwoty przy rezerwacji", "Notatki po wizycie i historia klienta", "Wsparcie podczas wdrożenia i publikacji"],
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
    nav: ["Tus clientes", "Sectores", "Cómo funciona", "Comparar"],
    navCta: "Hablar por WhatsApp",
    eyebrow: "TU MARCA. TUS CLIENTES. TU APP.",
    heroTitle: "Más reservas. Menos gestión.",
    heroAccent: "Todo con tu marca.",
    heroBody: "Timzy ofrece a tus clientes un único lugar para reservar, mantenerse informados y volver. Tu equipo trabaja con una agenda en vivo, sin llamadas ni herramientas dispersas.",
    heroCta: "Reservar una demo gratis",
    heroCta2: "Explorar sectores",
    proof: ["iOS y Android", "Tu logo y tus colores", "Relación directa con el cliente"],
    industriesEyebrow: "CREADA PARA TU NEGOCIO",
    industriesTitle: "Una plataforma. Una experiencia distinta para cada sector.",
    industriesBody: "Tu app se configura según tu forma real de trabajar, no según una plantilla genérica de marketplace.",
    industries: [
      { slug: "spa-beauty", tag: "SPA Y BEAUTY", title: "Convierte una primera visita en una relación fiel", body: "Une reservas, especialistas, vales, productos y comunicación en una app elegante con tu marca.", points: ["Tratamientos y agendas", "Vales y fidelización", "Tienda y promociones"] },
      { slug: "sport", tag: "DEPORTE", title: "Toda la vida del club en una app", body: "Une clubes, entrenadores, golf, tenis y deportes de equipo en una experiencia móvil con tu marca.", points: ["Entrenamientos, partidos y reservas", "Torneos y campus", "Comunicación con socios"] },
      { slug: "car-wash-detailing", tag: "LAVADO Y DETAILING", title: "Convierte consultas en citas", body: "El cliente elige un pack, ve las horas libres y recibe información clara de su reserva.", points: ["Packs de servicios", "Disponibilidad en vivo", "Recordatorios automáticos"] },
      { slug: "other", tag: "OTROS SECTORES", title: "Timzy se adapta a tu modelo de servicio", body: "Clínicas, entrenadores premium, estudios y servicios especializados eligen los módulos y el recorrido que necesitan.", points: ["Catálogo flexible", "Roles y ubicaciones", "Configuración individual"] },
    ],
    industryLink: "Ver la solución",
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
      ["App en las tiendas iOS y Android", "Una app compartida de marketplace", "Una app separada con tu marca"],
      ["Diseño y recorrido", "Estandarizado", "Configurado para ti"],
      ["Relación directa", "Dirigida por la plataforma", "Dirigida por tu negocio"],
      ["Comisión por reserva", "Puede aplicarse a captación promocionada", "Sin comisión Timzy por reserva"],
      ["Pago al reservar", "Depende de las funciones y del plan", "Pago total o parcial; 0% de comisión Timzy"],
      ["Entorno de datos de reservas", "Entorno compartido de la plataforma", "Instancia separada del cliente"],
      ["Tienda, fidelización y contenido", "Depende de la plataforma", "Parte de tu ecosistema"],
      ["Web, branding y QR/NFC", "Normalmente fuera de la plataforma", "Disponible en una implantación"],
    ],
    offerEyebrow: "UNA PROPUESTA A TU MEDIDA",
    offerTitle: "Paga por la solución que tu negocio necesita.",
    offerBody: "El alcance depende de tu equipo, ubicaciones y módulos. Recibes una propuesta clara de implantación y suscripción, sin comisión Timzy por cada reserva.",
    offerPoints: ["Hasta 3 empleados sin coste adicional", "0% de comisión Timzy sobre reservas y pagos", "Pago total o parcial al reservar", "Notas posteriores e historial del cliente", "Soporte durante configuración y lanzamiento"],
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
      <img className="brand-logo--purple" src="/assets/timzy-logo-official-purple.png" alt="" aria-hidden="true" />
      <img className="brand-logo--white" src="/assets/timzy-logo-official-white.png" alt="" aria-hidden="true" />
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
  return <div className="app-screen app-home"><StatusBar /><div className="app-pad"><img src="/assets/timzy-logo-official-purple.png" alt="Timzy SPA" className="app-logo" /><div className="beauty-collage"><img src="/assets/spa-hero.png" alt="" className="beauty-main" /><img src="/assets/spa-detail-3.png" alt="" className="beauty-card beauty-card--one" /><img src="/assets/spa-detail-4.png" alt="" className="beauty-card beauty-card--two" /></div><h3>Book an appointment<br />to our hair salon</h3><p>Quickly and conveniently!</p><button>Book your appointment</button></div><BottomBar /></div>;
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

function ActualAppScreen({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <figure className={`real-phone ${className}`}><div className="real-phone-shell"><img src={src} alt={alt} loading={eager ? "eager" : "lazy"} /></div></figure>;
}

function LanguageNav({ locale }: { locale: Locale }) {
  const paths = { en: "/", pl: "/pl/", es: "/es/" };
  return <div className="languages" aria-label="Language"><a href={paths.en} className={locale === "en" ? "is-active" : ""}>EN</a><a href={paths.pl} className={locale === "pl" ? "is-active" : ""}>PL</a><a href={paths.es} className={locale === "es" ? "is-active" : ""}>ES</a></div>;
}

function industryHref(locale: Locale, slug: Copy["industries"][number]["slug"]) {
  if (slug === "spa-beauty" || slug === "other") return "#capabilities";
  return `${locale === "en" ? "" : `/${locale}`}/${slug}/`;
}

const industryImages = {
  "spa-beauty": [{ src: "/assets/industries/spa.webp", alt: "Premium spa treatment" }],
  sport: [{ src: "/assets/industries/sport.webp", alt: "Private racquet club training" }],
  "car-wash-detailing": [{ src: "/assets/industries/detailing.webp", alt: "Porsche in a premium detailing studio" }],
  other: [
    { src: "/assets/industries/psychology.webp", alt: "Private psychology consultation" },
    { src: "/assets/industries/tailor.webp", alt: "Bespoke tailoring appointment" },
    { src: "/assets/industries/nutrition.webp", alt: "Personal nutrition consultation" },
  ],
} as const;

function whatsappHref(locale: Locale, industry?: string) {
  const messages = {
    en: `Hi, I would like to see a Timzy demo${industry ? ` for ${industry}` : " for my industry"}.`,
    pl: `Dzień dobry, chcę zobaczyć demo Timzy${industry ? ` dla branży ${industry}` : " dla mojej branży"}.`,
    es: `Hola, quiero ver una demo de Timzy${industry ? ` para ${industry}` : " para mi sector"}.`,
  };
  return `https://wa.me/34600659705?text=${encodeURIComponent(messages[locale])}`;
}

export function LandingPage({ copy, locale }: { copy: Copy; locale: Locale }) {
  const signalItems = {
    en: ["YOUR APP", "BOOKINGS", "COMPLETE WEBSITE", "SALES", "CUSTOM FEATURES", "QR / NFC"],
    pl: ["TWOJA APLIKACJA", "REZERWACJE", "KOMPLETNA STRONA WWW", "SPRZEDAŻ", "FUNKCJE NA ZAMÓWIENIE", "QR / NFC"],
    es: ["TU APP", "RESERVAS", "WEB COMPLETA", "VENTAS", "FUNCIONES A MEDIDA", "QR / NFC"],
  }[locale];
  const legalLinks = {
    en: { privacy: "Privacy and cookies", privacyHref: "/privacy-policy/", terms: "Terms", faq: "FAQ", back: "Back to top ↑" },
    pl: { privacy: "Prywatność i cookies", privacyHref: "/pl/polityka-prywatnosci/", terms: "Regulamin", faq: "FAQ", back: "Wróć na górę ↑" },
    es: { privacy: "Privacidad y cookies", privacyHref: "/es/politica-privacidad/", terms: "Condiciones", faq: "FAQ", back: "Volver arriba ↑" },
  }[locale];
  return (
    <main id="top" lang={locale === "pl" ? "pl" : locale === "es" ? "es" : "en-GB"}>
      <a className="skip-link" href="#content">{copy.skip}</a>
      <header className="site-header"><a href={locale === "en" ? "/" : `/${locale}/`} className="logo-link"><BrandMark /></a><nav aria-label="Main navigation"><a href="#clients">{copy.nav[0]}</a><a href="#industries">{copy.nav[1]}</a><a href="#process">{copy.nav[2]}</a><a href="#compare">{copy.nav[3]}</a></nav><div className="header-actions"><LanguageNav locale={locale} /><a href={whatsappHref(locale)} className="button button--small" target="_blank" rel="noreferrer">{copy.navCta}</a></div></header>

      <section className="hero" id="content"><div className="hero-glow hero-glow--one" /><div className="hero-glow hero-glow--two" /><div className="hero-copy"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.heroTitle}<span>{copy.heroAccent}</span></h1><p className="hero-body">{copy.heroBody}</p><div className="hero-actions"><a className="button" href="#kontakt">{copy.heroCta}<span aria-hidden="true">→</span></a><a className="text-link" href="#industries">{copy.heroCta2}<span aria-hidden="true">↘</span></a></div><div className="proof-row">{copy.proof.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div></div><div className="hero-visual"><div className="visual-orbit visual-orbit--one" /><div className="visual-orbit visual-orbit--two" /><ActualAppScreen src="/assets/mockups/client-services.webp" alt="Actual Timzy services screen" className="phone--left" /><ActualAppScreen src="/assets/mockups/client-home.webp" alt="Actual Timzy home screen" className="phone--centre" eager /><ActualAppScreen src="/assets/mockups/client-shop.webp" alt="Actual Timzy shop screen" className="phone--right" /></div></section>

      <div className="signal-strip">{signalItems.map((item, index) => <span key={item}>{item}{index < signalItems.length - 1 ? <i /> : null}</span>)}</div>

      <section className="section industries" id="industries"><div className="section-intro"><p className="eyebrow">{copy.industriesEyebrow}</p><h2>{copy.industriesTitle}</h2><p>{copy.industriesBody}</p></div><div className="industry-grid">{copy.industries.map((industry, index) => <a className={`industry-card industry-card--${index}`} href={industryHref(locale, industry.slug)} key={industry.tag}><div className={`industry-visual industry-visual--${industry.slug}`}>{industry.slug === "other" ? <div className="industry-collage">{industryImages.other.map((image, tileIndex) => <img src={image.src} alt={image.alt} loading="lazy" key={image.src} className={`industry-collage-tile industry-collage-tile--${tileIndex + 1}`} />)}</div> : <img className="industry-photo" src={industryImages[industry.slug][0].src} alt={industryImages[industry.slug][0].alt} loading="lazy" />}<span className="industry-photo-tag">{industry.tag}</span></div><div className="industry-copy"><p className="card-tag">{industry.tag}</p><h3>{industry.title}</h3><p>{industry.body}</p><ul>{industry.points.map(point => <li key={point}>{point}</li>)}</ul><span className="industry-link">{copy.industryLink}<b aria-hidden="true">→</b></span></div></a>)}</div></section>

      <CustomerOwnershipSection locale={locale} />

      <section className="white-label" id="why"><div className="white-copy"><p className="eyebrow">{copy.whiteEyebrow}</p><h2>{copy.whiteTitle}</h2><p>{copy.whiteBody}</p><div className="white-points">{copy.whitePoints.map((point, index) => <div key={point.title}><span>0{index + 1}</span><p><b>{point.title}</b><small>{point.body}</small></p></div>)}</div></div><div className="brand-stage"><ActualAppScreen src="/assets/mockups/client-home.webp" alt="Actual branded Timzy home screen" className="phone--brand" /></div></section>

      <TemplateChoiceSection locale={locale} ctaHref="#kontakt" />

      <ActualProductShowcase locale={locale} />

      <section className="section features"><div className="section-intro section-intro--wide"><p className="eyebrow">{copy.featuresEyebrow}</p><h2>{copy.featuresTitle}</h2><p>{copy.featuresBody}</p></div><div className="feature-grid">{copy.features.map((feature, index) => <article className={index === 1 ? "feature-card feature-card--highlight" : "feature-card"} key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</div></section>

      <ProductCapabilities locale={locale} />

      <section className="process" id="process"><div className="process-heading"><p className="eyebrow">{copy.processEyebrow}</p><h2>{copy.processTitle}</h2></div><div className="process-grid">{copy.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div className="process-line"><i /></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>

      <section className="section comparison" id="compare"><div className="section-intro"><p className="eyebrow">{copy.compareEyebrow}</p><h2>{copy.compareTitle}</h2><p>{copy.compareBody}</p></div><div className="comparison-table" role="table" aria-label={copy.compareTitle}><div className="comparison-head" role="row">{copy.compareLabels.map((label, index) => <span className={index === 2 ? "timzy-col" : ""} role="columnheader" key={label}>{index === 2 ? <BrandMark compact /> : label}</span>)}</div>{copy.compareRows.map(row => <div className="comparison-row" role="row" key={row[0]}><b role="cell">{row[0]}</b><span role="cell"><i>−</i>{row[1]}</span><span className="timzy-col" role="cell"><i>✓</i>{row[2]}</span></div>)}</div>{locale === "pl" ? <p className="comparison-evidence"><b>Konkretny przykład:</b> Booksy podaje obecnie, że opcjonalny Boost pobiera 45% netto wartości usług z pierwszej zakończonej wizyty nowego klienta Boost. Rezerwacje z bezpośredniego linku mogą być bezprowizyjne. Timzy nie pobiera własnej prowizji ani od rezerwacji, ani od płatności za rezerwację. Przy płatnościach online nadal obowiązują standardowe opłaty operatora Stripe. <a href="https://biz.booksy.com/pl-pl/funkcje/boost" target="_blank" rel="noreferrer">Oficjalne zasady Booksy Boost →</a><small>Stan informacji: sierpień 2026.</small></p> : null}</section>

      <section className="offer"><div className="offer-copy"><p className="eyebrow">{copy.offerEyebrow}</p><h2>{copy.offerTitle}</h2><p>{copy.offerBody}</p><ul>{copy.offerPoints.map(point => <li key={point}><span>✓</span>{point}</li>)}</ul><a className="button button--light" href="#kontakt">{copy.offerCta}<span>→</span></a></div><div className="offer-visual offer-visual--template"><img className="offer-template-mockup" src="/assets/templates/natural-sage.webp" alt="Branded app login mockup in the Natural Sage style" loading="lazy" /></div></section>

      <ContactSection locale={locale} />

      <footer><div className="footer-brand"><BrandMark /><p>{copy.footerLine}</p></div><div className="footer-contact"><a href="mailto:hello@timzy.app">hello@timzy.app</a><a href="tel:+34600659705">+34 600 659 705</a><a href="tel:+48507702007">+48 507 702 007</a></div><div className="footer-links"><a href={legalLinks.privacyHref}>{legalLinks.privacy}</a><a href="https://timzy.app/terms-conditions/">{legalLinks.terms}</a><a href="https://timzy.app/faq/">{legalLinks.faq}</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Timzy</span><LanguageNav locale={locale} /><a href="#top">{legalLinks.back}</a></div></footer>
    </main>
  );
}
