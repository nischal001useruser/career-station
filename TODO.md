- [ ] Update backend/student result public API to return: student exam status, course name, exam date (course, nepali_date) in a predictable structure for the student portal.
- [ ] Update frontend StudentResultPortal.jsx to conditionally render:
      - if status === 'ABSENT' (or 'absent'): show ONLY absence message using course name and exam date; do not render marks/rank/answers/review UI.
      - if status === 'PRESENT': render existing result dashboard.
- [ ] Ensure review/question rendering is completely hidden for absent students.
- [ ] Sanity check by running backend/frontend tests or a quick manual flow.

