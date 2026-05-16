import { EventsSink } from './EventsSink';
import { EventsRepository } from '../../data_layer/EventsRepository';
import { getDatabase } from '../../data_layer';

let sink: EventsSink | null = null;

export const getEventsSink = (): EventsSink => {
  if (sink == null) {
    sink = new EventsSink(new EventsRepository(getDatabase()));
    sink.start();
  }
  return sink;
};

export const resetEventsSinkForTesting = () => {
  sink?.stop();
  sink = null;
};
