import type {
  ToolboxSelectItem,
  VcsUiApp,
  WindowComponentOptions,
} from '@vcmap/ui';
import { ToolboxType, WindowSlot } from '@vcmap/ui';
import { reactive, watch } from 'vue';
import { CesiumMap } from '@vcmap/core';
import type { ToolboxSelectAction } from '@vcmap/ui/src/manager/toolbox/toolboxManager';
import { name } from '../../package.json';
import { TransparentTerrainType } from '../mode/terrainMode.js';
import type TransparentTerrainManager from '../transparentTerrainManager.js';

export const transparentTerrainTypeIcon: Record<
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
  windowId: string,
  editor: WindowComponentOptions,
): () => void {
  const createCreateButton = (
    type: TransparentTerrainType,
  ): ToolboxSelectItem => ({
    name: type,
    title: `transparentTerrain.create.tooltip.${type}`,
    icon: transparentTerrainTypeIcon[type],
  });

  const action: ToolboxSelectAction = reactive({
    name: 'creation',
    currentIndex: 0,
    active: false,
    background: false,
    callback() {
      if (this.active) {
        if (this.background) {
          app.windowManager.add(
            {
              ...editor,
              id: windowId,
              parentId: 'category-manager',
              slot: WindowSlot.DYNAMIC_CHILD,
            },
            name,
          );
        } else {
          manager.stop();
        }
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
  });

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
      const index = action.tools.findIndex((t) => t.name === String(toolName));
      if (index >= 0 && action.currentIndex !== index) {
        action.currentIndex = index;
      }
    }
  });

  const listeners = [
    app.maps.mapActivated.addEventListener((map) => {
      if (!(map instanceof CesiumMap)) {
        if (app.windowManager.has(windowId)) {
          app.windowManager.remove(windowId);
        }
      }
      action.disabled = !(map instanceof CesiumMap);
    }),
    app.windowManager.added.addEventListener(({ id }) => {
      if (id === windowId) {
        action.background = false;
      }
    }),
    app.windowManager.removed.addEventListener(({ id }) => {
      if (id === windowId) {
        action.background = true;
      }
    }),
  ];

  return (): void => {
    terrainModeListener();
    listeners.forEach((cb) => {
      cb();
    });
    app.toolboxManager.remove(createId);
  };
}
