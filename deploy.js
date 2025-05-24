// deploy.js
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const HEROKU_API_KEY = 'HRKU-AAo_fa6Olou2_bVN2XeE_4CAEdNWfuTD-v6xpFgok95A_____wUtzmHYzEDO';
const HEROKU_TEAM_NAME = 'safeheaven'; // اگر تیم نداری خالی بذار یا حذف کن

module.exports = async function deployApp(appName) {
  const headers = {
    Authorization: `Bearer ${HEROKU_API_KEY}`,
    Accept: 'application/vnd.heroku+json; version=3',
  };

  // داده ساخت اپ
  const appData = { name: appName };
  if (HEROKU_TEAM_NAME) appData.team = HEROKU_TEAM_NAME;

  // ساخت اپ در هروکو
  let res;
  try {
    res = await axios.post('https://api.heroku.com/apps', appData, { headers });
  } catch (error) {
    console.error('Heroku API Error:', error.response?.data || error.message);
    throw new Error('Heroku app creation failed: ' + JSON.stringify(error.response?.data || error.message));
  }

  // تنظیم گیت ریموت
  const gitUrl = `https://heroku:${HEROKU_API_KEY}@git.heroku.com/${appName}.git`;
  const tempDir = path.join(__dirname, 'temp', appName);

  // پاک کردن دایرکتوری قبلی اگر بود و کپی کردن فایل‌ها
  if (fs.existsSync(tempDir)) fs.removeSync(tempDir);
  fs.ensureDirSync(tempDir);
  fs.copySync(path.join(__dirname, 'bot'), tempDir);

  // اجرای دستورات گیت
  execSync('git init', { cwd: tempDir });
  execSync('git add .', { cwd: tempDir });
  execSync('git commit -m "initial deploy"', { cwd: tempDir });
  execSync(`git remote add heroku ${gitUrl}`, { cwd: tempDir });
  execSync(`git push heroku master -f`, { cwd: tempDir });

  return res.data;
};