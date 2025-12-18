// Settings
CONVERTER_INSERT_SPACE = false;
CONVERTER_UPPERCASE = true;
CONVERTER_NB_CHAR_PER_LINE = 16;
REPLACE_TEXT_WITH_ERRORS = false;



var katescript = {
    "name": "Notepad++ plugins ported to Kate",
    "author": "Liz",
    "license": "AGPL-3.0-or-later",
    "revision": 1,
    "kate-version": "0",
    "functions": [
      "b64encode", "b64encode_with_padding", "b64encode_by_line",
      "b64decode", "b64decode_strict", "b64decode_by_line",
      "quote_printed_encode", "quote_printed_decode",
      "url_encode", "full_url_encode", "url_decode",
      "ascii_to_hex", "hex_to_ascii",
    ],
    "actions": [
        {"function": "b64encode",
            "name": "Base64 Encode",
            "category": "MIME Tools"},
        {"function": "b64encode_with_padding",
            "name": "Base64 Encode with padding",
            "category": "MIME Tools"},
        {"function": "b64encode_by_line",
            "name": "Base64 Encode by line",
            "category": "MIME Tools"},
        {"function": "b64decode",
            "name": "Base64 Decode",
            "category": "MIME Tools"},
        {"function": "b64decode_strict",
            "name": "Base64 Decode strict",
            "category": "MIME Tools"},
        {"function": "b64decode_by_line",
            "name": "Base64 Decode by line",
            "category": "MIME Tools"},
        {"function": "quote_printed_encode",
            "name": "Quote-printed Encode",
            "category": "MIME Tools"},
        {"function": "quote_printed_decode",
            "name": "Quote-printed Decode",
            "category": "MIME Tools"},
        {"function": "url_encode",
            "name": "URL Encode",
            "category": "MIME Tools"},
        {"function": "full_url_encode",
            "name": "Full URL Encode",
            "category": "MIME Tools"},
        {"function": "url_decode",
            "name": "URL Decode",
            "category": "MIME Tools"},

        {"function": "ascii_to_hex",
            "name": "ASCII -> HEX",
            "category": "Converter"},
        {"function": "hex_to_ascii",
            "name": "HEX -> ASCII",
            "category": "Converter"}
    ]
};

require('range.js');

function _replace_selected_text(func)
{
  var txt = view.selectedText();
  if (txt)
  {
    try
    {
      txt = func(txt);
    }
    catch(err)
    {
      if (REPLACE_TEXT_WITH_ERRORS)
      {
        txt = err;
      }
    }

    document.editBegin();
    view.removeSelectedText();
    document.insertText(view.cursorPosition().line, view.cursorPosition().column, txt);
    document.editEnd();
  }
}

function _bbyte(arr)
{
  return arr.map(i => i.toString(2).padStart(8, '0')).join('');
}

function _cp_to_utf8(cp)
{
  if (cp <= 0x7F)
  {
    return [cp];
  }

  if (cp <= 0x7FF)
  {
    return [(0xC0 | (cp >> 6)),
            (0x80 | (cp & 0x3F))];
  }

  if (cp <= 0xFFFF)
  {
    return [(0xE0 | (cp >> 12)),
            (0x80 | ((cp >> 6) & 0x3F)),
            (0x80 | (cp & 0x3F))];
  }

  if (cp <= 0x10FFFF)
  {
      return [(0xF0 | (cp >> 18)),
              (0x80 | ((cp >> 12) & 0x3F)),
              (0x80 | ((cp >> 6) & 0x3F)),
              (0x80 | (cp & 0x3F))];
  }
}

function _utf8_to_cp(utf8)
{
  if (utf8.length == 1)
  {
    return utf8[0];
  }

  if (utf8.length == 2)
  {
    return (((0x1F & utf8[0]) << 6) +
            (0x3F & utf8[1]));
  }

  if (utf8.length == 3)
  {
    return (((0xF & utf8[0]) << 12) +
            ((0x3F & utf8[1]) << 6) +
             (0x3F & utf8[2]));
  }

  if (utf8.length == 4)
  {
    return (((0x7 & utf8[0]) << 18) +
            ((0x3F & utf8[1]) << 12) +
            ((0x3F & utf8[2]) << 6) +
             (0x3F & utf8[3]));
  }
}

function _utf8_sequence_length_from_first_byte(b)
{
  if ((0xF0 & b) == 0xF0)
  {
    return 4;
  }

  if ((0xE0 & b) == 0xE0)
  {
    return 3;
  }

  if ((0xC0 & b) == 0xC0)
  {
    return 2;
  }

  if (b < 128)
  {
    return 1;
  }
}

const _encoding_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function _b64encode(txt)
{
  var result = '';
  var b_queue = '';
  var idx = 0;
  while ((idx < txt.length) || b_queue.length)
  {
    if (b_queue.length < 6)
    {
      if (idx < txt.length)
      {
        var next = _cp_to_utf8(txt.codePointAt(idx));
        b_queue += _bbyte(next);
        idx += next.length == 4 ? 2 : 1;
      }
      else
      {
        b_queue = b_queue.padEnd(6, '0');
      }
    }
    else
    {
      result += _encoding_chars[parseInt(b_queue.slice(0,6), 2)];
      b_queue = b_queue.slice(6);
    }
  }
  return result;
}

function _b64decode(txt)
{
  var result = '';
  var buf = [];
  var target_buf_length = -1;
  var b_queue = '';
  for (i of txt.replace(/={0,4}$/, '').split('').map(i => _encoding_chars.indexOf(i)))
  {
    if (i == -1)
    {
      return txt;
    }
    b_queue += i.toString(2).padStart(6, '0');
    while (b_queue.length >= 8)
    {
      var c = parseInt(b_queue.slice(0, 8), 2);
      b_queue = b_queue.slice(8);

      if (!buf.length)
      {
        target_buf_length = _utf8_sequence_length_from_first_byte(c);
      }

      buf.push(c);

      if (buf.length == target_buf_length)
      {
        result += String.fromCodePoint(_utf8_to_cp(buf));
        buf = [];
        target_buf_length = -1;
      }
    }
  }
  return result;
}

function _b64decode_ignore_invalid_chars(txt, keep_newlines)
{
  var result = '';
  var buf = '';
  for (c of txt)
  {
    if (!keep_newlines && ['\r', '\n'].includes(c))
    {
      continue;
    }

    if (_encoding_chars.includes(c))
    {
      buf += c;
    }
    else
    {
      if (buf.length)
      {
        result += _b64decode(buf);
        buf = '';
      }
      result += c;
    }
  }
  if (buf.length)
  {
    result += _b64decode(buf);
  }
  return result;
}

function _quote_printed_encode(txt)
{
  var result = '';
  var line_char_count = 0;
  for (c of txt)
  {
    var cp = c.codePointAt(0);
    if (cp > 127 || c == '=')
    {
      var utf8 = _cp_to_utf8(cp);
      if (((3*utf8.length) + line_char_count) > 76)
      {
        result += '=\r\n';
      }
      result += utf8.map(i => '='+i.toString(16).toUpperCase()).join('');
    }
    else
    {
      if ((line_char_count == 76) && !['\r', '\n'].includes(c))
      {
        result += '=\r\n';
        line_char_count = 0;
      }
      result += c;
      if (['\r', '\n'].includes(c))
      {
        line_char_count = 0;
      }
      else
      {
        ++line_char_count;
      }
    }
  }
  return result;
}

function _quote_printed_decode(txt)
{
  var result = '';
  var buf = '';
  var target_buf_length = -1;
  for (c of txt)
  {
    if (buf)
    {
      buf += c;

      if (['=\n', '=\r\n'].includes(buf))
      {
        buf = '';
        target_buf_length = -1;
      }
      else if (buf.length == 3)
      {
        target_buf_length = 3*_utf8_sequence_length_from_first_byte(parseInt(buf.slice(1), 16));
      }

      if (buf.length == target_buf_length)
      {
        result += String.fromCodePoint(_utf8_to_cp(buf.split('=').slice(1).map(i => parseInt(i, 16))));
        buf = '';
        target_buf_length = -1;
      }
    }
    else
    {
      if (c != '=')
      {
        result += c;
      }
      else
      {
        buf = '=';
      }
    }
  }
  return result;
}

function quote_printed_encode()
{
  _replace_selected_text(_quote_printed_encode);
}

function quote_printed_decode()
{
  _replace_selected_text(_quote_printed_decode);
}

function b64encode()
{
  _replace_selected_text(_b64encode);
}

function b64encode_with_padding()
{
  _replace_selected_text(function(txt)
  {
    txt = _b64encode(txt);
    return txt.padEnd(4*Math.ceil(txt.length/4), '=');
  });
}

function b64encode_by_line()
{
  _replace_selected_text(function(txt)
  {
    var buf = '';
    var result = '';
    for (c of txt)
    {
      if (!['\r', '\n'].includes(c))
      {
        buf += c;
      }
      else
      {
        if (buf.length)
        {
          result += _b64encode(buf);
          buf = '';
        }
        result += c;
      }
    }
    if (buf.length)
    {
      result += _b64encode(buf);
    }
    return result;
  });
}

function b64decode()
{
  _replace_selected_text(function(txt)
  {
    return _b64decode_ignore_invalid_chars(txt, false);
  });
}

function b64decode_strict()
{
  _replace_selected_text(_b64decode);
}

function b64decode_by_line()
{
  _replace_selected_text(function(txt)
  {
    return _b64decode_ignore_invalid_chars(txt, true);
  });
}

function url_encode()
{
  _replace_selected_text(encodeURIComponent);
}

function full_url_encode()
{
  _replace_selected_text(encodeURI);
}

function url_decode()
{
  _replace_selected_text(decodeURIComponent);
}

function _ascii_to_hex(txt)
{
  var result = '';
  var idx = 0;
  while (idx < txt.length)
  {
    var next = _cp_to_utf8(txt.codePointAt(idx));
    idx += next.length == 4 ? 2 : 1;
    result += next.map(j => j.toString(16).padStart(2, '0')+(CONVERTER_INSERT_SPACE ? ' ' : ''))
                  .map(i => CONVERTER_UPPERCASE ? i.toUpperCase() : i.toLowerCase())
                  .join('');
  }
  if (CONVERTER_NB_CHAR_PER_LINE > 0)
  {
    var temp = [];
    for (c of result)
    {
      if (!temp.length || temp[temp.length-1].length == 2*CONVERTER_NB_CHAR_PER_LINE)
      {
        temp.push('');
      }
      temp[temp.length-1] = temp[temp.length-1] + c;
    }
    result = temp.filter(i => i.length).join('\n');
  }
  return result;
}

function _hex_to_ascii(txt)
{
  var result = '';
  var buf = [];
  var target_buf_length = -1;
  for (c of txt.split(/([a-fA-F0-9]{2})/g).filter(i => i.length == 2).map(i => parseInt(i, 16)))
  {
    if (!buf.length)
    {
      target_buf_length = _utf8_sequence_length_from_first_byte(c);
    }

    buf.push(c);

    if (buf.length == target_buf_length)
    {
      result += String.fromCodePoint(_utf8_to_cp(buf));
      buf = [];
      target_buf_length = -1;
    }
  }
  return result;
}

function ascii_to_hex()
{
  _replace_selected_text(_ascii_to_hex);
}

function hex_to_ascii()
{
  _replace_selected_text(_hex_to_ascii);
}
