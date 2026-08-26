(() => {
	const domReady = () => {
		const dialog = document.getElementById('delete-data-source-modal');
		if (!dialog) {
			return;
		}

		const title = dialog.querySelector('.app-dialog__copy h3');
		const description = dialog.querySelector('.app-dialog__copy p');
		const defaultTitle = title?.textContent || 'Delete Data Source';
		const defaultDescription = description?.textContent || 'Delete this data source? This action cannot be undone.';
		let pendingForm = null;

		document.addEventListener('click', (event) => {
			const trigger = event.target.closest('[data-delete-form]');
			if (!trigger) {
				return;
			}

			pendingForm = document.getElementById(trigger.getAttribute('data-delete-form'));
			const label = trigger.getAttribute('data-delete-label') || 'this data source';

			if (title) {
				title.textContent = `Delete ${label}`;
			}

			if (!description) {
				return;
			}

			description.textContent = `Delete ${label}? This action cannot be undone.`;
		});

		dialog.addEventListener('app-dialog:confirm', () => {
			pendingForm?.submit();
		});

		dialog.addEventListener('app-dialog:cancel', () => {
			pendingForm = null;
			if (title) {
				title.textContent = defaultTitle;
			}
			if (description) {
				description.textContent = defaultDescription;
			}
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();