function filterPackages() {
  const grid = document.querySelector(".nation-grid");
  const minDaysField = document.querySelector("#filter-min-days");
  const maxDaysField = document.querySelector("#filter-max-days");
  const minPriceField = document.querySelector("#filter-min-price");
  const maxPriceField = document.querySelector("#filter-max-price");
  const searchField = document.querySelector("#filter-keyword");

  // Nation pages do not have these controls, so this script can safely load there.
  if (!grid || !minDaysField || !maxDaysField || !minPriceField || !maxPriceField || !searchField) {
    return;
  }

  const cards = grid.querySelectorAll("[data-nation]");
  const noMatchesMessage = document.querySelector("#no-matching-packages");
  const minDays = minDaysField.value === "" ? 0 : Number(minDaysField.value);
  const maxDays = maxDaysField.value === "" ? Infinity : Number(maxDaysField.value);
  const minPrice = minPriceField.value === "" ? 0 : Number(minPriceField.value);
  const maxPrice = maxPriceField.value === "" ? Infinity : Number(maxPriceField.value);
  const keyword = searchField.value.trim().toLowerCase();
  let visibleCount = 0;

  for (let i = 0; i < PACKAGE_DATA.length; i += 1) {
    const packageInfo = PACKAGE_DATA[i];
    const card = grid.querySelector('[data-nation="' + packageInfo.nation + '"]');

    if (!card) {
      continue;
    }

    const matchesDays = packageInfo.days >= minDays && packageInfo.days <= maxDays;
    const matchesPrice = packageInfo.price_per_person >= minPrice && packageInfo.price_per_person <= maxPrice;
    const searchableText = (packageInfo.nation + " " + packageInfo.focus).toLowerCase();
    const matchesKeyword = searchableText.includes(keyword);
    const matches = matchesDays && matchesPrice && matchesKeyword;

    card.hidden = !matches;
    if (matches) {
      visibleCount += 1;
    }
  }

  if (noMatchesMessage) {
    noMatchesMessage.hidden = visibleCount > 0;
  }
}

function resetPackageFilters() {
  const filterForm = document.querySelector("#package-filters");
  if (!filterForm) {
    return;
  }

  filterForm.reset();
  filterPackages();
}

function setupPackageFilters() {
  const filterForm = document.querySelector("#package-filters");
  if (!filterForm) {
    return;
  }

  filterForm.addEventListener("input", filterPackages);
  filterForm.addEventListener("change", filterPackages);
  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  const resetButton = document.querySelector("#reset-filters");
  if (resetButton) {
    resetButton.addEventListener("click", resetPackageFilters);
  }

  filterPackages();
}

setupPackageFilters();
