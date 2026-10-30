const https = require('https');

// Test popular sports video IDs or URLs on Pexels video-files CDN
// Standard format on Pexels CDN: https://videos.pexels.com/video-files/{ID}/{ID}-sd_640_360_25fps.mp4
// or -sd_640_360_30fps.mp4 or -sd_960_540_24fps.mp4

const testIds = [
  // 3191572 and 3195396 were 200 in previous run:
  3191572, 3195396,
  // Basketball IDs
  2833857, 2833858, 5192157, 5192159, 2942940, 3196238, 5192070, 5192071, 5192072, 3195395, 3195393, 3195392,
  // Soccer / Football IDs
  3629511, 4678261, 4770119, 3195397, 4761426, 4761799, 5849891, 5849892, 5849893,
  // Tennis IDs
  5738870, 5738871, 5738872, 6084999, 6085000, 4820895, 4820896
];

const variants = [
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_25fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_30fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_24fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_25fps.mp4`,
  (id) => `https://videos.pexels.com/video-files/${id}/${id}-sd_960_540_30fps.mp4`
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
    });
    req.on('error', () => resolve({ statusCode: 500 }));
    req.setTimeout(4000, () => { req.destroy(); resolve({ statusCode: 408 }); });
    req.end();
  });
}

async function run() {
  for (const id of testIds) {
    for (const makeUrl of variants) {
      const url = makeUrl(id);
      const res = await checkUrl(url);
      if (res.statusCode === 200 && res.contentType && res.contentType.includes('video')) {
        console.log(`FOUND: id=${id} size=${res.contentLength} url=${url}`);
        break; // found working variant for this id
      }
    }
  }
  console.log('DONE CHECKING');
}

run();
