import { Category, parseGeoJSON, writeGeoJSON } from '@vcmap/core';
import {
  CollectionComponentClass,
  downloadText,
  NotificationType,
  VcsUiApp,
} from '@vcmap/ui';
import TransparentTerrainManager from '../transparentTerrainManager.js';
import {
  addToCategoryCollection,
  TransparentTerrainItem,
} from '../category/transparentTerrainCategory.js';

export function createImportCallback(
  app: VcsUiApp,
  manager: TransparentTerrainManager,
  category: Category<TransparentTerrainItem>,
  files: Array<File>,
): boolean {
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e): void => {
      const text = e.target!.result;
      try {
        const { features } = parseGeoJSON(text, {
          dynamicStyle: true,
        });
        const before = category.collection.size;
        features.forEach((f) => {
          addToCategoryCollection(category, manager.createFromFeature(f));
        });
        app.notifier.add({
          type: NotificationType.SUCCESS,
          message: app.vueI18n.t('components.import.featuresAdded', [
            category.collection.size - before,
          ]) as string,
        });
      } catch (err) {
        app.notifier.add({
          message: (err as Error).message,
          type: NotificationType.ERROR,
        });
      }
    };
    reader.readAsText(file);
  });
  return true;
}

export function createExportCallback(
  collectionComponent: CollectionComponentClass<TransparentTerrainItem>,
): void {
  const features = collectionComponent.selection.value.map((s) =>
    collectionComponent.collection.getByKey(s.name)!.mode.serialize(),
  );
  const text = writeGeoJSON(
    {
      features,
    },
    {
      writeStyle: true,
      embedIcons: true,
      prettyPrint: true,
      writeId: true,
    },
  );
  downloadText(text, 'transparenttransparentTerrain.json');
}
