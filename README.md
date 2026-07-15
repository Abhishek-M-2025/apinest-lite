# APINest Lite

APINest Lite is a lightweight, high-performance, and gorgeous browser-based API testing platform. Built with a modern, glassmorphic dark-theme UI, it allows developers and testing beginners to compose, execute, organize, and inspect HTTP requests without dealing with browser CORS restrictions, using a local Node.js Express server as a request proxy.

---

## Features

- **Standard & Custom HTTP Methods**: Full support for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and the custom `QUERY` method.
- **Request Builder**: Select methods, enter target URLs, and send requests instantly with a real-time loading feedback spinner.
- **Bi-directional Query Parameter Sync**: Rebuilds query parameters tables from URL string edits in real-time and vice versa.
- **Headers & Body Manager**: Add, remove, and configure custom request headers. Support for several body formats:
  - `None` (empty body)
  - `JSON` (includes built-in real-time validation warnings)
  - `Raw Text`
  - `Form Data` (dynamic key-value pair generation)
  - `x-www-form-urlencoded` (urlencoded format)
- **Advanced Authentication**: Custom form controls to configure:
  - `No Auth`
  - `Bearer Token` (injects `Authorization: Bearer <token>`)
  - `Basic Auth` (encodes credentials to Base64 and injects `Authorization: Basic <base64>`)
  - `API Key` (injects custom API Key key/value to Headers or URL Query Parameters dynamically)
- **Premium Response Viewer**:
  - Displays Response Body with a custom pretty JSON syntax highlighter (colored JSON tokens).
  - Inspects Status Code, Response Time in milliseconds, Response Size (formatted in B, KB, or MB), and complete Response Headers.
- **Collections Explorer**: Group, name, save, and reload requests. Everything is stored persistently in your browser's local storage.
- **Environment Variables Manager**: Define custom tokens like `BASE_URL` or `TOKEN`. APINest Lite scans URLs, headers, and request bodies to replace occurrences of `{{VARIABLE_NAME}}` right before execution.
- **Request History List**: Keeps a persistent log of the last 30 executed requests with color-coded method and status badges.
- **One-Click Copy**: Copy responses directly to your clipboard with temporary visual check animations.
- **Responsive Layout**: Adapts gracefully to desktop, tablet, and mobile views.

---

## Folder Structure

```text
client/
  ├── index.html   # Main HTML layout, inline SVG icons
  ├── style.css    # Clean dark theme glassmorphism CSS design system
  └── app.js       # App state, LocalStorage persistence, URL syncer, and API caller
server/
  └── server.js    # Node.js + Express.js backend request proxy & static host
package.json       # Project definitions, dependencies, and start scripts
README.md          # Project setup and documentation
```

---

## System Prerequisites

- **Node.js**: Version 18.0.0 or higher is required (uses Node's native built-in `fetch` API and `FormData` constructors).
- **Web Browser**: Any modern web browser (Chrome, Firefox, Edge, Safari).

---

## Installation & Setup

1. **Clone or Navigate to the Directory**:
   Ensure you are in the project folder containing `package.json`.

2. **Install Dependencies**:
   Open a terminal and run:
   ```bash
   npm install
   ```

3. **Start the Platform**:
   Run the development script to start the local Express proxy:
   ```bash
   npm start
   ```
   *(Alternatively, you can run `npm run dev`)*.

4. **Open in Browser**:
   Once started, open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## How to Use

### 1. Execute a Request
1. Enter your URL (e.g., `https://jsonplaceholder.typicode.com/posts`).
2. Select your method (e.g., `GET` or `POST`).
3. Set your headers or body if required.
4. Click **Send** to dispatch.

### 2. Working with Environment Variables
1. Go to the **Variables** tab in the sidebar.
2. Click **Add Variable**.
3. Set a key (e.g., `BASE_URL`) and value (e.g., `https://jsonplaceholder.typicode.com`).
4. In the request URL bar, write `{{BASE_URL}}/posts` and send the request. The variable will be replaced automatically.

### 3. Managing Collections
1. Click **New Collection** in the sidebar to create a collection folder.
2. Formulate an API request in the workspace, then click the **Save** button next to Send.
3. Name your request, choose your collection, and click **Save**.
4. The request will appear under your collection. Click it anytime to restore its parameters.

### 4. Running the QUERY Method
The `QUERY` method is utilized similarly to a `GET` request but allows a request body payload to filter records:
1. Select the `QUERY` method from the selector.
2. Go to the request **Body** tab, choose **JSON**, and type your filter criteria.
3. Click **Send**. The Express server proxy will execute the HTTP request carrying the body.
