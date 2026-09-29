# Edytor klocków na Pybricks (SPIKE Prime)

Uproszczony edytor blokowy w przeglądarce. Dziecko układa klocki w stylu „jedź”, „skręć w prawo”. Program kompiluje się w Chrome i wgrywa na hub SPIKE Prime z firmware **Pybricks** przez Web Bluetooth.

Nie ma serwera ani aplikacji Windows. Strona jest statyczna (GitHub Pages).

## Co jest potrzebne

1. Hub SPIKE Prime z [firmware Pybricks](https://pybricks.com/learn/getting-started/install-pybricks/) (instalacja raz, na [code.pybricks.com](https://code.pybricks.com/)).
2. Chrome lub Edge (Web Bluetooth). Safari nie zadziała.
3. **Nie paruj** huba w ustawieniach Bluetooth systemu — łącz tylko z tej strony.

## Uruchomienie lokalne (Twój warsztat)

```bash
npm install
npm run dev
```

Otwórz adres z terminala w Chrome. `http://localhost` wystarcza dla Web Bluetooth.

Syn korzysta ze strony na GitHub Pages (`https://….github.io/….`), nie z localhost.

## Publikacja

1. Utwórz publiczne repozytorium na GitHubie i wypchnij ten projekt na gałąź `main`.
2. W repozytorium: **Settings → Pages → GitHub Actions**.
3. Po pushu workflow zbuduje stronę. Adres pojawi się w zakładce Actions / Pages.

## Ustawienia robota

Domyślnie: silniki **C** (lewy, odwrócony) i **D** (prawy), koła **56 mm**, rozstaw **115 mm**, żyroskop włączony.

Porty i kierunki zmieniasz ikoną **⚙**. Przyciski „Jedź 20 cm” i „Obrót w prawo 90°” pomagają sprawdzić, czy silniki nie są zamienione.

## Firmware LEGO

Dopóki na hubie jest Pybricks, oficjalna aplikacja SPIKE nie działa. Oryginalny firmware przywracasz z [code.pybricks.com](https://code.pybricks.com/) → Restore official LEGO firmware.
