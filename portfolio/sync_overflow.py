import os, re

html_dir = r"c:\Users\manme\OneDrive\Desktop\Projects\stitch_portfolio_home\portfolio"

def fix_global_css(content):
    # Replace the rule that hides overflow-x on html, body
    pattern = r'html, body \{[^}]*overflow-x: hidden;[^}]*\}'
    replacement = 'html, body { width: 100%; }'
    new_content = re.sub(pattern, replacement, content)
    return new_content

for filename in os.listdir(html_dir):
    if filename.endswith('.html'):
        path = os.path.join(html_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            txt = f.read()
        new_txt = fix_global_css(txt)
        if new_txt != txt:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_txt)
            print(f"Updated {filename}")
        else:
            print(f"No change needed for {filename}")
