import os, re

html_dir = r"c:\Users\manme\OneDrive\Desktop\Projects\stitch_portfolio_home\portfolio"

style_tag = "<style>html, body { overflow-x: hidden; }</style>"

for filename in os.listdir(html_dir):
    if not filename.endswith('.html'):
        continue
    if filename.lower() == 'index.html':
        continue
    path = os.path.join(html_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Insert style tag before closing </head>
    if '</head>' in content:
        new_content = content.replace('</head>', f'    {style_tag}\n</head>')
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
        else:
            print(f'No change needed for {filename}')
    else:
        print(f'No </head> found in {filename}')
