/* Portfolio content — single source of truth. Only real, verified information lives here. */
window.REA = window.REA || {};
REA.config = {
  name: 'Rea Amparo',
  github: 'https://github.com/msreaamparo-wq',
  githubUser: 'msreaamparo-wq',
  /* No email address exists in the original project. Add yours here, e.g. 'you@example.com'.
     While empty, the email link is hidden instead of showing a fake address. */
  email: '',
  fallbackRepoCount: 6
};

REA.projects = [
  {
    id: 'trace', index: '01', title: 'TRACE', status: 'Prototype', statusKind: 'Status',
    short: 'Attendance, recorded properly.',
    desc: 'Tracking and recording attendance system with event management, QR-based attendance, role-based access, and location verification.',
    tech: ['Flutter', 'Dart', 'Firebase', 'Provider', 'Cloud Firestore', 'QR scanning', 'Geolocation', 'Hive', 'PDF / Excel reports'],
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
    tech: ['Python', 'PyTorch', 'TensorFlow Lite', 'Flutter', 'Dart', 'Roboflow'],
    repo: 'https://github.com/msreaamparo-wq', repoLabel: 'See GitHub profile',
    demo: null, accent: '#c4452d',
    problem: 'Classifying the severity of Black Pod Rot in cacao pods.',
    purpose: 'Research into whether convolutional neural networks, tuned with Bayesian hyperparameter optimization, can classify severity from images.',
    build: ['CNN-based image classification', 'Bayesian hyperparameter optimization', 'Python with PyTorch', 'TensorFlow Lite as a deployment target'],
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
    tech: ['Flutter', 'Dart', 'Supabase', 'OpenStreetMap', 'flutter_map', 'Geolocation'],
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
    short: 'A hacked screen that isn\u2019t.',
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

/* Expanded profile-wide toolkit. Project-specific libraries are also shown in each case study. */
REA.toolkit = [
  {
    name: 'Programming languages',
    items: ['Python', 'Dart', 'JavaScript', 'HTML5', 'CSS3', 'Java', 'Kotlin', 'C#', 'PHP', 'TypeScript', 'SQL']
  },
  {
    name: 'Web and interactive UI',
    items: ['React', 'React DOM', 'Flask', 'Node.js', 'FastAPI', 'Vite', 'Tailwind CSS', 'Bootstrap', 'Three.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'Lucide React', 'PostCSS', 'Autoprefixer']
  },
  {
    name: 'Mobile, backend and cloud',
    items: ['Flutter', 'Provider', 'Firebase', 'Firebase Authentication', 'Cloud Firestore', 'Firebase Storage', 'Supabase', 'Supabase JS', 'Hive', 'REST APIs', 'GitHub REST API', 'OpenStreetMap', 'Geolocator', 'QR scanning', 'image_picker', 'mobile_scanner', 'qr_flutter', 'flutter_map', 'latlong2', 'tflite_flutter']
  },
  {
    name: 'AI, data and developer tools',
    items: ['PyTorch', 'TensorFlow', 'TensorFlow Lite', 'scikit-learn', 'NumPy', 'pandas', 'CNNs', 'Bayesian HPO', 'Computer Vision', 'Roboflow', 'YOLO', 'Google Colab', 'python-docx', 'pypdf', 'pytest', 'Git', 'GitHub', 'VS Code', 'Android Studio', 'Android SDK', 'Figma', 'npm', 'GitHub Pages', 'Render', 'Vercel']
  }
];
