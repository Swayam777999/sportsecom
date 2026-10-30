const https = require('https');
const fs = require('fs');
const path = require('path');

const downloads = [
  { name: 'basketball.mp4', url: 'https://videos.pexels.com/video-files/5192157/5192157-sd_640_360_30fps.mp4' },
  { name: 'basketball_dribble.mp4', url: 'https://videos.pexels.com/video-files/5586528/5586528-sd_640_360_25fps.mp4' },
  { name: 'court_match.mp4', url: 'https://videos.pexels.com/video-files/5192158/5192158-sd_640_360_30fps.mp4' },
  { name: 'soccer_field.mp4', url: 'https://videos.pexels.com/video-files/3191572/3191572-sd_640_360_25fps.mp4' },
  { name: 'action_play.mp4', url: 'https://videos.pexels.com/video-files/3195392/3195392-sd_640_360_25fps.mp4' }
];

const targetDir = 'c:/Users/admin/OneDrive/Desktop/wmd pro 1/sports-shop/frontend/public/videos';

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, item.name);
    const file = fs.createWriteStream(dest);
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${item.name}: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Saved: ${item.name} (${fs.statSync(dest).size} bytes)`);
        resolve(dest);
      });
    }).on('error', err => reject(err));
  });
}

async function run() {
  for (const item of downloads) {
    try {
      await downloadFile(item);
    } catch (e) {
      console.error(e.message);
    }
  }
}

run();
