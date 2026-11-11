# Changelog

## 1.7

Released November 11, 2026.

### Added

- You can add todo lists next to your link sections. Type to create a todo. Click a todo to edit it. Drag a todo to move it. You can remove the completed todos, and you can undo this removal.
- The bottom of the page has a notes area. You can rename its title.
- You can edit links on the page itself. To open the link editor, click the pencil button or use settings. Drag sections and links to arrange them or to move them between columns. The maximum is four columns. You can also use the arrow keys on a drag handle. You can undo a deletion.
- Weather location has three options: approximate (from your IP address), precise (from your browser), or a city that you search for.
- A locale setting controls the date and time format of the clock.
- You can download your settings as a file and upload the file again. The clipboard export is still available.
- Changes now sync across all open new tab pages.
- Animations play when you change themes and when you open or close the link editor.

### Changed

- Weather data now comes from [Open-Meteo](https://open-meteo.com/). [BigDataCloud](https://www.bigdatacloud.com/) supplies the name of your location. Weather no longer needs an OpenWeather API key or location access. If you set a key before this update, your location setting starts as precise.
- Weather shows the low and high for today instead of for the next 24 hours.
- Temperature units and wind speed units are now separate settings. The page can show wind speed in m/s.
- The font size setting scales the full page, which includes spacing and controls.
- Settings are easier to scan. Toggles show a highlight when they are on. Either-or choices are dropdowns.
- You arrange link columns by dragging instead of with a column count. The extension divides existing links into columns automatically.
- Number fields keep their values in the permitted range.
- Long quotes wrap more evenly.
- New installations start with two link sections and an empty todo list. The extension does not change existing links.
- Light themes use light scrollbars and dropdown menus.
- Discord status does not refresh while the tab is in the background.

## 1.6

Released November 7, 2026.

### Added

- Color themes are available. These include Catppuccin, Dracula, Nord, Tokyo Night, GitHub Dark and Ayu Dark. An OKLCH color picker lets you set custom colors.
- The tab icon matches your theme.
- Tab stats show how many tabs you opened today, in the past week and in the past month.
- Quote tags let you select which types of quotes you see.
- You can divide link sections across multiple columns.
- You can undo the deletion of a link or section.
- Weather has compact and detailed layouts, and imperial or metric units.
- Toggles show or hide the quote, clock, weather, tab stats and Discord status. If you hide Discord, the extension keeps your user ID.
- Exported settings now include the font and font size.

### Changed

- The extension has a new default theme and icon. The previous colors are available as the Classic theme.
- The extension now contains the quotes and fonts and does not download them. As a result, the page loads faster and works offline.
- The quote stays the same when you refresh the page or go back to it.
- Links work if you do not type `https://`.
- The settings button is now on the right side of the page.
- The page rounds temperatures to whole degrees.
- Messages are clearer for weather errors and for the import, export and reset of settings.
- Settings are easier to use with a keyboard or screen reader. Focus styles are visible.

### Fixed

- Layout and spacing are now correct on small screens.
- The "move down" buttons for links had the label "move up". They now have the correct label.
