import sys, os, tempfile, subprocess

if not os.path.isfile(os.path.join(tempfile.gettempdir(), 'KateCompare_first_to_compare')):
  print('First to compare must be set first!')
  sys.exit()

if 'COMPARE' not in os.environ:
  print('The COMPARE environment variable must be set first!')
  sys.exit()

with open(os.path.join(tempfile.gettempdir(), 'KateCompare_second_to_compare'), 'w') as f:
  f.write(sys.stdin.read())

subprocess.Popen([
                  os.environ['COMPARE'],
                  os.path.join(tempfile.gettempdir(), 'KateCompare_first_to_compare'),
                  os.path.join(tempfile.gettempdir(), 'KateCompare_second_to_compare')
                ]).communicate()
