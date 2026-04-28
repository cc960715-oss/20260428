let video;
let handPose;
let hands = [];

function preload() {
  // 載入手勢辨識模型
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  // 取得攝影機影像並設定鏡像翻轉，讓操作更直覺
  video = createCapture(VIDEO, { flipped: true });
  // 隱藏預設產生的 HTML5 video 元件，只在畫布上顯示
  video.hide();

  // 開始偵測手勢
  handPose.detectStart(video, (results) => {
    hands = results;
  });
}

function draw() {
  // 背景顏色設定為 e7c6ff
  background('#e7c6ff');

  // 計算影像顯示的寬高（畫布寬高的 50%）
  let vWidth = width * 0.5;
  let vHeight = height * 0.5;
  let vx = (width - vWidth) / 2;
  let vy = (height - vHeight) / 2;

  // 將影像繪製在畫布中間
  image(video, vx, vy, vWidth, vHeight);

  // 繪製手勢辨識的點
  if (hands.length > 0) {
    for (let hand of hands) {
      for (let keypoint of hand.keypoints) {
        // 將攝影機原始座標映射到畫布上縮放後的影像區域
        let x = map(keypoint.x, 0, video.width, vx, vx + vWidth);
        let y = map(keypoint.y, 0, video.height, vy, vy + vHeight);
        
        fill(0, 255, 0); // 特徵點顏色：綠色
        noStroke();
        circle(x, y, 10);
      }
    }
  }

  // 在畫布中間上方寫上 414730035
  fill(0); // 文字顏色設為黑色
  textSize(32);
  textAlign(CENTER, TOP);
  text("414730035", width / 2, 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
