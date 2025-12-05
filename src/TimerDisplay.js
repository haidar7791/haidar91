// TimerDisplay.js
// مخصص لعرض وإدارة مؤقتات البناء/الترقية/الإنتاج في لعبة استراتيجية

import { useEffect, useState } from "react";
import { Text } from "react-native";

/**
 * props:
 *  - duration: مدة المؤقت بالثواني
 *  - onFinish: دالة تُستدعى عند انتهاء المؤقت
 *  - style: ستايل النص
 *  - autoStart: تشغيل تلقائي؟ (true/false)
 */
export default function TimerDisplay({
  duration = 0,
  onFinish = () => {},
  style = {},
  autoStart = true,
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(autoStart);

  useEffect(() => {
    let timer = null;

    if (running && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, timeLeft]);

  // تحويل الوقت إلى صيغة (ساعات:دقائق:ثواني)
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return (
      (h > 0 ? (h < 10 ? `0${h}` : h) + ":" : "") +
      (m < 10 ? `0${m}` : m) + ":" +
      (s < 10 ? `0${s}` : s)
    );
  };

  return (
    <Text style={[{ fontSize: 14, fontWeight: "bold", color: "#fff" }, style]}>
      {timeLeft > 0 ? formatTime(timeLeft) : "00:00"}
    </Text>
  );
}
