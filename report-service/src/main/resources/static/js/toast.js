(() => {
	const DEFAULT_DURATION = 4200;
	const EXIT_DURATION = 180;
	const hideTimers = new WeakMap();

	const clearHideTimer = (alertElement) => {
		const timerId = hideTimers.get(alertElement);
		if (timerId) {
			window.clearTimeout(timerId);
			hideTimers.delete(alertElement);
		}
	};

	const queueHide = (alertElement, duration, hide) => {
		clearHideTimer(alertElement);
		hideTimers.set(alertElement, window.setTimeout(hide, duration));
	};

	const create = ({ alertElement, messageElement, duration = DEFAULT_DURATION } = {}) => {
		if (!alertElement || !messageElement) {
			return {
				show: () => {},
				hide: () => {}
			};
		}

		const iconElement = alertElement.querySelector('.material-symbols-outlined');

		const hide = () => {
			clearHideTimer(alertElement);
			alertElement.classList.remove('is-visible');
			window.setTimeout(() => {
				if (!alertElement.classList.contains('is-visible')) {
					alertElement.hidden = true;
				}
			}, EXIT_DURATION);
		};

		const show = (variant, message) => {
			alertElement.hidden = false;
			alertElement.classList.add('status-alert--toast');
			alertElement.classList.remove('status-alert--success', 'status-alert--error');
			alertElement.classList.add(variant === 'success' ? 'status-alert--success' : 'status-alert--error');
			messageElement.textContent = message;
			if (iconElement) {
				iconElement.textContent = variant === 'success' ? 'check_circle' : 'error';
			}
			window.requestAnimationFrame(() => {
				alertElement.classList.add('is-visible');
			});
			queueHide(alertElement, duration, hide);
		};

		alertElement.addEventListener('mouseenter', () => {
			clearHideTimer(alertElement);
		});

		alertElement.addEventListener('mouseleave', () => {
			if (alertElement.classList.contains('is-visible')) {
				queueHide(alertElement, duration, hide);
			}
		});

		return { show, hide };
	};

	window.AppToast = { create };
})();