import sys, functools

try:
  import tkinter
except ImportError:
  import Tkinter as tkinter

FONT = ('Arial', 10)

FGCOLOR = 'white'
BGCOLOR = 'black'

# FGCOLOR = 'black'
# BGCOLOR = 'white'

KEY_NAMES = (
  'NULL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'TAB', 'LF',
  'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK',
  'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', 'Space',
)

FORMATS = ('ASCII', 'Decimal', 'Hexadecimal', 'Binary', 'Octal')

def get_key_name(key):
  try:
    return KEY_NAMES[key]
  except IndexError:
    if key == 127:
      return 'DEL'
  return ''

def convert_char(value, format):
  if format == 'ASCII':
    return chr(value)
  if format == 'Decimal':
    return str(value)
  if format == 'Hexadecimal':
    return '{0:x}'.format(value).upper()
  if format == 'Binary':
    return '{0:b}'.format(value)
  if format == 'Octal':
    return '{0:o}'.format(value)

def parse_char(value, format):
  if format == 'ASCII':
    return ord(value)
  if format == 'Decimal':
    return int(value)
  if format == 'Hexadecimal':
    return int(value, 16)
  if format == 'Binary':
    return int(value, 2)
  if format == 'Octal':
    return int(value, 8)

def on_text_change(tbox, *args):
  new_value = tbox.get()
  if not new_value:
    return
  if len(new_value) > 1 and tbox.format == 'ASCII':
    new_value = new_value[-1]
    tbox.delete(0, tkinter.END)
  root = tbox.master
  try:
    root.current_char = parse_char(new_value, tbox.format)
  except (TypeError, ValueError):
    return
  for control in root.winfo_children():
    if isinstance(control, tkinter.Entry) and control != tbox:
      control.delete(0, tkinter.END)
      try:
        control.insert(0, convert_char(root.current_char, control.format))
      except (TypeError, ValueError):
        pass
    elif hasattr(control, 'is_key_label'):
      control.configure(text=get_key_name(root.current_char))

def copy_clicked(root, format):
  text_to_copy = convert_char(root.current_char, format)
  import pyperclip
  pyperclip.copy(text_to_copy)

def insert_clicked(root, format):
  text_to_insert = convert_char(root.current_char, format)
  sys.stdout.write(text_to_insert)
  sys.stdout.flush()
  sys.exit(0)

def make_root():
  root = tkinter.Tk()
  root.title('Conversion')
  root.configure(bg = BGCOLOR)
  root.vars = []
  root.current_char = 0

  style = {'font': FONT, 'fg': FGCOLOR, 'bg': BGCOLOR}
  for idx, format in enumerate(FORMATS):
    label = tkinter.Label(root, text=format+':', **style)
    label.grid(row=idx, column=0, columnspan=3)

    sv = tkinter.StringVar()
    tbox = tkinter.Entry(root,
                         width = 2 if format == 'ASCII' else 40,
                         textvariable = sv,
                         **style)
    tbox.grid(row = idx, column = 3, columnspan = 1 if format == 'ASCII' else 40)
    tbox.format = format
    sv.trace_add('write', functools.partial(on_text_change, tbox))
    root.vars.append(sv)

    if format == 'ASCII':
      key_label = tkinter.Label(root, text='', **style)
      key_label.grid(row=idx, column=4, columnspan=10)
      key_label.is_key_label = True

    copy_button = tkinter.Button(root,
                                 text = 'Copy',
                                 command = functools.partial(copy_clicked, root, format),
                                 **style)
    copy_button.grid(row = idx, column = 50, columnspan = 2)

    insert_button = tkinter.Button(root,
                                   text = 'Insert',
                                   command = functools.partial(insert_clicked, root, format),
                                   **style)
    insert_button.grid(row = idx, column = 52, columnspan = 2)

  for child in root.winfo_children():
    child.grid_configure(padx = 8, pady = 5)

  return root

def main():
  root = make_root()
  root.mainloop()

if __name__ == '__main__':
  main()
