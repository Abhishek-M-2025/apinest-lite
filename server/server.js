const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' }));
app.use(express.static(path.join(__dirname, '../client')));

app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, body } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const fetchOptions = {
      method: method || 'GET',
      headers: headers || {}
    };

    const hasBody = body !== undefined && body !== null && body !== '';
    const isGetOrHead = ['GET', 'HEAD'].includes(fetchOptions.method.toUpperCase());

    if (hasBody && !isGetOrHead) {
      const contentTypeKey = Object.keys(fetchOptions.headers).find(
        k => k.toLowerCase() === 'content-type'
      ) || 'content-type';
      const contentType = (fetchOptions.headers[contentTypeKey] || '').toLowerCase();

      if (contentType.includes('application/x-www-form-urlencoded')) {
        fetchOptions.body = typeof body === 'object' ? new URLSearchParams(body).toString() : body;
      } else if (contentType.includes('multipart/form-data')) {
        const formData = new FormData();
        if (typeof body === 'object') {
          for (const [k, v] of Object.entries(body)) formData.append(k, v);
        }
        fetchOptions.body = formData;
        delete fetchOptions.headers[contentTypeKey];
      } else {
        fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body.toString();
      }
    }

    const startTime = Date.now();
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;
    const bodyText = await response.text();
    const size = Buffer.byteLength(bodyText, 'utf8');

    const resHeaders = {};
    response.headers.forEach((val, key) => resHeaders[key] = val);

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
      body: bodyText,
      time: duration,
      size
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message || 'Error',
      status: 0,
      statusText: 'Network Error'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
