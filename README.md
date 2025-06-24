Secure API with JWT Auth, Rate Limiting, and Metrics Monitoring

🚀 Overview

This project is a secure, production-ready Node.js API designed with modern security and observability features. It demonstrates best practices in API security, rate limiting using the token bucket algorithm, and real-time metrics visualization using Grafana + Prometheus. Authentication is handled via JWT, and Redis is used for token/session management.

📌 Built and maintained by a backend security engineer with a focus on API security, monitoring, and client-readiness.



📫 Postman Collection

Test the full API using the provided in the "Postman-collections" directory.

- Auth routes (register, login, token refresh)
- Rate-limited endpoints (OTP, login)
- Also test ADMIN endpoint

🔐 Key Features

* JWT Authentication: Secure, stateless user sessions

* Email Verification & OTP Flow: With expiry and Redis storage

* Rate Limiting: Token bucket algorithm using Redis for login and OTP endpoints

* Role-Based Access Control: requireAdmin middleware to protect sensitive routes

* Redis Session + Refresh Token Handling

* Prometheus Metrics: API usage, errors, Redis ops, auth successes, business KPIs

* Grafana Dashboards: Visual display of API performance and security stats

* Postman Integration: For quick API testing and demos

* Swagger : In progress – API documentation served via /api-docs

📊 Metrics Visualized

Via Prometheus & Grafana:

login_requests_total – Total login attempts

auth_success_total – Successful auths

error_events_total – API error rate

redis_operations_total – Redis GET/SET ops

rate_limits_allowed / rate_limits_blocked

business_kpi_active_users – Active session count




Visual Assets:

✅ Pre-built Grafana dashboards (JSON exports in grafana-dashboards/)

✅ Sample screenshots and insights in /metrics/README.md



🧪 Testing

Postman

Use /postman_collection.json to test all API routes

Includes login, register, OTP, JWT flows, and protected routes

Artillery

Used to simulate bursts for rate limiter stress-testing

Results saved in artillery-results/



📁 Folder Structure

|-> Controllers/
>authController.ts
>whitelistContrller.ts
>passportContrller.ts


|-> Routes/


>userrouter


|-> Monitor/


> monitor.ts

                                      
|-> prisma/


|-> config/

> swagger.ts
> redis.ts
> security.ts
> OTPlimit.ts
              
|-> artillery-tests/

|-> grafana-dashboards/

|-> postman_collection.json

|-> README.md                 # <- You're here

📸 Screenshots

Login Spike Test (Artillery)

API Metrics in Grafana





🧠 Why This Matters

This project is a demonstration of what a real-world secure API backend should include:

> Defensive coding

> Rate limiting resilience

> Token-based security

> Observability and auditing

Realistic traffic simulation and visualization

🧑‍💻 Developer Notes

Designed with clients, employers, and proof-of-concept demonstrations in mind.

Swagger integration is being refined. Postman is currently the best testing tool for this.

🤝 Credits



Developed by Karabo Seeisa – Backend Security Engineer with a passion for secure APIs and operational visibility.

📬 Contact

GitHub: COD434

Email: seeisakarabo2@gmail.com

⭐ If this project helped or inspired you, please star the repo!
