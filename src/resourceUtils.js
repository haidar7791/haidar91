// utils/resourceUtils.js
// -----------------------------------------------------------
// أدوات الموارد — إضافة/طرح — فحص توفر الموارد
// يتم التعامل مع gameState.resources
// -----------------------------------------------------------

// إضافة مورد
export function addResource(resources, type, amount) {
  resources[type] = (resources[type] || 0) + amount;
  return resources;
}

// خصم مورد
export function removeResource(resources, type, amount) {
  if (!hasEnoughResource(resources, type, amount)) return false;

  resources[type] -= amount;
  return true;
}

// فحص توفر الموارد
export function hasEnoughResource(resources, type, amount) {
  return (resources[type] || 0) >= amount;
}

// خصم عدة موارد دفعة واحدة
export function canAffordCost(resources, cost) {
  if (!cost || !cost.type) return true;
  return hasEnoughResource(resources, cost.type, cost.amount);
}

export function applyCost(resources, cost) {
  if (!canAffordCost(resources, cost)) return false;
  removeResource(resources, cost.type, cost.amount);
  return true;
}
