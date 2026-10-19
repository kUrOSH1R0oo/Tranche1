function getFilterNumber(field, defaultValue) {
  return field.value === "" ? defaultValue : Number(field.value);
}

function getLowestPackagePrice() {
  return PACKAGE_DATA.reduce(function (lowest, packageInfo) {
    return Math.min(lowest, packageInfo.price_per_person);
  }, Infinity);
}

function formatFilterBudget(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function setFilterError(form, field, message) {
  const error = form.querySelector("#" + field.id + "-error");
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) {
    error.textContent = message;
    error.hidden = message === "";
  }
}

function keepDigitsOnly(field) {
  const currentValue = field.value;
  const currentCaret = field.selectionStart === null ? currentValue.length : field.selectionStart;
  const digitsOnly = currentValue.replace(/\D/g, "");
  if (digitsOnly === currentValue) {
    return;
  }

  const caretAfterDigits = currentValue.slice(0, currentCaret).replace(/\D/g, "").length;
  field.value = digitsOnly;
  field.setSelectionRange(caretAfterDigits, caretAfterDigits);
}

function allowDigitsOnly(field) {
  field.addEventListener("beforeinput", function (event) {
    if (event.inputType && event.inputType.indexOf("insert") === 0 && event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  });
  field.addEventListener("paste", function (event) {
    const pastedText = event.clipboardData && event.clipboardData.getData("text");
    if (pastedText && /\D/.test(pastedText)) {
      event.preventDefault();
    }
  });
  field.addEventListener("input", function () {
    keepDigitsOnly(field);
  });
}

function validatePackageFilters(form, fields) {
  let isValid = true;
  const numberFields = [
    fields.minDays,
    fields.maxDays,
    fields.maxPrice
  ];

  numberFields.forEach(function (field) {
    let error = "";
    if (field.value !== "" && !/^\d+$/.test(field.value)) {
      error = "Use numbers only.";
    } else if (field.value !== "" && field.id.indexOf("days") >= 0) {
      const days = Number(field.value);
      if (field.id === "filter-min-days" && (days < 1 || days > 6)) {
        error = "Enter a minimum of 1 to 6 days.";
      } else if (field.id === "filter-max-days" && (days < 3 || days > 20)) {
        error = "Enter a maximum of 3 to 20 days.";
      }
    } else if (field.id === "filter-max-price" && field.value !== "" &&
        Number(field.value) < getLowestPackagePrice()) {
      error = "Enter at least " + formatFilterBudget(getLowestPackagePrice()) +
        ", the lowest tour price.";
    }
    setFilterError(form, field, error);
    if (error) {
      isValid = false;
    }
  });

  const minDays = getFilterNumber(fields.minDays, 0);
  const maxDays = getFilterNumber(fields.maxDays, Infinity);
  const maxPrice = getFilterNumber(fields.maxPrice, Infinity);

  if (fields.minDays.value !== "" && fields.maxDays.value !== "" && minDays > maxDays) {
    setFilterError(form, fields.maxDays, "Maximum days must be at least the minimum.");
    isValid = false;
  }
  return isValid;
}

function filterPackages(form, fields) {
  const status = document.querySelector("#package-filter-status");
  const emptyState = document.querySelector("#package-filter-empty");
  if (!validatePackageFilters(form, fields)) {
    if (status) {
      status.hidden = false;
      status.textContent = "Fix the highlighted filter values to see results.";
    }
    return;
  }

  const cards = new Map(
    Array.from(document.querySelectorAll(".nation-grid [data-nation]")).map(function (card) {
      return [card.dataset.nation, card];
    })
  );
  const minDays = getFilterNumber(fields.minDays, 0);
  const maxDays = getFilterNumber(fields.maxDays, Infinity);
  const maxPrice = getFilterNumber(fields.maxPrice, Infinity);
  const keyword = fields.keyword.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  PACKAGE_DATA.forEach(function (packageInfo) {
    const card = cards.get(packageInfo.nation);
    if (!card) {
      return;
    }

    const matchesDays = packageInfo.days >= minDays && packageInfo.days <= maxDays;
    const matchesPrice = packageInfo.price_per_person <= maxPrice;
    const searchableText = (packageInfo.nation + " " + packageInfo.focus).toLocaleLowerCase();
    const matchesKeyword = searchableText.includes(keyword);
    const matches = matchesDays && matchesPrice && matchesKeyword;

    card.hidden = !matches;
    if (matches) {
      visibleCount += 1;
    }
  });

  if (status) {
    status.hidden = visibleCount === 0;
    status.textContent = visibleCount === 0
      ? ""
      : visibleCount + (visibleCount === 1 ? " package found." : " packages found.");
  }
  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}

function resetPackageFilters(form, fields) {
  form.reset();
  filterPackages(form, fields);
}

function setupPackageFilters() {
  const form = document.querySelector("#package-filters");
  if (!form) {
    return;
  }

  const fields = {
    minDays: form.querySelector("#filter-min-days"),
    maxDays: form.querySelector("#filter-max-days"),
    maxPrice: form.querySelector("#filter-max-price"),
    keyword: form.querySelector("#filter-keyword")
  };
  if (Object.values(fields).some(function (field) { return !field; })) {
    return;
  }

  [fields.minDays, fields.maxDays, fields.maxPrice].forEach(allowDigitsOnly);

  form.addEventListener("input", function () {
    filterPackages(form, fields);
  });
  form.addEventListener("change", function () {
    filterPackages(form, fields);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  const resetButton = form.querySelector("#reset-filters");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetPackageFilters(form, fields);
    });
  }

  filterPackages(form, fields);
}

setupPackageFilters();
