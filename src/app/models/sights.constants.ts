import {
  FilterBlock,
  OknCategory,
  OknText,
  OknType,
  SightType,
  SightWithNested,
} from './sights.models';

export const OKN_TYPES: { [key in OknType]: OknText } = {
  a: { short: 'Пам. археологии', full: 'Памятник археологии' },
  // eslint-disable-next-line prettier/prettier
  g: { short: 'Пам. архитект.', full: 'Памятник архитектуры и градостроительства'},
  h: { short: 'Пам. истории', full: 'Памятник истории' },
  i: { short: 'Пам. искусства', full: 'Памятник искусства' },
};

export const OKN_CATEGORIES: { [key in OknCategory]: OknText } = {
  f: { short: 'фед. зн.', full: 'Федерального значения' },
  r: { short: 'рег. зн.', full: 'Регионального значения' },
  m: { short: 'мест. зн.', full: 'Местного значения' },
  v: { short: '(выявл.)', full: 'Выявленный объект' },
};

// opened=true by default - for SSR
export const FILTER_BLOCKS: FilterBlock[] = [
  {
    name: 'tur',
    title: 'Туристам',
    switchedOn: true,
    opened: true,
    showed: false,
    groups: [
      {
        name: 'sets',
        controls: [
          {
            name: 'main',
            title: 'Главные достопримечательности',
            value: true,
          },
          {
            name: 'mus',
            title: 'Государственные музеи',
            value: true,
          },
        ],
      },
    ],
  },
  {
    name: 'okn',
    title: 'Объекты культурного наследия',
    switchedOn: true,
    opened: true,
    showed: false,
    groups: [
      {
        name: 'okn_category',
        title: 'Категория охраны',
        shortTitle: 'Категория',
        controls: [
          {
            name: 'f',
            title: 'Федеральный',
            shortTitle: 'Фед.',
            value: true,
          },
          {
            name: 'r',
            title: 'Региональный',
            shortTitle: 'Рег.',
            value: false,
          },
          {
            name: 'm',
            title: 'Местный',
            shortTitle: 'Мест.',
            value: false,
          },
          // {
          //   name: 'v',
          //   title: 'Выявленный',
          //   shortTitle: 'Выяв.',
          //   value: false,
          // },
        ],
      },
      {
        name: 'okn_type',
        title: 'Тип',
        controls: [
          // {
          //   name: 'a',
          //   title: 'Памятник археологии',
          //   shortTitle: 'Архео.',
          //   value: true,
          // },
          {
            name: 'g',
            title: 'Памятник архитектуры и градостроительства',
            shortTitle: 'Архит.',
            value: true,
          },
          {
            name: 'h',
            title: 'Памятник истории',
            shortTitle: 'Истор.',
            value: true,
          },
          {
            name: 'i',
            title: 'Памятник искусства',
            shortTitle: 'Искус.',
            value: true,
          },
        ],
      },
      {
        name: 'egrkn',
        title: 'Загрузить данные из госреестра',
        controls: [
          {
            name: 'go',
            title: 'Загрузить данные госреестра по Орлу',
            shortTitle: 'по Орлу',
            value: false,
            type: 'toggle',
          },
        ],
      },
    ],
  },
];

export const SIGHTS_WITH_NESTED: SightWithNested[] = [
  {
    sightId: `${SightType.DEFAULT}905`,
    nested: [`${SightType.DEFAULT}1044`],
  },
  {
    sightId: `${SightType.DEFAULT}924`,
    nested: [`${SightType.DEFAULT}1043`],
  },
  {
    sightId: `${SightType.DEFAULT}938`,
    nested: [`${SightType.DEFAULT}1022`],
  },
  {
    sightId: `${SightType.DEFAULT}878`,
    nested: [`${SightType.EGRKN}571711113340016`],
  },
];
