# andreinastase.ro

Site personal: produsele construite + oferta de cofondator tehnic. Static, fără build.

## Structură

- `index.html` — home: hero, lista de produse („ledger”), rezumat cofondator, despre, contact
- `cofondator.html` — oferta completă de cofondator tehnic (cine, cum, FAQ, formular)
- `servicii.html` — aplicații la preț fix
- `assets/site.css` — tokenii de design și tot CSS-ul (light + dark)
- `assets/site.js` — meniu mobil, formulare, an în footer

## Rulare locală

Orice server static merge:

```bash
php -S localhost:8080
# sau
npx serve .
```

## Publicare

Fiind HTML static, se poate publica pe GitHub Pages, Netlify, Vercel sau orice hosting.
Pentru GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## De completat

- `assets/andrei.jpg` — fotografia din secțiunea „Cine sunt” (placeholder-ul din `index.html` se înlocuiește cu `<img>`)
- Formularele deschid clientul de email (`mailto:`). Pentru trimitere directă, pune `data-endpoint="https://..."` pe `<form>` (Formspree, un endpoint Laravel etc.)
- Linkul de calendar: `https://cal.com/andreinastase`
- Rolurile din lista de produse (Fondator / Cofondator) sunt presupuneri — ajustează în `index.html`
