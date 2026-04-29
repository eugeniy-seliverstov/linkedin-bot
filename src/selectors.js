export const selectors = {
  searchResults: {
    card: '[role="list"] [role="listitem"]',
    connectLink: 'a[aria-label*="Invite"][aria-label*="to connect"]',
    pendingLink: 'a[aria-label*="Pending"]',
  },
  inviteModal: {
    sendWithoutNote: 'button[aria-label="Send without a note"]',
  },
  nextPage: {
    button: 'button[data-testid="pagination-controls-next-button-visible"]',
  },
}
