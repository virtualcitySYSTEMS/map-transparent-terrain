import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  ImageMaterialProperty,
  JulianDate,
  Matrix4,
  Cartographic,
  ClippingPlaneCollection,
  ClippingPlane,
  Color,
  Ellipsoid,
  Plane,
  Entity,
} from '@vcmap-cesium/engine';
import {
  cartesianToMercator,
  CesiumMap,
  ClippingObject,
  DataSourceLayer,
  EventType,
  mercatorProjection,
  Projection,
  wgs84Projection,
} from '@vcmap/core';
import { Ref, ref } from 'vue';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { getPluginAssetUrl, VcsUiApp } from '@vcmap/ui';
import { name } from '../../package.json';
import TransparentTerrainInteraction from '../interaction/transparentTerrainInteraction.js';
import TerrainMode, { TransparentTerrainType } from './terrainMode.js';

let modelMatrix = new Matrix4();

class BoxTerrainMode extends TerrainMode {
  private material?: ImageMaterialProperty;

  private clippingObject?: ClippingObject;

  private entities: Array<Entity>;

  layer?: DataSourceLayer;

  position: Cartesian3;

  projectPosition: Ref<Cartesian3>;

  boxSize: Cartesian3;

  showTexture: boolean;

  // eslint-disable-next-line class-methods-use-this
  private removeInteraction: () => void = () => {};

  private readonly interaction: TransparentTerrainInteraction;

  constructor(app: VcsUiApp) {
    super(app);
    this.type = TransparentTerrainType.Box;
    this.material = undefined;
    this.clippingObject = undefined;
    this.entities = [];
    this.position = new Cartesian3();
    this.projectPosition = ref(new Cartesian3());
    this.boxSize = new Cartesian3(100, 100, 50);
    this.showTexture = true;
    this.interaction = new TransparentTerrainInteraction(
      this.translatePosition.bind(this),
    );
  }

  initialize(): void {
    if (!this.initialized) {
      super.initialize();
      this.material = new ImageMaterialProperty({
        image: getPluginAssetUrl(this.app, name, 'plugin-assets/dirt_0.png')!,
        repeat: new Cartesian2(
          Math.ceil(this.boxSize.x / 20),
          Math.ceil(this.boxSize.y / 20),
        ),
      });
    }
  }

  activate(): void {
    if (!this.active) {
      super.activate();
      if (!this.clippingObject) {
        this.clippingObject = new ClippingObject({ terrain: true });
      }
      if (this.position.equals(new Cartesian3())) {
        const cartographic = (this.app.maps.activeMap as CesiumMap)
          .getScene()!
          .camera.positionCartographic.clone();
        cartographic.height = 0;
        this.position = Cartographic.toCartesian(
          cartographic,
          (this.app.maps.activeMap as CesiumMap).getScene()!.globe.ellipsoid,
          this.position,
        );
      }
      this.projectPosition.value = this.getProjectPosition();
      this.initClippingPlanes();
      const { eventHandler } = this.app.maps;
      this.removeInteraction = eventHandler.addExclusiveInteraction(
        this.interaction,
        () => {},
      );
      this.app.maps.clippingObjectManager.setExclusiveClippingObjects(
        [this.clippingObject],
        () => {
          this.deactivate();
        },
      );
    }
  }

  initClippingPlanes(): void {
    const bottom = new Entity({
      id: 'transparentTerrainBox_bottom',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Z, this.boxSize.z / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.y);
        }, false),
        material: this.material,
      },
    });
    const wall1 = new Entity({
      id: 'transparentTerrainBox_wall1',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Y, this.boxSize.y / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.z);
        }, false),
        material: this.material,
      },
    });
    const wall2 = new Entity({
      id: 'transparentTerrainBox_wall2',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Y, -this.boxSize.y / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.z);
        }, false),
        material: this.material,
      },
    });
    const wall3 = new Entity({
      id: 'transparentTerrainBox_wall3',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_X, this.boxSize.x / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.y, this.boxSize.z);
        }, false),
        material: this.material,
      },
    });
    const wall4 = new Entity({
      id: 'transparentTerrainBox_wall4',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_X, -this.boxSize.x / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.y, this.boxSize.z);
        }, false),
        material: this.material,
      },
    });
    this.entities = [bottom, wall1, wall2, wall3, wall4];
    this.entities.forEach((entity) => this.layer?.addEntity(entity));
    modelMatrix = bottom.computeModelMatrix(JulianDate.now());
    this.updateClippingPlaner();
  }

  updateClippingPlaner(): void {
    this.entities.forEach((entity) => {
      // eslint-disable-next-line
      // @ts-ignore
      entity.plane.material.color = this.showTexture
        ? Color.WHITE
        : Color.BLACK;
    });
    const dimX = this.boxSize.x / 2.0;
    const dimY = this.boxSize.y / 2.0;
    const dimZ = Math.abs(this.boxSize.z);
    this.clippingObject!.clippingPlaneCollection = new ClippingPlaneCollection({
      modelMatrix,
      planes: [
        new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), -dimX),
        new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), -dimX),
        new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), -dimY),
        new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), -dimY),
        new ClippingPlane(new Cartesian3(0.0, 0.0, -1.0), -dimZ),
      ],
      edgeWidth: 1.0,
      edgeColor: Color.WHITE,
      enabled: true,
    });
  }

  updateBox(
    boxSize: Cartesian3,
    projectPosition: Cartesian3,
    showTexture: boolean,
  ): void {
    Cartesian3.clone(boxSize, this.boxSize);
    this.showTexture = showTexture;
    const wgs84Position = Projection.transform(
      wgs84Projection,
      this.projection,
      [projectPosition.x, projectPosition.y, projectPosition.z],
    );
    this.updatePosition(wgs84Position);
  }

  getProjectPosition(): Cartesian3 {
    const projectPosition = Cartesian3.fromArray(
      Projection.transform(
        this.projection,
        mercatorProjection,
        cartesianToMercator(this.position),
      ),
    );
    projectPosition.z += this.boxSize.z / 2;
    return projectPosition;
  }

  updatePosition(position: Coordinate): void {
    const [lon, lat, h] = position;
    this.position = Cartesian3.fromDegrees(
      lon,
      lat,
      h - this.boxSize.z / 2,
      Ellipsoid.WGS84,
      this.position,
    );
    Matrix4.setTranslation(modelMatrix, this.position, modelMatrix);
    this.updateClippingPlaner();
  }

  translatePosition(position: Coordinate): void {
    this.updatePosition(Projection.mercatorToWgs84(position, false));
    this.projectPosition.value = this.getProjectPosition();
  }

  serialize(): Feature {
    const feature = super.serialize();
    feature.set('position', [
      this.position.x,
      this.position.y,
      this.position.z,
    ]);
    feature.set('boxSize', [this.boxSize.x, this.boxSize.y, this.boxSize.z]);
    feature.set('showTexture', this.showTexture);
    return feature;
  }

  deserialize(feature: Feature): void {
    super.deserialize(feature);
    this.position = Cartesian3.fromArray(feature.get('position'));
    this.boxSize = Cartesian3.fromArray(feature.get('boxSize'));
    this.showTexture = !!feature.get('showTexture');
    this.interaction.paused = true;
    this.interaction.setActive(EventType.CLICK);
  }

  deactivate(): void {
    if (this.active) {
      super.deactivate();
      this.removeInteraction();
      this.entities.forEach((entity) =>
        this.layer?.removeEntityById(entity.id),
      );
      this.app.maps.clippingObjectManager.clearExclusiveClippingObjects(true);
      this.clippingObject = undefined;
    }
  }
}

export default BoxTerrainMode;
