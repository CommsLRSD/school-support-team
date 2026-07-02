import re

with open("assets/css/styles.css", "r") as f:
    css = f.read()

# Fix modal visibility bug
css = css.replace(".modal {\n  position: fixed;", ".modal {\n  display: none;\n  position: fixed;")
css = css.replace(".modal-backdrop {", ".modal:not([hidden]) {\n  display: grid;\n}\n.modal-backdrop {")

# Sleek minimalist theme
css = re.sub(r"--bg:.*?;", "--bg: #ffffff;", css)
css = re.sub(r"--surface:.*?;", "--surface: #ffffff;", css)
css = re.sub(r"--surface-alt:.*?;", "--surface-alt: #000000;", css)
css = re.sub(r"--text:.*?;", "--text: #222222;", css)
css = re.sub(r"--muted:.*?;", "--muted: #777777;", css)
css = re.sub(r"--line:.*?;", "--line: #eaeaea;", css)
css = re.sub(r"--primary:.*?;", "--primary: #000000;", css)
css = re.sub(r"--secondary:.*?;", "--secondary: #555555;", css)
css = re.sub(r"--accent:.*?;", "--accent: #000000;", css)
css = re.sub(r"--radius:.*?;", "--radius: 4px;", css)
css = re.sub(r"--shadow:.*?;", "--shadow: 0 4px 12px rgba(0, 0, 0, 0.05);", css)

# Body gradient removal
css = re.sub(r"background: radial-gradient.*?;", "background: var(--bg);", css)

# Hero gradient removal
css = re.sub(r"background: linear-gradient\(145deg, \#ffffff 0%, \#f4f3ff 60%, \#eefcff 100%\);", "background: var(--surface);", css)

# Card accent gradient removal
css = re.sub(r"background: linear-gradient\(145deg, \#121d3f, \#1f2f5f\);", "background: var(--surface-alt);", css)

# Jump nav gradient removal
css = re.sub(r"background: linear-gradient\(120deg, var\(--primary\), \#7c3aed\);", "background: var(--primary);", css)

# Checklist bullet gradient
css = re.sub(r"background: linear-gradient\(120deg, var\(--primary\), var\(--secondary\)\);", "background: var(--primary);", css)

# Pill list
css = re.sub(r"background: \#ecf1ff;", "background: var(--bg);", css)
css = re.sub(r"color: \#2e3f6f;", "color: var(--text);", css)
css = re.sub(r"border: 1px solid \#cdd9ff;", "border: 1px solid var(--line);", css)

# Callout
css = re.sub(r"background: \#fff8f3;", "background: var(--bg);", css)

# Member card button
css = re.sub(r"border: 1px solid \#cdd9ff;", "border: 1px solid var(--line);", css)
css = re.sub(r"background: \#eef2ff;", "background: var(--surface);", css)
css = re.sub(r"color: \#253767;", "color: var(--text);", css)

# Remove the display: grid from .modal
css = css.replace("  display: grid;\n  place-items: center;", "  place-items: center;")

with open("assets/css/styles.css", "w") as f:
    f.write(css)
