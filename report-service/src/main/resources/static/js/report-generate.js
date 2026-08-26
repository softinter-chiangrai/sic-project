(() => {
	const templateApiBasePath = '/api/report-templates';

	const readJson = async (response) => {
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return null;
		}

		return response.json();
	};

	const domReady = () => {
		const templateSelect = document.getElementById('generate-template-select');
		const parameterFields = document.getElementById('parameter-fields');
		const parameterEmptyState = document.getElementById('parameter-empty-state');
		const formatField = document.getElementById('generate-format');
		const generateButton = document.getElementById('generate-report-button');
		const feedbackAlert = document.getElementById('generate-feedback-alert');
		const feedbackMessage = document.getElementById('generate-feedback-message');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';

		if (!templateSelect || !parameterFields || !formatField || !generateButton || !feedbackAlert || !feedbackMessage) {
			return;
		}

		let currentParameterDefinitions = [];
		let isGenerating = false;
		const feedbackToast = window.AppToast?.create({ alertElement: feedbackAlert, messageElement: feedbackMessage });

		const updateButtonState = () => {
			generateButton.disabled = isGenerating || !templateSelect.value;
		};

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

		const createParameterField = (parameter) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'field';

			const label = document.createElement('label');
			label.setAttribute('for', `parameter-${parameter.name}`);
			label.textContent = parameter.name;
			label.title = parameter.name;

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

			wrapper.append(label, input);
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
				parameterEmptyState.hidden = Boolean(templateSelect.value);
			}

			if (!currentParameterDefinitions.length) {
				if (templateSelect.value) {
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

		const getParameterValues = () => {
			const values = {};
			parameterFields.querySelectorAll('[data-parameter-name]').forEach((input) => {
				values[input.dataset.parameterName] = input.value;
			});
			return values;
		};

		const renderTemplateOptions = (templates) => {
			const selectedValue = templateSelect.value;
			templateSelect.innerHTML = '<option value="">Select a report template</option>';
			templates.forEach((template) => {
				const option = document.createElement('option');
				option.value = String(template.id);
				option.textContent = template.templateCode ? `${template.templateName} (${template.templateCode})` : template.templateName;
				templateSelect.append(option);
			});
			templateSelect.value = selectedValue;
			window.AppCustomDropdowns?.sync(templateSelect);
		};

		const fetchTemplates = async () => {
			try {
				const response = await fetch(templateApiBasePath, { headers: { Accept: 'application/json' } });
				if (!response.ok) {
					throw new Error('Unable to load saved report templates.');
				}

				renderTemplateOptions(await response.json());
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to load saved report templates.');
			}
		};

		const fetchTemplateParameters = async (templateId) => {
			if (!templateId) {
				renderParameters([]);
				return;
			}

			try {
				const response = await fetch(`${templateApiBasePath}/${templateId}`, { headers: { Accept: 'application/json' } });
				if (!response.ok) {
					throw new Error('Unable to load the selected report template.');
				}

				const payload = await response.json();
				renderParameters(payload?.parameters || []);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to load the selected report template.');
			}
		};

		const generateReport = async () => {
			if (isGenerating || !templateSelect.value) {
				return;
			}

			isGenerating = true;
			updateButtonState();

			try {
				const response = await fetch(`${templateApiBasePath}/${templateSelect.value}/generate`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						format: formatField.value || 'pdf',
						parameters: getParameterValues()
					})
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to generate the report file.');
				}

				feedbackToast?.show('success', `${(formatField.value || 'pdf').toUpperCase()} report generated successfully. Download starting for ${payload?.fileName || 'the file'}.`);
				startDownload(payload?.downloadUrl || '');
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to generate the report file.');
			} finally {
				isGenerating = false;
				updateButtonState();
			}
		};

		templateSelect.addEventListener('change', () => {
			updateButtonState();
			fetchTemplateParameters(templateSelect.value);
		});

		generateButton.addEventListener('click', generateReport);

		fetchTemplates();
		updateButtonState();
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();
