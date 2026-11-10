stack g=lg p=lg
  navbar "Acme"
    icon bell
    avatar "AM"
  grid cols=1 cols-md=3 g=md
    card "Visits"
      text xl bold "1,204"
    card "Users"
      text xl bold "320"
    card "Tasks"
      text xl bold "48"
  row g=sm justify=end
    button ghost "Cancel"
    button primary opens=#confirm "Save"
  modal #confirm sm "Save changes?"
    text "Your changes will be applied to all customers."
    row g=sm justify=end
      button ghost closes "Cancel"
      button primary closes "Confirm"
