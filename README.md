# andreinastase.ro

Site personal, static (HTML + CSS + JS, fără build). Trei pagini: home (produse, servicii, prețuri, contact), `servicii.html`, `cofondator.html`.

## Capturi de ecran pentru produse

Pune fișierele în `assets/screens/`, la 1440×900 (sau orice 16:10), JPG:

```
tixello.jpg  ambilet.jpg  bilete-online.jpg  viaqui.jpg  tics.jpg
e-test.jpg   dreamsatlas.jpg  dubidu.jpg  emud.jpg
```

Până apar, cardurile afișează un placeholder cu numele fișierului. Fotografia ta: `assets/andrei.jpg` (vezi comentariul din `index.html`, secțiunea „Cine sunt”).

## Formulare

Site-ul fiind static, formularele deschid clientul de email precompletat. Ca să trimită prin POST, pune `data-endpoint="https://…"` pe `<form>` (Formspree, un endpoint Laravel etc.).

## Rulare locală

```bash
php -S localhost:8080
```

## Publicare

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root. Sau orice hosting static.
