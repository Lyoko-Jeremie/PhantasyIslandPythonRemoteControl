import moment from "moment";


export function moment2String(t: moment.Moment) {
    return t.format('YYYY-MM-DD HH:mm:ss.SSS');
}

export function string2Moment(t: string) {
    return moment(t, 'YYYY-MM-DD HH:mm:ss.SSS');
}

export function moment2Second(t: moment.Moment) {
    return t.unix();
}

export function moment2Millisecond(t: moment.Moment) {
    return t.valueOf();
}

