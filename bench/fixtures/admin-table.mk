stack
  navbar "Acme Admin"
    icon bell
    avatar "AM"
  stack g=lg p=lg
    row g=md align=center
      text xl bold "Users"
      spacer
      input search "Search users"
      button primary icon=plus "Invite"
    table "Name|Email|Role|Status"
      tr "Ana Martin|ana@x.io|Admin|Active"
      tr "Bo Lee|bo@x.io|Editor|Active"
      tr "Cy Park|cy@x.io|Viewer|Away"
      tr "Di Ruiz|di@x.io|Viewer|Active"
