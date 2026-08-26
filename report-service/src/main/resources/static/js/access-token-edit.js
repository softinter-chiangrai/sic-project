(() => {
	const editBasePath = '/access-tokens/edit';
	const apiBasePath = '/api/access-tokens';

	const emptyState = () => ({
		id: null,
		tokenName: '',
		description: '',
		expiryPolicy: '',
		status: ''
	});

	const normaliseState = (state) => ({
		id: state.id == null ? null : Number(state.id),
		tokenName: state.tokenName?.trim() || '',
		description: state.description?.trim() || '',
		expiryPolicy: state.expiryPolicy || '',
		status: state.status || ''
	});

	const stateToPayload = (state) => ({
		tokenName: state.tokenName,
		description: state.description,
		expiryPolicy: state.expiryPolicy,
		status: state.status
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
			tokenName: document.getElementById('token-name'),
			description: document.getElementById('token-description'),
			expiryPolicy: document.getElementById('token-expiry'),
			status: document.getElementById('token-status')
		};
		const saveButton = document.getElementById('save-access-token');
		const backLink = document.getElementById('back-to-tokens');
		const generateButton = document.getElementById('generate-token');
		const registerButton = document.getElementById('register-token');
		const revokeButton = document.getElementById('revoke-token');
		const saveDialog = document.getElementById('save-access-token-modal');
		const unsavedDialog = document.getElementById('unsaved-access-token-modal');
		const generateDialog = document.getElementById('generate-access-token-modal');
		const registerDialog = document.getElementById('register-access-token-modal');
		const revokeDialog = document.getElementById('revoke-access-token-modal');
		const revealDialog = document.getElementById('access-token-reveal-modal');
		const revealTextarea = document.getElementById('generated-token-value');
		const manualTokenValue = document.getElementById('manual-token-value');
		const copyGeneratedTokenButton = document.getElementById('copy-generated-token');
		const maskedApiKey = document.getElementById('masked-api-key');
		const createdAt = document.getElementById('token-created-at');
		const lastUsedAt = document.getElementById('token-last-used');
		const callsToday = document.getElementById('token-calls-today');
		const errorRate = document.getElementById('token-error-rate');
		const feedbackAlert = document.getElementById('token-feedback-alert');
		const feedbackMessage = document.getElementById('token-feedback-message');
		const pageIntroTitle = document.querySelector('.page-intro h2');
		const breadcrumbsTitle = document.querySelector('.breadcrumbs strong');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';
		const accessTokenIdMeta = document.querySelector('meta[name="access_token_id"]');
		const summaryCopyButtons = document.querySelectorAll('[data-copy-target]');

		if (Object.values(fields).some((field) => !field) || !saveButton || !backLink || !generateButton || !registerButton || !revokeButton || !saveDialog || !unsavedDialog || !generateDialog || !registerDialog || !revokeDialog || !revealDialog || !revealTextarea || !manualTokenValue || !maskedApiKey || !createdAt || !lastUsedAt || !callsToday || !errorRate) {
			return;
		}

		let baselineState = emptyState();
		let currentAccessTokenId = accessTokenIdMeta?.getAttribute('content') ? Number(accessTokenIdMeta.getAttribute('content')) : null;
		let pendingNavigationHref = null;
		let isSaving = false;
		let isGenerating = false;
		let isRevoking = false;
		let suppressBeforeUnload = false;
		let lastGeneratedToken = '';
		let currentTokenValue = '';
		const feedbackToast = window.AppToast?.create({
			alertElement: feedbackAlert,
			messageElement: feedbackMessage
		});

		const getCurrentState = () => normaliseState({
			id: currentAccessTokenId,
			tokenName: fields.tokenName.value,
			description: fields.description.value,
			expiryPolicy: fields.expiryPolicy.value,
			status: fields.status.value
		});

		const isDirty = () => JSON.stringify(getCurrentState()) !== JSON.stringify(baselineState);

		const setFeedbackAlert = (variant, message) => {
			feedbackToast?.show(variant, message);
		};

		const setFieldInvalid = (field, invalid) => {
			if (!field) {
				return;
			}

			field.classList.toggle('is-invalid', invalid);
			field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
			field.closest('.field')?.classList.toggle('field--invalid', invalid);
		};

		const validateAccessTokenBeforeSave = () => {
			let isValid = true;
			let firstInvalidField = null;

			const validations = [
				[fields.tokenName, !fields.tokenName.value.trim()],
				[fields.expiryPolicy, !fields.expiryPolicy.value.trim()],
				[fields.status, !fields.status.value.trim()]
			];

			validations.forEach(([field, invalid]) => {
				setFieldInvalid(field, invalid);
				if (invalid) {
					isValid = false;
					firstInvalidField = firstInvalidField || field;
				}
			});

			if (!isValid) {
				firstInvalidField?.focus();
				setFeedbackAlert('error', 'Complete the required fields before saving the access token.');
			}

			return isValid;
		};

		const flashCopyFeedback = (variant, message) => {
			setFeedbackAlert(variant, message);
		};

		const updateButtonState = () => {
			const hasExistingRecord = Boolean(currentAccessTokenId);
			const isRevoked = fields.status.value === 'Revoked';
			saveButton.disabled = isSaving || !isDirty();
			generateButton.disabled = isGenerating || !hasExistingRecord;
			registerButton.disabled = isGenerating || !hasExistingRecord;
			revokeButton.disabled = isRevoking || !hasExistingRecord || isRevoked;
		};

		const updateCurrentAccessTokenId = (id) => {
			currentAccessTokenId = id == null ? null : Number(id);
			if (accessTokenIdMeta) {
				accessTokenIdMeta.setAttribute('content', String(currentAccessTokenId));
			}
		};

		const updatePageHistory = () => {
			if (!currentAccessTokenId) {
				return;
			}

			window.history.replaceState({ accessTokenId: currentAccessTokenId }, '', `${editBasePath}/${currentAccessTokenId}`);
		};

		const updatePageMode = () => {
			if (!currentAccessTokenId) {
				return;
			}

			if (pageIntroTitle) {
				pageIntroTitle.textContent = 'Edit Access Token';
			}

			if (breadcrumbsTitle) {
				breadcrumbsTitle.textContent = 'Edit Access Token';
			}

			document.title = 'Jasper Report Server | Edit Access Token';
		};

		const navigateTo = (href) => {
			if (!href) {
				return;
			}

			suppressBeforeUnload = true;
			window.location.assign(href);
		};

		const applySummary = (payload) => {
			currentTokenValue = payload.tokenValue || '';
			maskedApiKey.textContent = payload.maskedApiKey || 'Not generated';
			createdAt.textContent = payload.created || '-';
			lastUsedAt.textContent = payload.lastUsed || '-';
			callsToday.textContent = payload.callsToday || '0';
			errorRate.textContent = payload.errorRate || '--';
		};

		const applyState = (payload) => {
			const nextState = normaliseState(payload || emptyState());
			updateCurrentAccessTokenId(nextState.id);
			fields.tokenName.value = nextState.tokenName;
			fields.description.value = nextState.description;
			fields.expiryPolicy.value = nextState.expiryPolicy;
			fields.status.value = nextState.status;
			window.AppCustomDropdowns?.sync(fields.expiryPolicy);
			window.AppCustomDropdowns?.sync(fields.status);
			Object.values(fields).forEach((field) => setFieldInvalid(field, false));
			applySummary(payload || {});
			updatePageMode();
			baselineState = getCurrentState();
			updateButtonState();
		};

		const resetButtonAriaLabel = (button, defaultLabel) => {
			if (!button || !defaultLabel) {
				return;
			}

			window.setTimeout(() => {
				button.setAttribute('aria-label', defaultLabel);
			}, 1800);
		};

		const copyText = async (value, button, successLabel, failureLabel, successMessage, emptyMessage) => {
			if (!value) {
				flashCopyFeedback('error', emptyMessage || 'No access token is available to copy.');
				return;
			}

			const defaultLabel = button?.getAttribute('aria-label') || '';

			try {
				await navigator.clipboard.writeText(value);
				if (button) {
					button.setAttribute('aria-label', successLabel);
				}
				flashCopyFeedback('success', successMessage || 'Access token copied to clipboard.');
			} catch {
				if (button) {
					button.setAttribute('aria-label', failureLabel);
				}
				flashCopyFeedback('error', 'Unable to copy the access token.');
			} finally {
				resetButtonAriaLabel(button, defaultLabel);
			}
		};

		const fetchCurrentToken = async () => {
			if (!currentAccessTokenId) {
				applyState({
					...emptyState(),
					expiryPolicy: '30 days',
					status: 'Active',
					maskedApiKey: 'Not generated',
					tokenValue: '',
					created: '-',
					lastUsed: '-',
					callsToday: '0',
					errorRate: '--'
				});
				return;
			}

			try {
				const response = await fetch(`${apiBasePath}/${currentAccessTokenId}`, {
					headers: {
						'Accept': 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error('Unable to load the saved access token.');
				}

				const payload = await response.json();
				applyState(payload);
			} catch (error) {
				setFeedbackAlert('error', error.message || 'Unable to load the saved access token.');
			}
		};

		const saveCurrentToken = async () => {
			if (isSaving) {
				return false;
			}

			if (!validateAccessTokenBeforeSave()) {
				return false;
			}

			isSaving = true;
			updateButtonState();

			try {
				const response = await fetch(currentAccessTokenId ? `${apiBasePath}/${currentAccessTokenId}` : apiBasePath, {
					method: currentAccessTokenId ? 'PUT' : 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify(stateToPayload(getCurrentState()))
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to save the access token.');
				}

				applyState(payload);
				updatePageHistory();
				updatePageMode();
				setFeedbackAlert('success', `Access token #${payload.id} saved successfully.`);
				return true;
			} catch (error) {
				setFeedbackAlert('error', error.message || 'Unable to save the access token.');
				return false;
			} finally {
				isSaving = false;
				updateButtonState();
			}
		};

		const generateAccessToken = async () => {
			if (!currentAccessTokenId || isGenerating) {
				return;
			}

			isGenerating = true;
			updateButtonState();

			try {
				const response = await fetch(`${apiBasePath}/${currentAccessTokenId}/generate`, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						[csrfHeader]: csrfToken
					}
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to generate the access token.');
				}

				lastGeneratedToken = payload?.plainToken || '';
				revealTextarea.value = lastGeneratedToken;
				applyState(payload?.token || {});
				window.AppDialog?.open(revealDialog);
				setFeedbackAlert('success', 'A new access token was generated successfully.');
			} catch (error) {
				setFeedbackAlert('error', error.message || 'Unable to generate the access token.');
			} finally {
				isGenerating = false;
				updateButtonState();
			}
		};

		const registerAccessToken = async () => {
			if (!currentAccessTokenId || isGenerating) {
				return;
			}

			const tokenValue = manualTokenValue.value.trim();
			if (!tokenValue) {
				setFeedbackAlert('error', 'Enter a token value before registering it.');
				manualTokenValue.focus();
				return;
			}

			isGenerating = true;
			updateButtonState();

			try {
				const response = await fetch(`${apiBasePath}/${currentAccessTokenId}/register`, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						tokenValue
					})
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to register the access token.');
				}

				lastGeneratedToken = '';
				revealTextarea.value = '';
				applyState(payload);
				manualTokenValue.value = '';
				window.AppDialog?.close(registerDialog);
				setFeedbackAlert('success', 'Access token registered successfully.');
			} catch (error) {
				setFeedbackAlert('error', error.message || 'Unable to register the access token.');
			} finally {
				isGenerating = false;
				updateButtonState();
			}
		};

		const revokeAccessToken = async () => {
			if (!currentAccessTokenId || isRevoking) {
				return;
			}

			isRevoking = true;
			updateButtonState();

			try {
				const response = await fetch(`${apiBasePath}/${currentAccessTokenId}/revoke`, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						[csrfHeader]: csrfToken
					}
				});

				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to revoke the access token.');
				}

				applyState(payload);
				setFeedbackAlert('success', 'Access token revoked successfully.');
			} catch (error) {
				setFeedbackAlert('error', error.message || 'Unable to revoke the access token.');
			} finally {
				isRevoking = false;
				updateButtonState();
			}
		};

		const openUnsavedDialog = (href) => {
			pendingNavigationHref = href;
			window.AppDialog?.open(unsavedDialog);
		};

		Object.values(fields).forEach((field) => {
			field.addEventListener('input', () => {
				setFieldInvalid(field, false);
				updateButtonState();
			});
			field.addEventListener('change', () => {
				setFieldInvalid(field, false);
				updateButtonState();
			});
		});

		saveButton.addEventListener('click', (event) => {
			if (validateAccessTokenBeforeSave()) {
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

		summaryCopyButtons.forEach((button) => {
			button.addEventListener('click', async () => {
				const targetId = button.getAttribute('data-copy-target');
				const target = targetId ? document.getElementById(targetId) : null;
				const value = currentTokenValue || lastGeneratedToken || target?.textContent?.trim();
				await copyText(value, button, 'Copied access token', 'Unable to copy access token', 'Full access token copied to clipboard.', 'No stored access token is available to copy yet.');
			});
		});

		copyGeneratedTokenButton?.addEventListener('click', async () => {
			await copyText(lastGeneratedToken || currentTokenValue || revealTextarea.value.trim(), copyGeneratedTokenButton, 'Copied generated token', 'Unable to copy generated token', 'Generated access token copied to clipboard.', 'No generated token is available to copy.');
		});

		saveDialog.addEventListener('app-dialog:confirm', async () => {
			await saveCurrentToken();
		});

		unsavedDialog.addEventListener('app-dialog:confirm', async () => {
			const saved = await saveCurrentToken();
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

		generateDialog.addEventListener('app-dialog:confirm', async () => {
			await generateAccessToken();
		});

		registerDialog.addEventListener('app-dialog:confirm', async () => {
			await registerAccessToken();
		});

		registerDialog.addEventListener('app-dialog:cancel', () => {
			manualTokenValue.value = '';
		});

		revokeDialog.addEventListener('app-dialog:confirm', async () => {
			await revokeAccessToken();
		});

		window.addEventListener('beforeunload', (event) => {
			if (suppressBeforeUnload || !isDirty()) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		});

		fetchCurrentToken();
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();