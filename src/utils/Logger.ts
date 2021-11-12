export enum LogType {
  RECORD = 'RECORD',
  AUDIO = 'AUDIO',
  ROUTER = 'ROUTER',
}

// Allows us to quickly enable certain types of logging messages and
// disable others
class Logger {
  public static info(message: string, type?: LogType): void {
    console.log(type, message);
  }

  public static warning(message: string, type?: LogType): void {
    console.log('WARNING', type, message);
  }

  public static error(message: string, type?: LogType): void {
    console.log('ERROR', type, message);
  }
}

export default Logger;
