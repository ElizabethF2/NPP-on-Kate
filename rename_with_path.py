# Unfinished!

import sys, subprocess, re

if len(sys.argv) != 2:
  sys.exit()

print(sys.argv)

r = subprocess.check_output(('dbus-send', '--print-reply', '--dest=org.freedesktop.DBus',
                             '/org/freedesktop/DBus', 'org.freedesktop.DBus.ListNames'))

kate_instances = re.findall(r'org.kde.kate-\d+', r.decode())

for instance in kate_instances:
  r = subprocess.check_output(('dbus-send', '--print-reply', '--dest='+instance,
                               '/kate', 'org.freedesktop.DBus.Introspectable.Introspect'))
  windows = re.findall(r'MainWindow_\d+', r.decode())

  for window in windows:
    r = subprocess.check_output(('dbus-send', '--print-reply', '--dest='+instance,
                                 '/kate/'+window, 'org.freedesktop.DBus.Properties.Get',
                                 'string:org.qtproject.Qt.QWidget', 'string:windowFilePath'))
    open_file_path = (lambda i: i[i.find('"')+1:i.rfind('"')])(r.decode())
    print('>'+open_file_path+'<')
