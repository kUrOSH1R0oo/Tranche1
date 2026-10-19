function getField(form, name) {
  return form.querySelector('[name="' + name + '"]');
}

function showError(field, message) {
  const errorMessage = document.getElementById(field.id + "-error");
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.hidden = message === "";
  }
}

function isValidPhone(phone) {
  return /^9\d{9}$/.test(phone);
}

function isValidEmail(field, email) {
  const emailWithDomainDot = /^[^\s@]+@[^\s@.]+\.[^\s@.]+(?:\.[^\s@.]+)*$/;
  return email.length <= 254 && emailWithDomainDot.test(email) && !field.validity.typeMismatch;
}

function normalizePhilippinePhoneInput(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function normalizePhilippinePhoneField(field) {
  const currentValue = field.value;
  const currentCaret = field.selectionStart === null ? currentValue.length : field.selectionStart;
  const normalizedValue = normalizePhilippinePhoneInput(currentValue);
  if (normalizedValue === currentValue) {
    return;
  }

  const normalizedBeforeCaret = normalizePhilippinePhoneInput(currentValue.slice(0, currentCaret));
  field.value = normalizedValue;
  const nextCaret = Math.min(normalizedBeforeCaret.length, normalizedValue.length);
  field.setSelectionRange(nextCaret, nextCaret);
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

function getLocalDateString(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function getFieldError(field, value) {
  const name = field.name;
  if (field.required && !value) {
    return "This field is required.";
  }

  if (name === "full_name" && (value.length < 2 || value.length > 80)) {
    return "Enter a name between 2 and 80 characters.";
  }
  if (name === "email" && !isValidEmail(field, value)) {
    return "Enter an email with a domain ending, such as name@example.com.";
  }
  if (name === "phone" && !isValidPhone(value)) {
    return "Enter 10 digits starting with 9. The +63 country code is already shown.";
  }
  if (name === "nation" && !NATION_NAMES.includes(value)) {
    return "Choose one of the seven listed nations.";
  }
  if (name === "travel_date" && value < getLocalDateString(new Date())) {
    return "Choose today or a future travel date.";
  }
  if (name === "num_travelers" && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 20)) {
    return "Enter a whole number from 1 to 20.";
  }
  if (name === "message" && value !== "" && (value.length < 10 || value.length > 1000)) {
    return "Enter a message between 10 and 1,000 characters.";
  }
  return "";
}

function validateForm(form) {
  const fieldNames = ["full_name", "email", "phone", "nation", "travel_date", "num_travelers", "message"];
  const values = {};
  let firstInvalidField = null;

  for (let i = 0; i < fieldNames.length; i += 1) {
    const name = fieldNames[i];
    const field = getField(form, name);
    const value = field ? field.value.trim() : "";
    values[name] = value;
    const error = field ? getFieldError(field, value) : "This field is missing.";

    if (field) {
      showError(field, error);
      if (error && !firstInvalidField) {
        firstInvalidField = field;
      }
    } else {
      firstInvalidField = firstInvalidField || form;
    }
  }

  if (firstInvalidField) {
    return { isValid: false, firstInvalidField: firstInvalidField };
  }

  return {
    isValid: true,
    inquiry: {
      full_name: values.full_name,
      email: values.email,
      phone: "+63" + values.phone,
      nation: values.nation,
      travel_date: values.travel_date,
      num_travelers: Number(values.num_travelers),
      message: values.message
    }
  };
}

function formatPeso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function renderPackagePrice() {
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) {
    return;
  }

  const packageInfo = PACKAGE_DATA.find(function (item) {
    return item.nation === modal.dataset.nation;
  });
  if (!packageInfo) {
    return;
  }

  const price = formatPeso(packageInfo.price_per_person);
  document.querySelectorAll("[data-package-price]").forEach(function (output) {
    output.textContent = price;
  });
  document.querySelectorAll("[data-package-duration]").forEach(function (output) {
    output.textContent = packageInfo.days + " days / " + packageInfo.nights + " nights";
  });
  document.querySelectorAll("[data-package-focus]").forEach(function (output) {
    output.textContent = packageInfo.focus;
  });

  updateBookingSummary(modal);
}

function updateBookingSummary(modal) {
  const summary = modal.querySelector("[data-package-summary]");
  const form = modal.querySelector("form[data-booking-form]");
  const nationField = form && getField(form, "nation");
  const packageInfo = PACKAGE_DATA.find(function (item) {
    return nationField && item.nation === nationField.value;
  });
  if (summary && packageInfo) {
    summary.textContent = packageInfo.nation + " · " + packageInfo.days +
      " days / " + packageInfo.nights + " nights";
  }
}

function updateEstimatedTotal(form) {
  const countField = getField(form, "num_travelers");
  const totalOutput = form.querySelector("[data-estimated-total]");
  const nationField = getField(form, "nation");
  if (!countField || !totalOutput || !nationField) {
    return;
  }

  const travelerCount = Number(countField.value);
  const packageInfo = PACKAGE_DATA.find(function (item) {
    return item.nation === nationField.value;
  });
  if (!packageInfo) {
    totalOutput.textContent = "Choose a nation";
    return;
  }

  if (/^\d+$/.test(countField.value) && travelerCount >= 1 && travelerCount <= 20) {
    totalOutput.textContent = formatPeso(travelerCount * packageInfo.price_per_person);
  } else {
    totalOutput.textContent = "Enter 1–20 travelers";
  }
}

function setFormStatus(form, message, kind) {
  const status = form.querySelector("[data-form-success]");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.dataset.statusKind = kind || "";
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const validation = validateForm(form);

  if (!validation.isValid) {
    setFormStatus(form, "Please fix the highlighted fields.", "error");
    if (validation.firstInvalidField !== form) {
      validation.firstInvalidField.focus();
    }
    return;
  }

  resetInquiryForm(form);
  setFormStatus(
    form,
    "Your details look good. The form was cleared. This demo did not send or save your inquiry.",
    "demo"
  );
}

function clearFormStatus(form) {
  const status = form.querySelector("[data-form-success]");
  if (status && status.textContent) {
    status.textContent = "";
    status.dataset.statusKind = "";
  }
}

function resetInquiryForm(form) {
  form.reset();

  const nationField = getField(form, "nation");
  if (nationField) {
    nationField.value = form.dataset.defaultNation || "";
  }

  const travelerField = getField(form, "num_travelers");
  if (travelerField) {
    travelerField.value = "";
  }

  if (form.hasAttribute("data-booking-form")) {
    updateEstimatedTotal(form);
    const modal = form.closest("[data-booking-modal]");
    if (modal) {
      updateBookingSummary(modal);
    }
  }
}

function createInquiryField(form, prefix, fieldInfo, defaultNation) {
  const id = prefix + "-" + fieldInfo.name.replace(/_/g, "-");
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = fieldInfo.label;

  const wrapper = document.createElement("div");
  wrapper.className = "inquiry-field";
  let field;
  if (fieldInfo.type === "select") {
    field = document.createElement("select");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a nation";
    field.appendChild(placeholder);
    NATION_NAMES.forEach(function (nation) {
      const option = document.createElement("option");
      option.value = nation;
      option.textContent = nation;
      if (nation === defaultNation) {
        option.selected = true;
      }
      field.appendChild(option);
    });
    if (defaultNation) {
      placeholder.selected = false;
    }
  } else if (fieldInfo.type === "textarea") {
    field = document.createElement("textarea");
    field.rows = 4;
  } else {
    field = document.createElement("input");
    field.type = fieldInfo.type;
  }

  field.id = id;
  field.name = fieldInfo.name;
  field.required = fieldInfo.required !== false;
  field.setAttribute("aria-describedby", id + "-error");
  if (fieldInfo.autocomplete) {
    field.autocomplete = fieldInfo.autocomplete;
  }
  if (fieldInfo.minLength) {
    field.minLength = fieldInfo.minLength;
  }
  if (fieldInfo.maxLength) {
    field.maxLength = fieldInfo.maxLength;
  }
  if (fieldInfo.min !== undefined) {
    field.min = fieldInfo.min;
  }
  if (fieldInfo.max !== undefined) {
    field.max = fieldInfo.max;
  }
  if (fieldInfo.step !== undefined) {
    field.step = fieldInfo.step;
  }
  if (fieldInfo.value !== undefined) {
    field.value = fieldInfo.value;
  }
  if (fieldInfo.inputMode) {
    field.inputMode = fieldInfo.inputMode;
  }
  if (fieldInfo.placeholder) {
    field.placeholder = fieldInfo.placeholder;
  }
  if (fieldInfo.pattern) {
    field.setAttribute("pattern", fieldInfo.pattern);
  }

  const error = document.createElement("span");
  error.className = "field-error";
  error.id = id + "-error";
  error.hidden = true;
  if (fieldInfo.name === "phone") {
    const phoneGroup = document.createElement("div");
    phoneGroup.className = "phone-input-group";
    const phonePrefix = document.createElement("span");
    phonePrefix.className = "phone-prefix";
    phonePrefix.textContent = "+63";
    phonePrefix.setAttribute("aria-hidden", "true");
    phoneGroup.append(phonePrefix, field);
    wrapper.append(phoneGroup, error);
  } else {
    wrapper.append(field, error);
  }
  form.querySelector(".inquiry-grid").append(label, wrapper);
}

function mountInquiryForms() {
  const fieldInfo = [
    { name: "full_name", label: "Full name", type: "text", minLength: 2, maxLength: 80, autocomplete: "name" },
    { name: "email", label: "Email", type: "email", maxLength: 254, autocomplete: "email", placeholder: "name@example.com" },
    { name: "phone", label: "Phone number", type: "tel", maxLength: 10, autocomplete: "tel-national", inputMode: "numeric", placeholder: "9XXXXXXXXX" },
    { name: "nation", label: "Nation", type: "select" },
    { name: "travel_date", label: "Preferred travel date", type: "date" },
    { name: "num_travelers", label: "Number of travelers", type: "text", maxLength: 2, inputMode: "numeric", pattern: "[0-9]*", placeholder: "1-20" },
    { name: "message", label: "Message", type: "textarea", required: false, minLength: 10, maxLength: 1000, placeholder: "(optional)" }
  ];

  document.querySelectorAll("[data-inquiry-form-mount]").forEach(function (mount) {
    const form = document.createElement("form");
    const isBooking = mount.dataset.formType === "booking";
    const prefix = isBooking ? "booking" : "contact";
    form.id = mount.dataset.formId;
    form.className = "inquiry-form";
    form.dataset.defaultNation = mount.dataset.defaultNation || "";
    form.setAttribute("data-inquiry-form", "");
    form.noValidate = true;
    if (isBooking) {
      form.setAttribute("data-booking-form", "");
    }

    const grid = document.createElement("div");
    grid.className = "inquiry-grid";
    form.appendChild(grid);
    fieldInfo.forEach(function (info) {
      createInquiryField(form, prefix, info, mount.dataset.defaultNation || "");
    });

    if (isBooking) {
      const estimate = document.createElement("p");
      estimate.className = "estimate-line";
      estimate.appendChild(document.createTextNode("Estimated total: "));
      const amount = document.createElement("strong");
      amount.setAttribute("data-estimated-total", "");
      estimate.appendChild(amount);
      const note = document.createElement("span");
      note.textContent = "Estimated package cost for all travelers; not a confirmed reservation.";
      estimate.appendChild(note);
      form.appendChild(estimate);
    }

    const status = document.createElement("p");
    status.className = "form-success";
    status.setAttribute("data-form-success", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);

    if (isBooking) {
      const submit = document.createElement("button");
      submit.className = "btn-gold inquiry-submit";
      submit.type = "submit";
      submit.textContent = "Check estimate";
      form.appendChild(submit);
    }

    mount.replaceWith(form);
  });
}

function attachInquiryForms() {
  const forms = document.querySelectorAll("form[data-inquiry-form]");
  const today = getLocalDateString(new Date());

  for (let i = 0; i < forms.length; i += 1) {
    const form = forms[i];
    form.addEventListener("submit", handleFormSubmit);
    document.querySelectorAll("[data-submit-form]").forEach(function (button) {
      if (button.dataset.submitForm === form.id) {
        button.addEventListener("click", function () {
          form.requestSubmit();
        });
      }
    });

    const dateField = getField(form, "travel_date");
    if (dateField) {
      dateField.min = today;
    }

    const fields = form.querySelectorAll("input, select, textarea");
    for (let j = 0; j < fields.length; j += 1) {
      if (fields[j].name === "num_travelers") {
        allowDigitsOnly(fields[j]);
      }
      fields[j].addEventListener("input", function (event) {
        const field = event.currentTarget;
        if (field.name === "phone") {
          normalizePhilippinePhoneField(field);
        }
        const errorMessage = document.getElementById(field.id + "-error");
        if (errorMessage && !errorMessage.hidden) {
          showError(field, getFieldError(field, field.value.trim()));
        }
        clearFormStatus(form);
        if (field.name === "num_travelers" && form.hasAttribute("data-booking-form")) {
          updateEstimatedTotal(form);
        }
      });
      fields[j].addEventListener("change", function (event) {
        if (event.currentTarget.name === "phone") {
          normalizePhilippinePhoneField(event.currentTarget);
        }
        clearFormStatus(form);
        if (form.hasAttribute("data-booking-form") &&
            (event.currentTarget.name === "num_travelers" || event.currentTarget.name === "nation")) {
          updateEstimatedTotal(form);
          const modal = form.closest("[data-booking-modal]");
          if (modal && event.currentTarget.name === "nation") {
            updateBookingSummary(modal);
          }
        }
      });
      if (fields[j].name === "phone") {
        fields[j].addEventListener("paste", function (event) {
          const phoneField = event.currentTarget;
          const pastedValue = event.clipboardData && event.clipboardData.getData("text");
          if (!pastedValue) {
            return;
          }
          const normalizedPaste = normalizePhilippinePhoneInput(pastedValue);
          if (!normalizedPaste) {
            return;
          }
          event.preventDefault();
          const start = phoneField.selectionStart;
          const end = phoneField.selectionEnd;
          phoneField.setRangeText(normalizedPaste, start, end, "end");
          phoneField.dispatchEvent(new Event("input", { bubbles: true }));
        });
      }
    }

    if (form.hasAttribute("data-booking-form")) {
      updateEstimatedTotal(form);
    }
  }
}

function getModalFocusableElements(modal) {
  return Array.from(modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(function (element) {
    return !element.hidden && element.getClientRects().length > 0;
  });
}

function handleModalKeydown(event, modal) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeModal(modal);
    return;
  }
  if (event.key !== "Tab") {
    return;
  }

  const focusable = getModalFocusableElements(modal);
  if (focusable.length === 0) {
    event.preventDefault();
    const panel = modal.querySelector(".booking-panel");
    if (panel) {
      panel.focus();
    }
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

function openModal(modal, trigger) {
  if (!modal.hidden) {
    return;
  }

  modal.hidden = false;
  modal.dataset.open = "true";
  modal._openingTrigger = trigger;
  modal._previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  modal._inertSiblings = Array.from(document.body.children)
    .filter(function (child) { return child !== modal; })
    .map(function (child) {
      const wasInert = child.inert;
      child.inert = true;
      return { element: child, wasInert: wasInert };
    });

  const nationField = modal.querySelector('select[name="nation"]');
  if (nationField && modal.dataset.nation) {
    nationField.value = modal.dataset.nation;
  }
  const bookingForm = modal.querySelector("form[data-booking-form]");
  if (bookingForm) {
    updateEstimatedTotal(bookingForm);
    updateBookingSummary(modal);
  }

  modal._keydownHandler = function (event) {
    handleModalKeydown(event, modal);
  };
  document.addEventListener("keydown", modal._keydownHandler);

  const firstField = modal.querySelector("input, select, textarea");
  if (firstField) {
    firstField.focus();
  }
}

function closeModal(modal) {
  if (modal.hidden) {
    return;
  }

  modal.hidden = true;
  modal.dataset.open = "false";
  document.body.style.overflow = modal._previousBodyOverflow || "";
  if (modal._keydownHandler) {
    document.removeEventListener("keydown", modal._keydownHandler);
    modal._keydownHandler = null;
  }
  (modal._inertSiblings || []).forEach(function (item) {
    item.element.inert = item.wasInert;
  });
  modal._inertSiblings = [];

  if (modal._openingTrigger) {
    modal._openingTrigger.focus();
  }
}

function setupBookingModal() {
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) {
    return;
  }

  document.querySelectorAll("[data-open-booking]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      openModal(modal, event.currentTarget);
    });
  });

  modal.querySelectorAll("[data-close-booking]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeModal(modal);
    });
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
}

function setupStopInquiryLinks() {
  document.querySelectorAll("[data-stop-inquiry]").forEach(function (link) {
    link.addEventListener("click", function () {
      const stop = link.closest(".stop");
      const stopHeading = stop && stop.querySelector("h3");
      const modal = document.querySelector("[data-booking-modal]");
      const form = document.querySelector("#contact-inquiry");
      const messageField = form && getField(form, "message");
      if (!stopHeading || !modal || !messageField) {
        return;
      }

      messageField.value = "I'm interested in " + stopHeading.textContent.trim() +
        " as part of the " + modal.dataset.nation + " package.\n\n" +
        "Preferred travel date:\nNumber of travelers:\nQuestions:";
      showError(messageField, getFieldError(messageField, messageField.value.trim()));
      clearFormStatus(form);
    });
  });
}

mountInquiryForms();
renderPackagePrice();
attachInquiryForms();
setupBookingModal();
setupStopInquiryLinks();
