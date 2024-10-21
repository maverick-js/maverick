module.exports = {
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  overrides: [],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^@?maverick/(.*)$', '^[../]', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};
