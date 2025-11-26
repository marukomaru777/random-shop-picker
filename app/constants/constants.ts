// 定義 Place 資料介面
export interface GooglePlace {
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
}

// 距離選項定義
export const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '1.5km', value: 1500 },
  { label: '2km', value: 2000 },
];

// 價格選項定義
export const PRICE_OPTIONS = [1, 2, 3, 4];