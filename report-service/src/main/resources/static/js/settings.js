(() => {
	const apiBasePath = '/api/settings';
	const TIMEZONE_OPTIONS = [
		{ value: 'UTC', label: 'UTC (UTC+00:00)' },
		{ value: 'Asia/Dubai', label: 'Dubai (UTC+04:00)' },
		{ value: 'Asia/Kolkata', label: 'Kolkata (UTC+05:30)' },
		{ value: 'Asia/Bangkok', label: 'Bangkok (UTC+07:00)' },
		{ value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (UTC+07:00)' },
		{ value: 'Asia/Jakarta', label: 'Jakarta (UTC+07:00)' },
		{ value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+08:00)' },
		{ value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (UTC+08:00)' },
		{ value: 'Asia/Manila', label: 'Manila (UTC+08:00)' },
		{ value: 'Asia/Shanghai', label: 'Shanghai (UTC+08:00)' },
		{ value: 'Asia/Singapore', label: 'Singapore (UTC+08:00)' },
		{ value: 'Asia/Taipei', label: 'Taipei (UTC+08:00)' },
		{ value: 'Asia/Seoul', label: 'Seoul (UTC+09:00)' },
		{ value: 'Asia/Tokyo', label: 'Tokyo (UTC+09:00)' },
		{ value: 'Europe/London', label: 'London (UTC+01:00)' },
		{ value: 'Europe/Paris', label: 'Paris (UTC+02:00)' },
		{ value: 'Europe/Berlin', label: 'Berlin (UTC+02:00)' },
		{ value: 'Europe/Madrid', label: 'Madrid (UTC+02:00)' },
		{ value: 'Europe/Istanbul', label: 'Istanbul (UTC+03:00)' },
		{ value: 'America/Sao_Paulo', label: 'Sao Paulo (UTC-03:00)' },
		{ value: 'America/New_York', label: 'New York (UTC-04:00)' },
		{ value: 'America/Chicago', label: 'Chicago (UTC-05:00)' },
		{ value: 'America/Denver', label: 'Denver (UTC-06:00)' },
		{ value: 'America/Los_Angeles', label: 'Los Angeles (UTC-07:00)' },
		{ value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+02:00)' },
		{ value: 'Australia/Perth', label: 'Perth (UTC+08:00)' },
		{ value: 'Australia/Sydney', label: 'Sydney (UTC+10:00)' },
		{ value: 'Pacific/Auckland', label: 'Auckland (UTC+12:00)' }
	];

	const emptyState = () => ({
		cleanupEnabled: true,
		cleanupFrequency: 'Monthly',
		cleanupTime: '05:00',
		cleanupTimezone: 'Asia/Bangkok',
		downloadBaseUrl: ''
	});

	const normaliseState = (state) => ({
		cleanupEnabled: typeof state.cleanupEnabled === 'boolean' ? state.cleanupEnabled : true,
		cleanupFrequency: state.cleanupFrequency || 'Monthly',
		cleanupTime: state.cleanupTime || '05:00',
		cleanupTimezone: state.cleanupTimezone || 'Asia/Bangkok',
		downloadBaseUrl: (state.downloadBaseUrl || '').trim()
	});

	const readJson = async (response) => {
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return null;
		}

		return response.json();
	};

	const domReady = () => {
		const fields = {
			cleanupEnabled: document.getElementById('cleanup-enabled'),
			cleanupFrequency: document.getElementById('cleanup-frequency'),
			cleanupTime: document.getElementById('cleanup-time'),
			cleanupTimezone: document.getElementById('cleanup-timezone'),
			downloadBaseUrl: document.getElementById('download-base-url')
		};
		const frequencyDropdown = {
			trigger: document.getElementById('cleanup-frequency-trigger'),
			label: document.getElementById('cleanup-frequency-label'),
			list: document.getElementById('cleanup-frequency-list'),
			options: Array.from(document.querySelectorAll('#cleanup-frequency-list .settings-dropdown-option'))
		};
		const timezoneDropdown = {
			trigger: document.getElementById('cleanup-timezone-trigger'),
			label: document.getElementById('cleanup-timezone-label'),
			list: document.getElementById('cleanup-timezone-list'),
			options: Array.from(document.querySelectorAll('#cleanup-timezone-list .settings-dropdown-option'))
		};
		const timePicker = {
			trigger: document.getElementById('cleanup-time-trigger'),
			label: document.getElementById('cleanup-time-label'),
			panel: document.getElementById('cleanup-time-panel'),
			hour: document.getElementById('cleanup-time-hour'),
			hourTrigger: document.getElementById('cleanup-time-hour-trigger'),
			hourLabel: document.getElementById('cleanup-time-hour-label'),
			hourList: document.getElementById('cleanup-time-hour-list'),
			minute: document.getElementById('cleanup-time-minute'),
			minuteTrigger: document.getElementById('cleanup-time-minute-trigger'),
			minuteLabel: document.getElementById('cleanup-time-minute-label'),
			minuteList: document.getElementById('cleanup-time-minute-list'),
			apply: document.getElementById('cleanup-time-apply')
		};
		const summary = {
			cleanupStatus: document.getElementById('summary-cleanup-status'),
			cleanupFrequency: document.getElementById('summary-cleanup-frequency'),
			cleanupTime: document.getElementById('summary-cleanup-time'),
			cleanupTimezone: document.getElementById('summary-cleanup-timezone'),
			downloadBaseUrl: document.getElementById('summary-download-base-url'),
			cleanupDescription: document.getElementById('summary-cleanup-description'),
			nextCleanup: document.getElementById('summary-next-cleanup'),
			lastCleanup: document.getElementById('summary-last-cleanup')
		};
		const saveButton = document.getElementById('save-settings');
		const backLink = document.getElementById('back-to-dashboard');
		const clearGeneratedButton = document.getElementById('clear-generated-files-and-logs');
		const clearAllButton = document.getElementById('clear-all-system-data');
		const saveDialog = document.getElementById('save-settings-modal');
		const unsavedDialog = document.getElementById('unsaved-settings-modal');
		const clearGeneratedDialog = document.getElementById('clear-generated-files-and-logs-modal');
		const clearAllDialog = document.getElementById('clear-all-system-data-modal');
		const feedbackAlert = document.getElementById('settings-feedback-alert');
		const feedbackMessage = document.getElementById('settings-feedback-message');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';

		if (Object.values(fields).some((field) => !field) || Object.values(summary).some((field) => !field) || !frequencyDropdown.trigger || !frequencyDropdown.label || !frequencyDropdown.list || frequencyDropdown.options.length === 0 || !timezoneDropdown.trigger || !timezoneDropdown.label || !timezoneDropdown.list || timezoneDropdown.options.length === 0 || Object.values(timePicker).some((field) => !field) || !saveButton || !backLink || !clearGeneratedButton || !clearAllButton || !saveDialog || !unsavedDialog || !clearGeneratedDialog || !clearAllDialog) {
			return;
		}

		let baselineState = emptyState();
		let isSaving = false;
		let isRunningCleanup = false;
		let pendingNavigationHref = null;
		let suppressBeforeUnload = false;
		const feedbackToast = window.AppToast?.create({
			alertElement: feedbackAlert,
			messageElement: feedbackMessage
		});

		const getCurrentState = () => normaliseState({
			cleanupEnabled: fields.cleanupEnabled.checked,
			cleanupFrequency: fields.cleanupFrequency.value,
			cleanupTime: fields.cleanupTime.value,
			cleanupTimezone: fields.cleanupTimezone.value.trim(),
			downloadBaseUrl: fields.downloadBaseUrl.value
		});

		const isDirty = () => JSON.stringify(getCurrentState()) !== JSON.stringify(baselineState);

		const setFeedback = (variant, message) => {
			feedbackToast?.show(variant, message);
		};

		const timezoneLabelFor = (value) => TIMEZONE_OPTIONS.find((option) => option.value === value)?.label || value || 'Bangkok (UTC+07:00)';

		const downloadBaseUrlDisplay = (value, autoDetectedValue) => value && value.trim()
			? value.trim()
			: (autoDetectedValue && autoDetectedValue.trim() ? autoDetectedValue.trim() : 'Auto-detect from current request');

		const focusField = (field) => {
			if (field === fields.cleanupFrequency) {
				frequencyDropdown.trigger.focus();
				return;
			}

			if (field === fields.cleanupTime) {
				timePicker.trigger.focus();
				return;
			}

			if (field === fields.cleanupTimezone) {
				timezoneDropdown.trigger.focus();
				return;
			}

			field.focus();
		};

		const parseTimeValue = (value) => {
			const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec((value || '').trim());
			if (!match) {
				return { hour: '05', minute: '00' };
			}

			return {
				hour: match[1].padStart(2, '0'),
				minute: match[2]
			};
		};

		const formatTimeValue = (hour, minute) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

		const populateTimeDropdown = (listElement, maxValue) => {
			listElement.innerHTML = '';
			for (let index = 0; index <= maxValue; index += 1) {
				const value = String(index).padStart(2, '0');
				const optionElement = document.createElement('button');
				optionElement.type = 'button';
				optionElement.className = 'settings-dropdown-option settings-dropdown-option--compact';
				optionElement.dataset.value = value;
				optionElement.setAttribute('role', 'option');
				optionElement.textContent = value;
				listElement.append(optionElement);
			}
		};

		const timeValueDropdowns = [
			{
				input: timePicker.hour,
				trigger: timePicker.hourTrigger,
				label: timePicker.hourLabel,
				list: timePicker.hourList,
				maxValue: 23
			},
			{
				input: timePicker.minute,
				trigger: timePicker.minuteTrigger,
				label: timePicker.minuteLabel,
				list: timePicker.minuteList,
				maxValue: 59
			}
		];

		const setFieldInvalid = (field, invalid) => {
			if (field === fields.cleanupFrequency) {
				frequencyDropdown.trigger.classList.toggle('is-invalid', invalid);
				frequencyDropdown.trigger.setAttribute('aria-invalid', invalid ? 'true' : 'false');
				frequencyDropdown.trigger.closest('.field')?.classList.toggle('field--invalid', invalid);
				return;
			}

			if (field === fields.cleanupTime) {
				timePicker.trigger.classList.toggle('is-invalid', invalid);
				timePicker.trigger.setAttribute('aria-invalid', invalid ? 'true' : 'false');
				timePicker.trigger.closest('.field')?.classList.toggle('field--invalid', invalid);
				return;
			}

			if (field === fields.cleanupTimezone) {
				timezoneDropdown.trigger.classList.toggle('is-invalid', invalid);
				timezoneDropdown.trigger.setAttribute('aria-invalid', invalid ? 'true' : 'false');
				timezoneDropdown.trigger.closest('.field')?.classList.toggle('field--invalid', invalid);
				return;
			}

			field.classList.toggle('is-invalid', invalid);
			field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
			field.closest('.field')?.classList.toggle('field--invalid', invalid);
		};

		const closeFrequencyDropdown = () => {
			frequencyDropdown.list.hidden = true;
			frequencyDropdown.trigger.setAttribute('aria-expanded', 'false');
			frequencyDropdown.trigger.closest('.field')?.classList.remove('is-open');
		};

		const openFrequencyDropdown = () => {
			if (fields.cleanupEnabled.checked === false) {
				return;
			}

			closeTimezoneDropdown();
			closeTimePicker();
			frequencyDropdown.list.hidden = false;
			frequencyDropdown.trigger.setAttribute('aria-expanded', 'true');
			frequencyDropdown.trigger.closest('.field')?.classList.add('is-open');
		};

		const syncFrequencyDropdown = () => {
			const value = fields.cleanupFrequency.value || 'Monthly';
			frequencyDropdown.label.textContent = value;
			frequencyDropdown.options.forEach((option) => {
				const isSelected = option.dataset.value === value;
				option.classList.toggle('is-selected', isSelected);
				option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
			});
		};

		const closeTimezoneDropdown = () => {
			timezoneDropdown.list.hidden = true;
			timezoneDropdown.trigger.setAttribute('aria-expanded', 'false');
			timezoneDropdown.trigger.closest('.field')?.classList.remove('is-open');
		};

		const openTimezoneDropdown = () => {
			if (fields.cleanupEnabled.checked === false) {
				return;
			}

			closeFrequencyDropdown();
			closeTimePicker();
			timezoneDropdown.list.hidden = false;
			timezoneDropdown.trigger.setAttribute('aria-expanded', 'true');
			timezoneDropdown.trigger.closest('.field')?.classList.add('is-open');
		};

		const syncTimezoneDropdown = () => {
			const value = fields.cleanupTimezone.value || 'Asia/Bangkok';
			timezoneDropdown.label.textContent = timezoneLabelFor(value);
			timezoneDropdown.options.forEach((option) => {
				const isSelected = option.dataset.value === value;
				option.classList.toggle('is-selected', isSelected);
				option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
			});
		};

		const closeTimePicker = () => {
			timeValueDropdowns.forEach((dropdown) => {
				dropdown.list.hidden = true;
				dropdown.trigger.setAttribute('aria-expanded', 'false');
				dropdown.trigger.closest('.settings-time-field')?.classList.remove('is-open');
			});
			timePicker.panel.hidden = true;
			timePicker.trigger.setAttribute('aria-expanded', 'false');
			timePicker.trigger.closest('.field')?.classList.remove('is-open');
		};

		const closeTimeValueDropdown = (dropdown) => {
			dropdown.list.hidden = true;
			dropdown.trigger.setAttribute('aria-expanded', 'false');
			dropdown.trigger.closest('.settings-time-field')?.classList.remove('is-open');
		};

		const syncTimeValueDropdown = (dropdown) => {
			const value = dropdown.input.value || '00';
			dropdown.label.textContent = value;
			Array.from(dropdown.list.querySelectorAll('.settings-dropdown-option')).forEach((option) => {
				const isSelected = option.dataset.value === value;
				option.classList.toggle('is-selected', isSelected);
				option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
			});
		};

		const openTimeValueDropdown = (dropdown) => {
			timeValueDropdowns.forEach((currentDropdown) => {
				if (currentDropdown !== dropdown) {
					closeTimeValueDropdown(currentDropdown);
				}
			});

			dropdown.list.hidden = false;
			dropdown.trigger.setAttribute('aria-expanded', 'true');
			dropdown.trigger.closest('.settings-time-field')?.classList.add('is-open');
		};

		const syncTimePicker = () => {
			const nextTime = parseTimeValue(fields.cleanupTime.value);
			timePicker.label.textContent = formatTimeValue(nextTime.hour, nextTime.minute);
			timePicker.hour.value = nextTime.hour;
			timePicker.minute.value = nextTime.minute;
			timeValueDropdowns.forEach(syncTimeValueDropdown);
		};

		const openTimePicker = () => {
			if (fields.cleanupEnabled.checked === false) {
				return;
			}

			closeFrequencyDropdown();
			closeTimezoneDropdown();
			syncTimePicker();
			timePicker.panel.hidden = false;
			timePicker.trigger.setAttribute('aria-expanded', 'true');
			timePicker.trigger.closest('.field')?.classList.add('is-open');
		};

		const applyTimePicker = () => {
			const parsedHour = Number.parseInt(timePicker.hour.value, 10);
			const parsedMinute = Number.parseInt(timePicker.minute.value, 10);
			const hourValid = Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23;
			const minuteValid = Number.isInteger(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59;

			if (!hourValid || !minuteValid) {
				setFieldInvalid(fields.cleanupTime, true);
				setFeedback('error', 'Enter a valid cleanup time using hour 00-23 and minute 00-59.');
				(hourValid ? timePicker.minute : timePicker.hour).focus();
				return;
			}

			fields.cleanupTime.value = formatTimeValue(parsedHour, parsedMinute);
			syncTimePicker();
			setFieldInvalid(fields.cleanupTime, false);
			closeTimePicker();
			timePicker.trigger.focus();
			updateButtonState();
		};

		const validateBeforeSave = () => {
			let isValid = true;
			let firstInvalidField = null;

			const validations = [
				[fields.cleanupFrequency, !fields.cleanupFrequency.value.trim()],
				[fields.cleanupTime, !fields.cleanupTime.value.trim()],
				[fields.cleanupTimezone, !fields.cleanupTimezone.value.trim()]
			];

			validations.forEach(([field, invalid]) => {
				setFieldInvalid(field, invalid);
				if (invalid) {
					isValid = false;
					firstInvalidField = firstInvalidField || field;
				}
			});

			const configuredDownloadBaseUrl = fields.downloadBaseUrl.value.trim();
			let downloadBaseUrlInvalid = false;
			if (configuredDownloadBaseUrl) {
				try {
					const parsedUrl = new URL(configuredDownloadBaseUrl);
					downloadBaseUrlInvalid = !['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname || Boolean(parsedUrl.search) || Boolean(parsedUrl.hash);
				} catch (_error) {
					downloadBaseUrlInvalid = true;
				}
			}
			setFieldInvalid(fields.downloadBaseUrl, downloadBaseUrlInvalid);
			if (downloadBaseUrlInvalid) {
				isValid = false;
				firstInvalidField = firstInvalidField || fields.downloadBaseUrl;
			}

			if (!isValid) {
				if (firstInvalidField) {
					focusField(firstInvalidField);
				}
				setFeedback('error', downloadBaseUrlInvalid
					? 'Enter a valid download base URL using http:// or https://, or leave it blank to auto-detect.'
					: 'Complete the cleanup frequency, time, and timezone before saving settings.');
			}

			return isValid;
		};

		const updateSummary = (payload) => {
			summary.cleanupStatus.textContent = payload.cleanupStatus || (payload.cleanupEnabled ? 'Enabled' : 'Disabled');
			summary.cleanupFrequency.textContent = payload.cleanupFrequency || '-';
			summary.cleanupTime.textContent = payload.cleanupTime || '-';
			summary.cleanupTimezone.textContent = payload.cleanupTimezoneLabel || timezoneLabelFor(payload.cleanupTimezone);
			summary.downloadBaseUrl.textContent = payload.downloadBaseUrlDisplay || downloadBaseUrlDisplay(payload.downloadBaseUrl, payload.autoDetectedDownloadBaseUrl || fields.downloadBaseUrl.getAttribute('placeholder'));
			summary.cleanupDescription.textContent = payload.cleanupDescription || '-';
			summary.nextCleanup.textContent = payload.nextCleanupAt || '-';
			summary.lastCleanup.textContent = payload.lastCleanupAt || '-';
		};

		const syncCleanupEnabledState = () => {
			const isEnabled = fields.cleanupEnabled.checked;
			fields.cleanupFrequency.disabled = !isEnabled;
			frequencyDropdown.trigger.disabled = !isEnabled;
			frequencyDropdown.trigger.closest('.field')?.classList.toggle('field--disabled', !isEnabled);
			fields.cleanupTime.disabled = !isEnabled;
			fields.cleanupTimezone.disabled = !isEnabled;
			timezoneDropdown.trigger.disabled = !isEnabled;
			timezoneDropdown.trigger.closest('.field')?.classList.toggle('field--disabled', !isEnabled);
			timePicker.trigger.disabled = !isEnabled;
			timePicker.hour.disabled = !isEnabled;
			timePicker.minute.disabled = !isEnabled;
			timePicker.hourTrigger.disabled = !isEnabled;
			timePicker.minuteTrigger.disabled = !isEnabled;
			timePicker.apply.disabled = !isEnabled;
			timePicker.trigger.closest('.field')?.classList.toggle('field--disabled', !isEnabled);
			timePicker.hourTrigger.closest('.settings-time-field')?.classList.toggle('field--disabled', !isEnabled);
			timePicker.minuteTrigger.closest('.settings-time-field')?.classList.toggle('field--disabled', !isEnabled);
			if (!isEnabled) {
				closeFrequencyDropdown();
				closeTimezoneDropdown();
				closeTimePicker();
			}
		};

		const applyState = (payload) => {
			const nextState = normaliseState(payload || emptyState());
			fields.cleanupEnabled.checked = nextState.cleanupEnabled;
			fields.cleanupFrequency.value = nextState.cleanupFrequency;
			fields.cleanupTime.value = nextState.cleanupTime;
			fields.cleanupTimezone.value = nextState.cleanupTimezone;
			fields.downloadBaseUrl.value = nextState.downloadBaseUrl;
			syncFrequencyDropdown();
			syncTimezoneDropdown();
			syncTimePicker();
			setFieldInvalid(fields.cleanupFrequency, false);
			setFieldInvalid(fields.cleanupTime, false);
			setFieldInvalid(fields.cleanupTimezone, false);
			setFieldInvalid(fields.downloadBaseUrl, false);
			syncCleanupEnabledState();
			updateSummary(payload || emptyState());
			baselineState = getCurrentState();
			updateButtonState();
		};

		const updateButtonState = () => {
			saveButton.disabled = isSaving || isRunningCleanup || !isDirty();
			clearGeneratedButton.disabled = isSaving || isRunningCleanup;
			clearAllButton.disabled = isSaving || isRunningCleanup;
		};

		const navigateTo = (href) => {
			if (!href) {
				return;
			}

			suppressBeforeUnload = true;
			window.location.assign(href);
		};

		const fetchSettings = async () => {
			const response = await fetch(apiBasePath, {
				headers: {
					Accept: 'application/json'
				},
				credentials: 'same-origin'
			});

			const payload = await readJson(response);
			if (!response.ok || !payload) {
				throw new Error(payload?.message || 'Unable to load system settings.');
			}

			applyState(payload);
		};

		const saveSettings = async () => {
			if (isSaving || !validateBeforeSave()) {
				return false;
			}

			isSaving = true;
			updateButtonState();
			try {
				const response = await fetch(apiBasePath, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						[csrfHeader]: csrfToken
					},
					credentials: 'same-origin',
					body: JSON.stringify(getCurrentState())
				});

				const payload = await readJson(response);
				if (!response.ok || !payload) {
					throw new Error(payload?.message || 'Unable to save system settings.');
				}

				applyState(payload);
				setFeedback('success', 'System settings saved successfully.');
				return true;
			} catch (error) {
				setFeedback('error', error.message || 'Unable to save system settings.');
				return false;
			} finally {
				isSaving = false;
				updateButtonState();
			}
		};

		const runCleanup = async (path, successMessage) => {
			if (isRunningCleanup) {
				return;
			}

			isRunningCleanup = true;
			updateButtonState();
			try {
				const response = await fetch(`${apiBasePath}${path}`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						[csrfHeader]: csrfToken
					},
					credentials: 'same-origin'
				});

				const payload = await readJson(response);
				if (!response.ok || !payload) {
					throw new Error(payload?.message || 'Unable to run the cleanup action.');
				}

				await fetchSettings();
				setFeedback('success', payload.message || successMessage);
			} catch (error) {
				setFeedback('error', error.message || 'Unable to run the cleanup action.');
			} finally {
				isRunningCleanup = false;
				updateButtonState();
			}
		};

		fields.cleanupEnabled.addEventListener('change', () => {
			syncCleanupEnabledState();
			updateButtonState();
		});

		fields.downloadBaseUrl.addEventListener('input', () => {
			setFieldInvalid(fields.downloadBaseUrl, false);
			updateButtonState();
		});

		timezoneDropdown.trigger.addEventListener('click', () => {
			if (timezoneDropdown.trigger.disabled) {
				return;
			}

			if (timezoneDropdown.list.hidden) {
				openTimezoneDropdown();
			} else {
				closeTimezoneDropdown();
			}
		});

		timezoneDropdown.trigger.addEventListener('keydown', (event) => {
			if (timezoneDropdown.trigger.disabled) {
				return;
			}

			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openTimezoneDropdown();
			}

			if (event.key === 'Escape') {
				closeTimezoneDropdown();
			}
		});

		timezoneDropdown.options.forEach((option) => {
			option.addEventListener('click', () => {
				fields.cleanupTimezone.value = option.dataset.value || 'Asia/Bangkok';
				syncTimezoneDropdown();
				setFieldInvalid(fields.cleanupTimezone, false);
				closeTimezoneDropdown();
				timezoneDropdown.trigger.focus();
				updateButtonState();
			});
		});

		frequencyDropdown.trigger.addEventListener('click', () => {
			if (frequencyDropdown.trigger.disabled) {
				return;
			}

			if (frequencyDropdown.list.hidden) {
				openFrequencyDropdown();
			} else {
				closeFrequencyDropdown();
			}
		});

		frequencyDropdown.trigger.addEventListener('keydown', (event) => {
			if (frequencyDropdown.trigger.disabled) {
				return;
			}

			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openFrequencyDropdown();
			}

			if (event.key === 'Escape') {
				closeFrequencyDropdown();
			}
		});

		frequencyDropdown.options.forEach((option) => {
			option.addEventListener('click', () => {
				fields.cleanupFrequency.value = option.dataset.value || 'Monthly';
				syncFrequencyDropdown();
				setFieldInvalid(fields.cleanupFrequency, false);
				closeFrequencyDropdown();
				frequencyDropdown.trigger.focus();
				updateButtonState();
			});
		});

		timePicker.trigger.addEventListener('click', () => {
			if (timePicker.trigger.disabled) {
				return;
			}

			if (timePicker.panel.hidden) {
				openTimePicker();
			} else {
				closeTimePicker();
			}
		});

		timePicker.trigger.addEventListener('keydown', (event) => {
			if (timePicker.trigger.disabled) {
				return;
			}

			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openTimePicker();
			}

			if (event.key === 'Escape') {
				closeTimePicker();
			}
		});

		timeValueDropdowns.forEach((dropdown) => {
			populateTimeDropdown(dropdown.list, dropdown.maxValue);
			syncTimeValueDropdown(dropdown);

			dropdown.trigger.addEventListener('click', () => {
				if (dropdown.trigger.disabled) {
					return;
				}

				if (dropdown.list.hidden) {
					openTimeValueDropdown(dropdown);
				} else {
					closeTimeValueDropdown(dropdown);
				}
			});

			dropdown.trigger.addEventListener('keydown', (event) => {
				if (dropdown.trigger.disabled) {
					return;
				}

				if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					openTimeValueDropdown(dropdown);
				}

				if (event.key === 'Escape') {
					closeTimeValueDropdown(dropdown);
				}
			});

			Array.from(dropdown.list.querySelectorAll('.settings-dropdown-option')).forEach((option) => {
				option.addEventListener('click', () => {
					dropdown.input.value = option.dataset.value || '00';
					syncTimeValueDropdown(dropdown);
					setFieldInvalid(fields.cleanupTime, false);
					closeTimeValueDropdown(dropdown);
					dropdown.trigger.focus();
				});
			});
		});

		timePicker.apply.addEventListener('click', () => {
			applyTimePicker();
		});

		document.addEventListener('click', (event) => {
			if (!frequencyDropdown.trigger.closest('.field')?.contains(event.target)) {
				closeFrequencyDropdown();
			}

			if (!timezoneDropdown.trigger.closest('.field')?.contains(event.target)) {
				closeTimezoneDropdown();
			}

			if (!timePicker.trigger.closest('.field')?.contains(event.target)) {
				closeTimePicker();
			}

			timeValueDropdowns.forEach((dropdown) => {
				if (!dropdown.trigger.closest('.settings-time-field')?.contains(event.target)) {
					closeTimeValueDropdown(dropdown);
				}
			});
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeFrequencyDropdown();
				closeTimezoneDropdown();
				closeTimePicker();
				timeValueDropdowns.forEach(closeTimeValueDropdown);
			}
		});

		saveDialog.addEventListener('app-dialog:confirm', () => {
			void saveSettings();
		});

		unsavedDialog.addEventListener('app-dialog:confirm', async () => {
			const saved = await saveSettings();
			if (saved && pendingNavigationHref) {
				navigateTo(pendingNavigationHref);
			}
		});

		unsavedDialog.addEventListener('app-dialog:discard', () => {
			if (pendingNavigationHref) {
				navigateTo(pendingNavigationHref);
			}
		});

		clearGeneratedDialog.addEventListener('app-dialog:confirm', () => {
			void runCleanup('/cleanup/generated-files-and-logs', 'Logs and generated report files cleared successfully.');
		});

		clearAllDialog.addEventListener('app-dialog:confirm', () => {
			void runCleanup('/cleanup/all', 'All system data cleared successfully.');
		});

		backLink.addEventListener('click', (event) => {
			if (!isDirty()) {
				return;
			}

			event.preventDefault();
			pendingNavigationHref = backLink.href;
			window.AppDialog?.open(unsavedDialog);
		});

		window.addEventListener('beforeunload', (event) => {
			if (!suppressBeforeUnload && isDirty()) {
				event.preventDefault();
				event.returnValue = '';
			}
		});

		void fetchSettings().catch((error) => {
			setFeedback('error', error.message || 'Unable to load system settings.');
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();