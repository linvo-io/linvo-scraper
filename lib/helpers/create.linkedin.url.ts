export const createLinkedinLink = (
    getLink: string,
    fullLinkedinUrl: boolean,
) => {
    if (
        !getLink ||
        (getLink.indexOf('/in/') === -1 && getLink.indexOf('/sales/people/') === -1)
    ) {
        return '';
    }
    const link = getLink?.trim()?.replace(/\\/g, '');
    const newLink =
        'https://www.linkedin.com' +
        (link.indexOf('linkedin.com') > -1 ? link.split('linkedin.com')[1] : link);
    const prepend = fullLinkedinUrl ? 'https://www.linkedin.com' : '';
    const path = new URL(newLink).pathname;
    if (path[path.length - 1] === '/') {
        return prepend + path.slice(0, path.length - 1);
    }

    return prepend + path;
};
