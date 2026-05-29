# Area 1 avatar PNG cleanup

This pack replaces the current avatar PNG files with browser-independent cleaned versions.

Changes made:
- removed white/cream matte pixels from the actual PNG transparency
- removed detached cropped background fragments where possible
- reduced pale edge pixels around the character silhouette
- preserved the same file names and paths so the game can keep using the same outfit IDs

This is a file-level fix, not a browser/CSS/JS workaround.
