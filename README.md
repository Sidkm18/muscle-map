# muscle-map

```
muscle-map/
│
├── README.md
├── .gitignore
│
├── frontend/                         # Current HTML/CSS/JS (later replace with React)
│   ├── index.html
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   └── profile.html
│   │
│   ├── components/                   # Reusable HTML parts
│   │   ├── navbar.html
│   │   └── footer.html
│   │
│   ├── css/
│   │   ├── main.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   └── components.css
│   │
│   ├── js/
│   │   ├── config.js                 # API base URLs, constants
│   │   ├── utils.js                  # helper functions
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── api/                      # API calls grouped by feature
│   │       ├── muscles.api.js
│   │       └── exercises.api.js
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── backend/                          # PHP Backend
│   ├── public/                       # Only exposed directory
│   │   └── index.php
│   │
│   ├── src/
│   │   ├── Core/
│   │   │   ├── Router.php
│   │   │   ├── Database.php
│   │   │   ├── Request.php
│   │   │   └── Response.php
│   │   │
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   ├── Middleware/
│   │   └── Config/
│   │
│   ├── .env
│   ├── composer.json
│   └── vendor/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
└── docs/
├── api.md
└── architecture.md
```

## Development Workflow

This project uses a protected `main` branch.
All changes go through `development` and are reviewed before deployment.
