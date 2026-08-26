document.addEventListener('DOMContentLoaded', () => {
	const datePickers = Array.from(document.querySelectorAll('[data-audit-date-picker]'));
	if (datePickers.length === 0) {
		return;
	}

	const parseValue = (value) => {
		if (!value) {
			return null;
		}

		const [year, month, day] = value.split('-').map(Number);
		if (!year || !month || !day) {
			return null;
		}

		return new Date(year, month - 1, day);
	};

	const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
	const labelFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
	const presetInput = document.querySelector('[data-audit-date-preset-input]');
	const displayTodayInput = document.querySelector('[data-audit-display-today-input]');
	const presetButtons = Array.from(document.querySelectorAll('.ghost-button--filter'));
	const browserToday = new Date();
	browserToday.setHours(0, 0, 0, 0);
	const today = parseValue(displayTodayInput?.value || '')
		|| new Date(browserToday.getFullYear(), browserToday.getMonth(), browserToday.getDate());

	const clearPresetSelection = () => {
		if (presetInput) {
			presetInput.value = '';
		}

		presetButtons.forEach((button) => button.classList.remove('ghost-button--active'));
	};

	const formatValue = (date) => {
		if (!(date instanceof Date)) {
			return '';
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const formatLabel = (date, placeholder) => {
		if (!(date instanceof Date)) {
			return placeholder;
		}

		return labelFormatter.format(date);
	};

	const isSameDay = (left, right) => Boolean(left && right
		&& left.getFullYear() === right.getFullYear()
		&& left.getMonth() === right.getMonth()
		&& left.getDate() === right.getDate());

	const instances = datePickers.map((container) => {
		const input = container.querySelector('input[type="hidden"]');
		const trigger = container.querySelector('.audit-date-trigger');
		const label = container.querySelector('.audit-date-trigger__label');
		const picker = container.querySelector('.audit-date-picker');
		const monthLabel = container.querySelector('.audit-date-picker__month');
		const daysGrid = container.querySelector('.audit-date-picker__days');
		const placeholder = input?.dataset.placeholder || '';
		const selectedDate = parseValue(input?.value || '');
		const viewedDate = selectedDate
			? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
			: new Date(today.getFullYear(), today.getMonth(), 1);

		return {
			container,
			input,
			trigger,
			label,
			picker,
			monthLabel,
			daysGrid,
			placeholder,
			selectedDate,
			viewedDate
		};
	}).filter((instance) => instance.input && instance.trigger && instance.label && instance.picker && instance.monthLabel && instance.daysGrid);

	const closeInstance = (instance) => {
		instance.picker.hidden = true;
		instance.trigger.setAttribute('aria-expanded', 'false');
		instance.container.classList.remove('is-open');
	};

	const closeAll = (except = null) => {
		instances.forEach((instance) => {
			if (instance === except) {
				return;
			}
			closeInstance(instance);
		});
	};

	const syncInstance = (instance) => {
		instance.label.textContent = formatLabel(instance.selectedDate, instance.placeholder);
		instance.container.classList.toggle('has-value', Boolean(instance.selectedDate));
		instance.monthLabel.textContent = monthFormatter.format(instance.viewedDate);
		instance.daysGrid.innerHTML = '';

		const firstDayOfMonth = new Date(instance.viewedDate.getFullYear(), instance.viewedDate.getMonth(), 1);
		const calendarStart = new Date(firstDayOfMonth);
		calendarStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

		for (let index = 0; index < 42; index += 1) {
			const date = new Date(calendarStart);
			date.setDate(calendarStart.getDate() + index);

			const dayButton = document.createElement('button');
			dayButton.type = 'button';
			dayButton.className = 'audit-date-picker__day';
			dayButton.textContent = String(date.getDate());
			dayButton.classList.toggle('is-outside-month', date.getMonth() !== instance.viewedDate.getMonth());
			dayButton.classList.toggle('is-selected', isSameDay(date, instance.selectedDate));
			dayButton.classList.toggle('is-today', isSameDay(date, today));
			dayButton.addEventListener('click', () => {
				clearPresetSelection();
				instance.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				instance.viewedDate = new Date(date.getFullYear(), date.getMonth(), 1);
				instance.input.value = formatValue(instance.selectedDate);
				instance.input.dispatchEvent(new Event('change', { bubbles: true }));
				syncInstance(instance);
				closeAll();
			});
			instance.daysGrid.append(dayButton);
		}
	};

	instances.forEach((instance) => {
		syncInstance(instance);

		instance.trigger.addEventListener('click', () => {
			const willOpen = instance.picker.hidden;
			closeAll(willOpen ? instance : null);
			instance.picker.hidden = !willOpen;
			instance.trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
			instance.container.classList.toggle('is-open', willOpen);
		});

		instance.trigger.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
				event.preventDefault();
				closeAll(instance);
				instance.picker.hidden = false;
				instance.trigger.setAttribute('aria-expanded', 'true');
				instance.container.classList.add('is-open');
			}

			if (event.key === 'Escape') {
				closeAll();
			}
		});

		instance.container.querySelectorAll('.audit-date-picker__nav').forEach((button) => {
			button.addEventListener('click', () => {
				const direction = button.dataset.direction === 'previous' ? -1 : 1;
				instance.viewedDate = new Date(instance.viewedDate.getFullYear(), instance.viewedDate.getMonth() + direction, 1);
				syncInstance(instance);
			});
		});

		instance.container.querySelectorAll('.audit-date-picker__action').forEach((button) => {
			button.addEventListener('click', () => {
				clearPresetSelection();

				if (button.dataset.action === 'clear') {
					instance.selectedDate = null;
					instance.input.value = '';
					instance.input.dispatchEvent(new Event('change', { bubbles: true }));
					syncInstance(instance);
					closeAll();
					return;
				}

				instance.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
				instance.viewedDate = new Date(today.getFullYear(), today.getMonth(), 1);
				instance.input.value = formatValue(instance.selectedDate);
				instance.input.dispatchEvent(new Event('change', { bubbles: true }));
				syncInstance(instance);
				closeAll();
			});
		});
	});

	document.addEventListener('click', (event) => {
		instances.forEach((instance) => {
			if (!instance.container.contains(event.target)) {
				closeInstance(instance);
			}
		});
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeAll();
		}
	});
});