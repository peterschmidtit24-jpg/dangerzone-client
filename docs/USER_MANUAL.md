# Dangerzone User Manual

This manual explains how to use the Dangerzone app as a guest or registered
user. Dangerzone is a city incident reporting app for viewing, reporting, and
discussing local danger zones.

## User Roles

Dangerzone has three user modes:

- Guest: can view incidents and read comments.
- Registered user: can report incidents and comment.
- Admin: can moderate users, comments, and reports.

This manual covers guest and registered user behavior. Admin behavior is covered
in `ADMIN_MANUAL.md`.

## Opening The App

When you open Dangerzone, the home page shows the map view.

From the header you can:

- open the map view
- open the incidents page
- sign in
- register
- log out if already signed in

Guests can use the app without logging in, but write actions require an account.

## Browsing As A Guest

Guests can:

- view active incidents on the map
- view the incident list/sidebar
- open an incident detail modal
- read incident descriptions
- read comments
- filter incidents by type or radius
- change the map position

Guests cannot:

- create incidents
- post comments
- edit incidents
- delete incidents

If a guest tries to report or comment, the app shows a sign-in/register prompt.

## Using The Map View

The map view is the main screen of the app.

Use it to:

- see incident markers around the selected position
- click a marker to open incident details
- use the sidebar to browse nearby incidents
- filter visible incidents by type
- change the radius around your selected position

The map shows only incidents with valid coordinates.

## Setting Your Position

The selected position is used as the center for radius filtering.

You can set the position by:

- using your current browser location
- entering an address
- selecting the location of an existing incident

If the browser cannot read your current location, the app shows an error
message. If an address cannot be found, try a more specific street, district,
or city name.

## Viewing Incidents

To view an incident:

1. Click an incident marker on the map, or select an incident from the list.
2. Read the incident type, location, severity, duration, reporter, and
   description.
3. Review existing comments.
4. Use the close button to return to the map or list.

On the incidents page, incidents are shown as cards. Click a card to open the
same detail view.

## Registering

To create an account:

1. Click `Register`.
2. Enter your name, email, and password.
3. Submit the form.

Password requirements are enforced by the server. If the password is too weak
or the email is already registered, the form shows an error message.

After successful registration, the app logs you in automatically.

## Logging In

To log in:

1. Click `Sign In`.
2. Enter your email and password.
3. Submit the form.

If the email or password is incorrect, the login form shows an error message.

After login, the app stores your session token in the browser. You remain logged
in until you log out or the token expires.

## Reporting An Incident

Only logged-in users can report incidents.

To report an incident:

1. Click `+ Report Incident` or `+ New`.
2. Select the incident type.
3. Select the severity.
4. Enter a location.
5. Optionally enter latitude and longitude manually.
6. Select the probable duration.
7. Add a clear description.
8. Submit the form.

If the address cannot be verified exactly, the app may suggest the closest
usable map position. Review the suggested position before confirming.

Good incident descriptions should explain:

- what happened
- where it happened
- how severe it is
- whether people should avoid the area

## Commenting On Incidents

Only logged-in users can comment.

To comment:

1. Open an incident.
2. Scroll to the comments section.
3. Enter your comment.
4. Click `Post`.

Comments should be relevant and respectful. Admins may remove abusive or
inappropriate comments.

## Editing Your Own Incident

Incident owners can edit their own incidents.

To edit:

1. Open one of your incidents.
2. Click `Edit Incident`.
3. Update the location, severity, duration, active status, or description.
4. Save the changes.

If you change the location, the app tries to resolve the new address to map
coordinates.

## Deleting Your Own Incident

Incident owners can delete their own incidents.

To delete:

1. Open one of your incidents.
2. Click `Delete`.
3. Confirm the action if the browser or UI asks for confirmation.

Deleting an incident removes the incident from the app. Attached comments are
also removed by the server.

## Logging Out

To log out, use the logout button in the header.

After logout:

- you return to guest mode
- you can still browse incidents
- you cannot create, edit, delete, or comment until you log in again

## Common Problems

### No incidents are visible

Possible reasons:

- the server is not reachable
- the database has no active incidents
- your selected radius is too small
- incidents do not have valid coordinates
- the app could not load data

Try increasing the radius or refreshing the page.

### The map does not load

Possible reasons:

- the browser cannot load map tiles
- internet access is unavailable
- Leaflet assets failed to load

Refresh the page and check the connection.

### Address not found

Try:

- using a more complete address
- adding the city name
- checking spelling
- entering coordinates manually

### Login failed

Check:

- email spelling
- password spelling
- whether the account exists
- whether the server is running

### Action not allowed

You may see this if:

- you are not logged in
- your session expired
- you are trying to edit/delete someone else's content
- the server rejected the action

Log in again and retry the action.

## Good Reporting Rules

When reporting an incident:

- report real and useful information
- avoid duplicate reports if possible
- describe the location clearly
- keep comments respectful
- do not post private or abusive content

Dangerzone is designed to help people understand nearby risks quickly. Clear
reports make the app more useful for everyone.
