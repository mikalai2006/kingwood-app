import dayjs from "dayjs";

export function getObjectTime(ms: number, now?: dayjs.Dayjs) {
  const checkNum = (num: number) => {
    return num < 0 ? 0 : num;
  };

  // ms = Math.abs(ms);

  const daysMs = ms % (24 * 60 * 60 * 1000);
  const hoursMs = ms % (60 * 60 * 1000);
  const minutesMs = ms % (60 * 1000);

  const days = checkNum(Math.floor(ms / (24 * 60 * 60 * 1000)));
  const hours = checkNum(Math.floor(daysMs / (60 * 60 * 1000)));
  const minutes = checkNum(Math.floor(hoursMs / (60 * 1000)));
  const seconds = checkNum(Math.floor(minutesMs / 1000));
  const totalMinutes = checkNum(ms / (60 * 1000));

  return {
    totalMinutes,
    days,
    hours,
    minutes,
    seconds,
    days0: days > 9 ? days.toString() : "0" + days,
    hours0: hours > 9 ? hours.toString() : "0" + hours,
    minutes0: minutes > 9 ? minutes.toString() : "0" + minutes,
    seconds0: seconds > 9 ? seconds.toString() : "0" + seconds,
    date: now ? now : dayjs(new Date()).utc(true),
  };
}
