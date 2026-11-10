row h=full
  sidebar #nav
    row g=sm align=center p=sm
      avatar "A"
      text bold "Acme"
    item active icon=home "Dashboard"
    item icon=user "Customers"
    item icon=mail "Messages"
    item icon=settings "Settings"
    spacer
    item danger icon=log-out "Sign out"
  stack grow g=lg p=lg
    row g=md align=center
      button ghost toggles=#nav icon=menu "Menu"
      text xl bold "Customers"
      spacer
      input search "Search"
      dropdown #more
        button icon=more-horizontal "Actions"
        menu end
          item icon=pencil "Edit"
          item icon=download "Export"
          divider
          item danger icon=trash "Delete"
      button primary opens=#invite icon=plus "Invite"
    tabs
      tab "All"
        grid cols=1 cols-md=3 g=md
          card "Active"
            text xl bold "1,204"
            badge primary "+12%"
          card "Trial"
            text xl bold "320"
            badge "steady"
          card "Churned"
            text xl bold "48"
            badge "-2%"
      tab "Billing"
        text "Billing panel"
    table "Name|Plan|Status"
      tr "Ana Martin|Pro|Active"
      tr "Bo Lee|Free|Trial"
  modal #invite md "Invite teammate"
    input email label="Email" "name@company.com"
    select label="Role" "Admin|Editor|Viewer"
    row g=sm justify=end
      button ghost closes "Cancel"
      button primary closes "Send invite"
