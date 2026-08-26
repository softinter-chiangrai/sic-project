(() => {
	const editBasePath = '/data-sources/edit';
	const apiBasePath = '/api/data-sources';

	const emptyState = () => ({
		id: null,
		databaseName: '',
		connectionLabel: '',
		databaseType: '',
		hostAddress: '',
		port: '',
		connectTimeoutSeconds: '10',
		socketTimeoutSeconds: '30',
		username: '',
		password: ''
	});

	const stateToPayload = (state) => ({
		databaseName: state.databaseName,
		connectionLabel: state.connectionLabel,
		databaseType: state.databaseType || null,
		hostAddress: state.hostAddress,
		port: state.port ? Number(state.port) : null,
		connectTimeoutSeconds: state.connectTimeoutSeconds ? Number(state.connectTimeoutSeconds) : null,
		socketTimeoutSeconds: state.socketTimeoutSeconds ? Number(state.socketTimeoutSeconds) : null,
		username: state.username,
		password: state.password
	});

	const normaliseState = (state) => ({
		id: state.id == null ? null : Number(state.id),
		databaseName: state.databaseName?.trim() || '',
		connectionLabel: state.connectionLabel?.trim() || '',
		databaseType: state.databaseType || '',
		hostAddress: state.hostAddress?.trim() || '',
		port: state.port == null ? '' : String(state.port).trim(),
		connectTimeoutSeconds: state.connectTimeoutSeconds == null ? '10' : String(state.connectTimeoutSeconds).trim(),
		socketTimeoutSeconds: state.socketTimeoutSeconds == null ? '30' : String(state.socketTimeoutSeconds).trim(),
		username: state.username?.trim() || '',
		password: state.password || ''
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
			databaseName: document.getElementById('database-name'),
			connectionLabel: document.getElementById('connection-label'),
			databaseType: document.getElementById('database-type'),
			hostAddress: document.getElementById('host-address'),
			port: document.getElementById('host-port'),
			connectTimeoutSeconds: document.getElementById('connect-timeout-seconds'),
			socketTimeoutSeconds: document.getElementById('socket-timeout-seconds'),
			username: document.getElementById('db-username'),
			password: document.getElementById('db-password')
		};
		const typeButtons = Array.from(document.querySelectorAll('[data-db-type]'));
		const saveButton = document.getElementById('save-data-source');
		const backLink = document.getElementById('back-to-sources');
		const saveDialog = document.getElementById('save-confirm-modal');
		const unsavedDialog = document.getElementById('unsaved-changes-modal');
		const testConnectionButton = document.getElementById('test-connection');
		const healthAlert = document.getElementById('connection-health-alert');
		const healthAlertMessage = document.getElementById('connection-health-alert-message');
		const connectionStatusValue = document.getElementById('connection-status-value');
		const connectionTestedValue = document.getElementById('connection-tested-value');
		const connectionResponseValue = document.getElementById('connection-response-value');
		const pageIntroTitle = document.querySelector('.page-intro h2');
		const breadcrumbsTitle = document.querySelector('.breadcrumbs strong');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';
		const dataSourceIdMeta = document.querySelector('meta[name="data_source_id"]');
		const databaseTypeGroup = document.querySelector('.option-grid[aria-label="Database Type"]');
		const databaseTypeLabel = document.querySelector('.group-label');

		if (Object.values(fields).some((field) => !field) || !saveButton || !backLink || !saveDialog || !unsavedDialog || !testConnectionButton) {
			return;
		}

		let baselineState = emptyState();
		let currentDataSourceId = dataSourceIdMeta?.getAttribute('content') ? Number(dataSourceIdMeta.getAttribute('content')) : null;
		let pendingNavigationHref = null;
		let isSaving = false;
		let isTesting = false;
		let hasSavedPassword = false;
		let suppressBeforeUnload = false;
		const healthToast = window.AppToast?.create({
			alertElement: healthAlert,
			messageElement: healthAlertMessage
		});

		const getCurrentState = () => normaliseState({
			id: currentDataSourceId,
			databaseName: fields.databaseName.value,
			connectionLabel: fields.connectionLabel.value,
			databaseType: fields.databaseType.value,
			hostAddress: fields.hostAddress.value,
			port: fields.port.value,
			connectTimeoutSeconds: fields.connectTimeoutSeconds.value,
			socketTimeoutSeconds: fields.socketTimeoutSeconds.value,
			username: fields.username.value,
			password: fields.password.value
		});

		const isDirty = () => JSON.stringify(getCurrentState()) !== JSON.stringify(baselineState);

		const setButtonState = () => {
			saveButton.disabled = isSaving || !isDirty();
			testConnectionButton.disabled = isTesting;
		};

		const setHealthAlert = (variant, message) => {
			healthToast?.show(variant, message);
		};

		const setFieldInvalid = (field, invalid) => {
			if (!field) {
				return;
			}

			field.classList.toggle('is-invalid', invalid);
			field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
			field.closest('.field')?.classList.toggle('field--invalid', invalid);
		};

		const setDatabaseTypeInvalid = (invalid) => {
			databaseTypeGroup?.classList.toggle('option-grid--invalid', invalid);
			databaseTypeLabel?.classList.toggle('group-label--invalid', invalid);
			fields.databaseType.setAttribute('aria-invalid', invalid ? 'true' : 'false');
		};

		const requiresPassword = () => !currentDataSourceId || !hasSavedPassword;

		const sanitizeDigitsOnly = (field) => {
			if (!field) {
				return;
			}

			field.value = field.value.replace(/\D/g, '');
		};

		const validateDataSourceBeforeSave = () => {
			let isValid = true;
			let firstInvalidField = null;

			const validatePositiveIntegerField = (field) => {
				const trimmedValue = field.value.trim();
				const numericValue = Number(trimmedValue);
				const invalid = !trimmedValue || !Number.isInteger(numericValue) || numericValue <= 0;
				setFieldInvalid(field, invalid);
				if (invalid) {
					isValid = false;
					firstInvalidField = firstInvalidField || field;
				}
			};

			const validations = [
				[fields.connectionLabel, !fields.connectionLabel.value.trim()],
				[fields.databaseName, !fields.databaseName.value.trim()],
				[fields.hostAddress, !fields.hostAddress.value.trim()],
				[fields.username, !fields.username.value.trim()]
			];

			validations.forEach(([field, invalid]) => {
				setFieldInvalid(field, invalid);
				if (invalid) {
					isValid = false;
					firstInvalidField = firstInvalidField || field;
				}
			});

			const portValue = Number(fields.port.value);
			const invalidPort = !fields.port.value.trim() || Number.isNaN(portValue) || portValue <= 0;
			setFieldInvalid(fields.port, invalidPort);
			if (invalidPort) {
				isValid = false;
				firstInvalidField = firstInvalidField || fields.port;
			}

			validatePositiveIntegerField(fields.connectTimeoutSeconds);
			validatePositiveIntegerField(fields.socketTimeoutSeconds);

			const missingDatabaseType = !fields.databaseType.value;
			setDatabaseTypeInvalid(missingDatabaseType);
			if (missingDatabaseType) {
				isValid = false;
			}

			const passwordMissing = requiresPassword() && !fields.password.value.trim();
			setFieldInvalid(fields.password, passwordMissing);
			if (passwordMissing) {
				isValid = false;
				firstInvalidField = firstInvalidField || fields.password;
			}

			if (!isValid) {
				firstInvalidField?.focus();
				setHealthAlert('error', 'Complete the required fields before saving the data source.');
			}

			return isValid;
		};

		const updateConnectionHealth = (status, lastTested, responseTime) => {
			connectionStatusValue.textContent = status;
			connectionTestedValue.textContent = lastTested;
			connectionResponseValue.textContent = responseTime;
		};

		const updateCurrentDataSourceId = (id) => {
			currentDataSourceId = id == null ? null : Number(id);
			if (dataSourceIdMeta) {
				dataSourceIdMeta.setAttribute('content', String(currentDataSourceId));
			}
		};

		const updatePageHistory = () => {
			if (!currentDataSourceId) {
				return;
			}

			const nextUrl = `${editBasePath}/${currentDataSourceId}`;
			window.history.replaceState({ dataSourceId: currentDataSourceId }, '', nextUrl);
		};

		const updatePageMode = () => {
			if (!currentDataSourceId) {
				return;
			}

			if (pageIntroTitle) {
				pageIntroTitle.textContent = 'Edit Data Source';
			}

			if (breadcrumbsTitle) {
				breadcrumbsTitle.textContent = 'Edit Data Source';
			}

			document.title = 'Jasper Report Server | Edit Data Source';
		};

		const updatePasswordFieldState = () => {
			if (currentDataSourceId && hasSavedPassword) {
				fields.password.placeholder = 'Leave blank to keep current password';
				fields.password.setAttribute('aria-label', 'Password, leave blank to keep current password');
				return;
			}

			fields.password.placeholder = 'Enter password';
			fields.password.setAttribute('aria-label', 'Password');
		};

		const navigateTo = (href) => {
			if (!href) {
				return;
			}

			suppressBeforeUnload = true;
			window.location.assign(href);
		};

		const updateSelectedType = (databaseType, preservePort = false) => {
			typeButtons.forEach((button) => {
				const isSelected = button.dataset.dbType === databaseType;
				button.classList.toggle('is-active', isSelected);
				button.setAttribute('aria-pressed', String(isSelected));
			});

			fields.databaseType.value = databaseType || '';
			const selectedButton = typeButtons.find((button) => button.dataset.dbType === databaseType);
			if (selectedButton && (!preservePort || !fields.port.value.trim())) {
				fields.port.value = selectedButton.dataset.defaultPort || '';
			}
		};

		const applyState = (state) => {
			const nextState = normaliseState(state || emptyState());
			updateCurrentDataSourceId(nextState.id);
			hasSavedPassword = Boolean(state?.passwordConfigured);
			fields.databaseName.value = nextState.databaseName;
			fields.connectionLabel.value = nextState.connectionLabel;
			fields.hostAddress.value = nextState.hostAddress;
			fields.port.value = nextState.port;
			fields.connectTimeoutSeconds.value = nextState.connectTimeoutSeconds;
			fields.socketTimeoutSeconds.value = nextState.socketTimeoutSeconds;
			fields.username.value = nextState.username;
			fields.password.value = '';
			updatePasswordFieldState();
			updateSelectedType(nextState.databaseType, true);
			Object.values(fields).forEach((field) => setFieldInvalid(field, false));
			setDatabaseTypeInvalid(false);
			updatePageMode();
			baselineState = getCurrentState();
			setButtonState();
		};

		const fetchCurrentConfig = async () => {
			if (!currentDataSourceId) {
				hasSavedPassword = false;
				applyState(emptyState());
				updateConnectionHealth('Not tested', '-', '-');
				return;
			}

			try {
				const response = await fetch(`${apiBasePath}/${currentDataSourceId}`, {
					headers: {
						'Accept': 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error('Unable to load the saved data source configuration.');
				}

				const payload = await response.json();
				applyState(payload);
				updateConnectionHealth(payload.status || 'Not tested', payload.lastTested || '-', payload.responseTime || '-');
			} catch (error) {
				setHealthAlert('error', error.message || 'Unable to load the saved data source configuration.');
			}
		};

		const saveCurrentConfig = async () => {
			if (isSaving) {
				return false;
			}

			if (!validateDataSourceBeforeSave()) {
				return false;
			}

			isSaving = true;
			setButtonState();

			try {
				const response = await fetch(currentDataSourceId ? `${apiBasePath}/${currentDataSourceId}` : apiBasePath, {
					method: currentDataSourceId ? 'PUT' : 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify(stateToPayload(getCurrentState()))
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to save the data source configuration.');
				}

				applyState(payload);
				updatePageHistory();
				updatePageMode();
				setHealthAlert('success', `Data source #${payload.id} saved successfully.`);
				return true;
			} catch (error) {
				setHealthAlert('error', error.message || 'Unable to save the data source configuration.');
				return false;
			} finally {
				isSaving = false;
				setButtonState();
			}
		};

		const testSavedConnection = async () => {
			if (isTesting) {
				return;
			}

			isTesting = true;
			setButtonState();

			if (!currentDataSourceId) {
				isTesting = false;
				setButtonState();
				updateConnectionHealth('Save required', '-', '-');
				setHealthAlert('error', 'Save the data source before testing the connection.');
				return;
			}

			try {
				const response = await fetch(`${apiBasePath}/${currentDataSourceId}/test`, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						[csrfHeader]: csrfToken
					}
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to test the saved connection right now.');
				}

				updateConnectionHealth(payload.status || '-', payload.lastTested || '-', payload.responseTime || '-');
				setHealthAlert(payload.success ? 'success' : 'error', payload.message || 'Connection test finished.');
			} catch (_error) {
				updateConnectionHealth('Failed', '-', '-');
				setHealthAlert('error', 'Unable to test the saved connection right now.');
			} finally {
				isTesting = false;
				setButtonState();
			}
		};

		const openUnsavedDialog = (href) => {
			pendingNavigationHref = href;
			window.AppDialog?.open(unsavedDialog);
		};

		typeButtons.forEach((button) => {
			button.addEventListener('click', () => {
				updateSelectedType(button.dataset.dbType || '');
				setDatabaseTypeInvalid(false);
				setButtonState();
			});
		});

		fields.port.addEventListener('input', () => {
			sanitizeDigitsOnly(fields.port);
		});

		Object.values(fields).forEach((field) => {
			field.addEventListener('input', () => {
				setFieldInvalid(field, false);
				setButtonState();
			});
			field.addEventListener('change', () => {
				setFieldInvalid(field, false);
				setButtonState();
			});
		});

		saveButton.addEventListener('click', (event) => {
			if (validateDataSourceBeforeSave()) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();
		}, true);

		backLink.addEventListener('click', (event) => {
			if (!isDirty()) {
				return;
			}

			event.preventDefault();
			openUnsavedDialog(backLink.href);
		});

		saveDialog.addEventListener('app-dialog:confirm', async () => {
			await saveCurrentConfig();
		});

		unsavedDialog.addEventListener('app-dialog:confirm', async () => {
			const saved = await saveCurrentConfig();
			if (saved && pendingNavigationHref) {
				navigateTo(pendingNavigationHref);
			}
		});

		unsavedDialog.addEventListener('app-dialog:discard', () => {
			if (pendingNavigationHref) {
				navigateTo(pendingNavigationHref);
			}
		});

		unsavedDialog.addEventListener('app-dialog:cancel', () => {
			suppressBeforeUnload = false;
			pendingNavigationHref = null;
		});

		testConnectionButton.addEventListener('click', testSavedConnection);

		window.addEventListener('beforeunload', (event) => {
			if (suppressBeforeUnload || !isDirty()) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		});

		fetchCurrentConfig();
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();