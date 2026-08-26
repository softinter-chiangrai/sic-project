(() => {
	const domReady = () => {
		const dialogConfigs = [
			{
				dialogId: 'revoke-access-token-modal',
				kind: 'revoke',
				defaultTitle: 'Revoke Access Token',
				defaultDescription: 'Revoke this access token? Any client using it will stop working immediately.',
				buildTitle: (label) => `Revoke ${label}`,
				buildDescription: (label) => `Revoke ${label}? Any client using it will stop working immediately.`
			},
			{
				dialogId: 'delete-access-token-modal',
				kind: 'delete',
				defaultTitle: 'Delete Access Token',
				defaultDescription: 'Delete this access token? This action cannot be undone.',
				buildTitle: (label) => `Delete ${label}`,
				buildDescription: (label) => `Delete ${label}? This action cannot be undone.`
			}
		];

		dialogConfigs.forEach((config) => {
			const dialog = document.getElementById(config.dialogId);
			if (!dialog) {
				return;
			}

			const title = dialog.querySelector('.app-dialog__copy h3');
			const description = dialog.querySelector('.app-dialog__copy p');
			let pendingForm = null;

			document.addEventListener('click', (event) => {
				const trigger = event.target.closest(`[data-delete-form][data-dialog-kind="${config.kind}"]`);
				if (!trigger) {
					return;
				}

				pendingForm = document.getElementById(trigger.getAttribute('data-delete-form'));
				const label = trigger.getAttribute('data-delete-label') || 'this access token';

				if (title) {
					title.textContent = config.buildTitle(label);
				}

				if (description) {
					description.textContent = config.buildDescription(label);
				}
			});

			dialog.addEventListener('app-dialog:confirm', () => {
				pendingForm?.submit();
			});

			dialog.addEventListener('app-dialog:cancel', () => {
				pendingForm = null;
				if (title) {
					title.textContent = config.defaultTitle;
				}

				if (description) {
					description.textContent = config.defaultDescription;
				}
			});
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', domReady, { once: true });
	} else {
		domReady();
	}
})();