import { ToolboxSelectItem, ToolboxType, VcsUiApp } from '@vcmap/ui';
import { watch } from 'vue';
import { CesiumMap } from '@vcmap/core';
import { ToolboxSelectAction } from '@vcmap/ui/src/manager/toolbox/toolboxManager';
import { name } from '../../package.json';
import { TransparentTerrainType } from '../mode/terrainMode.js';
import TransparentTerrainManager from '../transparentTerrainManager.js';

export const TransparentTerrainTypeIcon: Record<
  TransparentTerrainType,
  string
> = {
  [TransparentTerrainType.Box]: '$vcsTerrainBox',
  [TransparentTerrainType.Rectangle]: '$vcsTransparentTerrain',
  [TransparentTerrainType.Global]: '$vcsGlobalTerrain',
};

export function addToolButtons(
  app: VcsUiApp,
  manager: TransparentTerrainManager,
): () => void {
  const createCreateButton = (
    type: TransparentTerrainType,
  ): ToolboxSelectItem => ({
    name: type,
    title: `transparentTerrain.create.tooltip.${type}`,
    icon: TransparentTerrainTypeIcon[type],
  });

  const action: ToolboxSelectAction = {
    name: 'creation',
    currentIndex: 0,
    active: false,
    callback() {
      if (this.active) {
        manager.stop();
      } else {
        manager.startNew(this.tools[this.currentIndex].name);
      }
    },
    selected(newIndex) {
      this.currentIndex = newIndex;
      manager.startNew(this.tools[this.currentIndex].name);
    },
    tools: [
      createCreateButton(TransparentTerrainType.Box),
      createCreateButton(TransparentTerrainType.Rectangle),
      createCreateButton(TransparentTerrainType.Global),
    ],
  };

  const createId = app.toolboxManager.add(
    {
      type: ToolboxType.SELECT,
      action,
    },
    name,
  ).id;

  const terrainModeListener = watch(manager.currentMode, () => {
    const currentMode = manager.currentMode.value;
    action.active = !!currentMode;
    if (action.active) {
      const toolName = currentMode!.type;
      const index = action.tools.findIndex((t) => t.name === toolName);
      if (index >= 0 && action.currentIndex !== index) {
        action.currentIndex = index;
      }
    }
  });

  const mapSwitchedListener = app.maps.mapActivated.addEventListener((map) => {
    manager.stop();
    if (!(map instanceof CesiumMap)) {
      action.disabled = true;
    } else {
      action.disabled = false;
    }
  });

  return (): void => {
    terrainModeListener();
    mapSwitchedListener();
    app.toolboxManager.remove(createId);
  };
}
