(() => {
	const templateApiBasePath = '/api/report-templates';
	const queueApiBasePath = '/api/report-queue';
	const pageSize = 10;
	const refreshIntervalMs = 5000;

	const readJson = async (response) => {
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return null;
		}

		return response.json();
	};

	const statusPillClass = (status) => {
		switch (status) {
			case 'Completed':
				return 'pill pill--success';
			case 'Failed':
				return 'pill pill--danger';
			case 'Processing':
				return 'pill pill--info';
			default:
				return 'pill pill--warning';
		}
	};

	const webhookPillClass = (webhookStatus) => {
		switch (webhookStatus) {
			case 'Delivered':
				return 'pill pill--success';
			case 'Failed':
				return 'pill pill--danger';
			case 'Pending':
				return 'pill pill--warning';
			default:
				return 'pill';
		}
	};

	const domReady = () => {
		const templateSelect = document.getElementById('queue-template-select');
		const parameterFields = document.getElementById('parameter-fields');
		const parameterEmptyState = document.getElementById('parameter-empty-state');
		const formatField = document.getElementById('queue-format');
		const callbackUrlField = document.getElementById('queue-callback-url');
		const submitButton = document.getElementById('queue-submit-button');
		const feedbackAlert = document.getElementById('queue-feedback-alert');
		const feedbackMessage = document.getElementById('queue-feedback-message');
		const tableBody = document.getElementById('queue-table-body');
		const tableSummary = document.getElementById('queue-table-summary');
		const prevPageLink = document.getElementById('queue-prev-page');
		const nextPageLink = document.getElementById('queue-next-page');
		const currentPageLabel = document.getElementById('queue-current-page');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';

		if (!templateSelect || !parameterFields || !formatField || !submitButton || !feedbackAlert || !feedbackMessage || !tableBody) {
			return;
		}

		let isSubmitting = false;
		let currentPage = 0;
		let totalPages = 0;
		const feedbackToast = window.AppToast?.create({ alertElement: feedbackAlert, messageElement: feedbackMessage });

		const updateButtonState = () => {
			submitButton.disabled = isSubmitting || !templateSelect.value;
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
			const parameterDefinitions = Array.isArray(parameters) ? parameters : [];
			parameterFields.innerHTML = '';
			if (parameterEmptyState) {
				parameterEmptyState.hidden = Boolean(templateSelect.value);
			}

			if (!parameterDefinitions.length) {
				if (templateSelect.value) {
					parameterFields.append(createParameterNoneState());
				}
				updateButtonState();
				return;
			}

			const grid = document.createElement('div');
			grid.className = 'field-grid';
			parameterDefinitions.forEach((parameter) => {
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

		const renderQueueRow = (item) => {
			const row = document.createElement('tr');

			const webhookCell = item.callbackUrl
				? `<span class="${webhookPillClass(item.webhookStatus)}">${item.webhookStatus}</span>${item.webhookStatus === 'Failed' ? ` <button type="button" class="text-button" data-retry-webhook="${item.queueId}">Retry</button>` : ''}`
				: '-';

			const downloadCell = item.downloadUrl
				? `<a href="${item.downloadUrl}" target="_blank" rel="noopener noreferrer">Download</a>`
				: (item.status === 'Failed' ? `<span title="${item.errorMessage || ''}">Failed</span>` : '-');

			row.innerHTML = `
				<td class="mono-cell">${item.queueId}</td>
				<td>${item.reportTemplateName}</td>
				<td>${item.requestedBy}</td>
				<td><span class="${statusPillClass(item.status)}">${item.status}</span></td>
				<td>${item.submittedAt}</td>
				<td>${item.completedAt || '-'}</td>
				<td>${webhookCell}</td>
				<td class="mono-cell">${downloadCell}</td>
			`;
			return row;
		};

		const retryWebhook = async (queueId) => {
			try {
				const response = await fetch(`${queueApiBasePath}/${queueId}/retry-webhook`, {
					method: 'POST',
					headers: { Accept: 'application/json', [csrfHeader]: csrfToken }
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to retry the webhook.');
				}

				feedbackToast?.show('success', `Retrying webhook delivery for queue item #${queueId}.`);
				fetchQueueItems(currentPage);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to retry the webhook.');
			}
		};

		tableBody.addEventListener('click', (event) => {
			const button = event.target.closest('[data-retry-webhook]');
			if (!button) {
				return;
			}

			retryWebhook(button.dataset.retryWebhook);
		});

		const fetchQueueItems = async (page) => {
			try {
				const response = await fetch(`${queueApiBasePath}?page=${page}&size=${pageSize}`, { headers: { Accept: 'application/json' } });
				if (!response.ok) {
					throw new Error('Unable to load queued report generation requests.');
				}

				const payload = await response.json();
				currentPage = payload.pageNumber || 0;
				totalPages = payload.totalPages || 0;
				tableBody.innerHTML = '';
				if (!payload.items || !payload.items.length) {
					const emptyRow = document.createElement('tr');
					emptyRow.innerHTML = '<td colspan="8">No queued report generation requests yet.</td>';
					tableBody.append(emptyRow);
				} else {
					payload.items.forEach((item) => tableBody.append(renderQueueRow(item)));
				}

				tableSummary.textContent = payload.totalItems === 0
					? 'Showing 0 queue items'
					: `Showing ${(currentPage * pageSize) + 1}-${(currentPage * pageSize) + payload.items.length} of ${payload.totalItems} queue items`;
				currentPageLabel.textContent = String(currentPage + 1);
				prevPageLink.classList.toggle('is-disabled', !payload.hasPrevious);
				nextPageLink.classList.toggle('is-disabled', !payload.hasNext);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to load queued report generation requests.');
			}
		};

		const submitQueueRequest = async () => {
			if (isSubmitting || !templateSelect.value) {
				return;
			}

			isSubmitting = true;
			updateButtonState();

			try {
				const response = await fetch(queueApiBasePath, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify({
						reportId: Number(templateSelect.value),
						templateCode: null,
						parameters: getParameterValues(),
						format: formatField.value || 'pdf',
						callbackUrl: callbackUrlField.value || null
					})
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to queue the report generation request.');
				}

				feedbackToast?.show('success', `Queued report generation request #${payload.queueId} for ${payload.reportTemplateName}.`);
				fetchQueueItems(0);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to queue the report generation request.');
			} finally {
				isSubmitting = false;
				updateButtonState();
			}
		};

		templateSelect.addEventListener('change', () => {
			updateButtonState();
			fetchTemplateParameters(templateSelect.value);
		});

		submitButton.addEventListener('click', submitQueueRequest);

		prevPageLink.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage > 0) {
				fetchQueueItems(currentPage - 1);
			}
		});

		nextPageLink.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage + 1 < totalPages) {
				fetchQueueItems(currentPage + 1);
			}
		});

		fetchTemplates();
		fetchQueueItems(0);
		updateButtonState();
		window.setInterval(() => fetchQueueItems(currentPage), refreshIntervalMs);
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();
