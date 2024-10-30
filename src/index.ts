import { VcsPlugin, VcsUiApp } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import { addToolButtons } from './util/toolbox.js';
import TransparentTerrainManager from './transparentTerrainManager.js';
import setupTerrainWindow from './window/setup.js';
import { createCategory } from './category/transparentTerrainCategory.js';
import { TransparentTerrainType } from './mode/terrainMode.js';

export default function transparentTerrainPlugin(): VcsPlugin<
  Record<never, never>,
  Record<never, never>
> {
  let destroy = (): void => {};

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    async initialize(vcsUiApp: VcsUiApp): Promise<void> {
      const terrainManager = new TransparentTerrainManager(vcsUiApp);
      const {
        categoryUiItem: collectionComponent,
        category,
        destroy: destroyCategory,
      } = await createCategory(vcsUiApp);

      const {
        destroy: destroyTerrainWindow,
        windowId,
        editor,
      } = setupTerrainWindow(
        vcsUiApp,
        terrainManager,
        collectionComponent,
        category,
      );

      const destroyButtons = addToolButtons(
        vcsUiApp,
        terrainManager,
        windowId,
        editor,
      );

      destroy = (): void => {
        destroyButtons();
        destroyCategory();
        destroyTerrainWindow();
      };
    },
    i18n: {
      en: {
        transparentTerrain: {
          header: {
            title: 'Transparent Terrain',
          },
          create: {
            new: 'New',
            tooltip: {
              addToWorkspace: 'Add to My Workspace',
              [TransparentTerrainType.Box]: 'Create ground excavation area',
              [TransparentTerrainType.Rectangle]:
                'Create transparent rectangle',
              [TransparentTerrainType.Global]: 'Create transparent globe',
            },
            title: {
              [TransparentTerrainType.Box]: 'Temporary box terrain',
              [TransparentTerrainType.Rectangle]: 'Temporary rectangle terrain',
              [TransparentTerrainType.Global]: 'Temporary global terrain',
            },
          },
          category: {
            zoomTo: 'Zoom to item extent',
          },
          settings: {
            modify: 'Modify',
            geometry: 'Geometry',
            length: 'Length',
            width: 'Width',
            depth: 'Depth',
            position: 'Position',
            box: {
              edit: 'Edit box',
              translate: 'Translate box',
              scale: 'Scale box',
              showTexture: 'Show texture',
              hint: 'Click on box to release and move.',
            },
            global: {
              camera: 'Move camera under terrain',
              opacity: 'Opacity',
              nearFar: 'Near/Far Scalar',
              distanceOpacity: 'Alpha, scaled depending on distance',
              near: 'Near',
              nearOpacity: 'Near Opacity',
              far: 'Far',
              farOpacity: 'Far Opacity',
            },
            rectangle: {
              extent: {
                remove: 'Remove extent',
              },
              hint: 'click in map to set the position of the rectangle. Move mouse to inspect further.',
            },
          },
        },
      },
      de: {
        transparentTerrain: {
          header: {
            title: 'Transparenter Geländemodus',
          },
          create: {
            new: 'Neu',
            tooltip: {
              addToWorkspace: 'In Mein Arbeitsbereich hinzufügen',
              [TransparentTerrainType.Box]: 'Geländeaushub erstellen',
              [TransparentTerrainType.Rectangle]:
                'Transparentes Rechteck erstellen',
              [TransparentTerrainType.Global]: 'Globus transparent stellen ',
            },
            title: {
              [TransparentTerrainType.Box]: 'Temporäres Box-Gelände',
              [TransparentTerrainType.Rectangle]: 'Temporäres Rechteck-Gelände',
              [TransparentTerrainType.Global]: 'Temporäres globale Gelände',
            },
          },
          category: {
            zoomTo: 'Auf Elementausdehnung zoomen',
          },
          settings: {
            modify: 'Editieren',
            geometry: 'Geometrie',
            length: 'Länge',
            width: 'Breite',
            depth: 'Tiefe',
            position: 'Position',
            box: {
              edit: 'Box editieren',
              translate: 'Box verschieben',
              scale: 'Box skalieren',
              showTexture: 'Textur anzeigen',
              hint: 'Klicken Sie auf die Box um diese zu aktivieren und verschieben.',
            },
            global: {
              camera: 'Kamera unter Gelände bewegen',
              opacity: 'Deckkraft',
              nearFar: 'Nah/Fern Skalierung',
              distanceOpacity: 'Transparenz skaliert abhängig vom Abstand',
              near: 'Nah ',
              nearOpacity: 'Deckkraft nah',
              far: 'Fern',
              farOpacity: 'Deckkraft fern',
            },
            rectangle: {
              extent: {
                remove: 'Ausdehnung entfernen',
              },
              hint: 'Klicken Sie in die Karte um die Position des Rechtecks festzulegen. Bewegen Sie die Maus um das Rechteck weiter zu zeichnen.',
            },
          },
        },
      },
    },
    destroy(): void {
      destroy();
    },
  };
}
