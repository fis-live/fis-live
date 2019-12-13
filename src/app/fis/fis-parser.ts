export function fixEncoding(str: string) {
    try {
        return decodeURIComponent(escape(str));
    } catch (e) {
        return str;
    }
}

export function toTitleCase(title: string) {
    const small = /^(von|van|der|of|de|del|di|do|af|den)$/i;
    const large = /^(I|II|III|IV)$/i;

    return title.split(/([ -])/).map(function (current) {
        if (current.search(small) > -1) {
            return current.toLowerCase();
        }

        if (current.search(large) > -1) {
            return current.toUpperCase();
        }

        return current.substr(0, 1).toUpperCase() + current.substr(1).toLowerCase();
    }).join('');
}
