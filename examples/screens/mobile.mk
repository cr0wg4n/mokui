frame mobile
  stack g=md p=md
    row g=sm align=center
      button ghost icon=menu
      text lg bold "Inbox"
      spacer
      avatar "AM"
    input search "Search mail"
    segmented "All|Unread|Starred"
    box p=md raised
      row g=md align=center
        avatar "BL"
        stack g=none grow
          text bold "Bo Lee"
          text sm muted "Re: launch plan"
        badge primary "2"
    box p=md raised
      row g=md align=center
        avatar "CK"
        stack g=none grow
          text bold "Cy Park"
          text sm muted "Invoice #204"
    alert info "Tip"
      text sm "Swipe to archive."
  button fab opens=#compose icon=plus
  tabbar "inbox:Inbox|search|bell:Alerts|user:Me" active=1
  drawer #compose bottom "New message"
    input email label="To" "name@acme.io"
    textarea 3 label="Message" "Write something"
    row g=sm justify=end
      button ghost closes "Discard"
      button primary icon=send "Send"
