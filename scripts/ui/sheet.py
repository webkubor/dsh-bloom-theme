# Dev-only: tile PNGs into a labelled contact sheet. Usage: sheet.py out.png cols a.png b.png ...
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
W, H = 720, 450
rows = (len(files) + cols - 1) // cols
S = Image.new('RGB', (W * cols, (H + 22) * rows), 'white'); d = ImageDraw.Draw(S)
for i, f in enumerate(files):
    x, y = (i % cols) * W, (i // cols) * (H + 22)
    S.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y + 22)); d.text((x + 6, y + 5), f.split('/')[-1], fill='black')
S.save(out)
