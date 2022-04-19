# Major Update for Mi Salud Mobile

> Allow responders to answer the screening multiple times as long as the schedule is still valid.

---

## screens/Submissions.js **(NEW SCREEN)**

### If `user.role.type === 'leader'`

1. Display list of submissions of the given `user.id` and `schedule.id` through the params with the 'result icons' on each item in the list.

### If `user.role.type === 'responder'`

1. Display list of submission of the given `schedule.id` and `user.id` of the *currently logged in user*.

---

## screens/Team.js

### If `user.role.type === 'leader'`

1. On tapping a member's name, redirect to `screens/Assessments.js` passing the `user.id` of the selected member.

### If `user.role.type === 'responder'`

1. On tapping a member's name, do nothing.

---

## screens/Assessments.js (Screenings)

### If `user.role.type === 'leader'`

1. On tapping a schedule, check if a `user.id` is given. If so, redirect to `screens/Submissions.js` with the `user.id` and the `schedule.id` passed through the params.
1. If no `user.id` is defined, redirect to `screens/Summary.js` passing the `schedule.id` through the params.

## screens/Summary.js

### Only for `user.role.type === 'leader'`

1. Display list of members (excluding the leader).
    1. On each item, display the 'result icons' of the member's most recent submission.
    1. If member has no submissions yet, display text accordingly.
1. On tapping a member's name, redirect to `screens/Submissions.js` passing the `user.id` of the member and the current `schedule.id`
