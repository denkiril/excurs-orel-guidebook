import { SightsFilterParamsPreset } from './settings.model';

// TODO build paramsStr
export const FILTER_PARAMS_PRESETS: SightsFilterParamsPreset[] = [
  {
    value: 'okn',
    params: {
      okn: {
        switchedOn: true,
        opened: true,
        groups: {
          okn_category: { f: true, r: true, m: true },
          okn_type: { g: true, h: true, i: true },
          egrkn: { go: true },
        },
      },
    },
    paramsStr: 'okn:f,r,m;g,h,i;go',
    seoTitle: 'Объекты культурного наследия Орла — Путеводитель по Орлу',
    seoDescription:
      'Объекты культурного наследия (ОКН) города Орла, которые входят в реестр Министерства культуры РФ и охраняются государством.',
  },
];
