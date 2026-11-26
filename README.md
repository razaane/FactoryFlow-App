<div align="center">

# 🏭 FactoryFlow

**Full-stack industrial production management platform (MERN)**

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=fff) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=fff) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=fff) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=fff) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=fff) ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=000) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=fff) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=fff)

[👩‍💻 Author](https://github.com/razaane)

</div>

---

## 📌 About

FactoryFlow helps an industrial company replace scattered spreadsheets with one secure system to manage **raw materials, stock movements, products and manufacturing orders**. It is a monorepo with a Node.js / Express / MongoDB REST API and a React (Vite) client, orchestrated with Docker Compose.

> 🎓 Built during my training at **YouCode (UM6P) · Full Stack Web Development**.

## ✨ Features

- 🔐 JWT authentication with **Admin / Operator** role-based access control
- 🧱 Raw materials with unique references, units and **low-stock alert thresholds**
- 📦 Stock movements (`ENTREE` / `SORTIE`) with filtering by material, type and date range
- 🧪 Products defined by their **raw-material composition** (bill of materials)
- 🏗️ Multi-product **production orders** with a lifecycle: Planned → In progress → Completed
- ⚛️ **Atomic stock consumption** using MongoDB transactions (replica set)
- 🧭 Clean layered architecture: routes → controllers → services → repositories → models
- ✅ Joi validation, centralized error handling, Helmet & Morgan
- 📚 Interactive API docs with Swagger at `/api-docs`
- 🧪 Tests with Jest & Supertest

## 🛠️ Tech Stack

`React` · `Vite` · `Node.js` · `Express` · `MongoDB` · `Mongoose` · `JWT` · `Swagger` · `Jest` · `Docker`

## 🚀 Getting Started

### With Docker (recommended)
```bash
git clone https://github.com/razaane/FactoryFlow-App.git
cd FactoryFlow-App
cp backend/.env.example backend/.env
docker compose up --build
```
| Service | URL |
|---|---|
| React client | http://localhost:5174 |
| REST API | http://localhost:3001/api |
| Swagger docs | http://localhost:3001/api-docs |

MongoDB runs as a single-node **replica set** so that stock consumption can use transactions.

### Without Docker
```bash
cd backend && cp .env.example .env && npm install && npm run dev
cd ../frontend && npm install && npm run dev
```

## 🧩 Main API resources
| Resource | Endpoint |
|---|---|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Raw materials | `/api/raw-materials` |
| Stock movements | `/api/stock-movements` |
| Products | `/api/products` |
| Production orders | `/api/production-orders` |
| Operator orders | `/api/operator/orders` |

## 📐 Conception
UML class diagrams and a Gantt planning are available in [`backend/docs`](backend/docs).


## 📁 Project Structure

```text
FactoryFlow-App/
├── backend/
│   ├── docs/
│   │   ├── diagramme Gantt.pdf
│   │   ├── diagramme.gantt
│   │   ├── diagramme_class.drawio
│   │   ├── diagramme_classV2.drawio
│   │   └── swagger.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── auth.service.test.js
│   │   ├── installation.service.test.js
│   │   ├── operatorOrder.service.test.js
│   │   ├── product.service.test.js
│   │   ├── productionOrder.service.test.js
│   │   ├── rawMaterial.service.test.js
│   │   ├── requirements.service.test.js
│   │   ├── stock.service.test.js
│   │   └── user.service.test.js
│   ├── .dockerignore
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
…
```

## 👩‍💻 Author

**Razane Wakhidi** · MERN Stack & Full Stack Developer · Safi, Morocco 🇲🇦

[![GitHub](https://img.shields.io/badge/GitHub-razaane-181717?style=flat-square&logo=github)](https://github.com/razaane)
[![Email](https://img.shields.io/badge/Email-wakhidirazane%40gmail.com-7C3AED?style=flat-square&logo=gmail&logoColor=white)](mailto:wakhidirazane@gmail.com)

> 💼 Open to work: MERN / Full Stack roles, internships & freelance.
