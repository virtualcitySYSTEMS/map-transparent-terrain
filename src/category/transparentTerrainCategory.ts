import { Category, CesiumMap } from '@vcmap/core';
import {
  CollectionComponentClass,
  CollectionComponentListItem,
  createSupportedMapMappingFunction,
  VcsUiApp,
} from '@vcmap/ui';
import { name as packageName } from '../../package.json';
import TerrainMode from '../mode/terrainMode.js';

export type TransparentTerrainItem = {
  name?: string;
  mode: TerrainMode;
};

export function addToCategoryCollection(
  category: Category<TransparentTerrainItem>,
  mode: TerrainMode | undefined,
): void {
  if (mode) {
    if (!category.collection.hasKey(mode.name.value)) {
      if (!mode.name.value) {
        let modeName;
        let count = 0;
        const sameTypeModeNames = new Set(
          [...category.collection]
            .filter((c) => c.mode.type === mode.type)
            .map((c) => c.name),
        );
        do {
          count += 1;
          if (!sameTypeModeNames.has(`${mode.type}-${count}`)) {
            modeName = `${mode.type}-${count}`;
          }
        } while (!modeName);
        mode.name.value = modeName;
      }
      category.collection.add({
        name: mode.name.value,
        mode,
      });
      mode.isPersistent.value = true;
    }
  }
}

function itemMappingFunction(
  item: TransparentTerrainItem,
  c: CollectionComponentClass<TransparentTerrainItem>,
  categoryListItem: CollectionComponentListItem,
): void {
  categoryListItem.title = item.name!;

  categoryListItem.titleChanged = (newTitle): void => {
    categoryListItem.title = newTitle;
    item.name = newTitle;
    item.mode.name.value = newTitle;
  };

  categoryListItem.actions.push({
    name: 'transparentTerrain.category.remove',
    callback(): void {
      item.mode?.deactivate();
      c.collection.remove(item);
    },
  });
}

export async function createCategory(vcsApp: VcsUiApp): Promise<{
  categoryUiItem: CollectionComponentClass<TransparentTerrainItem>;
  category: Category<TransparentTerrainItem>;
  destroy: () => void;
}> {
  const result =
    await vcsApp.categoryManager.requestCategory<TransparentTerrainItem>(
      {
        type: Category.className,
        name: 'Transparent Terrain Category',
        title: 'transparentTerrain.header.title',
        featureProperty: undefined,
      },
      packageName,
      {
        selectable: true,
        overflowCount: 3,
        renamable: true,
      },
    );

  const categoryUiItem = result.collectionComponent;
  const { category } = result;

  vcsApp.categoryManager.addMappingFunction<TransparentTerrainItem>(
    () => {
      return true;
    },
    itemMappingFunction,
    packageName,
    [category.name],
  );

  categoryUiItem.addItemMapping({
    mappingFunction: createSupportedMapMappingFunction(
      [CesiumMap.className],
      vcsApp.maps,
    ),
    owner: packageName,
  });

  return {
    categoryUiItem,
    category,
    destroy(): void {
      vcsApp.categoryManager.removeOwner(packageName);
    },
  };
}
