import sys, os, tempfile

with open(os.path.join(tempfile.gettempdir(), 'KateCompare_first_to_compare'), 'w') as f:
  f.write(sys.stdin.read())

print('First to Compare set!')
