import { ProductCapabilities } from "./ProductCapabilities";
import { ActualProductShowcase, CustomerOwnershipSection, TemplateChoiceSection } from "./CustomerValueSections";
import { ContactSection } from "./ContactSection";
import { PlatformJsonLd } from "./SeoJsonLd";

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
  problemEyebrow: string;
  problemTitle: string;
  problemBody: string;
  problems: Array<{ icon: string; title: string; body: string }>;
  industriesEyebrow: string;
  industriesTitle: string;
  industriesBody: string;
  industries: Array<{ slug: "spa-beauty" | "sport" | "car-wash-detailing" | "other"; tag: string; title: string; body: string; points: string[] }>;
  industryLink: string;
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
  faqEyebrow: string;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string; source?: string; sourceLabel?: string }>;
  footerLine: string;
};

export const landingCopy: Record<Locale, Copy> = {
  en: {
    skip: "Skip to content",
    nav: ["Why Timzy", "Capabilities", "Industries", "How it works"],
    navCta: "See an industry demo",
    eyebrow: "A WHITE-LABEL BOOKING APP FOR SERVICE BUSINESSES",
    heroTitle: "More bookings. More returning clients.",
    heroAccent: "In an app under your brand.",
    heroBody:
      "Give clients one simple place to book, pay, buy and return. Your team gets a live calendar, while your business keeps the brand and the direct customer relationship.",
    heroCta: "See a demo for my industry",
    heroCta2: "Explore Timzy capabilities",
    proof: ["Your own iOS and Android app", "No Timzy commission per booking", "Your client base and direct relationship"],
    problemEyebrow: "LESS ADMIN. MORE TIME FOR CLIENTS.",
    problemTitle: "Bookings should organise your business, not interrupt it.",
    problemBody: "Calls, messages and disconnected tools create work for the team and friction for the client. Timzy turns that scattered journey into one clear process.",
    problems: [
      { icon: "01", title: "Clients book when it suits them", body: "They choose a service, specialist and available time without waiting for a reply." },
      { icon: "02", title: "The team works from one live calendar", body: "Working hours, days off, services and bookings stay organised in one place." },
      { icon: "03", title: "Your brand stays visible after the visit", body: "Vouchers, loyalty, push updates and the shop create practical reasons to return." },
    ],
    industriesEyebrow: "BUILT AROUND YOUR BUSINESS",
    industriesTitle: "The same strong engine. A journey shaped around your industry.",
    industriesBody:
      "Your app is configured around the way you actually work, not around a generic marketplace template.",
    industries: [
      { slug: "spa-beauty", tag: "SPA & BEAUTY", title: "Turn a first visit into a loyal relationship", body: "Combine bookings, specialists, vouchers, products and client communication in one elegant branded app.", points: ["Treatments and specialist calendars", "Vouchers and loyalty", "Shop and promotions"] },
      { slug: "sport", tag: "SPORT", title: "One app for the whole club", body: "Bring clubs, coaches, golf, tennis and team activities into one branded mobile experience.", points: ["Training, games and bookings", "Tournaments and camps", "Member communication"] },
      { slug: "car-wash-detailing", tag: "CAR WASH & DETAILING", title: "Turn enquiries into booked visits", body: "Help clients choose a service package, see available dates and receive clear booking updates.", points: ["Service packages", "Live availability", "Automated reminders"] },
      { slug: "other", tag: "OTHER INDUSTRIES", title: "Timzy adapts to your service model", body: "Clinics, premium coaches, studios and specialist services can select the modules and journey they actually need.", points: ["Flexible service catalogue", "Roles and locations", "Individual configuration"] },
    ],
    industryLink: "See the industry demo",
    featuresEyebrow: "OUTCOMES, NOT A FEATURE LIST",
    featuresTitle: "From the first booking to the next visit — without handing the relationship to a platform.",
    featuresBody: "Timzy connects the customer journey with daily operations, so every module has a clear business purpose.",
    features: [
      { icon: "24", title: "Bookings while you work or sleep", body: "Clients choose a service, specialist and time on their own, 24/7." },
      { icon: "↗", title: "Tools that limit empty slots", body: "Automatic reminders and alerts about newly available dates help your team use available capacity." },
      { icon: "♡", title: "Tools that support repeat visits", body: "Vouchers, loyalty rewards and personalised offers give clients a practical reason to return." },
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
    offerTitle: "Start with the essentials. Expand Timzy as your business grows.",
    offerBody:
      "The right scope depends on your team, locations and modules. You receive a clear setup and subscription proposal with no Timzy commission on individual bookings.",
    offerPoints: ["Up to 3 employees at no extra charge", "0% Timzy commission on bookings and booking payments", "Full payment or a deposit when booking", "Post-visit notes and client history", "Optional complete website, ecommerce, branding and QR/NFC materials"],
    offerCta: "See a demo for my industry",
    faqEyebrow: "CLEAR ANSWERS BEFORE WE TALK",
    faqTitle: "Frequently asked questions",
    faqs: [
      { question: "Does Timzy charge a commission on bookings?", answer: "No. Timzy does not add a commission to a booking or to a booking payment. Standard Stripe processing fees and fees for other third-party services may still apply." },
      { question: "Will my clients see competing businesses?", answer: "No. Timzy is not a shared marketplace catalogue. Your client enters an app focused on your brand, services and team." },
      { question: "Is the app really published under my brand?", answer: "Yes. The selected implementation includes a separate iOS and Android app with your name, logo, colours, content and configured customer journey." },
      { question: "Can Timzy handle a feature specific to my business?", answer: "Yes. We first review the workflow, security and business value, then define the scope and quote custom modules or integrations separately." },
      { question: "Does Timzy automatically remove every DAC7 obligation?", answer: "No technology provider can give a blanket exemption without reviewing the actual contractual and operating model. Timzy uses separate client environments rather than a central seller marketplace, but each business must verify its own tax and reporting obligations.", source: "https://podatki.gov.pl/podatkowa-wspolpraca-miedzynarodowa/dpi-digital-platform-information", sourceLabel: "Official DAC7 information" },
    ],
    footerLine: "Branded booking apps for service businesses.",
  },
  pl: {
    skip: "Przejdź do treści",
    nav: ["Dlaczego Timzy", "Możliwości", "Branże", "Jak to działa"],
    navCta: "Zobacz demo dla branży",
    eyebrow: "APLIKACJA REZERWACYJNA WHITE-LABEL DLA FIRM USŁUGOWYCH",
    heroTitle: "Więcej rezerwacji. Więcej powrotów.",
    heroAccent: "W aplikacji pod Twoją marką.",
    heroBody:
      "Daj klientom jedno proste miejsce do rezerwacji, płatności, zakupów i powrotów. Zespół pracuje na aktualnym grafiku, a Twoja firma zachowuje markę i bezpośrednią relację z klientem.",
    heroCta: "Zobacz demo dla swojej branży",
    heroCta2: "Sprawdź możliwości Timzy",
    proof: ["Własna aplikacja na iOS i Android", "0% prowizji Timzy od rezerwacji", "Twoja baza i bezpośrednia relacja"],
    problemEyebrow: "MNIEJ OBSŁUGI. WIĘCEJ CZASU DLA KLIENTÓW.",
    problemTitle: "Rezerwacje mają porządkować firmę, a nie przerywać jej pracę.",
    problemBody: "Telefony, wiadomości i osobne narzędzia zabierają czas zespołu i utrudniają klientowi decyzję. Timzy zamienia ten chaos w jeden czytelny proces.",
    problems: [
      { icon: "01", title: "Klient rezerwuje wtedy, kiedy mu pasuje", body: "Sam wybiera usługę, specjalistę i dostępny termin, bez czekania na odpowiedź." },
      { icon: "02", title: "Zespół pracuje na jednym aktualnym grafiku", body: "Godziny pracy, dni wolne, usługi i rezerwacje są uporządkowane w jednym miejscu." },
      { icon: "03", title: "Twoja marka zostaje z klientem po wizycie", body: "Vouchery, lojalność, powiadomienia i sklep dają konkretny powód do powrotu." },
    ],
    industriesEyebrow: "DOPASOWANE DO TWOJEGO BIZNESU",
    industriesTitle: "Ten sam mocny silnik. Inna ścieżka dla każdej branży.",
    industriesBody: "Aplikacja powstaje wokół Twojego sposobu pracy, a nie szablonu ogólnego marketplace’u.",
    industries: [
      { slug: "spa-beauty", tag: "SPA I BEAUTY", title: "Zmieniaj pierwszą wizytę w lojalną relację", body: "Połącz rezerwacje, specjalistów, vouchery, produkty i komunikację w eleganckiej aplikacji pod swoją marką.", points: ["Zabiegi i kalendarze specjalistów", "Vouchery i lojalność", "Sklep i promocje"] },
      { slug: "sport", tag: "SPORT", title: "Całe życie klubu w jednej aplikacji", body: "Połącz kluby, trenerów, golf, tenis i sporty zespołowe w jednym mobilnym doświadczeniu pod marką organizacji.", points: ["Treningi, gry i rezerwacje", "Turnieje i obozy", "Komunikacja z członkami"] },
      { slug: "car-wash-detailing", tag: "MYJNIE I DETAILING", title: "Zmieniaj zapytania w umówione wizyty", body: "Klient wybiera pakiet, widzi wolne terminy i otrzymuje jasne informacje o rezerwacji.", points: ["Pakiety usług", "Dostępne terminy", "Automatyczne przypomnienia"] },
      { slug: "other", tag: "INNE BRANŻE", title: "Timzy dopasowuje się do Twojego modelu usług", body: "Kliniki, trenerzy premium, studia i specjalistyczne usługi wybierają moduły oraz ścieżkę klienta, których naprawdę potrzebują.", points: ["Elastyczny katalog usług", "Role i lokalizacje", "Konfiguracja indywidualna"] },
    ],
    industryLink: "Zobacz demo branżowe",
    featuresEyebrow: "REZULTATY ZAMIAST LISTY FUNKCJI",
    featuresTitle: "Od pierwszej rezerwacji do kolejnej wizyty — bez oddawania relacji platformie.",
    featuresBody: "Timzy łączy ścieżkę klienta z codzienną pracą zespołu, dlatego każdy moduł ma konkretny cel biznesowy.",
    features: [
      { icon: "24", title: "Rezerwacje, gdy pracujesz albo śpisz", body: "Klient sam wybiera usługę, specjalistę i termin przez całą dobę." },
      { icon: "↗", title: "Narzędzia ograniczające puste terminy", body: "Automatyczne przypomnienia i alerty o zwolnionych terminach pomagają lepiej wykorzystać dostępny czas." },
      { icon: "♡", title: "Narzędzia wspierające powroty", body: "Vouchery, program lojalnościowy i spersonalizowane oferty dają klientom konkretny powód do kolejnej wizyty." },
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
    offerTitle: "Zacznij od najważniejszych modułów. Rozwijaj Timzy razem z firmą.",
    offerBody: "Zakres zależy od zespołu, lokalizacji i wybranych modułów. Otrzymujesz czytelną ofertę wdrożenia i abonamentu, bez prowizji Timzy od pojedynczych rezerwacji.",
    offerPoints: ["Do 3 pracowników bez dodatkowej opłaty", "0% prowizji Timzy od rezerwacji i płatności", "Płatność całości lub części kwoty przy rezerwacji", "Notatki po wizycie i historia klienta", "Opcjonalnie: kompletna strona WWW, sklep, branding i materiały QR/NFC"],
    offerCta: "Zobacz demo dla swojej branży",
    faqEyebrow: "KONKRETNE ODPOWIEDZI PRZED ROZMOWĄ",
    faqTitle: "Najczęstsze pytania",
    faqs: [
      { question: "Czy Timzy pobiera prowizję od rezerwacji?", answer: "Nie. Timzy nie dolicza prowizji ani do rezerwacji, ani do płatności za rezerwację. Przy płatnościach online nadal obowiązują standardowe opłaty operatora Stripe oraz ewentualne koszty innych usług zewnętrznych." },
      { question: "Czy moi klienci zobaczą konkurencyjne firmy?", answer: "Nie. Timzy nie jest wspólnym katalogiem marketplace. Klient wchodzi do aplikacji skupionej na Twojej marce, usługach i zespole." },
      { question: "Czy aplikacja naprawdę będzie opublikowana pod moją marką?", answer: "Tak. Wybrane wdrożenie obejmuje osobną aplikację na iOS i Android z Twoją nazwą, logo, kolorami, treściami i skonfigurowaną ścieżką klienta." },
      { question: "Czy do 3 pracowników nie ma dopłaty?", answer: "Tak, standardowa konfiguracja obejmuje do 3 pracowników bez dodatkowej opłaty. Większe zespoły i wiele lokalizacji wyceniamy zgodnie z zakresem wdrożenia." },
      { question: "Czy możecie dodać funkcję potrzebną tylko mojej firmie?", answer: "Tak. Najpierw analizujemy proces, bezpieczeństwo i wartość biznesową, a następnie osobno określamy zakres oraz wycenę dedykowanego modułu lub integracji." },
      { question: "Czy Timzy automatycznie wyłącza każdą firmę z obowiązków DAC7?", answer: "Nie można obiecać ogólnego zwolnienia bez analizy rzeczywistego modelu umów i działania firmy. Timzy korzysta z osobnych środowisk klientów zamiast centralnego marketplace’u sprzedawców, ale każda firma powinna zweryfikować własne obowiązki podatkowe i sprawozdawcze.", source: "https://podatki.gov.pl/podatkowa-wspolpraca-miedzynarodowa/dpi-digital-platform-information", sourceLabel: "Oficjalne informacje o DAC7" },
    ],
    footerLine: "Aplikacje rezerwacyjne pod marką firm usługowych.",
  },
  es: {
    skip: "Ir al contenido",
    nav: ["Por qué Timzy", "Funciones", "Sectores", "Cómo funciona"],
    navCta: "Ver demo para mi sector",
    eyebrow: "APP DE RESERVAS WHITE-LABEL PARA NEGOCIOS DE SERVICIOS",
    heroTitle: "Más reservas. Más clientes que vuelven.",
    heroAccent: "En una app con tu marca.",
    heroBody: "Ofrece a tus clientes un único lugar para reservar, pagar, comprar y volver. Tu equipo trabaja con una agenda actualizada y tu negocio mantiene la marca y la relación directa.",
    heroCta: "Ver demo para mi sector",
    heroCta2: "Explorar las funciones",
    proof: ["Tu app para iOS y Android", "Sin comisión Timzy por reserva", "Tu base de clientes y relación directa"],
    problemEyebrow: "MENOS GESTIÓN. MÁS TIEMPO PARA CLIENTES.",
    problemTitle: "Las reservas deben ordenar el negocio, no interrumpirlo.",
    problemBody: "Llamadas, mensajes y herramientas separadas consumen tiempo y añaden fricción. Timzy convierte ese recorrido disperso en un proceso claro.",
    problems: [
      { icon: "01", title: "El cliente reserva cuando quiere", body: "Elige servicio, especialista y hora disponible sin esperar respuesta." },
      { icon: "02", title: "El equipo trabaja con una agenda actualizada", body: "Horarios, días libres, servicios y reservas quedan organizados en un lugar." },
      { icon: "03", title: "Tu marca sigue presente tras la visita", body: "Vales, fidelización, avisos y tienda crean motivos concretos para volver." },
    ],
    industriesEyebrow: "CREADA PARA TU NEGOCIO",
    industriesTitle: "El mismo motor sólido. Un recorrido para cada sector.",
    industriesBody: "Tu app se configura según tu forma real de trabajar, no según una plantilla genérica de marketplace.",
    industries: [
      { slug: "spa-beauty", tag: "SPA Y BEAUTY", title: "Convierte una primera visita en una relación fiel", body: "Une reservas, especialistas, vales, productos y comunicación en una app elegante con tu marca.", points: ["Tratamientos y agendas", "Vales y fidelización", "Tienda y promociones"] },
      { slug: "sport", tag: "DEPORTE", title: "Toda la vida del club en una app", body: "Une clubes, entrenadores, golf, tenis y deportes de equipo en una experiencia móvil con tu marca.", points: ["Entrenamientos, partidos y reservas", "Torneos y campus", "Comunicación con socios"] },
      { slug: "car-wash-detailing", tag: "LAVADO Y DETAILING", title: "Convierte consultas en citas", body: "El cliente elige un pack, ve las horas libres y recibe información clara de su reserva.", points: ["Packs de servicios", "Disponibilidad en vivo", "Recordatorios automáticos"] },
      { slug: "other", tag: "OTROS SECTORES", title: "Timzy se adapta a tu modelo de servicio", body: "Clínicas, entrenadores premium, estudios y servicios especializados eligen los módulos y el recorrido que necesitan.", points: ["Catálogo flexible", "Roles y ubicaciones", "Configuración individual"] },
    ],
    industryLink: "Ver demo del sector",
    featuresEyebrow: "RESULTADOS, NO UNA LISTA DE FUNCIONES",
    featuresTitle: "Desde la primera reserva hasta la siguiente visita, sin ceder la relación a una plataforma.",
    featuresBody: "Timzy conecta el recorrido del cliente con el trabajo diario para que cada módulo tenga un objetivo comercial claro.",
    features: [
      { icon: "24", title: "Reservas mientras trabajas o descansas", body: "El cliente elige servicio, especialista y hora por sí mismo, 24/7." },
      { icon: "↗", title: "Herramientas para limitar huecos", body: "Los recordatorios y avisos de nuevas horas disponibles ayudan a aprovechar mejor la capacidad." },
      { icon: "♡", title: "Herramientas para fomentar el regreso", body: "Vales, fidelización y ofertas personalizadas dan motivos concretos para volver." },
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
      ["Web completa, ecommerce, branding y QR/NFC", "Normalmente fuera de la plataforma", "Disponible en una implantación"],
    ],
    offerEyebrow: "UNA PROPUESTA A TU MEDIDA",
    offerTitle: "Empieza con lo esencial. Amplía Timzy a medida que crece tu negocio.",
    offerBody: "El alcance depende de tu equipo, ubicaciones y módulos. Recibes una propuesta clara de implantación y suscripción, sin comisión Timzy por cada reserva.",
    offerPoints: ["Hasta 3 empleados sin coste adicional", "0% de comisión Timzy sobre reservas y pagos", "Pago total o parcial al reservar", "Notas posteriores e historial del cliente", "Opcional: web completa, ecommerce, branding y materiales QR/NFC"],
    offerCta: "Ver demo para mi sector",
    faqEyebrow: "RESPUESTAS CLARAS ANTES DE HABLAR",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { question: "¿Timzy cobra comisión por las reservas?", answer: "No. Timzy no añade comisión a la reserva ni a su pago. Pueden seguir aplicándose las tarifas estándar de Stripe y de otros servicios externos." },
      { question: "¿Mis clientes verán negocios competidores?", answer: "No. Timzy no es un catálogo compartido. El cliente entra en una app centrada en tu marca, tus servicios y tu equipo." },
      { question: "¿La app se publica realmente con mi marca?", answer: "Sí. La implantación elegida incluye una app separada para iOS y Android con tu nombre, logo, colores, contenido y recorrido configurado." },
      { question: "¿Podéis crear una función específica para mi negocio?", answer: "Sí. Revisamos el proceso, la seguridad y el valor comercial, y después definimos y presupuestamos por separado el módulo o la integración." },
      { question: "¿Timzy elimina automáticamente cualquier obligación DAC7?", answer: "No puede garantizarse una exención general sin analizar el modelo contractual y operativo real. Timzy usa entornos separados por cliente en vez de un marketplace central, pero cada negocio debe verificar sus obligaciones fiscales y de información.", source: "https://podatki.gov.pl/podatkowa-wspolpraca-miedzynarodowa/dpi-digital-platform-information", sourceLabel: "Información oficial sobre DAC7" },
    ],
    footerLine: "Apps de reservas con la marca de negocios de servicios.",
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? " brand-mark--compact" : ""}`} role="img" aria-label="Timzy">
      <img className="brand-logo--purple" src="/assets/timzy-logo-official-purple.png" width="307" height="158" alt="" aria-hidden="true" />
      <img className="brand-logo--white" src="/assets/timzy-logo-official-white.png" width="307" height="158" alt="" aria-hidden="true" />
    </span>
  );
}

function ActualAppScreen({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <figure className={`real-phone ${className}`}><div className="real-phone-shell"><img src={src} alt={alt} width="720" height="1566" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} /></div></figure>;
}

function LanguageNav({ locale }: { locale: Locale }) {
  const paths = { en: "/", pl: "/pl/", es: "/es/" };
  return <div className="languages" aria-label="Language"><a href={paths.en} className={locale === "en" ? "is-active" : ""}>EN</a><a href={paths.pl} className={locale === "pl" ? "is-active" : ""}>PL</a><a href={paths.es} className={locale === "es" ? "is-active" : ""}>ES</a></div>;
}

function industryHref(locale: Locale, slug: Copy["industries"][number]["slug"]) {
  if (slug === "spa-beauty") return `${locale === "en" ? "" : `/${locale}`}/beauty-spa/`;
  if (slug === "other") return "#kontakt";
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

export function LandingPage({ copy, locale }: { copy: Copy; locale: Locale }) {
  const signalItems = {
    en: ["YOUR APP", "BOOKINGS 24/7", "COMPLETE WEBSITE", "ONLINE STORE", "CUSTOM FEATURES", "QR / NFC"],
    pl: ["TWOJA APLIKACJA", "REZERWACJE 24/7", "KOMPLETNA STRONA WWW", "SKLEP INTERNETOWY", "FUNKCJE NA ZAMÓWIENIE", "QR / NFC"],
    es: ["TU APP", "RESERVAS 24/7", "WEB COMPLETA", "TIENDA ONLINE", "FUNCIONES A MEDIDA", "QR / NFC"],
  }[locale];
  const conversionBand = {
    en: { label: "SEE TIMZY IN YOUR BUSINESS", title: "The fastest way to decide is to see your own booking journey.", body: "During a free presentation, we will focus on the modules, customer flow and configuration relevant to your industry.", cta: "See a demo for my industry" },
    pl: { label: "ZOBACZ TIMZY W SWOJEJ FIRMIE", title: "Najszybciej ocenisz Timzy, gdy zobaczysz własny proces rezerwacji.", body: "Podczas bezpłatnej prezentacji skupimy się na modułach, ścieżce klienta i konfiguracji odpowiedniej dla Twojej branży.", cta: "Zobacz demo dla swojej branży" },
    es: { label: "DESCUBRE TIMZY EN TU NEGOCIO", title: "La forma más rápida de valorar Timzy es ver tu propio proceso de reserva.", body: "En una presentación gratuita nos centraremos en los módulos, el recorrido y la configuración adecuados para tu sector.", cta: "Ver demo para mi sector" },
  }[locale];
  const legalLinks = {
    en: { privacy: "Privacy and cookies", privacyHref: "/privacy-policy/", features: "Features", featuresHref: "/features/", pricing: "Pricing", pricingHref: "/pricing/", knowledge: "Insights", knowledgeHref: "/insights/", back: "Back to top ↑" },
    pl: { privacy: "Prywatność i cookies", privacyHref: "/pl/polityka-prywatnosci/", features: "Funkcje", featuresHref: "/pl/funkcje/", pricing: "Cennik", pricingHref: "/pl/cennik/", knowledge: "Baza wiedzy", knowledgeHref: "/pl/baza-wiedzy/", back: "Wróć na górę ↑" },
    es: { privacy: "Privacidad y cookies", privacyHref: "/es/politica-privacidad/", features: "Funciones", featuresHref: "/es/funciones/", pricing: "Precios", pricingHref: "/es/precios/", knowledge: "Recursos", knowledgeHref: "/es/recursos/", back: "Volver arriba ↑" },
  }[locale];
  return (
    <main id="top" lang={locale === "pl" ? "pl" : locale === "es" ? "es" : "en-GB"}>
      <PlatformJsonLd locale={locale} faqs={copy.faqs.map(({ question, answer }) => ({ question, answer }))} />
      <a className="skip-link" href="#content">{copy.skip}</a>
      <header className="site-header"><a href={locale === "en" ? "/" : `/${locale}/`} className="logo-link"><BrandMark /></a><nav aria-label="Main navigation"><a href="#clients">{copy.nav[0]}</a><a href="#capabilities">{copy.nav[1]}</a><a href="#industries">{copy.nav[2]}</a><a href="#process">{copy.nav[3]}</a></nav><div className="header-actions"><LanguageNav locale={locale} /><a href="#kontakt" className="button button--small">{copy.navCta}</a></div></header>

      <section className="hero" id="content"><div className="hero-glow hero-glow--one" /><div className="hero-glow hero-glow--two" /><div className="hero-copy"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.heroTitle}<span>{copy.heroAccent}</span></h1><p className="hero-body">{copy.heroBody}</p><div className="hero-actions"><a className="button" href="#kontakt">{copy.heroCta}<span aria-hidden="true">→</span></a><a className="text-link" href="#capabilities">{copy.heroCta2}<span aria-hidden="true">↘</span></a></div><div className="proof-row">{copy.proof.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div></div><div className="hero-visual"><div className="visual-orbit visual-orbit--one" /><div className="visual-orbit visual-orbit--two" /><ActualAppScreen src="/assets/mockups/client-services.webp" alt="Actual Timzy services screen" className="phone--left" eager /><ActualAppScreen src="/assets/mockups/client-home.webp" alt="Actual Timzy home screen" className="phone--centre" eager /><ActualAppScreen src="/assets/mockups/client-shop.webp" alt="Actual Timzy shop screen" className="phone--right" eager /></div></section>

      <div className="signal-strip">{signalItems.map((item, index) => <span key={item}>{item}{index < signalItems.length - 1 ? <i /> : null}</span>)}</div>

      <section className="section problem-section"><div className="section-intro section-intro--wide"><p className="eyebrow">{copy.problemEyebrow}</p><h2>{copy.problemTitle}</h2><p>{copy.problemBody}</p></div><div className="problem-grid">{copy.problems.map((problem) => <article key={problem.title}><span>{problem.icon}</span><h3>{problem.title}</h3><p>{problem.body}</p></article>)}</div></section>

      <CustomerOwnershipSection locale={locale} />

      <section className="section features"><div className="section-intro section-intro--wide"><p className="eyebrow">{copy.featuresEyebrow}</p><h2>{copy.featuresTitle}</h2><p>{copy.featuresBody}</p></div><div className="feature-grid">{copy.features.map((feature, index) => <article className={index === 1 ? "feature-card feature-card--highlight" : "feature-card"} key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</div></section>

      <section className="section industries" id="industries"><div className="section-intro"><p className="eyebrow">{copy.industriesEyebrow}</p><h2>{copy.industriesTitle}</h2><p>{copy.industriesBody}</p></div><div className="industry-grid">{copy.industries.map((industry, index) => <a className={`industry-card industry-card--${index}`} href={industryHref(locale, industry.slug)} key={industry.tag}><div className={`industry-visual industry-visual--${industry.slug}`}>{industry.slug === "other" ? <div className="industry-collage">{industryImages.other.map((image, tileIndex) => <img src={image.src} alt={image.alt} width="1448" height="1086" loading="lazy" key={image.src} className={`industry-collage-tile industry-collage-tile--${tileIndex + 1}`} />)}</div> : <img className="industry-photo" src={industryImages[industry.slug][0].src} alt={industryImages[industry.slug][0].alt} width="1448" height="1086" loading="lazy" />}<span className="industry-photo-tag">{industry.tag}</span></div><div className="industry-copy"><p className="card-tag">{industry.tag}</p><h3>{industry.title}</h3><p>{industry.body}</p><ul>{industry.points.map(point => <li key={point}>{point}</li>)}</ul><span className="industry-link">{copy.industryLink}<b aria-hidden="true">→</b></span></div></a>)}</div></section>

      <ActualProductShowcase locale={locale} />

      <section className="conversion-band"><div><p>{conversionBand.label}</p><h2>{conversionBand.title}</h2><span>{conversionBand.body}</span></div><a className="button button--light" href="#kontakt">{conversionBand.cta}<b aria-hidden="true">→</b></a></section>

      <ProductCapabilities locale={locale} />

      <TemplateChoiceSection locale={locale} ctaHref="#kontakt" />

      <section className="process" id="process"><div className="process-heading"><p className="eyebrow">{copy.processEyebrow}</p><h2>{copy.processTitle}</h2></div><div className="process-grid">{copy.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div className="process-line"><i /></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>

      <section className="section comparison" id="compare"><div className="section-intro"><p className="eyebrow">{copy.compareEyebrow}</p><h2>{copy.compareTitle}</h2><p>{copy.compareBody}</p></div><div className="comparison-table" role="table" aria-label={copy.compareTitle}><div className="comparison-head" role="row">{copy.compareLabels.map((label, index) => <span className={index === 2 ? "timzy-col" : ""} role="columnheader" key={label}>{index === 2 ? <BrandMark compact /> : label}</span>)}</div>{copy.compareRows.map(row => <div className="comparison-row" role="row" key={row[0]}><b role="cell">{row[0]}</b><span role="cell"><i>−</i>{row[1]}</span><span className="timzy-col" role="cell"><i>✓</i>{row[2]}</span></div>)}</div>{locale === "pl" ? <p className="comparison-evidence"><b>Konkretny przykład: Booksy Boost.</b> Booksy podaje, że opcjonalna usługa Boost pobiera 45% netto wartości wszystkich usług wykonanych podczas pierwszej, zakończonej wizyty nowego klienta Boost. Rezerwacje pochodzące z bezprowizyjnego linku do profilu lub integracji nie podlegają tej prowizji, dlatego nie każda rezerwacja Booksy jest prowizyjna. Timzy nie pobiera własnej prowizji ani od rezerwacji, ani od płatności za rezerwację. Przy płatnościach online nadal obowiązują standardowe opłaty operatora Stripe. <a href="https://biz.booksy.com/pl-pl/funkcje/boost" target="_blank" rel="noreferrer">Sprawdź oficjalne zasady Booksy Boost →</a><small>Stan informacji sprawdzony 12 sierpnia 2026 r.</small></p> : null}</section>

      <section className="offer"><div className="offer-copy"><p className="eyebrow">{copy.offerEyebrow}</p><h2>{copy.offerTitle}</h2><p>{copy.offerBody}</p><ul>{copy.offerPoints.map(point => <li key={point}><span>✓</span>{point}</li>)}</ul><a className="button button--light" href="#kontakt">{copy.offerCta}<span>→</span></a></div><div className="offer-visual offer-visual--template"><img className="offer-template-mockup" src="/assets/templates/natural-sage-phone-transparent.png" alt="Branded app login mockup in the Natural Sage style" width="1024" height="1535" loading="lazy" /></div></section>

      <section className="faq-section" id="faq"><div className="faq-heading"><p className="eyebrow">{copy.faqEyebrow}</p><h2>{copy.faqTitle}</h2></div><div className="faq-list">{copy.faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}{faq.source && faq.sourceLabel ? <a href={faq.source} target="_blank" rel="noreferrer">{faq.sourceLabel} →</a> : null}</p></details>)}</div></section>

      <ContactSection locale={locale} />

      <footer><div className="footer-brand"><BrandMark /><p>{copy.footerLine}</p></div><div className="footer-contact"><a href="mailto:hello@timzy.app">hello@timzy.app</a><a href="tel:+34600659705">+34 600 659 705</a><a href="tel:+48507702007">+48 507 702 007</a></div><div className="footer-links"><a href={legalLinks.featuresHref}>{legalLinks.features}</a><a href={legalLinks.pricingHref}>{legalLinks.pricing}</a><a href={legalLinks.knowledgeHref}>{legalLinks.knowledge}</a><a href={legalLinks.privacyHref}>{legalLinks.privacy}</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Timzy</span><LanguageNav locale={locale} /><a href="#top">{legalLinks.back}</a></div></footer>
    </main>
  );
}
