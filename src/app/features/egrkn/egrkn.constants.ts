import { OknType, OknCategory } from 'src/app/models/sights.models';

export const EGRKN_OKN_TYPES: Record<string, OknType> = {
  '1': 'a', // ?
  '2': 'h', // Памятник истории
  '3': 'g', // Памятник градостроительства и архитектуры
  '4': 'i', // Памятник искусства
};

export const EGRKN_OKN_CATEGORIES: Record<string, OknCategory> = {
  '1': 'f', // Федерального значения
  '2': 'r', // Регионального значения
  '3': 'v', // ?
  '4': 'm', // Местного (муниципального) значения
};

// objectType: 1 - Памятник. 2 - Ансамбль, 3 - Достопримечательное место

export const DEFAULT_ADDRESS_PART = /Орловская область[, ]+г(.|ород) Орел,/;

export const DEFAULT_OKN_TITLE = 'Дом жилой';

const EGRKN_VERSION = '$'; // https://opendata.mkrf.ru/item/api -> egrkn, $ - last version

export const EGRKN_OBJECT_URL = `https://opendata.mkrf.ru/opendata/7705851331-egrkn/${EGRKN_VERSION}/`;

export const GET_EGRKN_URL = `https://opendata.mkrf.ru/v2/egrkn/${EGRKN_VERSION}`;

export const LOCAL_EGRKN_URL = 'data/egrkn.json'; // egrkn-10

// const egrknFilter = {
//   'data.general.address.fullAddress': { $search: 'орел' },
//   'data.general.region.value': { $eq: 'Орловская область' },
// };
// const url = new URL(GET_EGRKN_URL);
// url.searchParams.append('f', JSON.stringify(egrknFilter));
// url.searchParams.append('l', '500');
