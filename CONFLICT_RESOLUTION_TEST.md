# Phase 5: Conflict Resolution Manual Test

This document describes how to manually test the optimistic concurrency control (409 conflict handling) in the Services Editor.

## Prerequisites

1. Two browser windows/tabs logged in as admin
2. Admin services v2 feature flag enabled
3. At least one service with a draft version

## Test Steps

### 1. Open Same Service in Two Tabs

1. Open `/admin` in Browser Tab 1
2. Click on any service to open the editor sheet
3. Open `/admin` in Browser Tab 2 (new window or incognito)
4. Click on the **same service** to open the editor sheet

You should now have the same service open in both tabs.

### 2. Edit and Save in Tab 1

1. In Tab 1, go to the "Card" tab
2. Change the service name (e.g., "Premium SEO Services" → "Premium SEO Services v2")
3. Wait for autosave to complete (watch for "Saved" indicator)
4. Verify the change was saved

### 3. Edit and Save in Tab 2

1. In Tab 2, go to the "Card" tab
2. Change the service name to something different (e.g., "Elite SEO Services")
3. Wait for autosave to attempt

### 4. Verify 409 Conflict Detection

**Expected Behavior:**

- Tab 2 should receive a 409 Conflict response from the backend
- A toast notification should appear with:
  - Title: "Conflict Detected"
  - Description: "Someone else edited this. Reload?"
  - Action button: "Reload"

### 5. Resolve Conflict

1. Click the "Reload" button in the toast
2. The editor should refetch the latest draft from the server
3. The service name should now show Tab 1's changes ("Premium SEO Services v2")
4. Your unsaved changes from Tab 2 are discarded

### 6. Alternative: Publish Conflict

**To test publish conflicts:**

1. In Tab 1, make a card edit and click "Publish"
2. In Tab 2, make a different card edit and click "Publish"
3. Tab 2 should get a 409 conflict on publish
4. Toast appears with reload option
5. After reload, Tab 2 sees Tab 1's published changes

## Success Criteria

✅ **Pass** if:
- 409 conflicts are detected on concurrent edits
- Toast notification appears with clear message
- "Reload" button successfully fetches latest version
- Stale edits are prevented from overwriting newer changes
- No silent data loss or corruption

❌ **Fail** if:
- Tab 2's changes overwrite Tab 1's changes (silent overwrite)
- No conflict detection occurs
- Toast notification doesn't appear
- Reload button doesn't work
- Application crashes or hangs

## Technical Implementation

The conflict detection relies on:

1. **Row Version**: `service_versions.row_version` increments on each update
2. **Optimistic Lock**: Backend checks `row_version` before updating
3. **409 Response**: Backend returns 409 if `row_version` doesn't match
4. **Client Handling**: Mutation error handler catches 409 and shows toast

## Code References

- **Backend**: `supabase/functions/admin-services/index.ts` (PATCH endpoints)
- **Frontend**: `src/components/admin/ServicesManagement.tsx` (publishMutation.onError)
- **DB Trigger**: Bump version trigger on `service_versions` table

## Notes

- This test validates optimistic concurrency control (OCC)
- OCC is preferred over pessimistic locking for better UX
- Users should be able to work in parallel without blocking
- Conflicts are resolved at save/publish time, not on edit
