// src/ResourceBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const ResourceBar = ({ resources = {} }) => {

  // تحويل مفاتيح الموارد إلى lowercase للتوافق
  const normalizedResources = {
    cobalt: resources.Cobalt || resources.cobalt || 0,
    elixir: resources.Elixir || resources.elixir || 0,
    crystal: resources.Crystal || resources.crystal || 0,
  };

  const resourceKeys = ["cobalt", "elixir", "crystal"];

  const RESOURCE_CONFIG = {
    cobalt:  { color: '#4169E1', icon: 'C' },
    elixir:  { color: '#FF1493', icon: 'E' }, // 👈 تغيير اللون ليتناسب مع البيانات
    crystal: { color: '#A9A9A9', icon: 'R' }, // 👈 تغيير اللون ليتناسب مع البيانات
  };

  return (
    <View style={styles.container}>
      <View style={styles.resourceGroup}>
        {resourceKeys.map((key) => (
          <View key={key} style={styles.resourceItem}>
            <View style={[styles.resourceIcon, { backgroundColor: RESOURCE_CONFIG[key].color }]}>
              <Text style={styles.iconText}>{RESOURCE_CONFIG[key].icon}</Text>
            </View>

            <View style={styles.resourceDetails}>
              <Text style={styles.resourceName}>{capitalize(key)}</Text>

              {/* هنا رقم الموارد الصحيح بعد التطبيع */}
              <Text style={styles.resourceAmount}>
                {formatNumber(normalizedResources[key])}
              </Text>
            </View>

          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 🚨 التصحيح الأساسي لمشكلة ترتيب الطبقات (Z-index)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999, // 👈 جعل الشريط يظهر فوق كل شيء آخر بما في ذلك الخريطة
    // -----------------------------------------------------------------
    paddingHorizontal: 4,
    paddingVertical: 3,
    backgroundColor: '#383838',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
    borderBottomColor: '#1e1e1e',
    elevation: 5,
    paddingTop: 20,
  },
  resourceGroup: {
    flexDirection: 'row',
    flex: 1,
    gap: 3,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    paddingRight: 8,
    minWidth: 100,
  },
  resourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resourceDetails: {
    flexDirection: 'column',
  },
  resourceName: {
    fontSize: 10,
    color: '#ccc',
  },
  resourceAmount: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
});

export default ResourceBar;

