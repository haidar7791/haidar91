//src/TimeUtils.js

// تحويل ثواني إلى صيغة hh:mm:ss
export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0")
  ].join(":");
}

// إعطاء الوقت الحالي كـ Timestamp
export function now() {
  return Math.floor(Date.now() / 1000);
}

// حساب الوقت المتبقي بناءً على وقت البدء والمدة
export function timeRemaining(startTimestamp, durationSeconds) {
  const endTime = startTimestamp + durationSeconds;
  const remaining = endTime - now();
  return remaining > 0 ? remaining : 0;
}

// التحقق إذا انتهى المؤقت
export function isFinished(startTimestamp, durationSeconds) {
  return timeRemaining(startTimestamp, durationSeconds) === 0;
}
