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
    tech: ['Flutter', 'Dart', 'Firebase'],
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
    tech: ['Python', 'PyTorch', 'TensorFlow Lite'],
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
    tech: ['Python', 'Flask', 'HTML', 'CSS'],
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
    tech: ['Flutter', 'Supabase', 'OpenStreetMap'],
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

REA.toolkit = [
  { name: 'Languages', items: ['Python', 'Dart', 'JavaScript', 'HTML', 'CSS', 'Java', 'Kotlin', 'C#', 'PHP', 'TypeScript', 'SQL'] },
  { name: 'App and web development', items: ['Flutter', 'Provider', 'Firebase', 'Flask', 'React', 'Node.js', 'FastAPI', 'Bootstrap', 'Tailwind CSS'] },
  { name: 'Machine learning', items: ['PyTorch', 'TensorFlow', 'TensorFlow Lite', 'scikit-learn', 'NumPy', 'pandas', 'CNNs', 'Roboflow', 'YOLO'] },
  { name: 'Development tools', items: ['Git', 'GitHub', 'VS Code', 'Android Studio', 'Figma', 'Google Colab', 'pytest'] }
];
