# Brief Fog patch labelling — future fix

Status: future / not a route blocker.

Flag from Izzy on 2026-06-03:

Brief Fog currently shows chunk-style numbering such as `Resolved 0/4`. This works technically, but it does not make the fog patches feel meaningful enough to the user.

Issue:

- Numbered chunks do not explain what each fog patch represents.
- The user should not have to remember what `chunk 1`, `chunk 2`, etc. mean.
- The chamber should make clearer whether a patch is a question, instruction, guidance note, source requirement, format rule, or user-set section.

Preferred future direction:

- When the task brief is entered, allow the user to set or edit labels for the patches.
- Auto-generated labels should be based on the task wording, not only numbers.
- Possible labels could be `Question 1`, `Guidance`, `Source requirement`, `Word count rule`, or a short user-written name.
- The scene can still use numbered patches internally, but the visible drawer and HUD should use meaningful labels.

Priority:

Low to medium. This is a usability/design improvement, not a blocker for testing the route through Brief Fog v0.1.
