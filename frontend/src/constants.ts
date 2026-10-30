export const CATEGORIES = [
  'Balls',
  'Rackets',
  'Bats',
  'Protective Gear',
  'Fitness',
  'Fitness Accessories',
  'Training Equipment',
  'Swimming',
  'Accessories',
];

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (low to high)' },
  { value: 'price_desc', label: 'Price (high to low)' },
];

// Shown when a product has no image or the image fails to load
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#e8eef5"/>
      <circle cx="200" cy="150" r="48" fill="none" stroke="#9db0c6" stroke-width="6"/>
      <path d="M152 150h96M200 102v96" stroke="#9db0c6" stroke-width="6"/>
    </svg>`,
  );
