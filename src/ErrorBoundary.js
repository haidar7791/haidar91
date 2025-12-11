// src/ErrorBoundary.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // تحديث الحالة لعرض واجهة الخطأ
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // يمكنك تسجيل الخطأ هنا
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('❌ خطأ في التطبيق:', error);
    console.error('🔍 معلومات الخطأ:', errorInfo.componentStack);
  }

  handleRetry = () => {
    // إعادة تعيين الحالة والمحاولة مرة أخرى
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReport = () => {
    // يمكنك إضافة منطق لإرسال تقرير الخطأ هنا
    console.log('📤 إرسال تقرير الخطأ...');
    alert('شكراً للإبلاغ! سيتم إصلاح المشكلة قريباً.');
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          {/* رأس الخطأ */}
          <View style={styles.header}>
            <Ionicons name="warning" size={60} color="#FF6B6B" />
            <Text style={styles.title}>عذراً! حدث خطأ</Text>
            <Text style={styles.subtitle}>تطبيق Space Base</Text>
          </View>

          {/* رسالة الخطأ */}
          <ScrollView style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>تفاصيل الخطأ:</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.toString() || 'خطأ غير معروف'}
              </Text>
              
              {this.state.errorInfo && (
                <View style={styles.stackContainer}>
                  <Text style={styles.stackTitle}>مسار التنفيذ:</Text>
                  <Text style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </View>
              )}
            </View>

            {/* خطوات الحل */}
            <View style={styles.solutionCard}>
              <Text style={styles.solutionTitle}>يمكنك تجربة:</Text>
              
              <View style={styles.solutionStep}>
                <Ionicons name="refresh-circle" size={20} color="#4ECDC4" />
                <Text style={styles.solutionText}>1. إعادة تشغيل التطبيق</Text>
              </View>
              
              <View style={styles.solutionStep}>
                <Ionicons name="phone-portrait" size={20} color="#45B7D1" />
                <Text style={styles.solutionText}>2. إعادة تشغيل الجهاز</Text>
              </View>
              
              <View style={styles.solutionStep}>
                <Ionicons name="download" size={20} color="#96CEB4" />
                <Text style={styles.solutionText}>3. تحديث التطبيق</Text>
              </View>
            </View>
          </ScrollView>

          {/* أزرار الإجراء */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]}
              onPress={this.handleRetry}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.reportButton]}
              onPress={this.handleReport}
            >
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.buttonText}>الإبلاغ عن الخطأ</Text>
            </TouchableOpacity>
          </View>

          {/* تذييل */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Space Base © 2024 • الإصدار 1.0.0
            </Text>
            <Text style={styles.footerText}>
              إذا استمر الخطأ، يرجى الاتصال بالدعم
            </Text>
          </View>
        </View>
      );
    }

    // إذا لم يكن هناك خطأ، اعرض المكونات العادية
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1929',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#BDBDBD',
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    marginBottom: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FFD8D8',
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  stackContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 5,
  },
  stackTrace: {
    fontSize: 10,
    color: '#BDBDBD',
    fontFamily: 'monospace',
  },
  solutionCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 15,
  },
  solutionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  reportButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 3,
  },
});
