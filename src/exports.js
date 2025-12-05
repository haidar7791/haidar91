// src/exports.js
// ملف مركزي شامل لإدارة الاستيراد والتصدير لجميع مكونات التطبيق ومنطقه.
// هذا الملف يضمن أن جميع الملفات الـ 32 موصولة ببعضها البعض.

// ====================================================================
// 1. البيانات والثوابت (Data & Constants)
// ====================================================================
// افتراض: RESOURCE_TYPES و SOUNDS و BUILDINGS موجودة في BuildingData.js
import { RESOURCE_TYPES } from './ResourceConstants';
import { BUILDINGS } from './BuildingData';
import { SOUNDS } from '../App'; 
import { TROOPS_DATA } from './TroopsData';      // بيانات الوحدات
import { MAP_TILES_X, MAP_TILES_Y } from './MapConfig'; // إعدادات الخريطة

// ====================================================================
// 2. الشاشات (Screens)
// ====================================================================
import App from '../App';
import GameScreen from './GameScreen';
import Map from './Map';
import LoadingScreen from './LoadingScreen';
import BattleScreen from './BattleScreen';

// ====================================================================
// 3. المكونات وواجهة المستخدم (Components/UI)
// ====================================================================
import ResourceBar from './ResourceBar';
import ShopBar from './ShopBar';
import ShopButton from './ShopButton';
import ShopItem from './ShopItem';
import BuildingInfoPanel from './BuildingInfoPanel'; // موجود في المجلد الحالي src/
import TroopTrainingPanel from './TroopTrainingPanel';
import TimerDisplay from './TimerDisplay';
import UpgradePopup from './UpgradePopup';
import TroopItem from './TroopItem';
import BuildingPlacement from './BuildingPlacement';

// ====================================================================
// 4. الكيانات والعناصر الأساسية (Entities & Core Objects)
// ====================================================================
import Building from './Building';
import Troop from './Troop';
import MovableBuilding from './MovableBuilding';
import Camera from './Camera';
import BuildingTimer from './BuildingTimer';


// ====================================================================
// 5. الدوال المساعدة ومنطق اللعبة (Utilities & Logic)
// ====================================================================
import * as TimeUtils from './TimeUtils';             // دوال الوقت (افتراض: يتم تصديرها كـ * as)
import useGameLogic from './useGameLogic';          // منطق اللعبة الرئيسي (Hook)
// 🛑🛑🛑 التصحيح هنا: نستورد التصدير الافتراضي (Default) باسم BuildingsManager
import BuildingsManager from './buildingsManager';  
// تم التعليق على السطر القديم: // import * as buildingsManager from './buildingsManager'; // إدارة المباني
import * as collisionUtils from './collisionUtils';   // أدوات الكشف عن التصادم
import * as gameState from './gameState';             // حالة اللعبة المركزية
import * as placementUtils from './placementUtils';   // أدوات تحديد المواقع
import * as resourceUtils from './resourceUtils';     // إدارة الموارد
import * as storage from './storage';                 // حفظ وتحميل اللعبة
import * as troopsManager from './troopsManager';     // إدارة الوحدات


// ====================================================================
// تصدير كل شيء مركزيًا
// ====================================================================
export {
    // البيانات والثوابت
    BUILDINGS,
    RESOURCE_TYPES, // **تم ربطها هنا لحل خطأ COBALT**
    SOUNDS,
    TROOPS_DATA,
    MAP_TILES_X,
    MAP_TILES_Y,

    // الشاشات
    App,
    GameScreen,
    Map,
    LoadingScreen,
    BattleScreen,

    // المكونات
    ResourceBar,
    ShopBar,
    ShopButton,
    ShopItem,
    BuildingInfoPanel,
    TroopTrainingPanel,
    TimerDisplay,
    UpgradePopup,
    TroopItem,
    BuildingPlacement,

    // الكيانات
    Building,
    Troop,
    MovableBuilding,
    Camera,
    BuildingTimer,

    // الدوال المساعدة والمنطق
    TimeUtils,
    useGameLogic,
    
    // 🛑🛑🛑 هذا هو التعديل الضروري: إعادة تصدير الكائن الافتراضي تحت الاسم المطلوب (buildingsManager)
    BuildingsManager as buildingsManager, 
    
    collisionUtils,
    gameState,
    placementUtils,
    resourceUtils,
    storage,
    troopsManager,
};
