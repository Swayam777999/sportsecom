const https = require('https');

const candidates = [
  // Soccer
  4809867, 4809868, 4809869, 4809870, 5849891, 5849892,
  // Basketball
  5192157, 5586521, 5586520, 5586522, 5192070, 5192071, 5192072, 3195395, 3195393, 3195392,
  // Tennis / Other
  5738870, 6084999
];

const variants = [
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_25fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_30fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_25fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_30fps.mp4`
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, statusCode: res.statusCode, contentType: res.headers['content-type'], size: res.headers['content-length'] });
    });
    req.on('error', () => resolve({ url, statusCode: 500 }));
    req.setTimeout(2500, () => { req.destroy(); resolve({ url, statusCode: 408 }); });
    req.end();
  });
}

async function run() {
  const allUrls = [];
  for (const id of candidates) {
    for (const v of variants) {
      allUrls.push(v(id));
    }
  }

  const results = await Promise.all(allUrls.map(checkUrl));
  const seenIds = new Set();
  for (const r of results) {
    if (r.statusCode === 200 && r.contentType && r.contentType.includes('video')) {
      const match = r.url.match(/video-files\/(\d+)\//);
      const id = match ? match[1] : r.url;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        console.log(`WORKING: id=${id} size=${r.size} url=${r.url}`);
      }
    }
  }
}

run();
