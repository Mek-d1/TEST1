// index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const deployApp = require('./deploy');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/deploy', async (req, res) => {
  let appName = req.body.app_name;

  // اعتبارسنجی نام اپ (حروف کوچک، عدد و - و طول 3 تا 30)
  if (!/^[a-z0-9-]{3,30}$/.test(appName)) {
    return res.send('<p style="color:red">Invalid app name. Use 3-30 chars: a-z, 0-9, -</p>');
  }

  // اضافه کردن شناسه یکتا برای جلوگیری از تکراری بودن نام اپ
  appName = appName + '-' + Date.now();

  try {
    const result = await deployApp(appName);
    res.send(`<p>App deployed! <a href="${result.web_url}" target="_blank">${result.web_url}</a></p>`);
  } catch (err) {
    res.send(`<p style="color:red">Error: ${err.message}</p>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});