(function () {
  const form = document.getElementById('experiment6-form');
  const status = document.getElementById('form-status');

  if (!form || !status) {
    return;
  }

  function setError(name, message) {
    const target = form.querySelector('[data-error-for="' + name + '"]');
    if (target) {
      target.textContent = message;
    }
  }

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach(function (node) {
      node.textContent = '';
    });
    status.textContent = '';
  }

  function getGenderValue() {
    const checked = form.querySelector('input[name="gender"]:checked');
    return checked ? checked.value.trim() : '';
  }

  function validate() {
    clearErrors();

    const values = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      gender: getGenderValue(),
      password: form.password.value,
      training_days: form.training_days.value.trim(),
      fitness_goal: form.fitness_goal.value.trim(),
      experience_level: form.experience_level.value.trim(),
      notes: form.notes.value.trim()
    };

    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.full_name) {
      errors.full_name = 'Full name is required.';
    }

    if (!values.email) {
      errors.email = 'Email address is required.';
    } else if (!emailPattern.test(values.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!values.gender) {
      errors.gender = 'Please choose a gender.';
    }

    if (!values.password) {
      errors.password = 'Password is required.';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!values.training_days) {
      errors.training_days = 'Training days per week is required.';
    } else {
      const days = Number(values.training_days);
      if (!Number.isInteger(days) || days < 1 || days > 7) {
        errors.training_days = 'Training days must be an integer from 1 to 7.';
      }
    }

    if (!values.fitness_goal) {
      errors.fitness_goal = 'Please select a fitness goal.';
    }

    if (!values.experience_level) {
      errors.experience_level = 'Please select an experience level.';
    }

    if (values.notes.length > 200) {
      errors.notes = 'Notes must be 200 characters or fewer.';
    }

    Object.keys(errors).forEach(function (key) {
      setError(key, errors[key]);
    });

    if (Object.keys(errors).length) {
      status.textContent = 'Please correct the highlighted fields before submitting.';
      return false;
    }

    return true;
  }

  form.addEventListener('submit', function (event) {
    if (!validate()) {
      event.preventDefault();
    }
  });
})();
