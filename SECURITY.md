# Security

toonish-ui ships CSS, a small browser script and TypeScript helpers that return HTML strings. It has no server
and handles no credentials or user data.

To report a problem, open a private advisory: **Security > Report a vulnerability** on this repository.
Do not put details in a public issue.

The helpers in `src/markup.ts` escape every interpolated string with `esc()`. A path that skips it is a bug to report.
