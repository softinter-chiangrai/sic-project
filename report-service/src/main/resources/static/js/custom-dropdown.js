(() => {
	const instances = new WeakMap();

	const closeAll = ({ except } = {}) => {
		document.querySelectorAll('.app-dropdown-menu').forEach((menu) => {
			if (except && menu === except.menu) {
				return;
			}
			menu.hidden = true;
		});
		document.querySelectorAll('.field--dropdown.is-open, .filter-select--dropdown.is-open').forEach((container) => {
			if (except && container === except.container) {
				return;
			}
			container.classList.remove('is-open');
		});
		document.querySelectorAll('.app-dropdown-trigger[aria-expanded="true"]').forEach((trigger) => {
			if (except && trigger === except.trigger) {
				return;
			}
			trigger.setAttribute('aria-expanded', 'false');
		});
	};

	const syncInstance = (instance) => {
		const { select, trigger, label, menu } = instance;
		menu.innerHTML = '';
		const selectedOption = select.options[select.selectedIndex] || select.options[0];
		label.textContent = selectedOption?.textContent?.trim() || select.dataset.dropdownPlaceholder || '';

		Array.from(select.options).forEach((option, index) => {
			const optionButton = document.createElement('button');
			optionButton.type = 'button';
			optionButton.className = 'app-dropdown-option';
			optionButton.textContent = option.textContent;
			optionButton.dataset.value = option.value;
			optionButton.setAttribute('role', 'option');
			optionButton.setAttribute('aria-selected', option.selected ? 'true' : 'false');
			optionButton.classList.toggle('is-selected', option.selected);
			optionButton.disabled = option.disabled;

			if (!option.disabled) {
				optionButton.addEventListener('click', () => {
					select.value = option.value;
					Array.from(select.options).forEach((currentOption, currentIndex) => {
						currentOption.selected = currentIndex === index;
					});
					select.dispatchEvent(new Event('input', { bubbles: true }));
					select.dispatchEvent(new Event('change', { bubbles: true }));
					syncInstance(instance);
					closeAll();
					trigger.focus();
				});
			}

			menu.append(optionButton);
		});

		trigger.disabled = select.disabled;
	};

	const enhanceSelect = (select) => {
		if (!select || select.dataset.customDropdownEnhanced === 'true') {
			return instances.get(select) || null;
		}

		const isFilterDropdown = select.closest('.filter-select') != null;
		const container = select.closest('.filter-select') || select.closest('.field');
		if (!container) {
			return null;
		}

		container.classList.add(isFilterDropdown ? 'filter-select--dropdown' : 'field--dropdown');
		select.classList.add('dropdown-native-select');
		select.dataset.customDropdownEnhanced = 'true';

		const trigger = document.createElement('button');
		trigger.type = 'button';
		trigger.className = 'app-dropdown-trigger';
		trigger.setAttribute('aria-haspopup', 'listbox');
		trigger.setAttribute('aria-expanded', 'false');

		const leadingIconName = select.dataset.dropdownIcon;
		if (leadingIconName) {
			const leadingIcon = document.createElement('span');
			leadingIcon.className = 'material-symbols-outlined icon icon--md app-dropdown-trigger__leading-icon';
			leadingIcon.setAttribute('aria-hidden', 'true');
			leadingIcon.textContent = leadingIconName;
			trigger.append(leadingIcon);
		}

		const label = document.createElement('span');
		label.className = 'app-dropdown-trigger__label';
		trigger.append(label);

		const trailingIcon = document.createElement('span');
		trailingIcon.className = 'material-symbols-outlined icon icon--md app-dropdown-trigger__icon';
		trailingIcon.setAttribute('aria-hidden', 'true');
		trailingIcon.textContent = 'expand_more';
		trigger.append(trailingIcon);

		const menu = document.createElement('div');
		menu.className = 'app-dropdown-menu';
		menu.setAttribute('role', 'listbox');
		menu.hidden = true;

		select.insertAdjacentElement('afterend', trigger);
		trigger.insertAdjacentElement('afterend', menu);

		const instance = { select, container, trigger, label, menu };
		instances.set(select, instance);

		const open = () => {
			if (trigger.disabled) {
				return;
			}
			closeAll({ except: instance });
			menu.hidden = false;
			trigger.setAttribute('aria-expanded', 'true');
			container.classList.add('is-open');
		};

		const close = () => {
			menu.hidden = true;
			trigger.setAttribute('aria-expanded', 'false');
			container.classList.remove('is-open');
		};

		trigger.addEventListener('click', () => {
			if (menu.hidden) {
				open();
				return;
			}
			close();
		});

		trigger.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
				event.preventDefault();
				open();
				menu.querySelector('.app-dropdown-option:not(:disabled)')?.focus();
			}
			if (event.key === 'Escape') {
				close();
			}
		});

		menu.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
				trigger.focus();
			}
		});

		select.addEventListener('change', () => syncInstance(instance));
		select.addEventListener('focus', () => trigger.focus());

		const observer = new MutationObserver(() => syncInstance(instance));
		observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });

		syncInstance(instance);
		instance.close = close;
		return instance;
	};

	const enhanceAll = (root = document) => {
		root.querySelectorAll('select[data-custom-dropdown]').forEach((select) => enhanceSelect(select));
	};

	document.addEventListener('click', (event) => {
		document.querySelectorAll('select[data-custom-dropdown][data-custom-dropdown-enhanced="true"]').forEach((select) => {
			const instance = instances.get(select);
			if (!instance) {
				return;
			}
			if (instance.container.contains(event.target)) {
				return;
			}
			instance.close?.();
		});
	});

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') {
			return;
		}
		document.querySelectorAll('select[data-custom-dropdown][data-custom-dropdown-enhanced="true"]').forEach((select) => {
			instances.get(select)?.close?.();
		});
	});

	document.addEventListener('DOMContentLoaded', () => {
		enhanceAll();
		const documentObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				mutation.addedNodes.forEach((node) => {
					if (!(node instanceof Element)) {
						return;
					}
					if (node.matches?.('select[data-custom-dropdown]')) {
						enhanceSelect(node);
					}
					enhanceAll(node);
				});
			}
		});
		documentObserver.observe(document.body, { childList: true, subtree: true });
	});

	window.AppCustomDropdowns = {
		enhanceAll,
		sync(select) {
			const instance = select ? enhanceSelect(select) : null;
			if (instance) {
				syncInstance(instance);
			}
		},
		syncAll(root = document) {
			root.querySelectorAll('select[data-custom-dropdown]').forEach((select) => {
				const instance = enhanceSelect(select);
				if (instance) {
					syncInstance(instance);
				}
			});
		}
	};
})();