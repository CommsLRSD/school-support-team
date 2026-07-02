import re
with open("index.html", "r") as f:
    html = f.read()

html = re.sub(r'<link[^>]*rel="stylesheet"\s*/>', '', html)

with open("index.html", "w") as f:
    f.write(html)
