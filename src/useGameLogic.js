// src/useGameLogic.js
import { useState, useEffect, useCallback, useRef } from "react";
import { BUILDINGS } from "./BuildingData";
import * as gameState from "./gameState";
import BuildingClass from "./Building";

/**
 * useGameLogic - manages game state, builders, build/upgrade timers, production,
 * prevents overlapping placement, tap/long-press handled in UI layer.
 *
 * Notes:
 * - Use Date.now() (ms) consistently for timers so UI showing remaining time works.
 * - BUILDINGS.levels[].buildTime is expected in seconds -> converted to ms when used.
 * - Production pauses for any building that is currently isBuilding or isUpgrading.
 */

// compute total builders from existing Builder_Hut buildings
const ensureBuildersFromBuildings = (buildings) => {
  let total = 0;
  (buildings || []).forEach((b) => {
    if (b.type === "Builder_Hut") {
      const lev = BUILDINGS.Builder_Hut?.levels?.[b.level] || {};
      total += Number(lev.addsBuilder || 0);
    }
  });
  // default to at least 1 builder for new accounts (matching initial state)
  return Math.max(1, total);
};

// helper: check affordability (cost may be {type, amount} or map {Cobalt:100,...})
const canAfford = (resources = {}, cost) => {
  if (!cost) return false;
  if (cost.type && cost.amount !== undefined) {
    return (resources[cost.type] || 0) >= cost.amount;
  }
  if (typeof cost === "object") {
    return Object.entries(cost).every(([res, amt]) => (resources[res] || 0) >= amt);
  }
  return false;
};

// deduct cost (returns new resources object)
const deductCost = (resources = {}, cost) => {
  const r = { ...(resources || {}) };
  if (!cost) return r;
  if (cost.type && cost.amount !== undefined) {
    r[cost.type] = (r[cost.type] || 0) - cost.amount;
  } else if (typeof cost === "object") {
    Object.entries(cost).forEach(([res, amt]) => {
      r[res] = (r[res] || 0) - amt;
    });
  }
  return r;
};

// helper: compute occupied tiles for a building (x,y,size) — returns array of [tx,ty]
const occupiedTiles = (x, y, size) => {
  // treat size as number of tiles (may be float) -> round up to nearest integer for occupancy
  const s = Math.max(1, Math.round(size));
  const tiles = [];
  for (let ox = 0; ox < s; ox++) {
    for (let oy = 0; oy < s; oy++) {
      tiles.push([Math.floor(x) + ox, Math.floor(y) + oy]);
    }
  }
  return tiles;
};

// check overlap with existing buildings
const overlapsExisting = (buildings = [], x, y, size) => {
  const newTiles = occupiedTiles(x, y, size).map((t) => `${t[0]}_${t[1]}`);
  for (const b of buildings) {
    const bData = BUILDINGS[b.type];
    const bSize = bData?.size || 1;
    const bTiles = occupiedTiles(b.x, b.y, bSize).map((t) => `${t[0]}_${t[1]}`);
    for (const t of bTiles) {
      if (newTiles.includes(t)) return true;
    }
  }
  return false;
};

const useGameLogic = (initialSavedState) => {
  // use provided saved state or default
  const [currentGameState, setGameState] = useState(initialSavedState || gameState.getInitialState());

  // Ensure builders counts exist & are consistent on load
  useEffect(() => {
    setGameState((prev) => {
      const buildings = prev.buildings || [];
      const total = prev.totalBuilders !== undefined ? prev.totalBuilders : ensureBuildersFromBuildings(buildings);
      const busy = buildings.reduce((acc, b) => acc + ((b.isBuilding || b.isUpgrading) ? 1 : 0), 0);
      const available = Math.max(0, total - busy);
      if (prev.totalBuilders === total && prev.availableBuilders === available) return prev;
      const updated = { ...prev, totalBuilders: total, availableBuilders: available };
      gameState.saveGameState(updated);
      return updated;
    });
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastUpdate = useRef(Date.now());

  // Main periodic update: production + finish build/upgrade + restore builders
  const updateGame = useCallback(() => {
    setGameState((prev) => {
      const now = Date.now();
      const dt = now - (lastUpdate.current || now);
      if (dt <= 0) {
        lastUpdate.current = now;
        return prev;
      }
      lastUpdate.current = now;

      let newResources = { ...(prev.resources || {}) };
      let buildings = (prev.buildings || []).map((b) => ({ ...b }));

      // PRODUCTION: accumulate production for buildings that are NOT building/upgrading
      try {
        for (const b of buildings) {
          if (b.isBuilding || b.isUpgrading) continue; // no production while building/upgrading
          const bData = BUILDINGS[b.type];
          const levInfo = bData?.levels?.[b.level] || {};
          const production = levInfo.production || levInfo.productionPerSecond || null;
          if (!production) continue;
          // production assumed per second
          for (const [res, rate] of Object.entries(production)) {
            const gain = (rate * dt) / 1000; // rate * secondsElapsed
            newResources[res] = (newResources[res] || 0) + Math.floor(gain);
          }
        }
      } catch (e) {
        // ignore production errors
      }

      // finish build/upgrade
      let changed = false;
      // recompute totals based on existing huts (defensive)
      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(buildings);
      let busyCount = buildings.reduce((acc, b) => acc + ((b.isBuilding || b.isUpgrading) ? 1 : 0), 0);
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);

      buildings = buildings.map((b) => {
        const out = { ...b };

        // finish upgrade?
        if (out.isUpgrading && out.upgradeFinishTime !== null && out.upgradeFinishTime <= now) {
          out.level = (out.level || 0) + 1;
          out.isUpgrading = false;
          out.upgradeStartTime = null;
          out.upgradeFinishTime = null;

          // free builder
          availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
          changed = true;

          // if new level adds builder, update totals
          const levelInfo = BUILDINGS[out.type]?.levels?.[out.level];
          if (levelInfo && levelInfo.addsBuilder) {
            const adds = Number(levelInfo.addsBuilder) || 0;
            if (adds > 0) {
              totalBuilders += adds;
              availableBuilders += adds;
            }
          }
        }

        // finish building?
        if (out.isBuilding && out.buildFinishTime !== null && out.buildFinishTime <= now) {
          out.isBuilding = false;
          out.buildStartTime = null;
          out.buildFinishTime = null;

          // free builder
          availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
          changed = true;

          // if this is a finished Builder_Hut — increase builder counts
          if (out.type === "Builder_Hut") {
            const levelInfo = BUILDINGS.Builder_Hut?.levels?.[out.level];
            if (levelInfo && levelInfo.addsBuilder) {
              const adds = Number(levelInfo.addsBuilder) || 0;
              if (adds > 0) {
                totalBuilders += adds;
                availableBuilders += adds;
              }
            }
          }
        }

        return out;
      });

      const newState = {
        ...prev,
        resources: newResources,
        buildings,
        totalBuilders,
        availableBuilders,
        lastUpdateTime: now,
      };

      // save only when something changed or periodically
      if (changed || dt > 300000) {
        gameState.saveGameState(newState);
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(updateGame, 1000);
    return () => clearInterval(id);
  }, [updateGame]);

  // --- addBuilding: checks collisions, cost, builders, sets build timers
  const addBuilding = useCallback((type, x, y) => {
    const buildingData = BUILDINGS[type];
    if (!buildingData) {
      console.error(`[addBuilding] unknown type ${type}`);
      return;
    }
    setGameState((prev) => {
      const nextLevel = 1;
      const lvlInfo = buildingData.levels?.[nextLevel] || {};
      const cost = lvlInfo.cost || null;

      // affordability
      if (!canAfford(prev.resources || {}, cost)) {
        console.warn("[addBuilding] Cannot afford or cost missing");
        return prev;
      }

      // collision check
      const size = buildingData.size || 1;
      if (overlapsExisting(prev.buildings || [], x, y, size)) {
        console.warn("[addBuilding] Cannot place building: overlaps existing");
        return prev;
      }

      // build time (seconds -> ms)
      const buildSec = lvlInfo.buildTime || 0;
      const buildMs = Math.max(0, buildSec * 1000);

      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(prev.buildings || []);
      let busyCount = (prev.buildings || []).filter((b) => b.isBuilding || b.isUpgrading).length;
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);

      if (buildMs > 0 && availableBuilders <= 0) {
        console.warn("[addBuilding] All builders are busy! Cannot add building.");
        return prev;
      }

      // deduct resources
      const newResources = deductCost(prev.resources || {}, cost);

      const id = `b_${Date.now()}_${Math.floor(Math.random() * 999)}`;
      const newB = new BuildingClass(id, type, nextLevel, x, y);

      if (buildMs > 0) {
        newB.isBuilding = true;
        newB.buildStartTime = Date.now();
        newB.buildFinishTime = newB.buildStartTime + buildMs;
        availableBuilders = Math.max(0, availableBuilders - 1);
      } else {
        // immediate effect (e.g., level1 builder hut adds builder)
        if (lvlInfo.addsBuilder) {
          const adds = Number(lvlInfo.addsBuilder) || 0;
          if (adds > 0) {
            totalBuilders = (totalBuilders || 0) + adds;
            availableBuilders = (availableBuilders || 0) + adds;
          }
        }
      }

      const newState = {
        ...prev,
        resources: newResources,
        buildings: [...(prev.buildings || []), newB],
        totalBuilders,
        availableBuilders,
      };

      gameState.saveGameState(newState);
      return newState;
    });
  }, []);

  // --- startUpgrade: cost check, builder check, set upgrade timers
  // onUpgrade expects (buildingId, durationMs, costObj)
  const startUpgrade = useCallback((buildingId, durationMs, cost) => {
    setGameState((prev) => {
      const idx = (prev.buildings || []).findIndex((b) => b.id === buildingId);
      if (idx === -1) return prev;

      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(prev.buildings || []);
      let busyCount = (prev.buildings || []).filter((b) => b.isBuilding || b.isUpgrading).length;
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);

      if (availableBuilders <= 0) {
        console.warn("[startUpgrade] All builders are busy! Cannot start upgrade.");
        return prev;
      }

      if (!canAfford(prev.resources || {}, cost)) {
        console.warn("[startUpgrade] Cannot afford upgrade");
        return prev;
      }

      const newResources = deductCost(prev.resources || {}, cost);
      const buildings = (prev.buildings || []).map((b) => ({ ...b }));
      buildings[idx].isUpgrading = true;
      buildings[idx].upgradeStartTime = Date.now();
      buildings[idx].upgradeFinishTime = buildings[idx].upgradeStartTime + (durationMs || 0);

      availableBuilders = Math.max(0, availableBuilders - 1);

      const newState = {
        ...prev,
        resources: newResources,
        buildings,
        totalBuilders,
        availableBuilders,
      };

      gameState.saveGameState(newState);
      return newState;
    });
  }, []);

  // --- moveBuilding: just updates coords (collision check included)
  const moveBuilding = useCallback(({ id, newX, newY, oldX, oldY }) => {
    setGameState((prev) => {
      // prevent moving on top of another building (excluding the same building)
      const bIndex = (prev.buildings || []).findIndex((b) => b.id === id);
      if (bIndex === -1) return prev;
      const moving = prev.buildings[bIndex];
      const size = BUILDINGS[moving.type]?.size || 1;
      // check overlap excluding moving building
      const other = (prev.buildings || []).filter((b) => b.id !== id);
      if (overlapsExisting(other, newX, newY, size)) {
        console.warn("[moveBuilding] cannot place here, overlaps existing");
        // reject move
        return prev;
      }

      const newBuildings = (prev.buildings || []).map((b) => (b.id === id ? { ...b, x: newX, y: newY } : b));
      const updated = { ...prev, buildings: newBuildings };
      gameState.saveGameState(updated);
      return updated;
    });
  }, []);

  // --- collectResources
  const collectResources = useCallback((collected) => {
    setGameState((prev) => {
      const newResources = { ...(prev.resources || {}) };
      Object.entries(collected || {}).forEach(([k, v]) => {
        newResources[k] = (newResources[k] || 0) + v;
      });
      const updated = { ...prev, resources: newResources };
      gameState.saveGameState(updated);
      return updated;
    });
  }, []);

  return {
    gameState: currentGameState,
    addBuilding,
    startUpgrade,
    moveBuilding,
    collectResources,
  };
};

export default useGameLogic;
