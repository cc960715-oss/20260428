let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存水泡的陣列

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

  // 繪製手勢辨識的點與連線
  if (hands.length > 0) {
    for (let hand of hands) {
      // 定義五個手指末梢的索引：大拇指(4), 食指(8), 中指(12), 無名指(16), 小指(20)
      let fingerTips = [4, 8, 12, 16, 20];
      for (let index of fingerTips) {
        let kp = hand.keypoints[index];
        let bx = map(kp.x, 0, video.width, vx, vx + vWidth);
        let by = map(kp.y, 0, video.height, vy, vy + vHeight);
        
        // 每隔幾幀產生一個新水泡，避免水泡過多
        if (frameCount % 5 === 0) {
          bubbles.push(new Bubble(bx, by));
        }
      }

      // 繪製手指連線：0-4, 5-8, 9-12, 13-16, 17-20
      stroke(255, 0, 0); // 設定連線顏色為紅色
      strokeWeight(2);
      let fingerRanges = [[0, 4], [5, 8], [9, 12], [13, 16], [17, 20]];
      
      for (let range of fingerRanges) {
        for (let i = range[0]; i < range[1]; i++) {
          let p1 = hand.keypoints[i];
          let p2 = hand.keypoints[i + 1];
          // 將座標映射到畫布上的影像區域
          let x1 = map(p1.x, 0, video.width, vx, vx + vWidth);
          let y1 = map(p1.y, 0, video.height, vy, vy + vHeight);
          let x2 = map(p2.x, 0, video.width, vx, vx + vWidth);
          let y2 = map(p2.y, 0, video.height, vy, vy + vHeight);
          line(x1, y1, x2, y2);
        }
      }

      // 繪製特徵點
      for (let keypoint of hand.keypoints) {
        let x = map(keypoint.x, 0, video.width, vx, vx + vWidth);
        let y = map(keypoint.y, 0, video.height, vy, vy + vHeight);
        
        fill(0, 255, 0); // 特徵點顏色：綠色
        noStroke();
        circle(x, y, 10);
      }
    }
  }

  // 更新與繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    
    // 如果水泡超出畫布上方，或是到達其隨機的破裂高度，則移除
    if (bubbles[i].isPopped()) {
      bubbles.splice(i, 1);
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

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(5, 15); // 水泡半徑
    this.speedX = random(-1, 1); // 左右微幅晃動
    this.speedY = random(-1, -3); // 往上升的速度
    this.alpha = 150; // 透明度
    this.popLimit = random(20, 100); // 往上升多少距離後破裂
    this.distanceTraveled = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.distanceTraveled += Math.abs(this.speedY);
  }

  display() {
    stroke(255, 255, 255, this.alpha);
    fill(255, 255, 255, this.alpha * 0.4);
    circle(this.x, this.y, this.r * 2);
  }

  isPopped() {
    return this.y < 0 || this.distanceTraveled > this.popLimit;
  }
}
