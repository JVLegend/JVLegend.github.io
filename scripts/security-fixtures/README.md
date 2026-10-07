# Parser migration regression

`selectors-expected.json` records output with Tailwind 3.4.17, Typography 0.5.16,
PostCSS Nested 6.2.0 and selector parser 6.1.3, before the scoped parser migration.
CSS minification ignores fixture formatting without ignoring selectors or declarations.

Parser 7 makes insertion during iteration safe. The old parser lost group and peer
variants in this corpus. The test explicitly checks those restored declarations,
then compares every remaining rule against the old output. It also verifies the
parser resolved by each consumer and runs the flat-selector security regression
in a subprocess with a five-second timeout.

Run `npm run check:security-compat` after changes to these consumers or overrides.
Do not regenerate the reference merely to make a changed output pass.
