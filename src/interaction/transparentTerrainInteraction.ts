import { AbstractInteraction, EventType, InteractionEvent } from '@vcmap/core';
import { Coordinate } from 'ol/coordinate';

class TransparentTerrainInteraction extends AbstractInteraction {
  private readonly cb: (position: Coordinate) => void;

  paused: boolean;

  constructor(cb: (position: Coordinate) => void) {
    super(EventType.CLICKMOVE);
    this.cb = cb;
    this.paused = false;
    this.setActive();
  }

  pipe(event: InteractionEvent): Promise<InteractionEvent> {
    if (event.type & EventType.MOVE) {
      if (event.position && !event.position.every((val) => val === 0)) {
        this.cb(event.position);
      }
    } else if (event.type & EventType.CLICK) {
      if (!this.paused) {
        this.paused = true;
        this.setActive(EventType.CLICK);
      } else if (
        event.feature &&
        (event.feature.getId()! as string).startsWith('transparentTerrainBox')
      ) {
        this.paused = false;
        this.setActive(EventType.CLICKMOVE);
      }
    }
    return Promise.resolve(event);
  }
}

export default TransparentTerrainInteraction;
