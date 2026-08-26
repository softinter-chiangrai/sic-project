(() => {
	const apiBasePath = '/api/report-templates';
	const dataSourceApiBasePath = '/api/data-sources';
	const editBasePath = '/report-templates/edit';

	const readJson = async (response) => {
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return null;
		}

		return response.json();
	};

	const normalizeTemplateCode = (value) => (value || '')
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.trim();

	const domReady = () => {
		const fields = {
			templateCode: document.getElementById('template-code'),
			templateName: document.getElementById('template-name'),
			description: document.getElementById('template-description'),
			dataSourceId: document.getElementById('template-source'),
			fileInput: document.getElementById('template-file')
		};
		const chooseFileButton = document.getElementById('choose-template-file');
		const downloadFileButton = document.getElementById('download-template-file');
		const saveButton = document.getElementById('save-template');
		const previewButton = document.getElementById('preview-template');
		const generateButton = document.getElementById('generate-template');
		const reportFormatField = document.getElementById('generate-format');
		const backLink = document.getElementById('back-to-templates');
		const saveDialog = document.getElementById('save-template-modal');
		const unsavedDialog = document.getElementById('unsaved-template-modal');
		const previewDialog = document.getElementById('report-preview-modal');
		const previewStage = document.getElementById('report-preview-stage');
		const previewLoading = document.getElementById('report-preview-loading');
		const previewStatusIcon = document.getElementById('report-preview-status-icon');
		const previewStatusTitle = document.getElementById('report-preview-status-title');
		const previewStatusMessage = document.getElementById('report-preview-status-message');
		const previewFrame = document.getElementById('report-preview-frame');
		const parameterFields = document.getElementById('parameter-fields');
		const parameterEmptyState = document.getElementById('parameter-empty-state');
		const uploadNote = document.getElementById('upload-note');
		const uploadBox = document.querySelector('.upload-box');
		const feedbackAlert = document.getElementById('template-feedback-alert');
		const feedbackMessage = document.getElementById('template-feedback-message');
		const previewFeedbackAlert = document.getElementById('template-preview-feedback-alert');
		const previewFeedbackMessage = document.getElementById('template-preview-feedback-message');
		const summaryCurrentSource = document.getElementById('summary-current-source');
		const summaryLastPublished = document.getElementById('summary-last-published');
		const summaryAverageRuntime = document.getElementById('summary-average-runtime');
		const summaryMonthlyRuns = document.getElementById('summary-monthly-runs');
		const pageIntroTitle = document.querySelector('.page-intro h2');
		const breadcrumbsTitle = document.querySelector('.breadcrumbs strong');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';
		const templateIdMeta = document.querySelector('meta[name="report_template_id"]');

		if (Object.values(fields).some((field) => !field) || !chooseFileButton || !downloadFileButton || !saveButton || !previewButton || !generateButton || !reportFormatField || !backLink || !saveDialog || !unsavedDialog || !previewDialog || !previewStage || !previewLoading || !previewStatusIcon || !previewStatusTitle || !previewStatusMessage || !previewFrame || !parameterFields || !uploadNote || !feedbackAlert || !feedbackMessage || !previewFeedbackAlert || !previewFeedbackMessage) {
			return;
		}

		let currentTemplateId = templateIdMeta?.getAttribute('content') ? Number(templateIdMeta.getAttribute('content')) : null;
		let currentUploadToken = '';
		let currentFileName = '';
		let currentUploadedAt = '-';
		let currentParameterDefinitions = [];
		let pendingNavigationHref = null;
		let pendingSelectedDataSourceId = '';
		let isSaving = false;
		let isUploading = false;
		let isPreviewing = false;
		let isGenerating = false;
		let suppressBeforeUnload = false;
		let previewObjectUrl = null;
		let previewRequestId = 0;
		let previewFrameRequestId = 0;
		let baselineState = '';
		let availableDataSources = [];
		let existingTemplates = [];
		const feedbackToast = window.AppToast?.create({
			alertElement: feedbackAlert,
			messageElement: feedbackMessage
		});
		const previewFeedbackToast = window.AppToast?.create({
			alertElement: previewFeedbackAlert,
			messageElement: previewFeedbackMessage
		});

		const setFeedback = (variant, message) => {
			const activeToast = previewDialog.open ? previewFeedbackToast : feedbackToast;
			const inactiveToast = previewDialog.open ? feedbackToast : previewFeedbackToast;
			inactiveToast?.hide();
			activeToast?.show(variant, message);
		};

		const setFieldInvalid = (field, invalid) => {
			if (!field) {
				return;
			}

			field.classList.toggle('is-invalid', invalid);
			field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
			field.closest('.field')?.classList.toggle('field--invalid', invalid);
		};

		const setUploadInvalid = (invalid) => {
			uploadBox?.classList.toggle('upload-box--invalid', invalid);
		};

		const findDuplicateTemplateCode = (templateCode) => {
			if (!templateCode) {
				return null;
			}

			return existingTemplates.find((template) => normalizeTemplateCode(template.templateCode) === templateCode && Number(template.id) !== currentTemplateId) || null;
		};

		const validateUniqueTemplateCode = ({ showFeedback = false } = {}) => {
			const normalizedTemplateCode = normalizeTemplateCode(fields.templateCode.value);
			if (fields.templateCode.value !== normalizedTemplateCode) {
				fields.templateCode.value = normalizedTemplateCode;
			}

			const duplicateTemplate = findDuplicateTemplateCode(normalizedTemplateCode);
			const duplicateMessage = duplicateTemplate ? 'Template Code is already in use by another report template.' : '';
			fields.templateCode.setCustomValidity(duplicateMessage);
			setFieldInvalid(fields.templateCode, Boolean(duplicateTemplate));

			if (duplicateTemplate && showFeedback) {
				fields.templateCode.focus();
				setFeedback('error', duplicateMessage);
			}

			return !duplicateTemplate;
		};

		const validateTemplateBeforeSave = () => {
			let isValid = true;
			let firstInvalidField = null;
			const templateCodeIsUnique = validateUniqueTemplateCode();
			if (!templateCodeIsUnique) {
				isValid = false;
				firstInvalidField = firstInvalidField || fields.templateCode;
			}

			const templateNameMissing = !fields.templateName.value.trim();
			setFieldInvalid(fields.templateName, templateNameMissing);
			if (templateNameMissing) {
				isValid = false;
				firstInvalidField = firstInvalidField || fields.templateName;
			}

			const uploadMissing = !currentTemplateId && !currentUploadToken;
			setUploadInvalid(uploadMissing);
			if (uploadMissing) {
				isValid = false;
			}

			if (!isValid) {
				if (!templateCodeIsUnique) {
					validateUniqueTemplateCode({ showFeedback: true });
					return false;
				}

				firstInvalidField?.focus();
				setFeedback('error', 'Complete the required fields before saving the report template.');
			}

			return isValid;
		};

		const resetButtonAriaLabel = (button, defaultLabel) => {
			if (!button || !defaultLabel) {
				return;
			}

			window.setTimeout(() => {
				button.setAttribute('aria-label', defaultLabel);
			}, 1800);
		};

		const writeTextToClipboard = async (value) => {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
				return;
			}

			const fallbackInput = document.createElement('textarea');
			fallbackInput.value = value;
			fallbackInput.setAttribute('readonly', 'readonly');
			fallbackInput.style.position = 'fixed';
			fallbackInput.style.opacity = '0';
			fallbackInput.style.pointerEvents = 'none';
			document.body.append(fallbackInput);
			fallbackInput.focus();
			fallbackInput.select();

			const copied = document.execCommand('copy');
			fallbackInput.remove();

			if (!copied) {
				throw new Error('Unable to copy text.');
			}
		};

		const copyParameterName = async (parameterName, button) => {
			if (!parameterName) {
				setFeedback('error', 'No parameter name is available to copy.');
				return;
			}

			const defaultLabel = button?.getAttribute('aria-label') || '';

			try {
				await writeTextToClipboard(parameterName);
				if (button) {
					button.setAttribute('aria-label', 'Copied parameter name');
				}
				setFeedback('success', `Parameter name "${parameterName}" copied to clipboard.`);
			} catch {
				if (button) {
					button.setAttribute('aria-label', 'Unable to copy parameter name');
				}
				setFeedback('error', `Unable to copy parameter name "${parameterName}".`);
			} finally {
				resetButtonAriaLabel(button, defaultLabel);
			}
		};

		const snapshotState = () => JSON.stringify({
			id: currentTemplateId,
			templateCode: normalizeTemplateCode(fields.templateCode.value),
			templateName: fields.templateName.value.trim(),
			description: fields.description.value.trim(),
			dataSourceId: fields.dataSourceId.value || '',
			uploadToken: currentUploadToken,
			fileName: currentFileName,
			parameterSignature: currentParameterDefinitions.map((parameter) => `${parameter.name}:${parameter.valueClassName}:${parameter.inputType}`).join('|')
		});

		const isDirty = () => snapshotState() !== baselineState;

		const updateButtonState = () => {
			saveButton.disabled = isSaving || isGenerating || !isDirty();
			previewButton.disabled = isPreviewing || isUploading || isGenerating || isSaving || (!currentUploadToken && !currentTemplateId);
			generateButton.disabled = isGenerating || isUploading || isPreviewing || isSaving || (!currentUploadToken && !currentTemplateId);
			chooseFileButton.disabled = isUploading || isGenerating;
			downloadFileButton.disabled = isUploading || isGenerating || (!currentUploadToken && !currentTemplateId) || !currentFileName;
		};

		const currentDownloadUrl = () => currentUploadToken
			? `${apiBasePath}/download?uploadToken=${encodeURIComponent(currentUploadToken)}`
			: currentTemplateId
				? `${apiBasePath}/${currentTemplateId}/jrxml`
				: '';

		const startDownload = (downloadUrl) => {
			if (!downloadUrl) {
				return;
			}

			const link = document.createElement('a');
			link.href = downloadUrl;
			link.rel = 'noopener';
			link.hidden = true;
			document.body.append(link);
			link.click();
			link.remove();
		};

		const currentGenerateFormat = () => {
			const normalizedValue = (reportFormatField.value || '').trim().toLowerCase();
			return normalizedValue || 'pdf';
		};

		const updateSummary = ({ dataSourceName = '-', lastPublished = '-', averageRuntime = '-', monthlyRuns = '-' } = {}) => {
			summaryCurrentSource.textContent = dataSourceName || '-';
			summaryLastPublished.textContent = lastPublished || '-';
			summaryAverageRuntime.textContent = averageRuntime || '-';
			summaryMonthlyRuns.textContent = monthlyRuns || '-';
		};

		const updateUploadNote = () => {
			uploadNote.textContent = currentFileName ? `${currentFileName} ready for save${currentUploadedAt && currentUploadedAt !== '-' ? ` • Uploaded ${currentUploadedAt}` : ''}` : 'No JRXML file uploaded yet.';
		};

		const renderDataSourceOptions = () => {
			const selectedValue = pendingSelectedDataSourceId || fields.dataSourceId.value || '';
			fields.dataSourceId.innerHTML = '<option value="">No data source selected</option>';
			availableDataSources.forEach((dataSource) => {
				const option = document.createElement('option');
				option.value = String(dataSource.id);
				option.textContent = `${dataSource.connectionLabel} • ${dataSource.databaseName}`;
				fields.dataSourceId.append(option);
			});
			fields.dataSourceId.value = selectedValue;
			window.AppCustomDropdowns?.sync(fields.dataSourceId);
		};

		const createParameterField = (parameter) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'field';

			const labelRow = document.createElement('div');
			labelRow.className = 'parameter-field__label-row';

			const label = document.createElement('label');
			label.setAttribute('for', `parameter-${parameter.name}`);
			label.textContent = parameter.name;
			label.title = parameter.name;

			const copyButton = document.createElement('button');
			copyButton.type = 'button';
			copyButton.className = 'summary-copy-button parameter-copy-button';
			copyButton.setAttribute('aria-label', `Copy parameter name ${parameter.name}`);
			copyButton.title = `Copy parameter name ${parameter.name}`;
			copyButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>';
			copyButton.addEventListener('click', async () => {
				await copyParameterName(parameter.name, copyButton);
			});
			labelRow.append(label, copyButton);

			let input;
			if (parameter.inputType === 'checkbox') {
				input = document.createElement('select');
				input.dataset.customDropdown = '';
				input.dataset.dropdownPlaceholder = 'Select';
				input.innerHTML = '<option value="">Select</option><option value="true">True</option><option value="false">False</option>';
			} else if (parameter.inputType === 'multivalue') {
				input = document.createElement('textarea');
				input.rows = 3;
				input.placeholder = `Enter ${parameter.name} as comma-separated values, one value per line, or a JSON array`;
			} else {
				input = document.createElement('input');
				input.type = parameter.inputType === 'number' ? 'number' : parameter.inputType === 'date' ? 'date' : 'text';
				input.placeholder = `Enter ${parameter.name}`;
			}

			input.id = `parameter-${parameter.name}`;
			input.dataset.parameterName = parameter.name;
			input.dataset.parameterType = parameter.valueClassName;
			input.addEventListener('input', updateButtonState);
			input.addEventListener('change', updateButtonState);

			wrapper.append(labelRow, input);
			return wrapper;
		};

		const createParameterNoneState = () => {
			const emptyState = document.createElement('div');
			emptyState.className = 'parameter-list__empty';
			emptyState.textContent = 'None';
			return emptyState;
		};

		const renderParameters = (parameters) => {
			currentParameterDefinitions = Array.isArray(parameters) ? parameters : [];
			parameterFields.innerHTML = '';
			if (parameterEmptyState) {
				parameterEmptyState.hidden = currentParameterDefinitions.length > 0;
			}

			if (!currentParameterDefinitions.length) {
				if (currentFileName || currentUploadToken || currentTemplateId) {
					parameterFields.append(createParameterNoneState());
				}
				updateButtonState();
				return;
			}

			const grid = document.createElement('div');
			grid.className = 'field-grid';
			currentParameterDefinitions.forEach((parameter) => {
				grid.append(createParameterField(parameter));
			});
			parameterFields.append(grid);
			updateButtonState();
		};

		const updateTemplateId = (id) => {
			currentTemplateId = id == null ? null : Number(id);
			if (templateIdMeta) {
				templateIdMeta.setAttribute('content', String(currentTemplateId));
			}
		};

		const updatePageMode = () => {
			if (!currentTemplateId) {
				return;
			}

			if (pageIntroTitle) {
				pageIntroTitle.textContent = 'Edit Report Template';
			}

			if (breadcrumbsTitle) {
				breadcrumbsTitle.textContent = 'Edit Report Template';
			}

			document.title = 'Jasper Report Server | Edit Report Template';
		};

		const updateHistory = () => {
			if (!currentTemplateId) {
				return;
			}

			window.history.replaceState({ reportTemplateId: currentTemplateId }, '', `${editBasePath}/${currentTemplateId}`);
		};

		const applyTemplate = (payload) => {
			updateTemplateId(payload?.id ?? null);
			pendingSelectedDataSourceId = payload?.dataSourceId == null ? '' : String(payload.dataSourceId);
			fields.templateCode.value = normalizeTemplateCode(payload?.templateCode || '');
			fields.templateName.value = payload?.templateName || '';
			fields.description.value = payload?.description || '';
			currentUploadToken = '';
			currentFileName = payload?.originalFileName || '';
			currentUploadedAt = payload?.lastPublished || '-';
			renderDataSourceOptions();
			renderParameters(payload?.parameters || []);
			updateUploadNote();
			updateSummary({
				dataSourceName: payload?.dataSourceName || '-',
				lastPublished: payload?.lastPublished || '-',
				averageRuntime: payload?.averageRuntime || '-',
				monthlyRuns: payload?.monthlyRuns || '-'
			});
			updatePageMode();
			validateUniqueTemplateCode();
			setFieldInvalid(fields.templateName, false);
			setUploadInvalid(false);
			baselineState = snapshotState();
			updateButtonState();
		};

		const upsertExistingTemplate = (payload) => {
			if (!payload?.id) {
				return;
			}

			existingTemplates = existingTemplates.filter((template) => Number(template.id) !== Number(payload.id));
			existingTemplates.push({
				id: Number(payload.id),
				templateCode: payload.templateCode || ''
			});
		};

		const fetchDataSources = async () => {
			try {
				const response = await fetch(dataSourceApiBasePath, {
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) {
					throw new Error('Unable to load saved data sources.');
				}

				availableDataSources = await response.json();
				renderDataSourceOptions();
				updateButtonState();
			} catch (error) {
				setFeedback('error', error.message || 'Unable to load saved data sources.');
			}
		};

		const fetchExistingTemplates = async () => {
			try {
				const response = await fetch(apiBasePath, {
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) {
					throw new Error('Unable to load saved report templates.');
				}

				existingTemplates = await response.json();
				validateUniqueTemplateCode();
			} catch (error) {
				setFeedback('error', error.message || 'Unable to load saved report templates.');
			}
		};

		const fetchCurrentTemplate = async () => {
			if (!currentTemplateId) {
				applyTemplate(null);
				return;
			}

			try {
				const response = await fetch(`${apiBasePath}/${currentTemplateId}`, {
					headers: { Accept: 'application/json' }
				});
				if (!response.ok) {
					throw new Error('Unable to load the saved report template.');
				}

				applyTemplate(await response.json());
			} catch (error) {
				setFeedback('error', error.message || 'Unable to load the saved report template.');
			}
		};

		const uploadTemplateFile = async (file) => {
			if (!file || isUploading) {
				return;
			}

			isUploading = true;
			uploadNote.textContent = `${file.name} uploading...`;
			updateButtonState();
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch(`${apiBasePath}/upload`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						[csrfHeader]: csrfToken
					},
					body: formData
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to upload and compile the JRXML file.');
				}

				currentUploadToken = payload.uploadToken || '';
				currentFileName = payload.originalFileName || file.name;
				currentUploadedAt = payload.uploadedAt || '-';
				renderParameters(payload.parameters || []);
				updateUploadNote();
				setFeedback('success', `Compiled ${currentFileName} and loaded ${currentParameterDefinitions.length} parameter(s).`);
			} catch (error) {
				updateUploadNote();
				setFeedback('error', error.message || 'Unable to upload and compile the JRXML file.');
			} finally {
				isUploading = false;
				fields.fileInput.value = '';
				updateButtonState();
			}
		};

		const getParameterValues = () => {
			const values = {};
			parameterFields.querySelectorAll('[data-parameter-name]').forEach((input) => {
				values[input.dataset.parameterName] = input.value;
			});
			return values;
		};

		const saveCurrentTemplate = async () => {
			if (isSaving) {
				return false;
			}

			if (!validateTemplateBeforeSave()) {
				return false;
			}

			isSaving = true;
			updateButtonState();

			try {
				const response = await fetch(currentTemplateId ? `${apiBasePath}/${currentTemplateId}` : apiBasePath, {
					method: currentTemplateId ? 'PUT' : 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						templateCode: normalizeTemplateCode(fields.templateCode.value),
						templateName: fields.templateName.value,
						description: fields.description.value,
						dataSourceId: fields.dataSourceId.value ? Number(fields.dataSourceId.value) : null,
						uploadToken: currentUploadToken || null
					})
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to save the report template.');
				}

				applyTemplate(payload);
				upsertExistingTemplate(payload);
				updateHistory();
				setFeedback('success', `Report template #${payload.id} saved successfully.`);
				return true;
			} catch (error) {
				setFeedback('error', error.message || 'Unable to save the report template.');
				return false;
			} finally {
				isSaving = false;
				updateButtonState();
			}
		};

		const setPreviewStatus = (icon, title, message) => {
			previewStatusIcon.textContent = icon;
			previewStatusTitle.textContent = title;
			previewStatusMessage.textContent = message;
		};

		const clearPreview = () => {
			previewFrameRequestId = 0;
			if (previewObjectUrl) {
				URL.revokeObjectURL(previewObjectUrl);
				previewObjectUrl = null;
			}
			setPreviewStatus('hourglass_top', 'Generating preview...', 'The popup is ready. Your document will appear here when rendering finishes.');
			previewStage.classList.remove('is-ready');
			previewStage.classList.add('is-loading');
			previewLoading.hidden = false;
			previewFrame.hidden = true;
			previewFrame.removeAttribute('src');
		};

		const showPreviewLoading = () => {
			clearPreview();
			window.AppDialog?.open(previewDialog);
		};

		const showPreviewDocument = (blob) => {
			clearPreview();
			previewFrameRequestId = previewRequestId;
			previewObjectUrl = URL.createObjectURL(blob);
			previewFrame.hidden = false;
			previewFrame.src = previewObjectUrl;
		};

		const showPreviewError = (message) => {
			previewStage.classList.add('is-loading');
			previewLoading.hidden = false;
			setPreviewStatus('error', 'Preview unavailable', message);
			previewFrame.hidden = true;
		};

		const previewTemplate = async () => {
			if (isPreviewing) {
				return;
			}

			isPreviewing = true;
			const requestId = ++previewRequestId;
			showPreviewLoading();
			updateButtonState();

			try {
				const response = await fetch(`${apiBasePath}/preview`, {
					method: 'POST',
					headers: {
						Accept: 'application/pdf',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						templateId: currentTemplateId,
						dataSourceId: fields.dataSourceId.value ? Number(fields.dataSourceId.value) : null,
						uploadToken: currentUploadToken || null,
						parameters: getParameterValues()
					})
				});

				if (!response.ok) {
					const payload = await readJson(response);
					throw new Error(payload?.message || 'Unable to generate the report preview.');
				}

				if (requestId !== previewRequestId) {
					return;
				}

				showPreviewDocument(await response.blob());
			} catch (error) {
				if (requestId !== previewRequestId) {
					return;
				}

				showPreviewError(error.message || 'Unable to generate the report preview.');
				setFeedback('error', error.message || 'Unable to generate the report preview.');
			} finally {
				if (requestId === previewRequestId) {
					isPreviewing = false;
				}
				updateButtonState();
			}
		};

		const generateTemplate = async () => {
			if (isGenerating) {
				return;
			}

			isGenerating = true;
			updateButtonState();

			try {
				const selectedFormat = currentGenerateFormat();
				const selectedFormatLabel = selectedFormat.toUpperCase();
				if (currentUploadToken || isDirty()) {
					const saved = await saveCurrentTemplate();
					if (!saved) {
						return;
					}
				}

				if (!currentTemplateId) {
					throw new Error('Save the report template before generating a report.');
				}

				const response = await fetch(`${apiBasePath}/${currentTemplateId}/generate`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						format: selectedFormat,
						parameters: getParameterValues()
					})
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to generate the report file.');
				}

				setFeedback('success', `${selectedFormatLabel} report generated successfully. Download starting for ${payload?.fileName || 'the file'}.`);
				startDownload(payload?.downloadUrl || '');
			} catch (error) {
				setFeedback('error', error.message || 'Unable to generate the report file.');
			} finally {
				isGenerating = false;
				updateButtonState();
			}
		};

		const navigateTo = (href) => {
			if (!href) {
				return;
			}

			suppressBeforeUnload = true;
			window.location.assign(href);
		};

		Object.values(fields).forEach((field) => {
			if (field === fields.fileInput) {
				return;
			}
			field.addEventListener('input', () => {
				if (field !== fields.templateCode) {
					setFieldInvalid(field, false);
				}
				updateButtonState();
			});
			field.addEventListener('change', () => {
				if (field !== fields.templateCode) {
					setFieldInvalid(field, false);
				}
				updateButtonState();
			});
		});

		fields.templateCode.addEventListener('input', () => {
			validateUniqueTemplateCode();
			updateButtonState();
		});

		fields.templateCode.addEventListener('change', () => {
			validateUniqueTemplateCode();
			updateButtonState();
		});

		chooseFileButton.addEventListener('click', () => {
			fields.fileInput.click();
		});

		downloadFileButton.addEventListener('click', () => {
			const downloadUrl = currentDownloadUrl();
			if (!downloadUrl) {
				return;
			}

			window.location.assign(downloadUrl);
		});

		fields.fileInput.addEventListener('change', () => {
			const [file] = fields.fileInput.files || [];
			if (file) {
				setUploadInvalid(false);
			}
			uploadTemplateFile(file);
		});

		saveButton.addEventListener('click', (event) => {
			if (validateTemplateBeforeSave()) {
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
			pendingNavigationHref = backLink.href;
			window.AppDialog?.open(unsavedDialog);
		});

		saveDialog.addEventListener('app-dialog:confirm', async () => {
			await saveCurrentTemplate();
		});

		unsavedDialog.addEventListener('app-dialog:confirm', async () => {
			const saved = await saveCurrentTemplate();
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

		previewFrame.addEventListener('load', () => {
			if (!previewObjectUrl || previewFrameRequestId !== previewRequestId) {
				return;
			}

			previewStage.classList.remove('is-loading');
			previewStage.classList.add('is-ready');
			previewLoading.hidden = true;
		});

		previewDialog.addEventListener('app-dialog:cancel', clearPreview);
		previewButton.addEventListener('click', previewTemplate);
		generateButton.addEventListener('click', generateTemplate);

		window.addEventListener('beforeunload', (event) => {
			if (suppressBeforeUnload || !isDirty()) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		});

		Promise.all([fetchDataSources(), fetchCurrentTemplate(), fetchExistingTemplates()]).finally(() => {
			baselineState = snapshotState();
			updateButtonState();
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();
