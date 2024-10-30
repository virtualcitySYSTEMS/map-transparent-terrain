import {
  Category,
  CesiumMap,
  Extent,
  ExtentOptions,
  Viewpoint,
} from '@vcmap/core';
import {
  CollectionComponentClass,
  CollectionComponentListItem,
  createSupportedMapMappingFunction,
  VcsUiApp,
} from '@vcmap/ui';
import { isEmpty } from 'ol/extent';
import { name as packageName } from '../../package.json';
import TerrainMode from '../mode/terrainMode.js';
import BoxTerrainMode from '../mode/boxTerrainMode.js';
import RectangleTerrainMode from '../mode/rectangleTerrainMode.js';

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
  app: VcsUiApp,
): void {
  categoryListItem.title = item.name!;

  categoryListItem.titleChanged = (newTitle): void => {
    categoryListItem.title = newTitle;
    item.name = newTitle;
    item.mode.name.value = newTitle;
  };

  categoryListItem.actions.push({
    name: 'transparentTerrain.category.zoomTo',
    disabled:
      !(item.mode instanceof BoxTerrainMode) &&
      !(item.mode instanceof RectangleTerrainMode),
    async callback(): Promise<void> {
      let options: ExtentOptions;
      if (item.mode instanceof BoxTerrainMode) {
        options = {
          coordinates: [
            item.mode.projectPosition.value.x - item.mode.boxSize.x / 2,
            item.mode.projectPosition.value.y - item.mode.boxSize.y / 2,
            item.mode.projectPosition.value.x + item.mode.boxSize.x / 2,
            item.mode.projectPosition.value.y + item.mode.boxSize.y / 2,
          ],
          projection: item.mode.projection,
        };
      } else if (item.mode instanceof RectangleTerrainMode) {
        options = {
          coordinates: item.mode.getExtent().extent,
          projection: item.mode.getExtent().projection,
        };
      } else {
        return;
      }

      if (options.coordinates && !isEmpty(options.coordinates)) {
        const vp = Viewpoint.createViewpointFromExtent(new Extent(options));
        if (vp) {
          c.selection.value = [categoryListItem];
          vp.animate = true;
          await app.maps.activeMap?.gotoViewpoint(vp);
        }
      }
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
        removable: true,
      },
    );

  const categoryUiItem = result.collectionComponent;
  const { category } = result;

  vcsApp.categoryManager.addMappingFunction<TransparentTerrainItem>(
    () => {
      return true;
    },
    (item, c, categoryListItem) =>
      itemMappingFunction(item, c, categoryListItem, vcsApp),
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
