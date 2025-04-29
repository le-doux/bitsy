function Theme(initialTheme) {
    var self = this;
    var currentTheme = 'light'

    var themes = {
        'light': {
            '--bitsy-color-main-1': '#ffffff',
            '--bitsy-color-main-2': '#6767b2',
            '--bitsy-color-accent-1': '#e8e8ff',
            '--bitsy-color-accent-2': '#ccccff',
            '--bitsy-color-neutral-1': '#eee',
            '--bitsy-color-neutral-2': '#888',
        },
        'dark': {
            '--bitsy-color-main-1': '#1a1a1a',
            '--bitsy-color-main-2': '#8c8cff',
            '--bitsy-color-accent-1': '#2a2a4f',
            '--bitsy-color-accent-2': '#3c3c6b',
            '--bitsy-color-neutral-1': '#2e2e2e',
            '--bitsy-color-neutral-2': '#aaaaaa',
        },
    }

    this.GetCurrentTheme = function () {
        return currentTheme;
    }
    this.GetCurrentThemeColors = function () {
        return themes[currentTheme];
    }
    this.GetAvaliableThemes = function() {
        return Object.keys(themes);
    }
    this.SetTheme = function(theme) {
        if(Object.keys(themes).includes(theme)) {
            currentTheme = theme;

            // set theme colors
            const rootEle = document.querySelector(':root');
            Object.keys(themes[theme]).forEach((k) => {
                rootEle.style.setProperty(k, themes[theme][k]);
            });
        }
    }
}