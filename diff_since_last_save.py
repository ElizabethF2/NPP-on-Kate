import sys, os, tempfile, subprocess

fpath = sys.argv[1] if len(sys.argv) == 2 else None

if not fpath:
  print('Cannot be used with unsaved buffers')
  sys.exit()

if 'COMPARE' not in os.environ:
  print('The COMPARE environment variable must be set first!')
  sys.exit()

with open(os.path.join(tempfile.gettempdir(), 'KateCompare_unsaved_version'), 'w') as f:
  f.write(sys.stdin.read())

subprocess.Popen([
                  os.environ['COMPARE'],
                  fpath,
                  os.path.join(tempfile.gettempdir(), 'KateCompare_unsaved_version')
                ]).communicate()
