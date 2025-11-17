import { AgeGroup, LearningPath, Badge, Module, Lesson, QuizQuestion } from './types';

export const AVATAR_OPTIONS = {
  face: ['🧑‍🚀', '🧑‍🎨', '🧑‍💻', '🧑‍🎤', '🧑‍🔬', '🧑‍✈️', '🕵️‍♀️', '👩‍🚒', '👩‍🚀', '👨‍🚀'],
  headwear: { none: { emoji: '', isPremium: false }, hat: { emoji: '🎓', isPremium: false }, headphones: { emoji: '🎧', isPremium: false }, crown: { emoji: '👑', isPremium: true } },
  eyewear: { none: { emoji: '', isPremium: false }, glasses: { emoji: '👓', isPremium: false }, sunglasses: { emoji: '😎', isPremium: false }, monocle: { emoji: '🧐', isPremium: true } },
  clothing: { none: { emoji: '', isPremium: false }, tshirt: { emoji: '👕', isPremium: false }, jacket: { emoji: '🧥', isPremium: false }, suit: { emoji: '👔', isPremium: false } },
  backgroundColor: ['bg-sky-200', 'bg-green-200', 'bg-amber-200', 'bg-rose-200', 'bg-indigo-200', 'bg-slate-200'],
};

export const BADGES: { [key: string]: Badge } = {
  first_step: { name: 'Primer Paso', description: 'Completaste tu primera lección.', emoji: '👣' },
  curious_mind: { name: 'Mente Curiosa', description: 'Completaste 5 lecciones.', emoji: '🧠' },
  module_master: { name: 'Maestro de Módulo', description: 'Completaste todos las lecciones de un módulo.', emoji: '🏅' },
  xp_champion: { name: 'Campeón de XP', description: 'Alcanzaste 1000 XP.', emoji: '🌟' },
};

const LEARNING_PATHS: { [key in AgeGroup]: LearningPath } = {
  [AgeGroup.KID]: {
    ageGroup: AgeGroup.KID,
    modules: [
      { 
        id: 'kid-m1', 
        title: 'Tu Identidad Secreta', 
        description: 'Aprende a proteger tu nombre e información personal en línea.', 
        icon: 'UserCircleIcon', 
        color: 'bg-sky-500', 
        lessons: [
            { id: 'kid-l1-1', title: '¿Qué es un apodo seguro?', type: 'game', xp: 20, content: { type: 'nickname-generator', description: 'Aprende a crear un apodo que no revele tu información personal.' } },
            { id: 'kid-l1-2', title: 'Prueba: Información Privada', type: 'quiz', xp: 30, content: [{ question: '¿Cuál de estos datos es seguro compartir en un juego en línea?', options: ['Mi nombre completo', 'Mi apodo del juego', 'Mi dirección'], correctAnswer: 1, explanation: 'Tu apodo del juego está diseñado para ser seguro y no revelar quién eres.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l1-3', title: 'Clics con Cuidado', type: 'game', xp: 20, content: { type: 'safe-clicking', description: 'Descubre qué enlaces son seguros para hacer clic y cuáles es mejor evitar.' } },
            { id: 'kid-l1-4', title: 'Caso: El Perfil Público', type: 'practice-case', xp: 25, content: { scenario: 'Ves el perfil de un amigo que muestra su número de teléfono.', questions: [{ question: '¿Qué deberías hacer?', options: ['Llamarlo para probar', 'Decirle que es peligroso', 'No hacer nada'], correctOption: 'Decirle que es peligroso', explanation: 'Ayudar a tus amigos a estar seguros es muy importante.' }] } },
            { id: 'kid-l1-5', title: 'Memorama Digital', type: 'game', xp: 20, content: { type: 'digital-memory', description: 'Encuentra los pares de símbolos de seguridad.' } },
            { id: 'kid-l1-6', title: 'Prueba: ¿Qué comparto?', type: 'quiz', xp: 30, content: [{ question: '¿Es una buena idea compartir una foto de tu uniforme escolar?', options: ['Sí, es bonito', 'No, dice dónde estudio', 'Depende'], correctAnswer: 1, explanation: 'El uniforme puede decirle a extraños a qué colegio vas, así que es mejor no compartirlo.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l1-7', title: 'Reacción Emoji', type: 'game', xp: 20, content: { type: 'emoji-reaction', description: 'Aprende a reaccionar de forma amable a las publicaciones de tus amigos.' } },
            { id: 'kid-l1-8', title: 'Caso: El Formulario Misterioso', type: 'practice-case', xp: 25, content: { scenario: 'Un juego te pide tu correo electrónico para darte un premio.', questions: [{ question: '¿Qué haces?', options: ['Lo escribo rápido', 'Le pregunto a mis padres', 'Invento uno'], correctOption: 'Le pregunto a mis padres', explanation: 'Nunca des tus datos sin el permiso de un adulto.' }] } },
            { id: 'kid-l1-9', title: 'Prueba: Amigos vs. Extraños', type: 'quiz', xp: 30, content: [{ question: 'Un extraño en un juego te pide ser tu amigo. ¿Qué es lo más seguro?', options: ['Aceptar', 'Ignorarlo o decirle a un adulto', 'Darle mi apodo'], correctAnswer: 1, explanation: 'No sabemos quién está detrás de la pantalla, así que lo más seguro es no interactuar con extraños.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l1-10', title: 'Misión: Crea tu avatar', type: 'mission', xp: 10, content: { description: 'Ve a tu perfil y personaliza tu avatar para que sea único y seguro.' } },
        ] 
      },
      { 
        id: 'kid-m2', 
        title: 'Contraseñas de Superhéroe', 
        description: 'Descubre cómo crear y cuidar tus contraseñas secretas.', 
        icon: 'KeyIcon', 
        color: 'bg-amber-500', 
        lessons: [
            { id: 'kid-l2-1', title: '¿Qué es una contraseña?', type: 'quiz', xp: 30, content: [{ question: 'Una contraseña es como...', options: ['Un saludo', 'Una llave secreta', 'Un chiste'], correctAnswer: 1, explanation: '¡Exacto! Es una llave secreta que solo tú debes conocer para proteger tus cuentas.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l2-2', title: 'Crea una Contraseña Fuerte', type: 'game', xp: 25, content: { type: 'password-strength', description: 'Practica creando contraseñas difíciles de adivinar.' } },
            { id: 'kid-l2-3', title: 'Caso: El amigo curioso', type: 'practice-case', xp: 25, content: { scenario: 'Tu mejor amigo te pide la contraseña de tu juego para pasarte un nivel.', questions: [{ question: '¿Qué haces?', options: ['Se la doy, es mi amigo', 'Le digo que no puedo compartirla', 'Le doy una falsa'], correctOption: 'Le digo que no puedo compartirla', explanation: 'Las contraseñas son personales y nunca se comparten, ¡ni con los mejores amigos!' }] } },
            { id: 'kid-l2-4', title: 'Prueba: ¿Dónde guardo mi clave?', type: 'quiz', xp: 30, content: [{ question: '¿Cuál es el mejor lugar para guardar tu contraseña?', options: ['En mi memoria', 'En un papel pegado a la pantalla', 'Decírsela a todos mis amigos'], correctAnswer: 0, explanation: 'El lugar más seguro es tu memoria. Si necesitas anotarla, guárdala en un lugar secreto que solo tú y tus padres conozcan.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l2-5', title: 'Juego: Elige la más fuerte', type: 'game', xp: 20, content: { type: 'password-strength', description: 'Compara dos contraseñas y elige cuál es más segura.' } },
            { id: 'kid-l2-6', title: 'Caso: La misma clave para todo', type: 'practice-case', xp: 25, content: { scenario: 'Usas la misma contraseña para tu correo, tus juegos y tus redes sociales.', questions: [{ question: '¿Es una buena idea?', options: ['Sí, es más fácil de recordar', 'No, si descubren una, las tienen todas', 'No sé'], correctOption: 'No, si descubren una, las tienen todas', explanation: 'Usar contraseñas diferentes para cada sitio es mucho más seguro.' }] } },
            { id: 'kid-l2-7', title: 'Prueba: Mezcla de caracteres', type: 'quiz', xp: 30, content: [{ question: '¿Qué hace a una contraseña más fuerte?', options: ['Que sea corta', 'Que sea el nombre de mi mascota', 'Que mezcle letras, números y símbolos'], correctAnswer: 2, explanation: 'Mezclar mayúsculas, minúsculas, números y símbolos (!@#) hace que sea muy difícil de adivinar.', difficulty: 1 }] as QuizQuestion[] },
            { id: 'kid-l2-8', title: 'Misión: Cambia una contraseña', type: 'mission', xp: 15, content: { description: 'Con la ayuda de tus padres, cambia la contraseña de una de tus cuentas por una más fuerte.' } },
            { id: 'kid-l2-9', title: 'Juego: Adivina la contraseña', type: 'game', xp: 20, content: { type: 'password-strength', description: 'Mira pistas y adivina qué tipo de contraseña es fácil de romper.' } },
            { id: 'kid-l2-10', title: 'Prueba Final de Contraseñas', type: 'quiz', xp: 50, content: [{ question: '¿Cada cuánto es bueno cambiar tus contraseñas?', options: ['Nunca', 'Cada pocos meses', 'Todos los días'], correctAnswer: 1, explanation: 'Cambiar tus contraseñas importantes cada cierto tiempo ayuda a mantener tus cuentas seguras.', difficulty: 1 }] as QuizQuestion[] },
        ] 
      },
      {
        id: 'kid-m4', // New Free Module
        title: 'Juegos y Diversión Segura',
        description: 'Aprende a jugar en línea de forma segura y divertida.',
        icon: 'ShieldCheckIcon',
        color: 'bg-green-500',
        lessons: [
            { id: 'kid-l4-1', title: 'Prueba: Reglas del Juego Online', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l4-2', title: 'Caso: Un jugador tramposo', type: 'practice-case', xp: 25, content: { scenario: 'Ves a otro jugador usando trampas para ganar.', questions: [{ question: '¿Qué es lo correcto?', options: ['Hacer trampa también', 'Reportarlo', 'Insultarlo'], correctOption: 'Reportarlo', explanation: 'Reportar a los tramposos ayuda a que el juego sea justo para todos.' }] } },
            { id: 'kid-l4-3', title: 'Juego: Elige tu Nickname', type: 'game', xp: 20, content: { type: 'nickname-generator', description: 'Crea un apodo genial que no revele quién eres.' } },
            { id: 'kid-l4-4', title: 'Prueba: Tiempo de Pantalla', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l4-5', title: 'Misión: Crea tus reglas', type: 'mission', xp: 15, content: { description: 'Habla con tus padres y establezcan juntos un horario para jugar.' } },
            { id: 'kid-l4-6', title: 'Caso: Compras dentro del juego', type: 'practice-case', xp: 25, content: { scenario: 'Un juego te ofrece comprar una skin increíble con dinero real.', questions: [{ question: '¿Qué haces?', options: ['Comprarla de inmediato', 'Pedirle permiso a mis padres', 'Usar la tarjeta de mis padres sin decirles'], correctOption: 'Pedirle permiso a mis padres', explanation: 'Todas las compras online deben ser aprobadas por un adulto.' }] } },
            { id: 'kid-l4-7', title: 'Prueba: Chats de Juegos', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l4-8', title: 'Juego: Emociones en el chat', type: 'game', xp: 20, content: { type: 'emoji-reaction', description: 'Practica cómo comunicarte de forma positiva en el chat del juego.' } },
            { id: 'kid-l4-9', title: 'Caso: Un extraño te habla', type: 'practice-case', xp: 25, content: { scenario: 'Alguien que no conoces te envía un mensaje privado en el juego y te pide tu edad.', questions: [{ question: '¿Qué haces?', options: ['Le digo mi edad', 'Le miento', 'No respondo y se lo digo a mis padres'], correctOption: 'No respondo y se lo digo a mis padres', explanation: 'Nunca compartas información personal con extraños y siempre avisa a un adulto.' }] } },
            { id: 'kid-l4-10', title: 'Prueba Final de Juegos Seguros', type: 'quiz', xp: 50, content: [] },
        ]
      },
      { 
        id: 'kid-m3', 
        title: 'Navegando con Amigos', 
        description: 'Aprende a interactuar con otros de forma segura y amable.', 
        icon: 'ShieldCheckIcon', 
        color: 'bg-emerald-500',
        isPremium: true,
        lessons: [
            { id: 'kid-l3-1', title: 'Prueba: ¿Qué es ser un buen amigo digital?', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l3-2', title: 'Caso: Un chiste pesado', type: 'practice-case', xp: 25, content: { scenario: 'Un amigo hace un meme de otro compañero y todos se ríen, pero a él no le gusta.', questions: [{ question: '¿Qué haces?', options: ['Me río también', 'Le digo a mi amigo que lo borre', 'Comparto el meme'], correctOption: 'Le digo a mi amigo que lo borre', explanation: 'Un buen amigo digital defiende a los demás y no participa en burlas.' }] } },
            { id: 'kid-l3-3', title: 'Juego: Carrera de Amabilidad', type: 'game', xp: 20, content: { type: 'emoji-reaction', description: 'Responde a diferentes situaciones con la reacción más amable posible.' } },
            { id: 'kid-l3-4', title: 'Prueba: Cadenas y Rumores', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l3-5', title: 'Caso: Mensaje en cadena', type: 'practice-case', xp: 25, content: { scenario: 'Recibes un mensaje que dice "compártelo a 10 amigos o tendrás mala suerte".', questions: [{ question: '¿Qué haces?', options: ['Lo comparto por si acaso', 'Lo borro, es solo un rumor', 'Se lo envío a 20 amigos'], correctOption: 'Lo borro, es solo un rumor', explanation: 'Las cadenas de mensajes suelen ser falsas y solo molestan a los demás. ¡Rómpela!' }] } },
            { id: 'kid-l3-6', title: 'Misión: Mensaje Positivo', type: 'mission', xp: 15, content: { description: 'Envía un mensaje amable o un emoji positivo a un amigo o familiar.' } },
            { id: 'kid-l3-7', title: 'Prueba: Pedir Ayuda', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l3-8', title: 'Juego: ¿A quién le cuento?', type: 'game', xp: 20, content: { type: 'safe-clicking', description: 'Te pasan cosas en línea. Elige a qué adulto de confianza le pedirías ayuda en cada caso.' } },
            { id: 'kid-l3-9', title: 'Caso: Viste algo feo', type: 'practice-case', xp: 25, content: { scenario: 'Navegando en internet, ves una imagen o video que te asusta o te hace sentir mal.', questions: [{ question: '¿Qué es lo primero que debes hacer?', options: ['Cerrar los ojos', 'Apagar el computador y contárselo a tus padres', 'Volver a verlo'], correctOption: 'Apagar el computador y contárselo a tus padres', explanation: 'Si algo te incomoda, la mejor reacción es alejarte y pedir ayuda a un adulto.' }] } },
            { id: 'kid-l3-10', title: 'Prueba Final de Convivencia Digital', type: 'quiz', xp: 50, content: [] },
        ]
      },
      {
        id: 'kid-m5', // New Premium Module
        title: 'Detectives de Internet',
        description: 'Conviértete en un experto en encontrar información y saber si es real.',
        icon: 'KeyIcon',
        color: 'bg-purple-500',
        isPremium: true,
        lessons: [
            { id: 'kid-l5-1', title: 'Prueba: ¿Qué es un buscador?', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l5-2', title: 'Juego: Búsqueda del Tesoro', type: 'game', xp: 20, content: { type: 'safe-clicking', description: 'Te damos pistas y debes encontrar la respuesta correcta en una página de búsqueda simulada.' } },
            { id: 'kid-l5-3', title: 'Caso: ¿Es verdad o mentira?', type: 'practice-case', xp: 25, content: { scenario: 'Un video dice que los perros pueden hablar.', questions: [{ question: '¿Qué haces?', options: ['Me lo creo', 'Busco en otros sitios si es verdad', 'Se lo cuento a todos'], correctOption: 'Busco en otros sitios si es verdad', explanation: 'No todo lo que vemos en internet es real. Siempre es bueno verificar.' }] } },
            { id: 'kid-l5-4', title: 'Prueba: Anuncios vs. Contenido', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l5-5', title: 'Juego: Identifica el Anuncio', type: 'game', xp: 20, content: { type: 'safe-clicking', description: 'En una página de juegos, haz clic solo en los botones del juego y no en la publicidad.' } },
            { id: 'kid-l5-6', title: 'Caso: Videos divertidos', type: 'practice-case', xp: 25, content: { scenario: 'Estás viendo videos y el siguiente que se reproduce automáticamente no es para niños.', questions: [{ question: '¿Qué haces?', options: ['Lo sigo viendo', 'Aviso a mis padres de inmediato', 'Lo pongo de nuevo'], correctOption: 'Aviso a mis padres de inmediato', explanation: 'Los adultos pueden configurar filtros para que solo veas contenido apropiado para ti.' }] } },
            { id: 'kid-l5-7', title: 'Prueba: ¿De quién es la página?', type: 'quiz', xp: 30, content: [] },
            { id: 'kid-l5-8', title: 'Misión: Investiga tu animal favorito', type: 'mission', xp: 15, content: { description: 'Con ayuda de un adulto, usa un buscador para encontrar 3 datos curiosos de tu animal favorito.' } },
            { id: 'kid-l5-9', title: 'Juego: Camino de la Información', type: 'game', xp: 20, content: { type: 'safe-clicking', description: 'Sigue los enlaces correctos para llegar de una pregunta a la respuesta.' } },
            { id: 'kid-l5-10', title: 'Prueba Final de Investigación', type: 'quiz', xp: 50, content: [] },
        ]
      }
    ],
  },
  [AgeGroup.TWEEN]: {
    ageGroup: AgeGroup.TWEEN,
    modules: [
        { 
            id: 'tween-m1', 
            title: 'Tu Huella Digital', 
            description: 'Entiende qué información dejas en internet y cómo gestionarla.', 
            icon: 'UserCircleIcon', 
            color: 'bg-sky-500', 
            lessons: [
                { id: 'tween-l1-1', title: 'Detectives de Datos', type: 'game', xp: 30, content: { type: 'data-detective', description: 'Investiga perfiles y descubre qué información es privada.' } },
                { id: 'tween-l1-2', title: 'El Simulador de Publicaciones', type: 'game', xp: 30, content: { type: 'post-simulator', description: 'Decide qué es seguro compartir y qué no en esta simulación de red social.' } },
                { id: 'tween-l1-3', title: 'Prueba: ¿Qué es la huella digital?', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l1-4', title: 'Caso: La foto vergonzosa', type: 'practice-case', xp: 30, content: { scenario: 'Un amigo te etiqueta en una foto donde sales mal. La foto es pública.', questions: [{ question: '¿Qué es lo mejor que puedes hacer?', options: ['Ignorarla', 'Pedirle por privado que te desetiquete o la borre', 'Comentar algo feo en su perfil'], correctOption: 'Pedirle por privado que te desetiquete o la borre', explanation: 'Hablar en privado es la mejor forma de resolver problemas y cuidar tu huella digital.' }] } },
                { id: 'tween-l1-5', title: 'Misión: Revisa tu perfil', type: 'mission', xp: 20, content: { description: 'Revisa la configuración de privacidad de una de tus redes sociales. ¿Tu perfil es público o privado?' } },
                { id: 'tween-l1-6', title: 'Juego: Elige tu privacidad', type: 'game', xp: 30, content: { type: 'post-simulator', description: 'Para cada tipo de publicación, decide si la compartirías de forma pública, con amigos o solo para ti.' } },
                { id: 'tween-l1-7', title: 'Prueba: Geolocalización', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l1-8', title: 'Caso: Check-in en el cine', type: 'practice-case', xp: 30, content: { scenario: 'Vas al cine con tus amigos y quieres publicar una foto haciendo "check-in" en el lugar.', questions: [{ question: '¿Cuál es el riesgo?', options: ['Ninguno', 'La gente sabrá que no estoy en casa', 'Mis amigos se pondrán celosos'], correctOption: 'La gente sabrá que no estoy en casa', explanation: 'Compartir tu ubicación en tiempo real puede ser peligroso. Es mejor publicar las fotos después.' }] } },
                { id: 'tween-l1-9', title: 'Juego: Borrado Permanente', type: 'game', xp: 30, content: { type: 'data-detective', description: 'Intenta borrar información de internet y descubre por qué es tan difícil.' } },
                { id: 'tween-l1-10', title: 'Prueba Final de Huella Digital', type: 'quiz', xp: 50, content: [] },
            ] 
        },
        {
            id: 'tween-m3', // New Free Module
            title: 'Redes Sociales Inteligentes',
            description: 'Aprende a usar las redes sociales de forma positiva y segura.',
            icon: 'UserCircleIcon',
            color: 'bg-rose-500',
            lessons: [
                { id: 'tween-l3-1', title: 'Prueba: ¿Para qué son las redes?', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l3-2', title: 'Juego: Elige la red social', type: 'game', xp: 30, content: { type: 'post-simulator', description: 'Te damos un tipo de contenido y debes elegir la red social más apropiada para publicarlo.' } },
                { id: 'tween-l3-3', title: 'Caso: Un desconocido te sigue', type: 'practice-case', xp: 30, content: { scenario: 'Un perfil sin foto y con 0 seguidores empieza a seguirte.', questions: [{ question: '¿Qué haces?', options: ['Lo sigo de vuelta', 'Lo bloqueo', 'Le pregunto quién es'], correctOption: 'Lo bloqueo', explanation: 'Bloquear perfiles sospechosos es la forma más rápida y segura de protegerte.' }] } },
                { id: 'tween-l3-4', title: 'Prueba: Netiqueta', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l3-5', title: 'Juego: Elige el comentario', type: 'game', xp: 30, content: { type: 'emoji-reaction', description: 'Lee una publicación y elige el comentario más respetuoso y constructivo.' } },
                { id: 'tween-l3-6', title: 'Misión: Sigue una cuenta positiva', type: 'mission', xp: 20, content: { description: 'Busca y sigue una cuenta que comparta contenido educativo o inspirador (ciencia, arte, deportes).' } },
                { id: 'tween-l3-7', title: 'Prueba: Retos Virales', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l3-8', title: 'Caso: El reto peligroso', type: 'practice-case', xp: 30, content: { scenario: 'Ves un reto viral que parece divertido pero un poco peligroso.', questions: [{ question: '¿Qué deberías hacer?', options: ['Hacerlo para ganar seguidores', 'Pensar en los riesgos y decidir no hacerlo', 'Hacerlo, pero con cuidado'], correctOption: 'Pensar en los riesgos y decidir no hacerlo', explanation: 'Tu seguridad es más importante que cualquier tendencia. Nunca hagas retos que puedan ponerte en peligro.' }] } },
                { id: 'tween-l3-9', title: 'Juego: ¿Influencer o amigo?', type: 'game', xp: 30, content: { type: 'data-detective', description: 'Analiza diferentes perfiles y decide si son una persona real o una marca/influencer.' } },
                { id: 'tween-l3-10', title: 'Prueba Final de Redes Sociales', type: 'quiz', xp: 50, content: [] },
            ]
        },
        { 
            id: 'tween-m2', 
            title: 'Comunidades Positivas', 
            description: 'Aprende a ser un buen ciudadano digital y a combatir el ciberacoso.', 
            icon: 'ShieldCheckIcon', 
            color: 'bg-emerald-500', 
            isPremium: true,
            lessons: [
                { id: 'tween-l2-1', title: 'Prueba: ¿Qué es el Ciberacoso?', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l2-2', title: 'Aliado Digital', type: 'game', xp: 35, content: { type: 'digital-ally', description: 'Practica cómo reaccionar y ayudar si ves ciberacoso.' } },
                { id: 'tween-l2-3', title: 'Caso: La foto editada', type: 'practice-case', xp: 30, content: { scenario: 'Alguien edita una foto tuya para burlarse y la comparte en un grupo.', questions: [{ question: '¿Qué es lo primero que debes hacer?', options: ['Responder con un insulto', 'Guardar pruebas (pantallazo) y contárselo a un adulto', 'No hacer nada para no empeorarlo'], correctOption: 'Guardar pruebas (pantallazo) y contárselo a un adulto', explanation: 'Guardar evidencia es importante, pero pedir ayuda a un adulto de confianza es el paso más crucial.' }] } },
                { id: 'tween-l2-4', title: 'Misión: Reportar un comentario', type: 'mission', xp: 20, content: { description: 'Aprende dónde está el botón de "reportar" en tu red social favorita y para qué sirve.' } },
                { id: 'tween-l2-5', title: 'Prueba: ¿Broma o acoso?', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l2-6', title: 'Juego: El Termómetro de la Empatía', type: 'game', xp: 30, content: { type: 'emoji-reaction', description: 'Lee diferentes mensajes y evalúa cómo podrían hacer sentir a la otra persona.' } },
                { id: 'tween-l2-7', title: 'Caso: Me excluyeron del grupo', type: 'practice-case', xp: 30, content: { scenario: 'Tus amigos crean un nuevo grupo de chat y no te incluyen a propósito.', questions: [{ question: '¿Es esto una forma de ciberacoso?', options: ['No, solo son pesados', 'Sí, la exclusión intencional es una forma de acoso', 'Solo si escriben cosas malas de mí'], correctOption: 'Sí, la exclusión intencional es una forma de acoso', explanation: 'El ciberacoso no es solo insultar, también es excluir o ignorar a alguien a propósito para hacerlo sentir mal.' }] } },
                { id: 'tween-l2-8', title: 'Prueba: ¿A quién acudir?', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l2-9', title: 'Misión: Define tus límites', type: 'mission', xp: 20, content: { description: 'Piensa y escribe 3 reglas personales sobre cómo te gusta que te traten en línea.' } },
                { id: 'tween-l2-10', title: 'Prueba Final de Ciudadanía Digital', type: 'quiz', xp: 50, content: [] },
            ] 
        },
        {
            id: 'tween-m4', // New Premium Module
            title: 'Ciberseguridad Avanzada',
            description: 'Protege tus dispositivos y cuentas como un profesional.',
            icon: 'KeyIcon',
            color: 'bg-indigo-500',
            isPremium: true,
            lessons: [
                { id: 'tween-l4-1', title: 'Prueba: Tipos de Malware', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l4-2', title: 'Juego: Elige el Antivirus', type: 'game', xp: 30, content: { type: 'safe-clicking', description: 'Te mostramos varias opciones de software. Elige el que parece un antivirus legítimo.' } },
                { id: 'tween-l4-3', title: 'Caso: Un pendrive encontrado', type: 'practice-case', xp: 30, content: { scenario: 'Encuentras un pendrive (USB) botado en el patio del colegio.', questions: [{ question: '¿Qué es lo más seguro?', options: ['Conectarlo a mi computador para ver qué tiene', 'Conectarlo al computador del colegio', 'Entregárselo a un profesor o inspector'], correctOption: 'Entregárselo a un profesor o inspector', explanation: 'Los pendrives encontrados pueden tener virus. Nunca los conectes a un computador.' }] } },
                { id: 'tween-l4-4', title: 'Prueba: Phishing', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l4-5', title: 'Juego: Inspector de Bandeja de Entrada', type: 'game', xp: 40, content: { type: 'inbox-inspector', description: 'Analiza tu correo y marca los que son intentos de phishing.' } },
                { id: 'tween-l4-6', title: 'Misión: Actualiza tus apps', type: 'mission', xp: 20, content: { description: 'Con ayuda de tus padres, revisa si las aplicaciones de tu teléfono o tablet están actualizadas.' } },
                { id: 'tween-l4-7', title: 'Prueba: Redes Wi-Fi Públicas', type: 'quiz', xp: 35, content: [] },
                { id: 'tween-l4-8', title: 'Caso: Wi-Fi del Mall', type: 'practice-case', xp: 30, content: { scenario: 'Estás en el mall conectado al Wi-Fi gratis y necesitas revisar tu cuenta del banco.', questions: [{ question: '¿Es seguro hacerlo?', options: ['Sí, el Wi-Fi es gratis', 'No, las redes públicas no son seguras para información sensible', 'Solo si lo hago rápido'], correctOption: 'No, las redes públicas no son seguras para información sensible', explanation: 'Evita ingresar contraseñas o datos bancarios en redes Wi-Fi públicas. Es mejor usar los datos de tu teléfono.' }] } },
                { id: 'tween-l4-9', title: 'Juego: Defiende tu Computador', type: 'game', xp: 30, content: { type: 'data-detective', description: 'Aparecen pop-ups y alertas. Elige la acción correcta (Cerrar, Analizar, Ignorar) para mantener tu computador seguro.' } },
                { id: 'tween-l4-10', title: 'Prueba Final de Seguridad', type: 'quiz', xp: 50, content: [] },
            ]
        }
    ],
  },
  [AgeGroup.TEEN]: {
    ageGroup: AgeGroup.TEEN,
    modules: [
        { 
            id: 'teen-m1', 
            title: 'Defensa Contra Estafas', 
            description: 'Conviértete en un experto detectando phishing y otros engaños.', 
            icon: 'EnvelopeIcon', 
            color: 'bg-rose-500', 
            lessons: [
                { id: 'teen-l1-1', title: 'Inspector de Bandeja de Entrada', type: 'game', xp: 40, content: { type: 'inbox-inspector', description: 'Aprende a identificar correos de phishing y estafas.' } },
                { id: 'teen-l1-2', title: 'Simulador de Estafas por SMS', type: 'game', xp: 40, content: { type: 'sms-scam-sim', description: 'Recibe mensajes de texto falsos y decide cómo responder de forma segura.' } },
                { id: 'teen-l1-3', title: 'Prueba: Tipos de Phishing', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l1-4', title: 'Caso: La oferta de trabajo falsa', type: 'practice-case', xp: 40, content: { scenario: 'Recibes un correo con una oferta de trabajo increíble que te pide pagar por un "kit de inicio".', questions: [{ question: '¿Qué señal de alerta identificas?', options: ['El sueldo es muy bueno', 'Ningún trabajo legítimo te pide pagar para empezar', 'Piden ser mayor de edad'], correctOption: 'Ningún trabajo legítimo te pide pagar para empezar', explanation: 'Las ofertas de trabajo que te piden dinero por adelantado suelen ser estafas.' }] } },
                { id: 'teen-l1-5', title: 'Juego: ¿URL real o falsa?', type: 'game', xp: 40, content: { type: 'safe-clicking', description: 'Analiza diferentes URLs y decide si llevan a un sitio legítimo o a una copia fraudulenta.' } },
                { id: 'teen-l1-6', title: 'Prueba: Ingeniería Social', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l1-7', title: 'Caso: Soporte técnico falso', type: 'practice-case', xp: 40, content: { scenario: 'Aparece un pop-up que dice "¡Tu PC está infectado! Llama a este número para solucionarlo".', questions: [{ question: '¿Qué es esto?', options: ['Una ayuda útil', 'Una estafa de soporte técnico para acceder a mi PC', 'Un anuncio normal'], correctOption: 'Una estafa de soporte técnico para acceder a mi PC', explanation: 'Los mensajes alarmistas que te apuran a actuar son una táctica común de estafa. Cierra la ventana.' }] } },
                { id: 'teen-l1-8', title: 'Misión: Activa la 2FA', type: 'mission', xp: 25, content: { description: 'Investiga qué es la Autenticación de Dos Factores (2FA) y activa esta opción en una de tus cuentas importantes (con ayuda si es necesario).' } },
                { id: 'teen-l1-9', title: 'Juego: El estafador romántico', type: 'game', xp: 40, content: { type: 'data-detective', description: 'Analiza un perfil y una conversación para detectar las señales de una estafa romántica.' } },
                { id: 'teen-l1-10', title: 'Prueba Final de Estafas', type: 'quiz', xp: 60, content: [] },
            ] 
        },
        {
            id: 'teen-m3', // New Free Module
            title: 'Reputación y Privacidad Online',
            description: 'Aprende a construir una huella digital positiva y a proteger tus datos.',
            icon: 'UserCircleIcon',
            color: 'bg-teal-500',
            lessons: [
                { id: 'teen-l3-1', title: 'Prueba: ¿Qué es la reputación online?', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l3-2', title: 'Juego: Simulador de Reputación', type: 'game', xp: 40, content: { type: 'reputation-sim', description: 'Toma decisiones en redes sociales y ve cómo afectan tu "barra de reputación".' } },
                { id: 'teen-l3-3', title: 'Caso: El comentario polémico', type: 'practice-case', xp: 40, content: { scenario: 'Haces un comentario enojado en una noticia. Años después, alguien lo encuentra.', questions: [{ question: '¿Qué demuestra esto?', options: ['Que tengo derecho a opinar', 'Que lo que publicas en internet puede durar para siempre', 'Que a la gente le gusta discutir'], correctOption: 'Que lo que publicas en internet puede durar para siempre', explanation: 'Piensa dos veces antes de publicar. Tu "yo" del futuro podría verse afectado por lo que tu "yo" del presente escribe.' }] } },
                { id: 'teen-l3-4', title: 'Prueba: Configuración de Privacidad', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l3-5', 'title': 'Misión: Auditoría de Privacidad', 'type': 'mission', 'xp': 25, 'content': { 'description': 'Elige una de tus redes sociales y revisa toda la configuración de privacidad. ¿Hay algo que puedas hacer más seguro?' } },
                { id: 'teen-l3-6', title: 'Juego: ¿Público o Privado?', type: 'game', xp: 40, content: { type: 'post-simulator', description: 'Decide el nivel de privacidad correcto para diferentes tipos de publicaciones.' } },
                { id: 'teen-l3-7', title: 'Prueba: Cookies y Rastreadores', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l3-8', title: 'Caso: Permisos de la App', type: 'practice-case', xp: 40, content: { scenario: 'Una app de linterna te pide permiso para acceder a tus contactos y micrófono.', questions: [{ question: '¿Es normal?', options: ['Sí, las apps piden muchos permisos', 'No, una linterna no necesita acceder a esa información', 'Quizás los necesita para funcionar'], correctOption: 'No, una linterna no necesita acceder a esa información', explanation: 'Sé crítico con los permisos que otorgas. Si no tiene sentido para la función de la app, es una señal de alerta.' }] } },
                { id: 'teen-l3-9', title: 'Juego: El Laberinto de los Términos y Condiciones', type: 'game', xp: 40, content: { type: 'data-detective', description: 'Encuentra las cláusulas más importantes (y abusivas) en un texto de Términos y Condiciones simulado.' } },
                { id: 'teen-l3-10', title: 'Prueba Final de Privacidad', type: 'quiz', xp: 60, content: [] },
            ]
        },
        { 
            id: 'teen-m2', 
            title: 'Pensamiento Crítico Digital', 
            description: 'Aprende a evaluar la información que encuentras en línea.', 
            icon: 'KeyIcon', 
            color: 'bg-indigo-500', 
            isPremium: true,
            lessons: [
                { id: 'teen-l2-1', title: 'Prueba: Hechos vs. Opiniones', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l2-2', title: 'Editor de Noticias', type: 'game', xp: 45, content: { type: 'news-editor', description: 'Analiza titulares y noticias para separar la verdad de la ficción.' } },
                { id: 'teen-l2-3', title: 'Caso: El video "deepfake"', type: 'practice-case', xp: 40, content: { scenario: 'Ves un video muy realista de un político diciendo algo increíblemente polémico.', questions: [{ question: '¿Qué podría ser?', options: ['Una confesión real', 'Un video editado o "deepfake"', 'Una broma'], correctOption: 'Un video editado o "deepfake"', explanation: 'La tecnología permite crear videos falsos muy convincentes. Siempre duda de lo que ves y busca confirmación en fuentes confiables.' }] } },
                { id: 'teen-l2-4', title: 'Prueba: Sesgos Cognitivos', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l2-5', title: 'Juego: La Burbuja de Filtros', type: 'game', xp: 40, content: { type: 'post-simulator', description: 'Tu feed de noticias solo te muestra un tipo de opinión. Toma decisiones para "romper" la burbuja y ver otros puntos de vista.' } },
                { id: 'teen-l2-6', title: 'Misión: Sigue la Fuente', type: 'mission', xp: 25, content: { description: 'Toma una noticia de un portal y busca la fuente original de la información (un estudio científico, una declaración oficial, etc.).' } },
                { id: 'teen-l2-7', title: 'Prueba: ¿Quién está detrás de la info?', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l2-8', title: 'Caso: El estudio "científico"', type: 'practice-case', xp: 40, content: { scenario: 'Una marca de bebidas energéticas publica un "estudio" que dice que su producto mejora la inteligencia.', questions: [{ question: '¿Deberías confiar ciegamente en este estudio?', options: ['Sí, es científico', 'No, podría haber un conflicto de interés', 'Solo si lo dice un influencer'], correctOption: 'No, podría haber un conflicto de interés', explanation: 'Siempre considera quién financia un estudio o una noticia. Podrían tener una agenda oculta.' }] } },
                { id: 'teen-l2-9', title: 'Juego: Verificador de Hechos', type: 'game', xp: 40, content: { type: 'data-detective', description: 'Te damos una afirmación y varias fuentes. Elige las fuentes más confiables para verificar si es verdadera o falsa.' } },
                { id: 'teen-l2-10', title: 'Prueba Final de Pensamiento Crítico', type: 'quiz', xp: 60, content: [] },
            ] 
        },
        {
            id: 'teen-m4', // New Premium Module
            title: 'Hacking Ético 101',
            description: 'Entiende cómo piensan los atacantes para poder defenderte mejor.',
            icon: 'EnvelopeIcon',
            color: 'bg-gray-700',
            isPremium: true,
            lessons: [
                { id: 'teen-l4-1', title: 'Prueba: ¿Qué es el Hacking Ético?', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l4-2', title: 'Juego: Defiende el Castillo', type: 'game', xp: 45, content: { type: 'reputation-sim', description: 'Enfrenta diferentes tipos de ciberataques y elige la defensa correcta para proteger tu "castillo" de datos.' } },
                { id: 'teen-l4-3', title: 'Caso: La red Wi-Fi "gemela"', type: 'practice-case', xp: 40, content: { scenario: 'En un aeropuerto, ves dos redes Wi-Fi: "Aeropuerto_Gratis" y "Aeropuerto_WiFi_Gratis".', questions: [{ question: '¿Qué podría estar pasando?', options: ['Una es más rápida', 'Una podría ser una "red gemela malvada" para robar datos', 'Da lo mismo a cuál me conecte'], correctOption: 'Una podría ser una "red gemela malvada" para robar datos', explanation: 'Los atacantes a menudo crean redes falsas con nombres muy parecidos a las legítimas para engañar a la gente. Ten cuidado.' }] } },
                { id: 'teen-l4-4', title: 'Prueba: Conceptos de Cifrado', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l4-5', title: 'Juego: El Mensajero Secreto', type: 'game', xp: 40, content: { type: 'data-detective', description: 'Usa una clave simple para "cifrar" y "descifrar" mensajes.' } },
                { id: 'teen-l4-6', title: 'Misión: Revisa HTTPS', type: 'mission', xp: 25, content: { description: 'Durante un día, fíjate en el candado (HTTPS) al lado de la dirección en tu navegador. ¿En qué sitios aparece y en cuáles no?' } },
                { id: 'teen-l4-7', title: 'Prueba: ¿Qué es una VPN?', type: 'quiz', xp: 45, content: [] },
                { id: 'teen-l4-8', title: 'Caso: Descarga de Torrents', type: 'practice-case', xp: 40, content: { scenario: 'Un amigo te recomienda descargar una película de un sitio de torrents.', questions: [{ question: 'Además de la piratería, ¿cuál es un riesgo de ciberseguridad?', options: ['Ninguno', 'Los archivos pueden contener malware', 'Mi internet se pondrá lento'], correctOption: 'Los archivos pueden contener malware', explanation: 'Los sitios de descargas ilegales son una de las fuentes más comunes de virus y malware.' }] } },
                { id: 'teen-l4-9', title: 'Juego: Pentesting Básico', type: 'game', xp: 40, content: { type: 'safe-clicking', description: 'En un sistema simulado, busca vulnerabilidades obvias como contraseñas débiles o software sin actualizar.' } },
                { id: 'teen-l4-10', title: 'Prueba Final de Hacker Ético', type: 'quiz', xp: 60, content: [] },
            ]
        }
    ],
  },
};

export const getLearningPathForAgeGroup = (ageGroup?: string) => {
  // Si existe una ruta para el grupo, la devuelve. Si no, usa la de niños como fallback.
  return LEARNING_PATHS[ageGroup as AgeGroup] || LEARNING_PATHS[AgeGroup.KID];
};


