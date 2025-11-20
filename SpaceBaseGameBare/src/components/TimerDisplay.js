// ui/TimerDisplay.js

import { formatTime } from "../utils/TimeUtils.js";

export default class TimerDisplay {
  constructor(scene, x, y, totalSeconds) {
    this.scene = scene;
    this.remaining = totalSeconds; // الوقت المتبقي بالثواني

    // نص المؤقت
    this.text = scene.add.text(x, y, formatTime(this.remaining), {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#ffdd55",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // تحديث كل ثانية
    this.timerEvent = scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  updateTimer() {
    if (this.remaining > 0) {
      this.remaining--;
      this.text.setText(formatTime(this.remaining));
    } else {
      this.stop();
      this.text.setText("Done!");
      this.text.setColor("#00ff00");

      // حدث الانتهاء في حال تريد تُعلم الأب
      if (this.onFinish) this.onFinish();
    }
  }

  // إيقاف المؤقت
  stop() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }

  // تغيير الوقت المتبقي (مثلاً بعد Boost)
  setTime(seconds) {
    this.remaining = seconds;
    this.text.setText(formatTime(this.remaining));
  }

  // عند انتهاء العد
  setOnFinish(callback) {
    this.onFinish = callback;
  }

  // إرجاع الـ display
  getView() {
    return this.text;
  }
}
