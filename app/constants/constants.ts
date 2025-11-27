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

// 底部控制面板的高度定義
export const COLLAPSED_HEIGHT = 30; // 收起狀態的固定高度
export const EXPANDED_HEIGHT_PERCENT = 0.6; // 展開時佔螢幕的 90%

// 距離選項定義
export const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '1.5km', value: 1500 },
  { label: '2km', value: 2000 },
];

// 價格選項定義
export const PRICE_OPTIONS = [1, 2, 3, 4];

// 模擬的餐廳類型選項
export const TYPE_OPTIONS = [
  { label: '隨便', value: 'food' },
  { label: '餐廳', value: 'restaurant' },
  { label: '咖啡廳', value: 'cafe' },
  { label: '酒吧', value: 'bar' },
];

export const DEFAULT_TYPE_VALUE = 'food'; // 預設的類型值，代表不限

export const RATING_OPTIONS: { value: number, label: string }[] = [
    { value: 0, label: '不限' },
    { value: 3.0, label: '⭐️ 3.0+' },
    { value: 4.0, label: '⭐️ 4.0+' },
    { value: 4.5, label: '⭐️ 4.5+' },
];