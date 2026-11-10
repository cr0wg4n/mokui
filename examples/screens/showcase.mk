// Todo es clicable: Menu, Invite, Actions, Filters, Help, Save, las pestañas, los collapse.
row
  sidebar #nav
    row g=sm align=center p=sm
      avatar "A"
      text bold "Acme"
    item active icon=home "Dashboard"
    item icon=users "Customers"
    item icon=mail "Messages"
    item icon=bar-chart "Reports"
    item icon=settings "Settings"
    spacer
    box p=md g=xs fill
      text sm bold "Storage"
      progress 72
      text xs muted "7.2 of 10 GB used"
    item danger icon=log-out "Sign out"
  stack grow g=lg p=lg
    row g=md align=center wrap
      button ghost toggles=#nav icon=menu
      stack g=none
        breadcrumb "Home|Customers|Overview"
        text xl bold "Customers"
      spacer
      input search "Search customers"
      tooltip "Help"
        button ghost opens=#help icon=help-circle
      dropdown #more
        button icon=more-horizontal "Actions"
        menu end
          item icon=pencil "Edit"
          item icon=download "Export"
          divider
          item danger icon=trash "Delete"
      button primary opens=#invite icon=plus "Invite"
    alert info x "New: scheduled exports"
      text sm "Send this report to your team every Monday."
    tabs
      tab "Overview"
        stack g=lg
          grid min=sm g=md
            stat "Revenue" value="$48.2k" delta="+12%"
            stat "Users" value="2,410" delta="+4%"
            stat "Churn" value="3.1%" delta="-0.6%"
            stat "Sessions" value="18.9k"
          grid cols=1 cols-md=3 g=md
            card "Traffic" w=full
              chart area labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun"
            card "Sources"
              row g=md align=center
                chart donut w=sm
                stack g=xs
                  badge primary "Direct 40%"
                  badge "Search 25%"
                  badge "Social 20%"
            card "Goal"
              text sm muted "Monthly target"
              progress 72
              row g=sm align=center
                rating 4
                text sm muted "4.0 satisfaction"
          row g=md align=center
            text bold "Recent customers"
            spacer
            popover
              button icon=filter "Filters"
              stack g=sm p=sm
                text sm bold "Status"
                checkboxes "Active|Trial|Churned" checked="1,2"
                button primary sm closes "Apply"
          table "Name|Plan|Status|Joined"
            tr "Ana Martin|Pro|Active|Mar 3"
            tr "Bo Lee|Free|Trial|Mar 9"
            tr "Cy Park|Team|Active|Apr 1"
          pagination "1|2|3|…|8" active=1
      tab "Activity"
        row g=lg wrap
          stack g=md grow
            text bold "Timeline"
            timeline "Signed up:Mar 3|Verified email|Created first project|Upgraded to Pro" active=3
          stack g=md grow
            text bold "Team"
            avatars
              avatar "AM"
              avatar "BL"
              avatar "CK"
              avatar "+4"
            box p=md g=sm
              row g=sm align=center
                avatar "BL"
                stack g=none grow
                  text sm bold "Bo Lee"
                  text xs muted "commented 2h ago"
                badge success "New"
              text sm "Can we move the launch to Friday?"
              row g=sm
                chip x "design"
                chip x "launch"
      tab "Settings"
        grid cols=1 cols-md=2 g=lg
          stack g=md
            input label="Company" value="Acme Inc" "Company"
            input email label="Billing email" help="Invoices go here" "billing@acme.io"
            select label="Timezone" "UTC|Europe/Madrid|America/New_York"
            textarea 3 label="About" "Tell us about your company"
          stack g=md
            switch on "Email notifications"
            switch "Weekly digest"
            radios "Free|Pro|Team" value=Pro
            slider label="Seats" 40
            upload "Drop your logo here"
            row g=sm justify=end
              button ghost "Cancel"
              button primary opens=#saved "Save"
        collapse "Danger zone"
          text sm muted "Deleting the workspace cannot be undone."
          button danger sm icon=trash "Delete workspace"
  modal #invite md "Invite teammate"
    input email label="Email" "name@company.com"
    select label="Role" "Admin|Editor|Viewer"
    segmented "Member|Guest"
    row g=sm justify=end
      button ghost closes "Cancel"
      button primary closes icon=send "Send invite"
  drawer #help right "Help"
    collapse "How do I invite someone?" open
      text sm "Use the Invite button in the header."
    collapse "How is usage measured?"
      text sm "Sessions are counted per calendar month."
    button full ghost closes "Close"
  toast #saved "Changes saved"
