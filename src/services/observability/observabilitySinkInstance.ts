import { ObservabilitySink } from './ObservabilitySink';
import { ObservabilityRepository } from '../../data_layer/ObservabilityRepository';
import { getDatabase } from '../../data_layer';

let sink: ObservabilitySink | null = null;

export const getObservabilitySink = (): ObservabilitySink => {
  if (sink == null) {
    sink = new ObservabilitySink(new ObservabilityRepository(getDatabase()));
    sink.start();
  }
  return sink;
};

export const resetObservabilitySinkForTesting = () => {
  sink?.stop();
  sink = null;
};
