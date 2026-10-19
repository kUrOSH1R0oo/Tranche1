// Shared package details used by filtering, inquiry forms, and nation-page summaries.
const PACKAGE_DATA = [
  { nation: "Mondstadt", days: 3, nights: 2, price_per_person: 12500, focus: "nature & cultural sightseeing" },
  { nation: "Liyue", days: 4, nights: 3, price_per_person: 15000, focus: "cultural & scenic exploration" },
  { nation: "Inazuma", days: 6, nights: 5, price_per_person: 18000, focus: "cultural heritage & island discovery" },
  { nation: "Sumeru", days: 3, nights: 2, price_per_person: 14000, focus: "nature & cultural exploration" },
  { nation: "Fontaine", days: 5, nights: 4, price_per_person: 20000, focus: "culture, architecture & art" },
  { nation: "Natlan", days: 4, nights: 3, price_per_person: 16500, focus: "adventure & cultural exploration" },
  { nation: "Snezhnaya", days: 5, nights: 4, price_per_person: 22000, focus: "winter & scenic exploration" }
];

const NATION_NAMES = PACKAGE_DATA.map(function (packageInfo) {
  return packageInfo.nation;
});
