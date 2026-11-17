/* Portfolio content — single source of truth. Only real, verified information lives here. */
window.REA = window.REA || {};
REA.config = {
  name: 'Rea Amparo',
  github: 'https://github.com/msreaamparo-wq',
  githubProfileUrl: 'https://github.com/msreaamparo-wq',
  githubUser: 'msreaamparo-wq',
  email: '',
  fallbackRepoCount: 6
};

REA.projects = [
  {
    id: 'trace', index: '01', title: 'TRACE', status: 'Prototype', statusKind: 'Status',
    short: 'Attendance, recorded properly.',
    desc: 'Tracking and recording attendance system with event management, QR-based attendance, role-based access, and location verification.',
    tech: ['Flutter', 'Dart', 'Firebase', 'Firebase Authentication', 'Cloud Firestore', 'Firebase Storage', 'Provider', 'Hive', 'mobile_scanner', 'qr_flutter', 'Geolocator', 'PDF', 'Excel'],
    repo: 'https://github.com/msreaamparo-wq/TRACE-SSG-Attendance-System', repoLabel: 'View source',
    demo: null, accent: '#d89b3c',
    problem: 'Tracking and recording attendance at events.',
    purpose: 'A single system where events are managed, attendance is captured by QR code, access depends on role, and location is verified.',
    build: ['Event management', 'QR-based attendance', 'Role-based access', 'Location verification'],
    current: 'Prototype. It is not presented as a finished product.',
    shots: []
  },
  {
    id: 'cacao', index: '02', title: 'Cacao Vision', status: 'In Progress', statusKind: 'Status',
    short: 'Reading disease in cacao pods.',
    desc: 'Computer vision research focused on classifying Black Pod Rot severity in cacao pods using CNNs and Bayesian hyperparameter optimization.',
    tech: ['Python', 'Flutter', 'Dart', 'TensorFlow Lite', 'Roboflow'],
    repo: 'https://github.com/msreaamparo-wq/cacao_severity_app', repoLabel: 'View app source',
    demo: null, accent: '#c4452d',
    problem: 'Classifying the severity of Black Pod Rot in cacao pods.',
    purpose: 'Research into whether convolutional neural networks, tuned with Bayesian hyperparameter optimization, can classify severity from images.',
    build: ['CNN-based image classification research', 'Bayesian hyperparameter optimization research', 'Flutter mobile app', 'TensorFlow Lite integration in progress'],
    current: 'In progress. The research and model are not complete, and no results are claimed on this site.',
    shots: []
  },
  {
    id: 'gnlr', index: '03', title: 'Gender-Neutral Language Recognizer', status: 'Language tool', statusKind: 'Type',
    short: 'Words, reconsidered.',
    desc: 'A Flask application that identifies gender-specific language and suggests more inclusive alternatives.',
    tech: ['Python', 'Flask', 'HTML', 'CSS', 'Finite State Automata', 'python-docx', 'pypdf', 'pytest'],
    repo: 'https://github.com/msreaamparo-wq/Gender-Neutral-Language-Recognizer', repoLabel: 'View source',
    demo: null, accent: '#ece4d4',
    problem: 'Gender-specific wording in text.',
    purpose: 'Identify that wording and suggest more inclusive alternatives.',
    build: ['Flask web application', 'Whole-word matching of gender-specific terms', 'Suggested inclusive alternatives', 'HTML and CSS front end'],
    current: 'See the repository for the current state.',
    shots: []
  },
  {
    id: 'archive', index: '04', title: 'Our Little Archive', status: 'Side project', statusKind: 'Type',
    short: 'A shared memory journal.',
    desc: 'A shared memory journal for photos, dates, notes, and meaningful places.',
    tech: ['Flutter', 'Dart', 'Supabase', 'flutter_map', 'OpenStreetMap', 'Geolocator', 'latlong2'],
    repo: 'https://github.com/msreaamparo-wq/it-s-a-love-story-baby', repoLabel: 'View source',
    demo: null, accent: '#b9a98c',
    problem: 'Keeping shared memories in one place.',
    purpose: 'A journal for photos, dates, notes, and the places that mean something.',
    build: ['Photos, dates and notes', 'Meaningful places on a map (OpenStreetMap)', 'Flutter app with a Supabase backend'],
    current: 'See the repository for the current state.',
    shots: []
  },
  {
    id: 'void', index: '05', title: 'Void Experience', status: 'Experiment', statusKind: 'Type',
    short: 'A hacked screen that isn’t.',
    desc: 'A browser-only simulated hacked-screen visual experiment. It does not access devices or user data.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    repo: 'https://github.com/msreaamparo-wq/void-experience', repoLabel: 'View source',
    demo: null, accent: '#c4452d',
    problem: 'A visual experiment in theatrical, terminal-style interfaces.',
    purpose: 'A purely simulated effect, made for visuals. It runs only in the browser and never touches a device or user data.',
    build: ['Browser-only, no data access', 'Simulated system interface', 'HTML, CSS and JavaScript'],
    current: 'See the repository for the current state.',
    shots: []
  }
];

/* Non-project screens on the wall */
REA.extraScreens = [
  { id: 'identity', title: 'Developer identity', kind: 'identity' },
  { id: 'code', title: 'Code experiments', kind: 'code' }
];

/* Technologies checked against project source files and dependency manifests. */
REA.toolkit = [
  {
    name: 'Programming languages',
    items: ['Python', 'Dart', 'JavaScript', 'HTML5', 'CSS3', 'SQL']
  },
  {
    name: 'Web and interface development',
    items: ['Flask', 'React', 'React DOM', 'Vite', 'Tailwind CSS', 'Three.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'Lucide React', 'PostCSS', 'Autoprefixer']
  },
  {
    name: 'Flutter and mobile packages',
    items: ['Flutter', 'Provider', 'Hive', 'Firebase Authentication', 'Cloud Firestore', 'Firebase Storage', 'Supabase Flutter', 'mobile_scanner', 'qr_flutter', 'Geolocator', 'image_picker', 'tflite_flutter', 'image', 'flutter_map', 'latlong2', 'fl_chart', 'pdf', 'printing', 'excel', 'file_picker', 'path_provider', 'http', 'share_plus', 'intl', 'flutter_svg', 'uuid', 'internet_connection_checker_plus']
  },
  {
    name: 'Backend, databases and research tools',
    items: ['Firebase', 'Supabase', 'Supabase JS', 'SQL', 'OpenStreetMap', 'Roboflow', 'python-docx', 'pypdf', 'pytest', 'ReportLab', 'Gunicorn']
  },
  {
    name: 'Developer tools and deployment',
    items: ['Git', 'GitHub', 'VS Code', 'Android Studio', 'Figma', 'npm', 'GitHub Pages', 'Render', 'Vercel']
  }
];
