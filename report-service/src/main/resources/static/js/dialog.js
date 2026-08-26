(() => {
	const dialogSelector = 'dialog[data-app-dialog]';

	const syncBodyLock = () => {
		document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
	};

	const openDialog = (dialog) => {
		if (!dialog || dialog.open || typeof dialog.showModal !== 'function') {
			return;
		}

		dialog.showModal();
		syncBodyLock();
	};

	window.AppDialog = {
		open(dialog) {
			openDialog(dialog);
		},
		close(dialog, returnValue = 'dismiss') {
			if (!dialog || typeof dialog.close !== 'function') {
				return;
			}

			dialog.close(returnValue);
		}
	};

	document.addEventListener('click', (event) => {
		const trigger = event.target.closest('[data-dialog-open]');
		if (trigger) {
			event.preventDefault();
			const dialog = document.getElementById(trigger.getAttribute('data-dialog-open'));
			openDialog(dialog);
			return;
		}

		const dialog = event.target.closest(dialogSelector);
		if (dialog && event.target === dialog) {
			dialog.close('dismiss');
		}
	});

	document.querySelectorAll(dialogSelector).forEach((dialog) => {
		dialog.addEventListener('close', () => {
			syncBodyLock();
			const returnValue = dialog.returnValue || 'dismiss';
			const eventName = returnValue === 'confirm' ? 'app-dialog:confirm' : returnValue === 'cancel' || returnValue === 'dismiss' ? 'app-dialog:cancel' : `app-dialog:${returnValue}`;
			dialog.dispatchEvent(new CustomEvent('app-dialog:action', {
				bubbles: true,
				detail: { returnValue }
			}));
			dialog.dispatchEvent(new CustomEvent(eventName, {
				bubbles: true,
				detail: { returnValue }
			}));
		});

		dialog.addEventListener('cancel', () => {
			syncBodyLock();
		});
	});
})();