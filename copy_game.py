import shutil
import os

src = '/remote-home/share/lijl/task_all/8翻牌配队/index.html'
dst_dir = '/remote-home/share/lijl/game_box/games/memory-match'
dst = os.path.join(dst_dir, 'index.html')

os.makedirs(dst_dir, exist_ok=True)
shutil.copy2(src, dst)
print(f'Copied {src} -> {dst}')
print(f'File size: {os.path.getsize(dst)} bytes')
