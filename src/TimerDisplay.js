// src/TimerDisplay.js - الإصدار المعدل
import { useEffect, useState, useRef } from "react";
import { Text } from "react-native";

/**
 * TimerDisplay - يعرض مؤقت عكسي مع تحديثات خارجية
 * 
 * المشكلة القديمة: كان يعتمد على duration أولي فقط ولا يتلقى تحديثات
 * الحل: استخدام useRef لتتبع duration الخارجي وتحديث timeLeft
 * 
 * @param {number} duration - المدة المتبقية بالثواني (تتغير من الخارج)
 * @param {function} onFinish - دالة تُستدعى عند انتهاء المؤقت
 * @param {object} style - ستايل إضافي للنص
 * @param {boolean} autoStart - بدء العد تلقائياً
 * @param {string} showIcon - أيقونة تعرض قبل الوقت
 */
export default function TimerDisplay({
  duration = 0,
  onFinish = () => {},
  style = {},
  autoStart = true,
  showIcon = null,
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const durationRef = useRef(duration);
  const lastUpdateRef = useRef(Date.now());
  const intervalRef = useRef(null);

  // ✅ تحديث durationRef عندما يتغير duration من الخارج
  useEffect(() => {
    durationRef.current = duration;
    
    // إذا كان المؤقت متوقفاً أو انتهى، نبدأ من القيمة الجديدة
    if (!isRunning || timeLeft <= 0) {
      setTimeLeft(duration);
    }
  }, [duration]);

  // ✅ إدارة المؤقت
  useEffect(() => {
    // تنظيف أي مؤقت سابق
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning && timeLeft > 0) {
      lastUpdateRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastUpdateRef.current) / 1000);
        
        if (elapsedSeconds >= 1) {
          lastUpdateRef.current = now;
          
          setTimeLeft(prev => {
            const newTime = prev - elapsedSeconds;
            
            if (newTime <= 0) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              setIsRunning(false);
              onFinish();
              return 0;
            }
            
            return newTime;
          });
        }
      }, 200); // تحديث كل 200ms بدلاً من 1000ms لدقة أعلى
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, onFinish]);

  // ✅ بدء/إيقاف المؤقت
  const startTimer = () => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
      lastUpdateRef.current = Date.now();
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ✅ تحديث timeLeft مباشرة من الخارج
  useEffect(() => {
    // إذا تغير duration خارجياً وكان الفرق كبيراً، تحديث timeLeft
    if (Math.abs(duration - timeLeft) > 2) {
      setTimeLeft(duration);
      lastUpdateRef.current = Date.now();
    }
  }, [duration]);

  // ✅ تحويل الوقت إلى صيغة مقروءة
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // ✅ الحصول على لون المؤقت بناءً على الوقت المتبقي
  const getTimerColor = () => {
    if (timeLeft <= 10) return "#ff4757"; // أحمر للوقت القليل
    if (timeLeft <= 30) return "#ffa502"; // برتقالي
    if (timeLeft <= 60) return "#f1c40f"; // أصفر
    return "#2ed573"; // أخضر للوقت الكافي
  };

  // ✅ الحصول على حجم النص بناءً على الوقت
  const getFontSize = () => {
    if (timeLeft >= 3600) return 12; // ساعات
    if (timeLeft >= 600) return 14; // دقائق كثيرة
    return 16; // دقائق قليلة أو ثواني
  };

  return (
    <Text 
      style={[
        { 
          fontSize: getFontSize(),
          fontWeight: "800",
          color: getTimerColor(),
          fontFamily: "monospace",
          textAlign: 'center',
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }, 
        style
      ]}
      onPress={startTimer} // ✅ النقر لبدء المؤقت إذا توقف
      onLongPress={stopTimer} // ✅ الضغط الطويل لإيقاف المؤقت
    >
      {showIcon && `${showIcon} `}
      {formatTime(timeLeft)}
    </Text>
  );
}
