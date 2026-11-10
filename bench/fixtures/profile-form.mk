stack g=lg p=lg w=xl
  row g=md align=center
    avatar lg "AM"
    stack g=xs
      text lg bold "Account"
      text sm muted "Update your profile"
  input label="Full name" "Ana Martin"
  input email label="Email" "ana@x.io"
  select label="Role" "Admin|Editor|Viewer"
  textarea 4 label="Bio" "Tell us about you"
  switch on "Email notifications"
  checkbox "Subscribe to newsletter"
  row g=sm justify=end
    button ghost "Cancel"
    button primary "Save"
