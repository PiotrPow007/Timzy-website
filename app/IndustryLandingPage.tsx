import { ProductCapabilities } from "./ProductCapabilities";

export type SiteLocale = "en" | "pl" | "es";
export type IndustryKey = "sport" | "golf" | "tennis" | "car-wash-detailing";

type IndustryContent = {
  tag: string;
  title: string;
  accent: string;
  body: string;
  problemTitle: string;
  problemBody: string;
  outcomes: Array<{ icon: string; title: string; body: string }>;
  productTitle: string;
  productBody: string;
  features: string[];
  primaryCta: string;
  finalTitle: string;
  finalBody: string;
  mockup: {
    greeting: string;
    headline: string;
    action: string;
    items: Array<{ label: string; meta: string }>;
    tabs: string[];
  };
};

type SharedContent = {
  navPlatform: string;
  navIndustries: string;
  navProcess: string;
  navCta: string;
  proof: string[];
  problemEyebrow: string;
  productEyebrow: string;
  processEyebrow: string;
  processTitle: string;
  process: Array<{ title: string; body: string }>;
  otherEyebrow: string;
  otherTitle: string;
  otherLink: string;
  finalEyebrow: string;
  finalCta: string;
  finalAlt: string;
  footer: string;
  backTop: string;
};

export const sharedCopy: Record<SiteLocale, SharedContent> = {
  en: {
    navPlatform: "Why Timzy",
    navIndustries: "Industries",
    navProcess: "How it works",
    navCta: "Talk on WhatsApp",
    proof: ["iOS & Android", "Your logo and colours", "No marketplace competitors"],
    problemEyebrow: "BUILT FOR YOUR DAILY REALITY",
    productEyebrow: "THE APP YOUR CLIENTS WILL USE",
    processEyebrow: "FROM WORKFLOW TO LAUNCH",
    processTitle: "A branded app without building software from scratch.",
    process: [
      { title: "Show us how you work", body: "We map your services, team, rules and priorities." },
      { title: "See your branded version", body: "We configure the flow, modules, content and visual identity." },
      { title: "Test and launch", body: "You approve the experience. We support publication and onboarding." },
    ],
    otherEyebrow: "OTHER TIMZY SOLUTIONS",
    otherTitle: "See how Timzy works in another industry.",
    otherLink: "Explore",
    finalEyebrow: "LET'S MAKE THE DEMO RELEVANT",
    finalCta: "Request my industry demo",
    finalAlt: "or email hello@timzy.app",
    footer: "Branded booking apps for service businesses.",
    backTop: "Back to top ↑",
  },
  pl: {
    navPlatform: "Dlaczego Timzy",
    navIndustries: "Branże",
    navProcess: "Jak to działa",
    navCta: "Napisz na WhatsApp",
    proof: ["iOS i Android", "Twoje logo i kolory", "Bez konkurencji z marketplace'u"],
    problemEyebrow: "STWORZONE POD REALNĄ PRACĘ",
    productEyebrow: "APLIKACJA, Z KTÓREJ KLIENCI BĘDĄ KORZYSTAĆ",
    processEyebrow: "OD PROCESU DO PUBLIKACJI",
    processTitle: "Własna aplikacja bez budowania systemu od zera.",
    process: [
      { title: "Pokazujesz, jak pracujesz", body: "Ustalamy usługi, zespół, zasady i priorytety." },
      { title: "Oglądasz wersję pod swoją marką", body: "Konfigurujemy proces, moduły, treści i identyfikację wizualną." },
      { title: "Testujesz i publikujesz", body: "Zatwierdzasz aplikację. Wspieramy publikację i wdrożenie zespołu." },
    ],
    otherEyebrow: "INNE ROZWIĄZANIA TIMZY",
    otherTitle: "Zobacz, jak Timzy działa w innej branży.",
    otherLink: "Zobacz",
    finalEyebrow: "POROZMAWIAJMY O TWOJEJ BRANŻY",
    finalCta: "Chcę demo dla mojej branży",
    finalAlt: "lub napisz na hello@timzy.app",
    footer: "Aplikacje rezerwacyjne pod marką firm usługowych.",
    backTop: "Wróć na górę ↑",
  },
  es: {
    navPlatform: "Por qué Timzy",
    navIndustries: "Sectores",
    navProcess: "Cómo funciona",
    navCta: "Hablar por WhatsApp",
    proof: ["iOS y Android", "Tu logo y tus colores", "Sin competidores de marketplace"],
    problemEyebrow: "CREADA PARA TU DÍA A DÍA",
    productEyebrow: "LA APP QUE TUS CLIENTES USARÁN",
    processEyebrow: "DEL PROCESO AL LANZAMIENTO",
    processTitle: "Una app con tu marca sin crear software desde cero.",
    process: [
      { title: "Nos enseñas cómo trabajas", body: "Definimos servicios, equipo, normas y prioridades." },
      { title: "Ves la versión con tu marca", body: "Configuramos el proceso, módulos, contenido e identidad visual." },
      { title: "Pruebas y lanzas", body: "Apruebas la experiencia. Apoyamos la publicación y puesta en marcha." },
    ],
    otherEyebrow: "OTRAS SOLUCIONES TIMZY",
    otherTitle: "Descubre cómo funciona Timzy en otro sector.",
    otherLink: "Ver",
    finalEyebrow: "HABLEMOS DE TU SECTOR",
    finalCta: "Quiero una demo para mi sector",
    finalAlt: "o escribe a hello@timzy.app",
    footer: "Apps de reservas con la marca de negocios de servicios.",
    backTop: "Volver arriba ↑",
  },
};

export const industryCopy: Record<SiteLocale, Record<IndustryKey, IndustryContent>> = {
  en: {
    sport: {
      tag: "SPORT CLUBS",
      title: "Run the club.",
      accent: "Not the booking chaos.",
      body: "Put training, games, tournaments, camps and club communication in one mobile app under your own brand.",
      problemTitle: "Members expect one simple place for everything the club offers.",
      problemBody: "When bookings live in messages, events on social media and schedules in separate files, the team repeats work and members miss opportunities. Timzy connects the journey.",
      outcomes: [
        { icon: "◎", title: "One club calendar", body: "Training, games and events stay clear for members and staff." },
        { icon: "↗", title: "More active members", body: "News and push updates bring people back to club life." },
        { icon: "◫", title: "Less manual coordination", body: "Availability, bookings and participant lists live in one system." },
      ],
      productTitle: "A club app designed around participation, not paperwork.",
      productBody: "Timzy's current sport configuration already supports games, training, tournaments, camps, news and operational reporting.",
      features: ["Game and training bookings", "Coach and team calendars", "Tournaments and camps", "Club news and notifications", "Participant and activity reports"],
      primaryCta: "Show me the sport demo",
      finalTitle: "Show members a club that is always within reach.",
      finalBody: "Tell us how your club works and we will show you the modules and booking flow that fit it.",
      mockup: { greeting: "Good afternoon", headline: "What do you want to join?", action: "Book now", items: [{ label: "Team training", meta: "Today · 18:00" }, { label: "Summer tournament", meta: "12 places left" }, { label: "Club camp", meta: "Registration open" }], tabs: ["Home", "Games", "Team", "Camps"] },
    },
    golf: {
      tag: "GOLF CLUBS & ACADEMIES",
      title: "Your club in every player's pocket.",
      accent: "From the next round to the next tournament.",
      body: "Give players a branded place to book games and coaching, follow tournaments, join camps and stay close to club life.",
      problemTitle: "A golf club sells more than tee time. Its digital experience should show it.",
      problemBody: "A generic booking link cannot carry the relationship between player, coach and club. Timzy brings the full experience into one branded app.",
      outcomes: [
        { icon: "●", title: "Faster game booking", body: "Players organise a round without waiting for a reply." },
        { icon: "↗", title: "More coaching activity", body: "Coach availability and training options are easier to find." },
        { icon: "♢", title: "Stronger club engagement", body: "Tournaments, camps and news stay visible after the booking." },
      ],
      productTitle: "Built around the way a golf community actually works.",
      productBody: "The Timzy golf configuration supports game creation, coaching bookings, tournaments, camps, club news and reports in one app.",
      features: ["Create and join golf games", "Book individual or group training", "Publish tournaments and results", "Manage camps and registrations", "Send club news and push updates"],
      primaryCta: "Show me the golf demo",
      finalTitle: "Make the next interaction happen inside your club's app.",
      finalBody: "We will configure a golf demo around your coaches, events and member journey.",
      mockup: { greeting: "Welcome back", headline: "Ready for your next round?", action: "Book a game", items: [{ label: "Golf training", meta: "Tomorrow · 10:30" }, { label: "Club tournament", meta: "Registration open" }, { label: "Costa del Sol camp", meta: "4 days · 16 players" }], tabs: ["Home", "Games", "Training", "Team"] },
    },
    tennis: {
      tag: "TENNIS & RACQUET CLUBS",
      title: "Fill more courts.",
      accent: "Save the front desk.",
      body: "Make court time, coaching and club events easy to discover and book in one app carrying your club's identity.",
      problemTitle: "Every unanswered call can become an empty court or coaching hour.",
      problemBody: "Players want to see availability when it suits them. Timzy turns courts and lessons into clear bookable services and keeps the relationship under the club's brand.",
      outcomes: [
        { icon: "◉", title: "Book around the clock", body: "Players choose a court or coaching option without calling." },
        { icon: "◎", title: "Clear coach availability", body: "Lessons and team schedules stay organised in one view." },
        { icon: "↗", title: "More reasons to return", body: "Events, reminders and club updates bring players back." },
      ],
      productTitle: "A simple player journey built on Timzy's booking engine.",
      productBody: "Courts, lessons and coaching can be configured as bookable services, with staff calendars, reminders, club content and activity reporting.",
      features: ["Court and lesson booking", "Coach calendars", "Individual and group sessions", "Events and club updates", "Reminders and booking history"],
      primaryCta: "Show me the tennis demo",
      finalTitle: "Make booking a court as easy as opening your app.",
      finalBody: "Show us your court and coaching setup. We will shape the demo around it.",
      mockup: { greeting: "Good morning", headline: "Court or coaching?", action: "Check availability", items: [{ label: "Court 2 · 60 min", meta: "Today · 17:00" }, { label: "Private lesson", meta: "Coach Alex · 18:30" }, { label: "Weekend tournament", meta: "Registration open" }], tabs: ["Home", "Courts", "Coaches", "Events"] },
    },
    "car-wash-detailing": {
      tag: "CAR WASH & DETAILING",
      title: "Turn enquiries into booked visits.",
      accent: "From package to confirmation in one app.",
      body: "Let clients choose a service package, see availability and book without waiting for a call back.",
      problemTitle: "A great detailing result can still lose the sale before the car arrives.",
      problemBody: "Long price lists, unanswered messages and unclear availability add friction. Timzy creates a direct booking path from service choice to confirmed visit.",
      outcomes: [
        { icon: "◇", title: "Fewer booking messages", body: "Clients choose a package and available date on their own." },
        { icon: "◎", title: "A clearer daily schedule", body: "Bookings, services and staff availability stay in one view." },
        { icon: "↗", title: "More repeat visits", body: "Reminders and booking history make the next visit easier." },
      ],
      productTitle: "A clean booking journey for services that depend on time and trust.",
      productBody: "Timzy can configure detailing packages as services, connect them to team availability and keep clients informed with booking confirmations and reminders.",
      features: ["Service packages and durations", "Live appointment availability", "Team and location calendars", "Confirmations and reminders", "Client and booking history"],
      primaryCta: "Show me the car care demo",
      finalTitle: "Make the booking experience match the quality of your finish.",
      finalBody: "Send us your packages and working hours. We will show you a Timzy flow configured around them.",
      mockup: { greeting: "Your car deserves care", headline: "Choose your finish", action: "Book a service", items: [{ label: "Premium hand wash", meta: "60 min · from €45" }, { label: "Interior detailing", meta: "120 min · from €95" }, { label: "Full protection", meta: "Next slot · Thursday" }], tabs: ["Home", "Services", "Bookings", "Profile"] },
    },
  },
  pl: {
    sport: {
      tag: "KLUBY SPORTOWE",
      title: "Prowadź klub.",
      accent: "Nie chaos rezerwacji.",
      body: "Połącz treningi, gry, turnieje, obozy i komunikację klubową w jednej aplikacji pod własną marką.",
      problemTitle: "Członkowie oczekują jednego prostego miejsca na wszystko, co oferuje klub.",
      problemBody: "Gdy rezerwacje są w wiadomościach, wydarzenia w social mediach, a grafiki w osobnych plikach, zespół powtarza pracę, a członkowie tracą okazje. Timzy łączy cały proces.",
      outcomes: [
        { icon: "◎", title: "Jeden kalendarz klubu", body: "Treningi, gry i wydarzenia są czytelne dla członków i zespołu." },
        { icon: "↗", title: "Więcej aktywnych członków", body: "Aktualności i powiadomienia przyciągają ludzi z powrotem do klubu." },
        { icon: "◫", title: "Mniej ręcznej koordynacji", body: "Dostępność, rezerwacje i listy uczestników są w jednym systemie." },
      ],
      productTitle: "Aplikacja klubowa stworzona wokół uczestnictwa, nie papierologii.",
      productBody: "Obecna konfiguracja sportowa Timzy obsługuje gry, treningi, turnieje, obozy, aktualności i raporty operacyjne.",
      features: ["Rezerwacje gier i treningów", "Kalendarze trenerów i zespołu", "Turnieje i obozy", "Aktualności i powiadomienia", "Raporty uczestników i aktywności"],
      primaryCta: "Pokażcie mi demo sportowe",
      finalTitle: "Pokaż członkom klub, który zawsze mają pod ręką.",
      finalBody: "Opowiedz nam, jak działa Twój klub, a pokażemy moduły i proces rezerwacji dopasowane do niego.",
      mockup: { greeting: "Dzień dobry", headline: "W czym chcesz wziąć udział?", action: "Rezerwuję", items: [{ label: "Trening drużynowy", meta: "Dzisiaj · 18:00" }, { label: "Turniej letni", meta: "Zostało 12 miejsc" }, { label: "Obóz klubowy", meta: "Zapisy otwarte" }], tabs: ["Start", "Gry", "Drużyna", "Obozy"] },
    },
    golf: {
      tag: "KLUBY I AKADEMIE GOLFOWE",
      title: "Twój klub w kieszeni każdego gracza.",
      accent: "Od kolejnej rundy po następny turniej.",
      body: "Daj graczom miejsce pod marką klubu, w którym rezerwują gry i treningi, śledzą turnieje, zapisują się na obozy i żyją klubem.",
      problemTitle: "Klub golfowy sprzedaje więcej niż tee time. Jego doświadczenie cyfrowe powinno to pokazywać.",
      problemBody: "Zwykły link do rezerwacji nie buduje relacji między graczem, trenerem i klubem. Timzy łączy całe doświadczenie w jednej aplikacji klubowej.",
      outcomes: [
        { icon: "●", title: "Szybsze umawianie gry", body: "Gracze organizują rundę bez czekania na odpowiedź." },
        { icon: "↗", title: "Więcej treningów", body: "Dostępność trenerów i oferta zajęć są łatwe do znalezienia." },
        { icon: "♢", title: "Silniejsze życie klubu", body: "Turnieje, obozy i aktualności są widoczne także po rezerwacji." },
      ],
      productTitle: "Zbudowane wokół tego, jak naprawdę działa społeczność golfowa.",
      productBody: "Konfiguracja golfowa Timzy obsługuje tworzenie gier, rezerwacje treningów, turnieje, obozy, aktualności klubowe i raporty.",
      features: ["Tworzenie i dołączanie do gier", "Treningi indywidualne i grupowe", "Turnieje i wyniki", "Obozy i zapisy", "Aktualności i powiadomienia push"],
      primaryCta: "Pokażcie mi demo golfowe",
      finalTitle: "Niech kolejna interakcja wydarzy się w aplikacji Twojego klubu.",
      finalBody: "Skonfigurujemy demo golfowe wokół Twoich trenerów, wydarzeń i ścieżki gracza.",
      mockup: { greeting: "Witaj ponownie", headline: "Gotowy na kolejną rundę?", action: "Umów grę", items: [{ label: "Trening golfowy", meta: "Jutro · 10:30" }, { label: "Turniej klubowy", meta: "Zapisy otwarte" }, { label: "Obóz Costa del Sol", meta: "4 dni · 16 graczy" }], tabs: ["Start", "Gry", "Trening", "Drużyna"] },
    },
    tennis: {
      tag: "KLUBY TENISOWE",
      title: "Zapełniaj więcej kortów.",
      accent: "Odciąż recepcję.",
      body: "Ułatwiaj odkrywanie i rezerwowanie kortów, treningów oraz wydarzeń w aplikacji z identyfikacją Twojego klubu.",
      problemTitle: "Każdy nieodebrany telefon może oznaczać pusty kort albo godzinę trenera.",
      problemBody: "Gracze chcą sprawdzić dostępność wtedy, kiedy im pasuje. Timzy zmienia korty i treningi w czytelne usługi do rezerwacji pod marką klubu.",
      outcomes: [
        { icon: "◉", title: "Rezerwacje przez całą dobę", body: "Gracze wybierają kort lub trening bez telefonowania." },
        { icon: "◎", title: "Czytelna dostępność trenerów", body: "Zajęcia i grafiki zespołu są uporządkowane w jednym widoku." },
        { icon: "↗", title: "Więcej powodów do powrotu", body: "Wydarzenia, przypomnienia i aktualności przyciągają graczy ponownie." },
      ],
      productTitle: "Prosta ścieżka gracza oparta na silniku rezerwacji Timzy.",
      productBody: "Korty, treningi i trenerzy mogą być skonfigurowani jako rezerwowane usługi z grafikami, przypomnieniami, treściami klubowymi i raportami.",
      features: ["Rezerwacje kortów i treningów", "Kalendarze trenerów", "Zajęcia indywidualne i grupowe", "Wydarzenia i aktualności", "Przypomnienia i historia rezerwacji"],
      primaryCta: "Pokażcie mi demo tenisowe",
      finalTitle: "Niech rezerwacja kortu będzie tak prosta jak otwarcie aplikacji.",
      finalBody: "Pokaż nam układ kortów i trenerów, a dopasujemy do niego demo.",
      mockup: { greeting: "Dzień dobry", headline: "Kort czy trening?", action: "Sprawdź terminy", items: [{ label: "Kort 2 · 60 min", meta: "Dzisiaj · 17:00" }, { label: "Trening indywidualny", meta: "Trener Alex · 18:30" }, { label: "Turniej weekendowy", meta: "Zapisy otwarte" }], tabs: ["Start", "Korty", "Trenerzy", "Wydarzenia"] },
    },
    "car-wash-detailing": {
      tag: "MYJNIE I DETAILING",
      title: "Zamieniaj zapytania w umówione wizyty.",
      accent: "Od pakietu do potwierdzenia w jednej aplikacji.",
      body: "Klient wybiera pakiet, widzi dostępne terminy i rezerwuje bez czekania na telefon zwrotny.",
      problemTitle: "Świetna jakość usługi nie pomoże, jeśli sprzedaż zgubi się przed przyjazdem auta.",
      problemBody: "Długie cenniki, nieodczytane wiadomości i niejasna dostępność tworzą tarcie. Timzy prowadzi klienta bezpośrednio od wyboru usługi do potwierdzonej wizyty.",
      outcomes: [
        { icon: "◇", title: "Mniej wiadomości o terminy", body: "Klient sam wybiera pakiet i dostępną datę." },
        { icon: "◎", title: "Czytelniejszy plan dnia", body: "Rezerwacje, usługi i dostępność zespołu są w jednym widoku." },
        { icon: "↗", title: "Łatwiejsze powroty", body: "Przypomnienia i historia rezerwacji upraszczają kolejną wizytę." },
      ],
      productTitle: "Czysta ścieżka rezerwacji dla usług, które opierają się na czasie i zaufaniu.",
      productBody: "Timzy może skonfigurować pakiety detailingu jako usługi, połączyć je z dostępnością zespołu i informować klientów przez potwierdzenia oraz przypomnienia.",
      features: ["Pakiety usług i czas trwania", "Dostępne terminy online", "Grafiki zespołu i lokalizacji", "Potwierdzenia i przypomnienia", "Historia klienta i rezerwacji"],
      primaryCta: "Pokażcie mi demo dla car care",
      finalTitle: "Niech jakość rezerwacji dorównuje jakości wykończenia auta.",
      finalBody: "Wyślij nam pakiety i godziny pracy. Pokażemy Timzy skonfigurowane wokół nich.",
      mockup: { greeting: "Twoje auto zasługuje na więcej", headline: "Wybierz efekt", action: "Umów usługę", items: [{ label: "Mycie ręczne Premium", meta: "60 min · od 45 €" }, { label: "Detailing wnętrza", meta: "120 min · od 95 €" }, { label: "Pełne zabezpieczenie", meta: "Najbliżej · czwartek" }], tabs: ["Start", "Usługi", "Wizyty", "Profil"] },
    },
  },
  es: {
    sport: {
      tag: "CLUBES DEPORTIVOS",
      title: "Dirige el club.",
      accent: "No el caos de reservas.",
      body: "Une entrenamientos, partidos, torneos, campus y comunicación en una app móvil con la marca del club.",
      problemTitle: "Los socios esperan un único lugar sencillo para todo lo que ofrece el club.",
      problemBody: "Cuando las reservas están en mensajes, los eventos en redes y los horarios en archivos separados, el equipo repite trabajo y los socios pierden oportunidades. Timzy conecta el recorrido.",
      outcomes: [
        { icon: "◎", title: "Un calendario del club", body: "Entrenamientos, partidos y eventos claros para socios y equipo." },
        { icon: "↗", title: "Más socios activos", body: "Noticias y avisos push atraen a la gente de nuevo al club." },
        { icon: "◫", title: "Menos coordinación manual", body: "Disponibilidad, reservas y participantes viven en un sistema." },
      ],
      productTitle: "Una app diseñada para participar, no para gestionar papeleo.",
      productBody: "La configuración deportiva actual de Timzy ya admite partidos, entrenamientos, torneos, campus, noticias e informes.",
      features: ["Reservas de partidos y entrenamientos", "Agendas de entrenadores y equipo", "Torneos y campus", "Noticias y notificaciones", "Informes de actividad"],
      primaryCta: "Ver la demo deportiva",
      finalTitle: "Ofrece a los socios un club siempre a su alcance.",
      finalBody: "Cuéntanos cómo funciona tu club y te mostraremos los módulos y el recorrido adecuados.",
      mockup: { greeting: "Buenas tardes", headline: "¿En qué quieres participar?", action: "Reservar", items: [{ label: "Entrenamiento de equipo", meta: "Hoy · 18:00" }, { label: "Torneo de verano", meta: "Quedan 12 plazas" }, { label: "Campus del club", meta: "Inscripción abierta" }], tabs: ["Inicio", "Partidos", "Equipo", "Campus"] },
    },
    golf: {
      tag: "CLUBES Y ACADEMIAS DE GOLF",
      title: "Tu club en el bolsillo de cada jugador.",
      accent: "De la próxima ronda al siguiente torneo.",
      body: "Da a los jugadores un lugar con tu marca para reservar partidos y clases, seguir torneos, apuntarse a campus y vivir el club.",
      problemTitle: "Un club de golf vende más que una hora de salida. Su experiencia digital debe mostrarlo.",
      problemBody: "Un enlace genérico no construye la relación entre jugador, entrenador y club. Timzy reúne toda la experiencia en una app con tu marca.",
      outcomes: [
        { icon: "●", title: "Partidos más rápidos", body: "Los jugadores organizan una ronda sin esperar respuesta." },
        { icon: "↗", title: "Más actividad de entrenamiento", body: "La disponibilidad y las clases son fáciles de encontrar." },
        { icon: "♢", title: "Más vida de club", body: "Torneos, campus y noticias siguen visibles tras la reserva." },
      ],
      productTitle: "Creada alrededor de cómo funciona una comunidad de golf.",
      productBody: "La configuración de golf de Timzy admite partidos, clases, torneos, campus, noticias e informes en una sola app.",
      features: ["Crear y unirse a partidos", "Clases individuales y de grupo", "Torneos y resultados", "Campus e inscripciones", "Noticias y avisos push"],
      primaryCta: "Ver la demo de golf",
      finalTitle: "Haz que la próxima interacción ocurra en la app de tu club.",
      finalBody: "Configuraremos una demo alrededor de tus entrenadores, eventos y recorrido del jugador.",
      mockup: { greeting: "Bienvenido de nuevo", headline: "¿Preparado para otra ronda?", action: "Reservar partido", items: [{ label: "Clase de golf", meta: "Mañana · 10:30" }, { label: "Torneo del club", meta: "Inscripción abierta" }, { label: "Campus Costa del Sol", meta: "4 días · 16 jugadores" }], tabs: ["Inicio", "Partidos", "Clases", "Equipo"] },
    },
    tennis: {
      tag: "CLUBES DE TENIS",
      title: "Llena más pistas.",
      accent: "Libera a recepción.",
      body: "Haz que pistas, clases y eventos sean fáciles de descubrir y reservar en una app con la identidad de tu club.",
      problemTitle: "Cada llamada sin respuesta puede convertirse en una pista u hora de entrenador vacía.",
      problemBody: "Los jugadores quieren ver disponibilidad cuando les conviene. Timzy convierte pistas y clases en servicios reservables bajo la marca del club.",
      outcomes: [
        { icon: "◉", title: "Reservas todo el día", body: "Los jugadores eligen pista o clase sin llamar." },
        { icon: "◎", title: "Disponibilidad clara", body: "Clases y agendas del equipo organizadas en una vista." },
        { icon: "↗", title: "Más motivos para volver", body: "Eventos, recordatorios y noticias atraen de nuevo." },
      ],
      productTitle: "Un recorrido sencillo basado en el motor de reservas Timzy.",
      productBody: "Pistas, clases y entrenadores pueden configurarse como servicios reservables con agendas, recordatorios, contenido e informes.",
      features: ["Reservas de pistas y clases", "Agendas de entrenadores", "Sesiones individuales y de grupo", "Eventos y noticias", "Recordatorios e historial"],
      primaryCta: "Ver la demo de tenis",
      finalTitle: "Haz que reservar pista sea tan fácil como abrir la app.",
      finalBody: "Enséñanos tus pistas y entrenadores. Adaptaremos la demo a ellos.",
      mockup: { greeting: "Buenos días", headline: "¿Pista o clase?", action: "Ver disponibilidad", items: [{ label: "Pista 2 · 60 min", meta: "Hoy · 17:00" }, { label: "Clase individual", meta: "Coach Alex · 18:30" }, { label: "Torneo de fin de semana", meta: "Inscripción abierta" }], tabs: ["Inicio", "Pistas", "Coaches", "Eventos"] },
    },
    "car-wash-detailing": {
      tag: "LAVADO Y DETAILING",
      title: "Convierte consultas en citas.",
      accent: "Del pack a la confirmación en una app.",
      body: "El cliente elige un pack, ve las horas disponibles y reserva sin esperar una llamada.",
      problemTitle: "Un acabado excelente no sirve si la venta se pierde antes de que llegue el coche.",
      problemBody: "Listas largas, mensajes sin responder y poca claridad añaden fricción. Timzy lleva al cliente del servicio elegido a la cita confirmada.",
      outcomes: [
        { icon: "◇", title: "Menos mensajes", body: "El cliente elige pack y fecha disponible por sí mismo." },
        { icon: "◎", title: "Un día más claro", body: "Reservas, servicios y disponibilidad en una vista." },
        { icon: "↗", title: "Más visitas repetidas", body: "Recordatorios e historial facilitan la próxima visita." },
      ],
      productTitle: "Un recorrido limpio para servicios que dependen de tiempo y confianza.",
      productBody: "Timzy puede configurar packs como servicios, conectarlos con la disponibilidad del equipo e informar con confirmaciones y recordatorios.",
      features: ["Packs y duración de servicios", "Disponibilidad de citas", "Agendas de equipo y locales", "Confirmaciones y recordatorios", "Historial de clientes y reservas"],
      primaryCta: "Ver la demo de car care",
      finalTitle: "Haz que la reserva esté a la altura del acabado.",
      finalBody: "Envíanos tus packs y horarios. Te mostraremos Timzy configurado alrededor de ellos.",
      mockup: { greeting: "Tu coche merece cuidado", headline: "Elige el acabado", action: "Reservar servicio", items: [{ label: "Lavado manual Premium", meta: "60 min · desde 45 €" }, { label: "Detailing interior", meta: "120 min · desde 95 €" }, { label: "Protección completa", meta: "Próxima cita · jueves" }], tabs: ["Inicio", "Servicios", "Citas", "Perfil"] },
    },
  },
};

const industryOrder: IndustryKey[] = ["sport", "golf", "tennis", "car-wash-detailing"];

const golfAutomationCopy: Record<SiteLocale, { eyebrow: string; title: string; body: string; items: string[] }> = {
  en: { eyebrow: "INDIVIDUAL GOLF AUTOMATION", title: "Timzy can extend beyond reservations.", body: "Selected equipment integrations are delivered as a separate scope after we verify the hardware, API and safety requirements.", items: ["Ball dispenser access from the app", "Machine and simulator maintenance schedules", "Partner or sponsor launch screen", "Golf equipment shop and order flow"] },
  pl: { eyebrow: "INDYWIDUALNE AUTOMATYZACJE GOLFOWE", title: "Timzy może wyjść poza same rezerwacje.", body: "Integracje ze sprzętem realizujemy jako osobny zakres po sprawdzeniu urządzeń, dostępnego API i wymagań bezpieczeństwa.", items: ["Dostęp do dozownika piłek z aplikacji", "Harmonogram serwisu maszyn i symulatorów", "Ekran startowy partnera lub sponsora", "Sklep ze sprzętem golfowym i obsługa zamówień"] },
  es: { eyebrow: "AUTOMATIZACIÓN DE GOLF A MEDIDA", title: "Timzy puede ir más allá de las reservas.", body: "Las integraciones con equipos se realizan como un alcance separado tras revisar el hardware, la API y los requisitos de seguridad.", items: ["Acceso al dispensador de bolas desde la app", "Agenda de mantenimiento de máquinas y simuladores", "Pantalla inicial para colaborador o patrocinador", "Tienda de material de golf y gestión de pedidos"] },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-mark${compact ? " brand-mark--compact" : ""}`} aria-label="Timzy"><img className="brand-logo--purple" src="/assets/timzy-logo-official-purple.png" alt="" aria-hidden="true" /><img className="brand-logo--white" src="/assets/timzy-logo-official-white.png" alt="" aria-hidden="true" /></span>;
}

function localeRoot(locale: SiteLocale) {
  return locale === "en" ? "/" : `/${locale}/`;
}

function localeIndustryPath(locale: SiteLocale, industry: IndustryKey) {
  return `${locale === "en" ? "" : `/${locale}`}/${industry}/`;
}

function WhatsAppLink({ locale, label, industry, className = "button" }: { locale: SiteLocale; label: string; industry: string; className?: string }) {
  const messages = {
    en: `Hi, I would like to see a Timzy demo for ${industry}.`,
    pl: `Dzień dobry, chcę zobaczyć demo Timzy dla branży ${industry}.`,
    es: `Hola, quiero ver una demo de Timzy para ${industry}.`,
  };
  const href = `https://wa.me/34600659705?text=${encodeURIComponent(messages[locale])}`;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{label}<span aria-hidden="true">→</span></a>;
}

function IndustryLanguageNav({ locale, industry }: { locale: SiteLocale; industry: IndustryKey }) {
  return <div className="languages" aria-label="Language"><a href={localeIndustryPath("en", industry)} className={locale === "en" ? "is-active" : ""}>EN</a><a href={localeIndustryPath("pl", industry)} className={locale === "pl" ? "is-active" : ""}>PL</a><a href={localeIndustryPath("es", industry)} className={locale === "es" ? "is-active" : ""}>ES</a></div>;
}

function IndustryMockup({ content }: { content: IndustryContent }) {
  return <div className="vertical-phone" aria-hidden="true"><div className="vertical-phone-frame"><div className="vertical-phone-island" /><div className="vertical-app"><div className="vertical-status"><span>9:41</span><span>● ◔ ▰</span></div><div className="vertical-app-head"><span className="vertical-logo">T</span><b>YOUR BRAND</b><span>◎</span></div><div className="vertical-app-hero"><small>{content.mockup.greeting}</small><h3>{content.mockup.headline}</h3><button>{content.mockup.action}</button></div><div className="vertical-app-list">{content.mockup.items.map((item, index) => <div className="vertical-app-row" key={item.label}><span>{index === 0 ? "↗" : index === 1 ? "◎" : "◇"}</span><p><b>{item.label}</b><small>{item.meta}</small></p><i>›</i></div>)}</div><div className="vertical-app-tabs">{content.mockup.tabs.map((tab, index) => <span className={index === 0 ? "is-active" : ""} key={tab}><b>{index === 0 ? "⌂" : index === 1 ? "◫" : index === 2 ? "◎" : "◇"}</b><small>{tab}</small></span>)}</div></div></div></div>;
}

export function IndustryLandingPage({ locale, industry }: { locale: SiteLocale; industry: IndustryKey }) {
  const shared = sharedCopy[locale];
  const content = industryCopy[locale][industry];
  const otherIndustries = industryOrder.filter((item) => item !== industry);
  const language = locale === "pl" ? "pl" : locale === "es" ? "es" : "en-GB";

  return <main id="top" lang={language} className={`industry-page industry-page--${industry}`}>
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="site-header industry-header"><a href={localeRoot(locale)} className="logo-link"><BrandMark /></a><nav aria-label="Main navigation"><a href={`${localeRoot(locale)}#why`}>{shared.navPlatform}</a><a href={`${localeRoot(locale)}#industries`}>{shared.navIndustries}</a><a href="#process">{shared.navProcess}</a></nav><div className="header-actions"><IndustryLanguageNav locale={locale} industry={industry} /><WhatsAppLink locale={locale} label={shared.navCta} industry={content.tag} className="button button--small" /></div></header>

    <section className="industry-hero" id="content"><div className="industry-hero-copy"><a className="industry-back" href={`${localeRoot(locale)}#industries`}>← {shared.navIndustries}</a><p className="eyebrow">{content.tag}</p><h1>{content.title}<span>{content.accent}</span></h1><p className="industry-hero-body">{content.body}</p><div className="hero-actions"><WhatsAppLink locale={locale} label={content.primaryCta} industry={content.tag} /><a className="text-link" href="#product">{shared.productEyebrow}<span aria-hidden="true">↓</span></a></div><div className="proof-row">{shared.proof.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div></div><div className="industry-hero-visual"><div className="vertical-orbit" /><IndustryMockup content={content} /><div className="vertical-note vertical-note--one"><span>✓</span><p><b>{content.mockup.items[0].label}</b><small>{content.mockup.items[0].meta}</small></p></div><div className="vertical-note vertical-note--two"><span>↗</span><p><b>{content.mockup.action}</b><small>{content.tag}</small></p></div></div></section>

    <section className="industry-problem"><div className="industry-problem-copy"><p className="eyebrow">{shared.problemEyebrow}</p><h2>{content.problemTitle}</h2><p>{content.problemBody}</p></div><div className="outcome-grid">{content.outcomes.map((outcome) => <article key={outcome.title}><span>{outcome.icon}</span><h3>{outcome.title}</h3><p>{outcome.body}</p></article>)}</div></section>

    <section className="industry-product" id="product"><div className="industry-product-copy"><p className="eyebrow">{shared.productEyebrow}</p><h2>{content.productTitle}</h2><p>{content.productBody}</p><ul>{content.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul><WhatsAppLink locale={locale} label={content.primaryCta} industry={content.tag} className="button button--light" /></div><div className="industry-product-visual"><IndustryMockup content={content} /></div></section>

    {industry === "golf" ? <section className="golf-automation"><div><p className="eyebrow">{golfAutomationCopy[locale].eyebrow}</p><h2>{golfAutomationCopy[locale].title}</h2><p>{golfAutomationCopy[locale].body}</p></div><ul>{golfAutomationCopy[locale].items.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section> : null}

    <ProductCapabilities locale={locale} />

    <section className="process industry-process" id="process"><div className="process-heading"><p className="eyebrow">{shared.processEyebrow}</p><h2>{shared.processTitle}</h2></div><div className="process-grid process-grid--three">{shared.process.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div className="process-line"><i /></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>

    <section className="other-industries"><div className="section-intro"><p className="eyebrow">{shared.otherEyebrow}</p><h2>{shared.otherTitle}</h2></div><div className="other-industry-grid">{otherIndustries.map((item) => { const other = industryCopy[locale][item]; return <a href={localeIndustryPath(locale, item)} key={item}><span>{other.tag}</span><b>{other.title}</b><small>{shared.otherLink} →</small></a>; })}</div></section>

    <section className="final-cta industry-final"><p className="eyebrow">{shared.finalEyebrow}</p><h2>{content.finalTitle}</h2><p>{content.finalBody}</p><WhatsAppLink locale={locale} label={shared.finalCta} industry={content.tag} /><a className="final-email" href="mailto:hello@timzy.app">{shared.finalAlt}</a></section>

    <footer><div className="footer-brand"><BrandMark /><p>{shared.footer}</p></div><div className="footer-contact"><a href="mailto:hello@timzy.app">hello@timzy.app</a><a href="tel:+34600659705">+34 600 659 705</a><a href="tel:+48507702007">+48 507 702 007</a></div><div className="footer-links"><a href="https://timzy.app/privacy-policy/">Privacy Policy</a><a href="https://timzy.app/terms-conditions/">Terms</a><a href="https://timzy.app/faq/">FAQ</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Timzy</span><IndustryLanguageNav locale={locale} industry={industry} /><a href="#top">{shared.backTop}</a></div></footer>
  </main>;
}
