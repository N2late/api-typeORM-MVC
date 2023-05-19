export default function setUnixTimestampTomorrow() {
  const oneDay = 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const tomorrow = now + oneDay;
  return tomorrow;
}
