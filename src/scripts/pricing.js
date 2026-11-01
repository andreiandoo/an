const box = document.getElementById('types');
if (box) {
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const panels = [...box.querySelectorAll('[role="tabpanel"]')];
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') select(i); });
    tab.addEventListener('keydown', e => {
      const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!move) return;
      e.preventDefault();
      select((i + move + tabs.length) % tabs.length, true);
    });
  });
}
