const https = require('https');
const fs = require('fs');

// We know 5192157 is "A Man Playing A Game Of Basketball"
// Let's test numbers in the 5192xxx and 5586xxx and 3195xxx series:
const candidates = [];
for (let i = 5192150; i <= 5192170; i++) candidates.push(i);
for (let i = 5192065; i <= 5192080; i++) candidates.push(i);
for (let i = 5586515; i <= 5586530; i++) candidates.push(i);
for (let i = 3195390; i <= 3195405; i++) candidates.push(i);
for (let i = 3191565; i <= 3191580; i++) candidates.push(i);

function check(id) {
  const url = `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_30fps.mp4`;
  const url25 = `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_25fps.mp4`;
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 200 && res.headers['content-type']?.includes('video')) {
        return resolve({ id, url, size: res.headers['content-length'] });
      }
      https.request(url25, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res2 => {
        if (res2.statusCode === 200 && res2.headers['content-type']?.includes('video')) {
          return resolve({ id, url: url25, size: res2.headers['content-length'] });
        }
        resolve(null);
      }).on('error', () => resolve(null)).end();
    }).on('error', () => resolve(null)).end();
  });
}

async function main() {
  const chunks = [];
  while (candidates.length) chunks.push(candidates.splice(0, 15));
  for (const chunk of chunks) {
    const results = await Promise.all(chunk.map(check));
    for (const r of results) {
      if (r) console.log(`OK: id=${r.id} size=${r.size} url=${r.url}`);
    }
  }
}

main();
