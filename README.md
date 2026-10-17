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
