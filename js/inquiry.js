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

function isValidEmail(email) {
  const atPosition = email.indexOf("@");
  if (atPosition < 1 || atPosition !== email.lastIndexOf("@") || email.includes(" ")) {
    return false;
  }

  const domain = email.substring(atPosition + 1);
  const domainParts = domain.split(".");
  if (domainParts.length < 2 || domainParts[0].length === 0) {
    return false;
  }

  return domainParts[domainParts.length - 1].length >= 2 && domainParts.every(function (part) {
    return part.length > 0;
  });
}

function getFieldError(name, value) {
  if (name === "full_name" && (value.length < 2 || value.length > 80)) {
    return "Enter a name between 2 and 80 characters.";
  }
  if (name === "email" && (value.length > 254 || !isValidEmail(value))) {
    return "Enter a valid email address, such as name@example.com.";
  }
  if (name === "phone") {
    const digits = value.replace(/\D/g, "");
    if (!/^[0-9+(). -]+$/.test(value) || digits.length < 7 || digits.length > 15) {
      return "Enter 7 to 15 digits; spaces, +, -, and parentheses are allowed.";
    }
  }
  if (name === "nation" && !NATION_NAMES.includes(value)) {
    return "Choose one of the seven listed nations.";
  }
  if (name === "travel_date") {
    const today = new Date();
    const localToday = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    if (!value || value < localToday) {
      return "Choose today or a future travel date.";
    }
  }
  if (name === "num_travelers" && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 20)) {
    return "Enter a whole number from 1 to 20.";
  }
  if (name === "message" && (value.length < 10 || value.length > 1000)) {
    return "Enter a message between 10 and 1,000 characters.";
  }
  return "";
}

function validateForm(form) {
  const fieldNames = ["full_name", "email", "phone", "nation", "travel_date", "num_travelers", "message"];
  const values = {};
  let formIsValid = true;

  for (let i = 0; i < fieldNames.length; i += 1) {
    const name = fieldNames[i];
    const field = getField(form, name);
    const value = field ? field.value.trim() : "";
    values[name] = value;
    const error = field ? getFieldError(name, value) : "This field is required.";

    if (field) {
      showError(field, error);
    }
    if (error) {
      formIsValid = false;
    }
  }

  if (!formIsValid) {
    return null;
  }

  return {
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
    nation: values.nation,
    travel_date: values.travel_date,
    num_travelers: Number(values.num_travelers),
    message: values.message
  };
}

function updateEstimatedTotal(form) {
  const countField = getField(form, "num_travelers");
  const totalOutput = form.querySelector("[data-estimated-total]");
  if (!countField || !totalOutput) {
    return;
  }

  const travelerCount = Number(countField.value);
  const nationField = getField(form, "nation");
  const packageInfo = PACKAGE_DATA.find(function (item) {
    return nationField && item.nation === nationField.value;
  });
  const pricePerPerson = packageInfo ? packageInfo.price_per_person : Number(form.dataset.pricePerPerson);
  if (/^\d+$/.test(countField.value) && travelerCount >= 1 && travelerCount <= 20) {
    const total = travelerCount * pricePerPerson;
    totalOutput.textContent = new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(total);
  } else {
    totalOutput.textContent = "Enter 1–20 travelers";
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.hasAttribute("data-submission-complete")) {
    return;
  }
  const successMessage = form.querySelector("[data-form-success]");
  const inquiry = validateForm(form);

  if (!inquiry) {
    if (successMessage) {
      successMessage.textContent = "Please correct the highlighted fields.";
    }
    return;
  }

  form.setAttribute("data-submission-complete", "true");
  console.log("Validated inquiry (demo only):", inquiry);
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }
  if (successMessage) {
    successMessage.textContent = "Thank you. Your inquiry is valid for this demonstration; it has not been sent or saved.";
  }

  if (form.hasAttribute("data-booking-form")) {
    createBookingRecord(form, inquiry);
  }
}

function createBookingRecord(form, inquiry) {
  const packageInfo = PACKAGE_DATA.find(function (item) {
    return item.nation === inquiry.nation;
  });
  if (!packageInfo) {
    return;
  }

  const booking = {
    nation: inquiry.nation,
    travel_date: inquiry.travel_date,
    num_travelers: inquiry.num_travelers,
    estimated_total: inquiry.num_travelers * packageInfo.price_per_person
  };
  console.log("Estimated booking inquiry (not a confirmed reservation):", booking);
  updateEstimatedTotal(form);
}

function attachInquiryForms() {
  const forms = document.querySelectorAll("form[data-inquiry-form]");
  for (let i = 0; i < forms.length; i += 1) {
    const form = forms[i];
    form.addEventListener("submit", handleFormSubmit);

    const fields = form.querySelectorAll("input, select, textarea");
    for (let j = 0; j < fields.length; j += 1) {
      fields[j].addEventListener("input", function (event) {
        const field = event.currentTarget;
        const errorMessage = document.getElementById(field.id + "-error");
        if (errorMessage && !errorMessage.hidden) {
          showError(field, getFieldError(field.name, field.value.trim()));
        }
        if (field.name === "num_travelers" && form.hasAttribute("data-booking-form")) {
          updateEstimatedTotal(form);
        }
      });
      fields[j].addEventListener("change", function (event) {
        if ((event.currentTarget.name === "num_travelers" || event.currentTarget.name === "nation") && form.hasAttribute("data-booking-form")) {
          updateEstimatedTotal(form);
        }
      });
    }

    if (form.hasAttribute("data-booking-form")) {
      updateEstimatedTotal(form);
    }
  }
}

function openModal(modal, trigger) {
  modal.hidden = false;
  modal.dataset.open = "true";
  document.body.dataset.previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const nationField = modal.querySelector('select[name="nation"]');
  if (nationField && modal.dataset.nation) {
    nationField.value = modal.dataset.nation;
  }
  const firstField = modal.querySelector("input, select, textarea");
  if (firstField) {
    firstField.focus();
  }
  modal._openingTrigger = trigger;
}

function closeModal(modal) {
  if (modal.hidden) {
    return;
  }

  modal.hidden = true;
  modal.dataset.open = "false";
  document.body.style.overflow = document.body.dataset.previousOverflow || "";
  if (modal._openingTrigger) {
    modal._openingTrigger.focus();
  }
}

function setupBookingModal() {
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) {
    return;
  }

  const openButtons = document.querySelectorAll("[data-open-booking]");
  for (let i = 0; i < openButtons.length; i += 1) {
    openButtons[i].addEventListener("click", function (event) {
      openModal(modal, event.currentTarget);
    });
  }

  const closeButtons = modal.querySelectorAll("[data-close-booking]");
  for (let i = 0; i < closeButtons.length; i += 1) {
    closeButtons[i].addEventListener("click", function () {
      closeModal(modal);
    });
  }

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal(modal);
    }
  });
}

attachInquiryForms();
setupBookingModal();
