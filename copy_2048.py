import shutil
import os

src_dir = '/remote-home/share/lijl/前端2048'
dst_dir = '/remote-home/share/lijl/game_box/games/2048'

files = [
    'index.html',
    'style.css',
    'game.js',
]

for f in files:
    src = os.path.join(src_dir, f)
    dst = os.path.join(dst_dir, f)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f'Copied: {f} ({os.path.getsize(dst)} bytes)')

print('All 2048 game files copied successfully!')
