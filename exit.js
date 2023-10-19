/*
 * Wait 500ms and exit the process with the given code.
 */
export default function (code) {
  setTimeout(function () {
    process.exit(code);
  }, 500);
};