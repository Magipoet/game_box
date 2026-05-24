import shutil
import os

files = [
    ('/remote-home/share/lijl/task_all/6贪吃蛇/index.html', '/remote-home/share/lijl/game_box/games/snake/index.html'),
    ('/remote-home/share/lijl/task_all/6贪吃蛇/js/game.js', '/remote-home/share/lijl/game_box/games/snake/js/game.js'),
    ('/remote-home/share/lijl/task_all/6贪吃蛇/js/app.js', '/remote-home/share/lijl/game_box/games/snake/js/app.js'),
    ('/remote-home/share/lijl/task_all/6贪吃蛇/js/theme.js', '/remote-home/share/lijl/game_box/games/snake/js/theme.js'),
    ('/remote-home/share/lijl/task_all/6贪吃蛇/js/achievements.js', '/remote-home/share/lijl/game_box/games/snake/js/achievements.js'),
    ('/remote-home/share/lijl/task_all/6贪吃蛇/css/style.css', '/remote-home/share/lijl/game_box/games/snake/css/style.css'),
]

for src, dst in files:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f'Copied: {os.path.basename(src)} -> {dst} ({os.path.getsize(dst)} bytes)')

print('\nAll files copied successfully!')
