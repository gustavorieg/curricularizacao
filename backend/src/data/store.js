const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");

const DB_FILE = path.join(__dirname, "db.json");
const DEFAULT_ADMIN_EMAIL = "admin@minhasaudefeminina.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function seedDefaultUsers(now) {
  return [
    {
      id: "user-1",
      name: "Administrador",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10),
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seed() {
  const now = new Date().toISOString();

  const categories = [
    {
      id: "cat-1",
      name: "Saude Reprodutiva",
      slug: "saude-reprodutiva",
      description: "Conteudos sobre ciclo menstrual, fertilidade e contracepcao.",
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cat-2",
      name: "Saude Mental",
      slug: "saude-mental",
      description: "Bem-estar emocional, ansiedade e autocuidado.",
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cat-3",
      name: "Nutricao",
      slug: "nutricao",
      description: "Alimentacao saudavel em todas as fases da vida.",
      displayOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const authors = [
    {
      id: "auth-1",
      name: "Dra. Ana Souza",
      institution: "Universidade Federal",
      bio: "Ginecologista e obstetra, especialista em saude da mulher.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auth-2",
      name: "Dra. Carla Lima",
      institution: "Clinica Bem Estar",
      bio: "Psicologa clinica com foco em saude mental feminina.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const articles = [
    {
      id: "art-1",
      title: "Entendendo o ciclo menstrual",
      slug: "entendendo-o-ciclo-menstrual",
      summary: "Um guia completo sobre as fases do ciclo menstrual e como identificar irregularidades.",
      content:
        "O ciclo menstrual e dividido em quatro fases principais: menstrual, folicular, ovulatoria e lutea. Compreender cada uma delas ajuda a identificar padroes normais e possiveis sinais de alerta que merecem atencao medica.",
      categoryId: "cat-1",
      authorId: "auth-1",
      sources: [
        {
          id: "src-1",
          title: "Ministerio da Saude",
          description: "Cartilha sobre saude reprodutiva",
          url: "https://www.gov.br/saude",
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "art-2",
      title: "Ansiedade e o ciclo hormonal",
      slug: "ansiedade-e-o-ciclo-hormonal",
      summary: "Como as flutuacoes hormonais podem influenciar sintomas de ansiedade.",
      content:
        "As variacoes hormonais ao longo do ciclo menstrual podem impactar diretamente o humor e os niveis de ansiedade. Reconhecer esse padrao e o primeiro passo para buscar estrategias de manejo adequadas junto a profissionais de saude.",
      categoryId: "cat-2",
      authorId: "auth-2",
      sources: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "art-3",
      title: "Alimentacao na fase lutea",
      slug: "alimentacao-na-fase-lutea",
      summary: "Nutrientes que ajudam a aliviar sintomas da TPM.",
      content:
        "Durante a fase lutea, o corpo pode se beneficiar de alimentos ricos em magnesio, calcio e vitamina B6, que ajudam a reduzir sintomas comuns da tensao pre-menstrual, como inchaco e irritabilidade.",
      categoryId: "cat-3",
      authorId: "auth-1",
      sources: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const users = seedDefaultUsers(now);

  return { categories, authors, articles, users, sessions: [] };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = seed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const parsed = JSON.parse(raw);

  // Migracao para bancos criados antes dos recursos de usuarios/sessoes existirem.
  let migrated = false;
  if (!Array.isArray(parsed.users)) {
    parsed.users = seedDefaultUsers(new Date().toISOString());
    migrated = true;
  }
  if (!Array.isArray(parsed.sessions)) {
    parsed.sessions = [];
    migrated = true;
  }
  if (migrated) {
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
  }

  return parsed;
}

let db = load();

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function reset() {
  db = seed();
  save();
}

module.exports = {
  get db() {
    return db;
  },
  save,
  reset,
  generateId: (prefix) => `${prefix}-${nanoid(10)}`,
  generateToken: () => nanoid(48),
};
