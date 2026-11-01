# Brew Bar

Coffee recipes for the Timemore Sculptor 064S, with live weight from a **Bookoo Themis Ultra** and settings synced through a private GitHub gist.

**Brewers:** espresso (Ascaso Uno), moka pot, Greek coffee briki, V60, cafetière, AeroPress.

## Scale
Uses Web Bluetooth, so open it in **Chrome on Android** (or desktop Chrome). Safari/iOS has no Web Bluetooth.
Protocol from Bookoo's official spec: [BooKooCode/OpenSource](https://github.com/BooKooCode/OpenSource/blob/main/bookoo_ultra_scale/protocols.md).

- Live weight, flow rate and battery
- Tare, and "tare · start on first drops" auto-start
- Espresso: beep and vibrate 1.5 g before the target yield, auto-stop when flow ends, save the real yield and time to the recipe
- Pour-overs: next pour target and grams to go
- "Use scale reading" for bean weight and water

## Sync
Tap **Sync off** → paste a classic GitHub token with only the `gist` scope → **Save and sync**. A private gist is created.
On another phone, enter the same gist ID (plus the token if that phone should be able to change settings).
Settings merge per brewer, newest change wins; the app checks for updates every 45 s and when reopened.

## Beans
Tap **Scan beans** and photograph the bag. Brew Bar reads any QR code or barcode (barcodes are looked up on Open Food Facts) and reads the label text with Tesseract.js (downloaded on first use) to fill in roaster, coffee, roast level and roast date. Check and save. The home screen shows bean age and whether it's resting, at its best or past its best for espresso and filter. Bags sync with your recipes.

## Humidity (espresso)
Optional. Uses your location and Open-Meteo to get local humidity. When the grind is set, today's humidity is remembered; later the grind moves 0.1 for each ~15% change (max ±0.3): coarser when it's more humid, finer when drier.
