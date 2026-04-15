## Backend Sync Notes

- The exercises page is temporarily using the frontend-local dataset in `frontend/js/exercises.js` as the source of truth.
- Reason: the existing exercise API data can override local exercise edits, which makes new frontend-only catalogue changes appear missing.
- Backend requirement for later:
  - update the exercise API payload so each exercise includes `name`, `muscle`, `subMuscle`, `equipment`, `difficulty`, `recommended_reps`, and `description`
  - ensure the API returns the same exercise catalogue the frontend is expected to display
  - once backend data is updated and verified, the frontend can safely switch back to loading from the API
