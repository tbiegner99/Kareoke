import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
export class DurationUtils {
  static formatDuration(seconds: number) {
    return dayjs.duration(seconds, 'seconds').format('m:ss');
  }
}
