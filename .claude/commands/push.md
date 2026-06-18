Run `git status` and `git diff HEAD` (or `git diff` if nothing is staged) to see what has changed. Based on the actual changes, generate a descriptive commit message that explains what was done — not a generic placeholder.

Then output exactly these three commands with no other commentary:

```
git add .
git commit -m "<your generated message here>"
git push
```

The commit message should be specific and reflect the real changes (e.g. "add IceCreamShop exercise for improper fractions" or "fix mobile tap detection on shape exercises"). Keep it under 72 characters.

CRITICAL: Respond with the three commands only. Do NOT call any tools. Do NOT explain. Do NOT add anything else.
