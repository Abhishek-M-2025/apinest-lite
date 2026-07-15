# 🚀 APINest Lite

**APINest Lite** is a lightweight, modern browser-based API testing platform that allows developers to create, execute, organize, and debug HTTP requests easily.

Built with a **glassmorphic dark UI**, it uses a local **Node.js + Express.js proxy server** to bypass browser CORS restrictions and provide a smooth API testing experience.

---

# ✨ Features

## 🔹 Request Builder

* Supports HTTP methods:

  * GET, POST, PUT, PATCH, DELETE
  * Custom QUERY method
* Real-time request execution with loading feedback.
* Dynamic query parameter synchronization.

---

## 🔹 Headers & Body Manager

Supports multiple request formats:

* None
* JSON (with validation)
* Raw Text
* Form Data
* x-www-form-urlencoded

Manage custom headers easily.

---

## 🔹 Authentication

Available options:

* No Auth
* Bearer Token
* Basic Auth (Base64 encoding)
* API Key (Header / Query Parameter)

---

## 🔹 Response Viewer

Provides detailed response analysis:

* Pretty JSON syntax highlighting
* Status code
* Response time
* Response size
* Response headers
* One-click copy

---

## 🔹 Collections & History

* Create and manage API collections.
* Save and restore requests.
* Stores last 30 executed requests.
* Uses browser LocalStorage for persistence.

---

## 🔹 Environment Variables

Create reusable variables:

```text
BASE_URL = https://api.example.com
TOKEN = your_token
```

Use them as:

```text
{{BASE_URL}}/users
```

Variables are automatically replaced before execution.

---

# 🏗️ System Architecture

```mermaid
flowchart LR

A[User Interface] --> B[Request Builder]

B --> C[Headers / Body / Auth]

C --> D[Environment Processor]

D --> E[Express.js Proxy]

E --> F[External API]

F --> G[Response Analyzer]

G --> H[JSON Viewer + Storage]
```

---

# ⚙️ Working Flow

1. **Request Creation**

   * User configures URL, method, headers, authentication, and body.

2. **Request Processing**

   * Environment variables are replaced and request data is prepared.

3. **Proxy Execution**

   * Express.js forwards requests to external APIs and handles CORS limitations.

4. **Response Analysis**

   * Displays response data, status, timing, headers, and size.

5. **Local Storage**

   * Saves collections, variables, and history in the browser.

---

# 📂 Project Structure

```text
APINest-Lite/

├── client/
│   ├── index.html   # UI layout
│   ├── style.css    # Glassmorphism design
│   └── app.js       # Frontend logic
│
├── server/
│   └── server.js    # Express proxy server
│
├── package.json
└── README.md
```

---

# 🛠️ Tech Stack

**Frontend**

* HTML5
* CSS3
* JavaScript
* LocalStorage

**Backend**

* Node.js
* Express.js
* Fetch API

---

# ⚙️ Requirements

* Node.js v18+
* Modern browser:

  * Chrome
  * Firefox
  * Edge
  * Safari

---

# 🚀 Installation

Clone the repository:

```bash
git clone <repository-url>
cd APINest-Lite
```

Install dependencies:

```bash
npm install
```

Start application:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

---

# 📖 Usage

### Send Request

1. Enter API URL.
2. Select method.
3. Configure headers/body/auth.
4. Click **Send**.
5. View response instantly.

### Save Request

1. Create request.
2. Click Save.
3. Select collection.
4. Access anytime.

### QUERY Method

Send filtered requests with JSON body:

```json
{
  "category": "electronics"
}
```

---

# 🔒 Privacy

All collections, variables, and history remain stored locally in the browser. No user data is uploaded externally.

---

# 🌟 Future Improvements

* Import/Export Collections
* API Automation
* Request Runner
* Cloud Sync
* Team Collaboration

---

# 👨‍💻 Author

Built with ❤️ by **Abhishek Mehra**

⭐ Star the repository if you like APINest Lite!
