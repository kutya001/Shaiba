export function formatDate(isoString) {
    if (!isoString) return { date: '—', time: '' };
    try {
        let d = new Date(isoString);
        return {
            date: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
    } catch(e) { return { date: '—', time: ''}; }
}

export function getDuration(start, end) {
    if (!start || !end) return '';
    let s = new Date(start);
    let e = new Date(end);
    let diffMs = e - s;
    if (diffMs < 0) return '0 мин';
    let diffMins = Math.floor(diffMs / 60000);
    let hours = Math.floor(diffMins / 60);
    let mins = diffMins % 60;
    let days = Math.floor(hours / 24);
    hours = hours % 24;
    
    let parts = [];
    if (days > 0) parts.push(days + ' дн');
    if (hours > 0) parts.push(hours + ' ч');
    if (mins > 0 || parts.length === 0) parts.push(mins + ' мин');
    return parts.join(' ');
}

export function formatPhoneInput(val) {
    if (!val) return '+996';
    let raw = val.replace(/\D/g, '');
    if (raw.startsWith('996')) raw = raw.slice(3);
    raw = raw.slice(0, 9); // limit to 9 digits after 996
    let formatted = '+996';
    if (raw.length > 0) formatted += ' ' + raw.substring(0, 3);
    if (raw.length > 3) formatted += ' ' + raw.substring(3, 6);
    if (raw.length > 6) formatted += ' ' + raw.substring(6, 9);
    return formatted;
}
