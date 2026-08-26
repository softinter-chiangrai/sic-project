(() => {
	const bulkApiBasePath = '/api/report-bulk';
	const pageSize = 10;

	const readJson = async (response) => {
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return null;
		}

		return response.json();
	};

	const domReady = () => {
		const itemsInput = document.getElementById('bulk-items-input');
		const generateButton = document.getElementById('bulk-generate-button');
		const feedbackAlert = document.getElementById('bulk-feedback-alert');
		const feedbackMessage = document.getElementById('bulk-feedback-message');
		const resultId = document.getElementById('bulk-result-id');
		const resultCount = document.getElementById('bulk-result-count');
		const resultSuccess = document.getElementById('bulk-result-success');
		const resultFailure = document.getElementById('bulk-result-failure');
		const resultDownload = document.getElementById('bulk-result-download');
		const tableBody = document.getElementById('bulk-table-body');
		const tableSummary = document.getElementById('bulk-table-summary');
		const prevPageLink = document.getElementById('bulk-prev-page');
		const nextPageLink = document.getElementById('bulk-next-page');
		const currentPageLabel = document.getElementById('bulk-current-page');
		const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';

		if (!itemsInput || !generateButton || !feedbackAlert || !feedbackMessage || !tableBody) {
			return;
		}

		let isGenerating = false;
		let currentPage = 0;
		let totalPages = 0;
		const feedbackToast = window.AppToast?.create({ alertElement: feedbackAlert, messageElement: feedbackMessage });

		const renderBulkRow = (batch) => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td class="mono-cell">${batch.id}</td>
				<td>${batch.requestedBy}</td>
				<td>${batch.itemCount}</td>
				<td>${batch.successCount}</td>
				<td>${batch.failureCount}</td>
				<td>${batch.generatedAt}</td>
				<td>${batch.downloadCount}</td>
				<td class="mono-cell"><a href="/reports/bulk/files/${batch.id}/download" target="_blank" rel="noopener noreferrer">Download</a></td>
			`;
			return row;
		};

		const fetchBulkBatches = async (page) => {
			try {
				const response = await fetch(`${bulkApiBasePath}?page=${page}&size=${pageSize}`, { headers: { Accept: 'application/json' } });
				if (!response.ok) {
					throw new Error('Unable to load bulk report batches.');
				}

				const payload = await response.json();
				currentPage = payload.pageNumber || 0;
				totalPages = payload.totalPages || 0;
				tableBody.innerHTML = '';
				if (!payload.items || !payload.items.length) {
					const emptyRow = document.createElement('tr');
					emptyRow.innerHTML = '<td colspan="8">No bulk report batches generated yet.</td>';
					tableBody.append(emptyRow);
				} else {
					payload.items.forEach((batch) => tableBody.append(renderBulkRow(batch)));
				}

				tableSummary.textContent = payload.totalItems === 0
					? 'Showing 0 bulk batches'
					: `Showing ${(currentPage * pageSize) + 1}-${(currentPage * pageSize) + payload.items.length} of ${payload.totalItems} bulk batches`;
				currentPageLabel.textContent = String(currentPage + 1);
				prevPageLink.classList.toggle('is-disabled', !payload.hasPrevious);
				nextPageLink.classList.toggle('is-disabled', !payload.hasNext);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to load bulk report batches.');
			}
		};

		const generateBulk = async () => {
			if (isGenerating) {
				return;
			}

			let items;
			try {
				items = JSON.parse(itemsInput.value || '[]');
				if (!Array.isArray(items) || !items.length) {
					throw new Error('Provide a JSON array with at least one bulk generation item.');
				}
			} catch {
				feedbackToast?.show('error', 'Bulk items must be valid JSON, formatted as an array.');
				return;
			}

			isGenerating = true;
			generateButton.disabled = true;

			try {
				const response = await fetch(bulkApiBasePath, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify(items)
				});
				const payload = await readJson(response);
				if (!response.ok) {
					throw new Error(payload?.message || 'Unable to generate the bulk report ZIP file.');
				}

				resultId.textContent = String(payload.batchId);
				resultCount.textContent = String(payload.itemCount);
				resultSuccess.textContent = String(payload.successCount);
				resultFailure.textContent = String(payload.failureCount);
				resultDownload.href = payload.zipDownloadUrl;
				resultDownload.hidden = false;

				feedbackToast?.show('success', `Bulk batch #${payload.batchId} generated: ${payload.successCount}/${payload.itemCount} report(s) succeeded.`);
				fetchBulkBatches(0);
			} catch (error) {
				feedbackToast?.show('error', error.message || 'Unable to generate the bulk report ZIP file.');
			} finally {
				isGenerating = false;
				generateButton.disabled = false;
			}
		};

		generateButton.addEventListener('click', generateBulk);

		prevPageLink.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage > 0) {
				fetchBulkBatches(currentPage - 1);
			}
		});

		nextPageLink.addEventListener('click', (event) => {
			event.preventDefault();
			if (currentPage + 1 < totalPages) {
				fetchBulkBatches(currentPage + 1);
			}
		});

		fetchBulkBatches(0);
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();
