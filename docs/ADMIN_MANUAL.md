# Dangerzone Admin Manual

This manual explains the moderation features available to Dangerzone admins.
Admins have additional permissions for reviewing users, comments, and reported
incidents.

## Admin Role

An admin is a logged-in user with the role:

```text
admin
```

Only admins can access the admin overview page.

Regular users are redirected away from admin-only areas.

## Accessing The Admin Overview

To access the admin area:

1. Log in with an admin account.
2. Open the `Admin` navigation item.
3. Review the dashboard sections.

If the admin link is not visible, the current account is probably not an admin.

## Admin Responsibilities

Admins are responsible for:

- reviewing users
- reviewing comments
- warning users when needed
- deleting abusive comments
- deleting users when necessary
- keeping incident data useful and safe

Admin actions should be used carefully because they can remove user data.

## Reviewing Users

The admin overview shows user information without exposing passwords.

Admins can use the user list to:

- identify suspicious users
- check warning counts
- review recent moderation state
- warn users
- delete users

Use warnings for behavior that should be corrected but does not yet require
removal.

## Warning A User

To warn a user:

1. Open the admin overview.
2. Find the user.
3. Click the warning action.

The server increases the user's warning count and stores the warning date.

Admins cannot warn their own admin account.

## Deleting A User

Deleting a user is a strong moderation action.

When a user is deleted, the server also removes:

- incidents created by that user
- comments created by that user
- comments attached to deleted incidents
- references to deleted comments from remaining incidents

Use this action only when the user account should no longer participate in the
app.

Admins cannot delete their own admin account through the ban/delete flow.

## Reviewing Comments

Admins can review comments from the admin overview.

A comment may need moderation if it is:

- abusive
- spam
- irrelevant
- misleading
- toxic
- unsafe

Delete comments that make the app less useful or violate expected behavior.

## Deleting Comments

To delete a comment:

1. Open the admin overview.
2. Find the comment.
3. Click the delete action.

When a comment is deleted, the server also removes the comment reference from
any related incident.

## Incident Moderation

Admins can delete incidents. The server also allows admins to edit incidents,
although the main admin overview may focus on review and deletion workflows.

An incident may need moderation if it is:

- fake
- duplicated
- abusive
- impossible to understand
- located incorrectly
- no longer useful

Deleting an incident also deletes its attached comments.

## Permission Summary

Admins can:

- access `/admin`
- warn users
- delete users
- delete comments
- delete incidents
- edit any incident through protected server permissions

Admins should not use moderation actions to change ordinary user content unless
there is a clear reason.

## Error Messages

Admin actions can fail for several reasons:

- the server is offline
- the database is unreachable
- the admin session expired
- the account is not actually an admin
- the selected user, comment, or incident no longer exists
- the server rejected a self-action, such as warning yourself

If an admin action fails, the app shows an error message in the admin page.
Refresh the page before retrying if the data may have changed.

## Recommended Moderation Workflow

Use this workflow during a demo or real moderation session:

1. Log in as admin.
2. Open the admin overview.
3. Review users and warning counts.
4. Review comments for abusive content.
5. Delete only clearly problematic comments.
6. Warn users before stronger action when possible.
7. Delete users only for serious abuse or test cleanup.
8. Return to the public map to confirm the app still displays clean data.

## Safety Notes

Admin actions affect real database data.

Before using moderation actions in production:

- make sure the database is backed up
- verify that you are using the correct environment
- avoid testing destructive actions on production data
- keep admin accounts limited to trusted people

For demos, use seed/test data whenever possible.
