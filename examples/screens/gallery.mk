stack g=lg p=lg
  text xl bold "Component gallery"
  grid min=lg g=md
    card "Buttons"
      row g=sm wrap
        button primary "Primary"
        button "Secondary"
        button ghost "Ghost"
        button danger "Danger"
      row g=sm wrap align=center
        button sm "Small"
        button lg "Large"
        button icon=plus "With icon"
        button disabled "Disabled"
    card "Fields"
      input label="Text" "Placeholder"
      input search "Search"
      input date label="Date" "Pick a date"
      select label="Select" "One|Two|Three"
      textarea 2 label="Textarea" "Notes"
    card "Selection"
      checkbox checked "Checkbox"
      radio checked "Radio"
      switch on "Switch"
      slider label="Slider" 60
      segmented "A|B|C" active=2
      row g=lg align=center
        rating 3
        otp 4 value=7
    card "Feedback"
      alert success "Success"
      alert warning "Warning"
      alert error "Error"
      progress 60
      row g=sm align=center wrap
        badge "Badge"
        badge primary "Primary"
        badge success "OK"
        chip x "Chip"
        spinner
    card "Data"
      chart line h=sm
      row g=md align=center
        chart donut w=xs
        chart bar w=md h=sm
      row g=sm align=center wrap
        avatars
          avatar "A"
          avatar "B"
          avatar "C"
        kbd "Ctrl"
        code "npm i"
    card "Calendar"
      calendar value=12
    card "Navigation"
      breadcrumb "Home|Library|Data"
      tabs
        tab "One"
          text sm "Panel one"
        tab "Two"
          text sm "Panel two"
      steps "Plan|Pay|Done" active=2
      pagination "1|2|3" active=2
    card "Overlays (click)"
      row g=sm wrap
        button opens=#m "Modal"
        button opens=#d "Drawer"
        button opens=#t "Toast"
        dropdown
          button icon=chevron-down "Dropdown"
          menu
            item icon=pencil "Edit"
            item danger icon=trash "Delete"
        popover
          button "Popover"
          stack g=sm p=sm
            text sm "Any content"
            switch on "Option"
        tooltip "A tooltip"
          button ghost icon=info
      collapse "Collapse"
        text sm "Hidden content"
    card "Loading"
      skeleton 3
      row g=md align=center
        skeleton circle
        skeleton w=lg
    card "Empty"
      empty "Nothing here" sub="Try something else" icon=folder
        button primary sm "Create"
    card "Media"
      image 16:9 "Image"
      upload "Drop files"
  modal #m sm "Modal"
    text "A dialog over a backdrop."
    button primary closes "Close"
  drawer #d right "Drawer"
    text "A side panel."
  toast #t "Toast message"
