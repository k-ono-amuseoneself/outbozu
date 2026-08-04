export function load(key) {
    return window.localStorage.getItem(key);
}

export function save(key, value) {
    window.localStorage.setItem(key, value);
}
