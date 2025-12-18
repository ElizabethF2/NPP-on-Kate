import os, subprocess

base_dir = None
xdg_state_home = os.environ.get('XDG_STATE_HOME')
if not xdg_state_home:
  xdg_state_home = os.path.expanduser('~/.local/state')
if os.path.isdir(xdg_state_home):
  base_dir = xdg_state_home

if not base_dir:
  xdg_cache_home = os.environ.get('XDG_CACHE_HOME')
  if not xdg_cache_home:
    xdg_cache_home = os.path.expanduser('~/.cache')
  if os.path.isdir(xdg_cache_home):
    base_dir = xdg_cache_home

if not base_dir:
  xdg_state_home

scratch_dir = os.path.join(base_dir, 'kate_scratch')

os.makedirs(scratch_dir, exist_ok = True)

num = 0

while True:
  try:
    path = os.path.join(scratch_dir, 'scratch-'+str(num)+'.txt')
    open(path, 'x').close()
    break
  except FileExistsError:
    num += 1

subprocess.check_output(('kate', path))
