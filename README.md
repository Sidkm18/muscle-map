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
├── backend/                          # Node + Express API
│   ├── package.json
│   └── src/
│       ├── server.js                 # starts server
│       ├── app.js                    # express config
│       │
│       ├── routes/                   # URL endpoints
│       │   ├── muscle.routes.js
│       │   └── exercise.routes.js
│       │
│       ├── controllers/              # request handling
│       │   ├── muscle.controller.js
│       │   └── exercise.controller.js
│       │
│       ├── services/                 # business logic
│       │   ├── muscle.service.js
│       │   └── exercise.service.js
│       │
│       ├── models/                   # DB queries
│       │   ├── muscle.model.js
│       │   └── exercise.model.js
│       │
│       ├── middleware/               # auth, validation, rate-limit (later)
│       │   ├── auth.middleware.js
│       │   └── error.middleware.js
│       │
│       └── config/
│           ├── db.js                 # PostgreSQL connection
│           └── env.js                # env loader if needed
│
├── database/
│   ├── schema.sql                    # tables
│   └── seed.sql                      # test data
│
└── docs/
    ├── api.md                        # API documentation
    └── architecture.md               # system design
```