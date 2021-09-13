import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// export type SightData = {
//   [propName in keyof SightsFilterParams]?: string;
// } & {
//   title: string;
// };

export type OknCategory = 'fed' | 'reg' | 'mst' | 'vvl';

export type OknType = 'arc' | 'aig' | 'his' | 'art';

export interface SightData {
  title: string;
  category?: OknCategory;
  type?: OknType;
}

export interface SightsData {
  items: SightData[];
}

export interface SightsFilterParams {
  // category: { [key in OknCategory | string]: boolean };
  // type: { [key in OknType | string]: boolean };
  fb1: {
    switchedOn: boolean;
    opened: boolean;
    category: {
      fed: boolean;
      reg: boolean;
      mst: boolean;
      vvl: boolean;
    };
    type: {
      arc: boolean;
      aig: boolean;
      his: boolean;
      art: boolean;
    };
  };
}

export interface GetSightsParams {
  limit?: number;
  filterParams: SightsFilterParams;
}

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private sightsItems: SightData[] = [
    { title: 'Здание банка ФА', category: 'fed', type: 'aig' },
    { title: 'Гостиный дворъ ФИ', category: 'fed', type: 'his' },
    { title: 'Дом купца РА', category: 'reg', type: 'aig' },
    { title: 'Дом, где бывал РИ', category: 'reg', type: 'his' },
    { title: 'Памятник кокой-то', category: 'mst', type: 'art' },
    { title: 'Не ОКН' },
  ];
  // constructor() { }

  // public sightData: Subject<SightData[]> = new Subject<SightData[]>();

  public getSights(params: GetSightsParams): Observable<SightsData> {
    console.log('getSights params:', params);
    // for (let i = 0; i < params.limit; i++) {
    //   sightsItems.push({ title: String(i) });
    // }
    // this.sightData.next(sights);
    const { category, type } = params.filterParams.fb1;
    const allowedCategories = Object.keys(category).filter(
      (key) => category[key as OknCategory],
    );
    const allowedTypes = Object.keys(type).filter(
      (key) => type[key as OknType],
    );
    console.log('allowedCategories:', allowedCategories);
    console.log('allowedTypes:', allowedTypes);

    return of({
      items: this.sightsItems
        .filter(
          (item) =>
            item.category &&
            item.type &&
            allowedCategories.includes(item.category) &&
            allowedTypes.includes(item.type),
        )
        .slice(0, params.limit),
    });
  }
}
