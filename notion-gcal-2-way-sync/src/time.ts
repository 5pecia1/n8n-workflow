import { TIME_ZONE } from "./configure";

export function getTImeZoneOffset(): number {
    const dateText = Intl.DateTimeFormat([], { timeZone: TIME_ZONE, timeZoneName: "short" }).format(new Date);
    const timezoneString = dateText.split(" ")[1].slice(3);
    let timezoneOffsetMin = parseInt(timezoneString.split(':')[0]) * 60;

    if (timezoneString.includes(":")) {
        timezoneOffsetMin = timezoneOffsetMin + parseInt(timezoneString.split(':')[1]);
    }

    return timezoneOffsetMin;
}

export function getTimeZone(): string {
    const timezoneOffsetMin = getTImeZoneOffset();

    let offsetHrs: string | number = Math.abs(timezoneOffsetMin / 60);
    let offsetMin: string | number = Math.abs(timezoneOffsetMin % 60);
    let timezoneStandard = 'Z';

    if (offsetHrs < 10) {
        offsetHrs = '0' + offsetHrs;
    }
    if (offsetMin < 10) {
        offsetMin = '0' + offsetMin;
    }

    if (timezoneOffsetMin > 0) {
        timezoneStandard = '+' + offsetHrs + ':' + offsetMin;
    } else if (timezoneOffsetMin < 0) {
        timezoneStandard = '-' + offsetHrs + ':' + offsetMin;
    }

    return timezoneStandard;
}

export function makeIso8601WithTZ(time: number): string {
    const timezoneOffsetMin = getTImeZoneOffset();

    if (timezoneOffsetMin > 0) {
        time = time + (Math.abs(timezoneOffsetMin)) * 60 * 1000;
    } else if (timezoneOffsetMin < 0) {
        time = time - (Math.abs(timezoneOffsetMin)) * 60 * 1000;
    }

    const dt = new Date(time).toISOString();
    const currentDatetime = dt.substring(0, dt.length - 5); // delete '.000Z'

    return currentDatetime + getTimeZone();
}