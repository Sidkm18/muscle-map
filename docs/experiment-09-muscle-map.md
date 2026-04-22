# Experiment 09: Comparative Analysis of Code Quality Using Muscle Map

## Title
Comparative Analysis of Code Quality: Automated Coding Tools vs. Manual Coding

## Aim
To assess and compare the quality of code produced by automated coding tools versus manually written code by using the `muscle-map` mini project as the problem statement, with special focus on sessions and cookies for user authentication.

## Problem Statement
Design and develop a web-based fitness mini project named `Muscle Map` that allows users to register, log in, maintain their profile, and access protected application features. The application must use PHP, JavaScript, MySQL, sessions, and cookies to manage authentication and preserve user state across requests.

For this experiment, the problem is studied from two perspectives:

1. Manual coding approach:
Implement the basic authentication flow using HTML, CSS, JavaScript, PHP, SQL, and PHP sessions with minimal validation and a simple login/logout mechanism.

2. Automated coding approach:
Enhance the same `Muscle Map` authentication flow using AI-assisted code generation and review, adding structured validation, secure password storage, cookie-based "remember me" behavior, CSRF protection, and cleaner separation of concerns.

The goal is to compare both approaches on readability, maintainability, performance, security, and adherence to coding standards.

## Mini Project Context
`Muscle Map` is a gym and fitness web application that supports:

- User registration and login
- Session-based authentication
- Cookie-assisted "remember me" restoration
- Profile and onboarding data persistence
- Protected API endpoints for authenticated users
- Frontend session awareness for routing and user state

## Technology Stack
- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL
- Authentication State: PHP sessions and cookies
- Evaluation Style: manual review plus test-based validation

## Existing Project Components Used For This Experiment

### Backend authentication and session management
- [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:24)
- [backend/src/api/register.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/register.php:5)
- [backend/src/api/login.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/login.php:5)
- [backend/src/api/logout.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/logout.php:5)
- [backend/src/api/me.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/me.php:7)

### Frontend session handling
- [frontend/js/site-runtime.js](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/frontend/js/site-runtime.js:183)
- [frontend/js/login.js](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/frontend/js/login.js:1)
- [frontend/js/register.js](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/frontend/js/register.js:1)

### Supporting tests
- [tests/api-contract.test.mjs](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/tests/api-contract.test.mjs:1)
- [tests/frontend-contract.test.mjs](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/tests/frontend-contract.test.mjs:1)
- [tests/onboarding-age-gate.test.mjs](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/tests/onboarding-age-gate.test.mjs:1)
- [tests/phpunit/AuthHelpersTest.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/tests/phpunit/AuthHelpersTest.php:1)

## Theory
Manual coding and automated coding are two different approaches for developing software systems.

In manual coding, the developer writes the complete solution by hand. This gives full control over the logic, flow, and structure of the program. It is useful for learning and understanding the internal behavior of the system, but it may take more time and may miss important validations or security practices if the developer is inexperienced.

In automated coding, AI-assisted tools help generate or refine parts of the software based on requirements. This improves productivity and often introduces better organization, validation, and coding practices. However, AI-generated code must still be reviewed carefully because it can become slightly longer or more abstract than strictly necessary.

In the `Muscle Map` project, sessions and cookies are central to the experiment:

- A PHP session is used to keep track of the logged-in user during browser interaction.
- A cookie is used for optional "remember me" behavior so that a user can be recognized again after the browser session ends.
- Additional security measures such as `HttpOnly`, `SameSite`, session regeneration, password hashing, and CSRF protection improve robustness in the AI-assisted version.

Thus, `Muscle Map` is a suitable mini project for comparing a simple manual implementation with a more structured automated implementation.

## Methodology

### 1. Experimental Design
The selected programming task is the authentication module of the `Muscle Map` mini project. The comparison focuses on user registration, login, session creation, cookie handling, logout, and protected route access.

### 2. Manual Coding Baseline
The manual baseline is treated as a simpler version of the same feature set:

- Basic registration form
- Basic login form
- Session creation after successful login
- Logout by destroying the session
- Limited validation
- No advanced cookie signing or CSRF protection

### 3. Automated Coding Version
The AI-assisted version in the current `muscle-map` project includes:

- Structured request validation
- Password hashing with `password_hash()`
- Password verification with `password_verify()`
- Session fixation protection using `session_regenerate_id(true)`
- Remember-me cookie generation and validation
- Cookie security flags such as `HttpOnly` and `SameSite=Lax`
- CSRF token generation and verification
- Frontend session synchronization using authenticated API calls

### 4. Evaluation Parameters
The two approaches are compared using:

- Readability
- Maintainability
- Performance
- Error density
- Test coverage
- Code complexity
- Adherence to coding standards
- Security readiness

## How Sessions and Cookies Are Used In Muscle Map

### Session configuration
In [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:24), the project enables strict session handling before `session_start()`:

- `session.use_strict_mode = 1`
- `session.use_only_cookies = 1`
- `session.cookie_httponly = 1`
- `SameSite = Lax`

This improves session security and ensures the application relies on cookies instead of URL-based session propagation.

### Session creation after registration and login
After successful registration, the project creates the authenticated session in [backend/src/api/register.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/register.php:88).

After successful login, the project creates the authenticated session in [backend/src/api/login.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/login.php:54).

The session helper [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:166) performs:

- session ID regeneration
- storing `user_id`
- storing `email`
- clearing any previous CSRF token

### Remember-me cookie
The project issues an optional remember-me cookie in [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:227). The cookie payload contains:

- user ID
- email
- expiry time
- HMAC signature

This cookie is restored and revalidated in [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:252), which checks:

- payload structure
- expiration
- database-backed user lookup
- signature validity

### Logout handling
Logout clears the remember-me cookie and destroys the current session in [backend/src/api/logout.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/logout.php:11) and [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:558).

### Frontend session awareness
The frontend keeps the user state synchronized with the backend in [frontend/js/site-runtime.js](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/frontend/js/site-runtime.js:183). It:

- calls the `me` endpoint using `credentials: 'include'`
- stores the authenticated session payload
- attaches CSRF headers for protected write requests
- clears local session state on `401 Unauthorized`

## Comparative Analysis

### A. Readability
Manual code is generally shorter and easier for beginners to follow because it usually keeps everything in a small number of files. However, it often mixes validation, database access, session logic, and response handling in one place.

The automated version of `Muscle Map` is more readable for long-term use because responsibilities are separated. For example:

- bootstrap utilities are centralized in [backend/src/bootstrap.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/bootstrap.php:24)
- registration logic is isolated in [backend/src/api/register.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/register.php:5)
- login logic is isolated in [backend/src/api/login.php](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/backend/src/api/login.php:5)
- frontend session state is isolated in [frontend/js/site-runtime.js](/Applications/XAMPP/xamppfiles/htdocs/muscle-map/frontend/js/site-runtime.js:183)

Conclusion: the manual approach is easier to read initially, but the automated approach is easier to understand in a larger project.

### B. Maintainability
Manual code becomes harder to maintain when new requirements are added, such as remember-me cookies, CSRF protection, or profile-driven route checks.

The automated version is more maintainable because repeated concerns are abstracted into helper functions such as:

- `mm_start_session_user()`
- `mm_issue_remember_me_cookie()`
- `mm_restore_session_from_remember_me()`
- `mm_require_csrf()`
- `mm_session_payload()`

Conclusion: the automated approach is better for future extension and bug fixing.

### C. Performance
Both approaches are acceptable for a mini project. A manual solution may appear slightly faster in raw execution because it contains fewer checks. However, the automated version adds only small overhead while providing much stronger correctness and safety.

In `Muscle Map`, the additional steps include:

- JSON request validation
- signed cookie verification
- session payload preparation
- CSRF token checks

This overhead is minor compared with the usability and security benefits.

Conclusion: performance difference is small, and the automated approach is still efficient enough for the project.

### D. Error Density
Manual code is more likely to produce errors such as:

- missing validation
- duplicate username issues
- insecure password storage
- broken session restoration
- inconsistent response formats

The automated version reduces error density by using:

- validation middleware
- transaction-based registration
- standard response helpers
- explicit status codes
- automated tests

Conclusion: the automated approach has lower error density.

### E. Test Coverage
Manual implementations in laboratory work often have little or no automated testing.

The current `Muscle Map` project includes tests, which improves confidence:

- API contract checks
- frontend behavior checks
- PHP auth helper tests

Conclusion: the automated approach provides better testability and stronger verification.

### F. Code Complexity
Manual code is often simpler at first, but the simplicity can be misleading because many edge cases remain unhandled.

The automated `Muscle Map` implementation is more detailed because it covers:

- secure session startup
- signed remember-me cookies
- token handling
- route protection
- frontend session synchronization

So the automated version has slightly higher code complexity, but the complexity is purposeful and aligned with real-world requirements.

Conclusion: manual coding has lower apparent complexity, while automated coding has higher but more meaningful complexity.

### G. Adherence to Coding Standards
Manual code may vary based on programmer style and experience. In contrast, the AI-assisted version follows more consistent naming, modular structure, status handling, and security patterns.

Examples from `Muscle Map`:

- reusable helper functions
- separated frontend and backend concerns
- consistent JSON responses
- safer password and cookie handling

Conclusion: the automated approach shows stronger adherence to coding standards.

## Parameter-Wise Comparison Table

| Parameter | Manual Coding | Automated Coding in Muscle Map | Better Approach |
|---|---|---|---|
| Readability | Simple but basic | Structured and modular | Automated |
| Maintainability | Harder to extend | Easier to update | Automated |
| Performance | Slightly lighter | Slight overhead, still efficient | Nearly equal |
| Error Density | More human mistakes | Fewer mistakes due to validation and helpers | Automated |
| Test Coverage | Usually low | Better due to available tests | Automated |
| Code Complexity | Lower initially | Higher but purposeful | Depends on goal |
| Coding Standards | Inconsistent | More standardized | Automated |
| Security | Basic | Stronger session, cookie, and CSRF handling | Automated |

## Key Observations From Muscle Map

1. The project demonstrates secure session initialization and avoids weak defaults.
2. The login and registration flows are separated cleanly and return structured JSON responses.
3. The remember-me feature uses signed cookie payloads instead of storing plain sensitive values directly.
4. The logout flow correctly removes both session and cookie state.
5. The frontend respects authenticated session state and includes CSRF support for protected requests.
6. The automated version is longer than a manual classroom solution, but it is more production-ready.

## Sample Manual Coding Summary
If this experiment requires you to describe the manual version separately, you can write:

"In the manual version of `Muscle Map`, the user registration and login module was implemented using basic HTML forms, PHP, and MySQL. After successful login, the user ID was stored in a PHP session and checked on protected pages. Logout was implemented by destroying the session. The code was functional but used limited validation and did not include advanced features such as signed remember-me cookies, CSRF protection, or structured helper functions."

## Sample Automated Coding Summary
If this experiment requires you to describe the automated version separately, you can write:

"In the automated version of `Muscle Map`, AI-assisted development was used to build a more structured authentication system. Passwords were hashed securely, sessions were regenerated after authentication, remember-me cookies were signed and validated, CSRF tokens were enforced, and frontend session state was synchronized through authenticated API calls. The resulting code was more modular, secure, and maintainable."

## Result
The comparison shows that the AI-assisted implementation of `Muscle Map` produces higher-quality code for authentication and state management than a basic manual implementation. Although the manual version is shorter and easier for beginners to understand initially, the automated version performs better in maintainability, security, validation, and long-term project readiness.

## Conclusion
From this experiment, it can be concluded that both manual coding and automated coding have value.

- Manual coding is useful for learning the fundamentals of PHP, sessions, cookies, and database interaction.
- Automated coding is more effective for producing structured, secure, and maintainable software in less time.

In the `Muscle Map` mini project, the automated approach clearly improves overall code quality by introducing better authentication handling, cookie validation, CSRF protection, and modular organization. Therefore, automated coding tools should be used as development assistants, while the programmer should continue to review, test, and understand the generated code.

## Viva / Post-Lab Answers

### 1. What were the major differences observed in code quality between the two approaches?
The manual code was shorter and easier to understand for basic functionality, but it lacked stronger validation and security features. The automated `Muscle Map` code was more modular and secure. It included password hashing, session regeneration, remember-me cookies, and CSRF protection. This made the automated version better in maintainability and reliability.

### 2. How did the experience level of the programmers influence the quality of the code produced?
In manual coding, programmer experience had a strong impact. An experienced developer is more likely to include proper validation, error handling, and secure session management. In the automated approach, the dependency on experience was reduced because AI assistance suggested structure and best practices. However, experience was still necessary to review and validate the generated code.

### 3. Which coding method is more efficient in producing high-quality code?
For the `Muscle Map` authentication module, the automated approach was more efficient in producing high-quality code. It improved development speed and introduced better practices by default. Manual coding was still valuable for understanding the logic and learning core concepts, but the automated approach produced a stronger final implementation.

### 4. Based on the findings, how can automated coding tools be better integrated into development practices?
Automated coding tools should be used to generate initial structure, validations, repetitive code, and secure defaults. Developers should then manually review, test, and adapt the generated solution to project needs. In `Muscle Map`, this combination worked well because the AI-assisted implementation produced structured code, while human review ensured the logic aligned with the project requirements.

## Suggested Output / Screenshot Section
You can attach screenshots of the following pages for the assignment report:

1. Registration page
2. Login page
3. Successful login / protected page access
4. Profile or onboarding page after authentication
5. Logout behavior
6. Browser cookies or session evidence from developer tools

## Short Problem Statement Version
If your faculty wants a shorter problem statement, use this:

"Develop the `Muscle Map` mini project with user registration and login using PHP, MySQL, sessions, and cookies. Compare a basic manual implementation with an AI-assisted implementation on the basis of readability, maintainability, performance, testability, and security."
