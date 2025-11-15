import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';

// تعريف الحالة الأولية للعبة (مكافئ لفئة Base في بايثون)
const INITIAL_STATE = {
    name: "قاعدة كونية",
    cobalt: 500,
    crystals: 100,
    buildings: { 
        "Space_Hub": 1, 
        "Cobalt_Mine": 1, 
        "Laser_Turret": 0 
    },
    max_storage: 1000,
    troops: { "Mech_Infantry": 0 },
    stellar_fuel: 5,
};

// =======================================================
// المكون الرئيسي للتطبيق
// =======================================================
export default function App() {
    const [base, setBase] = useState(INITIAL_STATE);

    // دالة مساعدة لتحديث حالة القاعدة بأمان
    const updateBase = (updates) => {
        setBase(prevBase => ({
            ...prevBase, 
            ...updates, 
        }));
    };

    // ----------------------------------------------------
    // 1. جمع الموارد (Collect Resources)
    // ----------------------------------------------------
    const collectResources = () => {
        const minesCount = base.buildings["Cobalt_Mine"] || 0;
        let cobaltGain = minesCount * 100;

        let newCobalt = base.cobalt + cobaltGain;
        
        // تطبيق الحد الأقصى للتخزين
        if (newCobalt > base.max_storage) {
            cobaltGain = base.max_storage - base.cobalt; // ما تم جمعه فعليًا
            newCobalt = base.max_storage;
        }

        updateBase({ cobalt: newCobalt });
        Alert.alert("💰 جمع الموارد", `تم جمع +${cobaltGain} كوبالت تلقائيًا.`);
    };

    // ----------------------------------------------------
    // 2. بناء منجم كوبالت (Build Mine)
    // ----------------------------------------------------
    const buildMine = () => {
        const costCobalt = 200;
        const costCrystals = 50;

        if (base.cobalt >= costCobalt && base.crystals >= costCrystals) {
            const newMines = (base.buildings["Cobalt_Mine"] || 0) + 1;
            
            updateBase({
                cobalt: base.cobalt - costCobalt,
                crystals: base.crystals - costCrystals,
                max_storage: base.max_storage + 500,
                buildings: {
                    ...base.buildings,
                    "Cobalt_Mine": newMines,
                }
            });
            Alert.alert("✅ نجاح", `تم بناء منجم كوبالت جديد! إجمالي المناجم: ${newMines}`);
        } else {
            Alert.alert("❌ خطأ", `لا تملك الموارد الكافية.\nالمطلوب: كوبالت: ${costCobalt}، بلورات: ${costCrystals}`);
        }
    };

    // ----------------------------------------------------
    // 3. بناء برج دفاعي (Build Defense)
    // ----------------------------------------------------
    const buildDefense = () => {
        const costCobalt = 400;
        const costCrystals = 150;
        const costFuel = 1;

        if (base.cobalt >= costCobalt && base.crystals >= costCrystals && base.stellar_fuel >= costFuel) {
            const newTurrets = (base.buildings["Laser_Turret"] || 0) + 1;

            updateBase({
                cobalt: base.cobalt - costCobalt,
                crystals: base.crystals - costCrystals,
                stellar_fuel: base.stellar_fuel - costFuel,
                buildings: {
                    ...base.buildings,
                    "Laser_Turret": newTurrets,
                }
            });
            Alert.alert("✅ نجاح", `تم بناء برج ليزر جديد! إجمالي الأبراج: ${newTurrets}`);
        } else {
            Alert.alert("❌ خطأ", `موارد غير كافية.\nالمطلوب: كوبالت: ${costCobalt}، بلورات: ${costCrystals}، وقود نجمي: ${costFuel}`);
        }
    };

    // ----------------------------------------------------
    // 4. تدريب القوات (Train Troops)
    // ----------------------------------------------------
    const trainTroops = (trainCount) => {
        const costCrystals = 10;
        const totalCost = trainCount * costCrystals;
        
        if (base.crystals >= totalCost && trainCount > 0) {
            const newTroops = (base.troops["Mech_Infantry"] || 0) + trainCount;
            
            updateBase({
                crystals: base.crystals - totalCost,
                troops: {
                    ...base.troops,
                    "Mech_Infantry": newTroops,
                }
            });
            Alert.alert("✅ نجاح", `تم تدريب ${trainCount} من المشاة الآلية بنجاح!`);
        } else {
            Alert.alert("❌ خطأ", "موارد غير كافية أو عدد غير صحيح للتدريب.");
        }
    };

    // ----------------------------------------------------
    // 5. شن هجوم (Attack Enemy)
    // ----------------------------------------------------
    const attackEnemy = () => {
        if (base.troops["Mech_Infantry"] === 0) {
            Alert.alert("❌ خطأ", "لا توجد لديك قوات متاحة للهجوم. قم بالتدريب أولاً.");
            return;
        }

        const enemyPower = 5;
        const defenseBonus = (base.buildings["Laser_Turret"] || 0) * 3;
        const actualEnemyPower = enemyPower + defenseBonus; 
        
        const playerPower = base.troops["Mech_Infantry"] * 1; 

        if (playerPower > actualEnemyPower) {
            const gainedCobalt = playerPower * 10;
            const gainedCrystals = playerPower * 2;
            
            const troopsLost = Math.floor(base.troops["Mech_Infantry"] * 0.2); 
            const newTroops = base.troops["Mech_Infantry"] - troopsLost;
            
            let newCobalt = base.cobalt + gainedCobalt;
            let newCrystals = base.crystals + gainedCrystals;

            updateBase({
                cobalt: Math.min(newCobalt, base.max_storage), // لا تتجاوز الحد الأقصى
                crystals: newCrystals,
                troops: {
                    ...base.troops,
                    "Mech_Infantry": newTroops,
                }
            });
            Alert.alert("🎉 انتصار ساحق!", `كسبت ${gainedCobalt} كوبالت و ${gainedCrystals} بلورات.\nلكن خسرت ${troopsLost} من المشاة الآلية في المعركة.`);
        } else {
            const troopsLost = base.troops["Mech_Infantry"];
            
            updateBase({
                 troops: { ...base.troops, "Mech_Infantry": 0 }
            });
            Alert.alert("😔 هزيمة قاسية", `خسرت جميع قواتك (${troopsLost} وحدة) ولم تكسب موارد.`);
        }
    };
    
    // ----------------------------------------------------
    // 6. عرض الواجهة الرسومية (The Rendered GUI)
    // ----------------------------------------------------
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>🚀 حالة القلعة الكونية: {base.name}</Text>
            
            {/* --- حالة الموارد --- */}
            <View style={styles.section}>
                <Text style={styles.subheader}>الموارد الرئيسية</Text>
                <Text style={styles.statusText}>الكوبالت: {base.cobalt}/{base.max_storage}</Text>
                <Text style={styles.statusText}>البلورات: {base.crystals}</Text>
                <Text style={styles.statusText}>الوقود النجمي: {base.stellar_fuel}</Text>
            </View>

            {/* --- حالة المباني والقوات --- */}
            <View style={styles.section}>
                <Text style={styles.subheader}>المباني</Text>
                {Object.entries(base.buildings).map(([building, count]) => (
                    <Text key={building} style={styles.itemText}>- {building}: العدد {count}</Text>
                ))}
                
                <Text style={styles.subheader}>القوات</Text>
                {Object.entries(base.troops).map(([troop, count]) => (
                    <Text key={troop} style={styles.itemText}>- {troop}: العدد {count}</Text>
                ))}
            </View>
            
            {/* --- الأوامر والأزرار --- */}
            <View style={styles.section}>
                <Text style={styles.subheader}>قائمة الأوامر</Text>
                
                <View style={styles.buttonContainer}>
                    <Button title="✅ اجمع الموارد" onPress={collectResources} />
                </View>

                <View style={styles.buttonContainer}>
                    <Button title="1. بناء منجم كوبالت (200 كوبالت، 50 بلورة)" onPress={buildMine} />
                </View>

                <View style={styles.buttonContainer}>
                    <Button title="2. بناء برج ليزر دفاعي (400 كوبالت، 150 بلورة، 1 وقود)" onPress={buildDefense} />
                </View>
                
                <View style={styles.buttonContainer}>
                    {/* هنا نحتاج إلى إدخال رقم، لكن لتبسيط الأمر، سنضع قيمة ثابتة مؤقتة */}
                    <Button title="3. تدريب 5 مشاة آلية (50 بلورة)" onPress={() => trainTroops(5)} /> 
                </View>

                <View style={styles.buttonContainer}>
                    <Button title="4. شن هجوم (مخاطرة!)" onPress={attackEnemy} color="#ff4444" />
                </View>
            </View>
        </ScrollView>
    );
}

// =======================================================
// التصميم (Styles)
// =======================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 15,
        backgroundColor: '#1c1c1e', // خلفية داكنة
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
    },
    section: {
        backgroundColor: '#2c2c2e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8f8f94',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 24,
    },
    itemText: {
        fontSize: 14,
        color: '#d1d1d6',
        lineHeight: 22,
    },
    buttonContainer: {
        marginVertical: 5,
    },
});

