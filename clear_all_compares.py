import os, tempfile

for f in ('KateCompare_first_to_compare', 'KateCompare_second_to_compare', 'KateCompare_unsaved_version'):
  try:
    os.remove(os.path.join(tempfile.gettempdir(), f))
  except OSError:
    pass
