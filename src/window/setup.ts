import { watch } from 'vue';
import type {
  CollectionComponentClass,
  VcsUiApp,
  WindowComponentOptions,
  WindowState,
} from '@vcmap/ui';
import {
  createListExportAction,
  createListImportAction,
  makeEditorCollectionComponentClass,
  WindowSlot,
} from '@vcmap/ui';
import type { Category } from '@vcmap/core';
import { name } from '../../package.json';
import terrainWindow from './TerrainWindow.vue';
import { transparentTerrainTypeIcon } from '../util/toolbox.js';
import {
  createExportCallback,
  createImportCallback,
} from '../util/actionHelper.js';
import type TransparentTerrainManager from '../transparentTerrainManager.js';
import type { TransparentTerrainItem } from '../category/transparentTerrainCategory.js';

export default function setupTerrainWindow(
  app: VcsUiApp,
  manager: TransparentTerrainManager,
  collectionComponent: CollectionComponentClass<TransparentTerrainItem>,
  category: Category<TransparentTerrainItem>,
): { destroy: () => void; windowId: string; editor: WindowComponentOptions } {
  const windowId = `${collectionComponent.id}-editor`;

  const state: Partial<WindowState> = {
    headerTitle: 'transparentTerrain.header.title',
    styles: { height: 'auto' },
    infoUrlCallback: app.getHelpUrlCallback(
      'tools/transparentTerrainTool.html',
    ),
  };

  const editor: WindowComponentOptions = {
    component: terrainWindow,
    provides: {
      manager,
      category,
      collectionComponent,
    },
    state,
  };

  const editorCollectionComponent = makeEditorCollectionComponentClass(
    app,
    collectionComponent,
    {
      editor: (item: TransparentTerrainItem) => ({
        ...editor,
        props: {
          itemName: item.name,
        },
      }),
    },
  );

  const { action: importAction, destroy: destroyImportAction } =
    createListImportAction(
      (files) => createImportCallback(app, manager, category, files),
      app.windowManager,
      name,
      'category-manager',
    );

  const { action: exportAction, destroy: destroyExportAction } =
    createListExportAction(
      collectionComponent.selection,
      () => {
        createExportCallback(collectionComponent);
      },
      name,
    );

  editorCollectionComponent.addActions([importAction, exportAction]);

  let renameListener = (): void => {};
  function setHeader(): void {
    const currentMode = manager.currentMode.value;
    if (currentMode) {
      renameListener();
      renameListener = watch(currentMode.name, () => {
        state.headerTitle = currentMode.name.value;
      });
      state.headerTitle = currentMode.name.value
        ? currentMode.name.value
        : `transparentTerrain.create.title.${currentMode.type}`;
      state.headerIcon = transparentTerrainTypeIcon[currentMode.type!];
    }
  }

  const terrainModeListener = watch(manager.currentMode, () => {
    if (app.windowManager.has(windowId)) {
      app.windowManager.remove(windowId);
    }
    const currentMode = manager.currentMode.value;
    if (currentMode) {
      setHeader();
      if (!currentMode.isPersistent.value) {
        setTimeout(() => {
          app.windowManager.add(
            {
              ...editor,
              id: windowId,
              parentId: 'category-manager',
              slot: WindowSlot.DYNAMIC_CHILD,
            },
            name,
          );
        }, 1);
      }
    } else {
      collectionComponent.selection.value = [];
    }
  });

  const selectionChangedListener = watch(collectionComponent.selection, () => {
    if (collectionComponent.selection.value.length === 0) {
      manager.stop();
    } else if (collectionComponent.selection.value.length === 1) {
      manager.start(
        collectionComponent.collection.getByKey(
          collectionComponent.selection.value[0].name,
        )?.mode,
      );
    } else {
      manager.currentMode.value?.deactivate();
    }
  });

  return {
    destroy: (): void => {
      terrainModeListener();
      selectionChangedListener();
      renameListener();
      destroyImportAction();
      destroyExportAction();
      app.windowManager.remove(windowId);
    },
    windowId,
    editor,
  };
}
