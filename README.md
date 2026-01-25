# muscle-map
```
muscle-map/
│
├── frontend/                 # React app
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── services/         # API calls
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                  # Node + Express API
│   ├── src/
│   │   ├── config/           # db, env, constants
│   │   │   └── db.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/         # business logic
│   │   ├── models/           # DB queries / ORM
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── api.md
│   └── architecture.md
│
├── .gitignore
├── README.md
└── package.json              # optional if using monorepo scripts
```