// TIME() - returns number of seconds since midnight of current day
export default function time(args) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    return hours * 3600 + minutes * 60 + seconds;
}
